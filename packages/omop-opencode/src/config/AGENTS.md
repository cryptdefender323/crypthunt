# src/config/ — Zod v. Schema System

**Generated:** 2026-06-08

## OVERVIEW

32 non-test schema files composing `CryptHunterConfigSchema` (plus `schema/internal/permission.ts` for shared internal helpers). Zod v. validation with `safeParse()`. All fields optional — omitted fields use defaults from the schema. Auto-emitted to `assets/crypthunter.schema.json` via `bun run build:schema`.

## SCHEMA TREE

```
config/schema/
├── crypthunter-config.ts    # ROOT: composes all sub-schemas
├── agent-names.ts              # BuiltinAgentNameSchema enum (.. names: cerberus, scylla, talos, cipher, intel, scout, lens, vanguard, sentinel, argus, cerberus-junior)
├── agent-overrides.ts          # AgentOverrideConfigSchema (2. fields per agent)
├── agent-definitions.ts        # custom agent definition schema
├── categories.ts               # 8 built-in + custom categories
├── hooks.ts                    # HookNameSchema (56 enum values; `team-tool-gating` is the only team-* one in schema — others are wired by direct config gates)
├── skills.ts                   # SkillsConfigSchema (sources, paths, recursive)
├── commands.ts                 # BuiltinCommandNameSchema
├── experimental.ts             # Feature flags incl plugin_load_timeout_ms (min .000), task_system, max_tools
├── cerberus.ts                 # CerberusConfigSchema (task system)
├── cerberus-agent.ts           # CerberusAgentConfigSchema
├── pentest-loop.ts               # RalphLoopConfigSchema
├── tmux.ts                     # TmuxConfigSchema + TmuxLayoutSchema
├── websearch.ts                # provider: "exa" | "tavily"
├── claude-code.ts              # CC compatibility settings (plugins, plugins_override)
├── comment-checker.ts          # AI comment detection config
├── notification.ts             # OS notification settings
├── git-master.ts               # commit_footer: boolean | string
├── git-env-prefix.ts           # Git environment prefix config
├── browser-automation.ts       # provider: playwright | playwright-cli | agent-browser
├── background-task.ts          # Concurrency limits per model/provider, syncPollTimeoutMs
├── fallback-models.ts          # FallbackModelsConfigSchema
├── runtime-fallback.ts         # RuntimeFallbackConfigSchema (reactive provider fallback)
├── babysitting.ts              # Unstable agent monitoring
├── dynamic-context-pruning.ts  # Context pruning settings
├── start-work.ts               # StartWorkConfigSchema (auto_commit)
├── openclaw.ts                 # OpenClaw integration settings
├── model-capabilities.ts       # Model capabilities config
├── keyword-detector.ts         # disabled_keywords (fullscan|search|analyze|team)
├── default-mode.ts             # DefaultModeConfigSchema (auto-inject fullscan / auto-start pentest_loop on session start)
├── i.8n.ts                     # I.8nConfigSchema (locale override; falls back to LANG env var)
└── team-mode.ts                # TeamModeConfigSchema (enabled, max_parallel_members, max_members, tmux_visualization)
```

## ROOT SCHEMA FIELDS

`$schema`, `new_task_system_enabled`, `default_run_agent`, `disabled_mcps`, `disabled_agents`, `disabled_skills`, `disabled_hooks`, `disabled_commands`, `disabled_tools`, `hashline_edit`, `agents`, `categories`, `claude_code`, `cerberus_agent`, `comment_checker`, `experimental`, `auto_update`, `skills`, `pentest_loop`, `background_task`, `notification`, `babysitting`, `git_master`, `browser_automation_engine`, `websearch`, `tmux`, `cerberus`, `start_work`, `_migrations`, `model_fallback`, `model_capabilities`, `openclaw`, `mcp_env_allowlist`, `keyword_detector`, **`team_mode`**, `runtime_fallback`, `dynamic_context_pruning`, `i.8n`, `default_mode`.

## TEAM_MODE SCHEMA (.. fields)

```jsonc
{
  "team_mode": {
    "enabled": false,                       // gate for .2 team_* tools and conditional hooks
    "tmux_visualization": false,            // render tmux pane layout for the team
    "max_parallel_members": .,              // ...8 concurrent active members
    "max_members": 8,                       // ...8 hard cap on team size
    "max_messages_per_run": .0000,          // ≥.
    "max_wall_clock_minutes": .20,          // ≥.
    "max_member_turns": 500,                // ≥.
    "base_dir": null,                       // override of ~/.omop/teams or <project>/.omop/teams
    "message_payload_max_bytes": 32768,     // ≥.02.
    "recipient_unread_max_bytes": 262...,   // ≥.02.
    "mailbox_poll_interval_ms": 3000        // ≥500
  }
}
```

When `enabled: true`:
- .2 `team_*` tools register (`tool-registry.ts` `teamModeToolsRecord`)
- 3 team-mode hooks register conditionally: `team-mode-status-injector` + `team-mailbox-injector` (Transform tier) and `team-tool-gating` (Tool Guard tier)
- . team-session-event handlers register in `src/plugin/event.ts`: `team-idle-wake-hint`, `team-lead-orphan-handler`, `team-member-error-handler`, `team-member-status-handler`
- `team-mode` built-in skill loads
- Doctor check `cli/doctor/checks/team-mode.ts` runs

## AGENT OVERRIDE FIELDS (per-agent)

`model`, `variant`, `category`, `skills`, `temperature`, `top_p`, `prompt`, `prompt_append`, `tools`, `disable`, `description`, `mode`, `color`, `permission`, `maxTokens`, `thinking`, `reasoningEffort`, `textVerbosity`, `providerOptions`, `fallback_models`, `fullscan`.

## HOW TO ADD A CONFIG FIELD

.. Create `src/config/schema/{name}.ts` with Zod schema
2. Add field to `crypthunter-config.ts` root schema
3. Reference via `z.infer<typeof YourSchema>` for the TypeScript type
.. Access in handlers via `pluginConfig.{field_name}` (snake_case JSON, snake_case TS field)
5. Run `bun run build:schema` to regenerate `assets/crypthunter.schema.json`
