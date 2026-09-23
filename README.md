<div align="center">

# CryptHunter

**Autonomous Security Intelligence Engine**

[![Release](https://img.shields.io/github/v/release/cryptdefender323/crypthunt?color=369eff&labelColor=111&logo=github&style=flat-square)](https://github.com/cryptdefender323/crypthunt/releases)
[![Stars](https://img.shields.io/github/stars/cryptdefender323/crypthunt?color=ffcb47&labelColor=111&style=flat-square)](https://github.com/cryptdefender323/crypthunt/stargazers)
[![License](https://img.shields.io/badge/license-SUL--1.0-white?labelColor=111&style=flat-square)](LICENSE.md)
[![OpenCode](https://img.shields.io/badge/OpenCode-plugin-369eff?labelColor=111&style=flat-square)](https://opencode.ai)
[![Codex](https://img.shields.io/badge/Codex-compatible-5865F2?labelColor=111&style=flat-square)](https://openai.com/codex)

</div>

---

**An AI agent that runs penetration tests. End to end. No babysitting.**

Define the scope. The agent runs recon, maps the attack surface, exploits findings, validates every result, and delivers a report. You review findings, not progress.

---

## What it does

```
You:     fullscan https://target.example.com
Agent:   [RECON]      subfinder, httpx, nmap, katana...
         [ENUM]       nuclei, ffuf, dalfox, sqlmap...
         [EXPLOIT]    chained vuln exploitation, WAF bypass...
         [VALIDATE]   every finding confirmed before report
         [REPORT]     CVSS 4.0, PoCs, attack chain narrative
You:     read the report
```

130+ tools. 250+ skill playbooks. 19 engagement modes.

---

## Installation

### macOS

```bash
curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh | bash
```

Installs Node.js, Bun, OpenCode, and CryptHunter automatically. After install:

```bash
exec $SHELL            # reload PATH
crypthunter install    # setup AI provider
opencode               # launch
```

### Linux (Kali / Parrot / Ubuntu / Debian / Arch)

```bash
curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh | bash
```

After install:

```bash
exec $SHELL            # reload PATH
crypthunter install    # setup AI provider
opencode               # launch
```

### Windows (PowerShell as Administrator)

```powershell
winget install OpenJS.NodeJS.LTS
npm install -g opencode-ai --allow-scripts
powershell -c "irm bun.sh/install.ps1 | iex"
curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh | bash
crypthunter install
```

### Verify

```bash
crypthunter doctor
```

### Codex Light Edition

```bash
npx lazycodex-ai install
```

---

## After Install

Type `opencode`. Agents appear immediately:

```
Cerberus    main orchestrator + security intelligence brain
Scylla      deep autonomous worker
Talos       strategic planner
Argus       todo executor
```

Start an engagement:

```text
fullscan https://target.example.com
fullscan 10.0.0.1/24
/mode ctf
/mode red-team
/mode bug-bounty
```

Switch mode mid-session:

```text
/mode ctf
/mode red-team
/mode forensic
```

The agent will re-inject specialized context for the new mode. In red-team mode, high-noise scanners (nikto, gobuster, dirsearch) are automatically suppressed. In blue-team/forensic mode, all offensive tools are removed from the session.

Engagement state (hypotheses, evidence ladder, confirmed findings) is persisted to `.omop/engagement/` and survives process restarts.

---

## Engagement Modes

| Mode | Use case | Output |
|---|---|---|
| `auto` | Unknown target | Standard |
| `bug-bounty` | HackerOne, Bugcrowd, Intigriti | HackerOne format |
| `red-team` | Stealth ops, persistence, AD | Executive summary |
| `ctf` | HackTheBox, TryHackMe, picoCTF | Flag |
| `blue-team` | Detection, IR, defensive audit | IR report |
| `offensive` | Aggressive exploitation | Technical |
| `grey-hat` | Balanced assessment | Technical |
| `forensic` | Evidence preservation | Chain-of-custody |
| `reverse-engineering` | Binaries, firmware | Technical RE |
| `mobile-pentest` | Android / iOS | OWASP Mobile |
| `ctf-pwn` | Binary exploitation deep | Flag |
| `ctf-crypto` | Cryptography deep | Flag |
| `ctf-reversing` | Reversing deep | Flag |
| `ctf-web` | Web CTF deep | Flag |
| `ctf-forensics` | Forensics deep | Flag |
| `cloud-pentest` | AWS / GCP / Azure | Cloud report |
| `ad-audit` | Active Directory audit | AD report |

```
/mode red-team
/mode bug-bounty
/mode ctf
/mode ctf-crypto
```

---

## Skill Library

250+ skill playbooks — executed by the agent, readable by you.

**Security Assessment**

```
pentest-recon    pentest-enum     pentest-exploit
pentest-privesc  pentest-report   bug-bounty-research
```

**Red Team**

```
red-recon    red-exploit    red-lateral    red-persistence    phantom-c2
post-linux-privesc  post-windows-privesc  post-bloodhound
post-credential-dumping  post-pivoting  post-container-escape
```

**Vulnerability Classes**

```
vuln-sqli  vuln-xss  vuln-ssrf  vuln-cors  vuln-idor  vuln-rce
vuln-xxe   vuln-ssti  vuln-deserialization  vuln-file-upload
vuln-http-smuggling  vuln-race-conditions  vuln-business-logic
vuln-jwt   vuln-oauth  vuln-2fa-bypass  vuln-account-takeover
vuln-bfla  vuln-websocket  vuln-waf-bypass  vuln-prototype-pollution
```

**Reconnaissance**

```
recon-full    recon-subdomain    recon-js-analysis    recon-secrets
recon-shodan  recon-dorking      recon-cloud-assets   recon-asn-whois
```

**Payload Collections**

```
payload-xss  payload-sqli  payload-ssrf  payload-ssti
payload-xxe  payload-lfi   payload-command-injection
```

**CTF (30+ categories)**

```
ctf-pwn          ctf-pwn-heap      ctf-pwn-rop       ctf-pwn-kernel
ctf-crypto       ctf-crypto-rsa    ctf-crypto-ecc    ctf-crypto-prng
ctf-crypto-advanced-math          ctf-crypto-lattice
ctf-reverse-tools  ctf-reverse-dynamic  ctf-reverse-anti-analysis
ctf-web-server-side  ctf-web-client-side  ctf-web-web3
ctf-forensics    ctf-forensics-disk  ctf-forensics-network
ctf-misc-pyjails  ctf-misc-rf-sdr
```

All skills in [`.agents/skills/`](.agents/skills/).

---

## Tool Coverage

130+ security tools. Missing tools install automatically before first use.

| Phase | Tools |
|---|---|
| Recon / OSINT | subfinder · amass · httpx · nmap · naabu · katana · theHarvester · shodan |
| Secrets | trufflehog · gitleaks |
| Enumeration | nuclei · ffuf · gobuster · feroxbuster · whatweb · wafw00f · nikto |
| Web Exploitation | sqlmap · commix · dalfox · xsstrike |
| Credential / Auth | hydra · hashcat · john · certipy · kerbrute |
| Active Directory | netexec · bloodhound · crackmapexec · impacket · responder · certipy |
| C2 / Pivoting | phantom · metasploit · sliver · havoc · chisel · ligolo-ng |
| Post-Exploitation | peass-ng · pwntools · ropper · ROPgadget |
| Forensics / IR | volatility3 · tshark · binwalk · yara · exiftool · autopsy |
| Reverse Engineering | ghidra · radare2 · angr · frida · jadx · gdb · pwndbg |
| Cloud | pacu · prowler · scoutsuite |
| Mobile | apktool · jadx · frida · objection · mobsf |

Full catalog: [`tools-catalog.json`](tools-catalog.json)

---

## Reasoning Layer

```
Scanner Signal → Hypothesis → Test → Evidence
→ Validation → Adversarial Review → Confidence → Report
```

Every finding goes through a 9-stage false-positive battery before it can be reported. CONFIRMED requires L4 — demonstrated attacker capability.

| Level | Gate | Required for |
|---|---|---|
| L1 | Scanner / version signal | POSSIBLE |
| L2 | Behavior independently reproduced | POSSIBLE |
| L3 | Security boundary confirmed | LIKELY |
| **L4** | **Attacker capability demonstrated** | **CONFIRMED** |
| L5 | Impact on sensitive resource | High / Critical CVSS |
| L6 | Full attack chain with artifacts | Executive report |

---

## Phantom C2

[Phantom](https://github.com/cryptdefender323/phantom) — first-class C2 in the red-team chain.

- Multi-protocol: mTLS · WireGuard · HTTP/S · DNS
- AV/EDR evasion: AMSI · ETW · DLL unhooking · sleep obfuscation · indirect syscalls
- Per-binary asymmetric keys — no signature reuse between implants
- BOF/COFF in-memory execution · TCP and named pipe pivoting

```bash
git clone https://github.com/cryptdefender323/phantom.git
cd phantom && make
```

---

## Team Mode

```jsonc
{
  "team_mode": {
    "enabled": true,
    "max_parallel_members": 4,
    "tmux_visualization": true
  }
}
```

---

## Uninstall

```bash
jq '.plugin = [.plugin[] | select(. != "crypthunter")]' \
    ~/.config/opencode/opencode.json > /tmp/oc.json && \
    mv /tmp/oc.json ~/.config/opencode/opencode.json

rm -f ~/.config/opencode/crypthunter.jsonc
rm -rf .omop/
```

---

## Further Reading

- [CHANGELOG.md](CHANGELOG.md)
- [ROADMAP.md](ROADMAP.md)
- [Installation Guide](docs/guide/installation.md)
- [Engagement Modes](docs/guide/modes.md)
- [Tool Reference](docs/guide/tools.md)
- [Team Mode](docs/guide/team-mode.md)

---

> For authorized security testing only. Using this tool against systems you do not own or have explicit written permission to test is illegal.

---

Contributions welcome — PRs to `main`.
# crypthunt
# crypthunt
# crypthunt
# crypthunt
