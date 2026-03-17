use actix_web::HttpResponse;

use mcpshield_threat_feed::feed::ThreatFeed;

pub async fn list_threats() -> HttpResponse {
    // Load from local cache (threat-db directory)
    let data_dir = mcpshield_core::config::Config::expand_path("~/.mcpshield");
    let feed = ThreatFeed::load(&data_dir);

    if feed.signatures.is_empty() {
        // Return built-in detection rules as threat signatures if no feed cached
        return HttpResponse::Ok().json(builtin_threat_info());
    }

    HttpResponse::Ok().json(&feed.signatures)
}

/// Fallback: describe the built-in detection capabilities as threat signature summaries
fn builtin_threat_info() -> Vec<serde_json::Value> {
    vec![
        serde_json::json!({
            "id": "TP-001",
            "title": "Hidden Instruction Tag Injection",
            "severity": "critical",
            "description": "Tool descriptions containing hidden HTML-style tags (<IMPORTANT>, <!-- -->) that attempt to inject instructions into the LLM context.",
            "category": "Tool Poisoning",
            "owasp_ids": ["MCP-02"],
            "pattern": "<IMPORTANT>|<!--.*-->|<system>|<instructions>",
            "references": ["https://invariantlabs.ai/blog/mcp-security"],
            "mitigations": ["Tool description scanning", "Hash pinning", "LLM-based analysis"]
        }),
        serde_json::json!({
            "id": "TP-002",
            "title": "Prompt Override Keywords",
            "severity": "high",
            "description": "Tool descriptions containing adversarial keywords designed to manipulate LLM behavior.",
            "category": "Tool Poisoning",
            "owasp_ids": ["MCP-02"],
            "pattern": "ignore previous|override safety|forget your rules",
            "references": ["https://owasp.org/www-project-top-10-for-large-language-model-applications/"],
            "mitigations": ["Keyword pattern matching", "LLM semantic analysis"]
        }),
        serde_json::json!({
            "id": "TP-003",
            "title": "Sensitive Path References",
            "severity": "high",
            "description": "Tool descriptions referencing sensitive filesystem paths like ~/.ssh/, .env, /etc/shadow.",
            "category": "Tool Poisoning",
            "owasp_ids": ["MCP-02", "MCP-03"],
            "pattern": "~/.ssh/|~/.aws/|.env|/etc/shadow|.kube/config",
            "references": ["CWE-22"],
            "mitigations": ["Path allowlist enforcement", "Description scanning"]
        }),
        serde_json::json!({
            "id": "CL-001",
            "title": "SSH Private Key Exposure",
            "severity": "critical",
            "description": "Detection of SSH private keys in tool outputs to prevent credential exfiltration.",
            "category": "Credential Leak",
            "owasp_ids": ["MCP-01", "MCP-10"],
            "pattern": "-----BEGIN.*PRIVATE KEY-----",
            "references": ["CWE-798", "CWE-312"],
            "mitigations": ["Output content filtering", "Regex pattern matching", "Automatic redaction"]
        }),
        serde_json::json!({
            "id": "CL-002",
            "title": "API Key Pattern Detection",
            "severity": "high",
            "description": "Identifies common API key formats (AWS, GitHub, Anthropic, Stripe) in tool I/O.",
            "category": "Credential Leak",
            "owasp_ids": ["MCP-01"],
            "pattern": "AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|sk-ant-.*",
            "references": ["CWE-798"],
            "mitigations": ["Regex scanning on all I/O", "Token format validation"]
        }),
        serde_json::json!({
            "id": "CS-001",
            "title": "Cross-Server Tool Shadowing",
            "severity": "critical",
            "description": "Detection of tools registered on multiple servers with different behaviors (shadow attacks).",
            "category": "Supply Chain",
            "owasp_ids": ["MCP-09", "MCP-04"],
            "references": ["https://invariantlabs.ai/blog/mcp-security"],
            "mitigations": ["Cross-server tool name deduplication", "Server trust scoring"]
        }),
        serde_json::json!({
            "id": "SC-001",
            "title": "Supply Chain Tool Modification (Rug Pull)",
            "severity": "critical",
            "description": "Tool description or schema changed since last pinned hash — possible supply chain compromise.",
            "category": "Supply Chain",
            "owasp_ids": ["MCP-04"],
            "references": ["SLSA Framework"],
            "mitigations": ["SHA-256 hash pinning", "Automatic blocking on mismatch"]
        }),
        serde_json::json!({
            "id": "UC-001",
            "title": "Unicode Obfuscation Attack",
            "severity": "medium",
            "description": "Zero-width characters, homoglyphs, and bidirectional overrides used to hide malicious content.",
            "category": "Obfuscation",
            "owasp_ids": ["MCP-02"],
            "references": ["CVE-2021-42574"],
            "mitigations": ["Unicode normalization", "Zero-width character stripping"]
        }),
    ]
}
