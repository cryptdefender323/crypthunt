import { describe, expect, mock, test } from "bun:test"
import { createCallOmoAgent } from "./tools"
import { clearCallableAgentsCache } from "./agent-resolver"

type AgentEntry = {
  name: string
  mode: "subagent" | "primary" | "all"
}

function createPluginInput(agents: AgentEntry[]) {
  return {
    client: {
      app: {
        agents: mock(() => Promise.resolve({ data: agents })),
      },
    },
    directory: "/test",
  }
}

function createBackgroundManager() {
  const launch = mock(() => Promise.resolve({
    id: "task-id",
    sessionId: "session-id",
    description: "Test task",
    agent: "scout",
    status: "pending",
  }))

  return {
    manager: {
      launch,
      getTask: mock(() => undefined),
      reserveSubagentSpawn: mock(() => Promise.resolve({
        spawnContext: { rootSessionID: "root", parentDepth: 0, childDepth: 1 },
        descendantCount: 1,
        commit: mock(() => undefined),
        rollback: mock(() => undefined),
      })),
    },
    launch,
  }
}

const toolContext = {
  sessionID: "parent-session",
  messageID: "message-id",
  agent: "cerberus-junior",
  abort: new AbortController().signal,
}

describe("call_omo_agent restricted agent set", () => {
  test("#when runtime exposes general as a subagent #then call_omo_agent rejects it before launch", async () => {
    //#given
    clearCallableAgentsCache()
    const pluginInput = createPluginInput([
      { name: "scout", mode: "subagent" },
      { name: "intel", mode: "subagent" },
      { name: "general", mode: "subagent" },
    ])
    const { manager, launch } = createBackgroundManager()
    const toolDefinition = createCallOmoAgent(pluginInput, manager)

    //#when
    const result = await toolDefinition.execute(
      { description: "Test", prompt: "Do work", subagent_type: "general", run_in_background: true },
      toolContext,
    )

    //#then
    expect(result).toContain("Invalid agent type")
    expect(result).toContain("Only scout, intel are allowed")
    expect(launch).not.toHaveBeenCalled()
  })

  test("#when caller requests cipher #then call_omo_agent rejects it because only research lookup agents are callable", async () => {
    //#given
    clearCallableAgentsCache()
    const pluginInput = createPluginInput([
      { name: "scout", mode: "subagent" },
      { name: "intel", mode: "subagent" },
      { name: "cipher", mode: "subagent" },
    ])
    const { manager, launch } = createBackgroundManager()
    const toolDefinition = createCallOmoAgent(pluginInput, manager)

    //#when
    const result = await toolDefinition.execute(
      { description: "Test", prompt: "Review this", subagent_type: "cipher", run_in_background: true },
      toolContext,
    )

    //#then
    expect(result).toContain("Invalid agent type")
    expect(result).toContain("Only scout, intel are allowed")
    expect(launch).not.toHaveBeenCalled()
  })

  test("#when caller requests scout or intel #then call_omo_agent still launches them", async () => {
    //#given
    clearCallableAgentsCache()
    const pluginInput = createPluginInput([
      { name: "scout", mode: "subagent" },
      { name: "intel", mode: "subagent" },
    ])
    const { manager, launch } = createBackgroundManager()
    const toolDefinition = createCallOmoAgent(pluginInput, manager)

    //#when
    await toolDefinition.execute(
      { description: "Scout", prompt: "Read code", subagent_type: "scout", run_in_background: true },
      toolContext,
    )
    await toolDefinition.execute(
      { description: "Research", prompt: "Find docs", subagent_type: "intel", run_in_background: true },
      toolContext,
    )

    //#then
    expect(launch).toHaveBeenCalledTimes(2)
  })
})
