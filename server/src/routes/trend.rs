use actix_web::{web, HttpResponse};
use chrono::{Duration, Utc};

use crate::state::AppState;
use mcpshield_core::audit::AuditLogger;

pub async fn get_trend(state: web::Data<AppState>) -> HttpResponse {
    let logger = match AuditLogger::new(&state.config.audit_dir()) {
        Ok(l) => l,
        Err(_) => {
            // Return empty trend data
            let empty: Vec<serde_json::Value> = (0..24)
                .map(|i| {
                    let hour = (Utc::now() - Duration::hours(23 - i)).format("%H:00").to_string();
                    serde_json::json!({ "hour": hour, "clean": 0, "warning": 0, "critical": 0 })
                })
                .collect();
            return HttpResponse::Ok().json(empty);
        }
    };

    let events = logger.query(Some("24h"), None);

    // Bucket events into hourly slots
    let now = Utc::now();
    let mut buckets: Vec<(String, usize, usize, usize)> = (0..24)
        .map(|i| {
            let hour = (now - Duration::hours(23 - i)).format("%H:00").to_string();
            (hour, 0, 0, 0)
        })
        .collect();

    for event in &events {
        if let Ok(ts) = chrono::DateTime::parse_from_rfc3339(&event.timestamp.to_rfc3339()) {
            let hours_ago = (now - ts.with_timezone(&Utc)).num_hours();
            if hours_ago >= 0 && hours_ago < 24 {
                let idx = (23 - hours_ago) as usize;
                if idx < buckets.len() {
                    let severity_str = format!("{:?}", event.severity).to_lowercase();
                    match severity_str.as_str() {
                        "critical" | "high" => buckets[idx].3 += 1,
                        "medium" | "low" => buckets[idx].2 += 1,
                        _ => buckets[idx].1 += 1,
                    }
                }
            }
        }
    }

    let trend: Vec<serde_json::Value> = buckets
        .into_iter()
        .map(|(hour, clean, warning, critical)| {
            serde_json::json!({
                "hour": hour,
                "clean": clean,
                "warning": warning,
                "critical": critical,
            })
        })
        .collect();

    HttpResponse::Ok().json(trend)
}
