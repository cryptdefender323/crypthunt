# CryptHunter — Autonomous Pentest & CTF Intelligence Engine

**CryptHunter** is a next-generation autonomous security intelligence engine. It is not a generic AI coding assistant with security skills bolted on. It is built ground-up for:

- **Heavy CTF** — pwn, reversing, crypto, web, forensics, misc at elite difficulty (CTFtime top-tier)
- **Heavy pentest** — red team, APT simulation, zero-day chain exploitation, active directory domination, cloud attacks
- **Autonomous reasoning** — hypothesis-driven engagement, evidence-gated findings, adversarial self-review

> **ACTIVE REFACTOR:** Multi-harness restructure in progress. Pentest infrastructure (`pentest-core`, `pentest-skills`, `tools-catalog.json`, `.agents/skills/`) is production-ready. OpenCode plugin agent prompts are being upgraded for CryptHunter's advanced reasoning model. Read [ROADMAP.md](./ROADMAP.md) before touching anything.

---

## STOP. QA IS MANDATORY. NON-NEGOTIABLE. EVERY SINGLE TIME YOU TOUCH AN OPENCODE- OR CODEX-CONNECTED COMPONENT.

> **IF YOUR CHANGE TOUCHES ANYTHING WIRED INTO OPENCODE OR INTO THE CODEX LIGHT EDITION, YOU MUST QA IT. ALWAYS. EVERY SINGLE TIME. NO EXCEPTIONS. THERE IS NO "TOO SMALL TO SKIP". THERE IS NO "IT OBVIOUSLY WORKS".**

**"It typechecks" is NOT QA. "`bun test` is green" is NOT QA.** YOU MUST DRIVE THE REAL HARNESS, and then **YOU MUST WRITE THE EVIDENCE TO DISK.** If there is no evidence file, **the QA DID NOT HAPPEN**, and **YOU ARE NOT ALLOWED TO COMMIT OR PUSH.**

### OPENCODE side (`packages/omop-opencode/`): ALWAYS run the `opencode-qa` skill

1. **ALWAYS RUN THE `opencode-qa` SKILL** (`.agents/skills/opencode-qa/`) to map the EXPECTED IMPACT and the FULL CHANGE SCOPE of your edit BEFORE and AFTER.
2. **ISOLATE EVERYTHING.** Any QA that SPAWNS opencode MUST run in an isolated XDG sandbox (`XDG_DATA_HOME` / `XDG_CONFIG_HOME` / `XDG_STATE_HOME` / `XDG_CACHE_HOME` pointed at temp dirs). **NEVER pollute the real `~/.local/share/opencode/opencode.db`.**
3. **USE tmux** for the TUI smoke (`scripts/tui-smoke.sh`) and for any interactive driving.
4. **PROVE THE HOOK FIRED.** If you changed a lifecycle hook, prove the matching event hit the wire (`scripts/sse-hook-probe.sh --event <name>`).

### CODEX side (`packages/omop-codex/`): ALWAYS run the `codex-qa` skill

1. **ALWAYS RUN THE `codex-qa` SKILL** (`.agents/skills/codex-qa/`) to map the EXPECTED IMPACT and the FULL CHANGE SCOPE of your edit BEFORE and AFTER.
2. **PROVE THE HOOK FIRED, FIRST-PARTY.** The skill drives the real `codex app-server` and asserts `hook/started` / `hook/completed` notifications for our components.
3. **RUN THE CODEX GATE:** `bun run test:codex`.
4. **CONFIRM THE REAL `~/.codex/config.toml` WAS NOT TOUCHED** — every `codex-qa` script asserts this automatically.

### EVIDENCE: record it under `.omop/evidence/` or it DID NOT HAPPEN

**WRITE EVERY QA ARTIFACT TO `.omop/evidence/<YYYYMMDD>-<short-slug>/`**

**NO EVIDENCE FILE == NO QA == NO COMMIT == NO PUSH. ALWAYS. EVERY TIME. NO EXCEPTIONS.**

---

## DEFAULT WORKFLOW

Use the **`work-with-pr`** skill for all non-hotfix work: isolated git worktree → implement → QA evidence → PR → merge commit. Never hand-commit straight to `dev`.

