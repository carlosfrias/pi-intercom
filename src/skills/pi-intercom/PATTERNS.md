# PATTERNS: Core Communication Patterns

**Section ID:** PATTERNS  
**Size:** ~3.5KB  
**LOD:** Medium  
**Purpose:** Detailed walk-throughs of the five core intercom patterns with code examples.

---

## [S-TIGHT]

Five patterns cover all intercom workflows: Planner-Worker delegation (send+ask), Quick Status Check, Reply Naturally, Broadcast, and Send with Attachments. Each pattern includes setup, sending, and receiving examples.

---

## Pattern 1: Planner-Worker Delegation

The most common pattern. One session holds the big picture, others do hands-on work.

**Setup** (in each session):
```
/name planner    # Terminal 1
/name worker     # Terminal 2
```

**Planner delegates a task** (fire-and-forget):
```typescript
intercom({
  action: "send",
  to: "worker",
  message: "Task-3: Add retry logic to API client. Key files: src/api/client.ts. Ask if anything's unclear."
})
```

**Worker asks for clarification** (blocks until answer):
```typescript
intercom({
  action: "ask",
  to: "planner",
  message: "Should I use exponential backoff or fixed intervals?"
})
// → Returns the planner's reply as the result
```

**Worker reports completion**:
```typescript
intercom({
  action: "ask",
  to: "planner",
  message: "Task-3 complete. Added exponential backoff (100ms → 1600ms, max 5 retries). Ready for task-4?"
})
```

[LOD: Low] Pattern 1 in brief: planner sends tasks, worker asks blocking questions, both use `ask` when they need the other side to wait.

## Pattern 2: Quick Status Check

Before sending, verify who's connected:

```typescript
intercom({ action: "list" })
// → Shows all connected sessions with names, cwd, models, and live status (`idle`, `thinking`, `tool:<name>`)
```

[LOD: Low] Pattern 2 in brief: `list` returns all sessions with live activity status.

## Pattern 3: Reply Naturally

When responding to an inbound ask, prefer `reply` instead of reconstructing raw IDs:

```typescript
// In the turn triggered by the ask:
intercom({
  action: "reply",
  message: "Use exponential backoff starting at 100ms."
})

// If replying later and there might be more than one pending ask:
intercom({ action: "pending" })
intercom({ action: "reply", to: "planner", message: "Use exponential backoff starting at 100ms." })
```

`reply` preserves exact threading under the hood by sending the response with the original `replyTo` value.

[LOD: Low] Pattern 3 in brief: Use `reply` to respond to an inbound `ask`. It auto-threads. If multiple asks are pending, use `pending` first then specify `to`.

## Pattern 4: Broadcast to Multiple Workers

Send to multiple sessions in parallel:

```typescript
const workers = ["worker-1", "worker-2", "worker-3"];
const task = "Check for null pointer exceptions in your assigned files";

// Fire-and-forget to all workers
workers.forEach(w => 
  intercom({ action: "send", to: w, message: task })
);
```

[LOD: Low] Pattern 4 in brief: Loop over targets with `send` for parallel fan-out.

## Pattern 5: Send with Attachments

Share code snippets, files, or context:

```typescript
intercom({
  action: "send",
  to: "worker",
  message: "Here's the fix for the auth issue:",
  attachments: [{
    type: "snippet",
    name: "auth.ts",
    language: "typescript",
    content: `function validateUser(user: User | null) {
  if (!user) throw new Error("User required");
  return user.email?.includes("@");
}`
  }]
})
```

[LOD: Low] Pattern 5 in brief: Add `attachments` array with `type`, `name`, `language`, `content` to share code context.

---

*Load [ESCALATION.md](ESCALATION.md) for subagent escalation handling (Pattern 6). Load [CONSTRAINTS.md](CONSTRAINTS.md) for action limitations and error handling.*