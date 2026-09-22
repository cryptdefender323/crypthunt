# What Is CryptHunter?

CryptHunter is an autonomous security intelligence engine built as an OpenCode plugin. It is purpose-built for penetration testing and CTF competition — not a generic coding assistant with security skills added on top.

It turns a single AI model into a structured security research system with persistent state, hypothesis management, evidence gating, and role-specific reasoning chains.

---

## Quick Start

Install:

```bash
bunx crypthunter install
bunx crypthunter doctor
```

Or read the full [Installation Guide](./installation.md) for manual setup, provider configuration, and tool installation.

Start your first engagement:

```
/mode ctf
```
```
/mode bug-bounty
```
```
/mode red-team
```

---

## The Problem It Solves

A model running security tasks without structure does this:

```
TOOL → SCAN → OUTPUT → FINDING
```

That produces noisy, unvalidated, often false-positive results. A scanner hit is not a vulnerability. A reflected parameter is not XSS. A version string is not a confirmed CVE.

CryptHunter enforces a discipline the model would not apply on its own:

```
UNDERSTAND → MODEL → DISCOVER → HYPOTHESIZE → PLAN
→ EXECUTE → OBSERVE → CORRELATE → VALIDATE → DISPROVE
→ ITERATE → VERIFY → REPORT
```

Every finding goes through a 9-stage false-positive battery before it can be promoted. Every tool run requires a stated hypothesis. Every finding's impact is demonstrated, not inferred from root cause.

---

## How It Works

CryptHunter is not smarter than the underlying model. It makes the model operate within a disciplined architecture:

**Persistent research state.** Every engagement maintains a JSON state object: target model, attack surface, hypothesis graph, evidence nodes, findings at each quality level, failed tests, unanswered questions. The investigation can resume across sessions without losing context.

**Task graph.** Complex engagements decompose into dependency-aware subtasks. DNS enumeration runs before live host check. Live hosts run before technology detection. Technology detection runs before hypothesis generation. No step runs before its prerequisites produce evidence.

**Evidence ladder (L1-L6).** Every finding has an evidence level. L1 is a scanner signal. L4 is demonstrated attacker capability. L6 is a full attack chain. `CONFIRMED` status is blocked until L4. No exceptions.

**Finding quality gate.** Seven states: `CANDIDATE` → `INVESTIGATING` → `NEEDS_VALIDATION` → `READY_FOR_HUMAN_REVIEW` → `VALIDATED` → `DISPROVEN` → `OUT_OF_SCOPE`. A scanner result alone stays at `CANDIDATE`. Promotion requires 10 evidence requirements to be met.

**Active disproof.** Before any finding is promoted, CryptHunter generates the strongest argument against its own conclusion and runs disproof tests. Findings that survive active disproof are stronger.

**Role-specific reasoning.** Each engagement mode loads a purpose-built reasoning model, skill chain, safety constraints, and handoff state. Bug bounty enforces strict scope and requires human validation before report generation. Red team enforces stealth discipline and BOF-first execution. CTF prioritizes speed and technique-specific routing.

---

## Engagement Modes

| Mode | Use case |
|---|---|
| `ctf` | CTF competition — routes to category-specific skill (pwn, crypto, reversing, web, forensics, misc) |
| `bug-bounty` | Authorized bug bounty — scope-strict, evidence-gated, HackerOne report |
| `red-team` | Authorized red team — stealth, AD attacks, Phantom C2, executive report |
| `offensive` | Authorized pentest — aggressive exploitation, privesc chain |
| `blue-team` | Incident response — detection, timeline, IOC, MITRE ATT&CK |
| `forensic` | Digital forensics — memory/disk/network, chain-of-custody |
| `reverse-engineering` | Binary analysis — static/dynamic, symbolic execution |
| `mobile-pentest` | Mobile app — Android/iOS static+dynamic, OWASP Mobile |
| `cloud-pentest` | Cloud infra — AWS/GCP/Azure IAM, SSRF-to-metadata |
| `ad-audit` | AD-focused — Kerberoasting, ADCS ESC1-13, BloodHound chain |
| `auto` | Unknown target — classifies and selects role automatically |

---

## CTF Depth

CryptHunter routes CTF challenges to the most specific skill available based on detected category. It does not use a single generic CTF skill.

| Category | Skills available |
|---|---|
| Pwn | basics, heap, ROP, format string, kernel, sandbox, advanced exploits |
| Crypto | RSA, ECC, AES/modern, PRNG, lattice, ZKP, classical, exotic, historical |
| Reversing | static tools, dynamic analysis, anti-analysis bypass, WASM, malware |
| Web | server-side, client-side, auth, deserialization, prototype pollution, Web3 |
| Forensics | disk, memory, network, steganography, signals, Windows, Linux |
| Misc | pyjails, bash jails, RF/SDR, OSINT, encodings |

---

## Agents

| Agent | Role |
|---|---|
| Cerberus | Primary orchestrator — runs pentest/CTF engagements |
| Scylla | Deep autonomous research — extended investigations |
| Atlas | Long-running task coordination |
| Talos | Documentation only — never touches source code |
| Intel | Threat intelligence and research |
| Lens | Vision and screenshot analysis |
| Cerberus Junior | Subagent for team mode parallel tasks |

---

## What It Is Not

CryptHunter is not a general-purpose coding assistant. For coding tasks, use the base OpenCode model directly.

CryptHunter is not a vulnerability scanner. It is an orchestration system that disciplines a model to reason about security the way a human researcher would.

CryptHunter does not submit reports automatically. For bug bounty, a human must confirm `VALIDATED` before any report is generated.

---

## Further Reading

- [Installation Guide](./installation.md) — Setup, API keys, security tools, first engagement
- [Orchestration Guide](./orchestration.md) — How the research engine, task graph, and evidence ladder work
- [Engagement Modes](./modes.md) — Full mode reference with skill chains and safety constraints
- [Pentest Workflow](./pentest-workflow.md) — The 13-stage engagement lifecycle
- [Team Mode](./team-mode.md) — Parallel multi-agent coordination for large engagements
- [Tools Reference](./tools.md) — 130+ security tools in the catalog
