const PLAYWRIGHT_MCP_COMMAND = ["npx", "-y", "@playwright/mcp@latest"]

export function createOpenCodeV1PlaywrightMcpConfig() {
  return {
    type: "local" as const,
    command: [...PLAYWRIGHT_MCP_COMMAND],
    enabled: true,
  }
}

export function createOpenCodeV2PlaywrightMcpConfig() {
  return {
    type: "local" as const,
    command: [...PLAYWRIGHT_MCP_COMMAND],
    disabled: false,
    codemode: false,
  }
}
