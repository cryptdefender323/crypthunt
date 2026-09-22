---
name: tool-nuclei
description: "Nuclei template-based vulnerability scanner — community templates, custom templates, CVE scanning, severity filtering, bulk scanning, rate limiting, report output. Triggers: 'nuclei', 'nuclei scan', 'nuclei template', 'nuclei cve', 'template scanner', 'nuclei severity', 'bulk vulnerability scan', 'nuclei report'."
---

# Nuclei Vulnerability Scanner

Template-based scanning for known vulnerabilities, misconfigs, and exposures.

---

## Phase 1: Setup & Basic Scan

```bash
TARGET="https://TARGET"

nuclei -update-templates 2>/dev/null

nuclei -u "$TARGET" -o output/nuclei_all.txt 2>/dev/null

nuclei -u "$TARGET" -severity critical,high -o output/nuclei_critical.txt 2>/dev/null

nuclei -u "$TARGET" -severity high,critical -silent -o output/nuclei_high.txt 2>/dev/null
```

---

## Phase 2: Targeted Scans

```bash
TARGET="https://TARGET"

nuclei -u "$TARGET" -tags cve -o output/nuclei_cve.txt 2>/dev/null

nuclei -u "$TARGET" -tags exposure -o output/nuclei_exposure.txt 2>/dev/null

nuclei -u "$TARGET" -tags tech -o output/nuclei_tech.txt 2>/dev/null

nuclei -u "$TARGET" -tags misconfig -o output/nuclei_misconfig.txt 2>/dev/null

nuclei -u "$TARGET" -tags "log4j,spring4shell,citrix,exchange" -o output/nuclei_specific.txt 2>/dev/null

nuclei -u "$TARGET" -tags fuzz -o output/nuclei_fuzz.txt 2>/dev/null
```

---

## Phase 3: Bulk / Multi-Target

```bash
nuclei -l targets.txt -severity high,critical -o output/nuclei_bulk.txt -c 25 2>/dev/null

nuclei -l targets.txt -rl 50 -timeout 10 -o output/nuclei_bulk.txt 2>/dev/null

subfinder -d target.com -silent | httpx -silent | nuclei -tags cve,misconfig 2>/dev/null

nuclei -u "$TARGET" -H "Authorization: Bearer TOKEN" -tags authenticated 2>/dev/null
```

---

## Phase 4: Custom Templates

```bash
cat > /tmp/custom_template.yaml << 'EOF'
id: custom-exposed-endpoint
info:
  name: Custom Exposed Endpoint
  severity: high
  tags: custom,exposure
requests:
  - method: GET
    path:
      - "{{BaseURL}}/admin"
      - "{{BaseURL}}/internal"
    matchers:
      - type: status
        status:
          - 200
      - type: word
        words:
          - "admin panel"
          - "internal use"
        condition: or
EOF

nuclei -u "$TARGET" -t /tmp/custom_template.yaml 2>/dev/null
```

---

## Output

Save to `output/`:
- `nuclei_critical.txt` — critical/high findings
- `nuclei_cve.txt` — CVE matches
- `nuclei_misconfig.txt` — misconfiguration findings

## Next Phase

→ `pentest-exploit` to exploit detected vulnerabilities
→ `pentest-report` to format Nuclei findings
