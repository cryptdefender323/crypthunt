# Engagement Modes

Seven modes. Each tuned for a different engagement context.

---

## Switching Modes

```bash
/mode bug-bounty
/mode ctf
/mode red-team
/mode blue-team
/mode offensive
/mode grey-hat
/mode auto

fullscan https://target.example.com
```

Auto-detection maps target indicators (URL, IP, hostname, keywords) to the most appropriate mode. You can always override.

---

## Auto

**Use when:** You don't know the target type yet, or want the agent to decide.

The agent inspects the target and selects the best-fit mode from the others. Tool priority adapts after the initial recon phase based on what the target looks like.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Moderate |
| Tool priority | Adaptive |
| Skill chain | Detected at runtime |
| Parallelism | 4x |
| Stealth | Off |
| Report format | Standard |

---

## CTF

**Use when:** Competing in Capture The Flag challenges. Speed over stealth.

Exploitation runs first. The agent identifies the challenge category (web, binary, crypto, forensics, misc) and loads the matching skill chain immediately.

| Property | Value |
| :--- | :--- |
| Scope enforcement | None |
| Tool priority | Exploit → Enum → Recon |
| Skill chain | `ctf-recon` → `ctf-exploit` / `ctf-crypto` / `ctf-forensics` |
| Parallelism | 8x |
| Stealth | Off |
| DoS protection | Off |
| Report format | Flag submission |

**Skill chains by challenge type:**

| Type | Skills |
| :--- | :--- |
| Web | `ctf-recon` → `ctf-exploit` |
| Binary (pwn) | `ctf-recon` → `ctf-exploit` (pwntools) |
| Crypto | `ctf-crypto` |
| Forensics | `ctf-forensics` |
| Misc | `ctf-recon` → auto-detect |

---

## Bug Bounty

**Use when:** Running on public bug bounty programs (HackerOne, Bugcrowd, Intigriti, YesWeHack). Scope-strict. Report quality matters.

Recon-first. Every target is validated against program scope before active testing. DoS and out-of-scope techniques are blocked automatically.

| Property | Value |
| :--- | :--- |
| Scope enforcement | **Strict** — auto-stop on violation |
| Tool priority | Recon → Enum → Exploit |
| Skill chain | `pentest-recon` → `pentest-enum` → `pentest-exploit` → `pentest-report` |
| Parallelism | 4x |
| Stealth | Off |
| DoS protection | **On** |
| Exfiltration guard | **On** |
| Report format | HackerOne (CVSS + PoC + impact + remediation) |

Scope is parsed from the prompt or a scope file:

```
Scope: *.example.com
Out of scope: *.staging.example.com
Rules: No DoS, no automated account creation
```

---

## Red Team

**Use when:** Authorized red team operations. Stealth, persistence, and lateral movement are in scope.

Slow and quiet. Passive OSINT before any active scanning. Post-exploitation after initial access.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Moderate |
| Tool priority | Recon → Exploit → Enum |
| Skill chain | `red-recon` → `red-exploit` → `red-lateral` → `red-persistence` |
| Parallelism | **2x** (stealth-constrained) |
| Stealth | **On** |
| DoS protection | **On** |
| Exfiltration guard | **On** |
| Report format | Executive summary (attack path narrative) |

**Post-exploitation skills:**

| Skill | Purpose |
| :--- | :--- |
| `red-lateral` | SMB/WinRM pivoting, Kerberoasting, Pass-the-Hash via bloodhound + crackmapexec + impacket |
| `red-persistence` | Scheduled tasks, registry, WMI, SSH keys, cron |

---

## Blue Team

**Use when:** Defensive operations — detection, incident response, forensics, threat hunting.

Detection-first. No offensive techniques. Output is an IR report with IOCs and remediation steps.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Moderate |
| Tool priority | Enum → Recon → Report |
| Skill chain | `blue-detect` → `blue-ir` / `blue-forensics` → `blue-report` |
| Parallelism | 4x |
| Stealth | Off |
| DoS protection | On |
| Exploitation | **Disabled** |
| Report format | IR report (timeline, IOCs, evidence chain, remediation) |

**Blue Team skills:**

| Skill | Purpose |
| :--- | :--- |
| `blue-detect` | WAF detection, IDS/IPS identification, log analysis, malware detection (yara, wireshark, nuclei) |
| `blue-ir` | Incident triage, timeline reconstruction, containment, eradication |
| `blue-forensics` | Memory analysis (volatility), disk forensics (autopsy), PCAP analysis |
| `blue-report` | IOC documentation, evidence preservation, executive briefing |

---

## Offensive

**Use when:** Authorized internal red team or pentest with full exploitation scope. No stealth required, max coverage.

Exploit-first, maximum parallelism. All tools enabled.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Moderate |
| Tool priority | Exploit → Enum → Recon |
| Skill chain | `pentest-recon` → `pentest-enum` → `pentest-exploit` |
| Parallelism | **6x** |
| Stealth | Off |
| DoS protection | **Off** |
| Exfiltration guard | Off |
| Report format | Technical (full exploit chains, raw output) |

---

## Grey Hat

