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

Choose the path for your environment. The installer detects the current OS and package manager, then uses the current user's home/config directories.

| Environment | Recommended path |
|---|---|
| macOS, Linux, WSL, or Git Bash | Automatic installer below |
| Windows PowerShell | Source install below |
| Development or troubleshooting | Clone and build locally |

### Automatic installer: macOS, Linux, WSL, and Git Bash

Run this from the shell where you will use CryptHunter:

```bash
curl -fsSL https://raw.githubusercontent.com/cryptdefender323/crypthunt/main/install.sh | bash
```

The installer uses these defaults and supports overrides:

| Purpose | Default | Override |
|---|---|---|
| CryptHunter source | `~/.crypthunter` | `CRYPTHUNTER_INSTALL_DIR=/path/to/crypthunter` |
| OpenCode config | `~/.config/opencode` | `OPENCODE_CONFIG_DIR=/path/to/opencode-config` |
| Launcher | `~/.local/bin` | Add the directory to `PATH` manually if needed |

Reload PATH, then finish setup:

```bash
exec $SHELL
crypthunter install
opencode
```

`crypthunter install` asks which AI provider you want to use. Choose only providers for which you have access or credentials.

### Windows PowerShell

The repository currently does not ship a native `install.ps1`. Use PowerShell with Git, Node.js 22+, and Bun already installed:

```powershell
git clone https://github.com/cryptdefender323/crypthunt.git
Set-Location crypthunt
bun install --frozen-lockfile
bun run build
bun run dist/cli/index.js install --platform opencode
bun run dist/cli/index.js doctor
opencode
```

For the most compatible Windows shell, use WSL or Git Bash and the automatic installer above. Native Windows support depends on the availability of OpenCode, Bun, and each optional security tool for Windows.

### Clone and build locally

Use this if you want the files on disk, or if you are developing.

You need Git, [Node.js 22+](https://nodejs.org), and [Bun](https://bun.sh).

```bash
git clone https://github.com/cryptdefender323/crypthunt.git
cd crypthunt
bun install --frozen-lockfile
bun run build
bun run dist/cli/index.js install
bun run dist/cli/index.js doctor
```

ZIP from GitHub: green **Code** button → **Download ZIP** → unzip → same `bun install` / `bun run build` / `bun run dist/cli/index.js install` steps inside the folder.

To use a custom source and OpenCode config directory on macOS/Linux/WSL:

```bash
CRYPTHUNTER_INSTALL_DIR="$HOME/tools/crypthunter" OPENCODE_CONFIG_DIR="$HOME/.config/opencode-personal" bash install.sh
```

### Check that it worked

```bash
crypthunter doctor
```

Optional pentest binaries can be installed only when needed:

```bash
crypthunter tools install
```

### Codex Light (optional)

```bash
npx lazycodex-ai install
```

### If something fails

| Problem | Fix |
|---|---|
| `curl` / `irm` 404 | Repo must be **public**, or you must be logged into GitHub. Branch is `main`. |
| `crypthunter: command not found` | Close the terminal and open a new one. On macOS/Linux also run `exec $SHELL`. |
| `bun: command not found` | Install from [bun.sh](https://bun.sh), then open a new terminal. |
| Windows native install fails | Use WSL or Git Bash, or follow the source-install steps above. |
| OpenCode is not registered | Run `bun run dist/cli/index.js install --platform opencode`, then `crypthunter doctor`. |
| Custom directory is needed | Set `CRYPTHUNTER_INSTALL_DIR` and/or `OPENCODE_CONFIG_DIR` before running `install.sh`. |
| Installer cannot clone | Use the local clone-and-build steps instead. |

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
# crypthunt
# crypthunt
# crypthunt
