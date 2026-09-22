---
name: red-recon
description: "Red team reconnaissance. Stealth OSINT, passive enumeration, active scanning with OPSEC discipline, attack surface modeling, and hypothesis generation. Integrates with research-orchestrator for task graph and adaptive planning. Before every action: state detection risk and alternative. Triggers: 'red recon', 'red team recon', 'stealth recon', 'osint', 'passive recon', 'attack surface', 'red team intel'."
version: 2.0.0
phase: ["recon"]
category: ["recon"]
tools: ["subfinder", "amass", "httpx", "nmap", "nuclei", "ffuf", "shodan", "theHarvester"]
tags: ["red-team", "stealth", "osint", "passive", "recon", "attack-surface", "hypothesis"]
---

# Red Team Reconnaissance

You are building the intelligence foundation for a red team engagement. Every action here shapes the attack-path model for exploitation, lateral movement, and persistence.

**Before every action, answer:**
```
OBJECTIVE:       What specific intelligence does this action gather?
DETECTION RISK:  How visible is this action to defenders?
ALTERNATIVE:     Is there a lower-risk method for the same intelligence?
EVIDENCE:        What artifact proves this intelligence was gathered?
```

Never run a tool that cannot answer OBJECTIVE and DETECTION RISK.

---

## Phase 0: Tool Readiness

```bash
bunx crypthunter tools check
bunx crypthunter tools install

git clone https://github.com/cryptdefender323/phantom.git && cd phantom && make
./phantom-server --version
```

Save gap report: `.omop/red-team/<engagement>/recon/tool-status.txt`

---

## Phase 1: Passive OSINT (Zero Active Traffic)

Detection risk: **None** — no traffic reaches the target.

```bash
mkdir -p .omop/red-team/<engagement>/recon

subfinder -d <target> -silent -all -o recon/subdomains-passive.txt
amass enum -d <target> -passive -o recon/subdomains-amass.txt
cat recon/subdomains-*.txt | sort -u > recon/subdomains.txt

theHarvester -d <target> -b all -f recon/theharvester.xml

curl -s "https://crt.sh/?q=%.<target>&output=json" | jq '.[].name_value' | \
  tr ',' '\n' | sort -u >> recon/subdomains.txt

dig +short MX <target>
dig +short NS <target>
dig +short TXT <target>
dig +short _dmarc.<target> TXT
dig AXFR <target> @<ns> 2>/dev/null

shodan search "hostname:<target>" --fields ip_str,port,org,product 2>/dev/null | \
  tee recon/shodan.txt
```

Job posting analysis (technology hints):
```bash
python3 -c "
import requests, re
r = requests.get('https://www.linkedin.com/jobs/search/?keywords=<company>&location=')
techs = re.findall(r'(AWS|Azure|GCP|Kubernetes|Docker|Jenkins|Terraform|Ansible|Spring|Django|Rails|Laravel)', r.text)
print(set(techs))
"
```

Output: `recon/subdomains.txt`, `recon/osint-techs.txt`, `recon/theharvester.xml`

---

## Phase 2: Passive HTTP Probe (Minimal Traffic)

Detection risk: **Low** — single requests per host, no enumeration.

```bash
httpx -l recon/subdomains.txt \
  -silent -sc -td -title -server \
  -rate-limit 5 \
  -json -o recon/httpx-probe.json

cat recon/httpx-probe.json | jq '.url' | head -30
cat recon/httpx-probe.json | jq 'select(.status_code == 200) | .url' > recon/live-hosts.txt
cat recon/httpx-probe.json | jq '.tech' | sort | uniq -c | sort -rn > recon/tech-stack.txt
```

---

## Phase 3: Stealth Port Scan (Low-and-Slow)

Detection risk: **Medium** — slow scan to avoid threshold alerts.

```bash
nmap -sS -T2 -f --mtu 24 \
  -p 22,80,443,445,3389,8080,8443,3306,5432,6379,27017,5985,5986 \
  -D RND:5 \
  --max-retries 1 \
  -iL recon/live-hosts.txt \
  -oX recon/stealth-scan.xml \
  -oG recon/stealth-scan.gnmap

nmap -sV -T2 --version-intensity 2 \
  -iL recon/live-hosts.txt \
  -oX recon/version-scan.xml

grep "open" recon/stealth-scan.gnmap | awk '{print $2}' | sort -u > recon/open-hosts.txt
```

---

## Phase 4: Active Enumeration (Targeted, Evidence-Justified)

Only run against hosts where passive + HTTP probe produced specific hypotheses.

