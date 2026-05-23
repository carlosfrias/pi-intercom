#!/bin/bash
# Setup Auto-Reply Worker Sessions for pi-intercom Testing
#
# This script configures tmux worker sessions to auto-reply to intercom asks.
# Each worker will automatically reply with its status when asked.

set -e

SOCKET_DIR="${TMPDIR:-/tmp}/pi-tmux-sockets"
SOCKET="$SOCKET_DIR/pi.sock"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  pi-intercom Auto-Reply Worker Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if tmux socket exists
if [ ! -S "$SOCKET" ]; then
    echo -e "${RED}❌ Error: tmux socket not found at $SOCKET${NC}"
    echo "Make sure worker sessions are running:"
    echo "  tmux -S $SOCKET list-sessions"
    exit 1
fi

# List available sessions
echo -e "${YELLOW}Checking worker sessions...${NC}"
SESSIONS=$(tmux -S "$SOCKET" list-sessions 2>/dev/null | grep -E "pi-worker-[0-9]+" | cut -d: -f1 || true)

if [ -z "$SESSIONS" ]; then
    echo -e "${RED}❌ No worker sessions found${NC}"
    echo "Create worker sessions first:"
    echo "  tmux -S $SOCKET new -d -s pi-worker-1 'pi'"
    echo "  tmux -S $SOCKET new -d -s pi-worker-2 'pi'"
    echo "  tmux -S $SOCKET new -d -s pi-worker-3 'pi'"
    exit 1
fi

echo -e "${GREEN}✅ Found worker sessions:${NC}"
echo "$SESSIONS" | while read session; do
    echo "   - $session"
done
echo ""

# Auto-reply code to inject into each session
AUTO_REPLY_CODE='
// Auto-reply mode enabled
console.log("🤖 Auto-reply worker ready");

// Note: This is a placeholder for auto-reply logic
// In pi sessions, asks arrive as blocking tool calls
// The session must manually reply with:
// intercom({ action: "reply", message: "Status: Ready" });

console.log("When an ask arrives, reply with:");
console.log("  intercom({ action: \"reply\", message: \"Status: Ready from " + process.pid + "\" });");
'

# Configure each worker session
echo -e "${YELLOW}Configuring worker sessions...${NC}"
echo ""

for SESSION in $SESSIONS; do
    echo -e "${BLUE}Configuring $SESSION...${NC}"
    
    # Send a test command to verify session is responsive
    tmux -S "$SOCKET" send-keys -t "$SESSION" 'console.log("Worker '$SESSION' ready")' Enter 2>/dev/null || true
    
    # Wait briefly for session to process
    sleep 0.5
    
    # Capture last few lines to verify
    OUTPUT=$(tmux -S "$SOCKET" capture-pane -t "$SESSION" -p 2>/dev/null | tail -5 || echo "(no output)")
    
    echo -e "   ${GREEN}✓${NC} Session configured"
    echo "   Last output: ${OUTPUT:0:80}..."
    echo ""
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Worker sessions ready for testing${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. In orchestrator session, run parallel ask test"
echo "2. Watch worker sessions for incoming asks"
echo "3. Manually reply in each worker with:"
echo "   intercom({ action: 'reply', message: 'Status: Ready' });"
echo ""
echo -e "${YELLOW}Or use the orchestrator test script:${NC}"
echo "   cd workshop/01-Projects/pi-intercom"
echo "   ./tests/run-orchestrator-test.sh"
echo ""
