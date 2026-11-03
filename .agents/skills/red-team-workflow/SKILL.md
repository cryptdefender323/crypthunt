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

If the target is missing, ask only for its domain or IP and stop. A user
selecting red-team mode or answering "start" is not a target. Once supplied,
treat exactly that value as the initial boundary, use passive public-surface
mapping as the default objective, and initialize the engagement workspace.
Start passive OSINT without contacting the target. Do not ask an upfront
questionnaire or expand discovered related assets into active scope. Keep the
initial interaction to one request for the target; do not ask for the objective,
contact, time window, or rules-of-engagement details before passive OSINT. The
default objective is to map the public attack surface and relevant professional
identity exposure, then assess every relevant vulnerability class on assets
explicitly in scope.

Before any active recon, test, or direct contact with the target, require and
review current written authorization/rules of engagement. The user must
attach the document or provide its relevant excerpt and confirm it is valid.
It must identify the authorized party, exact target scope, and permitted
methods. Enforce any date/time window, request limit, and stop condition the
ROE states. Their absence is not by itself a reason to block the engagement:
record omitted limits as `not specified`, use conservative mode defaults, and
never invent a schedule. Record a reference to the document, not sensitive
personal details.

Verify and record:

- Written authorization and the person who can pause the exercise.
- In-scope domains, IPs, applications, accounts, cloud tenants, and exclusions.
- Objectives and the behaviors the blue team is expected to detect.
- Allowed techniques, test identities, source networks/proxies, browser and
  device profiles, any stated time windows or request limits, and
  data-handling rules.
- Stop signals, emergency contact, and the process for reporting an alert.

If the document, exact scope, or permitted methods are missing when active
discovery is next, keep already completed passive work, identify only the
missing required fields, ask once for those fields or the relevant document
excerpt, and pause target-directed work. Do not block solely because the ROE
does not state a schedule or request limit. Do not ask again for details
already provided. If an attachment is referenced but is not actually
available to inspect, say so and do not claim to have reviewed or verified it.
A verbal yes, mode selection, or start reply is not authorization. Never infer
scope from DNS ownership, a public bug-bounty listing, or access to a related
system.

## 2. Passive OSINT

Start with public or client-provided information that does not send requests to
the target. Map historical and current DNS records (A/AAAA, MX, TXT, NS, and
CAA where available), certificate transparency, public subdomain sources, and
ASN/IP ownership from public registries. Use public search-engine queries to
find exposed documents and metadata; record only links and minimal proof needed
for owner review. Review public repositories for exposed secrets, but never
validate, reuse, or copy any discovered credential. Include job listings and
approved threat-intelligence data. For an organization target, include
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
before execution. Run port discovery, service fingerprinting, and technology
identification on exact in-scope assets whenever the ROE permits those tests;
cover the stated port range, or all TCP ports when scanning is authorized but
the ROE does not set a range, and record output/status in the evidence ledger.
Honor any stated request rate or time window; if omitted, record it as
unspecified and use conservative defaults. People and social-engineering
research is limited to public professional information described in the OSINT
phase; no outreach, impersonation, or collection of private personal details
or accounts. Retain a baseline and evidence for each
distinct check. No denial-of-service, unbounded crawling, or bulk credential
attempts. For each approved perimeter asset, inventory reachable ports and
services, identify server/OS/framework signals at the least intrusive level
allowed, and record indicators of a WAF, CDN, reverse proxy, or load balancer.
Treat these as observations, not permission to bypass the control. Do not
change request shape, source, identity, or browser profile to evade a block or
detection.

Run the authorized recon tools rather than only listing commands. At recon
handoff, show a per-asset coverage summary with passive-source notes, active
HTTP status, port-scan status and scanned range, service/version observations,
and artifact paths. Explicitly mark checks that were blocked, failed, out of
scope, or not available; never imply that an omitted check completed. When the
primary target and method are authorized, actively assess that target even if
passive OSINT found no subdomains or leads. Never present passive discovery as
the completed recon phase or replace the authorized primary target with
passive-only hosts.

Use a proxy only when the client has named or approved that egress route. Do not
rotate proxies or source addresses to evade a block, rate limit, alert, or
attribution control. If a control blocks or detects the test, stop that test,
record the signal, and notify the engagement contact.

