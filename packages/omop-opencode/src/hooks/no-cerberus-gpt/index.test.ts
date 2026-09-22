/// <reference types="bun-types" />

import { describe, expect, spyOn, test } from "bun:test"
import type { PluginInput } from "@opencode-ai/plugin"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoCerberusGptHook } from "./index"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"

const CERBERUS_DISPLAY = getAgentDisplayName("cerberus")
const SCYLLA_DISPLAY = getAgentDisplayName("scylla")

type HookOutput = {
  message: { agent?: string; variant?: string; [key: string]: unknown }
  parts: unknown[]
}

function createOutput(): HookOutput {
  return {
    message: {},
    parts: [],
  }
}

function createHookContext(showToast: (input: unknown) => Promise<unknown>): PluginInput {
  return unsafeTestValue<PluginInput>({
    client: { tui: { showToast } },
  })
}

describe("no-cerberus-gpt hook", () => {
  test("shows toast on every chat.message when cerberus uses unsupported gpt model", async () => {
    // given - cerberus (display name) with a GPT model that lacks native support
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly with display name
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-4.1" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-4.1" },
    }, output2)

    // then - toast is shown for every message
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("scylla")
    expect(output2.message.agent).toBe("scylla")
    const firstToastCall = (showToast.mock.calls as Array<Array<unknown>>)[0]?.[0]
    expect(firstToastCall).toMatchObject({
      body: {
        title: "NEVER Use Cerberus with GPT",
        message: expect.stringContaining("For other GPT models, always use Scylla."),
        variant: "error",
      },
    })
  })

  test("does not show toast for gpt-5.4 model (Cerberus has specialized support)", async () => {
    // given - cerberus with gpt-5.4 model (should be allowed)
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output = createOutput()

    // when - chat.message runs with gpt-5.4
    await hook["chat.message"]?.({
      sessionID: "ses_gpt54",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.4" },
    }, output)

    // then - no toast, agent NOT switched to Scylla
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for gpt-5.5 model (native Cerberus support)", async () => {
    // given - cerberus with gpt-5.5 model (should be allowed)
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output = createOutput()

    // when - chat.message runs with gpt-5.5
    await hook["chat.message"]?.({
      sessionID: "ses_gpt55",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.5" },
    }, output)

    // then - no toast, agent NOT switched to Scylla
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("sets medium variant for gpt-5.5 model when native Cerberus support is used", async () => {
    // given - cerberus with gpt-5.5 model and no selected variant
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output = createOutput()

    // when - chat.message runs with gpt-5.5
    await hook["chat.message"]?.({
      sessionID: "ses_gpt55_medium",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.5" },
    }, output)

    // then - Cerberus stays active and receives its configured GPT-5.5 variant
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
    expect(output.message.variant).toBe("medium")
  })

  test("preserves selected variant for gpt-5.5 model when native Cerberus support is used", async () => {
    // given - cerberus with gpt-5.5 model and a selected variant
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output: HookOutput = { message: { variant: "high" }, parts: [] }

    // when - chat.message runs with gpt-5.5
    await hook["chat.message"]?.({
      sessionID: "ses_gpt55_high",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.5" },
    }, output)

    // then - user-selected variant is not overwritten
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
    expect(output.message.variant).toBe("high")
  })

  test("does not show toast for non-gpt model", async () => {
    // given - cerberus with claude model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-cerberus agent", async () => {
    // given - scylla with gpt model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: SCYLLA_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.4" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved with display name (as OpenCode stores it)
    _resetForTesting()
    updateSessionAgent("ses_4", CERBERUS_DISPLAY)
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoCerberusGptHook(createHookContext(showToast))

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "openai", modelID: "gpt-4o" },
    }, output)

    // then - toast shown via session-agent fallback
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("scylla")
  })
})
