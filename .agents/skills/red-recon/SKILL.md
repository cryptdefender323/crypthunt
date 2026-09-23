---
name: red-recon
description: "Red team reconnaissance — stealth-first intelligence gathering. OPSEC-aware passive recon, infrastructure mapping, identity and credential exposure, technology fingerprinting, internal network discovery, trust relationship mapping. Every action minimizes detection footprint. No active scanning without explicit authorization and stealth assessment. Feeds attack model for red-exploit and red-lateral. Triggers: 'red team recon', 'red recon', 'stealth recon', 'opsec recon', 'adversary simulation recon', 'pre-attack recon', 'infrastructure mapping'."
version: 3.0.0
phase: ["recon"]
category: ["recon"]
tools: ["subfinder", "amass", "httpx", "shodan", "curl", "python3", "theHarvester", "gitleaks"]
tags: ["red-team", "recon", "opsec", "stealth", "infrastructure", "osint", "credential-exposure"]
---

# Red Team Reconnaissance — Stealth Intelligence Engine

## OBJECTIVE

Build a comprehensive, accurate intelligence model of the target before any active engagement. Minimize detection footprint at every step. Every intelligence collection action is a risk decision — weigh value against exposure.

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

- [ ] Rules of engagement documented — authorized actions explicitly defined
- [ ] Attack scenario defined — what adversary are we simulating?
- [ ] OPSEC baseline established — attacker infrastructure ready (VPS, redirectors)
- [ ] Detection threshold understood — is blue team aware of the exercise?
- [ ] Escalation path defined — who to contact if live systems affected

**Stop if RoE is unclear. Red team without written authorization is criminal.**

---

## DECISION LOGIC

```
Phase 0: OPSEC setup → establish clean attacker infrastructure
Phase 1: Passive OSINT only (zero active traffic to target)
  → Build initial intelligence model from public sources
  → Identify identity exposure (credentials, emails, social)
  → Map technology from passive signals
Phase 2: Semi-passive (traffic resembles legitimate users)
  → Light HTTP probing — browser-like requests only
  → Certificate transparency, DNS, WHOIS
  → Job posting analysis (reveals internal tech stack)
Phase 3: Active (if authorized) — targeted, low-noise
  → Port scan only identified targets, not /24 sweeps
  → Service fingerprint without exploit attempts
  → Single-threaded, rate-limited, browser UA

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

Default: stay LOW. Escalate only with explicit justification.
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

## PHASE 0: OPSEC SETUP

Before any action:

```bash
# Verify attacker infrastructure
# All traffic should originate from VPS/cloud — never home/corp IP
curl -s https://api.ipify.org  # confirm IP is clean VPS

# Set browser-like User-Agent for all requests
USERAGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Establish engagement directory
TARGET="target.example.com"
ENGAGEMENT="redteam-$(date +%Y%m%d)-$TARGET"
mkdir -p $HOME/.omop/red-team/$ENGAGEMENT/{intel,infrastructure,identity,credentials,attack-model}

# Note: never store engagement data on shared systems
```

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

### 1.2 Identity and Credential Exposure

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

## PHASE 2: SEMI-PASSIVE (BROWSER-LIKE TRAFFIC)

Only proceed after Phase 1 is complete and has been reviewed.

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

## PHASE 3: TARGETED ACTIVE (AUTHORIZED + LOW-NOISE ONLY)

Only if RoE explicitly authorizes active scanning.

```bash
# Port scan — single target, slow, stealthy
# -T1 = paranoid timing, --max-parallelism 1 = sequential
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
| Employee emails in breach data | Credential exposure | Password spray with breached passwords |
| API keys in public GitHub | Direct system access | Immediate credential use |
| Jenkins/GitLab exposed | CI/CD pipeline attack | RCE via pipeline or credential theft |
| S3/blob buckets misconfigured | Data access | Sensitive file retrieval |
| Old CVE in Shodan banner | Known exploit available | Direct exploitation |
| Internal hostnames in certs | Internal network visibility | Internal pivot planning |
| Login portal with no lockout | Brute-force candidate | Credential spray |

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
| No emails harvested | Low public footprint | LinkedIn manual OSINT, breach databases |
| Shodan returns nothing | IPs recently changed or behind CDN | Check CDN detection, historical IP data |
| All subdomains behind Cloudflare | CDN obscures real IPs | Origin IP discovery: historical DNS, email headers, TLS cert SANs |
| Phase 2 traffic gets blocked | IDS/WAF detection | Stop active probing, remain passive, use different source IPs |
| No GitHub findings | Private repos only | Focus on employee personal accounts, pastebin, StackOverflow |

---

## STOP CONDITIONS

Stop recon and proceed to red-exploit planning when:

- High-value entry points identified (VPN, email portal, exposed admin)
- Credential exposure found (even partial)
- Initial attack paths defined with at least L1 evidence
- Detection risk increasing — any sign of blue team awareness

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

Hand off to `red-exploit` with:
- `attack-model/current-model.md` populated
- At least 2 Priority 1 attack hypotheses registered
- High-value targets identified
