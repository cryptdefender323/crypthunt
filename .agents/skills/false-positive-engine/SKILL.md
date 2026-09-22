---
name: false-positive-engine
description: "Dedicated false-positive suppression engine for all CryptHunter modes. 9-stage FP elimination battery, 10-point evidence requirement gate, finding quality states (CANDIDATE→INVESTIGATING→NEEDS_VALIDATION→READY_FOR_HUMAN_REVIEW→VALIDATED→DISPROVEN→OUT_OF_SCOPE), active red-teaming of own hypotheses, root-cause/impact separation, deduplication. Used before any finding is promoted. Triggers: 'validate finding', 'false positive check', 'verify vuln', 'evidence gate', 'finding quality', 'disprove', 'fp check'."
version: 1.0.0
---

# CryptHunter — False-Positive Suppression Engine

A scanner result is not evidence of impact.
A hypothesis is not a vulnerability.
An interesting observation is not a finding.

Every candidate goes through this engine before promotion. No exceptions.

---

## Finding State Machine

```
CANDIDATE
   ↓  (investigation begins)
INVESTIGATING
   ↓  (reproduction attempted)
NEEDS_VALIDATION   ←──── (evidence insufficient at any stage)
   ↓  (all 10 evidence requirements met)
READY_FOR_HUMAN_REVIEW
   ↓  (human confirms)
VALIDATED
```

Alternative exits:
```
Any stage → DISPROVEN       (hypothesis actively defeated)
Any stage → OUT_OF_SCOPE    (target outside authorized boundary)
```

Promotion rules:
- A scanner signature alone: CANDIDATE only. Never higher.
- Reproduction without control test: NEEDS_VALIDATION. Never higher.
- Control test passed without impact demonstration: NEEDS_VALIDATION.
- All 10 requirements met: READY_FOR_HUMAN_REVIEW.
- Human explicit confirmation: VALIDATED.

---

## Stage 1: Baseline

Before testing any hypothesis, establish normal application behavior.

```
QUESTION:   What does the application do under normal conditions?
RECORD:
  - Normal response for the endpoint
  - Normal response codes, body, headers, timing
  - Normal authentication behavior
  - Normal authorization behavior
  - Normal error behavior
PURPOSE:    Every subsequent test is compared against this baseline.
            Without a baseline, anomalies cannot be distinguished from normal behavior.
```

If baseline cannot be established: DEFER investigation. Do not proceed.

---

## Stage 2: Reproduce

Reproduce the candidate behavior independently from a clean state.

```
QUESTION:   Can this behavior be triggered again with the same input?
METHOD:     Fresh session, fresh cookies, fresh state.
PASS:       Behavior appears consistently under same conditions.
FAIL:       Behavior does not reproduce → likely transient. NEEDS_VALIDATION.
RECORD:
  - Exact request (method, path, headers, body)
  - Exact response (status, headers, body)
  - Session state at time of test
  - Timestamp
```

Intermittent behavior that cannot be reproduced reliably is NEEDS_VALIDATION.

---

## Stage 3: Control Test

Test an equivalent legitimate condition to confirm the behavior is specific to the vulnerability condition.

```
QUESTION:   Does the behavior disappear when the vulnerability condition is absent?
METHOD:     Perform the same request as an authorized user / with correct credentials /
            with valid input.
PASS:       Authorized request behaves as expected — confirms the anomaly is real.
FAIL:       Both authorized and unauthorized requests produce the same result →
            behavior may be intentional. Downgrade to NEEDS_VALIDATION.
RECORD:
  - Authorized request and response
  - Comparison to candidate request and response
  - Delta that explains the security difference
```

---

## Stage 4: Negative Test

Change the vulnerability condition and verify the behavior disappears.

```
QUESTION:   If I remove the specific condition that causes the behavior,
            does the behavior stop?
EXAMPLES:
  IDOR:         Change object ID to a non-existent value → should 404
  XSS:          Remove the payload → reflection should be clean
  SQLi:         Send clean input → no error
  Auth bypass:  Send valid credentials → should succeed normally
PASS:       Behavior disappears when condition is removed.
FAIL:       Behavior persists regardless of condition → likely not a vulnerability.
            Downgrade to DISPROVEN or NEEDS_VALIDATION.
```

