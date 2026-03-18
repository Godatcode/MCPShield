use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct ResendEmail {
    from: String,
    to: Vec<String>,
    subject: String,
    html: String,
}

#[derive(Debug, Serialize)]
struct ResendBatchEmail {
    from: String,
    to: String,
    subject: String,
    html: String,
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
    client: Client,
}

impl ResendClient {
    pub fn new(api_key: String, from_address: String) -> Self {
        Self {
            api_key,
            from_address,
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
    pub fn welcome_email_html(email: &str) -> String {
        format!(r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#08080c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:40px;height:40px;background:#7c5bf0;border-radius:10px;line-height:40px;font-size:18px;">🛡️</div>
      <h1 style="color:#f0f0f2;font-size:24px;font-weight:600;margin:16px 0 0;">Welcome to Praesidio</h1>
    </div>
    <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
      You're on the early access list. We're building the runtime firewall your AI agents need — fully offline, no API keys, covering all 20 OWASP MCP + Agentic risks.
    </p>
    <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
      We'll reach out when it's your turn to get access. In the meantime, you'll be the first to hear about updates.
    </p>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
        This email was sent to {email} because you signed up for Praesidio early access.
      </p>
    </div>
  </div>
</body>
</html>"#, email = email)
    }
}