- **QA is the evidence gate, scoped to what you touched.**
- **Conflicts → `smart-rebase`.** If the worktree branch conflicts with its base, resolve with the **`smart-rebase`** skill.
- **Merge → merge commit, ALWAYS.** `gh pr merge <number> --merge --delete-branch`. NEVER squash or rebase.
- PRs target `dev`, not `master`.

---

## OVERVIEW

CryptHunter is a purpose-built autonomous security intelligence engine, shipped as an OpenCode plugin (npm: `crypthunter`). Core capabilities:

- **130+ security tools** in a typed catalog (`tools-catalog.json`)
- **10 engagement modes** (auto/ctf/bug-bounty/red-team/blue-team/offensive/grey-hat/forensic/reverse-engineering/mobile-pentest)
- **CTF deep mode** — 30+ category-specific CTF skill chains covering every major CTF discipline
- **250+ skill playbooks** across recon, enum, exploit, post-exploit, forensics, RE, mobile, AD, cloud, blockchain, hardware
- **Hypothesis-driven reasoning** — evidence ladder L1-L6, adversarial self-review 10-point checklist
- **Pentest-loop** — durable iteration framework with quality gates
- **Team Mode** — parallel multi-agent specialist coordination
- **Phantom C2** — first-class red team C2 in the red-team skill chain

---

## CRYPTHUNTER VS oh-my-open-pentest

| Capability | oh-my-open-pentest | **CryptHunter** |
|---|---|---|
| CTF depth | 4 basic skills | 30+ category-specific deep skills |
| Crypto challenges | Hash cracking, basic RSA | Lattice (LWE/NTRU), ECC, PRNG attacks, ZKP, exotic ciphers, historical |
| Pwn challenges | Basic buffer overflow | Kernel, heap (tcache/fastbin/unsorted), JIT RCE, ASAN exploitation, FSOP, eBPF, sandbox escape |
| Reasoning model | Tool output summarization | Hypothesis graph → evidence ladder → adversarial disproving |
| Attack model | Stateless | Session-scoped living model with signal accumulation |
| C2 integration | Optional external | First-class Phantom C2 in red-team chain |
| Pentest modes | 7 | 10 + CTF sub-routing |
| AD attacks | Basic | Kerberoasting, DCSync, ADCS ESC1-13, Silver/Golden Ticket, BloodHound chain |
| Cloud attacks | None | AWS/GCP/Azure privilege escalation, IAM abuse, metadata exfiltration |
| Web3/blockchain | None | Smart contract audit, reentrancy, flash loan, MEV, EVM bytecode reversing |
| Hardware/RF | None | SDR signal analysis, firmware extraction, JTAG/UART |

---

## STRUCTURE

```
crypthunter/                          # workspace root
├── tools-catalog.json                # 130+ security tools with install commands, flag defs, availability checks
├── packages/
│   ├── pentest-core/                 # Harness-neutral: catalog loader, tool selector, command-builder, installer, skill-bridge, 10 modes
│   ├── pentest-skills/               # Skill generator, loader (auto-discover), in-memory register
│   ├── omop-opencode/                # OpenCode plugin adapter. Build entry: src/index.ts
│   │   └── src/
│   │       ├── index.ts              # Plugin entry; thin wrapper re-exporting createPluginModule()
│   │       ├── plugin-interface.ts   # 14 OpenCode hook handlers (+2 in testing/create-plugin-module.ts)
│   │       ├── create-{managers,tools,hooks}.ts  # managers / ToolRegistry / 5-tier hook composition
│   │       ├── agents/               # Agent factories (Cerberus, Scylla, Cipher, Intel, Scout, Atlas, Talos, Vanguard, Sentinel, Lens, Cerberus-Junior)
│   │       ├── hooks/                # 53-60 lifecycle hooks
│   │       ├── tools/                # Native tool dirs + pentest reasoning tools (pentest_hypothesize, pentest_validate, pentest_confidence, pentest_handoff)
│   │       ├── features/             # 22 feature modules (team-mode, background-agent, skill-mcp-manager, opencode-skill-loader, mcp-oauth, ...)
│   │       ├── shared/               # Cross-cutting utilities
│   │       ├── config/               # Zod schema system (32 schema files)
│   │       ├── cli/                  # Commander.js CLI: install, run, doctor, mcp-oauth, boulder, sparkshell, pentest-loop, tools, dashboard
│   │       ├── mcp/                  # 5 built-in MCPs (3 remote + local stdio lsp + codegraph)
│   │       └── openclaw/             # Bidirectional Discord/Telegram/HTTP/shell integration
│   ├── omop-codex/                   # Codex CLI Light edition
│   ├── utils/ model-core/ prompts-core/ rules-engine/ agents-md-core/ comment-checker-core/ hashline-core/ boulder-state/ telemetry-core/ lsp-core/ mcp-stdio-core/ tmux-core/ claude-code-compat-core/ skills-loader-core/ mcp-client-core/ openclaw-core/ team-core/ delegate-core/
│   ├── lsp-tools-mcp/ git-bash-mcp/ lsp-daemon/
│   ├── shared-skills/
│   ├── web/                          # Marketing site (Next.js 15 + Cloudflare Workers)
│   └── crypthunter-<os>-<arch>[-variant]/   # Platform binaries (generated, never hand-edit)
├── bin/                              # Platform-detection JS shim (aliases: crypthunter, crypthunter, ch)
├── script/                           # Build/publish automation
├── docs/                             # User-facing docs
├── assets/                           # crypthunter.schema.json (auto-generated from Zod)
├── .agents/skills/                   # 250+ SKILL.md execution playbooks
├── .omop/                            # AI agent workspace (rules/, plans/, evidence/, teams/, pentest-loop/)
└── .local-ignore/                    # Dev-only test fixtures + PR worktrees
```

