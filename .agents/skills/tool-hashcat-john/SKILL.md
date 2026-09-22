---
name: tool-hashcat-john
description: "Password cracking with Hashcat and John the Ripper — hash identification, wordlist attacks, rule-based attacks, hybrid attacks, rainbow tables, mask attacks. Triggers: 'hashcat', 'john the ripper', 'password cracking', 'hash cracking', 'hashcat crack', 'john crack', 'wordlist attack', 'password hash', 'crack hash'."
---

# Password Cracking — Hashcat & John the Ripper

Identify and crack password hashes with wordlist, rule, and mask attacks.

---

## Phase 1: Hash Identification

```bash
HASH="$1"

hash-identifier "$HASH" 2>/dev/null

hashid "$HASH" 2>/dev/null

```

---

## Phase 2: Hashcat Attacks

```bash
HASH_FILE="hashes.txt"
WORDLIST="/usr/share/wordlists/rockyou.txt"

hashcat -m 0 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null        # MD5
hashcat -m 100 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null      # SHA1
hashcat -m 1800 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null     # SHA512crypt
hashcat -m 3200 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null     # bcrypt
hashcat -m 1000 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null     # NTLM
hashcat -m 5600 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null     # NTLMv2
hashcat -m 13100 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null    # Kerberos TGS (Kerberoast)
hashcat -m 18200 "$HASH_FILE" "$WORDLIST" --force 2>/dev/null    # Kerberos AS-REP

hashcat -m 1000 "$HASH_FILE" "$WORDLIST" -r /usr/share/hashcat/rules/best64.rule --force 2>/dev/null
hashcat -m 1000 "$HASH_FILE" "$WORDLIST" -r /usr/share/hashcat/rules/rockyou-30000.rule --force 2>/dev/null

hashcat -m 1000 "$HASH_FILE" -a 3 '?u?l?l?l?d?d?d?d' --force 2>/dev/null  # Passwd1234
hashcat -m 1000 "$HASH_FILE" -a 3 '?a?a?a?a?a?a?a?a' --force 2>/dev/null  # 8-char all

hashcat -m 1000 "$HASH_FILE" -a 6 "$WORDLIST" '?d?d?d?d' --force 2>/dev/null  # word + 4 digits
```

---

## Phase 3: John the Ripper

```bash
HASH_FILE="hashes.txt"
WORDLIST="/usr/share/wordlists/rockyou.txt"

john "$HASH_FILE" --wordlist="$WORDLIST" 2>/dev/null

john "$HASH_FILE" --wordlist="$WORDLIST" --rules 2>/dev/null

john --show "$HASH_FILE" 2>/dev/null

john --format=nt "$HASH_FILE" --wordlist="$WORDLIST" 2>/dev/null
john --format=bcrypt "$HASH_FILE" --wordlist="$WORDLIST" 2>/dev/null

zip2john protected.zip > zip_hash.txt
rar2john protected.rar > rar_hash.txt
ssh2john id_rsa > ssh_hash.txt
john zip_hash.txt --wordlist="$WORDLIST" 2>/dev/null
```

---

## Output

Save to `output/`:
- `cracked.txt` — cracked plaintext passwords
- Run `hashcat -m HASH_MODE hashes.txt --show` to display results

## Next Phase

→ Use cracked creds in `pentest-exploit` or `post-lateral-movement`
→ `tool-impacket` for pass-the-hash if NTLM hashes
