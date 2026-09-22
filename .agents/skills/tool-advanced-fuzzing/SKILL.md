---
name: tool-advanced-fuzzing
description: "Advanced web fuzzing techniques — ffuf, feroxbuster, custom wordlists, virtual host fuzzing, API endpoint fuzzing, parameter fuzzing, HTTP method fuzzing, header fuzzing. Triggers: 'fuzzing', 'ffuf', 'feroxbuster', 'directory fuzzing', 'api fuzzing', 'parameter fuzzing', 'vhost fuzzing', 'content discovery', 'wordlist fuzzing', 'fuzz endpoint'."
---

# Advanced Web Fuzzing

Comprehensive directory, parameter, and API endpoint discovery.

---

## Phase 1: Directory & File Fuzzing (ffuf)

```bash
TARGET="https://TARGET"

ffuf -u "$TARGET/FUZZ" -w /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt \
  -mc 200,201,301,302,401,403 -o output/ffuf_dirs.json -of json 2>/dev/null

ffuf -u "$TARGET/FUZZ" -w /usr/share/seclists/Discovery/Web-Content/raft-large-words.txt \
  -e ".php,.asp,.aspx,.jsp,.py,.rb,.config,.bak,.old,.zip,.tar.gz" \
  -mc 200,201,301,302,401,403 2>/dev/null | tee output/ffuf_ext.txt

ffuf -u "$TARGET/FUZZ" -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
  -recursion -recursion-depth 2 -mc 200,201,301,302,401,403 2>/dev/null | tee output/ffuf_recursive.txt
```

---

## Phase 2: Parameter & Value Fuzzing

```bash
TARGET="https://TARGET/page?id=FUZZ"

ffuf -u "$TARGET" -w /usr/share/seclists/Fuzzing/LFI/LFI-gracefulsecurity-linux.txt \
  -mc 200 -fs 1234 2>/dev/null | tee output/ffuf_lfi.txt

ffuf -u "https://TARGET/login" -w usernames.txt:USER -w passwords.txt:PASS \
  -X POST -d "username=USER&password=PASS" -H "Content-Type: application/x-www-form-urlencoded" \
  -fc 401 2>/dev/null | tee output/ffuf_creds.txt

ffuf -u "https://TARGET/api/user" -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -X POST -d '{"FUZZ":"test"}' -H "Content-Type: application/json" \
  -mc 200 -mr '"id"' 2>/dev/null

ffuf -u "https://TARGET/" -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -H "FUZZ: value" -mc 200 -fs 1234 2>/dev/null
```

---

## Phase 3: Virtual Host Fuzzing

```bash
TARGET_IP="TARGET_IP"
DOMAIN="target.com"

ffuf -u "http://$TARGET_IP/" -H "Host: FUZZ.$DOMAIN" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -mc 200,301,302 -fs 1234 2>/dev/null | tee output/ffuf_vhosts.txt

ffuf -u "https://$DOMAIN/api/FUZZ/users" -w <(seq 1 5 | sed 's/^/v/') \
  -mc 200 2>/dev/null
```

---

## Phase 4: Feroxbuster

```bash
TARGET="https://TARGET"

feroxbuster -u "$TARGET" -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt \
  -x php,asp,aspx,jsp -t 50 -o output/ferox_results.txt 2>/dev/null

feroxbuster -u "$TARGET" --silent \
  -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt \
  --filter-status 404,429 -t 30 2>/dev/null | tee output/ferox_dirs.txt

feroxbuster -u "$TARGET" -p "http://127.0.0.1:8080" 2>/dev/null
```

---

## Output

Save to `output/`:
- `ffuf_dirs.json` — directory discovery (machine-readable)
- `ffuf_vhosts.txt` — virtual host findings
- `ferox_results.txt` — feroxbuster recursive results

## Next Phase

→ `vuln-ssrf` on discovered internal endpoints
→ `vuln-path-traversal` on file parameters found
