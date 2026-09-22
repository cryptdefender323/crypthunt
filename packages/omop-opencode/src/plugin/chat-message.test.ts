import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unsafeTestValue } from "../../../../test-support/unsafe-test-value"
import type { OhMyOpenCodeConfig } from "../config"
import { readBoulderState } from "../features/boulder-state"
import { _resetForTesting, getSessionAgent, registerAgentName, setMainSession, subagentSessions, updateSessionAgent } from "../features/claude-code-session-state"
import { createAutoSlashCommandHook } from "../hooks/auto-slash-command"
import { createKeywordDetectorHook } from "../hooks/keyword-detector"
import { createStartWorkHook } from "../hooks/start-work"
import { getAgentListDisplayName } from "../shared/agent-display-names"
import { getOmopOpenCodeCacheDir, getOpenCodeCacheDir } from "../shared/data-path"
import { OMOP_INTERNAL_INITIATOR_MARKER } from "../shared/internal-initiator-marker"
import { clearSessionModel, getSessionModel, setSessionModel } from "../shared/session-model-state"
import { createChatMessageHandler } from "./chat-message"
import type { PluginContext } from "./types"

type ChatMessagePart = { type: string; text?: string; [key: string]: unknown }
type ChatMessageHandlerOutput = { message: Record<string, unknown>; parts: ChatMessagePart[] }
type ChatMessageHandlerArgs = Parameters<typeof createChatMessageHandler>[0]
type MockHandlerArgs = ChatMessageHandlerArgs & { readonly _appliedSessions: string[] }

function createStartWorkTemplateOutput(): ChatMessageHandlerOutput {
  return {
    message: {},
    parts: [
      {
        type: "text",
        text: `<session-context>context</session-context>\nYou are starting a Cerberus work session.`,
      },
    ],
  }
}

function createStopContinuationGuardMock(isStopped: boolean) {
  const clearCalls: string[] = []
  const isStoppedCalls: string[] = []

  return {
    guard: {
      "chat.message": async () => {},
      stop: () => {},
      isStopped: (sessionID: string) => {
        isStoppedCalls.push(sessionID)
        return isStopped
      },
      clear: (sessionID: string) => {
        clearCalls.push(sessionID)
      },
    },
    clearCalls,
    isStoppedCalls,
  }
}

function createMockHandlerArgs(overrides?: {
  pluginConfig?: Record<string, unknown>
  shouldOverride?: boolean
}): MockHandlerArgs {
  const appliedSessions: string[] = []
  return {
    ctx: unsafeTestValue<PluginContext>({
      client: { tui: { showToast: async () => {} } },
    }),
    pluginConfig: unsafeTestValue<OhMyOpenCodeConfig>((overrides?.pluginConfig ?? {})),
    firstMessageVariantGate: {
      shouldOverride: () => overrides?.shouldOverride ?? false,
      markApplied: (sessionID: string) => { appliedSessions.push(sessionID) },
    },
    hooks: unsafeTestValue<ChatMessageHandlerArgs["hooks"]>({
      stopContinuationGuard: null,
      backgroundNotificationHook: null,
      keywordDetector: null,
      claudeCodeHooks: null,
      autoSlashCommand: null,
      startWork: null,
      ralphLoop: null,
    }),
    _appliedSessions: appliedSessions,
  }
}

afterEach(() => {
  _resetForTesting()
  clearSessionModel("test-session")
  clearSessionModel("main-session")
  clearSessionModel("subagent-session")
})

describe("createChatMessageHandler - synthetic/internal messages", () => {
  test("skips synthetic-only user messages before session state and hooks mutate", async () => {
    // given
    const hookCalls: string[] = []
    const args = createMockHandlerArgs({ shouldOverride: true })
    args.hooks.keywordDetector = {
      "chat.message": async () => {
        hookCalls.push("keywordDetector")
      },
    }
    const handler = createChatMessageHandler(args)
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "synthetic prompt", synthetic: true }],
    }

    // when
    await handler(createMockInput("cerberus"), output)

    // then
    expect(args._appliedSessions).toEqual([])
    expect(hookCalls).toEqual([])
    expect(getSessionAgent("test-session")).toBeUndefined()
  })

  test("skips internally marked user messages before first-message gate is consumed", async () => {
    // given
    const hookCalls: string[] = []
    const args = createMockHandlerArgs({ shouldOverride: true })
    args.hooks.autoSlashCommand = {
      "chat.message": async () => {
        hookCalls.push("autoSlashCommand")
      },
    }
    const handler = createChatMessageHandler(args)
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: `/commit\n${OMOP_INTERNAL_INITIATOR_MARKER}` }],
    }

    // when
    await handler(createMockInput("cerberus"), output)

    // then
    expect(args._appliedSessions).toEqual([])
    expect(hookCalls).toEqual([])
    expect(getSessionAgent("test-session")).toBeUndefined()
  })
})