**Use when:** Research and educational contexts. Balanced offensive/defensive coverage.

Stealth enabled by default. Scope enforcement moderate. Both offensive skills and blue team detection run in parallel.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Moderate |
| Tool priority | Balanced (all phases equal priority) |
| Skill chain | `pentest-recon` → `pentest-enum` → `pentest-exploit` + `blue-detect` |
| Parallelism | 4x |
| Stealth | On |
| DoS protection | On |
| Report format | Technical |

---

## Forensic

**Use when:** Digital forensics and incident response — memory analysis, disk imaging, network capture analysis, evidence preservation.

No exploitation. Evidence integrity first. Every artifact is hashed before analysis. Chain of custody logged at every step.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Strict |
| Tool priority | Forensics → Report → Utility |
| Skill chain | `forensic-memory` → `forensic-disk` → `forensic-network` → `forensic-report` |
| Parallelism | 3x (sequential where evidence integrity requires it) |
| Stealth | Off |
| DoS protection | On |
| Exploitation | **Disabled** |
| Exfiltration guard | Off (analyst may need to pull artifacts) |
| Report format | Forensic (chain-of-custody, IOC list, timeline, remediation) |

**Forensic skills:**

| Skill | Tools | Purpose |
| :--- | :--- | :--- |
| `forensic-memory` | volatility3 | RAM analysis — processes, network connections, injected code, credential extraction |
| `forensic-disk` | autopsy, foremost, bulk_extractor, binwalk, exiftool | File carving, deleted file recovery, timeline, metadata |
| `forensic-network` | tshark, tcpdump | PCAP analysis, C2 detection, credential extraction, file extraction |
| `forensic-report` | — | Chain-of-custody IR report with IOC list and remediation roadmap |

---

## Reverse Engineering

**Use when:** Binary analysis, malware research, CTF RE challenges, vulnerability research, or any task requiring understanding of a binary's logic.

No scope enforcement. Run in isolated sandbox. Static first, dynamic second.

| Property | Value |
| :--- | :--- |
| Scope enforcement | None |
| Tool priority | Reverse-Engineering → Exploitation → Utility |
| Skill chain | `re-static` → `re-dynamic` |
| Parallelism | 4x |
| Stealth | Off |
| DoS protection | Off |
| Isolation | Run in VM/sandbox — mandatory |
| Report format | Technical RE report |

**RE skills:**

| Skill | Tools | Purpose |
| :--- | :--- | :--- |
| `re-static` | ghidra, radare2, cutter, strings, binwalk, objdump | Disassembly, decompilation, string extraction, packing detection |
| `re-dynamic` | gdb, pwndbg, strace, ltrace, angr | Runtime debugging, syscall tracing, ROP chain development, symbolic execution |

---

## Mobile Pentest

**Use when:** Android or iOS application security assessment. Static + dynamic analysis.

Scope-strict (stay within in-scope app and its APIs). Requires physical/virtual device for dynamic phases.

| Property | Value |
| :--- | :--- |
| Scope enforcement | Strict |
| Tool priority | Mobile → Enumeration → Exploitation → Report |
| Skill chain | `mobile-android` → `mobile-ios` → `mobile-dynamic` → `mobile-report` |
| Parallelism | 4x |
| Stealth | Off |
| DoS protection | On |
| Exfiltration guard | On |
| Report format | Mobile (OWASP Mobile Top 10 mapping, CVSS, PoCs) |

**Mobile skills:**

| Skill | Tools | Purpose |
| :--- | :--- | :--- |
| `mobile-android` | apktool, jadx, adb, frida, mobsf | APK decompilation, manifest analysis, hardcoded secrets, Frida hooks |
| `mobile-ios` | frida, objection, mobsf | IPA analysis, jailbreak bypass, keychain dump, SSL pinning bypass |
| `mobile-dynamic` | objection, frida, burpsuite, nuclei, ffuf | API testing, IDOR, JWT flaws, insecure storage |
| `mobile-report` | — | OWASP Mobile Top 10 report with PoCs |

---

## Safety Controls Summary

| Control | Auto | CTF | Bug Bounty | Red Team | Blue Team | Offensive | Grey Hat | Forensic | RE | Mobile |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Scope enforcement | Moderate | None | **Strict** | Moderate | Moderate | Moderate | Moderate | **Strict** | None | **Strict** |
| DoS protection | On | Off | **On** | **On** | On | Off | On | On | Off | On |
| Stealth mode | Off | Off | Off | **On** | Off | Off | On | Off | Off | Off |
| Exfiltration guard | On | Off | **On** | **On** | On | Off | On | Off | Off | On |
| Auto-stop on violation | No | No | **Yes** | No | No | No | No | No | No | No |
| Exploitation | On | On | On | On | **Off** | On | On | **Off** | On | On |

---

## Default Mode

Set a persistent default in `.opencode/oh-my-open-pentest.jsonc`:

```jsonc
{
  "default_mode": "bug-bounty"
}
```

---

## Further Reading

- [Engagement Workflow](./pentest-workflow.md) — the full lifecycle
- [Tool Reference](./tools.md) — tools by phase and mode
