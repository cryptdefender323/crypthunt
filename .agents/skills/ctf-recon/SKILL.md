---
name: ctf-recon
description: "CTF engagement orchestrator. Full cognitive loop for all CTF categories: OBSERVE→CLASSIFY→HYPOTHESIZE→INVESTIGATE→VALIDATE→PIVOT→FLAG. Category-specific decision trees for pwn, web, crypto, reversing, forensics, misc, OSINT, hardware. Hypothesis-driven — no blind tool runs. Triggers: 'ctf', 'ctf recon', 'challenge', 'htb', 'thm', 'picoctf', '/mode ctf'."
version: 2.0.0
phase: ["recon", "analysis"]
category: ["ctf"]
tools: ["file", "strings", "binwalk", "exiftool", "curl", "python3", "pwntools", "ghidra", "hashcat"]
tags: ["ctf", "recon", "classification", "hypothesis", "cognitive-loop"]
---

# CTF Recon — Cognitive Engagement Orchestrator

CTF is not "run tools until flag." It is **reason until flag**.

The loop:
```
OBSERVE → CLASSIFY → HYPOTHESIZE → INVESTIGATE → VALIDATE → PIVOT → FLAG
```

Every iteration produces either a flag, a refined hypothesis, or a ruled-out category. Never idle. Never repeat the same test twice without new evidence.

---

## Stage 0: Initialize

```bash
CHALLENGE="<challenge-name>"
CTF_DIR=".omop/ctf/${CHALLENGE}"
mkdir -p "${CTF_DIR}/{recon,artifacts,hypothesis,solutions,evidence}"
```

State file — update after every stage:
```json
{
  "challenge": "<name>",
  "category": "unknown",
  "flag_format": "unknown",
  "hypotheses": [],
  "ruled_out": [],
  "artifacts": [],
  "current_focus": null,
  "flag": null
}
```

---

## Stage 1: OBSERVE — Raw Intelligence Gathering

Before any category assumption, collect raw facts.

**If file artifact provided:**
```bash
file <artifact>
xxd <artifact> | head -40
strings <artifact> | head -80
strings -e l <artifact> | head -20
wc -c <artifact>

# Entropy — high entropy (>7.5) = encrypted/compressed/packed
python3 -c "
import math, collections, sys
data = open(sys.argv[1], 'rb').read()
c = collections.Counter(data)
e = -sum((v/len(data))*math.log2(v/len(data)) for v in c.values())
print(f'Entropy: {e:.4f}/8.0 — {\"high: likely encrypted/packed\" if e > 7.5 else \"normal\"}')
" <artifact>

binwalk <artifact> 2>/dev/null | head -30
exiftool <artifact> 2>/dev/null | head -30
```

**If network/web service:**
```bash
curl -sk -D - "<url>" | head -80
curl -sk "<url>/robots.txt"
curl -sk "<url>/.git/HEAD"
curl -sk "<url>/source"
# Record: server header, cookies, redirects, response size, unusual headers
```

**If description only:**
- Read every word — note unusual capitalization, numbers, repeated words, encoding hints
- Check challenge title for hidden clues (common in misc/crypto)
- Note point value — 500+ points = harder, non-standard technique likely

**Record all observations in:** `${CTF_DIR}/recon/observations.md`

---

## Stage 2: CLASSIFY — Category Decision Tree

Run through this tree completely before assuming a category. Multiple categories can apply.

```
Has ELF/PE/Mach-O binary?
  ├─ checksec shows NX+canary+PIE disabled → PWN: classic overflow likely
  ├─ checksec shows full mitigations → PWN: heap/rop/advanced or REVERSING
  └─ no obvious vuln surface → REVERSING: crackme/obfuscation/license

Has web URL or socket service?
  ├─ HTTP(S) → WEB: start with source, cookies, params, headers
  └─ raw TCP (nc) → PWN or CRYPTO protocol

Has cipher text / encoded data / numbers?
  ├─ looks like base64/hex/rot → ENCODING (misc)
  ├─ structured math output → CRYPTO: identify algorithm first
  └─ custom cipher hint → CRYPTO: classical or modern

Has pcap / memory dump / disk image?
  ├─ .pcap/.pcapng → FORENSICS: network
  ├─ .mem/.dmp/.vmem → FORENSICS: memory
  ├─ .img/.dd/.iso → FORENSICS: disk
  └─ image/audio with hidden data → STEGO

Has image (PNG/JPG/BMP)?
  ├─ challenge says "find the message" → STEGO
  ├─ visual anomaly or metadata hint → STEGO
  └─ no hint → check LSB before assuming STEGO

Has OSINT clues (username/location/company)?
  └─ OSINT: social media, geolocation, WHOIS, public records

Has source code?
  └─ CODE AUDIT: logic bugs, crypto misuse, injection, race conditions

Ambiguous?
  └─ Register as UNKNOWN, generate hypotheses for top 2 likely categories
```

