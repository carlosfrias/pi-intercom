# ESCALATION: Subagent Escalation Handling

**Section ID:** ESCALATION  
**Size:** ~2.5KB  
**LOD:** Medium  
**Purpose:** Handle orchestrator-side escalations from delegated child agents spawned by pi-subagents.

---

## [S-TIGHT]

When `pi-subagents` spawns a delegated child with bridge metadata, that child can reach you via `contact_supervisor`. You receive a formatted message with run metadata. Reply using `reply` — it resolves sender and message ID automatically. Three escalation types: `need_decision` (blocking, reply promptly), `interview_request` (blocking, reply with JSON), `progress_update` (non-blocking, no reply needed).

---

## How Escalations Arrive

You receive a formatted message like:

```
**From subagent-worker-78f659a3-1**

Subagent needs a supervisor decision.
Run: 78f659a3
Agent: worker
Child index: 0

Which API should I use?
```

**Reply using `reply`:**

```typescript
// The reply hint in the incoming message will show the exact call:
intercom({ action: "reply", message: "Use the stable v2 API." })
```

`reply` resolves the correct sender and message ID automatically. No need to reconstruct raw IDs.

## Escalation Types

| Type | What it means | How to respond |
|------|---------------|----------------|
| `need_decision` | Subagent is blocked and waiting for your answer. Has a 10-minute timeout. | Reply promptly with a clear decision. If you need more context, ask follow-up questions via `reply`. |
| `interview_request` | Subagent needs multiple structured answers in one blocking exchange. Has a 10-minute timeout. | Reply with plain JSON or a fenced `json` block using the provided `{ "responses": [...] }` shape. |
| `progress_update` | Subagent is sharing meaningful progress or a plan-changing discovery. Not blocking. | Read and acknowledge. No reply required unless you want to redirect. |

## Replying to Escalations

**When a subagent asks (need_decision):**

```typescript
// In the turn triggered by the incoming ask:
intercom({ action: "reply", message: "Use exponential backoff, max 3 retries." })
```

**When a subagent sends an interview request:**

Read the rendered questions and reply with the exact ids in JSON. `info` questions are context-only and do not need response entries:

```typescript
intercom({
  action: "reply",
  message: "```json\n{\n  \"responses\": [\n    { \"id\": \"api\", \"value\": \"Stable API\" },\n    { \"id\": \"constraints\", \"value\": \"Keep the public error shape unchanged.\" }\n  ]\n}\n```"
})
```

**If you receive multiple pending asks from different subagents:**

```typescript
intercom({ action: "pending" })
// → Shows all unresolved inbound asks with sender, elapsed time, and preview

intercom({ action: "reply", to: "subagent-worker-78f659a3-1", message: "Use the v2 API." })
```

## Important Note

Only sessions where `pi-subagents` supplied child bridge metadata get the `contact_supervisor` tool. Normal sessions use the regular `intercom` tool. If you see the formatted supervisor decision/progress update message, treat it as a `contact_supervisor` escalation.

---

*Load [PATTERNS.md](PATTERNS.md) for core intercom patterns. Load [CONSTRAINTS.md](CONSTRAINTS.md) for action limitations.*