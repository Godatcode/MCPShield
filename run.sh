#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT="${PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

# Cleanup function — kills background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
        echo -e "${GREEN}Backend stopped${NC}"
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        echo -e "${GREEN}Frontend stopped${NC}"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║         🛡️  Praesidio Dev Server       ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# --- Check prerequisites ---
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v cargo &>/dev/null; then
    echo -e "${RED}Error: cargo not found. Install Rust from https://rustup.rs${NC}"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    echo -e "${RED}Error: npm not found. Install Node.js from https://nodejs.org${NC}"
    exit 1
fi

# Check env files
if [ ! -f "$PROJECT_ROOT/server/.env" ]; then
    echo -e "${RED}Error: server/.env not found. Copy server/.env.example to server/.env and add your keys.${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/dashboard/.env" ]; then
    echo -e "${RED}Error: dashboard/.env not found. Copy dashboard/.env.example to dashboard/.env and configure it.${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites OK${NC}\n"

# --- Install frontend dependencies if needed ---
if [ ! -d "$PROJECT_ROOT/dashboard/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$PROJECT_ROOT/dashboard" && npm install
    echo -e "${GREEN}Dependencies installed${NC}\n"
fi

# --- Start Backend ---
echo -e "${CYAN}Starting backend on port ${BACKEND_PORT}...${NC}"
cd "$PROJECT_ROOT/server"
cargo run &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
MAX_RETRIES=60
RETRY=0
while ! curl -s "http://127.0.0.1:${BACKEND_PORT}/api/overview" >/dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        echo -e "${RED}Backend failed to start after ${MAX_RETRIES}s. Check logs above.${NC}"
        cleanup
        exit 1
    fi
    # Check if backend process is still running
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${RED}Backend process exited. Check logs above.${NC}"
        exit 1
    fi
    sleep 1
done

echo -e "${GREEN}Backend is running on http://127.0.0.1:${BACKEND_PORT}${NC}\n"

# --- Start Frontend ---
echo -e "${CYAN}Starting frontend on port ${FRONTEND_PORT}...${NC}"
cd "$PROJECT_ROOT/dashboard"
npm run dev -- --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

# Wait for frontend to be ready
sleep 3

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Praesidio is running!${NC}"
echo ""
echo -e "  Landing page:      ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  Waitlist admin:    ${CYAN}http://localhost:${FRONTEND_PORT}/admin/waitlist${NC}"
echo -e "  Backend API:       ${CYAN}http://127.0.0.1:${BACKEND_PORT}/api${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop everything${NC}"

# Keep script alive, wait for either process to exit
wait
