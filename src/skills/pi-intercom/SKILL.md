---
name: pi-intercom
description: |
  Streamline session-to-session coordination with pi-intercom. Send messages,
  delegate tasks, and coordinate work across multiple pi sessions on the same
  machine. Use for planner-worker workflows, cross-session context sharing,
  and real-time collaboration between sessions.
version: 2.0
author: carlos
---

# Pi Intercom Skill

**Size:** ~18KB total across 7 files. **Low-capacity models:** Do NOT load all sections. Use LOD directives below.

---

## [S-TIGHT]

Decomposed skill. Pi-intercom enables 1:1 messaging between pi sessions on the same machine. Actions: `send` (fire-and-forget), `ask` (blocking, 10-min timeout), `reply` (threaded response), `pending`, `list`, `status`. Load only sections relevant to your task. All sections live in this directory.

---

## Section Table

| Section ID | File | LOD | Size | What It Covers | Load When |
|------------|------|-----|------|----------------|-----------|
| CORE | [CORE.md](CORE.md) | Low | ~2KB | Philosophy, action reference table, quick examples | Always (first) |
| PATTERNS | [PATTERNS.md](PATTERNS.md) | Medium | ~3.5KB | Patterns 1-5: planner-worker, status check, reply, broadcast, attachments | Sending/receiving messages between sessions |
| ESCALATION | [ESCALATION.md](ESCALATION.md) | Medium | ~2.5KB | Pattern 6: subagent escalation handling, interview requests, decision routing | Handling `contact_supervisor` messages from delegated children |
| PEER-SESSIONS | [PEER-SESSIONS.md](PEER-SESSIONS.md) | Medium | ~2.5KB | Spawning visible peer sessions (cmux, tmux), spawn decision rule | Creating a new side-by-side session for long-lived work |
| CONSTRAINTS | [CONSTRAINTS.md](CONSTRAINTS.md) | Low | ~2.5KB | Action limitations, common errors, troubleshooting | Debugging delivery failures or `ask` timeout issues |
| WORKFLOWS | [WORKFLOWS.md](WORKFLOWS.md) | Medium | ~3KB | Best practices, common workflow patterns (research→impl, pair debug, progress, checkpoints) | Designing a multi-session coordination workflow |

---

## Load Directive

| Model Tier | Max Context | Load These Only |
|------------|-------------|-----------------|
| **Low local** (<4K ctx) | CORE.md only, max 1 additional section for the specific task | |
| **Medium local** (~8K ctx) | CORE.md + up to 2 task-relevant sections | |
| **High local** (~32K ctx) | CORE.md + up to 4 task-relevant sections | |
| **Cloud** (>32K ctx) | Full skill if needed. Prefer targeted sections. | |

---

## Quick Task Routing

| Need | Load |
|------|------|
| "I need to send a message to another session" | CORE.md → PATTERNS.md |
| "I need to handle a subagent escalation" | CORE.md → ESCALATION.md |
| "I need to spawn a worker session" | CORE.md → PEER-SESSIONS.md |
| "I need to debug a delivery failure" | CORE.md → CONSTRAINTS.md |
| "I need to design a multi-session workflow" | CORE.md → WORKFLOWS.md |
| "I need to reply to an ask" | CORE.md (action table) |
| "I need to see who's connected" | CORE.md (quick example) |
| "I need the full API reference" | CORE.md → CONSTRAINTS.md |
| "Low-capacity model doing simple send" | CORE.md only |

---

## Cross-References

Each section file links to related sections at the bottom. The dependency graph:

```
CORE.md (always loaded)
  ├── PATTERNS.md
  ├── ESCALATION.md
  ├── PEER-SESSIONS.md
  ├── CONSTRAINTS.md
  └── WORKFLOWS.md
```

No section requires loading more than CORE.md + itself to be actionable.

---

*This manifest is the only file loaded by default. All other sections are demand-loaded per the directive above.*

See [MANIFEST.json](MANIFEST.json) for programmatic section loading by task type.