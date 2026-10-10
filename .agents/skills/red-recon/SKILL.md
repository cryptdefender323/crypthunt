---
name: red-recon
description: "Red-team reconnaissance — public professional OSINT, passive infrastructure mapping, and explicitly authorized active discovery. Maps people, organization, services, and technology into a scoped target model for red-assess. Does not impersonate people or evade controls. Triggers: 'red team recon', 'red recon', 'people OSINT', 'active recon', 'infrastructure mapping'."
version: 3.0.0
phase: ["recon"]
category: ["recon"]
tools: ["subfinder", "amass", "httpx", "shodan", "curl", "python3", "theHarvester", "gitleaks"]
tags: ["red-team", "recon", "infrastructure", "people-osint", "active-discovery", "detection"]
---

# Red Team Reconnaissance — People, Infrastructure, and Service Discovery

## OBJECTIVE

Build a sourced intelligence model for the exact target. Start with passive OSINT, including relevant public professional information about people and the organization. Continue to active discovery only for assets and methods explicitly authorized by the engagement. Record detection outcomes; do not evade controls.

**Red recon is fundamentally different from pentest recon:**

| Dimension | Pentest Recon | Red Team Recon |
|---|---|---|
| Stealth priority | Low | Critical |
| Active scanning | Aggressive | Minimal — passive first |
| Timeline | Hours | Days to weeks |
| Footprint | Accepted | Minimized |
| Goal | Attack surface map | Full intelligence picture for APT simulation |
| Detection risk | Acceptable | Actively managed |

---

## PREREQUISITES

- [ ] Exact target domain or IP supplied
- [ ] A current signed authorization letter/rules of engagement covers any active-discovery target and method before Phase 2 or 3

Passive OSINT can proceed from the supplied target without contacting it. Do not treat related domains or discovered hosts as active scope unless the rules explicitly include them.

---

## DECISION LOGIC

```
Phase 0: Confirm the target and evidence workspace
Phase 1: Passive OSINT only (zero active traffic to target)
  → Build initial intelligence model from public sources
  → Identify identity exposure (credentials, emails, social)
  → Map technology from passive signals
Phase 2: Active discovery (only explicitly authorized assets/methods)
  → HTTP and application fingerprinting
  → Approved port and service discovery
  → Endpoint, API, and authentication-surface mapping
  → Technology-specific vulnerability assessment in red-assess

At each phase:
  → Update attack model
  → Register new hypotheses via pentest_hypothesize
  → Evaluate: do we have enough to proceed? more recon = more exposure
```

**Detection risk assessment before every action:**
```
LOW:    Pure passive — no traffic to target (OSINT, public data)
MEDIUM: Traffic indistinguishable from normal user (single requests, browser UA)
HIGH:   Traffic anomalous (port scans, vulnerability probes, automation patterns)

Use the lowest request volume that answers the hypothesis. Do not spoof
identities or source addresses, evade detection, or continue after a block or
alert. Active discovery requires the explicit authorization gate.
```

---

## TOOLS

| Tool | WHY | WHEN | DETECTION RISK | EVIDENCE PRODUCED |
|------|-----|------|----------------|-------------------|
| `subfinder` | Passive subdomain enumeration from APIs | Phase 1 — zero target traffic | None (passive APIs) | Subdomains, infrastructure hints |
| `amass` (passive) | Multi-source passive DNS and certificate data | Phase 1 | None | DNS records, historical data |
| `theHarvester` | Email, domain, host OSINT from public sources | Phase 1 | None | Emails, employee names, domains |
| `shodan` | Internet-wide scan data without hitting target | Phase 1 | None | Ports, banners, vulnerabilities |
| `httpx` (cautious) | HTTP probing with browser-like headers | Phase 2 — very limited | Low — browser-like | Status codes, server headers |
| `gitleaks` | Credential exposure in public repos | Phase 1 | None | API keys, passwords, tokens |
| `curl` | Single targeted requests, browser UA | Phase 2 | Low | Specific responses |

