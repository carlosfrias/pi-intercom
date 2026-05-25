# pi-intercom Live Testing Guide

## Quick Start

### Automated Test (Recommended)

```bash
cd /Users/friasc/Cloud/carlos-desktop/workshop/01-Projects/pi-intercom

# Step 1: Run orchestrator test (sends parallel asks)
./tests/run-orchestrator-test.sh

# Step 2: Wait 2 seconds, then send worker replies
./tests/send-worker-replies.sh

# Step 3: Watch results in orchestrator session
tmux -S "$TMPDIR/pi-tmux-sockets/pi.sock" attach -t pi-worker-3
```

### Manual Test

**Step 1: Verify infrastructure**
```bash
# Check broker
ps aux | grep -E "tsx.*broker" | grep -v grep

# Check worker sessions
SOCKET="$TMPDIR/pi-tmux-sockets/pi.sock"
tmux -S "$SOCKET" list-sessions
```

**Step 2: In orchestrator session (pi-worker-3)**
```javascript
console.log('🧪 Testing parallel asks...\n');

const results = await Promise.all([
  intercom({ 
    action: 'ask', 
    to: 'assistant-1', 
    message: 'Parallel Test 1: Status?' 
  }),
  intercom({ 
    action: 'ask', 
    to: 'assistant-2', 
    message: 'Parallel Test 2: Status?' 
  }),
  intercom({ 
    action: 'ask', 
    to: 'assistant-3', 
    message: 'Parallel Test 3: Status?' 
  })
]);

console.log('Results:', results);
```

**Step 3: In each worker session (within 10 minutes!)**
```bash
# Attach to worker
SOCKET="$TMPDIR/pi-tmux-sockets/pi.sock"
tmux -S "$SOCKET" attach -t pi-worker-1
```

```javascript
// Reply to the ask
intercom({ action: 'reply', message: 'Status: Ready from worker-1' });
```

Repeat for pi-worker-2 and pi-worker-3.

## Test Scripts

| Script | Purpose |
|--------|---------|
| `run-orchestrator-test.sh` | Sends parallel asks from orchestrator |
| `send-worker-replies.sh` | Sends auto-replies from all workers |
| `setup-workers.sh` | Configures worker sessions |
| `auto-reply-worker.ts` | Auto-reply logic (for reference) |

## Expected Results

### ✅ Success

```
============================================================
RESULTS
============================================================

✅ assistant-1: Status: Ready from worker-1 (auto-reply)
   Response time: 523ms

✅ assistant-2: Status: Ready from worker-2 (auto-reply)
   Response time: 531ms

✅ assistant-3: Status: Ready from worker-3 (auto-reply)
   Response time: 547ms

============================================================
SUMMARY: 3 passed, 0 failed
Total time: 547ms
============================================================

✅ TEST PASSED - All parallel asks completed!
```

### ❌ Failure (Old Code)

```
Error: Already waiting for a reply
    at waitForReply (index.ts:441:29)
    at Object.execute (index.ts:1501:30)
```

## Troubleshooting

### "Session not found"
```bash
# List available sessions
SOCKET="$TMPDIR/pi-tmux-sockets/pi.sock"
tmux -S "$SOCKET" list-sessions

# Sessions should be named: pi-worker-1, pi-worker-2, pi-worker-3
```

### "Broker not running"
```bash
cd /Users/friasc/Cloud/carlos-desktop/workshop/01-Projects/pi-intercom
npx tsx src/broker/broker.ts &
```

### "Tool not found: intercom"
- Ensure pi-intercom fork is installed in the pi session
- Check `~/.pi/agent/settings.json` for package configuration

### Ask timeout (10 minutes)
- Replies must be sent within 10 minutes
- Use `send-worker-replies.sh` for quick replies

## Test Files

| File | Purpose |
|------|---------|
| `concurrent-ask.unit.test.ts` | Unit tests (run externally with tsx) |
| `concurrent-ask.test.ts` | Integration test (run inside pi session) |
| `parallel-ask-live.test.ts` | Live test with 3 agents (run inside pi session) |
| `auto-reply-worker.ts` | Auto-reply logic template |

## Success Criteria

- [ ] No "Already waiting for a reply" error
- [ ] All 3 parallel asks complete
- [ ] Replies correctly routed to respective asks
- [ ] Total time < 2 seconds (parallel, not serial)
- [ ] No memory leaks or hanging promises

---
*Last updated: 2026-05-18*
