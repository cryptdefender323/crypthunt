---
name: role-orchestration
description: "Role-specific deep capability orchestration for all 10 CryptHunter modes. Each role has a dedicated reasoning model, handoff state, resource constraints, and skill chain. Covers: auto, bug-bounty, red-team, ctf, blue-team, offensive, grey-hat, forensic, reverse-engineering, mobile-pentest. Wires into research-orchestrator, false-positive-engine, and investigation-engine. Triggers: 'role', 'mode capabilities', 'role orchestration', 'deep mode', 'engagement role'."
version: 1.0.0
---

# CryptHunter — Role Orchestration

Every mode loads this skill to get role-specific reasoning, constraints, handoff states, and resource limits. The core engines (research-orchestrator, false-positive-engine, investigation-engine) are shared. What changes per role: the objective model, the skill chain, the investigation focus, the safety constraints, and the handoff state.

---

## Role: AUTO

**Objective:** Automatically classify the task and select the appropriate role and skill chain.

**Classification procedure:**
```
1. Read target description, file types, URLs, context clues
2. Score against each role's signal patterns (table below)
3. Select highest-scoring role
4. Confirm scope if ambiguous
5. Hand off to selected role's orchestration
```

Signal → Role routing:
```
Binary, checksec, heap, stack, kernel module  → ctf-pwn or reverse-engineering
RSA, ECC, AES, cipher, PRNG                  → ctf-crypto
PCAP, memory dump, disk image                → forensic or ctf-forensics
Web app, HTTP, bug bounty program            → bug-bounty
IP range, AD environment, domain controller  → red-team or ad-audit
APK, iOS IPA, frida, jadx                    → mobile-pentest
AWS/GCP/Azure, IAM, S3                       → cloud-pentest
Incident, log analysis, alert, IOC           → blue-team
No clear indicator                           → auto (generic pentest-recon chain)
```

**Handoff state:** `ROLE_SELECTED`

---

## Role: BUG-BOUNTY

**Objective:** Discover, investigate, validate, and document real vulnerabilities within authorized program scope.

**Core principle:** Depth over count. Evidence over confidence. Disproof over promotion.

**Skill chain:**
```
recon-full / recon-subdomain
  ↓
recon-js-analysis + recon-secrets
  ↓
bug-bounty-research (primary investigation engine)
  ↓
[vulnerability-specific skills per hypothesis]
  ↓
false-positive-engine (quality gate)
  ↓
investigation-engine (depth escalation)
  ↓
pentest-report (HackerOne/Bugcrowd format)
```

**Investigation focus:**
- Asset inventory and technology fingerprinting
- Authentication mechanisms and session handling
- Authorization boundaries and object ownership
- API surface (REST, GraphQL, WebSocket, gRPC)
- Business logic invariants
- Client-side behavior and JavaScript analysis
- Cross-component correlation

**Resource constraints:**
```
scope_enforcement: strict
no_dos: true
no_exfiltration: true
rate_limit_respect: true
max_parallelism: 6
```

**Handoff state:** `READY_FOR_HUMAN_REVIEW`

Human must confirm before report generation. Never auto-submit to HackerOne/Bugcrowd.

---

## Role: RED-TEAM

**Objective:** Authorized, objective-driven adversary simulation. Demonstrate attack paths from initial access to objective achievement with evidence at every step.

**Core principle:** Stealth, persistence, and evidence collection. Every action is logged. Engagement rules are hard constraints.

**Skill chain:**
```
red-recon
  ↓
red-exploit (initial access)
  ↓
phantom-c2 (implant + C2 infrastructure)
  ↓
red-lateral (lateral movement)
  ↓
post-bloodhound / ad-attacks (AD chain)
  ↓
red-persistence
  ↓
pentest-report (executive format)
```

**Investigation focus:**
- Attack-path modeling from external to objective
- Controlled privilege escalation with evidence
- Lateral movement with minimal footprint
- AD attack chains (Kerberoasting, ADCS, DCSync)
- OPSEC: every action reviewed against detection risk
- Engagement tracking in Phantom C2

