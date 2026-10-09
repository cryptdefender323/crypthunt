---
name: red-team-workflow
description: "Orchestrates an authorized red-team engagement from rules-of-engagement review and passive OSINT through scoped active validation, detection checks, evidence capture, and reporting. Uses client-provided test identities, browser/device profiles, and approved proxy routes. Triggers: 'red team workflow', 'start red team', 'red team engagement', 'adversary emulation workflow'."
version: 1.0.0
phase: ["recon", "planning", "validation", "reporting"]
category: ["recon", "exploitation", "reporting"]
tags: ["red-team", "workflow", "osint", "rules-of-engagement", "detection-validation", "evidence"]
---

# Red Team Engagement Workflow

Run this workflow before the mode-specific red-team skills. It sequences the
engagement and sets the rules that every later skill must follow. A mode choice
does not grant authorization.

## 1. Establish the engagement boundary

Before contacting a target, record:

- Written authorization and the person who can pause the exercise.
- In-scope domains, IPs, applications, accounts, cloud tenants, and exclusions.
- Objectives and the behaviors the blue team is expected to detect.
- Allowed techniques, test identities, source networks/proxies, browser and
  device profiles, time windows, request limits, and data-handling rules.
- Stop signals, emergency contact, and the process for reporting an alert.

If any planned action is outside the written rules or a stop signal is missing,
do passive analysis only and ask for the missing engagement detail. Never infer
scope from DNS ownership, a public bug-bounty listing, or access to a related
system.

## 2. Passive OSINT

Start with public or client-provided information that does not send requests to
the target: subdomain sources, DNS history, certificate transparency, public
registries, public code and documentation, document metadata, job listings,
and approved threat-intelligence data. When people OSINT is in scope, collect
relevant professional information from public sources: names, current or past
employer, job title or function, public professional biography, work email,
and published office phone or office location. Suitable sources include
official company pages, public professional profiles, conference biographies,
job listings, and public filings. Record the source and collection date; keep
only details relevant to the engagement. Do not collect private phone numbers,
home addresses, family details, or personal-account data, and do not contact
employees. If leaked credentials or secrets are encountered, record only the
minimum exposure evidence and notify the owner; never test, reuse, or copy
them. Do not probe discovered hosts in this phase.

Build an asset and hypothesis list. Separate confirmed in-scope assets from
unverified leads; unverified leads are not targets.

## 3. Active reconnaissance gate

For each proposed active action, state the target, hypothesis, exact technique,
expected request volume, approved origin, expected evidence, and stop condition.
Check the asset and technique against the rules of engagement immediately
before execution. Port discovery, service fingerprinting, and technology
identification must be limited to confirmed in-scope assets, agreed ports,
request rates, and the approved test window. People and social-engineering
research is limited to public professional information described in the OSINT
phase; no outreach, impersonation, or collection of private personal details
or accounts. Retain a baseline and evidence for each
distinct check. No denial-of-service, unbounded crawling, or bulk credential
attempts.

Use a proxy only when the client has named or approved that egress route. Do not
rotate proxies or source addresses to evade a block, rate limit, alert, or
attribution control. If a control blocks or detects the test, stop that test,
record the signal, and notify the engagement contact.

## 4. Identity, browser, and device validation

Use only client-issued test accounts reserved for the exercise. Never
impersonate a real employee, forge a person's identity, reuse
their credentials, or access their mailbox or files.

Use a browser profile, user-agent, or device-emulation profile only when that
profile is listed in the rules of engagement. Keep a record of the test account,
profile, approved proxy route, and timestamp for each check. The purpose is to
measure whether the expected control detects the approved scenario. Do not
change profiles or egress after detection to continue the same activity.

## 5. Foothold validation and later-stage boundaries

The objective is to establish whether a control boundary can be crossed with a
client-issued test identity and a harmless canary, not to compromise the
environment. Replace phishing with **external service exposure validation**:
check a named public service or authentication flow with an approved test
account, then stop at the first reproducible access boundary. Do not spray
passwords at employee accounts or exploit an external service to obtain a
general-purpose shell.

Continue through the requested red-team objectives using safe test evidence:

| Objective area | Safe validation method | Record as out of scope |
|---|---|---|
| Initial foothold | Validate a named public service or authentication boundary with a client-issued account | Phishing, bulk password spraying, unrestricted exploit chains |
| Payload / C2 | Use Phantom only to review engagement records and existing authorized audit events | Generating or deploying beacons/implants, covert channels, or domain fronting |
| Persistence | Review authorized endpoint telemetry and document whether policy controls are configured | Creating stealthy registry, task, or service persistence |
| Local privilege escalation | Check in-scope configuration and validate the boundary with a designated test account | Kernel exploitation or token theft |
| Credential exposure | Review approved identity/security audit data and exposed-secret locations without using secrets | LSASS dumping, Kerberoasting, password reuse, or testing leaked credentials |
| Lateral movement | Validate access boundaries between in-scope systems with separate client-issued accounts | Pivoting with captured credentials or tokens |
| LOLBins and endpoint defense | Review endpoint policy and detection records for authorized tests | Evasion, obfuscation, disabling logs, timestomping, or bypassing AV/EDR |
| Command-and-control | Review authorized Phantom configuration and audit records without tasking an implant | Beacon deployment, covert encrypted channels, jitter, or domain fronting |
| Impact objective | Demonstrate the approved access boundary and report impact without copying data | Exfiltrating data or achieving domain dominance |

If an objective requires a technique excluded above, mark it `not tested` and
explain why; do not substitute a covert or destructive action. Use the
`red-recon` skill for the scoped discovery phase and `red-team-report` for the
final evidence-backed report. The standard red-team mode does not load the
`red-exploit`, `red-lateral`, or `red-persistence` playbooks.

If an alert fires, the target falls out of scope, service health changes, or the
operator requests a pause, stop active actions immediately. Preserve the
minimum evidence needed to explain what happened and hand control to the
engagement contact.

## 6. Evidence and handoff

For every test, save the hypothesis, scope reference, exact action, timestamp,
approved identity/profile/egress, sanitized request and response evidence,
result, and whether a control detected it. Redact tokens, passwords, personal
data, and unrelated response content. Update the attack model only with
evidence-backed observations.

Finish with an executive summary and a test ledger that distinguishes:

- Completed and detected.
- Completed and not detected.
- Blocked by a control.
- Not attempted because the rules did not authorize it.
- Inconclusive or requiring manual validation.
- Reviewed from existing authorized telemetry, if applicable.

Never imply that a control was bypassed when the test was blocked or not run.
