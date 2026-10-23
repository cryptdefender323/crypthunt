---
name: red-assess
description: "Systematic red-team vulnerability assessment for explicitly in-scope assets. Builds a technology-driven test matrix, runs authorized low-impact checks, validates candidates with minimal proof, records detection outcomes, and hands findings to red-team-report. Triggers: 'red-team assessment', 'red-assess', 'test all relevant vulnerabilities', 'red-team vulnerability validation'."
version: 1.0.0
phase: ["enumeration", "validation"]
category: ["enumeration", "exploitation"]
tags: ["red-team", "vulnerability-assessment", "validation", "evidence", "detection"]
---

# Red Team Vulnerability Assessment

Systematically assess every relevant vulnerability class supported by the
observed technologies and explicitly in-scope assets. The objective is to
measure exposure and detection using controlled, minimum-impact proof. This is
the Red Team assessment phase; report objective progress and detections with
`red-team-report`.

## Entry gates

- `red-recon` has produced a sourced asset and technology inventory.
- Each active target is explicitly in scope. Passive discoveries are leads,
  not permission to scan related hosts.
- A current signed authorization letter/rules-of-engagement document covers
  each active asset, method, and test category. The user confirms it is valid.
  If missing, continue passive work and ask once for the document before the
  first active check.
- Request limits, time window, client test identities, approved origin, and
  stop conditions are known for the checks that need them.

Mode selection, a target domain/IP, and a scanner finding do not establish
authorization or prove a vulnerability.

## Freshness gate

Do not turn a historical OSINT item into a current vulnerability finding. For
each candidate, record the original event/`last_seen` time, retrieval time,
asset, and source. Archived defacement pages, old Shodan data, old CVE matches,
and third-party claims without dates remain `HISTORICAL_LEAD` or
`FRESHNESS_UNKNOWN`. Preserve them in the coverage ledger as leads, but exclude
them from current finding counts until a new, in-scope observation supports a
falsifiable hypothesis. Their age alone is not a reason to omit the underlying
vulnerability class from assessment.

Before loading a vulnerability playbook or proposing a validation test, require
a current signal tied to the exact asset and behavior. For web parameters, a
name like `id` or a URL from an old defacement record is not such a signal.
Establish the current page/endpoint and normal response first, using Playwright
or the least intrusive approved request after the ROE gate. Record its
engagement timestamp and sanitized evidence. If the current behavior cannot be
reproduced safely, report only the historical lead, not a live vulnerability.

## Build the coverage ledger

Use the observed stack, exposed services, application behavior, historical
leads, and in-scope architecture to select applicable checks. Cover relevant
vulnerability classes whether they are longstanding or newly disclosed; rank
them by current exposure, plausible impact, evidence, and ROE, not novelty or
ease of testing. Keep historical leads attached to the relevant ledger rows
until current evidence confirms or disproves them. Run independent, authorized
checks in bounded waves. Mark every relevant category `tested`, `not
applicable` with its reason, `blocked`, or `not tested` with its reason; do not
silently omit a relevant category or claim that a generic scanner covered it.
Do not run a check merely because a skill exists: require applicability,
authorization, a falsifiable hypothesis, and a safe test method.

| Surface | Relevant checks |
|---|---|
| Web applications | Authentication/session handling, access control and IDOR, injection, XSS, CSRF, CORS, SSRF, path traversal, file upload, deserialization, JWT/OAuth, business logic, cache behavior, security headers, and exposed admin/debug surfaces |
| APIs and real-time endpoints | REST/GraphQL/gRPC/WebSocket discovery, object/function authorization, schema exposure, mass assignment, authentication, input handling, and low-rate abuse controls |
| External services | Confirmed ports and service versions, TLS/configuration weaknesses, exposed management interfaces, and safe checks for relevant known CVEs |
| Cloud, identity, containers, and CI/CD | Only when those assets and credentials are explicitly in scope: configuration and permission review, public exposure, trust boundaries, and dependency/IaC checks |
| Source and supply chain | Publicly available in-scope source, manifests, lockfiles, CI configuration, and secrets exposure; never test or reuse discovered secrets |

Load the most specific `vuln-*`, `tech-*`, `proto-*`, or framework skill for
each observed technology and candidate. Keep the ledger as the source of truth
for coverage and use `pentest_hypothesize` to register concrete, falsifiable
hypotheses.

At minimum, consider all relevant classes across the observed surface:
authentication and authorization, session/token handling, injection, XSS,
CSRF/CORS, SSRF, path traversal and file handling, deserialization, business
logic and race conditions, cache and request parsing, information exposure,
known vulnerability and configuration checks, dependency/source/CI supply
chain, cloud/container/identity, and network protocols. Add framework-specific
classes when the stack warrants them. This is an applicability checklist, not
a requirement to probe every class against every asset.

## Full-lifecycle emulation matrix

Coordinate with `red-team-workflow` to maintain one row for every lifecycle
phase: initial access, execution, persistence, privilege escalation, defense
evasion, credential access, discovery, lateral movement, collection/exfiltration,
and impact/recovery. Record the authorized target, owner-provided simulation
method, expected telemetry, detection/prevention result, and cleanup. Prefer
BAS or vendor test events, inert markers, synthetic telemetry, test-owned
accounts, and isolated lab endpoints. Never create persistence, collect real
credentials, evade controls, pivot with captured material, or transmit real
data. If a phase cannot be exercised safely under the rules, mark it `synthetic
telemetry only`, `not authorized`, or `not available`; do not represent it as a
completed compromise.

## Safe validation rules

Before each active check, record the hypothesis, exact asset and endpoint,
authorized technique, expected request volume, expected evidence, and stop
condition. Establish normal behavior first. Prefer a single controlled request
or a client-provided test account and canary value.

- Scanner/template output is a candidate (L1), never a confirmed finding.
- Evidence from an archive or third-party index is historical context, never
  the reproduction step for a current finding.
- Reproduce candidates independently and record sanitized request/response
  evidence. Use the evidence ladder and adversarial false-positive review.
- Prove access-control issues only with client-issued test accounts and
  test-owned records. Do not read another person's real data.
- For injection, use harmless markers or bounded boolean behavior. Do not dump
  databases, read files, execute commands, or access cloud/internal metadata.
- For XSS, use a benign marker in a controlled test account. Do not collect
  cookies, tokens, keystrokes, or other browser data.
- For upload, deserialization, and execution candidates, stop at a harmless
  canary or static/configuration proof. Do not deploy shells, implants, or
  persistent payloads.
- Do not brute-force, password-spray, exploit real employee accounts, create
  persistence, pivot, evade controls, disable logging, or exfiltrate data.
- Do not run denial-of-service, unbounded crawling, high-rate fuzzing, or
  state-changing tests on production data. If a technique risks availability
  or real-user impact, mark it `not tested` and explain the limit.
- If a control blocks or alerts, stop that test, preserve the signal, and do
  not change identity, source, or payload to get around it.

## Evidence and handoff

Maintain one row per relevant vulnerability class and asset with:

```text
asset | class | hypothesis | method | authorization reference | requests
result | evidence level | detection outcome | status | manual follow-up
```

Classify each candidate as `CONFIRMED`, `LIKELY`, `POSSIBLE`, `FALSE_POSITIVE`,
or `NOT_TESTED`. Never mark a finding confirmed below L4. Save sanitized
artifacts under the engagement evidence directory and link each result to its
coverage-ledger row. Hand the complete ledger, verified findings, blocked
checks, and untested items to `red-team-report`.
