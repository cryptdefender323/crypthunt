import { describe, expect, it } from "bun:test"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { closeManagedClient } from "./cleanup"
import type { ManagedClient } from "./types"
import { killProcessTree, readTransportPid } from "./process-tree-kill"

describe("readTransportPid", () => {
  it("#given transport with pid #when read #then returns pid", () => {
    expect(readTransportPid({ pid: 1234 })).toBe(1234)
  })

  it("#given invalid pid #when read #then null", () => {
    expect(readTransportPid({ pid: 0 })).toBeNull()
    expect(readTransportPid({})).toBeNull()
    expect(readTransportPid(null)).toBeNull()
  })
})

describe("killProcessTree", () => {
  it("#given invalid pid #when kill #then no throw", () => {
    expect(() => killProcessTree(0)).not.toThrow()
    expect(() => killProcessTree(-1)).not.toThrow()
  })
})

describe("closeManagedClient process tree", () => {
  it("#given stdio managed client with pid #when close #then client and transport closed", async () => {
    // given
    let clientClosed = false
    let transportClosed = false
    const managed: ManagedClient = {
      connectionType: "stdio",
      skillName: "playwright",
      lastUsedAt: Date.now(),
      client: {
        close: async () => {
          clientClosed = true
        },
        connect: async () => {},
        listTools: async () => ({ tools: [] }),
        listResources: async () => ({ resources: [] }),
        listPrompts: async () => ({ prompts: [] }),
        callTool: async () => ({ content: [] }),
        readResource: async () => ({ contents: [] }),
        getPrompt: async () => ({ messages: [] }),
      },
      transport: {
        close: async () => {
          transportClosed = true
        },
        pid: 999999001,
        start: async () => {},
        send: async () => {},
      } as never,
    }

    // when
    await closeManagedClient(managed)

    // then
    expect(clientClosed).toBe(true)
    expect(transportClosed).toBe(true)
  })

  it("#given http client #when close #then still closes without pid kill path error", async () => {
    // given
    const managed: ManagedClient = {
      connectionType: "http",
      skillName: "other",
      lastUsedAt: Date.now(),
      client: new Client({ name: "t", version: "1" }, { capabilities: {} }),
      transport: new StreamableHTTPClientTransport(new URL("https://example.com/mcp")),
    }

    // when / then
    await expect(closeManagedClient(managed)).resolves.toBeUndefined()
  })
})
