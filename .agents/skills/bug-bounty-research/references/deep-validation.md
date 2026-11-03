# Deep Bug Bounty Validation

Use this reference only after the program and exact asset are verified in
`bug-bounty-research`. Every test must be permitted by that program's policy,
low impact, reproducible, and tied to a candidate hypothesis. The researcher
must be able to observe browser-driven tests in Playwright.

## Test record

Before a test, record:

```text
Candidate ID:
In-scope asset and scope entry:
Question / hypothesis:
Baseline and control:
One planned test and expected result:
Program restriction / rate limit:
Stop condition:
Evidence location:
```

Use the smallest request that can answer the question. Prefer a client-issued
test identity, an owned object, a read-only operation, and a unique inert
marker. Stop on instability, unexpected state change, sensitive-data exposure,
rate limiting, or a program-defined stop condition. Record `BLOCKED` or
`NOT_TESTED` with the reason instead of escalating past a control.

## Differential validation

These checks look for inconsistent interpretation across the browser, proxy,
application, and backend. They are not permission to defeat a WAF or gain
access the program excludes.

- **Input normalization:** Compare a normal value with a small number of
  harmless, uniquely marked encoding/normalization variants on a read-only
  endpoint. Record which layer changes or rejects each value. Do not use
  traversal, command, template, or parser exploit strings against production
  unless the policy explicitly allows that vulnerability class and safe
  reproduction method.
- **Duplicate parameters:** On a read-only endpoint and with owned test data,
  compare the documented single parameter with a bounded duplicate-parameter
  request. Do not use conflicting identities or attempt to retrieve another
  user's data. A parser difference alone is not impact.
- **HTTP method handling:** Compare documented methods on a read-only route.
  Test method-override headers only when the policy permits it and only with a
  non-mutating action and test account. Never disguise a state-changing or
  privileged action as a harmless request.
- **Proxy/client-IP trust:** Review documented proxy behavior and response
  differences using normal requests. Do not spoof loopback, trusted proxy, or
  internal client identities to obtain privileged behavior. If the program
  provides a dedicated test environment, verify trust configuration there and
  retain its owner-provided test data.
- **WAF and rate controls:** Record which layer blocks a permitted test and
  whether the block is consistent. Do not evade detection, rotate identities,
  distribute traffic, pad requests, or continue after throttling/alerts.
- **SSRF:** Use only a researcher-controlled callback endpoint when OOB testing
  is explicitly allowed. A callback can prove an outbound request, not access
  to internal resources. Do not target loopback, private networks, cloud
  metadata, or third-party destinations. DNS rebinding to internal addresses
  is limited to an isolated lab or an owner-provided test environment.
- **Request parsing / smuggling:** Treat this as high impact and potentially
  service-disruptive. Test only if expressly allowed, with a vendor/program
  safe procedure and a dedicated test environment or endpoint. Otherwise mark
  it `NOT_TESTED` with the policy reason.
- **Business logic and race conditions:** Use test accounts and reversible,
  low-value records. Define the invariant and control first. Do not spend real
  money, issue real refunds, send messages to third parties, change production
  records, or create high concurrency.

## Candidate selection and coverage

Prioritize on current asset exposure, stack evidence, user-controlled input,
security-boundary relevance, and plausible impact. Include old and newly
disclosed vulnerability classes when the observed stack or behavior makes them
applicable. Historical CVE/version matches remain leads until the current
asset, affected component, and behavior are independently verified.

For each relevant class, record one of `TESTED`, `NOT_APPLICABLE`, `BLOCKED`,
or `NOT_TESTED`, with evidence or a reason. Consider authentication and
authorization, session/token handling, injection, XSS, CSRF/CORS, SSRF, file
handling/path traversal, deserialization, business logic/races, cache and HTTP
parsing, information exposure, known CVEs/configuration, dependencies/source/
CI, and relevant cloud or protocol surfaces. This is a coverage checklist;
do not probe classes unsupported by the target's observed stack or the
program's rules.

## Findings and alerts

Keep raw evidence in the access-controlled engagement workspace. Redact tokens,
personal data, and unrelated customer content. Notifications may contain a
candidate ID, severity estimate, affected in-scope asset, and local evidence
reference only. Do not send raw PoCs, secrets, or sensitive response bodies to
third-party chat services. Do not submit a platform report automatically.
