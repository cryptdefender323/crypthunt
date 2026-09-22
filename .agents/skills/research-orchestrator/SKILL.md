---
name: research-orchestrator
description: "Core autonomous research orchestration engine. Manages task decomposition, task graph (dependency-aware execution), adaptive planning, long-running persistent state, analyst specialization, parallel/sequential subtask coordination, and quality metrics. Used by all 10 CryptHunter modes. Triggers: 'orchestrate', 'research plan', 'task graph', 'decompose', 'long investigation', 'multi-stage', 'research state', 'orchestration engine'."
version: 1.0.0
---

# CryptHunter — Research Orchestration Engine

The intelligence of CryptHunter comes not from running more tools, but from:

- understanding the task before touching a tool
- building an explicit model of the target
- forming testable hypotheses from evidence
- selecting the minimum useful test
- learning from every result — including failures
- challenging its own conclusions actively
- only promoting findings when evidence supports them

---

## Execution Model

Every engagement follows this lifecycle. No shortcuts.

```
UNDERSTAND    → What is the task? What is the scope? What do we know?
MODEL         → Build target model from initial evidence
DISCOVER      → Expand attack surface systematically
HYPOTHESIZE   → Generate specific, testable claims about vulnerabilities
PLAN          → Create dependency-aware task graph
EXECUTE       → Run minimum test that answers the current question
OBSERVE       → Record exact result — no interpretation yet
CORRELATE     → Connect result to existing evidence and model
VALIDATE      → Advance finding through quality gate
DISPROVE      → Actively try to defeat the current conclusion
ITERATE       → Update plan, prune dead ends, open new paths
VERIFY        → Clean-state reproduction of promoted findings
REPORT        → Generate from verified evidence only
```

Never skip from EXECUTE directly to REPORT.
Never skip DISPROVE.
Never infer impact from root cause without demonstration.

---

## Persistent Research State

Maintain this state object throughout the engagement. Update after every meaningful action.

```json
{
  "engagement_id": "string",
  "role": "bug-bounty | red-team | ctf | blue-team | offensive | grey-hat | forensic | reverse-engineering | mobile-pentest | auto",
  "objective": "string",
  "scope": {
    "in_scope": [],
    "out_of_scope": [],
    "restrictions": [],
    "authorization": "string"
  },
  "target_model": {
    "technologies": [],
    "ports": [],
    "services": [],
    "endpoints": [],
    "apis": [],
    "auth_mechanisms": [],
    "auth_boundaries": [],
    "workflows": [],
    "components": [],
    "cloud_resources": [],
    "dns": [],
    "subdomains": []
  },
  "attack_surface": [],
  "task_graph": {},
  "hypotheses": {
    "open": [],
    "confirmed": [],
    "rejected": [],
    "deferred": []
  },
  "evidence": [],
  "tools_used": [],
  "tests_performed": [],
  "failed_tests": [],
  "successful_tests": [],
  "findings": {
    "candidate": [],
    "investigating": [],
    "needs_validation": [],
    "ready_for_human_review": [],
    "validated": [],
    "disproven": [],
    "out_of_scope": []
  },
  "false_positives": [],
  "duplicates": [],
  "unanswered_questions": [],
  "next_actions": [],
  "metrics": {
    "candidate_count": 0,
    "disproven_count": 0,
    "validated_count": 0,
    "needs_validation_count": 0,
    "duplicate_count": 0,
    "tool_failures": 0,
    "repeated_test_rate": 0.0,
    "evidence_completeness": 0.0
  }
}
```

Persist state to `.omop/engagement/<engagement_id>/research-state.json` after every significant update. This allows the investigation to resume after context compaction.

---

## Task Decomposition

When given a high-level objective, decompose it before touching any tool.

General web assessment decomposition:
```
1.  Determine scope and authorization
2.  Build asset inventory (DNS, subdomains, IPs)
3.  Identify live hosts and services
4.  Identify technologies and versions
5.  Discover attack surface (endpoints, APIs, parameters)
6.  Map application architecture and component boundaries
7.  Identify authentication mechanisms
8.  Identify authorization boundaries and object ownership
9.  Discover API surface (REST, GraphQL, WebSocket, gRPC)
10. Analyze client-side behavior (JS, DOM, storage)
11. Generate hypotheses from collected evidence
12. Prioritize by evidence strength and potential impact
13. Execute validation tests for top hypotheses
14. Correlate findings across components
15. Re-test important findings from clean state
16. Prepare structured evidence
17. Produce final report from validated findings only
```

Do not run steps 12-17 until steps 1-11 produce meaningful evidence.
Do not run step 13 before step 12 prioritizes.
Dynamically add steps when evidence reveals new attack surface.

---

## Task Graph

Represent all tasks as a dependency graph. A task may not execute until all its dependencies have produced their required evidence.

```
TASK GRAPH STRUCTURE:

task_id:
  description: string
  status: pending | active | blocked | complete | skipped | failed
  depends_on: [task_id, ...]
  required_evidence: [evidence_key, ...]
  produces_evidence: [evidence_key, ...]
  analyst_role: RECON | ATTACK_SURFACE | APPLICATION | AUTH | AUTHZ | VULN | EXPLOIT | VALIDATE | IMPACT | EVIDENCE | REPORT
  priority: 1-10
  estimated_value: high | medium | low
  last_result: string | null
```

Example dependency chain:
```
dns_enum           → produces: dns_records, subdomains
                   ↓
live_host_check    → requires: subdomains     → produces: live_hosts
                   ↓
tech_detect        → requires: live_hosts     → produces: tech_stack
                   ↓
endpoint_discovery → requires: tech_stack     → produces: endpoints
                   ↓
auth_analysis      → requires: endpoints      → produces: auth_mechanisms
param_analysis     → requires: endpoints      → produces: parameters
                   ↓
hypothesis_gen     → requires: auth_mechanisms, parameters → produces: hypotheses
                   ↓
validation         → requires: hypotheses     → produces: findings
```