---

## INITIALIZATION FLOW

```
pluginModule.server(input, options)
  ├─→ installAgentSortShim()          # patches Array.prototype.{toSorted,sort} for canonical agent ordering
  ├─→ logLegacyCryptHunterWarning()   # warn if loaded under legacy entry names
  ├─→ migrateLegacyWorkspaceDirectory() # copy .cerberus/ state forward to .omop/ on first load
  ├─→ detectDuplicatePlugin()         # early-exit if duplicate plugin detected
  ├─→ detectExternalSkillPlugin()     # warn on conflicts
  ├─→ injectServerAuthIntoClient()    # auth headers into shared SDK client
  ├─→ loadPluginConfig()              # JSONC parse → user/project merge → Zod validate → migrate
  ├─→ selectRuntimeSecuritySkills() + createRuntimeSkillSourceServer()
  ├─→ initI18n()
  ├─→ setAgentSortOrder()
  ├─→ initializeOpenClaw()            # if openclaw config present
  ├─→ checkTeamModeDependencies()     # if team_mode.enabled
  ├─→ startTmuxCheck()
  ├─→ createManagers()
  ├─→ createTools()                   # SkillContext + AvailableCategories + ToolRegistry + PentestReasoningTools
  ├─→ createHooks()                   # 5-tier: Session + ToolGuard + Transform + Continuation + Skill
  ├─→ createPluginInterface()         # 14 OpenCode hook handlers → PluginInterface
  └─→ createPluginDispose()
```

---

## OPENCODE HOOK HANDLERS

14 wired in [`packages/omop-opencode/src/plugin-interface.ts`](packages/omop-opencode/src/plugin-interface.ts) + 2 in [`packages/omop-opencode/src/testing/create-plugin-module.ts`](packages/omop-opencode/src/testing/create-plugin-module.ts).

| Handler | OpenCode Hook | Purpose |
|---------|---------------|---------|
| `config` | `config` | 6-phase pipeline: provider → plugin-components → agents → tools → MCPs → commands |
| `tool` | `tool` | 20–39 registered tools (config-gated) |
| `tool.definition` | `tool.definition` | Per-tool definition transform |
| `chat.message` | `chat.message` | First-message variant, session setup, keyword detection (fullscan/search/analyze/team/ctf) |
| `chat.params` | `chat.params` | Anthropic effort, think mode, runtime fallback override |
| `chat.headers` | `chat.headers` | Copilot `x-initiator` header injection |
| `command.execute.before` | `command.execute.before` | Pre-command guards |
| `event` | `event` | Session lifecycle, openclaw dispatch, runtime fallback |
| `tool.execute.before` | `tool.execute.before` | Pre-tool guards |
| `tool.execute.after` | `tool.execute.after` | Post-tool hooks |
| `experimental.chat.messages.transform` | `experimental.chat.messages.transform` | Context injection, pentest reasoning context, CTF state injection |
| `experimental.chat.system.transform` | `experimental.chat.system.transform` | System-message-level transforms |
| `experimental.session.compacting` | `experimental.session.compacting` | Context + todo + attack model preservation across compaction |
| `experimental.compaction.autocontinue` | `experimental.compaction.autocontinue` | Auto-resume after compaction completes |

