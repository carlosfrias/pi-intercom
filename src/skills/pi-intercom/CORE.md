# CORE: Philosophy + Action Reference

**Section ID:** CORE  
**Size:** ~2KB  
**LOD:** Low  
**Purpose:** Establish the mental model for pi-intercom — when to use it, what actions exist, and how they differ.

---

## What Pi-Intercom Does

Pi-intercom enables direct 1:1 messaging between pi sessions on the same machine. Use it for task delegation, context handoffs, clarification loops, and multi-session workflows.

When supervising `pi-subagents`, delegated child agents can escalate to you via `contact_supervisor` if child bridge metadata was supplied. See [ESCALATION.md](ESCALATION.md) for orchestrator-side handling.

## When to Use

- **Task delegation**: Split work between a planner session and worker sessions
- **Context handoffs**: Send findings from a research session to an execution session
- **Clarification loops**: Worker asks questions, planner answers, work continues
- **Multi-session workflows**: Coordinate between specialized sessions (frontend/backend, research/implementation)

## Action Reference

| Action | Behavior | Use When |
|--------|----------|----------|
| `send` | Fire-and-forget | You don't need a response |
| `ask` | Blocks until reply (10 min timeout) | You need an answer to continue |
| `reply` | Responds to the active or pending inbound ask | You were asked something and need to answer naturally |
| `pending` | Lists unresolved inbound asks | You need to see who is waiting before replying |
| `list` | Returns all sessions with live status | You need to discover targets or choose an idle peer |
| `status` | Returns your connection state | Troubleshooting |

## Quick Examples

```typescript
// Discover who's connected
intercom({ action: "list" })

// Send a task (fire-and-forget)
intercom({ action: "send", to: "worker", message: "Add retry logic to client.ts" })

// Ask a blocking question
const reply = await intercom({ action: "ask", to: "planner", message: "Which API version?" })

// Reply to an inbound ask
intercom({ action: "reply", message: "Use the stable v2 API." })

// Check pending asks
intercom({ action: "pending" })
```

---

*Load [PATTERNS.md](PATTERNS.md) for detailed pattern walk-throughs. Load [ESCALATION.md](ESCALATION.md) for subagent escalation handling.*