---
name: ctf-forensics-linux
description: "CTF Linux and application forensics. Log analysis, Docker image layer inspection, browser credential decryption (Chrome/Firefox), KeePass cracking, git reflog orphan recovery, USB audio extraction, TLS decryption via weak RSA, TFTP netascii decode. Triggers: 'linux forensics', 'log analysis', 'browser forensics', 'chrome decrypt', 'firefox forensics', 'git forensics', 'docker forensics', 'keepass crack', 'tls forensics'."
---

# CTF Forensics — Linux & Application

Log analysis, Docker layers, browser artifacts, KeePass, git recovery.

---

## Phase 1: Log Analysis

```bash
LOG="server.log"

grep -iE "(flag|part|piece|fragment|ctf)" "$LOG"

grep "FLAGPART" "$LOG" | sed 's/.*FLAGPART: //' | uniq | tr -d '\n'

sort "$LOG" | uniq -c | sort -rn | head -20

grep -A2 "session opened" /var/log/auth.log
cat /home/*/.bash_history

find /usr/bin -newer /var/log/auth.log -name "ms*"

tshark -r capture.pcap -Y "tftp" -T fields -e tftp.source_file
```

---

## Phase 2: Docker Layer Forensics

```bash
IMAGE_TAR="app.tar"

tar xf "$IMAGE_TAR"
cat manifest.json | python3 -m json.tool | grep Config

CONFIG_HASH="sha256:abc123"
python3 -m json.tool "blobs/$CONFIG_HASH" | grep -A2 "created_by"

cat "blobs/$CONFIG_HASH" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for item in data.get('history', []):
    cmd = item.get('created_by', '')
    if any(k in cmd.lower() for k in ['flag', 'secret', 'password', 'key', 'token']):
        print(cmd)
"

for layer in */layer.tar; do
  echo "=== $layer ==="
  tar tf "$layer" | grep -iE "flag|secret|key|password|\.env|shadow|passwd" 2>/dev/null
done

tar xf layer_hash/layer.tar ./etc/passwd -O
```

---

## Phase 3: Browser Credential Decryption

```python
# Chrome/Edge Login Data (AES-GCM with DPAPI master key):
from Crypto.Cipher import AES
import sqlite3, json, base64

# Load master key (provided separately in CTF, or from Local State DPAPI):
with open('master_key.txt', 'rb') as f:
    master_key = f.read()

conn = sqlite3.connect('Login Data')
cursor = conn.cursor()
cursor.execute('SELECT origin_url, username_value, password_value FROM logins')

for url, user, encrypted_pw in cursor.fetchall():
    # v10/v11 format: 3-byte prefix + 12-byte nonce + ciphertext + 16-byte tag
    nonce = encrypted_pw[3:15]
    ciphertext = encrypted_pw[15:-16]
    tag = encrypted_pw[-16:]
    cipher = AES.new(master_key, AES.MODE_GCM, nonce=nonce)
    try:
        password = cipher.decrypt_and_verify(ciphertext, tag)
        print(f"{url}: {user}:{password.decode()}")
    except:
        pass
```

```bash
pip install firefox-decrypt --break-system-packages
python3 -m firefox_decrypt ~/.mozilla/firefox/*.default-release/

sqlite3 places.sqlite "SELECT url, datetime(last_visit_date/1000000,'unixepoch') FROM moz_places ORDER BY last_visit_date DESC LIMIT 50;"

sqlite3 "History" "SELECT url, title, datetime(last_visit_time/1000000-11644473600,'unixepoch') FROM urls ORDER BY last_visit_time DESC LIMIT 50;"

strings "Login Data" | grep -iE "flag|ctf|password"
strings places.sqlite | grep -iE "flag|ctf"
```

---

## Phase 4: Git Forensics

```bash
git clone https://github.com/internetwache/GitTools /opt/gittools
bash /opt/gittools/Dumper/gitdumper.sh "https://target/.git/" /tmp/repo
cd /tmp/repo && git checkout .

git reflog --all
git fsck --unreachable --no-reflogs

git show <commit-hash>

git show <commit-hash>:path/to/secret.txt

python3 << 'EOF'
import subprocess, zlib

def repair_blob(filepath, target_hash):
    with open(filepath, 'rb') as f:
        data = bytearray(f.read())
    
    for pos in range(len(data)):
        original = data[pos]
        for val in range(256):
            if val == original:
                continue
            data[pos] = val
            with open(filepath, 'wb') as f:
                f.write(data)
            result = subprocess.run(['git', 'hash-object', filepath],
                                   capture_output=True, text=True)
            if result.stdout.strip() == target_hash:
                print(f"Fixed byte {pos}: {original:#04x} → {val:#04x}")
                return True
            data[pos] = original
    
    with open(filepath, 'wb') as f:
        f.write(data)
    return False
EOF
```

---

## Phase 5: KeePass Database Cracking

```bash
KDBX="database.kdbx"

keepass2john "$KDBX" > hash.txt
hashcat -m 13400 hash.txt /usr/share/wordlists/rockyou.txt

git clone https://github.com/ivanmrsulja/keepass2john /opt/keepass2john
cd /opt/keepass2john && make
./keepass2john "$KDBX" > hash.txt
hashcat -m 13400 hash.txt wordlist.txt

cewl "http://related-site.com" -d 2 -m 5 -w cewl_words.txt
echo -e "admin\npassword\nletmein" >> cewl_words.txt
john hash.txt --wordlist=cewl_words.txt

```

---

## Phase 6: TFTP Netascii Decode

```python
# TFTP netascii mode corrupts binary transfers:
# 0x0D 0x0A → 0x0A (CRLF → LF)
# 0x0D 0x00 → 0x0D (escaped CR)

with open('file_raw', 'rb') as f:
    data = f.read()
data = data.replace(b'\r\n', b'\n').replace(b'\r\x00', b'\r')
with open('file_fixed', 'wb') as f:
    f.write(data)
```

---

## Phase 7: TLS via Weak RSA Private Key

```bash

# 1. Extract server cert from Wireshark (Server Hello → Export Packet Bytes → public.der)
openssl x509 -in public.der -inform DER -noout -modulus

# 2. Factor weak modulus (if small):

yafu "factor(N)"

# 3. Generate private key:
rsatool -p P -q Q -o private.pem

# 4. Wireshark: Edit → Preferences → Protocols → TLS → RSA keys list → Add

# 5. Follow decrypted TLS stream → find flag in HTTP traffic
```

---

## Phase 8: USB Audio from PCAP

```bash
tshark -r capture.pcap -T fields -e usb.iso.data > audio_data.txt

python3 -c "
with open('audio_data.txt') as f:
    data = bytes.fromhex(f.read().replace('\n','').replace(':',''))
open('audio.raw', 'wb').write(data)
"

```

---

## Output

Save to `.omop/engagement/ctf/forensics/linux/`:
- `credentials.txt` — decrypted browser/KeePass credentials
- `recovered-files/` — docker/git recovered secrets
- `flag.txt` — found flag

## Next Phase

→ `ctf-forensics-disk` for memory/disk image analysis
→ `ctf-forensics-network` for PCAP analysis