---

## TOOL CATALOG (config-gated)

**Always on (18):** `lsp_goto_definition`, `lsp_find_references`, `lsp_symbols`, `lsp_diagnostics`, `lsp_prepare_rename`, `lsp_rename`, `grep`, `glob`, `session_list`, `session_read`, `session_search`, `session_info`, `background_output`, `background_cancel`, `call_crypthunter_agent`, `task` (delegate), `skill`, `skill_mcp`.

**Pentest reasoning tools (always on when pentest-mode active):** `pentest_hypothesize` (register hypothesis with evidence level), `pentest_validate` (advance evidence ladder L1→L6), `pentest_confidence` (rate finding CONFIRMED/LIKELY/POSSIBLE/FALSE_POSITIVE), `pentest_handoff` (generate manual validation package), `pentest_pivot` (record lateral movement), `pentest_target_model_update` (update living attack model).

**Conditional:** `look_at` (+1, lens not disabled), `interactive_bash` (+1, tmux available), `task_create/get/list/update` (+1, `experimental.task_system`), `edit` (+1, `hashline_edit`), `team_*` (+12, `team_mode.enabled`).

---

## CTF MODE — DEEP SKILL ROUTING

CryptHunter routes CTF challenges to the most specific skill based on detected category:

```
/mode ctf
ctf-recon → [category detection] → ctf-{pwn|re|crypto|web|forensics|misc|...}
```

### CTF Skill Map

| Category | Primary Skills | Advanced Skills |
|---|---|---|
| **Pwn** | `ctf-pwn-basics` | `ctf-pwn-heap`, `ctf-heap-advanced`, `ctf-pwn-rop`, `ctf-pwn-rop-advanced`, `ctf-pwn-format-string`, `ctf-pwn-advanced-exploits`, `ctf-pwn-advanced-exploits-2` |
| **Kernel Pwn** | `ctf-pwn-kernel` | `ctf-pwn-kernel-techniques`, `ctf-pwn-kernel-bypass` |
| **Sandbox** | `ctf-pwn-sandbox` | — |
| **Crypto** | `ctf-crypto` | `ctf-crypto-rsa`, `ctf-crypto-ecc`, `ctf-crypto-modern`, `ctf-crypto-classic`, `ctf-crypto-prng`, `ctf-crypto-zkp`, `ctf-crypto-advanced-math`, `ctf-crypto-exotic`, `ctf-crypto-historical` |
| **Reversing** | `ctf-reverse-tools` | `ctf-reverse-tools-advanced`, `ctf-reverse-dynamic`, `ctf-reverse-patterns`, `ctf-reverse-patterns-ctf`, `ctf-reverse-patterns-ctf-2`, `ctf-reverse-anti-analysis`, `ctf-reverse-languages`, `ctf-reverse-platforms` |
| **Web** | `ctf-web-server-side` | `ctf-web-server-side-advanced`, `ctf-web-client-side`, `ctf-web-auth-access`, `ctf-web-auth-infra`, `ctf-web-server-exec`, `ctf-web-server-deser`, `ctf-web-node-prototype`, `ctf-web-cves`, `ctf-web-web3` |
| **Forensics** | `ctf-forensics` | `ctf-forensics-disk`, `ctf-forensics-disk-memory`, `ctf-forensics-disk-recovery`, `ctf-forensics-linux`, `ctf-forensics-network`, `ctf-forensics-network-advanced`, `ctf-forensics-signals`, `ctf-forensics-stego`, `ctf-forensics-stego-advanced`, `ctf-forensics-windows`, `ctf-forensics-3d-printing` |
| **Malware** | `ctf-malware-analysis` | `ctf-malware-c2-protocols`, `ctf-malware-pe-dotnet`, `ctf-malware-scripts` |
| **WASM** | `ctf-wasm` | — |
| **Android** | `ctf-android` | — |
| **Misc** | `ctf-misc-encodings` | `ctf-misc-dns`, `ctf-misc-pyjails`, `ctf-misc-bashjails`, `ctf-misc-rf-sdr`, `ctf-misc-games-vms`, `ctf-misc-games-vms-2` |
| **OSINT** | `ctf-osint-web` | `ctf-osint-geolocation`, `ctf-osint-social` |
| **Exploit** | `ctf-exploit` | `ctf-heap-advanced` |

