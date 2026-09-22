---
name: ctf-crypto
description: "CTF cryptography deep skill. Full spectrum: hash cracking, encoding triage, RSA (small e, common modulus, Franklin-Reiter, Coppersmith), ECC (ECDSA nonce reuse, invalid curve, Pohlig-Hellman), symmetric (AES padding oracle, GCM nonce reuse, CBC bit-flip), PRNG (MT19937 state recovery, LCG), lattice (LLL, Coppersmith short-pad), ZKP forgery, classical ciphers (Vigenere, substitution, Playfair), XOR keystream, custom cipher reversing. Triggers: 'ctf crypto', 'crypto challenge', 'decrypt', 'hash', 'rsa', 'aes', 'ecc', 'cipher', 'lattice', 'prng', 'padding oracle', 'base64 decode', 'xor'."
version: 2.0.0
phase: ["exploitation"]
category: ["cryptanalysis"]
tools: ["hashcat", "john", "pwntools", "sage", "python3"]
tags: ["ctf", "crypto", "rsa", "ecc", "aes", "prng", "lattice", "classical", "xor", "hash", "encoding"]
---

# CTF Cryptography

You are solving a **CTF crypto challenge**. Work systematically: identify the primitive first, then apply the right attack. Never brute-force when a mathematical shortcut exists.

---

## Phase 0: Triage

Before anything else, classify the challenge:

```python
import magic, binascii, base64, string

def triage(data: bytes):
    printable = all(c in string.printable.encode() for c in data)
    b64_chars = set(string.ascii_letters + string.digits + '+/=')
    looks_b64 = all(c in b64_chars for c in data.decode(errors='ignore').strip())

    print(f"length       : {len(data)}")
    print(f"entropy      : {calc_entropy(data):.2f}")
    print(f"printable    : {printable}")
    print(f"looks_b64    : {looks_b64}")
    print(f"hex sample   : {data[:32].hex()}")
    print(f"magic        : {magic.from_buffer(data)}")

def calc_entropy(data):
    from collections import Counter
    import math
    counts = Counter(data)
    total = len(data)
    return -sum((c/total) * math.log2(c/total) for c in counts.values())
```

| Signal | Likely primitive |
|---|---|
| High entropy (~8.0), binary | AES/random, compressed, encrypted |
| Low entropy, printable | Encoding, classical cipher, XOR with ASCII key |
| `n, e, c` integers | RSA |
| `p, G, Q, r, s` or curve params | ECC / ECDSA |
| Sequence of numbers, period detectable | PRNG |
| Fixed-length blocks, identical ciphertext for identical plaintext | ECB mode |
| `ct XOR pt` known for some blocks | CBC bit-flip or CTR keystream reuse |

---

## Phase 1: Hash Cracking

```bash
hashcat -a 0 -m 0    hashes.txt /usr/share/wordlists/rockyou.txt          # MD5
hashcat -a 0 -m 100  hashes.txt /usr/share/wordlists/rockyou.txt          # SHA1
hashcat -a 0 -m 1400 hashes.txt /usr/share/wordlists/rockyou.txt          # SHA256
hashcat -a 0 -m 1800 hashes.txt /usr/share/wordlists/rockyou.txt          # sha512crypt
hashcat -a 3 -m 0    hashes.txt '?a?a?a?a?a?a'                            # brute up to 6 chars
hashcat -a 0 -m 0    hashes.txt rockyou.txt -r best64.rule                 # with rules

john --wordlist=/usr/share/wordlists/rockyou.txt --format=raw-md5 hashes.txt
john --show hashes.txt
```

Hash-length identification:
```
32  chars → MD5
40  chars → SHA1
56  chars → SHA224
64  chars → SHA256
96  chars → SHA384
128 chars → SHA512
```

---

## Phase 2: Encoding / Classical

```python
import base64, codecs, binascii

def decode_all(s: str):
    for name, fn in [
        ("b64",   lambda x: base64.b64decode(x).decode()),
        ("b32",   lambda x: base64.b32decode(x).decode()),
        ("hex",   lambda x: bytes.fromhex(x).decode()),
        ("rot13", lambda x: codecs.decode(x, 'rot_13')),
        ("url",   lambda x: __import__('urllib.parse', fromlist=['unquote']).unquote(x)),
    ]:
        try:
            print(f"{name}: {fn(s)}")
        except Exception:
            pass

decode_all("aGVsbG8gd29ybGQ=")
```

Caesar / ROT brute:
```python
for shift in range(26):
    print(shift, ''.join(chr((ord(c) - 65 + shift) % 26 + 65) if c.isupper()
                          else chr((ord(c) - 97 + shift) % 26 + 97) if c.islower()
                          else c for c in ciphertext))
```