describe("createChatMessageHandler - first message hook ordering", () => {
  test("updates session agent and marks the first-message gate before chat hooks run", async () => {
    // given
    const hookObservations: Array<{
      readonly hook: string
      readonly agent: string | undefined
      readonly appliedSessions: readonly string[]
    }> = []
    const args = createMockHandlerArgs({ shouldOverride: true })
    args.hooks.stopContinuationGuard = {
      "chat.message": async (input: { sessionID: string }) => {
        hookObservations.push({
          hook: "stopContinuationGuard",
          agent: getSessionAgent(input.sessionID),
          appliedSessions: [...args._appliedSessions],
        })
      },
      stop: () => {},
      isStopped: () => false,
      clear: () => {},
    }
    args.hooks.keywordDetector = {
      "chat.message": async (input: { sessionID: string }) => {
        hookObservations.push({
          hook: "keywordDetector",
          agent: getSessionAgent(input.sessionID),
          appliedSessions: [...args._appliedSessions],
        })
      },
    }
    const handler = createChatMessageHandler(args)

    // when
    await handler(createMockInput("cerberus"), {
      message: {},
      parts: [{ type: "text", text: "ship it" }],
    })

    // then
    expect(hookObservations).toEqual([
      {
        hook: "stopContinuationGuard",
        agent: "cerberus",
        appliedSessions: ["test-session"],
      },
      {
        hook: "keywordDetector",
        agent: "cerberus",
        appliedSessions: ["test-session"],
      },
    ])
  })

  test("skips model fallback when runtime fallback is enabled", async () => {
    // given
    const hookCalls: string[] = []
    const args = createMockHandlerArgs({
      pluginConfig: { runtime_fallback: { enabled: true } },
    })
    args.hooks.modelFallback = {
      "chat.message": async () => {
        hookCalls.push("modelFallback")
      },
    }
    args.hooks.runtimeFallback = {
      "chat.message": async () => {
        hookCalls.push("runtimeFallback")
      },
    }
    const handler = createChatMessageHandler(args)

    // when
    await handler(createMockInput("cerberus"), {
      message: {},
      parts: [{ type: "text", text: "hello" }],
    })

    // then
    expect(hookCalls).toEqual(["runtimeFallback"])
  })
})

