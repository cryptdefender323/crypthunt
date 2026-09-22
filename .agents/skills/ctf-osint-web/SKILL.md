---
name: ctf-osint-web
description: "CTF OSINT web and DNS investigation. Google dorking, DNS TXT/zone transfer, WHOIS, Wayback Machine CDX API, certificate transparency, OSINT framework. Triggers: 'osint', 'ctf osint', 'google dork', 'dns osint', 'zone transfer', 'whois', 'wayback machine', 'web osint', 'open source intelligence', 'passive recon ctf'."
---

# CTF OSINT — Web & DNS

Google dorking → DNS enumeration → zone transfer → WHOIS → Wayback Machine → CT logs.

---

## Phase 1: Google Dorking

```bash
TARGET="target.com"

# "target.com" filetype:env OR filetype:cfg OR filetype:conf

# "$TARGET" password filename:.env

```

---

## Phase 2: DNS Enumeration

```bash
TARGET="target.com"

dig $TARGET ANY
dig $TARGET A
dig $TARGET MX
dig $TARGET NS
dig $TARGET TXT    # SPF, DKIM, verification codes, Google/AWS verification
dig $TARGET CNAME

dig $TARGET TXT | grep -v "^;"

# _dmarc.$TARGET, _domainkey.$TARGET (email verification)

dig @ns1.$TARGET AXFR $TARGET
dig @ns2.$TARGET AXFR $TARGET

for ns in $(dig $TARGET NS +short); do
  echo "=== Zone transfer from $ns ==="
  dig @$ns AXFR $TARGET
done

dig _dmarc.$TARGET TXT
dig mail.$TARGET MX
dig autodiscover.$TARGET CNAME
```

---

## Phase 3: WHOIS & Registrar Info

```bash
TARGET="target.com"

whois $TARGET
whois $TARGET | grep -iE "registrar|created|updated|expires|name server|email|phone|address"

whois $(dig $TARGET A +short | head -1)

curl -s "https://rdap.arin.net/registry/ip/$(dig $TARGET A +short | head -1)"

```

---

## Phase 4: Wayback Machine

```bash
TARGET="target.com"

curl -s "http://web.archive.org/cdx/search/cdx?url=*.$TARGET&output=json&fl=original&collapse=urlkey" | \
  python3 -c "import json,sys; [print(x[0]) for x in json.load(sys.stdin)]" | head -200

curl -s "http://web.archive.org/cdx/search/cdx?url=$TARGET/*&output=json&fl=original&collapse=urlkey" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data:
    url = item[0]
    if any(x in url for x in ['admin', 'backup', 'login', 'api', '.env', 'config', '.sql', '.zip']):
        print(url)
"

curl -s "https://web.archive.org/web/20230101000000*/$TARGET" | grep -o 'href="[^"]*"'

OLDEST_SNAP=$(curl -s "http://archive.org/wayback/available?url=$TARGET" | python3 -c "import json,sys; print(json.load(sys.stdin)['archived_snapshots']['closest']['url'])")
curl -s "$OLDEST_SNAP"
```

---

## Phase 5: Certificate Transparency

```bash
TARGET="target.com"

curl -s "https://crt.sh/?q=%.$TARGET&output=json" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
names = set()
for entry in data:
    for name in entry.get('name_value', '').split('\n'):
        names.add(name.strip().lstrip('*.'))
for name in sorted(names):
    print(name)
" | grep -v "^*" | sort -u

curl -s "https://crt.sh/?q=%.%.${TARGET}&output=json" | \
  python3 -c "import json,sys; [print(x.get('name_value','')) for x in json.load(sys.stdin)]" | \
  sort -u
```

---

## Phase 6: Email Enumeration

```bash
TARGET="target.com"

theHarvester -d $TARGET -b google -l 500
theHarvester -d $TARGET -b linkedin -l 500
theHarvester -d $TARGET -b bing -l 500

curl -s "https://api.hunter.io/v2/domain-search?domain=$TARGET&api_key=API_KEY" | jq .data.emails

# "@target.com" in:email type:user

```

---

## Phase 7: OSINT Tools & Frameworks

```bash
TARGET="target.com"

shodan domain $TARGET
shodan search "hostname:$TARGET"

curl -s "https://api.securitytrails.com/v1/domain/$TARGET" \
  -H "APIKEY: YOUR_KEY" | jq .subdomain_count

curl -s "https://viewdns.info/reverseip/?host=$TARGET&t=1" | grep -oE '[a-zA-Z0-9._-]+\.[a-z]{2,}' | sort -u
```

---

## Output

Save to `.omop/engagement/ctf/osint/`:
- `google-dorks.txt` — useful dork results
- `dns-records.txt` — all DNS records
- `subdomains.txt` — CT log + AXFR subdomains
- `wayback-urls.txt` — historical URLs
- `emails.txt` — discovered email addresses

## Next Phase

→ `recon-subdomain` for active subdomain enumeration
→ `recon-cloud-assets` for cloud asset discovery