---

## Stage 5: Security Boundary Test

Confirm that an actual security boundary is crossed — not just that something is accessible.

```
QUESTION:   Is this behavior crossing a security boundary that should not be crossed?
DETERMINE:
  - What privilege does the attacker have before the test?
  - What privilege do they obtain after the test?
  - What protection should prevent this?
  - Is that protection absent, bypassed, or misconfigured?
PASS:       A real authorization, authentication, or data boundary is demonstrably crossed.
FAIL:       The behavior is within expected access — it only appears suspicious.
            NEEDS_VALIDATION or DISPROVEN.
```

---

## Stage 6: Impact Test

Demonstrate the concrete security consequence. Do not infer impact from root cause.

```
QUESTION:   What can an attacker actually do as a result of this?
SEPARATE:
  SYMPTOM:        What the scanner or initial test showed
  ROOT CAUSE:     Why it happens
  EXPLOITABILITY: Can it be triggered by an attacker?
  BOUNDARY:       What control fails?
  IMPACT:         What is the demonstrable consequence?

FORBIDDEN INFERENCES (require separate demonstration):
  "missing auth check"      ≠ "account takeover"
  "reflected input"         ≠ "XSS exploitable in victim context"
  "SSRF request sent"       ≠ "internal network access"
  "SQL error returned"      ≠ "data exfiltration possible"
  "directory listing"       ≠ "sensitive files exposed"
  "version disclosure"      ≠ "exploitable CVE"

PASS:   Attacker can demonstrably access data, perform unauthorized action,
        or affect availability/integrity/confidentiality.
FAIL:   Impact cannot be demonstrated within safe authorized testing.
        Mark: NEEDS_VALIDATION with impact as open question.
```

---

## Stage 7: Disproof Test

Actively try to defeat the hypothesis. Generate the strongest argument against it.

```
GENERATE:
  SUPPORTING EVIDENCE:      What confirms the vulnerability?
  CONTRADICTING EVIDENCE:   What argues against it?
  ALTERNATIVE EXPLANATIONS: What else could cause this behavior?
  DISPROOF TESTS:           What specific test would prove this is NOT a vulnerability?

RUN DISPROOF TESTS:
  - Could this be rate limiting causing the behavior?
  - Could this be a test/staging environment artifact?
  - Could this be intentional developer debug behavior?
  - Could a WAF or upstream proxy be affecting the response?
  - Could the behavior be user-specific (account flags, permissions)?
  - Could the behavior be time-dependent (caching, session expiry)?

PASS:   Disproof tests fail to defeat the hypothesis. Hypothesis survives.
FAIL:   Any disproof test succeeds → DISPROVEN or NEEDS_VALIDATION.
```

---

## Stage 8: Correlation

Before promoting, check whether this finding connects to existing evidence.

```
QUESTION:   Does this observation connect to other findings, components, or behaviors?
CHECK:
  - Does this share a root cause with an existing finding?
  - Does this affect a component already flagged as vulnerable?
  - Does this combine with another finding to form an attack chain?
  - Does this contradict an existing conclusion?

ACTIONS:
  Same root cause + endpoint → DEDUPLICATE into existing finding
  Different manifestation, same root → correlate as variant
  Enables attack chain → document chain candidate
  Contradicts existing finding → mark both as NEEDS_VALIDATION, investigate conflict
```

---

## Stage 9: Clean-State Re-Test

Final reproduction from a completely clean state before promotion.

```
METHOD:
  - New browser / incognito session
  - New account (if applicable)
  - No prior session data
  - Repeat exact steps from scratch

PASS:   Behavior reproduces identically.
FAIL:   Behavior does not reproduce → state-dependent. NEEDS_VALIDATION.

RECORD:
  - Full HTTP log of re-test
  - Session context
  - Timestamp
```

---

## 10 Evidence Requirements for READY_FOR_HUMAN_REVIEW

A finding may only be promoted to READY_FOR_HUMAN_REVIEW when all applicable requirements are met.

