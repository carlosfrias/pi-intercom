#!/bin/bash
# Orchestrator Test Script for pi-intercom Parallel Ask
#
# This script runs the parallel ask test from the orchestrator session.
# It sends the test code to the orchestrator tmux session and monitors results.
#
# Prerequisites:
# - Broker running
# - Worker sessions running (pi-worker-1, pi-worker-2, pi-worker-3)
# - Orchestrator session running (pi-worker-3 or separate pi session)

set -e

SOCKET_DIR="${TMPDIR:-/tmp}/pi-tmux-sockets"
SOCKET="$SOCKET_DIR/pi.sock"
ORCHESTRATOR_SESSION="${PI_ORCHESTRATOR_SESSION:-pi-worker-3}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  pi-intercom Parallel Ask Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check broker
if [ ! -S "$HOME/.pi/agent/intercom/broker.sock" ]; then
    echo -e "${RED}❌ Broker not running${NC}"
    echo "Start broker: cd workshop/01-Projects/pi-intercom && npx tsx src/broker/broker.ts &"
    exit 1
fi
echo -e "${GREEN}✅ Broker running${NC}"

# Check worker sessions
if ! tmux -S "$SOCKET" list-sessions 2>/dev/null | grep -q "pi-worker"; then
    echo -e "${RED}❌ No worker sessions found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Worker sessions available${NC}"
echo ""

# Test code to inject into orchestrator session
read -r -d '' TEST_CODE << 'EOF' || true
// 🧪 Parallel Ask Test - Orchestrator
console.log('\n🧪 Starting parallel ask test...\n');

(async () => {
  try {
    // Step 1: List sessions
    console.log('Step 1: Listing sessions...');
    const sessions = await intercom({ action: 'list' });
    console.log('Available sessions:', JSON.stringify(sessions, null, 2));
    console.log('');
    
    // Step 2: Send parallel asks
    console.log('Step 2: Sending parallel asks to 3 assistants...\n');
    const startTime = Date.now();
    
    const results = await Promise.all([
      intercom({ 
        action: 'ask', 
        to: 'assistant-1', 
        message: 'Parallel Test 1: What is your status?' 
      }).then(r => ({ success: true, assistant: 'assistant-1', reply: r, time: Date.now() - startTime }))
        .catch(e => ({ success: false, assistant: 'assistant-1', error: e.message, time: Date.now() - startTime })),
      
      intercom({ 
        action: 'ask', 
        to: 'assistant-2', 
        message: 'Parallel Test 2: What is your status?' 
      }).then(r => ({ success: true, assistant: 'assistant-2', reply: r, time: Date.now() - startTime }))
        .catch(e => ({ success: false, assistant: 'assistant-2', error: e.message, time: Date.now() - startTime })),
      
      intercom({ 
        action: 'ask', 
        to: 'assistant-3', 
        message: 'Parallel Test 3: What is your status?' 
      }).then(r => ({ success: true, assistant: 'assistant-3', reply: r, time: Date.now() - startTime }))
        .catch(e => ({ success: false, assistant: 'assistant-3', error: e.message, time: Date.now() - startTime }))
    ]);
    
    // Step 3: Display results
    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    results.forEach(r => {
      if (r.success) {
        passed++;
        console.log(`\n✅ ${r.assistant}: ${r.reply}`);
        console.log(`   Response time: ${r.time}ms`);
      } else {
        failed++;
        console.log(`\n❌ ${r.assistant}: FAILED`);
        console.log(`   Error: ${r.error}`);
        console.log(`   Time: ${r.time}ms`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`Total time: ${Date.now() - startTime}ms`);
    console.log('='.repeat(60));
    
    if (failed > 0) {
      console.log('\n❌ TEST FAILED');
    } else {
      console.log('\n✅ TEST PASSED - All parallel asks completed!');
    }
    
  } catch (error) {
    console.error('Test crashed:', error);
  }
})();
EOF

echo -e "${YELLOW}Injecting test code into orchestrator session ($ORCHESTRATOR_SESSION)...${NC}"
echo ""

# Send test code to orchestrator session
tmux -S "$SOCKET" send-keys -t "$ORCHESTRATOR_SESSION" "$TEST_CODE"
tmux -S "$SOCKET" send-keys -t "$ORCHESTRATOR_SESSION" Enter

echo -e "${GREEN}✅ Test code sent to $ORCHESTRATOR_SESSION${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Attach to orchestrator to watch test:"
echo "   tmux -S $SOCKET attach -t $ORCHESTRATOR_SESSION"
echo ""
echo "2. In EACH worker session, reply to the ask:"
echo "   tmux -S $SOCKET send-keys -t 'pi-worker-1' 'intercom({ action: \"reply\", message: \"Status: Ready from worker-1\" });' Enter"
echo "   tmux -S $SOCKET send-keys -t 'pi-worker-2' 'intercom({ action: \"reply\", message: \"Status: Ready from worker-2\" });' Enter"
echo "   tmux -S $SOCKET send-keys -t 'pi-worker-3' 'intercom({ action: \"reply\", message: \"Status: Ready from worker-3\" });' Enter"
echo ""
echo -e "${BLUE}Or run all replies automatically:${NC}"
echo "   ./tests/send-worker-replies.sh"
echo ""
