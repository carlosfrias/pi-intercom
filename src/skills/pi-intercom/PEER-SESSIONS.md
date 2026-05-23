# PEER-SESSIONS: Spawning Visible Peer Sessions

**Section ID:** PEER-SESSIONS  
**Size:** ~2.5KB  
**LOD:** Medium  
**Purpose:** Spawn new pi sessions in visible side-by-side terminals for long-lived planner-worker or reference-scout workflows.

---

## [S-TIGHT]

Spawn a visible peer only when: no existing intercom-connected session fits the need, the work benefits from long-lived visibility, and the peer is in the same or a reference codebase. Prefer `cmux new-split right` over tmux. If neither is available, use normal intercom workflows.

---

## Spawn Decision Rule

Spawn a visible peer session only when **all** of these are true:

- No existing intercom-connected session already fits the need
- The work benefits from a long-lived visible peer session
- The peer session is either in the same codebase or an intentional reference codebase
- `cmux` is available, or `tmux` is available as an intentional fallback

If neither `cmux` nor `tmux` is available, skip this path and use normal `intercom` workflows.

Do not use spawned peers for:
- Unrelated repos
- Trivial questions
- Work you can finish cleanly in the current session

## Preferred: cmux Worker or Scout Session

**Same codebase:**
```bash
cmux new-split right
sleep 0.5
cmux send --surface right 'cd /path/to/current/repo && pi\n'
```

**Reference codebase:**
```bash
cmux new-split right
sleep 0.5
cmux send --surface right 'cd /path/to/reference/repo && pi\n'
```

## Optional Fallback: tmux Worker or Scout Session

Use tmux only when `cmux` is unavailable. Use a private socket so the session is isolated and observable.

**Same codebase:**
```bash
SOCKET_DIR=${TMPDIR:-/tmp}/pi-tmux-sockets
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/pi.sock"
SESSION=pi-worker
tmux -S "$SOCKET" new -d -s "$SESSION" -c "/path/to/current/repo" 'pi'
```

**Reference codebase:**
```bash
SOCKET_DIR=${TMPDIR:-/tmp}/pi-tmux-sockets
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/pi.sock"
SESSION=pi-reference-auth
tmux -S "$SOCKET" new -d -s "$SESSION" -c "/path/to/reference/repo" 'pi'
```

When you use `tmux`, tell the user how to watch it:
```bash
tmux -S "$SOCKET" attach -t "$SESSION"
```

## Name and Coordinate After Launch

After launch, name the new session clearly so it is easy to target:

```
/name worker
/name reference-auth
```

Then coordinate from the current session:

```typescript
intercom({
  action: "send",
  to: "worker",
  message: "Take task X. Ask if blocked."
})

intercom({
  action: "ask",
  to: "reference-auth",
  message: "How does this repo structure token refresh retries?"
})
```

---

*Load [PATTERNS.md](PATTERNS.md) for core intercom patterns. Load [WORKFLOWS.md](WORKFLOWS.md) for common coordination workflows.*