Vigenere IC-based key length recovery:
```python
from itertools import cycle

def index_of_coincidence(text):
    n = len(text)
    freq = [text.count(chr(65+i)) for i in range(26)]
    return sum(f*(f-1) for f in freq) / (n*(n-1)) if n > 1 else 0

def find_keylength(ct, max_klen=20):
    ct_upper = ''.join(c for c in ct.upper() if c.isalpha())
    scores = {}
    for klen in range(2, max_klen+1):
        streams = [''.join(ct_upper[i::klen]) for i in range(klen)]
        scores[klen] = sum(index_of_coincidence(s) for s in streams) / klen
    return sorted(scores, key=scores.get, reverse=True)[:5]

print(find_keylength(ciphertext))
```

---

## Phase 3: XOR

```python
def single_byte_xor_score(ct: bytes):
    from string import ascii_letters, digits, punctuation
    best, best_key, best_pt = 0, 0, b''
    for key in range(256):
        pt = bytes(b ^ key for b in ct)
        score = sum(c in (ascii_letters + ' ').encode() for c in pt)
        if score > best:
            best, best_key, best_pt = score, key, pt
    return best_key, best_pt

key, pt = single_byte_xor_score(bytes.fromhex(ciphertext_hex))
print(f"key=0x{key:02x}  pt={pt}")
```

Repeating XOR key length (Hamming distance):
```python
def hamming(a: bytes, b: bytes) -> int:
    return bin(int.from_bytes(a, 'big') ^ int.from_bytes(b, 'big')).count('1')

def find_xor_keylen(ct: bytes, max_klen=40):
    scores = {}
    for klen in range(2, min(max_klen, len(ct)//4)):
        blocks = [ct[i*klen:(i+1)*klen] for i in range(4)]
        pairs  = [(blocks[i], blocks[j]) for i in range(4) for j in range(i+1,4) if len(blocks[i])==klen and len(blocks[j])==klen]
        scores[klen] = sum(hamming(a,b)/klen for a,b in pairs) / len(pairs)
    return sorted(scores, key=scores.get)[:5]
```

---

## Phase 4: RSA

### 4.1 Factor n — try easy routes first

```python
from sympy import factorint, isprime
import requests

def factor_n(n):
    factors = factorint(n)
    if len(factors) == 2:
        return list(factors.keys())

    r = requests.get(f"https://factordb.com/api?query={n}").json()
    if r.get("status") == "FF":
        return [int(f[0]) for f in r["factors"]]
    return None
```

### 4.2 Small public exponent (e=3, e=65537 with small message)

```python
import gmpy2

def cube_root_attack(c, e=3):
    m, exact = gmpy2.iroot(c, e)
    if exact:
        return m
    return None

m = cube_root_attack(c)
if m:
    print(bytes.fromhex(hex(m)[2:]))
```

### 4.3 Common modulus attack

```python
from math import gcd

def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = extended_gcd(b, a % b)
    return g, y, x - (a // b) * y

def common_modulus(n, e1, e2, c1, c2):
    g, a, b = extended_gcd(e1, e2)
    assert g == 1
    if a < 0:
        c1 = pow(gmpy2.invert(c1, n), -a, n)
    else:
        c1 = pow(c1, a, n)
    if b < 0:
        c2 = pow(gmpy2.invert(c2, n), -b, n)
    else:
        c2 = pow(c2, b, n)
    return (c1 * c2) % n

m = common_modulus(n, e1, e2, c1, c2)
print(bytes.fromhex(hex(m)[2:]))
```

### 4.4 Wiener's attack (small private key d)

```python
from fractions import Fraction

def convergents(cf):
    n0, d0, n1, d1 = 1, 0, cf[0], 1
    yield n1, d1
    for x in cf[1:]:
        n0, d0, n1, d1 = n1, d1, x*n1+n0, x*d1+d0
        yield n1, d1

def wiener(e, n):
    cf = []
    a, b = e, n
    while b:
        cf.append(a // b)
        a, b = b, a % b
    for k, d in convergents(cf):
        if k == 0:
            continue
        phi, rem = divmod(e*d - 1, k)
        if rem != 0:
            continue
        disc = (n - phi + 1)**2 - 4*n
        if disc >= 0:
            sq, exact = gmpy2.iroot(disc, 2)
            if exact:
                return int(d)
    return None

d = wiener(e, n)
if d:
    print(pow(c, d, n).to_bytes(256, 'big'))
```

### 4.5 Franklin-Reiter related message attack