describe("createChatMessageHandler - cache warning behavior", () => {
  let cacheRoot = ""
  let originalXdgCacheHome: string | undefined

  beforeEach(() => {
    cacheRoot = join(tmpdir(), `chat-message-cache-${randomUUID()}`)
    originalXdgCacheHome = process.env.XDG_CACHE_HOME
    process.env.XDG_CACHE_HOME = cacheRoot
  })

  afterEach(() => {
    if (originalXdgCacheHome === undefined) {
      delete process.env.XDG_CACHE_HOME
    } else {
      process.env.XDG_CACHE_HOME = originalXdgCacheHome
    }

    if (existsSync(cacheRoot)) {
      rmSync(cacheRoot, { recursive: true, force: true })
    }
  })

  test("does not show provider cache warning when provider-models cache exists", async () => {
    // given
    const toastCalls: Array<{ body: { title: string; message: string } }> = []
    const providerModelsCachePath = join(getOmopOpenCodeCacheDir(), "provider-models.json")
    mkdirSync(getOmopOpenCodeCacheDir(), { recursive: true })
    writeFileSync(providerModelsCachePath, JSON.stringify({
      models: {
        openai: [{ id: "gpt-5.4" }],
      },
      connected: ["openai"],
      updatedAt: new Date().toISOString(),
    }))

    const args = createMockHandlerArgs()
    args.ctx = {
      client: {
        tui: {
          showToast: async (input: { body: { title: string; message: string } }) => {
            toastCalls.push(input)
          },
        },
      },
    } as never
    const handler = createChatMessageHandler(args)

    // when
    await handler(createMockInput("cerberus"), createMockOutput())

    // then
    expect(toastCalls).toHaveLength(0)
  })

  test("does not show provider cache warning when OpenCode models cache exists", async () => {
    // given
    const toastCalls: Array<{ body: { title: string; message: string } }> = []
    const modelsCachePath = join(getOpenCodeCacheDir(), "models.json")
    mkdirSync(getOpenCodeCacheDir(), { recursive: true })
    writeFileSync(modelsCachePath, JSON.stringify({
      openai: {
        id: "openai",
        models: {
          "gpt-5.4": { id: "gpt-5.4" },
        },
      },
    }))

    const args = createMockHandlerArgs()
    args.ctx = {
      client: {
        tui: {
          showToast: async (input: { body: { title: string; message: string } }) => {
            toastCalls.push(input)
          },
        },
      },
    } as never
    const handler = createChatMessageHandler(args)

    // when
    await handler(createMockInput("cerberus"), createMockOutput())

    // then
    expect(toastCalls).toHaveLength(0)
  })
})

describe("createChatMessageHandler - /start-work integration", () => {
  let testDir = ""
  let originalWorkingDirectory = ""

  beforeEach(() => {
    testDir = join(tmpdir(), `chat-message-start-work-${randomUUID()}`)
    originalWorkingDirectory = process.cwd()
    mkdirSync(join(testDir, ".omop", "plans"), { recursive: true })
    writeFileSync(join(testDir, ".omop", "plans", "worker-plan.md"), "# Plan\n- [ ] Task 1")
    process.chdir(testDir)
    _resetForTesting()
    registerAgentName("talos")
    registerAgentName("cerberus")
  })

  afterEach(() => {
    process.chdir(originalWorkingDirectory)
    rmSync(testDir, { recursive: true, force: true })
  })

  test("falls back to Cerberus through the full chat.message slash-command path when Argus is unavailable", async () => {
    // given
    updateSessionAgent("test-session", "talos")
    const args = createMockHandlerArgs()
    args.hooks.autoSlashCommand = createAutoSlashCommandHook({ skills: [] })
    args.hooks.startWork = createStartWorkHook({
      directory: testDir,
      client: { tui: { showToast: async () => {} } },
    } as never)
    const handler = createChatMessageHandler(args)
    const input = createMockInput("talos")
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "/start-work" }],
    }

    // when
    await handler(input, output)

    // then
    expect(output.message["agent"]).toBe("cerberus")
    expect(output.parts[0].text).toContain("<auto-slash-command>")
    expect(output.parts[0].text).toContain("Auto-Selected Plan")
    expect(output.parts[0].text).toContain("boulder.json has been created")
    expect(getSessionAgent("test-session")).toBe("cerberus")
    expect(readBoulderState(testDir)?.agent).toBe("cerberus")
  })

  test("smoke: resolves quoted human-readable plan names through the full /start-work chat.message path", async () => {
    // given
    writeFileSync(join(testDir, ".omop", "plans", "my-feature-plan.md"), "# Plan\n- [ ] Task 1")
    updateSessionAgent("test-session", "talos")
    const args = createMockHandlerArgs()
    args.hooks.autoSlashCommand = createAutoSlashCommandHook({ skills: [] })
    args.hooks.startWork = createStartWorkHook({
      directory: testDir,
      client: { tui: { showToast: async () => {} } },
    } as never)
    const handler = createChatMessageHandler(args)
    const input = createMockInput("talos")
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "/start-work \"my feature plan\"" }],
    }

    // when
    await handler(input, output)

    // then
    expect(output.message["agent"]).toBe("cerberus")
    expect(output.parts[0].text).toContain("<auto-slash-command>")
    expect(output.parts[0].text).toContain("Auto-Selected Plan")
    expect(output.parts[0].text).toContain("my-feature-plan")
    expect(readBoulderState(testDir)?.plan_name).toBe("my-feature-plan")
  })
})

