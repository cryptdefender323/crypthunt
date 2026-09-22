---
name: ctf-osint-social
description: "CTF OSINT social media investigation. Twitter/X persistent IDs, Tumblr header fingerprinting, BlueSky API, Unicode homoglyph steganography, Discord metadata, Strava GPS exposure, multi-platform username enumeration. Triggers: 'social media osint', 'twitter osint', 'instagram osint', 'discord osint', 'bluesky osint', 'username enumeration', 'social network investigation', 'ctf osint social'."
---

# CTF OSINT — Social Media

Platform-specific techniques: Twitter, Tumblr, BlueSky, Discord, Strava, Reddit.

---

## Phase 1: Username Enumeration (Multi-Platform)

```bash
pip install wmn --break-system-packages
wmn --username "target_username"

pip install sherlock-project --break-system-packages
sherlock target_username

PLATFORMS=(
  "https://twitter.com/{}"
  "https://github.com/{}"
  "https://instagram.com/{}"
  "https://reddit.com/user/{}"
  "https://linkedin.com/in/{}"
  "https://facebook.com/{}"
  "https://tiktok.com/@{}"
  "https://twitch.tv/{}"
  "https://youtube.com/@{}"
  "https://discord.com/users/{}"  # numeric ID needed
)

USERNAME="target"
for platform in "${PLATFORMS[@]}"; do
  url="${platform/{\}/$USERNAME}"
  code=$(curl -so /dev/null -w '%{http_code}' -L "$url" --max-time 10)
  echo "$code $url"
done
```

---

## Phase 2: Twitter/X Investigation

```bash
USERNAME="target_handle"

curl -s "https://api.twitter.com/2/users/by/username/$USERNAME" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" | jq .data.id

curl -s "http://web.archive.org/cdx/search/cdx?url=twitter.com/$USERNAME/*&output=json" | \
  python3 -c "import json,sys; [print(x) for x in json.load(sys.stdin)]"

curl -sI "https://t.co/SHORTCODE" | grep Location

curl -s "https://web.archive.org/web/*/https://twitter.com/$USERNAME/status/*" | \
  grep -oE "https://twitter.com/$USERNAME/status/[0-9]+" | sort -u | head -20
```

---

## Phase 3: Tumblr Investigation

```bash
BLOG="targetblog"

curl -sI "https://$BLOG.tumblr.com" | grep x-tumblr-user

curl -s "https://$BLOG.tumblr.com" | python3 -c "
import sys, re, json

html = sys.stdin.read()

matches = re.findall(r'window\[.Tumblelog.\]\s*=\s*(\{.*?\});', html, re.DOTALL)
for m in matches:
    try:
        data = json.loads(m)
        print(json.dumps(data, indent=2)[:500])
    except:
        pass
"

curl -so avatar.jpg "https://api.tumblr.com/v2/blog/$BLOG/avatar/512"

```

---

## Phase 4: BlueSky / AT Protocol

```bash
HANDLE="target.bsky.social"

curl -s "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=$HANDLE" | jq .did

DID="did:plc:xxxx"

curl -s "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=$HANDLE" | jq .

curl -s "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=$HANDLE&limit=50" | \
  jq '.[].post.record.text'

python3 << 'EOF'
HOMOGLYPHS = {

    'а': 'а',  # Cyrillic а
    'е': 'е',  # Cyrillic е  
    'о': 'о',  # Cyrillic о
}

def decode_homoglyph_stego(text):
    bits = []
    for char in text:
        if ord(char) > 127:  # non-ASCII = 1
            bits.append('1')
        else:
            bits.append('0')
    
    chars = []
    for i in range(0, len(bits) - 7, 8):
        byte = int(''.join(bits[i:i+8]), 2)
        if 32 <= byte <= 126:
            chars.append(chr(byte))
    return ''.join(chars)

text = "Paste text here"
print(decode_homoglyph_stego(text))
EOF
```

---

## Phase 5: Discord Investigation

```bash
SERVER_INVITE="discord.gg/INVITE_CODE"

# - Role names (flags can be hidden in role names)
# - Emoji names and descriptions
# - Server description
# - Channel topics
# - Pinned messages

pip install Pillow --break-system-packages
python3 -c "
from PIL import Image, ImageSequence
img = Image.open('emoji.gif')
for i, frame in enumerate(ImageSequence.Iterator(img)):
    frame.save(f'frame_{i:03d}.png')

"

python3 -c "
msg = 'Discord message here'
for char in msg:
    if ord(char) in [0x200B, 0xFEFF, 0x2062, 0x2063]:
        print(f'Invisible char: U+{ord(char):04X}')
"
```

---

## Phase 6: Strava / Fitness App GPS

```bash
ATHLETE_ID="12345"

curl -s "https://www.strava.com/athletes/$ATHLETE_ID" | \
  python3 -c "
import sys, re
html = sys.stdin.read()

coords = re.findall(r'\"latlng\":\[(-?\d+\.\d+),(-?\d+\.\d+)\]', html)
for lat, lon in coords[:5]:
    print(f'{lat}, {lon}')
"

curl -s "https://nominatim.openstreetmap.org/reverse?lat=LAT&lon=LON&format=json" | jq .display_name
```

---

## Phase 7: Platform Breadcrumb Chaining

```bash
# 1. Find username on one platform
# 2. Check bio/about for links to other accounts
# 3. Check posts for mentions of other platforms
# 4. Check image metadata (EXIF) for location/device
# 5. Google: "username" site:platform.com
# 6. Find email → reverse lookup → more accounts

USER="target_reddit"
curl -s "https://www.reddit.com/user/$USER.json" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
for post in data['data']['children'][:10]:
    d = post['data']
    print(d.get('subreddit', ''), '|', d.get('title', d.get('body', ''))[:100])
"

curl -s "https://api.spotify.com/v1/users/USER_ID/playlists" \
  -H "Authorization: Bearer TOKEN" | jq '.[].name'

```

---

## Output

Save to `.omop/engagement/ctf/osint/social/`:
- `username-results.txt` — found accounts per platform
- `timeline.txt` — chronological activity
- `hidden-data.txt` — extracted steganographic content
- `connections.md` — platform breadcrumb map

## Next Phase

→ `ctf-osint-web` for web/DNS OSINT
→ `ctf-forensics-stego` for image steganography in profile pics