**Tools NOT used in red-recon (too loud):**
- `nmap` with default settings — use only with `-T1 --max-parallelism 1`
- `nuclei` — explicit fingerprinting, anomalous traffic
- `ffuf/gobuster` — brute-force patterns detected by most WAFs/IDS
- Automated scanners — never in red team recon

---

## PHASE 0: ENGAGEMENT SETUP

Before any action:

- The engagement workflow is authoritative for scope, test identities, source
  networks, browser/device profiles, and stop conditions.
- Use the approved source network and identify the scanner/browser honestly.
  Do not use proxy rotation, forged user agents, or client profiles to evade
  attribution, rate limits, alerts, or blocks.
- If a control detects or blocks the test, stop active recon and report the
  signal. Do not switch source IPs to continue.

Create the engagement evidence directory only after the target is supplied.
Do not route traffic through unapproved infrastructure.

---

## PHASE 1: PASSIVE INTELLIGENCE (ZERO TARGET TRAFFIC)

### 1.1 Infrastructure Mapping

```bash
# Passive subdomain enumeration — no direct target traffic
subfinder -d $TARGET -all -silent \
  -o $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/subdomains.txt

# Amass passive mode only
amass enum -passive -d $TARGET \
  -o $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/amass.txt 2>/dev/null

# Certificate transparency — reveals internal hostnames
curl -s "https://crt.sh/?q=%.${TARGET}&output=json" | \
  jq -r '.[].name_value' | sort -u | \
  grep -v "^\*" | \
  tee $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/cert-transparency.txt

# DNS history (passive)
curl -s "https://securitytrails.com/domain/$TARGET/history/a" 2>/dev/null | \
  grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | sort -u | \
  tee $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/ip-history.txt

# Shodan — internet scan data (no target traffic)
shodan search "hostname:$TARGET" --fields ip_str,port,org,product,version 2>/dev/null | \
  tee $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/shodan.txt

shodan search "ssl.cert.subject.cn:$TARGET" --fields ip_str,port,product 2>/dev/null | \
  tee -a $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/shodan.txt
```

### 1.2 People, Organization, and Credential Exposure

Collect relevant professional details published for work: names, current or
past employer, role or job title,
public professional biography, work email, and office phone or office location
when relevant. Use official company pages, public professional profiles,
conference biographies, job listings, and public filings. Record each source
and collection date. Do not collect private phone numbers, home addresses,
family details, or personal-account data; do not contact employees. Keep email
harvesting limited to work addresses relevant to the in-scope organization.
Never validate, reuse, or test leaked credentials; record the exposure source
and notify the owner.

```bash
# Email harvesting
theHarvester -d $TARGET -b google,bing,linkedin,hunter -l 200 \
  -f $HOME/.omop/red-team/$ENGAGEMENT/identity/harvester.html 2>/dev/null

# Extract emails from harvester output
grep -oE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" \
  $HOME/.omop/red-team/$ENGAGEMENT/identity/harvester.html | sort -u | \
  tee $HOME/.omop/red-team/$ENGAGEMENT/identity/emails.txt

# Identify email format from found addresses
# Pattern: first.last@, f.last@, first@, flast@
python3 -c "
import sys
emails = open('$HOME/.omop/red-team/$ENGAGEMENT/identity/emails.txt').readlines()
for e in emails[:5]:
    parts = e.strip().split('@')[0]
    print(parts)
"

# LinkedIn intelligence (manual — automated scraping violates ToS)
echo "Manual OSINT required:"
echo "LinkedIn: site:linkedin.com/in/ \"$TARGET\""
echo "Look for: employee names, roles, technologies mentioned"

# Public credential exposure — GitHub
gitleaks detect --source . 2>/dev/null || true
# Search GitHub for target domain
echo "GitHub dork: site:github.com \"$TARGET\" password OR secret OR api_key OR token"
# Search pastebins
echo "Pastebin: site:pastebin.com \"$TARGET\""
```

