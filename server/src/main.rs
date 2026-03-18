mod routes;
mod state;
mod waitlist;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use std::sync::Arc;

use state::AppState;
use waitlist::db::WaitlistDb;
use waitlist::email::ResendClient;
use waitlist::routes::WaitlistState;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    let config = mcpshield_core::config::Config::load(None);
    let state = web::Data::new(AppState::new(config));

    // --- Waitlist setup ---
    let db_path = std::env::var("WAITLIST_DB")
        .unwrap_or_else(|_| "waitlist.db".to_string());

    let waitlist_db = WaitlistDb::open(std::path::Path::new(&db_path))
        .expect("Failed to open waitlist database");

    let resend = std::env::var("RESEND_API_KEY").ok().map(|key| {
        let from = std::env::var("RESEND_FROM")
            .unwrap_or_else(|_| "Praesidio <hello@praesidio.live>".to_string());
        tracing::info!("Resend email configured with from: {}", from);
        ResendClient::new(key, from)
    });

    if resend.is_none() {
        tracing::warn!("RESEND_API_KEY not set — welcome emails and campaigns disabled");
    }

    let waitlist_state = web::Data::new(Arc::new(WaitlistState {
        db: waitlist_db,
        resend,
    }));

    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080u16);

    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());

    tracing::info!("MCPShield API server starting on http://{}:{}", host, port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(cors)
            .app_data(state.clone())
            .app_data(waitlist_state.clone())
            // Existing routes
            .route("/api/overview", web::get().to(routes::events::overview))
            .route("/api/events", web::get().to(routes::events::list_events))
            .route("/api/scan", web::post().to(routes::scan::trigger_scan))
            .route("/api/audit", web::get().to(routes::audit::query_audit))
            .route("/api/compliance", web::get().to(routes::compliance::get_compliance))
            .route("/api/compliance/mcp", web::get().to(routes::compliance::get_compliance_mcp))
            .route("/api/compliance/agentic", web::get().to(routes::compliance::get_compliance_agentic))
            .route("/api/config", web::get().to(routes::config::get_config))
            .route("/api/servers", web::get().to(routes::servers::list_servers))
            .route("/api/threats", web::get().to(routes::threats::list_threats))
            .route("/api/trend", web::get().to(routes::trend::get_trend))
            .route("/api/honeypot/status", web::get().to(routes::honeypot::honeypot_status))
            .route("/api/honeypot/attacks", web::get().to(routes::honeypot::honeypot_attacks))
            // Waitlist public routes
            .route("/api/waitlist", web::post().to(waitlist::routes::subscribe))
            .route("/api/waitlist/unsubscribe", web::get().to(waitlist::routes::unsubscribe))
            // Waitlist admin routes
            .route("/api/admin/waitlist/stats", web::get().to(waitlist::routes::admin_stats))
            .route("/api/admin/waitlist/list", web::get().to(waitlist::routes::admin_list))
            .route("/api/admin/waitlist/delete", web::delete().to(waitlist::routes::admin_delete))
            .route("/api/admin/waitlist/send", web::post().to(waitlist::routes::admin_send_email))
            .route("/api/admin/waitlist/emails", web::get().to(waitlist::routes::admin_email_logs))
    })
    .bind((&host[..], port))?
    .run()
    .await
}
