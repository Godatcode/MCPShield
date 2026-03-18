use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subscriber {
    pub id: i64,
    pub email: String,
    pub source: Option<String>,
    pub subscribed_at: String,
    pub confirmed: bool,
    pub unsubscribed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmailLog {
    pub id: i64,
    pub subject: String,
    pub body_preview: String,
    pub sent_at: String,
    pub recipient_count: i64,
    pub resend_batch_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct WaitlistStats {
    pub total: i64,
    pub confirmed: i64,
    pub unsubscribed: i64,
    pub active: i64,
    pub today: i64,
    pub this_week: i64,
    pub this_month: i64,
    pub daily_signups: Vec<DailyCount>,
}

#[derive(Debug, Serialize)]
pub struct DailyCount {
    pub date: String,
    pub count: i64,
}

pub struct WaitlistDb {
    conn: Mutex<Connection>,
}

impl WaitlistDb {
    pub fn open(db_path: &Path) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(db_path)?;

        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                source TEXT,
                subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
                confirmed INTEGER NOT NULL DEFAULT 0,
                unsubscribed INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS email_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                body_preview TEXT NOT NULL,
                sent_at TEXT NOT NULL DEFAULT (datetime('now')),
                recipient_count INTEGER NOT NULL DEFAULT 0,
                resend_batch_id TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
            CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON subscribers(subscribed_at);
            "
        )?;

        Ok(Self { conn: Mutex::new(conn) })
    }

    /// Add a new subscriber. Returns Ok(true) if new, Ok(false) if already exists.
    pub fn add_subscriber(&self, email: &str, source: Option<&str>) -> Result<bool, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();

        // Check if already subscribed
        let exists: bool = conn.query_row(
            "SELECT COUNT(*) > 0 FROM subscribers WHERE email = ?1",
            params![email],
            |row| row.get(0),
        )?;

        if exists {
            // Re-subscribe if previously unsubscribed
            conn.execute(
                "UPDATE subscribers SET unsubscribed = 0 WHERE email = ?1 AND unsubscribed = 1",
                params![email],
            )?;
            return Ok(false);
        }

        conn.execute(
            "INSERT INTO subscribers (email, source) VALUES (?1, ?2)",
            params![email, source],
        )?;

        Ok(true)
    }

    /// Remove (unsubscribe) a subscriber by email.
    pub fn unsubscribe(&self, email: &str) -> Result<bool, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let affected = conn.execute(
            "UPDATE subscribers SET unsubscribed = 1 WHERE email = ?1 AND unsubscribed = 0",
            params![email],
        )?;
        Ok(affected > 0)
    }

    /// Delete a subscriber permanently.
    pub fn delete_subscriber(&self, email: &str) -> Result<bool, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let affected = conn.execute(
            "DELETE FROM subscribers WHERE email = ?1",
            params![email],
        )?;
        Ok(affected > 0)
    }

    /// Get all active (not unsubscribed) subscriber emails.
    pub fn get_active_emails(&self) -> Result<Vec<String>, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT email FROM subscribers WHERE unsubscribed = 0 ORDER BY subscribed_at ASC"
        )?;
        let emails = stmt.query_map([], |row| row.get::<_, String>(0))?
            .filter_map(|r| r.ok())
            .collect();
        Ok(emails)
    }

    /// List all subscribers with pagination.
    pub fn list_subscribers(&self, limit: i64, offset: i64) -> Result<Vec<Subscriber>, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, email, source, subscribed_at, confirmed, unsubscribed
             FROM subscribers
             ORDER BY subscribed_at DESC
             LIMIT ?1 OFFSET ?2"
        )?;
        let subs = stmt.query_map(params![limit, offset], |row| {
            Ok(Subscriber {
                id: row.get(0)?,
                email: row.get(1)?,
                source: row.get(2)?,
                subscribed_at: row.get(3)?,
                confirmed: row.get::<_, i32>(4)? != 0,
                unsubscribed: row.get::<_, i32>(5)? != 0,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        Ok(subs)
    }

    /// Get waitlist statistics.
    pub fn get_stats(&self) -> Result<WaitlistStats, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();

        let total: i64 = conn.query_row("SELECT COUNT(*) FROM subscribers", [], |r| r.get(0))?;
        let confirmed: i64 = conn.query_row("SELECT COUNT(*) FROM subscribers WHERE confirmed = 1", [], |r| r.get(0))?;
        let unsubscribed: i64 = conn.query_row("SELECT COUNT(*) FROM subscribers WHERE unsubscribed = 1", [], |r| r.get(0))?;
        let active: i64 = conn.query_row("SELECT COUNT(*) FROM subscribers WHERE unsubscribed = 0", [], |r| r.get(0))?;
        let today: i64 = conn.query_row(
            "SELECT COUNT(*) FROM subscribers WHERE date(subscribed_at) = date('now')", [], |r| r.get(0)
        )?;
        let this_week: i64 = conn.query_row(
            "SELECT COUNT(*) FROM subscribers WHERE subscribed_at >= datetime('now', '-7 days')", [], |r| r.get(0)
        )?;
        let this_month: i64 = conn.query_row(
            "SELECT COUNT(*) FROM subscribers WHERE subscribed_at >= datetime('now', '-30 days')", [], |r| r.get(0)
        )?;

        // Daily signups for the last 30 days
        let mut stmt = conn.prepare(
            "SELECT date(subscribed_at) as d, COUNT(*) as c
             FROM subscribers
             WHERE subscribed_at >= datetime('now', '-30 days')
             GROUP BY d
             ORDER BY d ASC"
        )?;
        let daily_signups = stmt.query_map([], |row| {
            Ok(DailyCount {
                date: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

        Ok(WaitlistStats {
            total,
            confirmed,
            unsubscribed,
            active,
            today,
            this_week,
            this_month,
            daily_signups,
        })
    }

    /// Log a sent email campaign.
    pub fn log_email(&self, subject: &str, body_preview: &str, recipient_count: i64, batch_id: Option<&str>) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO email_logs (subject, body_preview, recipient_count, resend_batch_id) VALUES (?1, ?2, ?3, ?4)",
            params![subject, body_preview, recipient_count, batch_id],
        )?;
        Ok(())
    }

    /// Get email campaign history.
    pub fn get_email_logs(&self, limit: i64) -> Result<Vec<EmailLog>, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, subject, body_preview, sent_at, recipient_count, resend_batch_id
             FROM email_logs
             ORDER BY sent_at DESC
             LIMIT ?1"
        )?;
        let logs = stmt.query_map(params![limit], |row| {
            Ok(EmailLog {
                id: row.get(0)?,
                subject: row.get(1)?,
                body_preview: row.get(2)?,
                sent_at: row.get(3)?,
                recipient_count: row.get(4)?,
                resend_batch_id: row.get(5)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        Ok(logs)
    }
}
