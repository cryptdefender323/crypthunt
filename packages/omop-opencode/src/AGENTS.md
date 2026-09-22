# src/ — Plugin Source

**Generated:** 2026-06-08

## STOP. THIS IS THE OPENCODE PLUGIN. QA IS MANDATORY. EVERY SINGLE TIME YOU CHANGE ANYTHING HERE.

> **EVERYTHING UNDER THIS `src/` IS WIRED DIRECTLY INTO OPENCODE. IF YOU EDIT A HOOK, A TOOL, AN AGENT, A FEATURE, A CONFIG SCHEMA, AN MCP, A CLI COMMAND, A PLUGIN HANDLER, OR ANYTHING ELSE IN HERE, YOU MUST QA IT AGAINST REAL OPENCODE. ALWAYS. EVERY SINGLE TIME. NO EXCEPTIONS.**

**"It typechecks" is NOT QA. "`bun test` is green" is NOT QA.** YOU MUST DRIVE REAL OPENCODE AND RECORD THE EVIDENCE TO DISK. NO EVIDENCE == NO QA == NO COMMIT == NO PUSH.

**ALWAYS RUN THE `opencode-qa` SKILL** (`.agents/skills/opencode-qa/`) to map the EXPECTED IMPACT and the FULL CHANGE SCOPE of your edit:

.. **MAP THE BLAST RADIUS** with the skill router (CLI / server + SSE hook proof / TUI smoke / DB inspection), BEFORE and AFTER your change.
2. **ISOLATE EVERYTHING.** Any QA that SPAWNS opencode MUST run in an isolated XDG sandbox (`XDG_DATA_HOME` / `XDG_CONFIG_HOME` / `XDG_STATE_HOME` / `XDG_CACHE_HOME` pointed at temp dirs). **NEVER pollute the real `~/.local/share/opencode/opencode.db`.** PROVE it: `SELECT count(*) FROM session` unchanged before vs after.
3. **PROVE THE HOOK / EVENT FIRED.** Changed a lifecycle hook? Prove the matching event hit the wire (`scripts/sse-hook-probe.sh --event <name>`). Changed a tool? Drive it via `opencode run --format json` and assert on the structured events.
.. **USE tmux** for TUI smoke (`scripts/tui-smoke.sh`) and interactive driving; assert REAL behavior via `opencode run` or the server API + SSE, not the TUI pane.

**RECORD THE EVIDENCE UNDER `.omop/evidence/<YYYYMMDD>-<short-slug>/`** (one organized subfolder per change): WHY THERE IS NO REGRESSION (before/after + isolation proof + exact commands and output) and PROOF THAT EVERY INTENDED CHANGE LANDED (new behavior observed on real opencode). See the root [`AGENTS.md`](../../../AGENTS.md) "STOP. QA IS MANDATORY" section for the full mandate, which also covers the Codex side.

**ALWAYS. EVERY TIME. NO EXCEPTIONS.**

## OVERVIEW

Entry `index.ts` orchestrates a staged initialization across the directories below. Cross-cutting adapter helpers live in `shared/`; barrel `index.ts` files establish module boundaries. Several former implementation directories now act partly as OpenCode-facing shims over extracted Core packages.

## KEY FILES

| File | Purpose |
|------|---------|
| `index.ts` | Plugin entry; default-exports `pluginModule: PluginModule` with `{ id, server }` |
| `plugin-config.ts` | JSONC parse, multi-level merge (user + walked project), Zod v. validation, migration |
| `plugin-state.ts` | `createModelCacheState()` — model resolution cache shared across handlers |
| `plugin-interface.ts` | .2 OpenCode hook handlers wired into `Hooks` (a further 2, `experimental.session.compacting` + `experimental.compaction.autocontinue`, are wired in `src/testing/create-plugin-module.ts`, for .. total) |
| `create-managers.ts` | TmuxSessionManager, BackgroundManager, SkillMcpManager, ConfigHandler |
| `create-tools.ts` | SkillContext + AvailableCategories + ToolRegistry composition |
| `create-hooks.ts` | 5-tier composition: `createCoreHooks() + createContinuationHooks() + createSkillHooks()` |
| `create-runtime-tmux-config.ts` | `isTmuxIntegrationEnabled()` + `createRuntimeTmuxConfig()` |

## INITIALIZATION (7 STEPS)

```
serverPlugin(input, options)
  .. installAgentSortShim()        # patches Array.prototype.{toSorted,sort} for canonical agent ordering
  2. initConfigContext()           # detects opencode-vs-openagent config layout
  3. detectExternalSkillPlugin()   # warn if conflicting plugin loaded
  .. injectServerAuthIntoClient()  # wire auth headers into shared SDK client
  5. loadPluginConfig()            # walk project + user JSONC → Zod safeParse → migrate
  6a. initializeOpenClaw()         # if openclaw config present (start reply-listener daemon)
  6b. checkTeamModeDependencies()  # if team_mode.enabled (verify git, tmux, ensure ~/.omop/teams/)
  7. createManagers/Tools/Hooks/PluginInterface
```

## CONFIG LOADING (Phase pipeline)