Record category decision and confidence in state.

---

## Stage 3: FLAG FORMAT DETECTION

Identify the flag format before investigating — confirms when you've found it.

```bash
# Common formats
grep -rE "(FLAG|CTF|flag|ctf|picoCTF|DUCTF|HTB|THM)\{[^}]+\}" \
  "${CTF_DIR}/recon/" 2>/dev/null

# Generic braces
grep -rE "[A-Za-z0-9_]+\{[A-Za-z0-9_!@#$%^&*\-]+\}" \
  "${CTF_DIR}/recon/" 2>/dev/null

# From challenge description or previous solves (if CTFtime lookup allowed)
```

If format unknown: record `flag_format: "unknown — look for structured string in output"`.

---

## Stage 4: HYPOTHESIZE — Specific, Falsifiable Claims

**Rules:**
- Every hypothesis must reference specific observed evidence
- Every hypothesis must have a concrete test that would confirm or deny it
- Generic hypotheses ("might be XSS") are not hypotheses — name the parameter, endpoint, mechanism
- Generate hypotheses for the TWO most likely categories in parallel

**Hypothesis format:**
```
H-001:
  claim:        [specific mechanism] exists at [specific location] because [specific evidence]
  evidence:     [what was observed that led here]
  test:         [exact action that would confirm this]
  disproof:     [exact action that would rule this out]
  category:     [pwn|web|crypto|re|forensics|stego|misc|osint]
  priority:     high|medium|low
  status:       open
```

**Category-specific hypothesis starters:**

| Category | Common First Hypotheses |
|----------|------------------------|
| PWN | Stack overflow at input function / heap UAF / format string at printf |
| WEB | SQLi at login / SSTI in template / IDOR via user ID param |
| CRYPTO | RSA with small e / ECB mode (identical blocks) / reused nonce |
| RE | Serial check at 0x[addr] / anti-debug via ptrace / packed with UPX |
| FORENSICS | Hidden file in pcap stream / process injection in memory dump |
| STEGO | LSB in red channel / data after EOF / audio spectrogram |
| MISC | Polyglot file / encoding chain / pyjail escape |
| OSINT | Username on social platform / EXIF location data |

---

## Stage 5: INVESTIGATE — Minimum Viable Test

**Before every tool run, answer:**
```
QUESTION:    What specific question does this answer?
HYPOTHESIS:  Which hypothesis does this test?
EXPECTED:    What output confirms H / denies H?
EFFORT:      Is this the minimum test for this hypothesis?
```

If you cannot answer all four — redesign the test.

**Category investigation paths:**

### PWN path
```bash
# 1. Binary protections
checksec --file=<binary>
python3 -c "from pwn import *; e=ELF('<binary>'); print(e.checksec())"

# 2. Functions of interest
python3 -c "from pwn import *; e=ELF('<binary>'); [print(f'{hex(v)} {k}') for k,v in e.symbols.items()]"
nm -D <binary> 2>/dev/null | grep -E "FUNC|OBJECT"

# 3. Dangerous functions
objdump -d <binary> | grep -E "gets|scanf|strcpy|sprintf|system|printf" | head -20

# 4. Entry point behavior
ltrace ./<binary> <<< "AAAA" 2>&1 | head -20
strace ./<binary> <<< "AAAA" 2>&1 | head -20

# 5. Static strings hint
strings <binary> | grep -iE "flag|correct|wrong|password|key|win|lose|secret"
```

