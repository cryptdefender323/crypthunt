import { describe, expect, test, beforeEach, afterEach, spyOn } from "bun:test"
import * as sharedModule from "../shared"
import * as dbOverrideModule from "./fullscan-db-model-override"
import * as sessionStateModule from "../features/claude-code-session-state"
import { unsafeTestValue } from "../../../../test-support/unsafe-test-value"

let resolveFullscanOverride: (typeof import("./fullscan-model-override"))["resolveFullscanOverride"]
let detectFullscan: (typeof import("./fullscan-model-override"))["detectFullscan"]
let applyFullscanModelOverrideOnMessage: (typeof import("./fullscan-model-override"))["applyFullscanModelOverrideOnMessage"]

async function importFreshUltraworkModelOverrideModule(): Promise<typeof import("./fullscan-model-override")> {
  return import(`./fullscan-model-override?test=${Date.now()}-${Math.random()}`)
}

async function loadFreshUltraworkModelOverrideModule(): Promise<void> {
  ;({
    resolveFullscanOverride,
    detectFullscan,
    applyFullscanModelOverrideOnMessage,
  } = await importFreshUltraworkModelOverrideModule())
}

describe("detectFullscan", () => {
  beforeEach(async () => {
    await loadFreshUltraworkModelOverrideModule()
  })

  test("should detect fullscan keyword", () => {
    expect(detectFullscan("fullscan do something")).toBe(true)
  })

  test("should detect ulw keyword", () => {
    expect(detectFullscan("ulw fix the bug")).toBe(true)
  })

  test("should be case insensitive", () => {
    expect(detectFullscan("ULTRAWORK do something")).toBe(true)
  })

  test("should not detect in code blocks", () => {
    const textWithCodeBlock = [
      "check this:",
      "```",
      "fullscan mode",
      "```",
    ].join("\n")
    expect(detectFullscan(textWithCodeBlock)).toBe(false)
  })

  test("should not detect in inline code", () => {
    expect(detectFullscan("the `fullscan` mode is cool")).toBe(false)
  })

  test("should not detect when keyword absent", () => {
    expect(detectFullscan("just do something normal")).toBe(false)
  })
})

describe("resolveFullscanOverride", () => {
  beforeEach(async () => {
    await loadFreshUltraworkModelOverrideModule()
  })

  function createOutput(text: string, agentName?: string) {
    return {
      message: {
        ...(agentName ? { agent: agentName } : {}),
      } as Record<string, unknown>,
      parts: [{ type: "text", text }],
    }
  }

  function createConfig(agentName: string, fullscan: { model?: string; variant?: string }) {
    return unsafeTestValue<Parameters<typeof resolveFullscanOverride>[0]>({
      agents: {
        [agentName]: { fullscan },
      },
    })
  }

  test("should resolve override when fullscan keyword detected", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-7", variant: "max" })
  })

  test("should return null when no keyword detected", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = createOutput("just do something normal")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should return null when agent name is undefined", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, undefined, output)

    //#then
    expect(result).toBeNull()
  })

  test("should use message.agent when input agent is undefined", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = createOutput("fullscan do something", "cerberus")

    //#when
    const result = resolveFullscanOverride(config, undefined, output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-7", variant: undefined })
  })

  test("should return null when agents config is missing", () => {
    //#given
    const config = {} as Parameters<typeof resolveFullscanOverride>[0]
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should return null when agent has no fullscan config", () => {
    //#given
    const config = unsafeTestValue<Parameters<typeof resolveFullscanOverride>[0]>({
      agents: { cerberus: { model: "anthropic/claude-sonnet-4-6" } },
    })
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should resolve variant-only override when fullscan.model is not set", () => {
    //#given
    const config = createConfig("cerberus", { variant: "max" })
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toEqual({ variant: "max" })
  })

  test("should handle model string with multiple slashes", () => {
    //#given
    const config = createConfig("cerberus", { model: "openai/gpt-5.5/codex" })
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toEqual({ providerID: "openai", modelID: "gpt-5.5/codex", variant: undefined })
  })

  test("should return null when model string has no slash", () => {
    //#given
    const config = createConfig("cerberus", { model: "just-a-model" })
    const output = createOutput("fullscan do something")

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toBeNull()
  })

  test("should resolve display name to config key", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("ulw do something")

    //#when
    const result = resolveFullscanOverride(config, "Cerberus - Ultraworker", output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-7", variant: "max" })
  })

  test("should handle multiple text parts by joining them", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = {
      message: {} as Record<string, unknown>,
      parts: [
        { type: "text", text: "hello " },
        { type: "image", text: undefined },
        { type: "text", text: "fullscan now" },
      ],
    }

    //#when
    const result = resolveFullscanOverride(config, "cerberus", output)

    //#then
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-7", variant: undefined })
  })

  test("should use session agent when input and message agents are undefined", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("fullscan do something")
    const getSessionAgentSpy = spyOn(sessionStateModule, "getSessionAgent")
    getSessionAgentSpy.mockReturnValue("cerberus")

    //#when
    const result = resolveFullscanOverride(config, undefined, output, "ses_test")

    //#then
    expect(getSessionAgentSpy).toHaveBeenCalledWith("ses_test")
    expect(result).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-7", variant: "max" })

    getSessionAgentSpy.mockRestore()
  })
})