When the written ROE explicitly permits exploit validation, continue from a
reproduced hypothesis to the minimum controlled, non-destructive proof needed
to establish the vulnerability and impact. Then stop and prepare evidence for
human retest. Do not treat a general authorization letter as permission for
persistence, credential theft, lateral movement, control evasion, service
disruption, or real-data exfiltration.

## 4. Identity, browser, and device validation

Use only client-issued test accounts reserved for the exercise. Never
impersonate a real employee, forge a person's identity, reuse
their credentials, or access their mailbox or files.

Use a browser profile, user-agent, or device-emulation profile only when that
profile is listed in the rules of engagement. Keep a record of the test account,
profile, approved proxy route, and timestamp for each check. The purpose is to
measure whether the expected control detects the approved scenario. Do not
change profiles or egress after detection to continue the same activity.

## 5. Systematic vulnerability assessment

Do not stop after passive OSINT or surface fingerprinting. Once the active
scope and permitted methods are established, load `red-assess` immediately and
build a coverage ledger for every explicitly in-scope asset. Cover every
relevant class indicated by its application, API, service, framework, cloud,
identity, and deployment technologies. Route checks to the most specific
`vuln-*`, `tech-*`, `proto-*`, or framework skill. Record each class as tested,
not applicable, blocked, or not tested with a reason. A scanner finding is
only a candidate; reproduce it and review the evidence before reporting it.
Leave destructive, data-access, credential, persistence, and evasion actions
out of the test plan.

For web assets, use the visible Playwright browser for rendered pages, forms,
client-side routes, and stateful behavior when the ROE permits browser testing.
Use `curl` for a minimal HTTP baseline and a bounded, reproducible request or
response check when that method is allowed. Choose the tool based on the
hypothesis; do not claim either tool was used unless its actual output was
observed and saved. If the browser MCP is unavailable, report that limitation
and continue only with other explicitly permitted methods. A target URL or a
generic phrase such as "remote pentest" does not add discovered subdomains,
IP ranges, accounts, or methods to scope. Do not pass all passive subdomain
results into `httpx`, a crawler, or a scanner unless the ROE explicitly
includes them.

## Requested seven-stage red-team plan

Run this plan end-to-end when the user requests a full red-team assessment and
the written authorization covers the exact assets and methods. A test window
is optional: when the ROE states one, obey it; otherwise record `not
specified` and use conservative request rates and stop conditions. Do not ask
for a schedule solely because none was provided. A missing scope or permitted
method still blocks that specific active test.

| Stage | Work to perform | Safe execution boundary |
|---|---|---|
| 1. Planning and scope | Record objectives, exact assets, exclusions, allowed methods, any stated schedule/limits, pause contact, and evidence/reporting rules. | Do not infer assets or techniques from a general authorization statement. |
| 2. Recon and intelligence | Combine passive DNS/CT/ASN/public professional OSINT and leak-exposure leads with authorized active mapping of listed assets. | Passive data is a lead. No private personal data, credential reuse, outreach, or active probing of discovered hosts outside scope. |
| 3. Weaponization and initial access | Assess applicable external vulnerabilities and reproduce candidates with the least-impact permitted proof. | Use benign markers or owner-provided BAS/test identities. No malware creation/deployment, phishing, identity impersonation, or physical intrusion. |
| 4. Foothold and C2 | Evaluate the relevant detection/control boundary using owner-provided telemetry, a BAS event, or an isolated lab. | No live implant, beacon, covert C2 channel, or persistence on production assets. |
| 5. Internal movement and privilege | Review configuration and authorization boundaries; use separate owner-issued canary accounts or isolated lab endpoints if explicitly in scope. | No credential dumping, token theft, pivoting with captured credentials, or production privilege escalation. |
| 6. Mission and data impact | Demonstrate approved business impact with a synthetic record/canary and verify DLP or recovery controls. | No real-data staging, modification, or exfiltration; no service disruption. |
| 7. Cleanup, reporting, and purple-team review | Remove test canaries, verify cleanup, build a timestamped evidence timeline, reconcile alerts with the owner, and recommend remediation. | Preserve only sanitized evidence; do not claim unperformed or simulated actions as compromise. |