---

## PENTEST ENGAGEMENT MODES

| Mode | Skill Chain | Report Format | Stealth | Parallelism |
|---|---|---|---|---|
| `auto` | pentest-recon → enum → exploit → report | Standard | No | 4 |
| `ctf` | ctf-recon → ctf-exploit → ctf-crypto → ctf-forensics + sub-routing | Flag | No | 8 |
| `bug-bounty` | pentest-recon → enum → exploit → report | HackerOne/Bugcrowd | No | 6 |
| `red-team` | red-recon → red-exploit → red-lateral → red-persistence | Executive | Yes | 2 |
| `blue-team` | blue-detect → blue-ir → blue-forensics → blue-report | IR | No | 4 |
| `offensive` | pentest-recon → enum → exploit → privesc | Technical | No | 6 |
| `grey-hat` | pentest-recon → enum → exploit → report | Technical | Yes | 4 |
| `forensic` | forensic-memory → forensic-disk → forensic-network → forensic-report | Forensic | No | 3 |
| `reverse-engineering` | re-static → re-dynamic | RE Report | No | 4 |
| `mobile-pentest` | mobile-android → mobile-ios → mobile-dynamic → mobile-report | OWASP Mobile | No | 4 |

---

## REASONING ARCHITECTURE

### Hypothesis-First Execution

Every action starts with an explicit hypothesis. No blind tool runs.

```
[HYPOTHESIS]  Claim about target state
[TEST]        Tool run or manual check
[EVIDENCE]    What the result proves or disproves
[UPDATE]      How the attack model changes
```

### Evidence Ladder

| Level | Gate | Required for |
|---|---|---|
| L1 | Scanner/CVE/version signal | POSSIBLE |
| L2 | Independent behavior reproduced | POSSIBLE |
| L3 | Security boundary confirmed | LIKELY |
| L4 | Attacker capability demonstrated | CONFIRMED |
| L5 | Impact on sensitive resource confirmed | High/Critical CVSS |
| L6 | Full attack chain with artifacts | Executive report |

### Living Attack Model

Session-scoped memory accumulates:
- Discovered technologies and versions
- Open ports and service fingerprints
- Confirmed findings (L4+)
- Hypothesis queue (pending/rejected/confirmed)
- Chain candidates (multi-step attack paths)
- Lateral movement map

Every tool result updates the model. Every decision flows from it.

### Adversarial Self-Review (10-point, pentest)

Before marking any finding CONFIRMED, the agent must answer all 10:

1. Could this be a false positive? What would cause it?
2. Is the scanner version-matching on a patched binary?
3. Was the security boundary actually crossed?
4. Is there a WAF/IDS artifact invalidating the test?
5. Can this be reproduced with a different tool?
6. Would a blue team analyst immediately dismiss this?
7. Is the CVSS accurate or inflated?
8. Does the PoC work end-to-end?
9. Was the target in-scope when the test was run?
10. Is the evidence attached and reproducible?

---

## TEAM MODE

Parallel multi-agent coordination for large engagements. Enabled via config.

```jsonc
{
  "team_mode": {
    "enabled": true,
    "tmux_visualization": true,
    "max_parallel_members": 4,
    "max_members": 8,
    "max_messages_per_run": 10000,
    "max_wall_clock_minutes": 120,
    "max_member_turns": 500,
    "mailbox_poll_interval_ms": 3000
  }
}
```

**Member eligibility:**
- `eligible`: cerberus, atlas, cerberus-junior
- `conditional`: scylla (needs `teammate: "allow"` permission)
- `hard-reject`: oracle, intel, explore, lens, vanguard, sentinel, talos

**Storage layout** (`~/.omop/teams/{name}/`): `config.json`, `state.json`, `mailbox/`, `tasklist.jsonl`, `worktrees/`.

---

## CODEX LIGHT EDITION

Light edition for OpenAI Codex CLI under [`packages/omop-codex/`](packages/omop-codex/AGENTS.md).

