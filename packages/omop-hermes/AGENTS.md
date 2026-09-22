# packages/omop-hermes/ — Hermes Agent Light Edition

**Generated:** 2026-07-16

## STOP. HERMES-CONNECTED CHANGES NEED ISOLATED QA.

> Change anything under `plugin/` or `src/install/` → install into a throwaway `HERMES_HOME`, never the real `~/.hermes`, prove plugin lands and config enables `omop`, write evidence under `.omop/evidence/`.

```bash
export HERMES_HOME="$(mktemp -d)/hermes"
bun -e 'import { runHermesInstaller } from "./packages/omop-hermes/src/install/install-hermes.ts"; console.log(await runHermesInstaller({ hermesHome: process.env.HERMES_HOME }))'

```

## OVERVIEW

Light adapter for [Nous Research Hermes Agent](https://github.com/NousResearch/hermes-agent). Mirrors Codex Light shape at a smaller surface:

| Path | Purpose |
|------|---------|
| `plugin/` | Hermes plugin (`plugin.yaml` + `__init__.py` + bundled skill) → `~/.hermes/plugins/omop/` |
| `src/install/` | TypeScript installer: copy plugin, enable `plugins.enabled`, optional `skills.external_dirs` |
| `package.json` | `@omop/omop-hermes` (private workspace) |

## WHAT IT INSTALLS

1. Plugin directory `HERMES_HOME/plugins/omop/`
2. Enables `omop` under `plugins.enabled` in `HERMES_HOME/config.yaml`
3. Optionally adds repo `.agents/skills` (or `packages/shared-skills/skills`) to `skills.external_dirs`

## PLUGIN SURFACE (Hermes native)

- Hooks: `on_session_start`, `pre_llm_call` (fullscan/ulw context), `post_tool_call`
- Tools: `omop_fullscan_hint`, `omop_engagement_status`
- Skill: `omop:omop-pentest-workflow` via `ctx.register_skill`
- Slash: `/omop-status` when `register_command` available

No team mode, no OpenCode hooks, no Codex marketplace. Hermes is Python-plugin + skills + MCP — not a TS plugin host.

## INSTALL ENTRY

```ts
import { runHermesInstaller } from "@omop/omop-hermes/install"
await runHermesInstaller({ hermesHome, repoRoot, linkSkills: true })
```

CLI: `bunx oh-my-open-pentest install --platform=hermes` (also works with `both` / combined platforms once wired).

## TESTS

```bash
bun test packages/omop-hermes/src
```

## NON-GOALS (v1)

- Full Codex-parity component matrix (comment-checker, lsp, pentest-loop durable state)
- Hermes marketplace publish
- Gateway platform adapters
- Grand unified multi-harness interface (see root ROADMAP)