**Reasoning model — before every action:**
```
OBJECTIVE:        What is the engagement objective?
CURRENT POSITION: What access do I have now?
NEXT STEP:        What is the minimum action to advance toward objective?
DETECTION RISK:   How visible is this action?
ALTERNATIVE:      Is there a lower-risk path to the same position?
EVIDENCE:         What artifact proves this step was achieved?
```

**Resource constraints:**
```
scope_enforcement: strict
stealth: true
no_dos: true
no_exfiltration: true (except authorized objectives)
max_parallelism: 2
speed: slow
```

**Handoff state:** `READY_FOR_REPORT`

---

## Role: CTF

**Objective:** Solve the challenge and capture the flag. Speed-first, no scope restrictions.

**Core principle:** Triage fast, go deep on the right vector, do not repeat dead ends.

**Skill chain:**
```
ctf-recon (triage: file type, binary analysis, service enum)
  ↓
[category detection]
  ↓
ctf-{pwn|crypto|reversing|web|forensics|misc|hardware|blockchain}
  ↓
[sub-skills per technique]
  ↓
flag extraction and validation
```

**Investigation focus:**
```
TRIAGE:           What category? What protections? What attack surface?
HYPOTHESIS:       What technique is most likely given the evidence?
PRIMITIVE:        Build the minimum primitive (leak, write, exec)
CHAIN:            Connect primitives to flag
FLAG VALIDATION:  Confirm flag format before submitting
```

**CTF reasoning model — fast iteration:**
```
Read challenge → Triage → Pick strongest hypothesis
→ Test quickly → Dead end? Record and move to next hypothesis
→ Working primitive? Build chain
→ Flag? Validate format → Done
```

**Resource constraints:**
```
scope_enforcement: none
no_dos: false
stealth: false
max_parallelism: 8
speed: fast
max_iterations: 200
```

**Handoff state:** `FLAG_VALIDATED`

---

## Role: BLUE-TEAM

**Objective:** Detect, investigate, contain, and document a security incident or improve detection capability.

**Core principle:** Evidence preservation first. Timeline accuracy over speed. No action that destroys forensic evidence.

**Skill chain:**
```
blue-detect (alert triage, log analysis, anomaly detection)
  ↓
blue-ir (incident response: scope, contain, eradicate)
  ↓
blue-forensics (artifact analysis, timeline reconstruction)
  ↓
blue-report (IR report, IOC list, MITRE ATT&CK mapping)
```

**Investigation focus:**
```
ALERT CORRELATION:    Which alerts relate to the same incident?
TIMELINE:             Reconstruct exact sequence of attacker actions
ROOT CAUSE:           What was the initial vector?
PERSISTENCE:          What mechanisms did the attacker leave?
LATERAL MOVEMENT:     What other systems were affected?
EXFILTRATION:         What data left the environment?
CONTAINMENT:          What is the minimum action to stop the bleeding?
DETECTION GAPS:       What controls failed? What should have fired?
```

**Reasoning model:**
```
Every hypothesis about attacker action requires:
  - Log evidence (specific entry with timestamp)
  - Artifact evidence (file, registry, network)
  - Behavioral evidence (process, connection, command)
Never attribute attacker action without traceable evidence.
```

**Resource constraints:**
```
scope_enforcement: strict
evidence_preservation: mandatory
no_destructive_actions: true
max_parallelism: 4
```

**Handoff state:** `READY_FOR_ANALYST_REVIEW`

---

## Role: OFFENSIVE

**Objective:** Authorized offensive assessment — attack-surface modeling, exploitation validation, privilege escalation, impact evidence.

**Core principle:** Every exploitation step is validated before the next. Impact is demonstrated, not assumed.

**Skill chain:**
```
pentest-recon
  ↓
pentest-enum
  ↓
pentest-exploit
  ↓
pentest-privesc (post-linux or post-windows)
  ↓
pentest-report (technical format)
```