describe("createChatMessageHandler - stop continuation clearing for raw slash fallback", () => {
  test("clears stop state before raw /start-work resumes work through chat.message", async () => {
    // given
    const stopContinuationGuard = createStopContinuationGuardMock(true)
    const startWorkCalls: string[] = []
    const args = createMockHandlerArgs()
    args.hooks.stopContinuationGuard = stopContinuationGuard.guard
    args.hooks.startWork = {
      "chat.message": async (input: { sessionID: string }) => {
        startWorkCalls.push(input.sessionID)
      },
    }
    const handler = createChatMessageHandler(args)
    const output = createStartWorkTemplateOutput()

    // when
    await handler(createMockInput("cerberus"), output)

    // then
    expect(startWorkCalls).toEqual(["test-session"])
    expect(stopContinuationGuard.isStoppedCalls).toEqual(["test-session"])
    expect(stopContinuationGuard.clearCalls).toEqual(["test-session"])
  })

  test("clears stop state before raw /pentest-loop resumes work through chat.message", async () => {
    // given
    const stopContinuationGuard = createStopContinuationGuardMock(true)
    const startLoopCalls: Array<{ sessionID: string; prompt: string; fullscan: boolean }> = []
    const args = createMockHandlerArgs()
    args.hooks.stopContinuationGuard = stopContinuationGuard.guard
    args.hooks.ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: { fullscan?: boolean }) => {
        startLoopCalls.push({ sessionID, prompt, fullscan: options?.fullscan === true })
        return true
      },
      cancelLoop: () => true,
    }
    const handler = createChatMessageHandler(args)
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "/pentest-loop ship it" }],
    }

    // when
    await handler(createMockInput("cerberus"), output)

    // then
    expect(startLoopCalls).toEqual([
      { sessionID: "test-session", prompt: "ship it", fullscan: true },
    ])
    expect(stopContinuationGuard.isStoppedCalls).toEqual(["test-session"])
    expect(stopContinuationGuard.clearCalls).toEqual(["test-session"])
  })

  test("clears stop state before raw /pentest-loop resumes work through chat.message", async () => {
    // given
    const stopContinuationGuard = createStopContinuationGuardMock(true)
    const startLoopCalls: Array<{ sessionID: string; prompt: string; fullscan: boolean }> = []
    const args = createMockHandlerArgs()
    args.hooks.stopContinuationGuard = stopContinuationGuard.guard
    args.hooks.ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: { fullscan?: boolean }) => {
        startLoopCalls.push({ sessionID, prompt, fullscan: options?.fullscan === true })
        return true
      },
      cancelLoop: () => true,
    }
    const handler = createChatMessageHandler(args)
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "/pentest-loop keep going" }],
    }

    // when
    await handler(createMockInput("cerberus"), output)

    // then
    expect(startLoopCalls).toEqual([
      { sessionID: "test-session", prompt: "keep going", fullscan: true },
    ])
    expect(stopContinuationGuard.isStoppedCalls).toEqual(["test-session"])
    expect(stopContinuationGuard.clearCalls).toEqual(["test-session"])
  })

  test("does not clear stop state for ordinary stopped chat messages", async () => {
    // given
    const stopContinuationGuard = createStopContinuationGuardMock(true)
    const startWorkCalls: string[] = []
    const args = createMockHandlerArgs()
    args.hooks.stopContinuationGuard = stopContinuationGuard.guard
    args.hooks.startWork = {
      "chat.message": async (input: { sessionID: string }) => {
        startWorkCalls.push(input.sessionID)
      },
    }
    const handler = createChatMessageHandler(args)

    // when
    await handler(createMockInput("cerberus"), {
      message: {},
      parts: [{ type: "text", text: "continue helping with this bug" }],
    })

    // then
    expect(startWorkCalls).toEqual(["test-session"])
    expect(stopContinuationGuard.isStoppedCalls).toHaveLength(0)
    expect(stopContinuationGuard.clearCalls).toHaveLength(0)
  })

  test("does not clear stop state when the session was not stopped", async () => {
    // given
    const stopContinuationGuard = createStopContinuationGuardMock(false)
    const startWorkCalls: string[] = []
    const startLoopCalls: Array<{ sessionID: string; prompt: string; fullscan: boolean }> = []
    const args = createMockHandlerArgs()
    args.hooks.stopContinuationGuard = stopContinuationGuard.guard
    args.hooks.startWork = {
      "chat.message": async (input: { sessionID: string }) => {
        startWorkCalls.push(input.sessionID)
      },
    }
    args.hooks.ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: { fullscan?: boolean }) => {
        startLoopCalls.push({ sessionID, prompt, fullscan: options?.fullscan === true })
        return true
      },
      cancelLoop: () => true,
    }
    const handler = createChatMessageHandler(args)

    // when
    await handler(createMockInput("cerberus"), {
      message: {},
      parts: createStartWorkTemplateOutput().parts,
    })
    await handler(createMockInput("cerberus"), {
      message: {},
      parts: [{ type: "text", text: "/pentest-loop continue" }],
    })
    await handler(createMockInput("cerberus"), {
      message: {},
      parts: [{ type: "text", text: "/pentest-loop continue" }],
    })

    // then
    expect(startWorkCalls).toEqual([
      "test-session",
      "test-session",
      "test-session",
    ])
    expect(startLoopCalls).toEqual([
      { sessionID: "test-session", prompt: "continue", fullscan: true },
      { sessionID: "test-session", prompt: "continue", fullscan: true },
    ])
    expect(stopContinuationGuard.isStoppedCalls).toEqual([
      "test-session",
      "test-session",
      "test-session",
    ])
    expect(stopContinuationGuard.clearCalls).toHaveLength(0)
  })
})

