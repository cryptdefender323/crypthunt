import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { createPluginInterface } from "./plugin-interface"
import { createAutoSlashCommandHook } from "./hooks/auto-slash-command"
import { createStartWorkHook } from "./hooks/start-work"
import { readBoulderState } from "./features/boulder-state"
import {
  _resetForTesting,
  getSessionAgent,
  registerAgentName,
  updateSessionAgent,
} from "./features/claude-code-session-state"


describe("createPluginInterface - command.execute.before", () => {
  let testDir = ""

  beforeEach(() => {
    testDir = join(tmpdir(), `plugin-interface-start-work-${randomUUID()}`)
    mkdirSync(join(testDir, ".omop", "plans"), { recursive: true })
    writeFileSync(join(testDir, ".omop", "plans", "worker-plan.md"), "# Plan\n- [ ] Task 1")
    _resetForTesting()
    registerAgentName("talos")
    registerAgentName("cerberus")
  })

  afterEach(() => {
    _resetForTesting()
    rmSync(testDir, { recursive: true, force: true })
  })

  test("executes start-work side effects for native command execution", async () => {
    // given
    updateSessionAgent("ses-command-before", "talos")
    const pluginInterface = createPluginInterface({
      ctx: {
        directory: testDir,
        client: { tui: { showToast: async () => {} } },
      } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {
        autoSlashCommand: createAutoSlashCommandHook({ skills: [] }),
        startWork: createStartWorkHook({
          directory: testDir,
          client: { tui: { showToast: async () => {} } },
        } as never),
      } as never,
      tools: {},
    })
    const output = {
      parts: [{ type: "text", text: "original" }],
    }

    // when
    await pluginInterface["command.execute.before"]?.(
      {
        command: "start-work",
        sessionID: "ses-command-before",
        arguments: "",
      },
      output as never
    )

    // then
    expect(pluginInterface["command.execute.before"]).toBeDefined()
    expect(output.parts[0]?.text).toContain("Auto-Selected Plan")
    expect(output.parts[0]?.text).toContain("boulder.json has been created")
    expect(getSessionAgent("ses-command-before")).toBe("cerberus")
    expect(readBoulderState(testDir)?.agent).toBe("cerberus")
  })

  test("does not run start-work side effects for other native commands with session context", async () => {
    // given
    updateSessionAgent("ses-handoff", "talos")
    const pluginInterface = createPluginInterface({
      ctx: {
        directory: testDir,
        client: { tui: { showToast: async () => {} } },
      } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {
        autoSlashCommand: createAutoSlashCommandHook({ skills: [] }),
        startWork: createStartWorkHook({
          directory: testDir,
          client: { tui: { showToast: async () => {} } },
        } as never),
      } as never,
      tools: {},
    })
    const output = {
      parts: [{ type: "text", text: "original" }],
    }

    // when
    await pluginInterface["command.execute.before"]?.(
      {
        command: "handoff",
        sessionID: "ses-handoff",
        arguments: "",
      },
      output as never
    )

    // then
    expect(output.parts[0]?.text).toContain("HANDOFF CONTEXT")
    expect(readBoulderState(testDir)).toBeNull()
    expect(getSessionAgent("ses-handoff")).toBe("talos")
  })

  test("switches native start-work to Argus when Argus is registered in config", async () => {
    // given
    registerAgentName("argus")
    updateSessionAgent("ses-command-argus", "talos")
    const pluginInterface = createPluginInterface({
      ctx: {
        directory: testDir,
        client: { tui: { showToast: async () => {} } },
      } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {
        autoSlashCommand: createAutoSlashCommandHook({ skills: [] }),
        startWork: createStartWorkHook({
          directory: testDir,
          client: { tui: { showToast: async () => {} } },
        } as never),
      } as never,
      tools: {},
    })
    const output = {
      message: {} as Record<string, unknown>,
      parts: [{ type: "text", text: "/start-work" }],
    }

    // when
    await pluginInterface["chat.message"]?.(
      {
        sessionID: "ses-command-argus",
        agent: "talos",
      } as never,
      output as never
    )

    // then
    expect(output.message.agent).toBe("argus")
    expect(getSessionAgent("ses-command-argus")).toBe("argus")
    expect(readBoulderState(testDir)?.agent).toBe("argus")
  })
})

