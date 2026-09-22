---
name: tool-wapiti
description: "Wapiti web vulnerability scanner — SQL injection, XSS, SSRF, file disclosure, command injection, CRLF, open redirect scanning with HTML report. Triggers: 'wapiti', 'web application scanner', 'wapiti scan', 'wapiti report', 'automated web scan', 'wapiti sqli', 'wapiti xss'."
---

# Wapiti Web Vulnerability Scanner

Black-box web application vulnerability scanner.

---

## Phase 1: Basic Scan

```bash
TARGET="https://TARGET"

wapiti -u "$TARGET" -o output/wapiti_report --format html 2>/dev/null

wapiti -u "$TARGET" -o output/wapiti_quick --format html \
  --depth 2 --max-parameters 50 2>/dev/null

wapiti -u "$TARGET" -v 2 --format txt -o output/wapiti_verbose.txt 2>/dev/null
```

---

## Phase 2: Targeted Module Scans

```bash
TARGET="https://TARGET"

wapiti -u "$TARGET" -m sql --format html -o output/wapiti_sql 2>/dev/null

wapiti -u "$TARGET" -m xss --format html -o output/wapiti_xss 2>/dev/null

wapiti -u "$TARGET" -m ssrf --format html -o output/wapiti_ssrf 2>/dev/null

wapiti -u "$TARGET" -m file --format html -o output/wapiti_lfi 2>/dev/null

wapiti -u "$TARGET" -m exec --format html -o output/wapiti_exec 2>/dev/null

wapiti -u "$TARGET" -m "sql,xss,ssrf,file,exec,crlf,redirect" \
  --format html -o output/wapiti_all 2>/dev/null
```

---

## Phase 3: Authentication & Custom Headers

```bash
TARGET="https://TARGET"

wapiti -u "$TARGET" --cookie "session=TOKEN" -o output/wapiti_auth --format html 2>/dev/null

wapiti -u "$TARGET" --auth-user admin --auth-password pass \
  -o output/wapiti_httpauth --format html 2>/dev/null

wapiti -u "$TARGET" --header "Authorization: Bearer TOKEN" \
  -o output/wapiti_api --format html 2>/dev/null

wapiti -u "$TARGET" --proxy http://127.0.0.1:8080 \
  -o output/wapiti_burp --format html 2>/dev/null

wapiti -u "$TARGET" --scope folder -o output/wapiti_scoped --format html 2>/dev/null
```

---

## Output

Save to `output/`:
- `wapiti_report/` — HTML report directory
- `wapiti_all/` — full scan report

## Next Phase

→ Manual verification of Wapiti findings
→ `pentest-report` to include scanner results