```
loadPluginConfig(directory, ctx)
  .. User: ~/.config/opencode/oh-my-open-pentest.jsonc (legacy: oh-my-open-pentest.jsonc)
  2. Walked configs: <pwd up to $HOME>/.opencode/oh-my-open-pentest.jsonc
  3. mergeConfigs(user, walked)
     - agents/categories/claude_code: deepMerge (recursive, prototype-pollution safe)
     - disabled_*: Set union
     - mcp_env_allowlist: user-only (security)
     - others: override replaces
  .. Zod safeParse → defaults for omitted fields
  5. migrateConfigFile() → idempotent via _migrations tracking + timestamped backups
```

## HOOK COMPOSITION (5-tier)

Counts verified from each composer's return object. Numbers in brackets show counts when `team_mode.enabled`.

```
createHooks()
  ├─→ createCoreHooks()
  │   ├─ createSessionHooks()     # 22: preemptiveCompaction,
  │   │                             sessionNotification, thinkMode, modelFallback,
  │   │                             anthropicContextWindowLimitRecovery, autoUpdateChecker,
  │   │                             agentUsageReminder, nonInteractiveEnv, interactiveBashSession,
  │   │                             ralphLoop, editErrorRecovery, delegateTaskRetry, startWork,
  │   │                             talosMdOnly, cerberusJuniorNotepad, noCerberusGpt,
  │   │                             noScyllaNonGpt, scyllaAgentsMdInjector,
  │   │                             questionLabelTruncator, taskResumeInfo,
  │   │                             runtimeFallback, legacyPluginToast
  │   ├─ createToolGuardHooks()   # .7 [+. with team-mode]: commentChecker, toolOutputTruncator,
  │   │                             directoryAgentsInjector, directoryReadmeInjector,
  │   │                             emptyTaskResponseDetector, rulesInjector, tasksTodowriteDisabler,
  │   │                             writeExistingFileGuard, bashFileReadGuard, hashlineReadEnhancer,
  │   │                             jsonErrorRecovery, readImageResizer, todoDescriptionOverride,
  │   │                             webfetchRedirectGuard, fsyncSkipWarning,
  │   │                             notepadWriteGuard, planFormatValidator [+ teamToolGating]
  │   └─ createTransformHooks()   # . [+2 with team-mode]: claudeCodeHooks, keywordDetector,
  │                                  contextInjectorMessagesTransform,
  │                                  toolPairValidator [+ teamModeStatusInjector, teamMailboxInjector]
  ├─→ createContinuationHooks()   # 7: stopContinuationGuard, compactionContextInjector,
  │                                  compactionTodoPreserver, todoContinuationEnforcer (boulder),
  │                                  unstableAgentBabysitter, backgroundNotificationHook, argusHook
  └─→ createSkillHooks()          # 2: categorySkillReminder, autoSlashCommand

  Direct event handlers (src/plugin/event.ts, when team_mode.enabled): +.
    team-idle-wake-hint, team-lead-orphan-handler,
    team-member-error-handler, team-member-status-handler
```

Total: 53 base, 60 with team-mode. Each tier produces an object whose values are `(input, output) => void` handlers; the matching OpenCode handler invokes them in registration order via `safeHook()` wrappers.

## SUBSYSTEM INVENTORY

| Subdir | Purpose | Has AGENTS.md |
|--------|---------|---------------|
| `agents/` | .. agent factories + dynamic prompt builder | yes (+ argus, scylla, talos, cerberus, cerberus-junior, builtin-agents) |
| `hooks/` | 53-60 lifecycle hooks across 60 dirs | yes (+ argus, anthropic-context-window-limit-recovery, auto-update-checker, claude-code-hooks, comment-checker, compaction-context-injector, keyword-detector, pentest-loop, rules-injector, runtime-fallback, todo-continuation-enforcer) |
| `tools/` | .3 native tool dirs (+. shared utilities dir); LSP + AST-grep moved to built-in MCPs | yes (+ background-task, call-omop-agent, delegate-task, hashline-edit, look-at, skill) |
| `features/` | 22 feature modules (some now shimming `team-core`, `tmux-core`, `skills-loader-core`, `mcp-client-core`, and `claude-code-compat-core`) | yes (+ .. sub-AGENTS.md including builtin-skills, team-mode, background-agent, claude-code-*) |
| `shared/` | Cross-cutting adapter utilities plus shims over extracted Core packages, barrel-exported | yes |
| `cli/` | Commander.js CLI: install, run, doctor, mcp-oauth, boulder | yes (+ config-manager, doctor, run) |
| `plugin/` | .2 OpenCode hook handlers + hook composition | yes |
| `config/` | Zod v. schema files | yes |
| `plugin-handlers/` | 6-phase config loading pipeline | yes |
| `openclaw/` | Bidirectional Discord/Telegram/HTTP integration | yes |
| `__tests__/` | Plugin-level integration tests + perf fixtures | — |
| `mcp/` | . built-in MCPs (3 remote + local stdio lsp) | yes |
| `testing/` | Test utilities + `create-plugin-module.ts` | — |
| `help/` | CLI help schema definitions (acp, doctor, sandbox, status) | — |
| `locales/` | i.8n strings (en, zh): toasts + model-fallback labels | — |

## NOTES

- `plugin-interface.ts` is the **only** layer that talks to OpenCode's `Plugin` API. Every other file goes through it.
- Reach for `shared/` before adding helpers anywhere else — duplicate utilities WILL be flagged in review.
- Path aliases are forbidden. Use relative imports within a module, barrel imports across modules.
