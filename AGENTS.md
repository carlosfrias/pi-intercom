# AGENTS.md — pi-intercom (Workshop)

**Documentation home:** `../../personal-vault/01-Projects/pi-intercom-parallel-ask/`  
**Code workspace:** `./` (this directory)  
**Upstream:** `github.com/carlosfrias/pi-intercom` (to be forked)

## [S-TIGHT]

Workshop execution side of pi-intercom parallel ask fix. Contains forked code, tests, and build artifacts. All planning and documentation lives in personal-vault.

## Tech Stack

| Component | Technology | Entry Point |
|-----------|-----------|-------------|
| pi-intercom core | TypeScript | `src/index.ts` |
| Build | npm/Node.js | `package.json` |
| Tests | Jest / ts-jest | `tests/` |

## Directory Structure

```
pi-intercom/
├── AGENTS.md              ← YOU ARE HERE
├── src/                   # TypeScript source (forked)
├── tests/                 # Unit + integration tests
├── docs/                  # Build docs, API reference
└── package.json           # Dependencies, scripts
```

## Entry Points

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Test | `npm test` |
| Install locally | `npm link` or `pi install .` |

## Conventions

- **TypeScript:** Strict mode, ES2022+
- **Tests:** Jest with ts-jest, coverage required
- **Commits:** Conventional commits (feat:, fix:, docs:, test:, chore:)
- **Branches:** `main` (stable), `develop` (integration), `feature/*` (work)

## Must Never

- Commit `.env` files, auth tokens, or API keys
- Store documentation here (docs live in personal-vault)
- Modify upstream without forking first

## Cross-Reference

| Need | Go Here |
|------|---------|
| Issue definition, acceptance criteria | `../../personal-vault/01-Projects/pi-intercom-parallel-ask/README.md` |
| Current state, priorities | `../../personal-vault/01-Projects/pi-intercom-parallel-ask/FOCUS.md` |
| Plan | `../../personal-vault/01-Projects/pi-intercom-parallel-ask/1-PLAN.md` |
| Prompt history | `../../personal-vault/01-Projects/pi-intercom-parallel-ask/threads/pi-intercom-parallel-ask/0-THREAD.md` |

---

*Last updated: 2026-05-18*