use actix_web::{web, HttpResponse};
use chrono::Utc;
use serde::Serialize;

use crate::state::AppState;
use mcpshield_core::config;
use mcpshield_core::pinner::store::PinStore;

#[derive(Serialize)]
struct ServerResponse {
    name: String,
    display_name: String,
    tools: Vec<ToolResponse>,
    trust_score: u32,
    status: &'static str,
    last_scan: String,
    findings_count: usize,
    config_source: String,
}

#[derive(Serialize)]
struct ToolResponse {
    name: String,
    pinned: bool,
    description: String,
    hash: Option<String>,
    behavior_baseline: bool,
    llm_analysis: &'static str,
    calls_last_24h: u32,
}

pub async fn list_servers(state: web::Data<AppState>) -> HttpResponse {
    let configs = config::discover_mcp_configs();
    let pin_store = PinStore::load(&state.config.pin_file());
    let mut servers = Vec::new();

    for (config_name, config_path) in &configs {
        let mcp_servers = config::parse_mcp_config(config_path);

        for server_def in mcp_servers {
            let mut tools = Vec::new();
            let mut findings_count = 0;

            // Parse the config JSON to get tool definitions
            if let Ok(contents) = std::fs::read_to_string(config_path) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&contents) {
                    let servers_obj = json
                        .get("mcpServers")
                        .or_else(|| json.get("servers"))
                        .and_then(|v| v.as_object());

                    if let Some(obj) = servers_obj {
                        if let Some(server_val) = obj.get(&server_def.name) {
                            if let Some(tool_array) = server_val.get("tools").and_then(|t| t.as_array()) {
                                for tool in tool_array {
                                    let tool_name = tool.get("name").and_then(|n| n.as_str()).unwrap_or("unknown");
                                    let desc = tool.get("description").and_then(|d| d.as_str()).unwrap_or("");
                                    let key = format!("{}::{}", server_def.name, tool_name);
                                    let pin = pin_store.pins.get(&key);

                                    // Quick scan for findings
                                    let tool_findings = mcpshield_core::scanner::scan_tool(&server_def.name, tool_name, desc);
                                    findings_count += tool_findings.len();

                                    tools.push(ToolResponse {
                                        name: tool_name.to_string(),
                                        pinned: pin.is_some(),
                                        description: desc.to_string(),
                                        hash: pin.map(|p| format!("sha256:{}", &p.description_hash[..8])),
                                        behavior_baseline: pin.is_some(),
                                        llm_analysis: if tool_findings.iter().any(|f| f.severity == mcpshield_core::detection::severity::Severity::Critical) {
                                            "malicious"
                                        } else if !tool_findings.is_empty() {
                                            "suspicious"
                                        } else if pin.is_some() {
                                            "clean"
                                        } else {
                                            "pending"
                                        },
                                        calls_last_24h: 0,
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // If no tools found from config, still list the server
            let trust_score = if findings_count > 0 {
                (100u32).saturating_sub(findings_count as u32 * 20)
            } else if tools.iter().all(|t| t.pinned) && !tools.is_empty() {
                95
            } else {
                75
            };

            let status = if findings_count > 2 { "blocked" } else { "active" };

            servers.push(ServerResponse {
                display_name: humanize_server_name(&server_def.name),
                name: server_def.name,
                tools,
                trust_score,
                status,
                last_scan: Utc::now().to_rfc3339(),
                findings_count,
                config_source: config_name.clone(),
            });
        }
    }

    HttpResponse::Ok().json(servers)
}

fn humanize_server_name(name: &str) -> String {
    name.split(&['-', '_'][..])
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(c) => c.to_uppercase().to_string() + chars.as_str(),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}