---

## Adaptive Planning

After every meaningful result, run this reassessment:

```
WHAT CHANGED?
  New asset discovered?
  New technology identified?
  New endpoint found?
  Authentication behavior changed?
  Previous assumption invalidated?

WHAT DID WE LEARN?
  Which hypotheses became stronger?
  Which became weaker?
  What root cause emerged?

WHAT REMAINS UNKNOWN?
  What attack surface is unexplored?
  What security boundary is unverified?
  What impact is undemonstrated?

HIGHEST-VALUE NEXT ACTION?
  Which open task would most change our understanding?
  Which hypothesis has the strongest evidence so far?
  Which disproof test is overdue?

PLAN UPDATES:
  Discard: tasks made unnecessary by new evidence
  Add:     tasks revealed by new attack surface
  Promote: tasks whose prerequisites are now met
  Defer:   tasks with low value given current evidence
```

---

## Analyst Specialization

Within a single model session, separate reasoning by analyst role. Each analyst produces structured evidence for the next stage. This is a reasoning discipline, not a model boundary.

| Analyst | Responsibility | Produces |
|---|---|---|
| RECON | Asset discovery, DNS, subdomains, IPs, TLS | Asset inventory, tech hints |
| ATTACK_SURFACE | Endpoint mapping, API surface, parameter discovery | Surface model |
| APPLICATION | Architecture, component boundaries, workflows | App model |
| AUTHENTICATION | Auth mechanisms, session handling, token analysis | Auth model |
| AUTHORIZATION | Access controls, object ownership, privilege boundaries | Authz model |
| VULNERABILITY | Hypothesis generation from evidence, pattern matching | Hypothesis list |
| EXPLOITABILITY | PoC design, reproduction steps, primitive construction | Reproduction plan |
| VALIDATION | Evidence testing, control/negative tests, gate promotion | Evidence record |
| IMPACT | Security consequence demonstration, blast radius | Impact evidence |
| EVIDENCE | Evidence organization, traceability, completeness check | Evidence package |
| REPORT | Report generation from verified evidence only | Final report |

When switching analyst context, explicitly state:
```
[ANALYST: VULNERABILITY]
Using evidence from ATTACK_SURFACE and APPLICATION models.
Generating hypotheses...
```

---

## Parallel Investigation

Independent tasks may run in parallel. Dependent tasks must wait.

Independent (can run simultaneously):
- DNS enumeration
- HTTP probing
- JavaScript analysis
- Technology detection
- Port scanning

Sequential (must wait for prerequisite):
- Hypothesis generation → requires attack surface model
- Validation testing → requires specific hypothesis
- Impact demonstration → requires reproduction
- Report → requires validated findings

Never create uncontrolled concurrency. Each parallel branch must write to a distinct evidence key.

---

## Automatic Reassessment After Significant Finding

After any finding reaches READY_FOR_HUMAN_REVIEW, reassess the entire target model:

```
Did this finding reveal new attack surface?
  → Add new endpoint/component discovery tasks

Did this change authentication assumptions?
  → Re-run auth analysis on related components

Did this reveal a related component not previously in scope?
  → Check scope before investigating

Did this invalidate previous conclusions?
  → Mark affected findings as NEEDS_VALIDATION

Should another skill now be activated?
  → Queue appropriate skill (e.g., vuln-idor after authz flaw found)
```

---

## Quality Metrics

Track throughout the engagement. Use to adjust orchestration decisions.

```
candidate_count:        Total findings entered as CANDIDATE
disproven_count:        Findings confirmed as NOT_A_VULNERABILITY
validated_count:        Findings confirmed as VALIDATED
needs_validation_count: Findings stalled at NEEDS_VALIDATION
duplicate_count:        Findings correlated into existing findings
tool_failures:          Tools that returned errors or unusable output
repeated_test_rate:     Fraction of tests that re-tested already-disproven conditions
evidence_completeness:  Fraction of validated findings with full evidence package
```

A healthy engagement has:
- `disproven_count` > 0 (active disproof is happening)
- `repeated_test_rate` < 0.15 (not looping on dead ends)
- `evidence_completeness` = 1.0 for all VALIDATED findings
- `validated_count / candidate_count` < 0.4 (not rubber-stamping candidates)

---

## Knowledge from Negative Results

Every failed or negative test is recorded and used.

```json
{
  "test_id": "string",
  "hypothesis_id": "string",
  "what_was_tested": "string",
  "why": "string",
  "what_happened": "string",
  "hypothesis_weakened": "string",
  "should_retest_under_state": "string | null"
}
```

Do not repeat a test that already produced a definitive negative result unless the application state has changed in a meaningful way.

---

## Deduplication

Before promoting any new finding, compare against all existing findings:

```
Same root cause?        → CORRELATE, do not duplicate
Same endpoint?          → Check for variant vs. same issue
Same security boundary? → May be same root cause with different manifestation
Same impact?            → Strong signal for deduplication
Same application component? → Investigate as related
```

When deduplicating, update the existing finding with additional evidence rather than creating a new entry. Track the duplicate count in metrics.

---

## State Persistence

Write state to disk after:
- Any finding state change
- Any task graph update
- Any hypothesis confirmation or rejection
- End of any major phase

```bash
cat > .omop/engagement/<engagement_id>/research-state.json << 'EOF'
<state_json>
EOF
```

On session resume, load state from disk before any action:
```bash
cat .omop/engagement/<engagement_id>/research-state.json
```

Never assume state is preserved in memory across context compaction.
