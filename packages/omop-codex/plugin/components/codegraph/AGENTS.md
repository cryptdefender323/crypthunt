# codegraph — Codex SessionStart CodeGraph bootstrap

**Generated:** 2026-07-15

## OVERVIEW

Workspace `@cerberuslabs/codex-codegraph`. On **SessionStart**, schedules background CodeGraph provision/bootstrap for the workspace (unless `codegraph.enabled === false` in OMO config).

## WIRING

| Layer | Path |
|-------|------|
| Component hooks | `hooks/hooks.json` → `node "${PLUGIN_ROOT}/dist/cli.js" hook session-start` |
| Aggregate | `plugin/.codex-plugin/plugin.json` → `./hooks/session-start-checking-codegraph-bootstrap.json` |
| CLI | `dist/cli.js` (`omop-codegraph` bin); also `hook session-start-worker`, serve |

## RUNTIME

- Node only (Codex spawns hooks with Node).
- Always exit 0 on skip/disable paths; detached worker for real work.
- Opt-out: config `codegraph.enabled: false`.
- `codegraph.watch_debounce_ms` is **not supported** on Codex harness (loader warns/rejects).

## COMMANDS

```bash
npm run build   # from component dir (or root plugin build-components)
bun test test/*.test.ts
node dist/cli.js hook session-start < /dev/null
```

## DON'TS

- Do not remove aggregate `session-start-checking-codegraph-bootstrap.json` without updating `plugin.json`.
- Do not block SessionStart with long sync work — keep detached worker pattern.
