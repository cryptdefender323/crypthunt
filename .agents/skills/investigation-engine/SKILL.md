---
name: investigation-engine
description: "Deep investigation engine for CryptHunter. Adaptive depth levels 1-8, intelligent tool selection (question-driven), tool failure classification and recovery, conflict resolution between contradicting tools, complex attack-path analysis and graph construction, root-cause/impact separation. Used whenever a finding reaches INVESTIGATING state. Triggers: 'investigate', 'deep investigation', 'tool selection', 'attack path', 'tool failure', 'conflict resolution', 'investigate candidate', 'dig deeper'."
version: 1.0.0
---

# CryptHunter — Investigation Engine

For every promising candidate, investigation depth adapts to evidence quality. Every tool run answers a specific question. Every failure is classified, not silently ignored.

---

## Investigation Cycle

Before every action in an investigation:

```
QUESTION:        What am I trying to determine?
HYPOTHESIS:      What result would confirm or deny it?
TEST:            What exact action will I take?
EXPECTED RESULT: What would confirm the hypothesis?
OBSERVED RESULT: What actually happened?
CONCLUSION:      What does this tell me? How does the model change?
```

Never run a tool without filling in QUESTION and HYPOTHESIS first. If you cannot state what question a tool run answers, skip it.

---

## Adaptive Depth Levels

Investigation depth increases as evidence quality justifies it. Stop at the level where evidence already disproves the hypothesis or where further testing has no additional information value.

### Level 1 — Basic Reproduction

```
Goal:    Confirm the candidate behavior is real and reproducible.
Tests:
  - Reproduce exact behavior from initial observation
  - Verify it is not a transient artifact
  - Establish baseline for comparison
Stop if: Behavior does not reproduce → NEEDS_VALIDATION
Proceed: Behavior reproduces consistently
```

### Level 2 — Control / Negative Testing

```
Goal:    Confirm the behavior is specific to the vulnerability condition.
Tests:
  - Control test: legitimate equivalent condition
  - Negative test: remove vulnerability condition
  - Baseline comparison: delta between normal and candidate
Stop if: Behavior appears in control or disappears with legitimate input → DISPROVEN
Proceed: Behavior is specific to vulnerability condition
```

### Level 3 — Related Endpoints and Parameters

```
Goal:    Determine scope of the issue within the application.
Tests:
  - Test related endpoints that use same component or logic
  - Test variations of the vulnerable parameter
  - Test same operation on different object types
  - Test same operation via alternate HTTP methods
Stop if: No other endpoints exhibit the behavior → narrow scope, proceed with finding
Proceed: Multiple endpoints affected → broader root cause, update target model
```

### Level 4 — Authentication / Authorization State Comparison

```
Goal:    Confirm the security boundary that is absent or bypassed.
Tests:
  - Unauthenticated vs. authenticated state
  - Low-privilege vs. high-privilege state
  - Owner vs. non-owner comparison
  - Cross-account object access
  - Role-based access comparison
Stop if: Behavior is identical for all auth states → not an authorization issue
Proceed: Auth state comparison reveals privilege differential
```

### Level 5 — Workflow and Business Logic Analysis

```
Goal:    Understand the intended workflow and where it breaks.
Tests:
  - Map the full intended transaction/workflow
  - Identify the invariant that should hold
  - Test workflow with skipped steps
  - Test workflow with replayed steps
  - Test workflow with out-of-order requests
  - Test state transitions that should be forbidden
Stop if: Workflow analysis shows behavior is within design intent
Proceed: Workflow analysis reveals a broken invariant
```

### Level 6 — Cross-Component Correlation

```
Goal:    Determine if this connects to other components or findings.
Tests:
  - Does the affected component interact with other components?
  - Does this share infrastructure or code with another vulnerable area?
  - Can the output of this vulnerability feed another?
  - Is the root cause shared with another finding?
Stop if: No meaningful connection to other components
Proceed: Correlation reveals attack chain candidate or shared root cause
```

### Level 7 — Impact Verification

```
Goal:    Demonstrate the concrete security consequence.
Tests:
  - Minimum viable PoC that demonstrates actual impact
  - Safe demonstration within scope and authorization
  - Impact on real data, functionality, or security boundary
  - Blast radius assessment
Stop if: Impact cannot be safely demonstrated within scope → NEEDS_VALIDATION, mark impact as NOT_VERIFIED
Proceed: Impact is demonstrated with traceable evidence
```

### Level 8 — Clean-State Reproduction

```
Goal:    Confirm the finding is fully reproducible as documented.
Tests:
  - Fresh session, fresh account, no prior state
  - Follow exact reproduction steps from scratch
  - Verify the finding holds under these conditions
Stop if: Cannot reproduce from clean state → NEEDS_VALIDATION
Proceed: Clean-state reproduction succeeds → READY_FOR_HUMAN_REVIEW
```

---

## Intelligent Tool Selection

Do not run every tool. For every proposed tool execution, answer these questions first:

```
QUESTION:          What specific question will this tool answer?
WHY THIS TOOL:     Why is this tool better than alternatives for this question?
EXPECTED OUTPUT:   What specific information am I expecting to receive?
RISK:              Could this tool cause harm, trigger alerts, or violate rate limits?
SCOPE:             Is this tool's target explicitly in scope?
PRIOR EVIDENCE:    What previous evidence justifies running this now?
NEXT DECISION:     How will the output change the investigation plan?
```

If the tool cannot answer a meaningful question that would change the investigation: SKIP IT.

Tool value tiers:
```
HIGH VALUE:   Tool output directly advances or defeats a specific hypothesis
MEDIUM VALUE: Tool output may reveal new attack surface worth investigating
LOW VALUE:    Tool output is generic, already known, or adds no new evidence
SKIP:         Tool run cannot answer any current open question
```

