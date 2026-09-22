# Usage Guide

How to run engagements with oh-my-open-pentest.

---

## Quick Start

```bash
bunx oh-my-open-pentest install

fullscan
```

That's it. The agent selects a mode, parses scope if you provided it, and runs the engagement end-to-end.

---

## Starting an Engagement

### With a target

```bash
fullscan https://target.example.com
fullscan api.target.com
fullscan 192.168.1.0/24
```

Auto-detection picks the right mode from the target. Override at any time with `/mode`.

### With scope and rules

```
fullscan

Scope: *.example.com, app.example.com
Out of scope: admin.example.com, *.staging.example.com
Rules: No DoS, no automated account creation, report via HackerOne
```

Talos (Scope Guard) parses the scope and enforces it throughout the engagement.

### With a scope file

```
/scope program-scope.txt
fullscan
```

---

## Mode Selection

```bash
/mode auto            # auto-detect from target (default)
/mode bug-bounty      # HackerOne / Bugcrowd / Intigriti / YesWeHack
/mode ctf             # CTF challenges — speed-first, no scope enforcement
/mode red-team        # stealth operations, persistence, lateral movement
/mode blue-team       # detection, incident response, forensics
/mode offensive       # aggressive exploitation, max parallelism
/mode grey-hat        # balanced offensive/defensive
/mode forensic        # digital forensics, evidence preservation
/mode reverse-engineering  # binary analysis, RE challenges
/mode mobile-pentest  # Android / iOS app security assessment
```

Modes determine: tool priority, skill chain, parallelism, safety constraints, report format.

---

## Running Specific Phases

Run individual phases without launching the full engagement:

```bash
/pentest-recon        # subdomain discovery, port scanning, HTTP probing
/pentest-enum         # nuclei, ffuf, gobuster, whatweb, wafw00f
/pentest-exploit      # sqlmap, commix, hydra, metasploit
/pentest-report       # generate submission-ready report

/red-recon            # passive OSINT, stealth recon
/red-exploit          # network exploitation, AD attacks
/red-lateral          # lateral movement, bloodhound, crackmapexec
/red-persistence      # scheduled tasks, registry, WMI, SSH keys

/forensic-memory      # volatility3 memory analysis
/forensic-disk        # foremost, bulk_extractor, autopsy
/forensic-network     # tshark, tcpdump PCAP analysis
/forensic-report      # chain-of-custody IR report

/re-static            # ghidra, radare2, strings analysis
/re-dynamic           # gdb, pwndbg, strace, ltrace, angr

/mobile-android       # APK decompilation, jadx, frida
/mobile-ios           # IPA analysis, objection, frida
/mobile-dynamic       # API testing, traffic interception
/mobile-report        # OWASP Mobile Top 10 report

/ctf-recon            # challenge type detection, source analysis
/ctf-exploit          # binary exploitation, web exploitation
/ctf-crypto           # hash identification, cracking
/ctf-forensics        # disk/memory/pcap CTF challenges

/blue-detect          # WAF, IDS/IPS detection, log analysis
/blue-ir              # incident triage, containment
/blue-forensics       # memory and disk forensics
/blue-report          # IR report generation
```

---

## Common Workflows

### Bug bounty program

```
# 1. Set mode
/mode bug-bounty

# 2. Paste scope from program page
Scope: *.hackerone.com, api.hackerone.com
Out of scope: *.staging.hackerone.com, sandbox.hackerone.com
Rules: No DoS, no spam, max 10 req/sec, no PII access

# 3. Launch
fullscan
```

### CTF challenge

```
/mode ctf
fullscan https://challenges.example.com/web/100
```

For specific challenge types:

```
/ctf-crypto          # crypto challenge
/ctf-forensics       # forensics challenge — provide file path
/re-static           # reverse engineering challenge — provide binary path
/ctf-exploit         # pwn challenge — provide binary + service host:port
```

### Android app pentest

```
/mode mobile-pentest

/mobile-android

# 1. Decompile with apktool + jadx
# 2. Analyze AndroidManifest.xml
# 3. Search for hardcoded secrets, insecure APIs
# 4. Run MobSF automated scan
# 5. Set up frida for dynamic analysis
```

### Memory forensics

