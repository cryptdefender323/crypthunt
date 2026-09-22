# Release Process

Release automation lives in `.github/workflows/publish.yml`.  
Version math lives in `script/release-manifest.ts`.  
Agent runbook: `.agents/skills/publish/SKILL.md` and `/publish`.

## Version model

| Input | Behavior |
|---|---|
| `bump` = patch / minor / major | Bump from **root `package.json` `version`** (not `npm view …/latest`) |
| `version` override | Exact semver (e.g. `1.5.0-beta.1`); wins over bump |
| Prerelease | Dist tag = first pre-id (`1.0.0-beta.2` → tag `beta`); stable → npm `latest` |
| `dry_run` = true | Run test + typecheck + `release-metadata` only; **no** npm publish, platform publish, or release tail writes |

Platform package ids come from `build-binaries` `PLATFORMS` via `PLATFORM_PACKAGE_IDS` in `release-manifest.ts`.

## Release surfaces

| Layer | Surface | Proof |
|---|---|---|
| `omo pure components` | Core / MCP / shared skills inside the published tarball | `/get-unpublished-changes`, pre-publish review |
| `omo opencode` | `oh-my-open-pentest` + platform packages (`oh-my-open-pentest-<platform>`) | npm versions, GitHub release `v*` |
| `omo codex` | `lazycodex-ai`, Codex plugin metadata stamp, `code-yeongyu/lazycodex` marketplace | stamped metadata, npm, marketplace release when payload changed |

## Standard gates

Before / during publish:

1. Clean tree on `dev`, synced with `origin/dev`.
2. CI green on the commit being released (or accept risk explicitly).
3. Publish workflow: **test hard-fails** (no `continue-on-error` on `bun test`).
4. `bun run typecheck` in the workflow typecheck job.
5. User-facing docs cover new public behavior.
6. Known issues documented before release notes finalize.

Local equivalents:

```bash
bun test
bun run typecheck
bun run build          # full product
bun run build:dev      # adapter + assets only (daily)
```

CI bootstrap: `.github/actions/setup-omop` (Node 24, Bun 1.3.12, frozen install, bun + npm vendored caches, vendored LSP).  
Local vendored builds: `bun run build:vendored` runs git-bash-mcp / lsp-tools-mcp / lsp-daemon / codex-plugin **in parallel**.

## How to publish

```bash
gh workflow run publish.yml -f bump=patch -f dry_run=true

gh workflow run publish.yml -f bump=patch

```

Then: watch the run → verify npm / GH release / platforms / lazycodex → polish release notes → Discord announce.

Prefer the `/publish` command or publish skill so verification is not skipped.

## Post-fix repro verification

Race-condition and concurrency fixes must include reporter-verified repro confirmation before the originating issue is closed. CI green is necessary but not sufficient for this class of fix.

### Checklist

- [ ] Original issue reporter (or maintainer if reporter unavailable) re-runs the documented reproducer against the fix commit.
- [ ] Re-run result documented in the issue thread as "Repro retested: PASS/FAIL on commit <SHA>".
- [ ] If repro is environmental (specific OS, model, provider), repro is attempted in matching environment.
- [ ] If repro cannot be obtained, this is explicitly noted in the issue close comment AND recorded in release notes as "Fix unverified end-to-end".

### Rationale

Race-condition fixes that pass CI but were never retested against the original reproducer have historically regressed in production. Issues #1006, #3996, #3962 are recent examples where reporter confirmation was sparse. Issue #1012 (the prompt-async-gate motivating bug) had detailed reporter analysis that drove the eventual fix, and that level of post-fix verification should be the norm for this class.

## Related files

| Path | Role |
|---|---|
| `script/release-manifest.ts` | Version resolve + platform id list |
| `script/publish.ts` | Local multi-package publish helper |
| `.github/workflows/publish.yml` | Manual release workflow |
| `.github/workflows/publish-platform.yml` | Platform package matrix |
| `.github/actions/setup-omop` | Shared CI/release setup composite |
| `.agents/skills/publish/SKILL.md` | Agent publish runbook |
