# CLAUDE.md

This file provides guidance to AI agents (Claude, Codex, GPT, Gemini, any model) working in the **CryptHunter** repository.

> **ACTIVE REFACTOR:** Rewriting from generic agentic code platform to a purpose-built autonomous pentest + CTF engine. Pentest infrastructure (`pentest-core`, `pentest-skills`, `tools-catalog.json`, `.agents/skills/`) is production-ready. OpenCode plugin agent prompts are still being upgraded for CryptHunter's advanced reasoning model. Read [ROADMAP.md](./ROADMAP.md) before touching anything.

---

## CRYPTHUNTER IDENTITY

**CryptHunter** is not oh-my-open-pentest. It is a next-generation autonomous security intelligence engine built for:

- **Heavy CTF** — pwn, reversing, crypto, forensics, web, misc at elite difficulty
- **Heavy pentest** — red team, APT simulation, zero-day chain exploitation, active directory domination
- **Autonomous reasoning** — hypothesis-driven, evidence-gated, adversarially self-reviewed

### What makes CryptHunter different

| Capability | oh-my-open-pentest | **CryptHunter** |
|---|---|---|
| CTF depth | Basic (single skill chain) | Deep (category-aware, technique-specific sub-skills) |
| Crypto | Hash cracking, basic RSA | Full: lattice, ECC, PRNG, ZKP, exotic, historical |
| Pwn | Basic buffer overflow | Full: kernel, heap, JIT, ASAN, FSOP, eBPF, sandbox escape |
| Reasoning | Tool output summary | Hypothesis graph → evidence ladder → adversarial disproving |
| Attack model | Stateless | Session-scoped living model with signal accumulation |
| C2 integration | Optional | First-class (Phantom C2 in red-team chain) |
| CTF categories | 4 | 30+ (pwn/re/crypto/web/forensics/misc/hardware/cloud/blockchain) |
| Pentest modes | 7 | 10 + submode expansion |

---

## CRYPTHUNTER REASONING MODEL

When operating as a CryptHunter agent, the AI must internalize this reasoning model:

### Core Principle: Hypothesis-First, Evidence-Gated

Do not dump tool output. Do not run tools blindly. Before every action, state:

1. **What hypothesis does this test?** (Explicit claim about the target)
2. **What evidence would confirm it?** (What exact output would make it true)
3. **What evidence would falsify it?** (What output would rule it out)

After every result, update your attack model. Every discovery either confirms, weakens, or opens new hypotheses.

### Evidence Ladder (L1–L6)

Every finding is assigned a level before reporting:

| Level | Gate |
|---|---|
| L1 | Scanner/CVE/version signal — tool says it exists |
| L2 | Independent behavior reproduced — not just a version number |
| L3 | Security boundary confirmed — the control that matters is absent |
| L4 | **Attacker capability demonstrated** — minimum for CONFIRMED |
| L5 | Impact on sensitive resource confirmed |
| L6 | Full attack chain with artifacts |

**Never report CONFIRMED unless L4 is demonstrated. Reject L1/L2 findings in executive reports.**

### CTF Reasoning Mode

For CTF challenges, the reasoning model shifts:

1. **Category identification** — pwn/re/crypto/web/forensics/misc/blockchain/hardware
2. **Technique triage** — scan for known patterns (UAF, format string, padding oracle, etc.)
3. **Static → dynamic** — always static analysis before running anything
4. **Constraint mapping** — what are the input constraints? What is filtered? What is the goal?
5. **Exploit construction** — build incrementally, test each primitive
6. **Flag extraction** — document exact extraction method

For hard CTF challenges (L5+ difficulty): enumerate every program state before choosing an attack vector. One missed constraint = hours lost.

### Adversarial Self-Review (Pentest)

Before marking any finding CONFIRMED, ask:

1. Could this be a false positive? What would cause that?
2. Is the scanner version-matching on a patched binary?
3. Did I verify the boundary was actually crossed, not just detectable?
4. Is there a WAF/IDS artifact that invalidates the test?
5. Can I reproduce this in a different way with a different tool?
6. Would a blue team analyst immediately dismiss this?
7. Is the CVSS score accurate or inflated?
8. Does the PoC actually work end-to-end?
9. Could the target have been out-of-scope when the test was run?
10. Is the evidence attached and reproducible?

If any of 1–10 cannot be answered cleanly, the finding is LIKELY or POSSIBLE, not CONFIRMED.

---

## DEVELOPMENT ENVIRONMENT