- **Components (8):** `comment-checker`, `git-bash`, `lsp`, `rules`, `start-work-continuation`, `telemetry`, `fullscan`, `pentest-loop`
- **Install:** `bunx crypthunter install --platform=codex`
- **No agent orchestration, no `team_*`, no built-in MCPs beyond LSP**

---

## MULTI-LEVEL CONFIG

```
Walked configs (closer wins): <pwd up to $HOME>/.opencode/crypthunter.jsonc
                            ↓ merged onto
User config:               ~/.config/opencode/crypthunter.jsonc
                            ↓ falls back to
Defaults                   (Zod safeParse fills omitted fields)
```

- `agents`, `categories`, `claude_code`: deep merged recursively (prototype-pollution safe)
- `disabled_*` arrays: Set union (concatenated + deduplicated)
- `mcp_env_allowlist`: **user-only** for security
- Schema autocomplete: `"$schema": "https://raw.githubusercontent.com/cryptdefender323/crypthunter/dev/assets/crypthunter.schema.json"`

---

## THREE-TIER MCP SYSTEM

| Tier | Source | Loader | Mechanism |
|------|--------|--------|-----------|
| 1. Built-in | `packages/omop-opencode/src/mcp/` | `createBuiltinMcps()` | 3 remote HTTP + 2 local stdio MCPs (`lsp`, `codegraph`) |
| 2. Claude Code | `.mcp.json` (project + user) | `claude-code-mcp-loader` | `${VAR}` env expansion (allowlist via `mcp_env_allowlist`) |
| 3. Skill-embedded | SKILL.md YAML frontmatter | `SkillMcpManager` (per-session) | stdio + HTTP, OAuth 2.0 + PKCE + DCR step-up |

---

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add security tool | `tools-catalog.json` + `.agents/skills/{name}/SKILL.md` |
| Modify tool selection | `packages/pentest-core/src/selector/tool-selector.ts` |
| Add engagement mode | `packages/pentest-core/src/types.ts` `MODE_PRESETS` + `mode-selector.ts` |
| Add pentest skill | `.agents/skills/{name}/SKILL.md` |
| Add CTF skill | `.agents/skills/ctf-{category}/SKILL.md` |
| Modify engagement lifecycle | `.agents/skills/pentest-workflow/SKILL.md` |
| Add agent | `packages/omop-opencode/src/agents/` + `agents/builtin-agents/` |
| Add hook | `packages/omop-opencode/src/hooks/{name}/` + register in `create-*-hooks.ts` |
| Add tool | `packages/omop-opencode/src/tools/{name}/` + register in `tool-registry.ts` |
| Add feature module | `packages/omop-opencode/src/features/{name}/` |
| Add built-in MCP | `packages/omop-opencode/src/mcp/` + `createBuiltinMcps()` |
| Add CLI subcommand | `packages/omop-opencode/src/cli/cli-program.ts` |
| Add doctor check | `packages/omop-opencode/src/cli/doctor/checks/` + `checks/index.ts` |
| Modify config schema | `packages/omop-opencode/src/config/schema/` → `CryptHunterConfigSchema` → `bun run build:schema` |
| Pentest reasoning tools | `packages/omop-opencode/src/tools/pentest-*/` |
| CTF intelligence data | `packages/pentest-core/src/data/` |
| Team mode tools | `packages/omop-opencode/src/features/team-mode/tools/` |
| Phantom C2 skill | `.agents/skills/phantom-c2/SKILL.md` |
| Fullscan prompts | `packages/prompts-core/prompts/fullscan/*.md` |

---

## ARCHITECTURE INVARIANTS

- **Canonical agent order:** Cerberus → Scylla → Talos → Atlas. Enforced by `installAgentSortShim()`.
- **Hashline edit + read pairing:** Every `Read` output tagged with `LINE#ID` hashes; `hashline_edit` validates before applying. Stale hash → reject.
- **5-tier hook composition:** Session (23) + ToolGuard (17) + Transform (1) + Continuation (7) + Skill (2) = 53 base. Team mode adds 4 more = 57.
- **Per-session MCP isolation:** Tier-3 MCP clients keyed by `${sessionID}:${skillName}:${serverName}`.
- **Two fallback systems:** `model-fallback` (proactive, chat.params) vs `runtime-fallback` (reactive, session.error). Independent.
- **Prompt injection gate:** All `session.prompt`/`session.promptAsync` calls MUST go through `packages/omop-opencode/src/shared/prompt-async-gate.ts`. Raw calls outside the gate fail `prompt-async-route-audit.test.ts`.
- **Evidence inflation guard:** `pentest_confidence(CONFIRMED)` is blocked unless `validation_level >= 4` (L4 demonstrated). Enforced in tool handler.
- **Attack model persistence:** Living attack model survives compaction via `experimental.session.compacting` hook.