Complete every applicable stage within the authorized boundary. For a stage
whose active technique is not expressly allowed, use its safe telemetry/lab
substitute or mark it `not authorized`; continue the remaining permitted
stages. Never interpret a signed letter as blanket permission for every
technique in this table.

## 6. Full-lifecycle adversary-emulation scenario

After discovery and assessment, turn the written objective into an end-to-end
scenario covering all eight phases below. Use ATT&CK tactics as coverage labels,
not as permission to execute every technique. For each phase, define the
approved target, expected control, safe simulation signal, telemetry source,
success criterion, and cleanup. Report progress phase by phase and distinguish
emulated behavior from an actual compromise.

| Requested phase | Safe emulation | Record |
|---|---|---|
| 1. Recon: passive and active surface mapping | Public DNS history, ASN/IP, subdomain, document, and professional OSINT; scoped port/service and WAF/CDN fingerprinting only after the active gate | Source, collection time, scope status, exposed-asset owner, and detection outcome |
| 2. Exploit: initial access and foothold | Validate a named external service boundary with a client-issued test account, harmless marker, or approved BAS event; no reverse shell or general-purpose code execution | Hypothesis, boundary tested, marker identity, control response, alert, and cleanup |
| 3. Enum: post-breach investigation | Use approved inventory/EDR interfaces or an isolated lab host to inspect system, software, identity, configuration, and network visibility; use synthetic secrets only | Data source, test identity, fields observed, telemetry, and any untested host commands |
| 4. Priv-esc | Audit sudo/SUID/service/role configuration or run a preconfigured lab role transition; do not exploit production kernel or steal tokens/hashes | Misconfiguration evidence, effective-role boundary, expected control, and cleanup |
| 5. Lateral movement | Use separate owner-created canary identities across two isolated lab endpoints, or synthetic telemetry; do not pivot with captured credentials/tokens | Source/destination, test identity, boundary result, alert, and cleanup |
| 6. Persistence | Use a BAS/vendor persistence simulation or synthetic endpoint event; do not add accounts, autoruns, services, tasks, implants, or timestomp files | Simulation ID, prevention/detection result, telemetry source, and cleanup status |
| 7. Impact | Test a harmless canary file/object with approved DLP or recovery simulation; no real-data staging, exfiltration, service disruption, or critical-data modification | Canary identifier, DLP/alert outcome, recovery result, and evidence location |
| 8. Purple teaming | Build a timestamped attack narrative from observed or simulated events, reconcile it with SOC/EDR/SIEM records, and propose detection and remediation changes | Event-to-alert mapping, gaps, rule recommendations, owner, and retest criterion |

For every row, set one status: `executed safely`, `synthetic telemetry only`,
`blocked`, `not authorized`, or `not available`. Never report a simulated phase
as a real foothold, compromise, privilege escalation, lateral movement,
persistence, or exfiltration.

If the rules do not authorize a benign live emulation, use synthetic telemetry
or leave the phase untested.

## 7. Foothold validation and later-stage boundaries

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
explain why; do not substitute a covert or destructive action. Use `red-recon`
for passive and document-authorized active discovery, `red-assess` for comprehensive
in-scope vulnerability enumeration and safe validation, and `red-team-report`
for the final evidence-backed report. Scanner hits remain candidates until
reproduced and manually reviewed. The standard red-team mode does not load the
`red-exploit`, `red-lateral`, or `red-persistence` playbooks.

If an alert fires, the target falls out of scope, service health changes, or the
operator requests a pause, stop active actions immediately. Preserve the
minimum evidence needed to explain what happened and hand control to the
engagement contact.

## 8. Evidence and handoff

For every test, save the hypothesis, scope reference, exact action, timestamp,
approved identity/profile/egress, sanitized request and response evidence,
result, whether the behavior was directly emulated or represented by synthetic
telemetry, whether a control detected it, and cleanup status. Redact tokens,
passwords, personal data, and unrelated response content. Update the attack
model only with evidence-backed observations.

Finish with an executive summary and a test ledger that distinguishes:

- Completed and detected.
- Completed and not detected.
- Blocked by a control.
- Not attempted because the rules did not authorize it.
- Inconclusive or requiring manual validation.
- Reviewed from existing authorized telemetry, if applicable.
- Represented by synthetic telemetry only.

Never imply that a control was bypassed when the test was blocked or not run.
