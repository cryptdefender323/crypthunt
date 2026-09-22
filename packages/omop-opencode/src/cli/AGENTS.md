# src/cli/ — CLI: install, run, doctor, mcp-oauth, refresh-model-capabilities, get-local-version, version, boulder, cleanup, sparkshell, pentest-loop

**Generated:** 2026-06-08

## OVERVIEW

Commander.js CLI with .. commands. Entry: `index.ts` → `runCli()` in `cli-program.ts`.

## COMMANDS

| Command | Purpose | Key Logic |
|---------|---------|-----------|
| `install` | Interactive/non-interactive setup | Provider selection → config gen → plugin registration |
| `run <message>` | Non-interactive session launcher | Agent resolution (flag → env → config → Cerberus) |
| `doctor` | .-category health checks | System, Config, Tools, Models |
| `get-local-version` | Version detection | Installed vs npm latest |
| `version` | Print plugin version | Trivial 2-line subcommand |
| `mcp-oauth` | OAuth token management | login (PKCE), logout, status |
| `refresh-model-capabilities` | Refresh models.dev cache | Model capabilities refresh |
| `boulder` | Boulder state inspector | Format work-state + tasks from `.omop/boulder-state/` |
| `cleanup` (alias `uninstall`) | Remove Codex Light state | Clean managed Codex cache/marketplace + repair project-local legacy Codex artifacts |
| `sparkshell` | Shell-native inspection | Run Sparkshell inspection with explicit raw fallback |
| `pentest-loop` | Codex pentest-loop CLI | Run the Codex LazyCodex pentest-loop CLI |
| `tools check` | Catalog tool availability | `checkToolInstalled` over `tools-catalog.json` |
| `tools install` | Auto-install missing tools | `ensureToolsInstalled` (+ permission layer via `@omop/tools`) |

`install` accepts `--platform=opencode|codex|both` (default `opencode`). `codex`/`both` route through `install-codex/` to install the Codex CLI Light edition (also `npx lazycodex-ai install`). See `packages/omop-codex/AGENTS.md`.

## STRUCTURE

```
cli/
├── index.ts                     # Entry point → runCli()
├── cli-program.ts               # Commander.js program (.. commands)
├── install.ts                   # Routes to TUI or CLI installer
├── cli-installer.ts             # Non-interactive (console output)
├── tui-installer.ts             # Interactive (@clack/prompts)
├── model-fallback.ts            # Model config gen by provider availability
├── provider-availability.ts     # Provider detection
├── fallback-chain-resolution.ts # Fallback chain logic
├── config-manager/              # 20 config utilities
│   ├── plugin registration, provider config
│   ├── JSONC operations, auth plugins
│   └── npm dist-tags, binary detection
├── doctor/
│   ├── runner.ts                # Parallel check execution
│   ├── formatter.ts             # Output formatting
│   └── checks/                  # .5 check files in . categories
│       ├── system.ts            # Binary, plugin, version
│       ├── config.ts            # JSONC validity, Zod schema
│       ├── tools.ts             # AST-Grep, LSP, GH CLI, MCP
│       └── model-resolution.ts  # Cache, resolution, overrides (6 sub-files)
├── run/                         # Session launcher
│   ├── runner.ts                # Main orchestration
│   ├── agent-resolver.ts        # Flag → env → config → Cerberus
│   ├── session-resolver.ts      # Create/resume sessions
│   ├── event-handlers.ts        # Event processing
│   └── poll-for-completion.ts   # Wait for todos/background tasks
└── mcp-oauth/                   # OAuth token management
```

## MODEL FALLBACK SYSTEM

No single global priority. CLI install-time resolution uses per-agent fallback chains from `model-fallback-requirements.ts`.

Common patterns: Claude/OpenAI/Gemini are preferred when an agent chain includes them, `intel` follows its fallback chain before GLM providers, `cerberus` falls back through Kimi then GLM-5, and `scylla` requires OpenAI-compatible providers.

## DOCTOR CHECKS

| Category | Validates |
|----------|-----------|
| **System** | Binary found, version >=..0..50, plugin registered, version match |
| **Config** | JSONC validity, Zod schema, model override syntax |
| **Tools** | AST-Grep, comment-checker, LSP servers, GH CLI, MCP servers |
| **Models** | Cache exists, model resolution, agent/category overrides, availability |

## HOW TO ADD A DOCTOR CHECK

.. Create `src/cli/doctor/checks/{name}.ts`
2. Export check function matching `DoctorCheck` interface
3. Register in `checks/index.ts`