```
/mode forensic

/forensic-memory /path/to/memory.dmp

# 1. Hash the image (chain of custody)
# 2. Identify OS and architecture
# 3. List processes (including hidden)
# 4. Extract network connections
# 5. Find injected code (malfind)
# 6. Extract cached credentials
```

### Binary reverse engineering

```
/mode reverse-engineering

/re-static /path/to/crackme

/re-dynamic /path/to/binary

# 1. File type and architecture identification
# 2. String extraction and filtering
# 3. Imports/exports analysis
# 4. Disassembly with radare2
# 5. Decompilation with ghidra
# 6. packing/encryption detection
```

### Red team engagement

```
/mode red-team

Scope: corp.example.com (internal network 10.0.0.0/8)
Authorization: signed engagement letter ref: EL-2026-001
Objective: Domain Admin compromise

fullscan
```

---

## Engagement State

State persists across sessions. Interrupted engagements resume automatically:

```bash
fullscan

# ... interrupt session ...

fullscan

```

State file: `.omop/engagement/state.json`
Scope log: `.omop/engagement/scope.log`
Reports: `.omop/engagement/report/`

---

## Team Mode

Run multiple agents in parallel for large engagements:

```jsonc
// .opencode/oh-my-open-pentest.jsonc
{
  "team_mode": {
    "enabled": true,
    "max_parallel_members": 4,
    "tmux_visualization": true
  }
}
```

Built-in team skills:

```bash
/hyperplan       # 5 adversarial critics review engagement plan before launch
/security-research  # 3 hunters + 2 PoC engineers run in parallel
```

---

## Output

All engagement artifacts land in `.omop/engagement/`:

```
.omop/engagement/
├── state.json              # Engagement state (resume checkpoint)
├── scope.log               # Scope enforcement decisions
├── recon/
│   ├── subdomains.txt
│   ├── httpx-results.json
│   └── open-ports.txt
├── enum/
│   ├── nuclei-results.json
│   └── directory-enum.txt
├── exploit/
│   └── findings.json
├── forensics/              # Forensic mode artifacts
│   ├── memory/
│   ├── disk/
│   └── network/
├── re/                     # RE mode artifacts
│   ├── static/
│   └── dynamic/
├── mobile/                 # Mobile mode artifacts
│   ├── android/
│   └── ios/
└── report/
    └── report.md           # Final submission-ready report
```

---

## Health Check

Verify installation and tool availability:

```bash
bunx oh-my-open-pentest doctor
```

Doctor checks:
- OpenCode version compatibility
- Plugin registration
- Provider authentication
- Model availability
- Tool availability (security tools)
- Configuration validation

---

## Non-Interactive Sessions

For automation and CI/CD:

```bash
bunx oh-my-open-pentest run "fullscan https://target.example.com"

bunx oh-my-open-pentest run "/mode bug-bounty && fullscan https://target.example.com"

bunx oh-my-open-pentest doctor --json
```

---

## Configuration

Project-level config: `.opencode/oh-my-open-pentest.jsonc`

```jsonc
{
  // Default engagement mode
  "default_mode": "bug-bounty",

  // Team Mode
  "team_mode": {
    "enabled": false,
    "max_parallel_members": 4,
    "tmux_visualization": false
  },

  // Pentest loop
  "pentest_loop": {
    "enabled": true,
    "default_max_iterations": 100,
    "default_strategy": "continue"
  },

  // Agent model overrides (optional)
  "agents": {
    "cerberus": { "model": "claude-opus-4-8" },
    "hydra":    { "model": "claude-haiku-4-5-20251001" },
    "scylla":   { "model": "claude-sonnet-4-6" }
  }
}
```

User-level config: `~/.config/opencode/oh-my-open-pentest.jsonc`

---

## Uninstallation

```bash
jq '.plugin = [.plugin[] | select(. != "oh-my-open-pentest")]' \
    ~/.config/opencode/opencode.json > /tmp/oc.json && \
    mv /tmp/oc.json ~/.config/opencode/opencode.json

rm -f ~/.config/opencode/oh-my-open-pentest.jsonc \
      .opencode/oh-my-open-pentest.jsonc
```

---

## Further Reading

- [Engagement Modes](./modes.md) — 10 modes in detail
- [Engagement Workflow](./pentest-workflow.md) — full lifecycle
- [Tool Reference](./tools.md) — 60+ tools by phase
- [Team Mode](./team-mode.md) — parallel agent coordination
