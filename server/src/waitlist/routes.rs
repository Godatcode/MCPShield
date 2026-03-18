use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;
use std::sync::Arc;

use super::db::WaitlistDb;
use super::email::ResendClient;

pub struct WaitlistState {
    pub db: WaitlistDb,
    pub resend: Option<ResendClient>,
}

// --- Request types ---

#[derive(Deserialize)]
pub struct SubscribeRequest {
    pub email: String,
    pub source: Option<String>,
}

#[derive(Deserialize)]
pub struct SendEmailRequest {
    pub subject: String,
    pub html: String,
}

#[derive(Deserialize)]
pub struct UnsubscribeQuery {
    pub email: String,
}

#[derive(Deserialize)]
pub struct ListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// --- Public endpoint: subscribe ---

pub async fn subscribe(
    state: web::Data<Arc<WaitlistState>>,
    body: web::Json<SubscribeRequest>,
) -> HttpResponse {
    let email = body.email.trim().to_lowercase();

    // Basic email validation
    if !email.contains('@') || !email.contains('.') || email.len() < 5 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid email address"
        }));
    }

    match state.db.add_subscriber(&email, body.source.as_deref()) {
        Ok(is_new) => {
            // Send welcome email asynchronously if new subscriber and Resend is configured
            if is_new {
                if let Some(resend) = &state.resend {
                    let html = ResendClient::welcome_email_html(&email);
                    let to = email.clone();
                    let _ = resend.send_one(&to, "Welcome to Praesidio — You're on the list!", &html).await;
                }
            }

            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "new": is_new,
                "message": if is_new { "You're on the list!" } else { "You're already on the list." }
            }))
        }
        Err(e) => {
            tracing::error!("Failed to add subscriber: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to subscribe. Please try again."
            }))
        }
    }
}

// --- Public endpoint: unsubscribe (GET with email query param) ---

pub async fn unsubscribe(
    state: web::Data<Arc<WaitlistState>>,
    query: web::Query<UnsubscribeQuery>,
) -> HttpResponse {
    let email = query.email.trim().to_lowercase();

    match state.db.unsubscribe(&email) {
        Ok(true) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "You've been unsubscribed."
        })),
        Ok(false) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Email not found or already unsubscribed."
        })),
        Err(e) => {
            tracing::error!("Failed to unsubscribe: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to unsubscribe."
            }))
        }
    }
}

// --- Admin endpoints (protected by API key header) ---

fn check_admin_key(req: &HttpRequest) -> bool {
    let expected = std::env::var("ADMIN_API_KEY").unwrap_or_default();
    if expected.is_empty() {
        // No key configured = allow (dev mode)
        return true;
    }
    req.headers()
        .get("x-admin-key")
        .and_then(|v| v.to_str().ok())
        .map(|v| v == expected)
        .unwrap_or(false)
}

pub async fn admin_stats(
    req: HttpRequest,
    state: web::Data<Arc<WaitlistState>>,
) -> HttpResponse {
    if !check_admin_key(&req) {
        return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}));
    }

    match state.db.get_stats() {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            tracing::error!("Failed to get stats: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to fetch stats"}))
        }
    }
}

pub async fn admin_list(
    req: HttpRequest,
    state: web::Data<Arc<WaitlistState>>,
    query: web::Query<ListQuery>,
) -> HttpResponse {
    if !check_admin_key(&req) {
        return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}));
    }

    let limit = query.limit.unwrap_or(50).min(500);
    let offset = query.offset.unwrap_or(0);

    match state.db.list_subscribers(limit, offset) {
        Ok(subs) => HttpResponse::Ok().json(subs),
        Err(e) => {
            tracing::error!("Failed to list subscribers: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to list subscribers"}))
        }
    }
}

pub async fn admin_delete(
    req: HttpRequest,
    state: web::Data<Arc<WaitlistState>>,
    query: web::Query<UnsubscribeQuery>,
) -> HttpResponse {
    if !check_admin_key(&req) {
        return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}));
    }

    match state.db.delete_subscriber(&query.email) {
        Ok(true) => HttpResponse::Ok().json(serde_json::json!({"success": true})),
        Ok(false) => HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"})),
        Err(e) => {
            tracing::error!("Failed to delete subscriber: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to delete"}))
        }
    }
}

pub async fn admin_send_email(
    req: HttpRequest,
    state: web::Data<Arc<WaitlistState>>,
    body: web::Json<SendEmailRequest>,
) -> HttpResponse {
    if !check_admin_key(&req) {
        return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}));
    }

    let resend = match &state.resend {
        Some(r) => r,
        None => return HttpResponse::ServiceUnavailable().json(serde_json::json!({
            "error": "Email service not configured. Set RESEND_API_KEY environment variable."
        })),
    };

    let recipients = match state.db.get_active_emails() {
        Ok(emails) => emails,
        Err(e) => {
            tracing::error!("Failed to fetch recipients: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to fetch recipients"}));
        }
    };

    if recipients.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "No active subscribers to send to."
        }));
    }

    let count = recipients.len() as i64;

    match resend.send_batch(&recipients, &body.subject, &body.html).await {
        Ok(batch_id) => {
            let preview = if body.html.len() > 200 {
                format!("{}...", &body.html[..200])
            } else {
                body.html.clone()
            };

            let _ = state.db.log_email(&body.subject, &preview, count, Some(&batch_id));

            HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "recipients": count,
                "batch_id": batch_id
            }))
        }
        Err(e) => {
            tracing::error!("Failed to send batch email: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to send: {}", e)
            }))
        }
    }
}

pub async fn admin_email_logs(
    req: HttpRequest,
    state: web::Data<Arc<WaitlistState>>,
) -> HttpResponse {
    if !check_admin_key(&req) {
        return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"}));
    }

    match state.db.get_email_logs(50) {
        Ok(logs) => HttpResponse::Ok().json(logs),
        Err(e) => {
            tracing::error!("Failed to get email logs: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Failed to fetch logs"}))
        }
    }
}