Detection risk: **Medium-High** — targeted, not broad.

```bash
nuclei -l recon/live-hosts.txt \
  -t exposures/ -t misconfiguration/ \
  -severity medium,high,critical \
  -rate-limit 3 \
  -stats \
  -json -o recon/nuclei-results.json

ffuf -u https://<target>/FUZZ \
  -w /usr/share/wordlists/dirb/big.txt \
  -mc 200,301,302,401,403 \
  -rate 5 -t 2 \
  -json -o recon/ffuf-dirs.json
```

AD-specific enumeration (if AD environment detected):
```bash
responder -I eth0 -A -v 2>/dev/null &
sleep 30 && kill %1

enum4linux -a <target-ip> | tee recon/enum4linux.txt

ldapsearch -x -H ldap://<dc-ip> -b "DC=domain,DC=local" \
  "(objectClass=user)" sAMAccountName mail 2>/dev/null | \
  tee recon/ldap-users.txt
```

---

## Phase 5: Attack Surface Modeling

Load `[ANALYST: ATTACK_SURFACE]`. Synthesize all gathered intelligence into a structured model.

```markdown
## Attack Surface Model — <engagement> — <date>

### External Exposure
- Subdomains: [count] live, [count] unique
- Open ports: [list with services]
- Web applications: [list with tech stack]
- Email/MX infrastructure: [details]

### Technology Stack
- Frontend: [detected]
- Backend: [detected]
- Infrastructure: [cloud provider, CDN, WAF]
- Database: [detected]
- Authentication: [SSO, OAuth, LDAP, AD?]

### AD / Internal Indicators
- Domain name: [if detected]
- DC IP: [if detected]
- Users enumerated: [count]
- SPNs visible: [yes/no]

### Attack Surface Gaps (Unknown)
- [What we could not determine passively]
- [What requires active testing to confirm]
```

Save to: `recon/attack-surface.md`

---

## Phase 6: Hypothesis Generation

Load `[ANALYST: VULNERABILITY]`. Generate specific, testable initial access hypotheses from recon evidence.

Format:
```
H-RT-001:
  claim:         [Specific service] on [host] is exploitable via [technique]
  evidence_basis: [evidence_id from recon]
  technique:     phishing | credential-spray | vuln-exploit | supply-chain | physical
  evidence_level: L1
  opsec_risk:    low | medium | high
  test:          [minimum action to advance to L2]
  disproof:      [what would rule this out]
  priority:      1 | 2 | 3
```

Example hypotheses from common recon findings:
```
H-RT-001: VPN service (443/Cisco AnyConnect) → check against known CVEs (CVE-2023-20269)
H-RT-002: Exchange OWA exposed → credential spray with harvested emails
H-RT-003: Jenkins console accessible → unauthenticated script execution
H-RT-004: AD CS web enrollment → NTLM relay to ESC8
H-RT-005: Outdated CMS detected → authenticated plugin RCE
H-RT-006: S3 bucket misconfiguration → read internal configs / credentials
```

Prioritize by: **impact × opsec cost**. High-impact, low-noise first.

---

## Phase 7: Attack-Path Foundation

Record recon as the first node in the attack path:

```json
{
  "node_id": "N-RT-000",
  "type": "exposure",
  "description": "External attack surface identified: [summary]",
  "evidence_ids": ["recon/attack-surface.md", "recon/httpx-probe.json"],
  "evidence_level": 1,
  "confirmed": true
}
```

Add edges from exposure node to each initial-access hypothesis node (unconfirmed until Phase exploit validates them).

---

## OPSEC Checklist Before Exiting Recon

Before proceeding to red-exploit, confirm:

- [ ] All passive recon complete before any active scanning
- [ ] Active scans rate-limited (T2 or slower)
- [ ] No direct scanning from operator IP (use redirectors / cloud VMs)
- [ ] Shodan/Censys lookups did not require an account linked to operator identity
- [ ] No authentication attempts made (those go in red-exploit)
- [ ] All recon artifacts saved to `.omop/red-team/<engagement>/recon/`
- [ ] Attack surface model written and reviewed
- [ ] At least 3 initial access hypotheses generated with evidence basis

---

## Output

```
.omop/red-team/<engagement>/recon/
  subdomains.txt
  live-hosts.txt
  tech-stack.txt
  stealth-scan.xml
  httpx-probe.json
  nuclei-results.json
  attack-surface.md
  tool-status.txt
```

## Next Skill

`red-exploit` — initial access using prioritized hypotheses from this recon.