→ Load `ctf-pwn-basics` or appropriate deep skill based on findings.

### WEB path
```bash
# 1. Technology fingerprint
curl -sk -I "<url>" | grep -iE "server|x-powered|set-cookie|location"

# 2. Source code hints
curl -sk "<url>" | grep -iE "comment|todo|debug|admin|api|token|key|secret"

# 3. Common files
for path in /robots.txt /.git/HEAD /sitemap.xml /api /swagger /graphql \
  /admin /debug /source /backup /config /.env; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" "${url}${path}")
  [[ "$code" != "404" ]] && echo "$code ${url}${path}"
done

# 4. Parameters
curl -sk "<url>" | grep -oE 'name="[^"]+"' | sort -u
curl -sk "<url>" | grep -oE "action=\"[^\"]+\""
```

→ Load `ctf-web-server-side` or appropriate deep skill.

### CRYPTO path
```python
# 1. Identify algorithm from ciphertext properties
data = open("cipher.txt").read().strip()
print(f"Length: {len(data)}")
print(f"Charset: {'hex' if all(c in '0123456789abcdefABCDEF' for c in data) else 'base64' if '=' in data else 'unknown'}")

# Check for RSA hint: n, e, c in output
# Check for block size: multiple of 16 = AES/DES, multiple of 8 = DES
# Check for repeated blocks = ECB mode vulnerability

# 2. For RSA: factor small n
python3 -c "
from math import isqrt
n = <n_value>
for p in range(2, isqrt(n)+1):
    if n % p == 0:
        print(f'p={p}, q={n//p}')
        break
"
```

→ Load `ctf-crypto-rsa`, `ctf-crypto-ecc`, `ctf-crypto-modern`, etc. based on identified algorithm.

### REVERSING path
```bash
# 1. Packer detection
file <binary>
strings <binary> | grep -iE "upx|packed|compress"
# High entropy sections = packed

# 2. Anti-debug check
strings <binary> | grep -iE "ptrace|isdebuggerpresent|checkremote|getenv"

# 3. Static analysis entry
objdump -d <binary> | grep -A 20 "<main>"
python3 -c "from pwn import *; e=ELF('<binary>'); print(disasm(e.read(e.sym['main'],100), arch=e.arch))"

# 4. Dynamic check
gdb -batch -ex "b main" -ex "run" -ex "disas" ./<binary> 2>/dev/null | head -40
```

→ Load `ctf-reverse-tools` or `ctf-reverse-dynamic`.

### FORENSICS path
```bash
# Network (pcap)
tshark -r <file.pcap> -q -z io,phs 2>/dev/null      # protocol hierarchy
tshark -r <file.pcap> -q -z conv,tcp 2>/dev/null    # TCP conversations
tshark -r <file.pcap> -Y "http" -T fields \
  -e http.request.uri -e http.file_data 2>/dev/null | head -30

# Memory dump
python3 -c "import volatility3; print('available')" 2>/dev/null \
  && vol -f <dump> windows.info 2>/dev/null \
  || strings <dump> | grep -iE "flag|CTF|password" | head -20

# Disk image
file <image>
mmls <image> 2>/dev/null || fdisk -l <image> 2>/dev/null
```

→ Load appropriate `ctf-forensics-*` skill.

### STEGO path
```bash
# Image
exiftool <image>
strings <image> | grep -iE "flag|CTF|hidden|secret" | head -10
binwalk <image>                                      # embedded files
steghide extract -sf <image> -p "" 2>/dev/null      # empty passphrase
python3 -c "
from PIL import Image
img = Image.open('<image>')
pixels = list(img.getdata())
# LSB check: extract LSB from each channel
lsb = ''.join([str(p[0]&1) for p in pixels[:64]])
print('LSB sample:', lsb)
print('As bytes:', bytes([int(lsb[i:i+8],2) for i in range(0,64,8)]))
"
```

→ Load `ctf-forensics-stego` for deep analysis.

---

## Stage 6: VALIDATE — Did We Find It?

After each investigation step:

