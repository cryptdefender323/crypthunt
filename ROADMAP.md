# CryptHunter — Roadmap

- [What CryptHunter Is](#what-crypthunter-is)
- [Design Philosophy](#design-philosophy)
- [Current Priority: Package Layering Refactor](#current-priority-package-layering-refactor)
- [CTF Intelligence Expansion](#ctf-intelligence-expansion)
- [Heavy Pentest Expansion](#heavy-pentest-expansion)
- [Reasoning Layer Upgrades](#reasoning-layer-upgrades)
- [Multi-Harness Support](#multi-harness-support)
- [Non-Goals](#non-goals)
- [Decision Principle](#decision-principle)

---

## What CryptHunter Is

CryptHunter is an autonomous security intelligence engine.

The human is not the analyst. The agent is the analyst. The human defines the target and the rules of engagement. Then they walk away. The agent reasons about the attack surface, builds hypotheses, tests them with real tools, validates findings against a structured evidence ladder, adversarially tries to disprove each one, and delivers a report or captures a flag.

CryptHunter does not make agents better at typing commands. It makes it possible to hand off an entire security engagement or CTF challenge — the kind where a human expert would normally stay in the loop for hours. CryptHunter removes that loop.

**The agent thinks. The agent decides. The agent executes. The agent validates. The human only initiates.**

This is the core difference from every other security AI tool: CryptHunter applies discipline to itself. It cannot report a CONFIRMED finding without L4 evidence. It cannot skip the adversarial self-review. It cannot run tools without stating a hypothesis first. These are hard constraints, not guidelines.

---

## Design Philosophy

### Evidence discipline above all else

A security tool that reports false positives is worse than no tool at all. It trains practitioners to ignore findings. CryptHunter's evidence ladder (L1–L6) and adversarial self-review exist to ensure every finding that reaches a report has been genuinely validated — not just detected.

The inflation guard in `pentest_confidence` blocks CONFIRMED status unless `validation_level >= 4`. This cannot be bypassed by the agent. It can only be bypassed by a human explicitly overriding it in config.

### Hypothesis-first execution

Blind tool runs are noise. Before every action, CryptHunter states what hypothesis it is testing, what evidence would confirm it, and what would falsify it. This disciplines the reasoning chain and makes the output interpretable: you can see exactly why the agent made each decision.

### CTF depth, not breadth

Most security AI tools cover CTF categories at L1 depth: "run pwntools," "try hashcat," "look for SQL injection." CryptHunter covers them at expert depth. The crypto skill knows lattice attacks. The pwn skill knows FSOP. The reversing skill can drive symbolic execution. This is not achieved by prompting a general model — it is achieved by purpose-built skill playbooks written by practitioners.

### The agent reads the room

CryptHunter's living attack model means the agent accumulates context across the entire engagement. A port discovered in recon can change what the agent does three phases later. A failed exploit attempt updates the model so the same dead end is not retried. The session is a continuous reasoning thread, not a series of isolated tool calls.

---

## Current Priority: Package Layering Refactor

**This is the most urgent engineering work.**

The current `packages/` directory mixes binaries, web apps, MCP servers, and pure TypeScript logic in one flat namespace. This makes reuse across harnesses impossible and creates duplication.

The refactor splits packages into strict layers by runtime boundary:

| Layer | Contents | Boundary |
|---|---|---|
| Core | Pure TypeScript: rule discovery, AGENTS.md parsing, config schemas, model capabilities, pentest reasoning primitives | No harness dependencies. Testable in isolation. |
| MCP | External tool servers: LSP, ast-grep, codegraph | stdio process boundary. Host-agnostic. |
| Skills | Static declarative SKILL.md playbooks | Markdown consumed by the agent. No code. |
| Adapters | Harness-specific glue: OpenCode plugin, Codex CLI | Thin wrappers. Import core, wrap in harness API, export. |
| Platform | Bun compile binaries per target | Deployment artifacts. Never imported. |
| Web | Marketing site | Independent application. |

**Dependency rule:** DAG flows downward only. Adapters depend on Core, MCP, and Skills. Nothing depends on Adapters.

**Current extraction status:**

- 18 Core packages extracted: `utils`, `model-core`, `prompts-core`, `rules-engine`, `agents-md-core`, `comment-checker-core`, `hashline-core`, `boulder-state`, `telemetry-core`, `lsp-core`, `mcp-stdio-core`, `tmux-core`, `claude-code-compat-core`, `skills-loader-core`, `mcp-client-core`, `openclaw-core`, `team-core`, `delegate-core`.
- `omop-opencode` consumes these via workspace dependencies.
- `pentest-core` and `pentest-skills` are production-ready and harness-neutral.
- `lsp-tools-mcp` and `lsp-daemon` consume `lsp-core` + `mcp-stdio-core`.

Next phase: migrate Codex Light and any future harnesses to consume the same Core layer without code duplication.

---

## CTF Intelligence Expansion

CryptHunter currently ships 30+ CTF skill categories. Planned expansions:

### New categories

- **Hardware / embedded** — JTAG/UART dumping, SPI flash extraction, firmware emulation with QEMU, side-channel (timing, power)
- **Blockchain / Web3** — Solidity audit automation, EVM bytecode reversing, MEV/flash loan simulation, Foundry/Hardhat integration
- **Cloud CTF** — AWS metadata SSRF exploitation, IAM privilege escalation, S3 bucket enumeration, GCP/Azure equivalents
- **AI/ML security** — adversarial prompt injection, model inversion, training data extraction, LoRA poisoning
- **Game hacking** — memory scanning (Cheat Engine automation), anti-cheat bypass, protocol reversing

### Existing skill upgrades

- `ctf-crypto` → upgrade to match `ctf-crypto-rsa` depth: add lattice (LLL/BKZ), elliptic curve fault attacks, multi-prime RSA, batch GCD, Coppersmith applications
- `ctf-reverse-dynamic` → add Triton-based concolic execution, Intel PIN instrumentation, custom LLVM pass scripting
- `ctf-pwn-kernel` → add io_uring exploitation, eBPF JIT RCE, FUSE race conditions, cross-cache overflow
- `ctf-web-web3` → add complete Foundry-based exploit harness, ERC-4626 audit, cross-chain bridge attacks

### CTF auto-flag submission

Integration with CTFd and rCTF APIs: when a flag matching the configured regex is found, auto-submit via `CRYPTHUNTER_CTFD_URL` + `CRYPTHUNTER_CTFD_TOKEN`. Result logged to dashboard CTF workspace tab.

### CTF team mode

Parallel agent teams for multi-challenge competitions: one Cerberus per challenge category running simultaneously, coordinated through team mailbox, with a Scylla lead reporting flag captures to the operator.

---

## Heavy Pentest Expansion

### ADCS attack chains

Certipy integration for ESC1–ESC13 enumeration and exploitation. Auto-chain: ESC detection → template abuse → domain admin cert → PKINIT authentication → DCSync.

### Kerberos deep integration

Full Kerberos attack skill: AS-REP roasting, Kerberoasting, silver/golden ticket, diamond ticket, sapphire ticket, unconstrained/constrained/resource-based constrained delegation, S4U2self/S4U2proxy abuse.

### Cloud attack chains

- **AWS:** SSRF → metadata → IAM role enumeration → privilege escalation → S3 exfil → lambda abuse
- **GCP:** service account key theft → project pivot → GCS enumeration
- **Azure:** PRT abuse → AAD privilege escalation → Intune LAPS extraction

### Zero-day chain framework

Structured multi-step attack chain planning: when L3 evidence exists on multiple components, CryptHunter proposes chaining hypotheses into an end-to-end path, ranks by exploitability, and tracks which links have been validated.

### Automated CVSS calculation

After L4 validation, CryptHunter auto-calculates CVSS 3.1 base score using: attack vector, complexity, privileges required, user interaction, scope, and impact. Requires human override for contextual/temporal/environmental adjustment.

---

## Reasoning Layer Upgrades

### Attack graph visualization

Export the living attack model as a directed graph: nodes are hosts/services/users/findings, edges are attack paths. Rendered in the dashboard Attack Model tab and exportable as DOT/JSON for external tools.

### Hypothesis persistence across compaction

Currently the living attack model partially survives compaction via `experimental.session.compacting`. Goal: full hypothesis graph serialization to `.omop/attack-model.json` so a new session can resume from exact state.

### Automated red/blue duality

In the same engagement, run both a red team agent (exploiting) and a blue team agent (detecting). The blue agent observes what the red agent does and reports which actions would have been caught by which defensive control. Output: a gap analysis report with detection coverage per attack technique.

### Pentest-loop quality gate upgrade

Current quality gates: evidence level, adversarial review. Planned additions:
- CVSS minimum threshold gate (configurable, default: 4.0)
- Reproducibility gate (require second confirmation run for Critical findings)
- Scope re-validation gate (auto-check target is still in scope before reporting)

---

## Multi-Harness Support

CryptHunter currently ships for:
- **OpenCode** (Ultimate edition — full feature set)
- **Codex CLI** (Light edition — rule injection, comment checker, pentest-loop, fullscan)

Planned harnesses:
- **Claude Code** — native hook integration (already partially wired via `.claude/settings.json`)
- **Cursor agents** — `.cursor/environment.json` already present
- **Continue.dev** — community-requested

The Core layer refactor is a prerequisite. Once all pentest logic lives in harness-neutral Core packages, adding a new adapter is: import Core → wrap in harness hook API → ship.

---

## Non-Goals

**CryptHunter does not aim to:**

- Replace manual penetration testing judgment. It automates the mechanical and analytical work; the expert still owns the scope, the RoE, and the final report sign-off.
- Be a general-purpose AI coding assistant. There are better tools for that. CryptHunter is purpose-built for security.
- Generate findings it cannot validate. A CONFIRMED finding that turns out to be a false positive is a failure mode CryptHunter is explicitly designed to avoid.
- Provide a GUI-first experience. The dashboard is for observation, not operation. The agent drives; the dashboard reports.
- Support unscoped attacks. Every enforcement mode above "none" (CTF/reverse-engineering) requires a scope definition. Strict scope enforcement is not optional for bug bounty and red team modes.

---

## Decision Principle

The hierarchy of expression in CryptHunter:

1. **Skill** — static knowledge, zero runtime cost, pure markdown
2. **MCP** — external tool with process boundary, deterministic output
3. **Tool** — first-party runtime capability with structured output
4. **Hook** — injection into the agent loop itself, used sparingly

This order is not dogma. If the loop performs better another way, we change it. **Agent performance on hard security problems is the only metric.**

When choosing between two implementations: pick the one that makes the agent's next decision easier to make correctly. Not the one that is cleaner to read. Not the one that follows a pattern. The one that helps the agent solve the problem.