describe("createChatMessageHandler - /pentest-loop raw slash fallback", () => {
  test("starts fullscan loop when /pentest-loop arrives through chat.message without native command expansion", async () => {
    // given
    const startLoopCalls: Array<{
      sessionID: string
      prompt: string
      options: Record<string, unknown>
    }> = []
    const args = createMockHandlerArgs()
    args.hooks.autoSlashCommand = createAutoSlashCommandHook({ skills: [] })
    args.hooks.ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: Record<string, unknown>) => {
        startLoopCalls.push({ sessionID, prompt, options: options ?? {} })
        return true
      },
      cancelLoop: () => true,
    }
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: '/pentest-loop "Ship feature" --strategy=continue' }],
    }

    // when
    await handler(input, output)

    // then
    expect(startLoopCalls).toEqual([
      {
        sessionID: "test-session",
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

  test("#given active fullscan loop state #when raw /pentest-loop continue arrives #then resumes without replacing original prompt", async () => {
    // given
    const startLoopCalls: Array<{
      sessionID: string
      prompt: string
      options: Record<string, unknown>
    }> = []
    const resumeLoopCalls: Array<{ sessionID: string }> = []
    const args = createMockHandlerArgs()
    args.hooks.autoSlashCommand = createAutoSlashCommandHook({ skills: [] })
    args.hooks.ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: Record<string, unknown>) => {
        startLoopCalls.push({ sessionID, prompt, options: options ?? {} })
        return true
      },
      resumeLoop: (sessionID: string) => {
        resumeLoopCalls.push({ sessionID })
        return true
      },
      cancelLoop: () => true,
    }
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "/pentest-loop continue" }],
    }

    // when
    await handler(input, output)

    // then
    expect(resumeLoopCalls).toEqual([{ sessionID: "test-session" }])
    expect(startLoopCalls).toHaveLength(0)
  })

  test("starts fullscan loop when injected messages appear before the raw /pentest-loop command", async () => {
    // given
    const startLoopCalls: Array<{
      sessionID: string
      prompt: string
      options: Record<string, unknown>
    }> = []
    const args = createMockHandlerArgs()
    args.hooks.ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: Record<string, unknown>) => {
        startLoopCalls.push({ sessionID, prompt, options: options ?? {} })
        return true
      },
      cancelLoop: () => true,
    }
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [
        {
          type: "text",
          text: "[BACKGROUND TASK COMPLETED]\nPlan finished.\n\n---\n\n/pentest-loop \"Ship feature\" --strategy=continue",
        },
      ],
    }

    // when
    await handler(input, output)

    // then
    expect(startLoopCalls).toEqual([
      {
        sessionID: "test-session",
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

describe("createChatMessageHandler - plain fullscan keyword routing", () => {
  test("does not start pentest loop when plain ulw text flows through the full chat.message pipeline", async () => {
    // given
    setMainSession("test-session")
    const startLoopCalls: Array<{
      sessionID: string
      prompt: string
      options: Record<string, unknown>
    }> = []
    const ralphLoop = {
      startLoop: (sessionID: string, prompt: string, options?: Record<string, unknown>) => {
        startLoopCalls.push({ sessionID, prompt, options: options ?? {} })
        return true
      },
      cancelLoop: () => true,
    }
    const args = createMockHandlerArgs()
    args.hooks.ralphLoop = ralphLoop
    args.hooks.keywordDetector = createKeywordDetectorHook(args.ctx as never, undefined, ralphLoop)
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output: ChatMessageHandlerOutput = {
      message: {},
      parts: [{ type: "text", text: "ulw fix the flaky keyword tests" }],
    }

    // when
    await handler(input, output)

    // then
    expect(startLoopCalls).toHaveLength(0)
    expect(output.parts[0]?.text).toContain("ULTRAWORK MODE ENABLED!")
    expect(output.parts[0]?.text).toContain("ulw fix the flaky keyword tests")
  })
})

function createMockInput(agent?: string, model?: { providerID: string; modelID: string }) {
  return {
    sessionID: "test-session",
    agent,
    model,
  }
}

function createMockOutput(variant?: string): ChatMessageHandlerOutput {
  const message: Record<string, unknown> = {}
  if (variant !== undefined) {
    message["variant"] = variant
  }
  return { message, parts: [] }
}

describe("createChatMessageHandler - TUI variant passthrough", () => {
  test("first message: does not override TUI variant when user has no selection", async () => {
    //#given - first message, no user-selected variant
    const args = createMockHandlerArgs({ shouldOverride: true })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("scylla", { providerID: "openai", modelID: "gpt-5.5" })
    const output = createMockOutput() // no variant set

    //#when
    await handler(input, output)

    //#then - TUI sent undefined, should stay undefined (no config override)
    expect(output.message["variant"]).toBeUndefined()
  })

  test("first message: preserves user-selected variant when already set", async () => {
    //#given - first message, user already selected "xhigh" variant in OpenCode UI
    const args = createMockHandlerArgs({ shouldOverride: true })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("scylla", { providerID: "openai", modelID: "gpt-5.5" })
    const output = createMockOutput("xhigh") // user selected xhigh

    //#when
    await handler(input, output)

    //#then - user's xhigh must be preserved
    expect(output.message["variant"]).toBe("xhigh")
  })

  test("subsequent message: preserves TUI variant", async () => {
    //#given - not first message, variant already set
    const args = createMockHandlerArgs({ shouldOverride: false })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("scylla", { providerID: "openai", modelID: "gpt-5.5" })
    const output = createMockOutput("xhigh")

    //#when
    await handler(input, output)

    //#then
    expect(output.message["variant"]).toBe("xhigh")
  })

  test("subsequent message: does not inject variant when TUI sends none", async () => {
    //#given - not first message, no variant from TUI
    const args = createMockHandlerArgs({ shouldOverride: false })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("scylla", { providerID: "openai", modelID: "gpt-5.5" })
    const output = createMockOutput() // no variant

    //#when
    await handler(input, output)

    //#then - should stay undefined, not auto-resolved from config
    expect(output.message["variant"]).toBeUndefined()
  })

  test("first message: marks gate as applied regardless of variant presence", async () => {
    //#given - first message with user-selected variant
    const args = createMockHandlerArgs({ shouldOverride: true })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("scylla", { providerID: "openai", modelID: "gpt-5.5" })
    const output = createMockOutput("xhigh")

    //#when
    await handler(input, output)

    //#then - gate should still be marked as applied
    expect(args._appliedSessions).toContain("test-session")
  })

  test("injects queued background notifications through chat.message hook", async () => {
    //#given
    const args = createMockHandlerArgs()
    args.hooks.backgroundNotificationHook = {
      "chat.message": async (
        _input: { sessionID: string },
        output: ChatMessageHandlerOutput,
      ): Promise<void> => {
        output.parts.push({
          type: "text",
          text: "<system-reminder>[BACKGROUND TASK COMPLETED]</system-reminder>",
        })
      },
    }
    const handler = createChatMessageHandler(args)
    const input = createMockInput("scylla", { providerID: "openai", modelID: "gpt-5.5" })
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.parts).toHaveLength(1)
    expect(output.parts[0].text).toContain("[BACKGROUND TASK COMPLETED]")
  })

  test("reuses the stored model for subsequent messages in the main session when the UI sends none", async () => {
    //#given
    setMainSession("test-session")
    setSessionModel("test-session", { providerID: "openai", modelID: "gpt-5.4" })
    const args = createMockHandlerArgs({ shouldOverride: false })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.message["model"]).toEqual({ providerID: "openai", modelID: "gpt-5.4" })
    expect(getSessionModel("test-session")).toEqual({ providerID: "openai", modelID: "gpt-5.4" })
  })

  test("does not reuse a stored model for the first message of a session", async () => {
    //#given
    setMainSession("test-session")
    setSessionModel("test-session", { providerID: "openai", modelID: "gpt-5.4" })
    const args = createMockHandlerArgs({ shouldOverride: true })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.message["model"]).toBeUndefined()
  })

  test("does not reuse the main-session model for subagent sessions", async () => {
    //#given
    setMainSession("main-session")
    setSessionModel("main-session", { providerID: "openai", modelID: "gpt-5.4" })
    subagentSessions.add("subagent-session")
    const args = createMockHandlerArgs({ shouldOverride: false })
    const handler = createChatMessageHandler(args)
    const input = {
      sessionID: "subagent-session",
      agent: "cipher",
    }
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.message["model"]).toBeUndefined()
    expect(getSessionModel("subagent-session")).toBeUndefined()
  })

  test("does not override explicit agent model overrides with stored session model", async () => {
    //#given
    setMainSession("test-session")
    setSessionModel("test-session", { providerID: "openai", modelID: "gpt-5.4" })
    const args = createMockHandlerArgs({
      shouldOverride: false,
      pluginConfig: {
        agents: {
          cerberus: { model: "anthropic/claude-opus-4-7" },
        },
      },
    })
    const handler = createChatMessageHandler(args)
    const input = createMockInput("cerberus")
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.message["model"]).toBeUndefined()
    expect(getSessionModel("test-session")).toEqual({ providerID: "openai", modelID: "gpt-5.4" })
  })

  test("treats prefixed list-display agent names as explicit model overrides", async () => {
    //#given
    setMainSession("test-session")
    setSessionModel("test-session", { providerID: "openai", modelID: "gpt-5.4" })
    const args = createMockHandlerArgs({
      shouldOverride: false,
      pluginConfig: {
        agents: {
          talos: { model: "anthropic/claude-opus-4-7" },
        },
      },
    })
    const handler = createChatMessageHandler(args)
    const input = createMockInput(getAgentListDisplayName("talos"))
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.message["model"]).toBeUndefined()
    expect(getSessionModel("test-session")).toEqual({ providerID: "openai", modelID: "gpt-5.4" })
    expect(getSessionAgent("test-session")).toBe("Talos - Plan Builder")
  })

  test("respects a mid-conversation model switch instead of reusing the previous stored model", async () => {
    //#given
    setMainSession("test-session")
    setSessionModel("test-session", { providerID: "anthropic", modelID: "claude-opus-4-7" })
    const args = createMockHandlerArgs({ shouldOverride: false })
    const handler = createChatMessageHandler(args)
    const nextModel = { providerID: "openai", modelID: "gpt-5.4" }
    const input = createMockInput("cerberus", nextModel)
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(output.message["model"]).toBeUndefined()
    expect(getSessionModel("test-session")).toEqual(nextModel)
  })

  test("strips legacy ZWSP-prefixed agent names from persisted prompt body session state (GH-3259)", async () => {
    //#given - persisted prompt body from v3.14.0-v3.16.0 may contain ZWSP-prefixed agent
    const args = createMockHandlerArgs()
    const handler = createChatMessageHandler(args)
    const input = createMockInput("\u200B\u200BScylla - Deep Agent")
    const output = createMockOutput()

    //#when
    await handler(input, output)

    //#then
    expect(getSessionAgent("test-session")).toBe("Scylla - Deep Agent")
  })
})