Single source of truth: `script/agent/setup.sh` (verifies toolchain, runs `bun install`, builds only if `dist/index.js` missing). `script/agent/cleanup.sh` removes transients; `--deep` also drops `dist/` + `node_modules/`. For QA isolation: `source script/agent/qa-sandbox.sh` exports throwaway XDG dirs so QA never touches real `~/.config/opencode`. See [AGENTS.md — Development Environment](./AGENTS.md#development-environment) for harness wiring (Codespaces, Docker, Cursor, Claude Code, Codex). See [AGENTS.md — Credentials & Isolation](./AGENTS.md#development-environment) for `.env.example` credential injection pattern.

**MAINTENANCE:** Update `script/agent/setup.sh`, `script/agent/cleanup.sh`, [AGENTS.md](./AGENTS.md), [CONTRIBUTING.md](./CONTRIBUTING.md), and the matching skill (`opencode-qa` or `codex-qa`) in the SAME change whenever a setup dependency or credential changes. Keep `script/agent-env.test.ts`, `script/agent-harness-wiring.test.ts`, and `script/agents-md-dev-env.test.ts` green.

---

## Commands

```bash
bun test                              # Root Bun test suite
bun run build                         # Build plugin (ESM + .d.ts + CLI + schema)
bun run build:all                     # Build + platform binaries
bun run build:schema                  # Regenerate assets/crypthunter.schema.json
bun run build:model-capabilities      # Refresh model-capabilities cache from models.dev
bun run typecheck                     # tsgo --noEmit (NOT tsc — uses @typescript/native-preview)
bun run typecheck:packages            # Per-workspace-package typecheck
bun run clean                         # rm -rf dist

bunx crypthunter install              # Interactive setup wizard
bunx crypthunter doctor               # Health diagnostics (System / Config / Tools / Models)
bunx crypthunter run <message>        # Non-interactive session
bunx crypthunter tools check          # Check tool availability
bunx crypthunter tools install        # Auto-install missing tools
bunx crypthunter dashboard            # Start local web dashboard at localhost:7474

bash script/agent/setup.sh            # Install deps + build if dist/index.js missing
bash script/agent/cleanup.sh          # Remove transients; --deep also drops dist/ + node_modules/
source script/agent/qa-sandbox.sh     # Isolated XDG env for QA (never touches real ~/.config/opencode)
```

Run a single test file: `bun test path/to/file.test.ts`

---

## QA — MANDATORY, NO EXCEPTIONS

**Any change touching `packages/omop-opencode/`** must run the `opencode-qa` skill and write evidence to `.omop/evidence/<YYYYMMDD>-<short-slug>/`. No evidence file = no commit.

- Spawn opencode ONLY inside the XDG sandbox (`source script/agent/qa-sandbox.sh`) — never pollute real `~/.local/share/opencode/opencode.db`.
- Prove hook fired via `scripts/sse-hook-probe.sh --event <name>` for lifecycle hook changes.
- "It typechecks" and "`bun test` is green" are NOT QA. Drive the real harness.

---

## Default Workflow

Use the **`work-with-pr`** skill for all non-hotfix work: isolated git worktree → implement → QA evidence → PR → merge commit. Never hand-commit straight to `dev`.

- Merge = merge commit only. `gh pr merge <number> --merge --delete-branch`. **Never `--squash` or `--rebase`**.
- PRs must target `dev`, not `master`.

---

## Architecture

**Two editions:** Ultimate (OpenCode plugin = `packages/omop-opencode/`) and Light (Codex CLI = `packages/omop-codex/`). There is NO root `src/` — it moved into `packages/omop-opencode/src/`.

**Package layers** (dependency flows downward only):

| Layer | Packages |
|-------|----------|
| Static catalog | `tools-catalog.json` (40+ security tools, root of repo) |
| Pentest core (pure TS) | `pentest-core` (catalog, selector, command-builder, installer, skill-bridge, mode selector), `pentest-skills` (generator, loader, register) |
| Skills (static SKILL.md) | `.agents/skills/` (250+ skills: pentest, CTF, recon, exploit, forensics, RE, mobile, AD, cloud, blockchain) |
| Infrastructure core (pure TS) | `utils`, `model-core`, `prompts-core`, `rules-engine`, `agents-md-core`, `comment-checker-core`, `hashline-core`, `boulder-state`, `telemetry-core`, `lsp-core`, `mcp-stdio-core`, `tmux-core`, `claude-code-compat-core`, `skills-loader-core`, `mcp-client-core`, `openclaw-core`, `team-core`, `delegate-core` |
| MCP (stdio process boundary) | `lsp-tools-mcp`, `git-bash-mcp`, `lsp-daemon` |
| Adapters | `omop-opencode` (OpenCode plugin), `omop-codex` (Codex Light) |
| Platform | `omop-<os>-<arch>[-variant]/` binaries (generated, never hand-edit) |
| Web | `packages/web/` (Next.js 15 + Cloudflare Workers; own bun.lock; only `@/*` alias zone) |

**Plugin init flow** (`packages/omop-opencode/src/testing/create-plugin-module.ts`):
`installAgentSortShim` → `loadPluginConfig` → `createManagers` → `createTools` → `createHooks` → `createPluginInterface`

**14 OpenCode hook handlers** in `packages/omop-opencode/src/plugin-interface.ts` (+2 in `testing/create-plugin-module.ts`): `config`, `tool`, `tool.definition`, `chat.message`, `chat.params`, `chat.headers`, `command.execute.before`, `event`, `tool.execute.before`, `tool.execute.after`, `experimental.chat.messages.transform`, `experimental.chat.system.transform`, `experimental.session.compacting`, `experimental.compaction.autocontinue`.

**5-tier hook composition:** Session (23) + ToolGuard (17) + Transform (1) + Continuation (7) + Skill (2) = 53 base hooks. Team mode adds 4 more = 57 total.

**Canonical agent order:** Cerberus → Scylla → Talos → Atlas. Enforced by `installAgentSortShim()` patching `Array.prototype.toSorted`/`.sort`.

**Two fallback systems (independent):** `model-fallback` (proactive, `chat.params`, hardcoded chains in `packages/omop-opencode/src/shared/model-requirements.ts`) vs `runtime-fallback` (reactive, `session.error`, configurable per-category/agent).

**Prompt injection gate:** All `session.prompt`/`session.promptAsync` calls MUST go through `packages/omop-opencode/src/shared/prompt-async-gate.ts`. Raw calls outside the gate fail the meta-audit test `prompt-async-route-audit.test.ts`.

**Three-tier MCP:** Built-in (`packages/omop-opencode/src/mcp/`) → Claude Code `.mcp.json` → Skill-embedded (SKILL.md YAML frontmatter, per-session keyed by `${sessionID}:${skillName}:${serverName}`).

**Config merge:** walked `.opencode/crypthunter.jsonc` (closer wins) → user `~/.config/opencode/crypthunter.jsonc` → Zod defaults. `mcp_env_allowlist` is user-config only.

---

## Where to Look

| Task | Location |
|------|----------|
| Add security tool | `tools-catalog.json` + create `.agents/skills/{name}/SKILL.md` |
| Modify tool selection | `packages/pentest-core/src/selector/tool-selector.ts` |
| Add engagement mode | `packages/pentest-core/src/types.ts` `MODE_PRESETS` + `packages/pentest-core/src/mode/mode-selector.ts` |
| Add pentest skill | `.agents/skills/{name}/SKILL.md` with YAML frontmatter |
| Modify engagement lifecycle | `.agents/skills/pentest-workflow/SKILL.md` |
| Add CTF skill | `.agents/skills/ctf-{category}/SKILL.md` — follow existing convention |
| Add agent | `packages/omop-opencode/src/agents/` + `agents/builtin-agents/` |
| Add hook | `packages/omop-opencode/src/hooks/{name}/` + register in `src/plugin/hooks/create-*-hooks.ts` |
| Add built-in MCP | `packages/omop-opencode/src/mcp/` + `createBuiltinMcps()` |
| Add CLI subcommand | `packages/omop-opencode/src/cli/cli-program.ts` |
| Add doctor check | `packages/omop-opencode/src/cli/doctor/checks/` + `checks/index.ts` |
| Modify config schema | `packages/omop-opencode/src/config/schema/` → `CryptHunterConfigSchema` → `bun run build:schema` |
| Team mode tools | `packages/omop-opencode/src/features/team-mode/tools/` |
| CTF intelligence data | `packages/pentest-core/src/data/` |
| Reasoning layer tools | `packages/omop-opencode/src/tools/pentest-*/` |

---

## CTF Skill Map

CryptHunter ships 30+ CTF skill categories. When working on CTF challenges, pick the most specific skill:

| Category | Skill(s) |
|---|---|
| Pwn basics | `ctf-pwn-basics` |
| Pwn heap | `ctf-pwn-heap`, `ctf-heap-advanced` |
| Pwn ROP | `ctf-pwn-rop`, `ctf-pwn-rop-advanced` |
| Pwn format string | `ctf-pwn-format-string` |
| Pwn kernel | `ctf-pwn-kernel`, `ctf-pwn-kernel-techniques`, `ctf-pwn-kernel-bypass` |
| Pwn sandbox | `ctf-pwn-sandbox` |
| Pwn advanced | `ctf-pwn-advanced-exploits`, `ctf-pwn-advanced-exploits-2` |
| Crypto | `ctf-crypto`, `ctf-crypto-rsa`, `ctf-crypto-ecc`, `ctf-crypto-modern`, `ctf-crypto-classic`, `ctf-crypto-prng`, `ctf-crypto-zkp`, `ctf-crypto-advanced-math`, `ctf-crypto-exotic`, `ctf-crypto-historical` |
| Reverse | `ctf-reverse-tools`, `ctf-reverse-tools-advanced`, `ctf-reverse-dynamic`, `ctf-reverse-patterns`, `ctf-reverse-patterns-ctf`, `ctf-reverse-anti-analysis`, `ctf-reverse-languages`, `ctf-reverse-platforms` |
| Web | `ctf-web-server-side`, `ctf-web-server-side-advanced`, `ctf-web-client-side`, `ctf-web-auth-access`, `ctf-web-auth-infra`, `ctf-web-server-exec`, `ctf-web-server-deser`, `ctf-web-node-prototype`, `ctf-web-cves`, `ctf-web-web3` |
| Forensics | `ctf-forensics`, `ctf-forensics-disk`, `ctf-forensics-disk-memory`, `ctf-forensics-disk-recovery`, `ctf-forensics-linux`, `ctf-forensics-network`, `ctf-forensics-network-advanced`, `ctf-forensics-signals`, `ctf-forensics-stego`, `ctf-forensics-stego-advanced`, `ctf-forensics-windows`, `ctf-forensics-3d-printing` |
| Malware | `ctf-malware-analysis`, `ctf-malware-c2-protocols`, `ctf-malware-pe-dotnet`, `ctf-malware-scripts` |
| WASM | `ctf-wasm` |
| Android | `ctf-android` |
| Misc | `ctf-misc-encodings`, `ctf-misc-dns`, `ctf-misc-pyjails`, `ctf-misc-bashjails`, `ctf-misc-rf-sdr`, `ctf-misc-games-vms`, `ctf-misc-games-vms-2` |
| OSINT | `ctf-osint-geolocation`, `ctf-osint-social`, `ctf-osint-web` |

---

## Test Discipline

Every test must pass `bun test` in one process, in one go — no `--only`, no process isolation, no specific ordering.

**No sleep/timers in tests.** `setTimeout`/`await sleep(N)` in test bodies = flake. Replace with: subscribe the listener BEFORE the trigger, then race against an explicit timeout that fails with a useful message if it fires.

**No isolation crutches.** `.only`/`.skip` to mask flakes, or running a test in its own process = broken. `script/run-ci-tests.ts` auto-isolates files using `mock.module()` — do NOT add to that list to cover up a state leak. Find the leak; reset in `beforeEach` or `test-setup.ts`.

**Prompt tests: assert behavior, not text.** These are banned:
```ts
expect(prompt).toContain("You are Cerberus")
expect(prompt).toMatchSnapshot()
```
Assert the structural invariant: "when `teamMode.enabled === true`, the prompt MUST mention `team_send_message`". Test the conditional branch, not the wording.

---

## Conventions

- **Runtime:** Bun only (`bun-types`, never `@types/node`). Exception: `lsp-tools-mcp` + `lsp-daemon` use Node + npm.
- **TypeScript:** strict, ESNext, bundler moduleResolution, no `as any`/`@ts-ignore`/`@ts-expect-error`.
- **Tests:** `bun:test`, co-located `*.test.ts`, given/when/then style (nested `describe` with `#given`/`#when`/`#then`). Never Arrange-Act-Assert.
- **zauc-mocks pattern:** dirs named `zauc-mocks-*` hold `mock.module()` setup that must sort alphabetically before the consuming test files. The `zauc-` prefix is a sort-order hack only — not hooks or tools.
- **Meta-audit tests:** `mock-module-lifecycle-audit.test.ts` and `prompt-async-route-audit.test.ts` parse the codebase via TS compiler API and fail on architectural violations.
- **Factory pattern:** `createXXX()` for all tools, hooks, agents.
- **File naming:** kebab-case. No catch-all files (`utils.ts`, `helpers.ts`, `service.ts`). 200 LOC soft limit.
- **Imports:** relative within module; barrel imports across modules. No `@/` aliases inside `packages/*/src/` (only `packages/web/` uses `@/*`).
- **Hashline:** every `Read` output tagged with `LINE#ID` hashes; `hashline_edit` rejects stale hashes.
- **Comments:** AI slop patterns blocked by `comment-checker` hook. Use `// @allow` to bypass one line.

---

## Anti-Patterns (Blocking)

- Never `as any`, `@ts-ignore`, `@ts-expect-error`.
- Never `bun publish` directly — use GitHub Actions `publish.yml`.
- Never modify `package.json` `version` locally.
- Never write existing files without reading first (`write-existing-file-guard`).
- Never `background_cancel(all=true)` — cancel by `taskId` individually.
- Never delete failing tests — fix the code.
- Never empty catch blocks `catch(e) {}`.
- Never dump business logic into `index.ts` — barrel exports only.
- Never em dashes / en dashes / AI filler ("simply", "obviously", "clearly") in generated content.
- Talos may ONLY edit `.md` files; forbidden from `packages/*/src/`, `package.json`, config files.
- Never commit unless explicitly requested.
- Never call this project "oh-my-open-pentest" — it is **CryptHunter**.