Only run HIGH and MEDIUM value tools. Skip LOW and SKIP tier without hesitation.

---

## Tool Failure Classification

When a tool fails or returns unexpected output, classify the failure before drawing conclusions.

| Failure Type | Description | Action |
|---|---|---|
| `NETWORK_FAILURE` | Connection refused, timeout, DNS failure | Retry with backoff; try alternate host resolution |
| `AUTH_FAILURE` | 401/403, session expired, token invalid | Refresh auth; verify credentials; check scope |
| `RATE_LIMIT` | 429, WAF block, connection throttle | Back off; reduce concurrency; resume later |
| `TOOL_FAILURE` | Tool crash, parse error, dependency missing | Try alternative tool; check tool version |
| `INVALID_INPUT` | Tool rejects input format | Fix input format; verify target syntax |
| `TARGET_BEHAVIOR` | Application returns unexpected but valid response | Investigate response as evidence, not failure |
| `UNKNOWN` | Cannot classify | Log full error; try different approach; do not assume safe |

**Critical rule:** A tool failure is NEVER treated as negative security evidence. A timeout does not mean the endpoint is safe. A 403 does not mean access is properly controlled. A tool crash does not mean no vulnerability exists.

When a tool fails, select an alternative method:

```
Primary tool failed?
  → Try equivalent tool (e.g., curl if httpx fails)
  → Try manual reproduction
  → Try from different network position if rate-limited
  → Log failure with classification
  → Continue investigation with available evidence
  → Mark tool failure in research state metrics
```

---

## Conflict Resolution

When two tools produce contradictory results about the same target:

```
STEP 1: PRESERVE BOTH RESULTS
  Do not choose the result that confirms the vulnerability.
  Do not silently discard either observation.

STEP 2: CHARACTERIZE EACH RESULT
  Which tool produced this result?
  What assumptions does that tool make?
  What HTTP method / parameter / state was used?
  What version of the tool?

STEP 3: FIND THE DISCRIMINATING DIFFERENCE
  Did they test at different times?
  Did they use different auth states?
  Did they probe different parameter representations?
  Did one follow redirects and the other not?

STEP 4: DESIGN A DISCRIMINATING TEST
  Identify the single condition that would explain the difference.
  Test that condition directly.

STEP 5: RECORD THE RESOLUTION
  Which result was correct and why.
  What the other tool got wrong and why.
  Update the evidence record.
```

Never silently resolve conflict in favor of the vulnerability hypothesis.

---

## Attack-Path Analysis

When multiple weaknesses interact, construct an explicit attack graph. Every edge requires evidence.

```
ATTACK GRAPH STRUCTURE:

node:
  id: string
  type: exposure | access | weakness | control_bypass | sensitive_function | impact
  description: string
  evidence: [evidence_id, ...]
  evidence_level: L1 | L2 | L3 | L4 | L5 | L6
  confirmed: bool

edge:
  from: node_id
  to: node_id
  description: "How node A enables node B"
  evidence: [evidence_id, ...]
  confirmed: bool
```

Example attack path:
```
[exposure: subdomain enumeration reveals staging environment]  L1
                    ↓  evidence: dns_records_003
[access: staging has default credentials]  L2
                    ↓  evidence: auth_test_017
[weakness: staging shares database with production]  L3
                    ↓  evidence: app_model_analysis_002
[control_bypass: production data accessible via staging auth]  L4
                    ↓  evidence: http_log_041
[sensitive_function: PII accessible without authorization]  L5
                    ↓  evidence: data_access_test_008
[impact: unauthorized access to user PII]  DEMONSTRATED
```

Rules for attack graph construction:
- Every edge must have evidence. Inferred edges are labeled `HYPOTHESIS`.
- A chain is only as strong as its weakest evidence link.
- Do not construct a chain that skips undemonstrated steps.
- A chain with a `HYPOTHESIS` edge is a CANDIDATE attack path, not a VALIDATED one.
- When a chain reaches L4 on every edge: promote to READY_FOR_HUMAN_REVIEW.

---

## Root-Cause and Impact Separation

Track these five dimensions independently for every finding. Never infer one from another without demonstration.

```
SYMPTOM:        What the scanner or first observation showed
                Example: "Authorization header not present on API call"

ROOT CAUSE:     Why the behavior occurs
                Example: "API endpoint missing middleware authentication check"

EXPLOITABILITY: Can this be triggered by an external attacker?
                Example: "Yes — endpoint reachable without authentication"

SECURITY BOUNDARY: What protection is absent or bypassed?
                Example: "Authentication boundary for /api/v2/admin/* not enforced"

IMPACT:         What can an attacker demonstrably do?
                Example: NOT_VERIFIED until Level 7 impact test completes
```

The gap between ROOT CAUSE and IMPACT is where most false positives live. A missing auth check on an endpoint that returns only public data is not a finding. A missing auth check on an endpoint that returns session tokens is.

---

## Investigation State Record

Maintain per-candidate investigation state:

```json
{
  "candidate_id": "string",
  "current_depth": 1,
  "depth_history": [],
  "question_log": [
    {
      "depth": 1,
      "question": "string",
      "hypothesis": "string",
      "test": "string",
      "expected": "string",
      "observed": "string",
      "conclusion": "string",
      "tool": "string",
      "tool_status": "success | NETWORK_FAILURE | AUTH_FAILURE | RATE_LIMIT | TOOL_FAILURE | INVALID_INPUT | TARGET_BEHAVIOR | UNKNOWN"
    }
  ],
  "attack_path": {
    "nodes": [],
    "edges": []
  },
  "stop_reason": null,
  "promotion_blocked_by": []
}
```
