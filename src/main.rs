mod audit;
mod cli;
mod config;
mod detection;
mod filter;
mod permissions;
mod pinner;
mod proxy;
mod scanner;

use clap::Parser;
use colored::Colorize;
use std::path::PathBuf;
use std::process;

use audit::AuditLogger;
use cli::{Cli, Commands, PinAction};
use config::Config;
use detection::severity::{Finding, Severity};
use pinner::store::PinStore;
use scanner::cross_server::ToolInfo;

fn main() {
    let cli = Cli::parse();

    if cli.no_color {
        colored::control::set_override(false);
    }

    let config = Config::load(cli.config.as_deref());

    match cli.command {
        Commands::Scan { path, severity } => {
            cmd_scan(&config, path, &severity, cli.verbose, cli.json);
        }
        Commands::Proxy {
            block_writes,
            server_cmd,
        } => {
            cmd_proxy(&config, block_writes, server_cmd);
        }
        Commands::Pin { action } => {
            cmd_pin(&config, action);
        }
        Commands::Audit { last, severity } => {
            cmd_audit(&config, last, severity);
        }
        Commands::Init => {
            cmd_init();
        }
    }
}

fn cmd_scan(config: &Config, path: Option<PathBuf>, min_severity: &str, verbose: bool, json_output: bool) {
    if !json_output {
        println!(
            "\n{}  MCPShield v{} — Scanning MCP configurations...\n",
            "🛡️",
            env!("CARGO_PKG_VERSION")
        );
    }

    let min_sev = Severity::from_str_loose(min_severity);

    // Discover MCP configs
    let configs = if let Some(ref p) = path {
        vec![("Custom".to_string(), p.clone())]
    } else {
        config::discover_mcp_configs()
    };

    if configs.is_empty() {
        if json_output {
            println!(r#"{{"status":"no_configs","message":"No MCP configurations found"}}"#);
        } else {
            println!("{}  No MCP configuration files found.", "⚠️");
            println!(
                "   Searched common paths for Claude Desktop, Cursor, Claude Code, VS Code."
            );
            println!("   Use 'mcpshield scan <path>' to scan a specific config file.");
        }
        return;
    }

    if !json_output {
        println!("{}  Found {} MCP config(s):", "📂", configs.len());
        for (name, path) in &configs {
            println!("   {} {} ({})", "✓".green(), name, path.display());
        }
        println!();
    }

    let mut all_findings: Vec<Finding> = Vec::new();
    let mut all_tools: Vec<ToolInfo> = Vec::new();
    let mut total_servers = 0;
    let mut total_tools = 0;

    // Load pin store
    let mut pin_store = PinStore::load(&config.pin_file());

    for (_config_name, config_path) in &configs {
        let servers = config::parse_mcp_config(config_path);

        for server in &servers {
            total_servers += 1;

            if !json_output && verbose {
                println!("   Scanning server: {} ...", server.name.cyan());
            }
        }
    }

    // Scan tool definitions in MCP configs
    for (_config_name, config_path) in &configs {
        if let Ok(contents) = std::fs::read_to_string(config_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&contents) {
                scan_config_json(
                    &json,
                    &mut all_findings,
                    &mut all_tools,
                    &mut total_tools,
                    &mut pin_store,
                    config,
                );
            }
        }
    }

    // Run cross-server analysis
    if config.scan.check_cross_server && !all_tools.is_empty() {
        let cross_findings = scanner::scan_cross_server(&all_tools);
        all_findings.extend(cross_findings);
    }

    // Save updated pins
    if let Err(e) = pin_store.save(&config.pin_file()) {
        eprintln!("Warning: Could not save pins: {}", e);
    }

    // Filter by severity
    let filtered: Vec<&Finding> = all_findings
        .iter()
        .filter(|f| f.severity >= min_sev)
        .collect();

    // Display results
    if json_output {
        let output = serde_json::json!({
            "total_configs": configs.len(),
            "total_servers": total_servers,
            "total_tools": total_tools,
            "findings": filtered,
            "summary": {
                "critical": filtered.iter().filter(|f| f.severity == Severity::Critical).count(),
                "high": filtered.iter().filter(|f| f.severity == Severity::High).count(),
                "medium": filtered.iter().filter(|f| f.severity == Severity::Medium).count(),
                "low": filtered.iter().filter(|f| f.severity == Severity::Low).count(),
                "info": filtered.iter().filter(|f| f.severity == Severity::Info).count(),
            }
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        if !filtered.is_empty() {
            println!(
                "{}  Scanning {} server(s), {} tool(s)...\n",
                "🔍", total_servers, total_tools
            );

            for finding in &filtered {
                finding.display();
            }
        }

        // Summary
        let critical = filtered
            .iter()
            .filter(|f| f.severity == Severity::Critical)
            .count();
        let high = filtered
            .iter()
            .filter(|f| f.severity == Severity::High)
            .count();
        let medium = filtered
            .iter()
            .filter(|f| f.severity == Severity::Medium)
            .count();
        let clean = total_tools.saturating_sub(
            all_findings
                .iter()
                .filter_map(|f| f.tool.as_ref())
                .collect::<std::collections::HashSet<_>>()
                .len(),
        );

        println!(
            "\n{}  {} pinned tool(s) ({} total pins)\n",
            "📌",
            total_tools,
            pin_store.pins.len()
        );

        println!(
            "Summary: {} critical, {} high, {} medium, {} clean",
            if critical > 0 {
                critical.to_string().red().bold().to_string()
            } else {
                "0".to_string()
            },
            if high > 0 {
                high.to_string().red().to_string()
            } else {
                "0".to_string()
            },
            if medium > 0 {
                medium.to_string().yellow().to_string()
            } else {
                "0".to_string()
            },
            clean.to_string().green().to_string(),
        );

        // Exit code
        if critical > 0 {
            process::exit(2);
        } else if high > 0 {
            process::exit(1);
        }
    }
}

/// Recursively scan a JSON config for tool definitions
fn scan_config_json(
    json: &serde_json::Value,
    findings: &mut Vec<Finding>,
    all_tools: &mut Vec<ToolInfo>,
    total_tools: &mut usize,
    pin_store: &mut PinStore,
    config: &Config,
) {
    let servers_obj = json
        .get("mcpServers")
        .or_else(|| json.get("servers"))
        .and_then(|v| v.as_object());

    if let Some(servers) = servers_obj {
        for (server_name, server_def) in servers {
            if let Some(tools) = server_def.get("tools").and_then(|t| t.as_array()) {
                for tool in tools {
                    let name = tool
                        .get("name")
                        .and_then(|n| n.as_str())
                        .unwrap_or("unknown");
                    let description = tool
                        .get("description")
                        .and_then(|d| d.as_str())
                        .unwrap_or("");
                    let schema = tool
                        .get("inputSchema")
                        .cloned()
                        .unwrap_or(serde_json::Value::Null);

                    *total_tools += 1;

                    if config.scan.check_tool_poisoning {
                        findings.extend(scanner::scan_tool(server_name, name, description));
                    }

                    findings.extend(
                        pin_store.pin_or_verify(server_name, name, description, &schema),
                    );

                    all_tools.push(ToolInfo {
                        server_name: server_name.clone(),
                        tool_name: name.to_string(),
                        description: description.to_string(),
                    });
                }
            }
        }
    }
}

fn cmd_proxy(config: &Config, block_writes: bool, server_cmd: Option<String>) {
    let server_cmd = match server_cmd {
        Some(cmd) => cmd,
        None => {
            eprintln!(
                "{}  Proxy requires --server-cmd to specify the MCP server to proxy.",
                "❌"
            );
            eprintln!(
                "   Example: mcpshield proxy --server-cmd 'npx -y @modelcontextprotocol/server-filesystem /tmp'"
            );
            process::exit(1);
        }
    };

    let mut config = config.clone();
    if block_writes {
        for (_name, server_config) in config.servers.iter_mut() {
            server_config.scope = "read-only".to_string();
        }
    }

    eprintln!("{}  MCPShield proxy starting...", "🛡️");
    eprintln!("   Server: {}", server_cmd);
    eprintln!("   Block writes: {}", block_writes);
    eprintln!();

    let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
    rt.block_on(async {
        let audit_logger =
            AuditLogger::new(&config.audit_dir()).expect("Failed to initialize audit logger");

        if let Err(e) = proxy::stdio_proxy::start_stdio_proxy(
            &server_cmd,
            &config,
            &audit_logger,
            "proxied-server",
        )
        .await
        {
            eprintln!("{}  Proxy error: {}", "❌", e);
            process::exit(1);
        }
    });
}

fn cmd_pin(config: &Config, action: PinAction) {
    let mut store = PinStore::load(&config.pin_file());

    match action {
        PinAction::List => {
            let pins = store.list();
            if pins.is_empty() {
                println!("No pinned tools. Run 'mcpshield scan' to pin current tool schemas.");
                return;
            }
            println!("{}  Pinned tools ({}):\n", "📌", pins.len());
            for pin in pins {
                println!(
                    "   {} :: {} (first seen: {}, last verified: {})",
                    pin.server_name.cyan(),
                    pin.tool_name.bold(),
                    pin.first_seen.format("%Y-%m-%d %H:%M"),
                    pin.last_verified.format("%Y-%m-%d %H:%M")
                );
            }
        }
        PinAction::Verify => {
            println!("{}  Verifying pinned tools...\n", "🔍");
            println!(
                "Run 'mcpshield scan' to verify all pinned tools against current server state."
            );
            println!("Any changes will be flagged as potential rug-pull attacks.");
        }
        PinAction::Reset => {
            store.reset();
            if let Err(e) = store.save(&config.pin_file()) {
                eprintln!("Error saving pin store: {}", e);
                process::exit(1);
            }
            println!("{}  All pins have been reset.", "✓");
        }
    }
}

fn cmd_audit(config: &Config, last: Option<String>, severity: Option<String>) {
    let logger = match AuditLogger::new(&config.audit_dir()) {
        Ok(l) => l,
        Err(e) => {
            eprintln!("Error initializing audit logger: {}", e);
            process::exit(1);
        }
    };

    let min_severity = severity.map(|s| Severity::from_str_loose(&s));
    let events = logger.query(last.as_deref(), min_severity);

    if events.is_empty() {
        println!("No audit events found matching the specified filters.");
        return;
    }

    println!("{}  Audit log ({} events):\n", "📋", events.len());
    for event in &events {
        println!(
            "   [{}] {} {} — {} :: {} — {}",
            event.timestamp.format("%Y-%m-%d %H:%M:%S"),
            event.severity.icon(),
            event.severity.badge(),
            event.event_type,
            event.server,
            event.description
        );
    }
}

fn cmd_init() {
    let example_config = r#"# MCPShield Configuration
# Place this file at ~/.mcpshield/config.toml

[global]
log_level = "info"
audit_dir = "~/.mcpshield/logs"
pin_file = "~/.mcpshield/pins.json"
block_on_critical = true
alert_on_warning = true

[scan]
check_unicode = true
check_tool_poisoning = true
check_credential_leaks = true
check_cross_server = true
max_description_length = 500

[proxy]
filter_outputs = true
detect_exfiltration = true
rate_limit_per_tool = 100

# Per-server configuration
[servers.filesystem]
scope = "read-only"
allowed_tools = ["read_file", "list_directory", "search_files"]

[servers.github]
scope = "read-write"
blocked_tools = ["delete_repository", "delete_file"]
require_confirmation = ["create_issue", "push", "create_pull_request"]

# Default for unknown servers
[servers."*"]
scope = "read-only"
block_unknown = false
"#;

    let config_dir = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".mcpshield");

    if let Err(e) = std::fs::create_dir_all(&config_dir) {
        eprintln!("Error creating config directory: {}", e);
        process::exit(1);
    }

    let config_path = config_dir.join("config.toml");
    if config_path.exists() {
        eprintln!(
            "{}  Config file already exists at {}",
            "⚠️",
            config_path.display()
        );
        eprintln!("   Use --config to specify a different path.");
        return;
    }

    if let Err(e) = std::fs::write(&config_path, example_config) {
        eprintln!("Error writing config: {}", e);
        process::exit(1);
    }

    println!(
        "{}  Config file created at {}\n   Edit it to customize MCPShield behavior.",
        "✓".green(),
        config_path.display()
    );
}