| # | Requirement | Met? |
|---|---|---|
| 1 | Reproducible from clean state | Yes / No / N/A |
| 2 | Application-specific evidence (not generic scanner output) | Yes / No |
| 3 | Security boundary identified and confirmed absent/bypassed | Yes / No |
| 4 | Concrete security impact demonstrated | Yes / No / Partial |
| 5 | Control test performed and passed | Yes / No / N/A |
| 6 | Negative / disproof test performed and passed | Yes / No / N/A |
| 7 | Attacker prerequisites clearly defined | Yes / No |
| 8 | Evidence is traceable (request/response/log/artifact) | Yes / No |
| 9 | Target confirmed in scope | Yes / No |
| 10 | No contradictory evidence remaining unexplained | Yes / No |

If any required row is "No": DO NOT PROMOTE. Mark NEEDS_VALIDATION and record which requirement is unmet.

---

## Active Red-Teaming of Own Hypotheses

For every finding at NEEDS_VALIDATION or higher, run this internal red-team:

```
STEP 1: Write the strongest possible argument that this IS a vulnerability.
STEP 2: Write the strongest possible argument that this is NOT a vulnerability.
STEP 3: Identify which argument has more evidence.
STEP 4: If the "not a vulnerability" argument wins: DISPROVEN.
STEP 5: If the "is a vulnerability" argument wins but impact is unproven: NEEDS_VALIDATION.
STEP 6: If "is a vulnerability" wins with demonstrated impact: proceed to READY_FOR_HUMAN_REVIEW.
```

Prefer conclusions that survive meaningful attempts to disprove them. Never promote because it "looks like" a vulnerability.

---

## Observations That Are NOT Evidence of a Vulnerability

These alone are never sufficient to promote a finding:

- HTTP status code is unusual
- HTTP 200 returned on unexpected path
- Input is reflected in response
- An endpoint is accessible without authentication
- A header is present or absent
- JavaScript is publicly accessible
- Configuration or version is disclosed
- An error message appears
- A scanner reports the issue
- A technology fingerprint matches a known CVE
- Response time is different from baseline alone
- A redirect occurs

Each of these is an OBSERVATION. Treat as CANDIDATE. Begin the 9-stage battery.

---

## Deduplication Protocol

Before creating any new finding:

```python
for existing in findings["all"]:
    if (
        same_root_cause(candidate, existing) and
        same_security_boundary(candidate, existing)
    ):
        correlate(candidate, existing)
        update_evidence(existing, candidate.evidence)
        return "DUPLICATE"

    if same_endpoint(candidate, existing) and same_parameter(candidate, existing):
        investigate_as_variant(candidate, existing)
        return "VARIANT"
```

Correlated findings update the evidence record of the original. They do not create a new finding entry.

---

## Finding Record Schema

Every finding maintains this record throughout its lifecycle:

```json
{
  "finding_id": "string",
  "state": "CANDIDATE | INVESTIGATING | NEEDS_VALIDATION | READY_FOR_HUMAN_REVIEW | VALIDATED | DISPROVEN | OUT_OF_SCOPE",
  "title": "string",
  "endpoint": "string",
  "method": "string",
  "parameter": "string",
  "symptom": "string",
  "root_cause_hypothesis": "string",
  "security_boundary": "string",
  "exploitability": "string",
  "impact": "string | NOT_VERIFIED",
  "evidence_requirements": {
    "reproducible": true,
    "application_specific": true,
    "boundary_confirmed": true,
    "impact_demonstrated": false,
    "control_test": true,
    "negative_test": true,
    "attacker_prerequisites": "string",
    "evidence_traceable": true,
    "in_scope": true,
    "no_contradictions": true
  },
  "stages_completed": [],
  "stages_failed": [],
  "disproof_attempts": [],
  "supporting_evidence": [],
  "contradicting_evidence": [],
  "alternative_explanations": [],
  "http_evidence": [],
  "duplicates_of": null,
  "correlates_with": [],
  "promoted_at": null,
  "promoted_by": null,
  "human_confirmed": false
}
```
