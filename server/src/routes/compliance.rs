use actix_web::HttpResponse;

/// Original combined compliance endpoint
pub async fn get_compliance() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "mcp_top10_coverage": 9,
        "agentic_top10_coverage": 8,
        "total_risks": 20,
        "covered": 17,
    }))
}

/// OWASP MCP Top 10 compliance items
pub async fn get_compliance_mcp() -> HttpResponse {
    HttpResponse::Ok().json(vec![
        compliance_item("MCP-01", "Token Mismanagement", "covered", "credential_leak", "Detection and filtering of exposed tokens, API keys, and credentials"),
        compliance_item("MCP-02", "Tool Poisoning", "covered", "tool_poisoning", "Scanning tool descriptions for hidden instructions and prompt injection"),
        compliance_item("MCP-03", "Privilege Escalation", "covered", "permissions", "Enforcing least-privilege access controls on tool operations"),
        compliance_item("MCP-04", "Supply Chain Attacks", "covered", "pinner", "SHA-256 hash pinning to detect tool modifications"),
        compliance_item("MCP-05", "Command Injection", "covered", "injection_filter", "Input sanitization and shell metacharacter detection"),
        compliance_item("MCP-06", "Context Over-sharing", "covered", "behavior_analysis", "Anomaly detection for unusual data volumes and patterns"),
        compliance_item("MCP-07", "Insufficient Auth", "partial", "permissions", "Authentication token validation and session management"),
        compliance_item("MCP-08", "Insufficient Logging", "covered", "audit", "Comprehensive audit trail for all tool operations"),
        compliance_item("MCP-09", "Shadow MCP Servers", "covered", "cross_server", "Cross-server tool name deduplication and shadowing detection"),
        compliance_item("MCP-10", "Covert Channel Abuse", "covered", "exfil_detector", "Detection of data exfiltration through covert channels"),
    ])
}

/// OWASP Agentic Top 10 compliance items
pub async fn get_compliance_agentic() -> HttpResponse {
    HttpResponse::Ok().json(vec![
        compliance_item("AG-01", "Excessive Agency", "covered", "permissions", "Restricting agent capabilities to defined boundaries"),
        compliance_item("AG-02", "Insufficient Monitoring", "covered", "audit + behavior", "Real-time monitoring of all agent actions and decisions"),
        compliance_item("AG-03", "Uncontrolled Tool Use", "covered", "pinner + permissions", "Tool allowlisting and execution controls"),
        compliance_item("AG-04", "Prompt Injection", "covered", "tool_poisoning", "Defense against indirect prompt injection via tools"),
        compliance_item("AG-05", "Data Exfiltration", "covered", "exfil_detector", "Preventing unauthorized data transfer through agent actions"),
        compliance_item("AG-06", "Insecure Output Handling", "covered", "filter", "Sanitizing and validating all tool outputs"),
        compliance_item("AG-07", "Multi-Agent Conflict", "partial", "cross_server", "Detecting conflicting directives across agents"),
        compliance_item("AG-08", "Supply Chain Compromise", "covered", "pinner", "Verifying integrity of agent toolchains"),
        compliance_item("AG-09", "Unsafe Code Generation", "covered", "scanner", "Scanning generated code for security vulnerabilities"),
        compliance_item("AG-10", "Inadequate Sandboxing", "partial", "proxy", "Process isolation and resource limits for agents"),
    ])
}

fn compliance_item(id: &str, name: &str, status: &str, module: &str, description: &str) -> serde_json::Value {
    serde_json::json!({
        "id": id,
        "name": name,
        "status": status,
        "module": module,
        "description": description,
    })
}
