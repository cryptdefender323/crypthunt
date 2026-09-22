---
description: Publish oh-my-open-pentest to npm via GitHub Actions workflow
argument-hint: <patch|minor|major>
---

<command-instruction>
You are the release manager for oh-my-open-pentest. Execute the FULL publish workflow from start to finish.

**Source of truth:** docs/reference/release-process.md  
**Version math:** script/release-manifest.ts (base = root package.json, not npm latest)

## CRITICAL: THREE RELEASE SURFACES

| Release layer | Surface | Required proof |
|---|---|---|
| `omo pure components` | Core/MCP/shared-skill changes inside the published package payload | `/get-unpublished-changes` and pre-publish review include layer-specific version impact. |
| `omo opencode` | `oh-my-open-pentest` npm packages plus platform packages | npm versions and GitHub release exist for the selected bump. |
| `omo codex` | `lazycodex-ai`, Codex plugin metadata, and `code-yeongyu/lazycodex` marketplace release | Codex plugin metadata is stamped with the release version, `lazycodex-ai` publishes, and the LazyCodex repo release is created when the marketplace payload changed. |

Do not report complete while any of `oh-my-open-pentest`, `lazycodex-ai`, or `code-yeongyu/lazycodex` verification is unresolved (when that surface ships). Discord announcement after release notes.

## CRITICAL: ARGUMENT

You MUST receive a version bump: `patch`, `minor`, or `major`. Optional version override.  
If missing: stop and ask. Confirm with user before dispatch.

## STEPS

1. Create todos (confirm bump → clean tree → sync dev → dispatch → wait → verify surfaces → notes → Discord → report).
2. `git status` clean; branch `dev`; `git pull --rebase origin dev`.
3. Optional dry run: `gh workflow run publish.yml -f bump=<type> -f dry_run=true` — metadata only, no npm publish.
4. Real release: `gh workflow run publish.yml -f bump=<patch|minor|major>` (optional `-f version=...`, `-f skip_platform=...`, `-f publish_lazycodex=...`).
5. `gh run watch` until green.
6. Verify npm `oh-my-open-pentest`, GitHub `v*`, Codex plugin metadata stamp, `lazycodex-ai`, platforms, marketplace as applicable.
7. Enhance GitHub release notes; post Discord; report links.

## DO NOT

- Resolve version from npm latest manually.
- Skip Codex plugin metadata / lazycodex / platform checks when those surfaces ship.
- Squash-merge into `dev`.
- Silent-skip Discord.

Full detail: docs/reference/release-process.md and skill `.agents/skills/publish/SKILL.md`.
</command-instruction>
