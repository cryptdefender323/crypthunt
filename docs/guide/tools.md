# Tool Reference

40+ security tools, organized by phase. All tools are defined in [`tools-catalog.json`](../../tools-catalog.json) with install commands, flag definitions, and availability checks.

---

## Availability Check

Before any tool runs, the agent checks if it's installed:

```bash
which subfinder    # Linux/macOS
where.exe subfinder  # Windows
```

If missing, the agent installs it automatically using the catalog's install commands and continues. A tool being absent never stops the engagement — the agent falls back to alternatives.

---

## Recon

Subdomain discovery, port scanning, HTTP probing. Runs in all offensive modes.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **subfinder** | Passive subdomain discovery across 100+ sources. Fast. | `go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest` |
| **amass** | Deep active + passive subdomain enumeration | `go install github.com/owasp-amass/amass/v4/...@master` |
| **assetfinder** | Quick subdomain check via cert transparency + DNS | `go install github.com/tomnomnom/assetfinder@latest` |
| **httpx** | HTTP probing — status, title, tech, TLS, redirects | `go install github.com/projectdiscovery/httpx/cmd/httpx@latest` |
| **naabu** | Fast port scanner. SYN scan, top ports, CIDR support | `go install github.com/projectdiscovery/naabu/v2/cmd/naabu@latest` |
| **massdns** | Bulk DNS resolution — feed it a subdomain list | Package manager or [GitHub releases](https://github.com/blechschmidt/massdns) |
| **nmap** | Detailed port scan + service detection + script engine | Package manager (`apt`, `brew`, `choco`) |

**Skills that use recon tools:** `pentest-recon`, `red-recon`, `ctf-recon`

---

## Enumeration

Service fingerprinting, content discovery, vulnerability scanning.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **nuclei** | Template-based vuln scanning across discovered assets | `go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest` |
| **ffuf** | Fast web fuzzer — directories, parameters, vhosts | `go install github.com/ffuf/ffuf/v2@latest` |
| **gobuster** | Directory/file enumeration, DNS brute-force | `go install github.com/OJ/gobuster/v3@latest` |
| **feroxbuster** | Recursive content discovery, fast | Cargo: `cargo install feroxbuster` |
| **dirsearch** | Directory scanner with wordlists | `pip install dirsearch` |
| **whatweb** | Technology fingerprinting — CMS, frameworks, versions | Package manager or `gem install whatweb` |
| **wafw00f** | WAF detection. Affects exploitation strategy. | `pip install wafw00f` |
| **nikto** | Web server scanner — misconfigs, default files, CVEs | Package manager or Perl `cpan` |
| **burpsuite** | Web proxy — manual + automated web app testing | [portswigger.net](https://portswigger.net/burp/communitydownload) |
| **owasp-zap** | Web app security scanner — active + passive | [zaproxy.org](https://www.zaproxy.org/download/) |
| **wireshark** | PCAP analysis, network capture | [wireshark.org](https://www.wireshark.org/download.html) |
| **yara** | Pattern-based file/process detection | Package manager or [virustotal/yara](https://github.com/VirusTotal/yara) |

**Skills:** `pentest-enum`, `blue-detect`

---

## Exploitation

Web exploitation, credential attacks, network exploitation, AD attacks.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **sqlmap** | Automated SQL injection detection and exploitation | `pip install sqlmap` or package manager |
| **commix** | OS command injection testing | `pip install commix` |
| **hydra** | Credential testing — HTTP, SSH, FTP, RDP, SMB, and more | Package manager |
| **hashcat** | GPU-accelerated password cracking | [hashcat.net](https://hashcat.net/hashcat/) |
| **john** | CPU password cracker — wide hash support | Package manager |
| **pwntools** | Binary exploitation framework — pwn challenges, ROP chains | `pip install pwntools` |
| **metasploit** | Exploit framework — CVE-based payloads, staged shells, post-exploitation | [metasploit.com](https://www.metasploit.com/download) |
| **bloodhound** | Active Directory attack path analysis | [BloodHoundAD/BloodHound](https://github.com/BloodHoundAD/BloodHound) |
| **crackmapexec** | SMB/WinRM/LDAP lateral movement and enumeration | `pip install crackmapexec` |
| **responder** | LLMNR/NBT-NS/mDNS poisoning — capture NTLMv2 hashes | [lgandx/Responder](https://github.com/lgandx/Responder) |
| **impacket** | Python network protocol implementations — Kerberoasting, Pass-the-Hash, DCSync | `pip install impacket` |

**Skills:** `pentest-exploit`, `red-exploit`, `red-lateral`, `red-persistence`, `ctf-exploit`, `ctf-crypto`

---

## Forensics / Incident Response

Memory analysis, disk forensics, evidence preservation.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **volatility** | Memory forensics — process trees, network, artifacts | `pip install volatility3` |
| **autopsy** | Disk image analysis — file recovery, timeline, hash sets | [sleuthkit.org](https://www.sleuthkit.org/autopsy/download.php) |
| **wireshark** | PCAP analysis — protocol decode, stream follow | [wireshark.org](https://www.wireshark.org/download.html) |
| **yara** | Malware detection — signature matching against files, processes | Package manager or build from source |

**Skills:** `blue-ir`, `blue-forensics`, `blue-report`, `ctf-forensics`

---

## Forensics

Evidence acquisition, memory analysis, disk forensics, network forensics, metadata extraction.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **volatility3** | Memory forensics — process trees, network connections, injected code, credentials from RAM | `pip install volatility3` |
| **autopsy** | Full disk image analysis — file recovery, timeline, hash sets | [sleuthkit.org](https://www.sleuthkit.org/autopsy/download.php) |
| **binwalk** | Firmware analysis, embedded file extraction, entropy analysis | `sudo apt install binwalk` / `brew install binwalk` |
| **foremost** | File carving — recovers deleted files from disk images by signature | `sudo apt install foremost` |
| **bulk_extractor** | Fast feature extraction from disk images — emails, URLs, credit cards, phone numbers | `sudo apt install bulk-extractor` |
| **exiftool** | Metadata extraction from images, documents, audio, video — OSINT and forensic analysis | `sudo apt install exiftool` |
| **tcpdump** | CLI packet capture and analysis. BPF filter support. | `sudo apt install tcpdump` |
| **tshark** | Wireshark CLI — PCAP analysis with field extraction, protocol dissection, stats | `sudo apt install tshark` |
| **wireshark** | GUI PCAP analysis | [wireshark.org](https://www.wireshark.org/download.html) |
| **yara** | Signature-based malware detection against files/processes | Package manager or [virustotal/yara](https://github.com/VirusTotal/yara) |

**Skills:** `forensic-memory`, `forensic-disk`, `forensic-network`, `forensic-report`, `blue-forensics`

---

## Reverse Engineering

Binary analysis, disassembly, decompilation, dynamic instrumentation.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **ghidra** | NSA reverse engineering framework — decompilation, disassembly, 40+ architectures | `brew install --cask ghidra` / `winget install NSA.Ghidra` |
| **radare2** | Open-source RE framework — disassembly, debugging, scripting, binary diffing | `brew install radare2` / build from source |
| **cutter** | Radare2 GUI — decompiler (Ghidra plugin), graph view, visual analysis | `brew install --cask cutter` |
| **gdb** | GNU debugger — dynamic analysis, breakpoints, memory inspection | Package manager |
| **pwndbg** | GDB plugin — heap analysis, ROP gadget search, CTF-focused | `git clone && ./setup.sh` |
| **ltrace** | Library call tracer — intercepts `strcmp`, `memcmp`, etc. at runtime | `sudo apt install ltrace` |
| **strace** | System call tracer — file access, I/O, process behavior | `sudo apt install strace` |
| **angr** | Symbolic execution framework — automated path exploration, CTF solvers | `pip install angr` |
| **pwntools** | Exploit development framework — ROP chains, shellcode, CTF | `pip install pwntools` |
| **binwalk** | Entropy analysis, embedded file detection in firmware/binaries | See Forensics |

**Skills:** `re-static`, `re-dynamic`, `ctf-exploit`

---

## Mobile

Android and iOS application security testing.

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| **apktool** | Android APK decompilation — resources, AndroidManifest.xml, Smali code | `sudo apt install apktool` / `brew install apktool` |
| **jadx** | DEX → Java decompiler — full Java source from APK/DEX, includes GUI (jadx-gui) | `brew install jadx` / [GitHub releases](https://github.com/skylot/jadx/releases) |
| **frida** | Dynamic instrumentation — hook functions at runtime, bypass SSL pinning, dump memory | `pip install frida-tools` |
| **objection** | Frida-powered mobile exploration — SSL bypass, jailbreak bypass, REPL for both Android/iOS | `pip install objection` |
| **mobsf** | Automated mobile security framework — static + dynamic analysis, REST API, reports | `git clone && ./setup.sh` |
| **adb** | Android Debug Bridge — device shell, APK install/pull, logcat, port forwarding | `sudo apt install adb` / `brew install android-platform-tools` |

**Skills:** `mobile-android`, `mobile-ios`, `mobile-dynamic`, `mobile-report`

---

## Utility

Supporting tools used across all phases.

| Tool | Purpose |
| :--- | :--- |
| **curl** | HTTP requests, API calls, raw payload delivery |
| **jq** | JSON processing — parse and filter tool output |
| **anew** | Append new unique lines — dedup discovered assets |
| **notify** | Alert on findings via Slack, Discord, Telegram, email |
| **grep** | Pattern matching across tool output |

---

## Adding Tools

New tools go in [`tools-catalog.json`](../../tools-catalog.json). Schema:

```json
{
  "tools_name": "my-tool",
  "command": {
    "base": "my-tool",
    "flags": [
      { "name": "-o", "type": "string", "description": "output file", "required": false }
    ],
    "positional": [
      { "name": "target", "type": "string", "description": "target to scan", "required": true }
    ]
  },
  "installation": {
    "linux":  { "method": "go", "command": "go install github.com/example/my-tool@latest" },
    "darwin": { "method": "go", "command": "go install github.com/example/my-tool@latest" },
    "win32":  { "method": "go", "command": "go install github.com/example/my-tool@latest" }
  },
  "check_installed": {
    "command": "my-tool --version",
    "parse_version": "v([\\d.]+)"
  },
  "skills_loader": "my-skill",
  "phase": ["recon"],
  "category": "recon",
  "tags": ["subdomain", "passive"],
  "homepage": "https://github.com/example/my-tool"
}
```

Then create the matching skill in `.agents/skills/my-skill/SKILL.md`.

---

## Further Reading

- [Engagement Modes](./modes.md) — which tools run in each mode
- [Engagement Workflow](./pentest-workflow.md) — tool execution lifecycle
