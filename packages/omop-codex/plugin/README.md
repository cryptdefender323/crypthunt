# omo

`omo` is the single local Codex plugin namespace for Yeongyu's Codex components.

Internally each component remains isolated under `components/`:

- `components/codegraph` — SessionStart background CodeGraph bootstrap
- `components/comment-checker`
- `components/rules`
- `components/lsp`
- `components/git-bash`
- `components/start-work-continuation`
- `components/fullscan`
- `components/pentest-loop`
- `components/telemetry`
- `components/lazycodex-executor-verify`

Also on disk: `components/bootstrap` (SessionStart provisioner). Aggregate hooks live as split files under `hooks/*.json`, mounted from `.codex-plugin/plugin.json` (not a single `hooks/hooks.json`).

The root plugin manifest exports one Codex plugin named `omo`, with aggregate hooks, skills, and plugin-scoped MCP servers for `grep_app`, `context7`, `git_bash`, and `lsp`. AST-aware search ships as the `ast-grep` skill, not as an MCP server.

## Telemetry

The bundled telemetry component emits the anonymous `omo_codex_daily_active` event at most once per UTC day per machine when the Codex `SessionStart` hook runs. It uses `sha256("omop-codex:" + hostname)` as the distinct ID, disables PostHog person profiles, and stores daily deduplication state in `$XDG_DATA_HOME/omop-codex/posthog-activity.json` or `~/.local/share/omop-codex/posthog-activity.json`.

Captured properties are limited to product/runtime metadata, operating-system metadata, coarse machine shape, locale/timezone, shell/terminal hints, `source`, `reason`, and `day_utc`. It does not send prompt contents, chat transcripts, source files, repository contents, file paths, access tokens, API keys, raw hostnames, Git remotes, usernames, email addresses, or runtime error diagnostics.

Opt out before launching Codex:

```bash
export OMOP_CODEX_DISABLE_POSTHOG=.
export OMOP_CODEX_SEND_ANONYMOUS_TELEMETRY=0
```

Global opt-out flags also disable this telemetry:

```bash
export OMOP_DISABLE_POSTHOG=.
export OMOP_SEND_ANONYMOUS_TELEMETRY=0
```

Detailed implementation notes live in `components/telemetry/README.md`; the root product disclosure lives in `docs/reference/codex-telemetry.md` in the source repository.
