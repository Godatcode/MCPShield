use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(
    name = "mcpshield",
    version,
    about = "Runtime security firewall for MCP servers",
    long_about = "MCPShield protects Claude Desktop, Cursor, and Claude Code from tool poisoning, \
                  credential exfiltration, and rug-pull attacks. Fully offline — no API keys required."
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,

    /// Config file path (default: ~/.mcpshield/config.toml)
    #[arg(long, global = true)]
    pub config: Option<PathBuf>,

    /// Verbose output
    #[arg(long, short, global = true)]
    pub verbose: bool,

    /// JSON output format
    #[arg(long, global = true)]
    pub json: bool,

    /// Disable colored output
    #[arg(long, global = true)]
    pub no_color: bool,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Scan MCP configurations for vulnerabilities
    Scan {
        /// Path to a specific MCP config file to scan
        path: Option<PathBuf>,

        /// Only show findings at or above this severity
        #[arg(long, default_value = "low")]
        severity: String,
    },

    /// Start runtime proxy (intercepts + filters MCP traffic)
    Proxy {
        /// Block all write operations
        #[arg(long)]
        block_writes: bool,

        /// Server command to proxy (e.g., "npx -y @modelcontextprotocol/server-filesystem /tmp")
        #[arg(long)]
        server_cmd: Option<String>,
    },

    /// Manage tool pins (detect rug-pull attacks)
    Pin {
        #[command(subcommand)]
        action: PinAction,
    },

    /// View audit log
    Audit {
        /// Show events from the last duration (e.g., "24h", "7d")
        #[arg(long)]
        last: Option<String>,

        /// Filter by severity (critical, high, medium, low, info)
        #[arg(long)]
        severity: Option<String>,
    },

    /// Generate example configuration
    Init,
}

#[derive(Subcommand, Debug)]
pub enum PinAction {
    /// List all pinned tools
    List,
    /// Verify pinned tools haven't changed (detect rug-pulls)
    Verify,
    /// Reset all pins
    Reset,
}
