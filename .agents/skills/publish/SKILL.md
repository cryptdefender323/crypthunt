---
name: publish
description: "Publish oh-my-open-pentest to npm via GitHub Actions workflow. Argument: <patch|minor|major>. Triggers: publish, release, deploy, finding submission."
---

You are the release manager for oh-my-open-pentest. Run the publish workflow end to end.

**Source of truth:** [docs/reference/release-process.md](../../../docs/reference/release-process.md)  
**Version math:** `script/release-manifest.ts` (base = root `package.json`, not npm latest)

## Release surfaces (all required)

| Layer | Surface | Proof |
|---|---|---|
| `omo pure components` | Core/MCP/shared skills in the published payload | `/get-unpublished-changes` + pre-publish review show layer impact |
| `omo opencode` | `oh-my-open-pentest` npm + platform packages | npm versions + GitHub release for the bump |
| `omo codex` | `lazycodex-ai`, Codex plugin metadata stamp, `code-yeongyu/lazycodex` | plugin metadata version, npm, marketplace release when payload changed |

Incomplete until **oh-my-open-pentest**, **lazycodex-ai**, and **code-yeongyu/lazycodex** (when applicable) are verified. Discord announce after release notes.

## Argument

Must have bump: `patch` | `minor` | `major`. Override version optional (e.g. `1.5.0-beta.1`).  
Missing bump → stop and ask. Confirm with user before dispatch.

## Checklist

1. **Todos** — track: confirm bump → clean tree → sync `dev` → dispatch → wait → verify npm/GH/lazycodex/platforms → release notes → Discord → report links.
2. **Preflight** — `git status` clean; on `dev`; `git pull --rebase origin dev` (and push if needed). Prefer green CI on latest `dev`.
3. **Optional dry run** — `gh workflow run publish.yml -f bump=<type> -f dry_run=true` then inspect `release-metadata` job (version from package.json). No npm write.
4. **Dispatch real release**
   ```bash
   gh workflow run publish.yml -f bump=<patch|minor|major>
   # optional: -f version=X.Y.Z-prerelease  -f skip_platform=false  -f publish_lazycodex=true
   ```
5. **Wait** — poll `gh run list --workflow=publish.yml` / `gh run watch <id>` until success.
6. **Verify**
   - npm: `npm view oh-my-open-pentest version` matches resolved version
   - GitHub release `v<version>` exists
   - Codex plugin metadata stamped; `lazycodex-ai` version when `publish_lazycodex`
   - platform packages for matrix (or skip if `skip_platform`)
   - `code-yeongyu/lazycodex` sync when stable + marketplace changed
7. **Release notes** — enhance GH release body (changelog + thanks); do not stop at auto notes alone.
8. **Discord** — announce after notes; failure after retry = report as workflow failure, still finish verification.
9. **Report** — version, npm links, GH release URL, run URL, dry_run used or not.

## Do not

- Bump version by reading npm latest by hand (workflow uses package.json + release-manifest).
- Claim done without codex / lazycodex / platform checks when those surfaces ship.
- Squash-merge release PRs; this repo uses merge commits into `dev`.
- Skip Discord without reporting the failure.

## Related

- Pre-publish gate: `/pre-submission-review` or pre-publish-review skill  
- Diff since last npm: `/get-unpublished-changes`  
- Build layers: `bun run build` / `build:dev` (see package.json)