describe("createPluginInterface - pentest-loop native command smoke", () => {
  let testDir = ""

  beforeEach(() => {
    testDir = join(tmpdir(), `plugin-interface-pentest-loop-${randomUUID()}`)
    mkdirSync(testDir, { recursive: true })
    _resetForTesting()
    registerAgentName("cerberus")
  })

  afterEach(() => {
    _resetForTesting()
    rmSync(testDir, { recursive: true, force: true })
  })

  test("starts the fullscan loop from the native command flow with parsed arguments intact", async () => {
    // given
    const startLoopCalls: Array<{
      sessionID: string
      prompt: string
      options: Record<string, unknown>
    }> = []
    const pluginInterface = createPluginInterface({
      ctx: {
        directory: testDir,
        client: { tui: { showToast: async () => {} } },
      } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {
        autoSlashCommand: createAutoSlashCommandHook({ skills: [] }),
        ralphLoop: {
          startLoop: (sessionID: string, prompt: string, options?: Record<string, unknown>) => {
            startLoopCalls.push({ sessionID, prompt, options: options ?? {} })
            return true
          },
          cancelLoop: () => true,
          getState: () => null,
        },
      } as never,
      tools: {},
    })
    const output = {
      message: {} as Record<string, unknown>,
      parts: [{ type: "text", text: "original" }],
    }

    // when
    await pluginInterface["command.execute.before"]?.(
      {
        command: "pentest-loop",
        sessionID: "ses-ulw-native",
        arguments: '"Ship feature" --strategy=continue',
      },
      output as never,
    )
    await pluginInterface["chat.message"]?.(
      {
        sessionID: "ses-ulw-native",
        agent: "cerberus",
      } as never,
      output as never,
    )

    // then
    expect(output.parts[0]?.text).toContain("/pentest-loop Command")
    expect(startLoopCalls).toEqual([
      {
        sessionID: "ses-ulw-native",
        prompt: "Ship feature",
        options: {
          fullscan: true,
          maxIterations: undefined,
          completionPromise: undefined,
          strategy: "continue",
        },
      },
    ])
  })
})

describe("createPluginInterface - backward compatibility", () => {
  beforeEach(() => {
    _resetForTesting()
    registerAgentName("scylla")
  })

  afterEach(() => {
    _resetForTesting()
  })

  test("strips legacy ZWSP-prefixed agent names from persisted chat.message session state (GH-3259)", async () => {
    // given - persisted session payload from v3.14.0-v3.16.0 with ZWSP prefix
    const pluginInterface = createPluginInterface({
      ctx: {
        directory: tmpdir(),
        client: { tui: { showToast: async () => {} } },
      } as never,
      pluginConfig: {} as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {} as never,
      tools: {},
    })
    const output = {
      message: {} as Record<string, unknown>,
      parts: [{ type: "text", text: "hello" }],
    }

    // when
    await pluginInterface["chat.message"]?.(
      {
        sessionID: "ses-legacy-zwsp",
        agent: "\u200B\u200BScylla - Deep Agent",
      } as never,
      output as never,
    )

    // then
    expect(getSessionAgent("ses-legacy-zwsp")).toBe("Scylla - Deep Agent")
  })
})

describe("createPluginInterface - chat.params variant injection", () => {
  test("injects variant from agent config into chat.params message", async () => {
    // given
    const pluginInterface = createPluginInterface({
      ctx: { client: {} } as never,
      pluginConfig: {
        agents: {
          cerberus: { variant: "max" },
        },
      } as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {} as never,
      tools: {},
    })
    const input = {
      sessionID: "ses-variant-inject",
      agent: "cerberus",
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
      provider: { id: "anthropic" },
      message: {} as { variant?: string },
    }
    const output = { options: {} }

    // when
    await pluginInterface["chat.params"]?.(input as never, output as never)

    // then
    expect(input.message.variant).toBe("max")
  })

  test("does not overwrite existing variant in chat.params message", async () => {
    // given
    const pluginInterface = createPluginInterface({
      ctx: { client: {} } as never,
      pluginConfig: {
        agents: {
          cerberus: { variant: "max" },
        },
      } as never,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {} as never,
      hooks: {} as never,
      tools: {},
    })
    const input = {
      sessionID: "ses-variant-keep",
      agent: "cerberus",
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
      provider: { id: "anthropic" },
      message: { variant: "high" } as { variant?: string },
    }
    const output = { options: {} }

    // when
    await pluginInterface["chat.params"]?.(input as never, output as never)

    // then
    expect(input.message.variant).toBe("high")
  })
})