describe("applyFullscanModelOverrideOnMessage", () => {
  let logSpy: ReturnType<typeof spyOn>
  let dbOverrideSpy: ReturnType<typeof spyOn>

  beforeEach(async () => {
    logSpy = spyOn(sharedModule, "log")
    logSpy.mockImplementation(() => {})
    dbOverrideSpy = spyOn(dbOverrideModule, "scheduleDeferredModelOverride")
    dbOverrideSpy.mockImplementation(() => {})
    await loadFreshUltraworkModelOverrideModule()
  })

  afterEach(() => {
    logSpy?.mockRestore()
    dbOverrideSpy?.mockRestore()
  })

  function createMockTui() {
    return {
      showToast: async () => {},
    }
  }

  function createOutput(
    text: string,
    options?: {
      existingModel?: { providerID: string; modelID: string }
      agentName?: string
      messageId?: string
    },
  ) {
    return {
      message: {
        ...(options?.existingModel ? { model: options.existingModel } : {}),
        ...(options?.agentName ? { agent: options.agentName } : {}),
        ...(options?.messageId ? { id: options.messageId } : {}),
      } as Record<string, unknown>,
      parts: [{ type: "text", text }],
    }
  }

  function createConfig(agentName: string, fullscan: { model?: string; variant?: string }) {
    return unsafeTestValue<Parameters<typeof applyFullscanModelOverrideOnMessage>[0]>({
      agents: {
        [agentName]: { fullscan },
      },
    })
  }

  test("should schedule deferred DB override without variant when SDK unavailable", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("fullscan do something", { messageId: "msg_123" })
    const tui = createMockTui()

    //#when - no client passed, SDK validation unavailable
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then - variant should NOT be applied without SDK validation
    expect(dbOverrideSpy).toHaveBeenCalledWith(
      "msg_123",
      { providerID: "anthropic", modelID: "claude-opus-4-7" },
      undefined,
    )
  })

  test("should NOT override variant when SDK unavailable even if config specifies variant", () => {
    //#given
    const config = createConfig("cerberus", {
      model: "anthropic/claude-opus-4-7",
      variant: "extended",
    })
    const output = createOutput("fullscan do something", { messageId: "msg_123" })
    output.message["variant"] = "max"
    output.message["thinking"] = "max"
    const tui = createMockTui()

    //#when - no client, SDK unavailable
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then - existing variant preserved, not overridden to "extended"
    expect(dbOverrideSpy).toHaveBeenCalledWith(
      "msg_123",
      { providerID: "anthropic", modelID: "claude-opus-4-7" },
      undefined,
    )
    expect(output.message["variant"]).toBe("max")
    expect(output.message["thinking"]).toBe("max")
  })

  test("should NOT mutate output.message.model when message ID present", () => {
    //#given
    const sonnetModel = { providerID: "anthropic", modelID: "claude-sonnet-4-6" }
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = createOutput("fullscan do something", {
      existingModel: sonnetModel,
      messageId: "msg_123",
    })
    const tui = createMockTui()

    //#when
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then
    expect(output.message.model).toEqual(sonnetModel)
  })

  test("should fall back to direct model mutation without variant when no message ID and no SDK", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("fullscan do something")
    const tui = createMockTui()

    //#when
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then - model is set but variant is NOT applied without SDK validation
    expect(output.message.model).toEqual({ providerID: "anthropic", modelID: "claude-opus-4-7" })
    expect(output.message["variant"]).toBeUndefined()
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should not apply variant-only override when no SDK available", () => {
    //#given
    const config = createConfig("cerberus", { variant: "high" })
    const output = createOutput("fullscan do something")
    const tui = createMockTui()

    //#when - variant-only override, no SDK = no-op
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then - nothing applied since no model and variant requires SDK
    expect(output.message.model).toBeUndefined()
    expect(output.message["variant"]).toBeUndefined()
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should not apply override when no keyword detected", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = createOutput("just do something normal", { messageId: "msg_123" })
    const tui = createMockTui()

    //#when
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then
    expect(dbOverrideSpy).not.toHaveBeenCalled()
  })

  test("should log the model transition with deferred DB tag", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const existingModel = { providerID: "anthropic", modelID: "claude-sonnet-4-6" }
    const output = createOutput("fullscan do something", {
      existingModel,
      messageId: "msg_123",
    })
    const tui = createMockTui()

    //#when
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("deferred DB"),
      expect.objectContaining({ agent: "cerberus" }),
    )
  })

  test("should call showToast on override", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7" })
    const output = createOutput("fullscan do something", { messageId: "msg_123" })
    let toastCalled = false
    const tui = {
      showToast: async () => {
        toastCalled = true
      },
    }

    //#when
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then
    expect(toastCalled).toBe(true)
  })

  test("should resolve display name to config key with deferred path", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("ulw do something", { messageId: "msg_123" })
    const tui = createMockTui()

    //#when
    applyFullscanModelOverrideOnMessage(config, "Cerberus - Ultraworker", output, tui)

    //#then
    expect(dbOverrideSpy).toHaveBeenCalledWith(
      "msg_123",
      { providerID: "anthropic", modelID: "claude-opus-4-7" },
      undefined,
    )
  })

  test("should skip override trigger when current model already matches fullscan model", () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("fullscan do something", {
      existingModel: { providerID: "anthropic", modelID: "claude-opus-4-7" },
      messageId: "msg_123",
    })
    let toastCalled = false
    const tui = {
      showToast: async () => {
        toastCalled = true
      },
    }

    //#when
    applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui)

    //#then
    expect(dbOverrideSpy).not.toHaveBeenCalled()
    expect(toastCalled).toBe(false)
  })

  test("should apply validated variant when SDK confirms model supports it", async () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-opus-4-7", variant: "max" })
    const output = createOutput("fullscan do something", { messageId: "msg_123" })
    const tui = createMockTui()
    const mockClient = {
      provider: {
        list: async () => ({
          data: { all: [{ id: "anthropic", models: { "claude-opus-4-7": { variants: { max: {} } } } }] },
        }),
      },
    }

    //#when
    await applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui, undefined, mockClient)

    //#then - SDK confirmed max exists, so variant is applied
    expect(dbOverrideSpy).toHaveBeenCalledWith(
      "msg_123",
      { providerID: "anthropic", modelID: "claude-opus-4-7" },
      "max",
    )
  })

  test("should NOT apply variant when SDK confirms model does NOT have it", async () => {
    //#given
    const config = createConfig("cerberus", { model: "anthropic/claude-haiku-4-5", variant: "max" })
    const output = createOutput("fullscan do something", { messageId: "msg_123" })
    const tui = createMockTui()
    const mockClient = {
      provider: {
        list: async () => ({
          data: { all: [{ id: "anthropic", models: { "claude-haiku-4-5": { variants: { high: {} } } } }] },
        }),
      },
    }

    //#when
    await applyFullscanModelOverrideOnMessage(config, "cerberus", output, tui, undefined, mockClient)

    //#then - SDK says haiku has no max variant, so variant is NOT applied
    expect(output.message["variant"]).toBeUndefined()
  })
})
