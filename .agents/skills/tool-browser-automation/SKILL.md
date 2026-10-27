---
name: tool-browser-automation
description: "Browser automation for pentesting — Playwright/Puppeteer for authenticated crawling, form submission, SPA spider, JavaScript rendering, DOM XSS detection, screenshot proof collection. Triggers: 'browser automation', 'playwright pentest', 'puppeteer pentest', 'headless browser', 'spa crawl', 'authenticated crawl', 'javascript rendering', 'dom xss automation'."
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
