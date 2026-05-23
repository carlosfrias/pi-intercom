# CONSTRAINTS: Action Limitations, Errors, and Troubleshooting

**Section ID:** CONSTRAINTS  
**Size:** ~2.5KB  
**LOD:** Low  
**Purpose:** Document action constraints, common errors with solutions, and troubleshooting steps.

---

## `ask` Limitations

- **10-minute timeout**: If no reply comes within 10 minutes, the ask fails
- **One at a time**: Cannot have multiple pending asks from the same session
- **Cannot self-target**: A session cannot ask itself

```typescript
// Check if already waiting before asking
const result = await intercom({ action: "ask", to: "planner", message: "..." });
if (result.isError && result.content[0].text.includes("Already waiting")) {
  // Use send instead, or wait for current ask to complete
}
```

## `send` Behavior

- **No timeout**: Message is delivered or fails immediately
- **Confirmation dialogs**: If `confirmSend: true` in config, interactive sessions show a confirmation dialog
- **Replies skip confirmation**: Messages with `replyTo` never show confirmation dialogs

## Common Errors and Solutions

### "Already waiting for a reply"

You can only have one pending ask at a time.

```typescript
// Option 1: Use send instead
intercom({ action: "send", to: "planner", message: "..." });

// Option 2: Wait for current ask to complete first
```

### "Cannot message the current session"

You cannot target yourself. This usually means you confused session names — double-check the target.

### "Session not found"

```typescript
const result = await intercom({ action: "send", to: "worker", message: "..." });
if (!result.delivered) {
  console.log("Failed:", result.reason);
  // → "Session not found" - check the name and list available sessions
  await intercom({ action: "list" });
}
```

### Ask timeout (after 10 minutes)

The ask will reject with a timeout error. Design your workflow so answers come within 10 minutes. For longer tasks, use send + follow-up ask pattern. See [WORKFLOWS.md](WORKFLOWS.md) for the long-running task pattern.

## Troubleshooting

### Session not appearing in list

1. Check intercom is enabled: `intercom({ action: "status" })`
2. Verify the target session has loaded pi-intercom
3. Ensure both sessions are on the same machine (intercom is same-machine only)

### Message not delivered

```typescript
const result = await intercom({ action: "send", to: "worker", message: "..." });
if (!result.delivered) {
  console.log("Failed:", result.reason);
  // → "Session not found" or delivery failure reason
}
```

### Connection lost

Sessions automatically reconnect if the broker restarts. If persistently disconnected:

```typescript
intercom({ action: "status" })
// Check if broker is running and restart if needed
```

---

*Load [WORKFLOWS.md](WORKFLOWS.md) for best practices and workflow examples. Load [ESCALATION.md](ESCALATION.md) for subagent escalation handling.*