### 1.3 Technology Intelligence (Passive)

```bash
# Job postings reveal internal tech stack
echo "Job posting analysis — search:"
echo "site:linkedin.com \"$TARGET\" \"engineer\" OR \"developer\" OR \"security\""
echo "Look for: cloud providers, frameworks, security tools, internal product names"

# BuiltWith / Wappalyzer data (no target traffic)
curl -s "https://api.builtwith.com/free1/api.json?KEY=FREE&LOOKUP=$TARGET" 2>/dev/null | \
  jq -r '.Results[0].Result.Paths[0].Technologies[].Name' 2>/dev/null | \
  tee $HOME/.omop/red-team/$ENGAGEMENT/intel/builtwith-tech.txt

# Google dorks (manual — automated google search = rate limited)
echo "=== Google Intelligence Dorks ==="
echo "site:$TARGET filetype:pdf OR filetype:docx OR filetype:xlsx"
echo "site:$TARGET inurl:admin OR inurl:login OR inurl:portal"
echo "site:$TARGET \"internal\" OR \"confidential\" OR \"restricted\""
echo "site:$TARGET ext:env OR ext:config OR ext:bak OR ext:sql"
```

---

## PHASE 2: ACTIVE SERVICE DISCOVERY (AUTHORIZED)

Only proceed after Phase 1 is complete and a current signed authorization
letter/rules of engagement explicitly authorizes discovery on the exact assets
and methods being tested. Browser-like headers
must identify the approved test client; do not use them to disguise traffic.

```bash
# HTTP probe — browser-like, minimal set of targets
# Only probe domains confirmed from Phase 1

# Live host check with browser headers
cat $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/subdomains.txt | \
  httpx -silent -sc -title -server \
    -H "User-Agent: $USERAGENT" \
    -rate-limit 5 \
    -json -o $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/httpx.json 2>/dev/null

# Extract interesting targets
cat $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/httpx.json | \
  jq -r 'select(.status_code == 200) | .url' > \
  $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/live-200.txt

# Identify high-value targets
cat $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/httpx.json | \
  jq -r 'select(.title | test("login|admin|portal|vpn|remote|citrix|owa|exchange|gitlab|jira|jenkins"; "i")) | "\(.url) — \(.title)"' | \
  tee $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/high-value.txt

# Single targeted request to confirm specific hypothesis
# DO NOT automate broad requests — one at a time with human review
curl -s -H "User-Agent: $USERAGENT" \
  "https://target.example.com" \
  -o /dev/null -D - 2>/dev/null | head -20
```

---

## PHASE 3: PORT AND SERVICE DISCOVERY (AUTHORIZED)

Only if a current signed authorization letter/rules of engagement explicitly
authorizes active scanning.

```bash
# Port scan — only an explicitly in-scope target, at the approved rate
nmap -T1 -sV --max-parallelism 1 \
  -p 21,22,23,25,53,80,110,143,443,445,993,995,1433,3306,3389,5432,5985,5986,6379,8080,8443,27017 \
  --open \
  -oX $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/nmap.xml \
  TARGET_IP_ONLY 2>/dev/null

# Parse interesting ports
cat $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/nmap.xml | \
  grep -E "portid|service|product|version" | head -50

# Service-specific probing — targeted, not broad
# RDP accessible?
nmap -T1 -p 3389 --script rdp-enum-encryption TARGET_IP 2>/dev/null
# SMB accessible?
nmap -T1 -p 445 --script smb2-security-mode TARGET_IP 2>/dev/null
```

---

## INTELLIGENCE MODEL ASSEMBLY

After each phase, update the attack model:

