use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct ResendEmail {
    from: String,
    to: Vec<String>,
    subject: String,
    html: String,
    reply_to: String,
}

#[derive(Debug, Serialize)]
struct ResendBatchEmail {
    from: String,
    to: String,
    subject: String,
    html: String,
    reply_to: String,
}

#[derive(Debug, Deserialize)]
pub struct ResendResponse {
    pub id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ResendBatchResponse {
    pub data: Option<Vec<ResendBatchItem>>,
}

#[derive(Debug, Deserialize)]
pub struct ResendBatchItem {
    pub id: String,
}

pub struct ResendClient {
    api_key: String,
    from_address: String,
    reply_to: String,
    client: Client,
}

impl ResendClient {
    pub fn new(api_key: String, from_address: String) -> Self {
        let reply_to = std::env::var("RESEND_REPLY_TO")
            .unwrap_or_else(|_| "arka25.cp@gmail.com".to_string());
        Self {
            api_key,
            from_address,
            reply_to,
            client: Client::new(),
        }
    }

    /// Send a single email (e.g., welcome email on signup).
    pub async fn send_one(&self, to: &str, subject: &str, html: &str) -> Result<String, String> {
        let email = ResendEmail {
            from: self.from_address.clone(),
            to: vec![to.to_string()],
            subject: subject.to_string(),
            html: html.to_string(),
            reply_to: self.reply_to.clone(),
        };

        let resp = self.client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&email)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("Resend API error {}: {}", status, body));
        }

        let data: ResendResponse = resp.json().await
            .map_err(|e| format!("Parse error: {}", e))?;

        Ok(data.id.unwrap_or_default())
    }

    /// Send a batch email to multiple recipients (for campaigns).
    /// Resend batch API allows up to 100 emails per request.
    pub async fn send_batch(&self, recipients: &[String], subject: &str, html: &str) -> Result<String, String> {
        if recipients.is_empty() {
            return Err("No recipients".to_string());
        }

        let emails: Vec<ResendBatchEmail> = recipients.iter().map(|to| {
            ResendBatchEmail {
                from: self.from_address.clone(),
                to: to.clone(),
                subject: subject.to_string(),
                html: html.to_string(),
                reply_to: self.reply_to.clone(),
            }
        }).collect();

        // Resend batch limit is 100 per request, chunk if needed
        let mut all_ids = Vec::new();

        for chunk in emails.chunks(100) {
            let resp = self.client
                .post("https://api.resend.com/emails/batch")
                .header("Authorization", format!("Bearer {}", self.api_key))
                .json(&chunk)
                .send()
                .await
                .map_err(|e| format!("Batch request failed: {}", e))?;

            if !resp.status().is_success() {
                let status = resp.status();
                let body = resp.text().await.unwrap_or_default();
                return Err(format!("Resend batch API error {}: {}", status, body));
            }

            let data: ResendBatchResponse = resp.json().await
                .map_err(|e| format!("Parse error: {}", e))?;

            if let Some(items) = data.data {
                for item in items {
                    all_ids.push(item.id);
                }
            }
        }

        Ok(all_ids.first().cloned().unwrap_or_default())
    }

    /// Generate a styled welcome email HTML.
    /// Uses light background to avoid spam filters (dark bg emails often get flagged).
    pub fn welcome_email_html(email: &str) -> String {
        format!(r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Praesidio</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:22px;font-weight:600;margin:0 0 8px;color:#1a1a2e;">Welcome to Praesidio</h1>
        <p style="font-size:14px;color:#6b7280;margin:0;">You're on the early access list.</p>
      </div>
      <p style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 16px;">
        We're building the runtime firewall your AI agents need. Fully offline, no API keys required, covering all 20 OWASP MCP and Agentic security risks.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 24px;">
        We'll notify you when it's your turn to get access. In the meantime, you'll be the first to hear about updates.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://praesidio.live" style="display:inline-block;padding:12px 28px;background:#7c5bf0;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Visit Praesidio</a>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;padding:0 20px;">
      <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;">
        This email was sent to {email} because you signed up for Praesidio early access.
      </p>
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        Praesidio &mdash; Runtime security for AI agents
      </p>
    </div>
  </div>
</body>
</html>"#, email = email)
    }
}