---

## CONVENTIONS

- **Runtime:** Bun only (`bun-types`, never `@types/node`). Exception: `lsp-tools-mcp` + `lsp-daemon` use Node + npm.
- **TypeScript:** strict mode, ESNext, bundler moduleResolution, no `as any`/`@ts-ignore`/`@ts-expect-error`.
- **Tests:** `bun:test`, co-located `*.test.ts`, given/when/then style. Never Arrange-Act-Assert.
- **Factory pattern:** `createXXX()` for all tools, hooks, agents.
- **File naming:** kebab-case. No catch-all files (`utils.ts`, `helpers.ts`, `service.ts`). 200 LOC soft limit.
- **Imports:** relative within module; barrel imports across modules. No `@/` aliases inside `packages/*/src/`.
- **Config format:** JSONC with comments + trailing commas, Zod validation, snake_case keys.
- **Comments:** AI slop patterns blocked by `comment-checker` hook. Use `// @allow` to bypass.
- **zauc-mocks pattern:** dirs named `zauc-mocks-*` hold `mock.module()` setup that must sort before the consuming test files.

---

## ANTI-PATTERNS (BLOCKING)

- Never `as any`, `@ts-ignore`, `@ts-expect-error`.
- Never suppress lint/type errors.
- Never commit unless explicitly requested.
- Never run `bun publish` directly — use GitHub Actions workflow.
- Never modify `package.json` `version` locally.
- Never write to existing files without reading them first.
- Never use `background_cancel(all=true)` — cancel by `taskId` individually.
- Never delete a failing test — fix the code.
- Never empty catch blocks `catch(e) {}`.
- Never em dashes / en dashes / AI filler ("simply", "obviously", "clearly", "moreover") in generated content.
- Never create catch-all files.
- Never dump business logic into `index.ts` — barrel exports only.
- Talos may ONLY edit `.md` files; FORBIDDEN from `packages/*/src/`, `package.json`, config files.
- Never call this project "oh-my-open-pentest" or "omo". It is **CryptHunter** (`crypthunter`).
- Never report a finding as CONFIRMED without L4 evidence demonstrated.
- Never run tools blindly — state the hypothesis first.

---

## COMMANDS

```bash
bun test                              # Root Bun test suite
bun run test:codex                    # Codex Light compatibility suite
bun run build                         # Build plugin (ESM + .d.ts + CLI + schema)
bun run build:all                     # Build + platform binaries
bun run build:schema                  # Regenerate assets/crypthunter.schema.json
bun run build:model-capabilities      # Refresh model-capabilities cache from models.dev
bun run typecheck                     # tsgo --noEmit
bun run typecheck:packages            # Per-workspace-package typecheck
bun run clean                         # rm -rf dist

bunx crypthunter install              # Interactive setup wizard
bunx crypthunter doctor               # Health diagnostics
bunx crypthunter run <message>        # Non-interactive session
bunx crypthunter tools check          # Check tool availability
bunx crypthunter tools install        # Auto-install missing tools
bunx crypthunter dashboard            # Local web dashboard at localhost:7474
bunx crypthunter mcp-oauth login <server-url>  # Tier-3 MCP OAuth
```

---

## DEVELOPMENT ENVIRONMENT

Single source of truth: [`script/agent/setup.sh`](script/agent/setup.sh). [`script/agent/cleanup.sh`](script/agent/cleanup.sh) removes transients; `--deep` drops `dist/` + `node_modules/`. QA isolation: `source script/agent/qa-sandbox.sh`.

| Harness | Wiring |
|---------|--------|
| GitHub Codespaces | `.devcontainer/devcontainer.json` + `postCreateCommand: setup.sh` |
| Plain Docker | `script/agent/docker-dev.sh` |
| Cursor cloud agents | `.cursor/environment.json` |
| Claude Code | `.claude/settings.json` — `SessionStart` runs `setup.sh` |
| Codex App | `.codex/setup.sh` |
| OpenCode | root `AGENTS.md` |
