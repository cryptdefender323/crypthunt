---
name: red-team-report
description: "Creates objective-led red-team executive reports from verified engagement records. Covers objective outcome, authorized scope, activity timeline, access paths, detection and response, evidence, and prioritized control recommendations. Triggers: 'red-team report', 'red team debrief', 'red team executive report'."
version: 1.0.0
phase: ["reporting"]
category: ["reporting"]
tags: ["red-team", "report", "executive", "timeline", "detection", "evidence"]
---

# Red-Team Engagement Report

Use this skill for the red-team mode. Generate the report from engagement
objectives, rules of engagement, the activity ledger, detection records, and
verified evidence. Never infer that an objective was achieved from an untested
path or an unverified hypothesis.

## Required inputs

- Engagement objective and success criteria.
- Authorized scope, approved methods, date window, and exclusions.
- Activity timeline with action, asset, operator/test identity, result, and
  control detection outcome.
- Vulnerability coverage ledger showing tested, not applicable, blocked, and
  not tested categories for each in-scope asset.
- Evidence references and validation status for each reported result.
- Cleanup and closeout status for any explicitly authorized activity.

If an input is missing, mark it `NOT RECORDED` and identify the report section
that remains incomplete. Do not invent dates, access, impact, or evidence.

## Report structure

```markdown
# Red-Team Assessment

**Client:** [CLIENT]
**Engagement period:** [START] to [END]
**Objective:** [OBJECTIVE]
**Outcome:** [ACHIEVED / PARTIALLY ACHIEVED / NOT ACHIEVED / INCONCLUSIVE]
**Classification:** [CLIENT CLASSIFICATION]

## Executive Summary
[Objective outcome, most significant demonstrated risks, detection posture,
and top remediation priorities in concise non-technical language.]

## Scope and Rules of Engagement
[Authorized assets, methods, time window, exclusions, stop conditions.]

## Activity Timeline
| Time | Phase/action | In-scope asset | Result | Detection/response | Evidence |
|---|---|---|---|---|---|

## Objective Assessment
[Each success criterion, evidence, outcome, and remaining gap.]

## Assessment Coverage
| Asset | Vulnerability class | Status | Validation level | Detection outcome | Evidence |
|---|---|---|---|---|---|
[Include tested, not applicable, blocked, and not tested items.]

## Validated Access Paths and Findings
[Only reproduced paths. Distinguish confirmed behavior from hypotheses and
inconclusive tests. Describe impact only to the level demonstrated.]

## Detection and Response
[Expected control, observed alert/response, timing, and evidence.]

## Recommendations
[Prioritized control improvements, owner, and measurable validation target.]

## Evidence Ledger
[Artifact reference, timestamp, scope reference, test identity/profile, and
validation status. Redact secrets and personal data.]

## Closeout
[Stop/cleanup status, outstanding items, and items not tested under the rules.]
```

## Reporting rules

- State whether each objective was achieved, partially achieved, not achieved,
  or inconclusive, with a cited evidence reference.
- Describe the operation timeline and defensive response, not a generic list
  of vulnerability classes.
- Use severity labels only when supported by demonstrated impact. CVSS is
  optional and must not replace the objective and detection assessment.
- List blocked, untested, and unauthorized activities as such; never imply a
  successful bypass when a control stopped the test.
- Redact credentials, private contact details, personal data, and unrelated
  target information.
- Do not include operational instructions for implant deployment, stealth
  persistence, credential theft, control evasion, or data exfiltration.
