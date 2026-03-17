use actix_web::HttpResponse;

use mcpshield_honeypot::logger::HoneypotLogger;
use mcpshield_honeypot::report::HoneypotReport;
use mcpshield_honeypot::HoneypotConfig;

pub async fn honeypot_status() -> HttpResponse {
    let config = HoneypotConfig::default();
    let log_dir = mcpshield_core::config::Config::expand_path(&config.log_dir);

    // Check if honeypot log exists (implies it has been running)
    let running = log_dir.join("honeypot.jsonl").exists();

    let total_attacks = if running {
        if let Ok(logger) = HoneypotLogger::new(&log_dir) {
            logger.recent_events(10000).len()
        } else {
            0
        }
    } else {
        0
    };

    HttpResponse::Ok().json(serde_json::json!({
        "running": running,
        "uptime_hours": if running { 0 } else { 0 },
        "total_attacks": total_attacks,
    }))
}

pub async fn honeypot_attacks() -> HttpResponse {
    let config = HoneypotConfig::default();
    let log_dir = mcpshield_core::config::Config::expand_path(&config.log_dir);

    let events = if let Ok(logger) = HoneypotLogger::new(&log_dir) {
        let events = logger.recent_events(50);
        let report = HoneypotReport::from_events(&events);
        serde_json::json!({
            "attacks": events,
            "report": report,
        })
    } else {
        serde_json::json!({
            "attacks": [],
            "report": null,
        })
    };

    HttpResponse::Ok().json(events)
}