```
RESULT:      What was the actual output?
ADVANCES:    Which hypothesis does this advance? (L1→L2→L3)
RULES OUT:   Which hypotheses are now eliminated?
FLAG CHECK:  Does output contain flag format pattern?
NEXT:        What is the highest-value next test?
```

**Flag validation:**
```bash
# Try to submit mentally first — does it match the flag format?
# Pattern must match: <PREFIX>{<content>}
# Content must look meaningful (not garbage from random bytes)
# If submitting to live platform: verify format before submitting wrong flags

echo "<candidate_flag>" | grep -E "^[A-Za-z0-9_]+\{[^}]+\}$"
```

If validation fails: do not retry same test. Update hypothesis, pick next.

---

## Stage 7: PIVOT — When Stuck

If no hypothesis advances after 3 attempts in a category:

```
STUCK PROTOCOL:
  1. Write what you know (confirmed facts only)
  2. Write what you assumed (mark each as assumption, not fact)
  3. Challenge the category assumption — could this be a different category?
  4. Read challenge description again word by word
  5. Check if artifact could be a polyglot (valid in multiple formats)
  6. Try: binwalk -e <artifact> (extract embedded content)
  7. Try: foremost <artifact> (file carving)
  8. Escalate to category-specific deep skill

PIVOT TRIGGERS:
  3 failed tests in same category    → reconsider category
  All visible parameters tested      → look for hidden attack surface
  Binary analyzed but no vuln found  → check for custom protocol / network component
  Crypto identified but key unknown  → look for key in other challenge files
  Stego found but passphrase needed  → look for passphrase hint in challenge text
```

---

## Stage 8: ESCALATE — Load Deep Skill

After classification and initial investigation, load the specific deep skill:

| Confirmed Category | Load Skill |
|-------------------|------------|
| Stack/heap/rop pwn | `ctf-pwn-basics` → `ctf-pwn-heap` → `ctf-pwn-rop` |
| Kernel pwn | `ctf-pwn-kernel` |
| RSA | `ctf-crypto-rsa` |
| ECC | `ctf-crypto-ecc` |
| Modern crypto (AES/ChaCha) | `ctf-crypto-modern` |
| PRNG attacks | `ctf-crypto-prng` |
| Web server-side | `ctf-web-server-side` |
| Web client-side | `ctf-web-client-side` |
| Binary reversing | `ctf-reverse-tools` → `ctf-reverse-dynamic` |
| Anti-analysis | `ctf-reverse-anti-analysis` |
| Network forensics | `ctf-forensics-network` |
| Memory forensics | `ctf-forensics-disk-memory` |
| Steganography | `ctf-forensics-stego` |
| Pyjail | `ctf-misc-pyjails` |
| Android | `ctf-android` |
| WASM | `ctf-wasm` |

---

## Stage 9: FLAG — Record and Verify

When flag is found:

```bash
FLAG="<flag_value>"
echo "$FLAG" > "${CTF_DIR}/solutions/flag.txt"

# Record solution path
cat > "${CTF_DIR}/solutions/solution.md" << EOF
# Solution: ${CHALLENGE}

## Category
<identified category>

## Winning Hypothesis
<which hypothesis was confirmed>

## Attack Path
<step by step what led to the flag>

## Key Insight
<the single most important realization>

## Tools Used
<tool list>

## Flag
${FLAG}
EOF
```

**Before submitting:** confirm flag matches format exactly — no trailing spaces, newlines, or wrapper quotes.

---

## Quality Gates

| Gate | Blocks |
|------|--------|
| No tool run without answering QUESTION/HYPOTHESIS/EXPECTED | Any investigation step |
| Category assumption without observation | Stage 2 |
| Hypothesis without falsifiable test | Stage 4 |
| Repeating same failed test | Stage 6 |
| Skipping pivot after 3 failures | Stage 7 |
| Submitting flag without format check | Stage 9 |

---

## Output Structure

```
.omop/ctf/<challenge>/
  recon/
    observations.md     raw facts from Stage 1
    category.md         classification decision + confidence
  hypothesis/
    H-001.md            each hypothesis with status
  evidence/
    E-001.txt           tool outputs linked to hypotheses
  solutions/
    flag.txt            the flag
    solution.md         full solution writeup
  state.json            current engagement state
```