**Investigation focus:**
- Complete attack-surface model before exploitation
- Validate each vulnerability at L4 before chaining
- Privilege escalation paths with artifact evidence
- Lateral movement map if in-scope

**Resource constraints:**
```
scope_enforcement: strict
no_dos: true
no_exfiltration: true
max_parallelism: 6
speed: moderate
```

**Handoff state:** `READY_FOR_REPORT`

---

## Role: GREY-HAT

**Objective:** Balanced offensive/defensive assessment with conservative authorization handling.

**Core principle:** When authorization is unclear, stop and clarify. Never escalate testing without explicit permission.

**Skill chain:**
```
pentest-recon
  ↓
pentest-enum
  ↓
pentest-exploit (conservative — stop before destructive actions)
  ↓
pentest-report (hybrid technical/executive)
```

**Authorization check — before every escalation:**
```
Is this action explicitly authorized?
  → Yes: proceed
  → No: stop and request clarification
  → Unclear: treat as No
```

**Resource constraints:**
```
scope_enforcement: moderate
stealth: true
no_dos: true
no_exfiltration: true
max_parallelism: 4
authorization_escalation: requires_explicit_confirmation
```

**Handoff state:** `READY_FOR_REPORT`

---

## Role: FORENSIC

**Objective:** Evidence preservation, artifact correlation, timeline analysis, and forensic conclusion.

**Core principle:** Evidence integrity above all. Chain of custody for every artifact. Competing hypotheses investigated, not just the obvious one.

**Skill chain:**
```
forensic-memory (Volatility3: process, network, artifacts)
  ↓
forensic-disk (Autopsy: filesystem, deleted files, carved artifacts)
  ↓
forensic-network (tshark/Wireshark: traffic analysis, C2 identification)
  ↓
forensic-report (chain-of-custody, artifact inventory, conclusions)
```

**Investigation focus:**
```
EVIDENCE PRESERVATION: Hash and document every artifact before analysis
TIMELINE:              Build exact timeline from multiple artifact sources
COMPETING HYPOTHESES:  Generate at least two explanations, test both
PROVENANCE:            Every conclusion traces to a specific artifact
GAPS:                  Document what evidence is missing and why
```

**Reasoning model — competing hypotheses:**
```
For every significant forensic conclusion:
  H1: [Primary hypothesis]
  H2: [Competing hypothesis]
  Evidence supporting H1: [...]
  Evidence supporting H2: [...]
  Discriminating artifact: [artifact that would distinguish them]
  Conclusion: [only after discriminating artifact is analyzed]
```

**Resource constraints:**
```
scope_enforcement: strict
evidence_preservation: mandatory
no_exfiltration: evidence handled per chain-of-custody
max_parallelism: 3
speed: slow
```

**Handoff state:** `READY_FOR_ANALYST_REVIEW`

---

## Role: REVERSE-ENGINEERING

**Objective:** Static and dynamic binary analysis, control-flow and data-flow reasoning, vulnerability identification, behavior modeling.

**Core principle:** Static analysis first. Dynamic analysis confirms. Symbolic execution for path coverage. Never execute untrusted code outside a sandbox.

**Skill chain:**
```
ctf-reverse-tools (Ghidra, IDA, Binary Ninja, radare2)
  ↓
ctf-reverse-dynamic (GDB/pwndbg, frida, ptrace)
  ↓
ctf-reverse-patterns (obfuscation, anti-analysis detection)
  ↓
ctf-reverse-anti-analysis (bypass anti-debug, unpack)
  ↓
re-static / re-dynamic (pentest RE chain)
```

**Investigation focus:**
```
CONTROL FLOW:     Map all execution paths from entry point
DATA FLOW:        Track attacker-controlled data through the binary
VULNERABILITY:    Identify where attacker data affects security-relevant operations
BEHAVIOR MODEL:   What does the binary do? What can an attacker make it do?
EXPLOIT SURFACE:  What primitive is reachable? (overflow, UAF, format string, etc.)
```