```python
from sage.all import PolynomialRing, GF, ZZ

def franklin_reiter(n, e, c1, c2, f1_coeffs, f2_coeffs):
    R = PolynomialRing(ZZ.quotient(n), 'x')
    x = R.gen()
    f1 = sum(c * x**i for i, c in enumerate(f1_coeffs))
    f2 = sum(c * x**i for i, c in enumerate(f2_coeffs))
    g1 = f1**e - c1
    g2 = f2**e - c2
    return -g1.gcd(g2).coefficients()[0]
```

### 4.6 Broadcast attack (Hastad, same message, different moduli)

```python
from functools import reduce

def crt(remainders, moduli):
    M = reduce(lambda a, b: a*b, moduli)
    x = 0
    for r, m in zip(remainders, moduli):
        Mi = M // m
        x += r * Mi * pow(Mi, -1, m)
    return x % M

m_e = crt(ciphertexts, moduli)
m, exact = gmpy2.iroot(m_e, e)
if exact:
    print(bytes.fromhex(hex(int(m))[2:]))
```

---

## Phase 5: AES / Symmetric

### 5.1 Identify mode

```python
def detect_ecb(ciphertext: bytes, block_size=16) -> bool:
    blocks = [ciphertext[i:i+block_size] for i in range(0, len(ciphertext), block_size)]
    return len(blocks) != len(set(blocks))
```

### 5.2 AES-CBC Padding Oracle

```python
def padding_oracle_decrypt(oracle, ct: bytes, block_size=16) -> bytes:
    plaintext = b''
    blocks = [ct[i:i+block_size] for i in range(0, len(ct), block_size)]

    for blk_idx in range(1, len(blocks)):
        prev = bytearray(blocks[blk_idx - 1])
        curr = blocks[blk_idx]
        intermediate = bytearray(block_size)

        for byte_pos in range(block_size - 1, -1, -1):
            pad_byte = block_size - byte_pos
            crafted_prev = bytearray(block_size)
            for k in range(byte_pos + 1, block_size):
                crafted_prev[k] = intermediate[k] ^ pad_byte

            for guess in range(256):
                crafted_prev[byte_pos] = guess
                probe = bytes(crafted_prev) + curr
                if oracle(probe):
                    intermediate[byte_pos] = guess ^ pad_byte
                    break

        plaintext += bytes(b ^ p for b, p in zip(prev, intermediate))

    from Crypto.Util.Padding import unpad
    return unpad(plaintext, block_size)
```

### 5.3 AES-GCM Nonce Reuse (Forbidden Attack)

```python
def gcm_nonce_reuse(ct1, ct2, pt1_known):
    keystream = bytes(a ^ b for a, b in zip(ct1, pt1_known))
    pt2 = bytes(a ^ b for a, b in zip(ct2, keystream))
    return pt2
```

### 5.4 CBC Bit-Flip

```python
def cbc_bitflip(ciphertext: bytes, target_block_idx: int, offset: int,
                original: bytes, desired: bytes, block_size=16) -> bytes:
    ct = bytearray(ciphertext)
    prev_block_start = (target_block_idx - 1) * block_size
    for i, (o, d) in enumerate(zip(original, desired)):
        ct[prev_block_start + offset + i] ^= o ^ d
    return bytes(ct)
```

---

## Phase 6: ECC / ECDSA

### 6.1 ECDSA Nonce Reuse (same k, two signatures)

```python
def ecdsa_nonce_reuse(r, s1, s2, z1, z2, order):
    k = ((z1 - z2) * pow(s1 - s2, -1, order)) % order
    d = ((s1 * k - z1) * pow(r, -1, order)) % order
    return k, d

k, privkey = ecdsa_nonce_reuse(r, s1, s2, z1, z2, curve_order)
print(f"private key: {hex(privkey)}")
```

### 6.2 Pohlig-Hellman (small subgroup, smooth order)

```python
from sage.all import EllipticCurve, GF, CRT_list, factor

def pohlig_hellman_ecc(P, Q, curve, order):
    factors = [(p, e) for p, e in factor(order)]
    dlogs = []
    moduli = []
    for p, e in factors:
        pk = p**e
        Pk = (order // pk) * P
        Qk = (order // pk) * Q
        dlogs.append(discrete_log(Pk, Qk, pk, operation='+'))
        moduli.append(pk)
    return CRT_list(dlogs, moduli)
```

### 6.3 Invalid Curve Attack

