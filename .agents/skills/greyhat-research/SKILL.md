---
name: greyhat-research
description: "Authorized grey-hat vulnerability research with explicit written scope, low-impact hypothesis testing, evidence capture, and adversarial validation. Triggers: grey-hat, grey hat research, authorized vulnerability research."
version: 1.0.0
phase: ["recon", "enumeration", "exploitation", "reporting"]
category: ["exploitation", "reporting"]
tags: ["grey-hat", "authorization", "scope", "evidence", "validation"]
---

# Grey-Hat Research

Use this skill as the first stage for authorized grey-hat work. The goal is to
identify and safely validate security issues within a written authorization
boundary, then prepare evidence for the owner. Do not treat a mode selection or
a target URL as authorization.

## Authorization and scope gate

Before sending traffic to a target, establish current written permission for
the exact asset, permitted methods, exclusions, rate limits, and test window.
An official program policy can serve as authorization when it explicitly lists
the target and allows the planned test. Do not infer scope for sibling hosts,
staging systems, APIs, cloud resources, or other infrastructure.

If authorization is missing or unclear:

- Continue only passive research that does not contact the target.
- Ask once for the written authorization or official program URL and exact
  scope details before active testing.
- Do not turn a verbal “yes” into permission to send traffic; use it only to
  request and verify the applicable written scope.

Record the authorization source, exact in-scope assets, allowed methods,
restrictions, and validity window before active work begins.

## Research loop

For each testable idea, keep the chain explicit:

```text
Observation → Hypothesis → Minimal permitted test → Evidence → Control test
→ Negative test → Disproof attempt → Classification
```

1. Build a target model from passive sources and any supplied evidence.
2. Select tests from the model and verified scope; explain what each test will
   establish before running it.
3. Record the baseline and preserve raw request/response or browser evidence.
4. Reproduce promising behavior with a control and a negative test.
5. Look for benign explanations and stop at the minimum proof needed to show
   security impact.
6. Keep scanner output as a candidate until an independent validation proves
   the affected security boundary and impact.

## Safety boundaries

Stay within the written scope and permitted methods. Do not perform denial of
service, data exfiltration, persistence, command execution, lateral movement,
credential dumping, covert C2, or security-control evasion. Stop a test when
the evidence establishes impact or when a system becomes unstable.

Use the visible Playwright browser for permitted web observation and evidence
capture. Do not claim browser validation unless the browser tool returned the
observation.

## Finding readiness

Before preparing a finding, include:

- verified authorization basis and exact in-scope asset
- reproducible steps with the least-impact test data
- raw evidence and a control/negative result
- the security boundary crossed and demonstrated impact
- a disproof attempt, severity rationale, and remediation guidance

Classify an unresolved observation as a candidate or needs-validation. Do not
label it confirmed or contact the owner on the user's behalf. The user reviews
and submits the report.
