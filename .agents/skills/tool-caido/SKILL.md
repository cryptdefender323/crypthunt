---
name: tool-caido
description: "Caido web security proxy — intercepting proxy, replay, automate, workflow rules, filter, match/replace, HTTPQL querying, Caido Automate for fuzzing. Triggers: 'caido', 'caido proxy', 'caido intercept', 'caido replay', 'caido automate', 'caido workflow', 'caido fuzz', 'web proxy testing'."
---

# Caido Web Security Proxy

Modern intercepting proxy for web application testing.

---

## Phase 1: Setup & Interception

```bash
caido 2>/dev/null &

curl -sk "http://127.0.0.1:8080/ca" -o caido-ca.crt

curl -sk --proxy "http://127.0.0.1:8080" "https://TARGET/api/endpoint" \
  -H "Authorization: Bearer TOKEN" | jq .

export https_proxy=http://127.0.0.1:8080
export REQUESTS_CA_BUNDLE=/path/to/caido-ca.crt
```

---

## Phase 2: HTTPQL Filtering

```
path contains "/api/"

response.status is 401

request.raw contains "password"

method is "POST" and path contains "/login"

response.raw contains "\"token\""

request.header "Authorization" exists
```

---

## Phase 3: Replay & Modification

```bash
# 1. Right-click request in Caido → "Send to Replay"
# 2. Modify: change parameter value, method, headers
# 3. Compare responses side-by-side

```

---

## Phase 4: Caido Automate (Fuzzing)

```
# 1. Send request to Automate
# 2. Mark positions: <<FUZZ>>
# 3. Set payload: wordlist or range

POST /login HTTP/1.1
{"username": "<<USER>>", "password": "<<PASS>>"}

GET /api/user/<<ID>> HTTP/1.1

```

---

## Output

Save to `output/`:
- Export interesting requests via Caido → CSV or HTTPQL export
- `caido_findings.txt` — notable request/response pairs

## Next Phase

→ `vuln-idor` for IDOR exploitation using Automate findings
→ `vuln-auth-workflow` for auth bypass chains
