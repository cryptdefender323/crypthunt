---
name: tool-browser-automation
description: "Browser automation for pentesting and bug-bounty scope lookup. In OpenCode V2 use the connected headed Playwright MCP for visible navigation, snapshots, and evidence. Also covers Playwright/Puppeteer crawling, form submission, SPA discovery, and DOM analysis. Triggers: 'browser automation', 'playwright', 'playwright pentest', 'bug bounty scope lookup', 'headless browser', 'spa crawl', 'authenticated crawl', 'javascript rendering', 'dom xss automation'."
---

# Browser Automation for Pentesting

Browser automation for SPAs, authenticated sessions, and DOM analysis.

## OpenCode Playwright MCP

CryptHunter registers the Microsoft Playwright MCP server automatically for
OpenCode V1 and V2. Use its visible browser tools (`playwright_browser_navigate`,
`playwright_browser_snapshot`, and the other `playwright_browser_*` tools)
directly; do not create a second browser process or install a separate MCP
server. The headed browser opens when a browser tool is first used. The browser
binary downloads on first use. If the server is unavailable, identify that
failure before using a fallback and do not claim browser observation occurred.

An existing user server named `playwright` takes precedence. Users can disable
the default via `disabled_mcps: ["playwright"]` in CryptHunter config (V1) or
`mcp.servers.playwright.disabled: true` in OpenCode config (V2).

## OpenCode V2: Visible Playwright MCP

In OpenCode V2, use the configured `playwright` MCP server for visible browser
work. Its tools appear with the `playwright_` prefix, including
`playwright_browser_navigate` and `playwright_browser_snapshot`. The project
configuration starts Playwright MCP in headed mode so the researcher can watch
the page. Do not silently switch to Python/headless Playwright when this MCP is
available. If the server or browser fails to start, report that exact failure
and do not claim that browser inspection happened.

For Bug Bounty only, use this browser to look up the exact owner's public
program or VDP scope before asking the user for an authorization basis. This
platform lookup workflow applies only when the selected mode is `bug-bounty`;
red-team scope comes from the reviewed rules of engagement, and other modes
follow their own scope rules.

1. Search official public program directories (HackerOne, Bugcrowd, Intigriti,
   YesWeHack, and other relevant platforms discoverable through browser
   search) for the exact hostname and owner name. This applies to government
   agencies, presidential offices, public/private companies, and organizations
   of any size. Open each plausible official program page and verify its
   status, exact asset entry, exclusions, and allowed methods.
2. If no platform listing appears, inspect the exact asset owner's published
   VDP/security.txt policy page. General web search and third-party
   aggregators may identify leads, but only the program/platform policy or
   owner-controlled policy/authorization establishes scope. Read policy pages
   only until scope is confirmed; do not browse the application or send test
   payloads.
3. Report which official sources were checked. If public lookup finds no exact
   scope, continue external passive research and then ask once for a private
   program URL or owner authorization. Never infer scope from a similar
   hostname, government affiliation, public accessibility, or third-party
   directory.

Use visible snapshots and preserve the official URL and a minimal screenshot
or other evidence for the scope decision. The browser establishes program
scope; it does not itself validate a vulnerability.

---

## Phase 1: Playwright Setup & Basic Crawl

```python
#!/usr/bin/env python3
# playwright_crawl.py
from playwright.sync_api import sync_playwright
import json, sys

TARGET = sys.argv[1]
visited = set()
endpoints = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--ignore-certificate-errors"])
    page = browser.new_page()

    # Intercept all requests:
    def on_request(req):
        if req.resource_type in ("fetch", "xhr", "document"):
            endpoints.append({"url": req.url, "method": req.method, "type": req.resource_type})

    page.on("request", on_request)

    # Navigate:
    page.goto(TARGET, wait_until="networkidle")
    print(f"Title: {page.title()}")

    # Find all links:
    links = page.eval_on_selector_all("a", "els => els.map(e => e.href)")
    print(f"Links found: {len(links)}")

    browser.close()

with open("output/playwright_endpoints.json", "w") as f:
    json.dump(endpoints, f, indent=2)
print(f"Endpoints captured: {len(endpoints)}")
```

---

## Phase 2: Authenticated Session

```python
#!/usr/bin/env python3
# authenticated_crawl.py
from playwright.sync_api import sync_playwright

TARGET = "https://TARGET"
USERNAME = "testuser"
PASSWORD = "testpass"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--ignore-certificate-errors"])
    context = browser.new_context(ignore_https_errors=True)
    page = context.new_page()

    # Login:
    page.goto(f"{TARGET}/login")
    page.fill("input[name='username']", USERNAME)
    page.fill("input[name='password']", PASSWORD)
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")

    # Save auth state:
    context.storage_state(path="output/auth_state.json")
    print("Logged in. Cookies saved.")

    # Spider authenticated pages:
    for path in ["/dashboard", "/profile", "/settings", "/admin", "/api/users"]:
        page.goto(f"{TARGET}{path}")
        page.screenshot(path=f"output/screenshot_{path.strip('/').replace('/', '_')}.png")
        print(f"{path}: {page.title()}")

    browser.close()
```

---

## Phase 3: DOM XSS Detection

```python
#!/usr/bin/env python3
# dom_xss_test.py
from playwright.sync_api import sync_playwright

TARGET = "https://TARGET/search"
XSS_PAYLOADS = [
    '"><img src=x onerror=window.XSS=1>',
    "javascript:window.XSS=1",
    '\'-alert(1)-\'',
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for payload in XSS_PAYLOADS:
        page = browser.new_page()
        xss_triggered = []
        page.on("dialog", lambda d: (xss_triggered.append(d.message), d.dismiss()))

        url = f"{TARGET}?q={payload}"
        page.goto(url, wait_until="networkidle")

        # Check if XSS fired:
        result = page.evaluate("() => window.XSS")
        if result or xss_triggered:
            print(f"XSS FOUND: {payload}")

        page.close()
    browser.close()
```

---

## Phase 4: Katana / Crawling Tools

```bash
TARGET="https://TARGET"

katana -u "$TARGET" -jc -d 3 -o output/katana_endpoints.txt 2>/dev/null

echo "$TARGET" | hakrawler -depth 3 -js -forms 2>/dev/null | tee output/hakrawler.txt

gospider -s "$TARGET" -d 3 --js -a -o output/gospider 2>/dev/null

cat output/katana_endpoints.txt | grep -E "/api/|/v[0-9]+/" | sort -u | tee output/api_endpoints.txt
```

---

## Output

Save to `output/`:
- `playwright_endpoints.json` — intercepted API calls
- `auth_state.json` — authenticated session cookies
- `screenshot_*.png` — visual proof collection

## Next Phase

→ Feed discovered endpoints to `tool-advanced-fuzzing`
→ `vuln-xss` for manual XSS exploitation