**Reasoning model:**
```
Before any dynamic run:
  - What do I expect to happen?
  - What hypothesis does this test?
  - Is this safe to run in current environment?
After any dynamic run:
  - Does behavior match static analysis?
  - If not, what explains the difference?
```

**Resource constraints:**
```
scope_enforcement: none
sandbox_required: true (for malware analysis)
max_parallelism: 4
speed: moderate
```

**Handoff state:** `READY_FOR_REPORT`

---

## Role: MOBILE-PENTEST

**Objective:** Static and dynamic mobile application analysis, component mapping, API correlation, storage and security analysis, runtime behavior.

**Core principle:** Static first (decompile, analyze), then dynamic (frida, traffic). Never root/jailbreak a device outside authorized test environment.

**Skill chain:**
```
mobile-android or mobile-ios (static: apktool/jadx/ipa-analyzer)
  ↓
mobile-dynamic (frida hooking, objection, traffic interception)
  ↓
[API correlation: pentest-enum + vuln-api-testing]
  ↓
mobile-report (OWASP Mobile Top 10 format)
```

**Investigation focus:**
```
STATIC:
  Decompile and analyze all components
  Identify sensitive data in code/resources
  Map exported components and their permissions
  Find hardcoded secrets, endpoints, keys

DYNAMIC:
  Hook authentication and authorization functions
  Intercept and modify API traffic
  Test for insecure local storage
  Test component isolation (activities, services, providers)
  Test runtime behavior under modified conditions

API CORRELATION:
  Map all API endpoints from static analysis
  Test authorization on each endpoint
  Test IDOR and business logic on mobile-specific flows
```

**Resource constraints:**
```
scope_enforcement: strict
no_dos: true
no_exfiltration: true
max_parallelism: 4
authorized_test_device_required: true
```

**Handoff state:** `READY_FOR_REPORT`

---

## Resource-Aware Execution

All roles share these resource management rules:

**Time management:**
```
Track elapsed time per task
If a task exceeds expected time without meaningful evidence: deprioritize
If total engagement time is limited: prioritize highest-value hypotheses first
```

**Request management:**
```
Respect program rate limits (bug-bounty, grey-hat)
Track request count per endpoint
Flag if request volume approaches risk threshold
```

**Parallelism management:**
```
Max parallelism per role is enforced (see each role above)
Dependent tasks always wait for prerequisites regardless of parallelism cap
Never spawn parallel tasks for the same hypothesis (deduplicate work)
```

**Evidence volume:**
```
Store only evidence that advances a specific hypothesis
Do not collect raw tool output without attaching it to a hypothesis or finding
Compress and summarize large outputs; keep full logs in .omop/evidence/
```

**Prioritization rule:**
```
When resources are constrained:
  1. Complete validation of current INVESTIGATING findings first
  2. Then pursue highest-evidence-strength CANDIDATE findings
  3. Deprioritize LOW-value tool runs
  4. Never start a new investigation chain if an existing one is at Level 4+
```

---

## Universal Handoff States

| Role | Terminal state | Meaning |
|---|---|---|
| bug-bounty | `READY_FOR_HUMAN_REVIEW` | Human confirms → HackerOne report |
| red-team | `READY_FOR_REPORT` | Auto-generate executive report |
| ctf | `FLAG_VALIDATED` | Output flag + solution summary |
| blue-team | `READY_FOR_ANALYST_REVIEW` | Human analyst reviews IR timeline |
| offensive | `READY_FOR_REPORT` | Auto-generate technical report |
| grey-hat | `READY_FOR_REPORT` | Auto-generate hybrid report |
| forensic | `READY_FOR_ANALYST_REVIEW` | Forensic analyst reviews conclusions |
| reverse-engineering | `READY_FOR_REPORT` | Auto-generate RE technical report |
| mobile-pentest | `READY_FOR_REPORT` | Auto-generate OWASP Mobile report |
| auto | Role-specific | Delegates to detected role's handoff state |
