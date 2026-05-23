#!/bin/bash
# Send Auto-Replies from Worker Sessions
#
# This script sends reply commands to all worker sessions.
# Run this AFTER the orchestrator sends parallel asks.
#
# Usage: ./tests/send-worker-replies.sh

set -e

SOCKET_DIR="${TMPDIR:-/tmp}/pi-tmux-sockets"
SOCKET="$SOCKET_DIR/pi.sock"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Sending Worker Replies${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check socket
if [ ! -S "$SOCKET" ]; then
    echo -e "${RED}❌ tmux socket not found${NC}"
    exit 1
fi

# Send replies to each worker
WORKERS=("pi-worker-1" "pi-worker-2" "pi-worker-3")

for i in "${!WORKERS[@]}"; do
    WORKER="${WORKERS[$i]}"
    NUM=$((i + 1))
    
    echo -e "${YELLOW}Sending reply from $WORKER...${NC}"
    
    # Send reply command
    tmux -S "$SOCKET" send-keys -t "$WORKER" \
      "intercom({ action: 'reply', message: 'Status: Ready from $WORKER (auto-reply)' });"
    tmux -S "$SOCKET" send-keys -t "$WORKER" Enter
    
    echo -e "   ${GREEN}✓${NC} Reply sent"
    sleep 0.3
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All worker replies sent${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Check orchestrator session for results:${NC}"
echo "   tmux -S $SOCKET attach -t pi-worker-3"
echo ""
