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

**[Download and install](#download-and-install)** · [After install](#after-install) · [Modes](#engagement-modes) · [Docs](docs/guide/installation.md)

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

## Download and install

Repo: [github.com/cryptdefender323/crypthunt](https://github.com/cryptdefender323/crypthunt)

Pick **one** path. Option 1 is enough for most people.

| OS | Command |
|---|---|
| macOS / Linux / WSL | `curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh \| bash` |
| Windows (PowerShell) | `irm https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.ps1 \| iex` |

The installer installs Node.js, Bun, Git, OpenCode, clones this repo to `~/.crypthunter` (Windows: `%USERPROFILE%\.crypthunter`), and registers the plugin.

### 1. macOS / Linux (Kali, Parrot, Ubuntu, Debian, Arch, Fedora, WSL)

Open Terminal and run:

```bash
curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh | bash
```

Reload PATH, then finish setup:

```bash
exec $SHELL
crypthunter install
opencode
```

`crypthunter install` asks which AI provider to use (Claude, OpenAI, Gemini, Copilot, or local).

### 2. Windows

1. Open **PowerShell** (Search → PowerShell). Admin is not required.
2. Paste:

```powershell
irm https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.ps1 | iex
```

If Windows blocks the script:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.ps1 | iex"
```

3. Close PowerShell. Open a **new** PowerShell window.
4. Run:

```powershell
crypthunter install
opencode
```

Needs Windows 10/11 with `winget` (install **App Installer** from the Microsoft Store if `winget` is missing).

### 3. Download the source yourself (git clone)

Use this if you want the files on disk, or if you are developing.

You need Git, [Node.js 22+](https://nodejs.org), and [Bun](https://bun.sh).

```bash
git clone https://github.com/cryptdefender323/crypthunt.git
cd crypthunt
bun install
bun run build
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

ZIP from GitHub: green **Code** button → **Download ZIP** → unzip → same `bun install` / `bun run build` / `bun run dist/cli/index.js install` steps inside the folder.

### 4. Check that it worked

```bash
crypthunter doctor
```

Optional pentest binaries (nmap, nuclei, and the rest) can wait:

```bash
crypthunter tools install
```

### 5. Codex Light (optional)

```bash
npx lazycodex-ai install
```

### If something fails

| Problem | Fix |
|---|---|
| `curl` / `irm` 404 | Repo must be **public**, or you must be logged into GitHub. Branch is `main`. |
| `crypthunter: command not found` | Close the terminal and open a new one. On macOS/Linux also run `exec $SHELL`. |
| `bun: command not found` | Install from [bun.sh](https://bun.sh), then open a new terminal. |
| Windows: execution policy | Use the `-ExecutionPolicy Bypass` command above. |
| Windows: `winget` missing | Install **App Installer** from the Microsoft Store, then retry. |
| Installer cannot clone | Run Option 3 (`git clone`) instead. |

Longer notes: [docs/guide/installation.md](docs/guide/installation.md)

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

macOS / Linux:

```bash
rm -rf ~/.crypthunter ~/.local/bin/crypthunter ~/.local/bin/ch
rm -f ~/.config/opencode/crypthunter.jsonc
```

Then delete the `file://...crypthunter.js` line from `~/.config/opencode/opencode.jsonc`.

Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.crypthunter"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\crypthunter"
```

Then delete the plugin line from `%USERPROFILE%\.config\opencode\opencode.jsonc`.

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