```python
def invalid_curve_attack(server_oracle, curve_params, target_key_bits):
    from sage.all import EllipticCurve, GF, CRT_list

    collected_dlogs = []
    collected_moduli = []
    running_product = 1

    for b_twisted in small_b_values:
        E_invalid = EllipticCurve(GF(curve_params.p), [curve_params.a, b_twisted])
        for P in points_of_small_order(E_invalid):
            shared = server_oracle(P)
            dlog = discrete_log_small(shared, P, P.order())
            collected_dlogs.append(dlog)
            collected_moduli.append(P.order())
            running_product *= P.order()
            if running_product > 2**target_key_bits:
                return CRT_list(collected_dlogs, collected_moduli)
```

---

## Phase 7: PRNG Attacks

### 7.1 MT19937 State Recovery (Python random)

```python
def untemper(y):
    y ^= y >> 18
    y ^= (y << 15) & 0xefc60000
    y ^= (y << 7)  & 0x9d2c5680
    for _ in range(3):
        y ^= (y << 7) & 0x9d2c5680
    y ^= y >> 11
    for _ in range(3):
        y ^= y >> 11
    return y & 0xffffffff

def recover_mt19937_state(outputs_32bit):
    assert len(outputs_32bit) >= 624
    state = [untemper(v) for v in outputs_32bit[:624]]
    import random
    rng = random.Random()
    rng.setstate((3, tuple(state + [624]), None))
    return rng
```

### 7.2 LCG Parameter Recovery

```python
from math import gcd
from functools import reduce

def recover_lcg(outputs):
    diffs   = [outputs[i+1] - outputs[i] for i in range(len(outputs)-1)]
    zeroes  = [diffs[i+2]*diffs[i] - diffs[i+1]**2 for i in range(len(diffs)-2)]
    m       = abs(reduce(gcd, zeroes))
    a       = (diffs[1] * pow(diffs[0], -1, m)) % m
    b       = (outputs[1] - a * outputs[0]) % m
    return m, a, b

m, a, b = recover_lcg(observed_outputs)
next_val = (a * observed_outputs[-1] + b) % m
```

---

## Phase 8: Lattice (Advanced)

### 8.1 Coppersmith Short-Pad Attack (RSA)

```python
from sage.all import PolynomialRing, ZZ, matrix

def coppersmith_short_pad(n, e, c1, c2, eps=None):
    R = PolynomialRing(ZZ, 'x,y')
    x, y = R.gens()
    g1 = x**e - c1
    g2 = (x + y)**e - c2
    res = g1.resultant(g2, x)
    Ry = PolynomialRing(ZZ, 'y')
    yroots = Ry(res).roots()
    return [int(r) for r, _ in yroots]
```

### 8.2 LLL for Hidden Number Problem (ECDSA biased nonces)

```python
from sage.all import matrix, QQ, vector, ZZ

def hnp_lll(signatures, public_key, curve_order, known_bits):
    n = len(signatures)
    B = matrix(QQ, n+2, n+2)
    B[0, 0] = curve_order
    for i, (r, s, z, k_partial) in enumerate(signatures):
        t = (r * pow(s, -1, curve_order)) % curve_order
        u = (-z * pow(s, -1, curve_order)) % curve_order
        B[i+1, 0] = t
        B[i+1, i+1] = 1
        B[n+1, i+1] = u - k_partial
    B[n+1, n+1] = 2**known_bits / curve_order
    L = B.LLL()
    for row in L:
        candidate = int(row[n+1] * curve_order / (2**known_bits))
        privkey = (candidate - public_key) % curve_order
        if verify_privkey(privkey):
            return privkey
```

---

## Phase 9: ZKP Challenges

```python
def zkp_forge_schnorr(p, q, g, y):
    import random
    e = random.randint(1, q-1)
    z = random.randint(1, q-1)
    R = (pow(g, z, p) * pow(y, (-e) % q, p)) % p
    return R, e, z

def zkp_replay_attack(transcript_R, transcript_e, transcript_z):
    return transcript_R, transcript_e, transcript_z
```

---

## Output

Save to `.omop/ctf/<challenge>/crypto/`:
- `solve.py` — working solver
- `flag.txt` — captured flag
- `analysis.md` — what the primitive was, what attack was chosen, why

## Skill Routing

| Signal | Next skill |
|---|---|
| RSA with unusual parameters | `ctf-crypto-rsa` |
| ECC / ECDSA | `ctf-crypto-ecc` |
| AES/symmetric, IV/nonce reuse | `ctf-crypto-modern` |
| Classical cipher, Vigenere, substitution | `ctf-crypto-classic` |
| PRNG, random number prediction | `ctf-crypto-prng` |
| Lattice, LWE, NTRU | `ctf-crypto-advanced-math` |
| ZKP, interactive proofs | `ctf-crypto-zkp` |
| Exotic / custom cipher | `ctf-crypto-exotic` |
| Historical machine cipher | `ctf-crypto-historical` |