```bash
cat > $HOME/.omop/red-team/$ENGAGEMENT/attack-model/current-model.md << EOF
# Red Team Attack Model — $TARGET — $(date +%Y-%m-%d)

## Infrastructure
$(wc -l < $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/subdomains.txt) subdomains discovered
Live hosts: $(wc -l < $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/live-200.txt 2>/dev/null || echo 0)

## High-Value Targets
$(cat $HOME/.omop/red-team/$ENGAGEMENT/infrastructure/high-value.txt 2>/dev/null || echo "None identified yet")

## Identity Exposure
Emails found: $(wc -l < $HOME/.omop/red-team/$ENGAGEMENT/identity/emails.txt 2>/dev/null || echo 0)
Email format: [identified from samples]

## Technology Stack
$(cat $HOME/.omop/red-team/$ENGAGEMENT/intel/builtwith-tech.txt 2>/dev/null | head -10)

## Credential Exposure
[Summary of any credentials or tokens found]

## Attack Hypotheses
[Populated after hypothesis registration]

## Next Priority Actions
[Based on intelligence gaps]
EOF
```

---

## EXPECTED OBSERVATIONS

| Observation | Intelligence Value | Attack Hypothesis |
|---|---|---|
| VPN/Citrix/OWA exposed | Remote access entry point | Credential stuffing, password spray |
| Dev/staging subdomains live | Weaker security controls | Reused credentials, debug endpoints |
| Employee work emails or credentials referenced in breach data | Potential exposure | Record source and notify the owner; do not test or reuse credentials |
| API keys in public GitHub | Direct system access | Immediate credential use |
| Jenkins/GitLab exposed | CI/CD pipeline attack | RCE via pipeline or credential theft |
| S3/blob buckets misconfigured | Data access | Sensitive file retrieval |
| Old CVE in Shodan banner | Known exploit available | Direct exploitation |
| Internal hostnames in certs | Internal network visibility | Internal pivot planning |
| Login portal with weak lockout policy | Authentication control gap | Review published or client-provided policy; do not spray accounts |

---

## HYPOTHESIS REGISTRATION

For each intelligence finding:

```
pentest_hypothesize(
  session_id: <session>,
  name: "<specific attack path>",
  vuln_class: "<CredentialSpray|DirectExploit|MisconfigAccess|...>",
  asset: "<hostname>",
  endpoint: "<specific target>",
  security_boundary: "<what should protect this>",
  triggering_evidence: "<exact intelligence that led here>",
  is_scanner_hit: false  # most red recon is OSINT, not scanner
)
```

Update living attack model:
```
pentest_target_model_update(
  session_id: <session>,
  tool_output: "<summary of phase findings>",
  tool_name: "red-recon"
)
```

---

## FAILURE MODES

| Failure | Root Cause | Response |
|---|---|---|
| No subdomains found | Tight DNS hygiene | Expand to IP ranges, ASN lookup, certificate transparency deeper search |
| No work emails harvested | Low public footprint | Review public professional profiles and official company sources |
| Shodan returns nothing | IPs recently changed or behind CDN | Check CDN detection, historical IP data |
| All subdomains behind Cloudflare | CDN obscures real IPs | Origin IP discovery: historical DNS, email headers, TLS cert SANs |
| Phase 2 traffic gets blocked | IDS/WAF detection | Stop active probing, preserve the signal, and notify the engagement contact |
| No public code findings | Low public footprint | Review public work-related profiles and repositories; do not investigate personal accounts |

---

## STOP CONDITIONS

Stop discovery and proceed to `red-assess` when:

- High-value entry points identified (VPN, email portal, exposed admin)
- Credential exposure found (even partial)
- Initial attack paths defined with at least L1 evidence
- A control blocks or detects activity; stop that activity and record the signal

**Do not over-recon.** More recon = more exposure. Move to exploitation planning when first viable paths are identified.

---

## REPORTING

Intelligence summary feeds directly into red team executive report:

```
$HOME/.omop/red-team/$ENGAGEMENT/
  infrastructure/    all infrastructure intel
  identity/          email + credential findings
  intel/             technology and OSINT data
  attack-model/      current attack model + hypotheses
```

Hand off to `red-assess` with:
- `attack-model/current-model.md` populated
- At least 2 Priority 1 attack hypotheses registered
- High-value targets identified
