import type { BuiltinSkill } from "../types"

export const playwrightSkill: BuiltinSkill = {
  name: "playwright",
  description:
    "MUST USE for any browser-related tasks. Browser automation via Playwright MCP - verification, browsing, information gathering, web scraping, testing, screenshots, and all browser interactions.",
  template: `# Playwright Browser Automation

This skill provides browser automation capabilities via the Playwright MCP server.

## REQUIRED cleanup

ALWAYS call the Playwright MCP tool that closes the browser when the browser task is finished (typically \`browser_close\` / close browser).

- Do this before ending the turn or switching to non-browser work.
- Leaving Chromium open wastes CPU/RAM and can block later sessions.
- If a tool call fails, still attempt close once.

Session end also disconnects the MCP process, but explicit close is still required for in-session hygiene.
`,
  mcpConfig: {
    playwright: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
  },
}
