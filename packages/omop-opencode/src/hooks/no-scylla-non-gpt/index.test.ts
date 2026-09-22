/// <reference types="bun-types" />

import { describe, expect, spyOn, test } from "bun:test"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoScyllaNonGptHook } from "./index"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"

const SCYLLA_DISPLAY = getAgentDisplayName("scylla")
const CERBERUS_DISPLAY = getAgentDisplayName("cerberus")

function createOutput() {
  return {
    message: {} as { agent?: string; [key: string]: unknown },
    parts: [],
  }
}

describe("no-scylla-non-gpt hook", () => {
  test("shows toast on every chat.message when scylla uses non-gpt model", async () => {
    // given - scylla with claude model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoScyllaNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: SCYLLA_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: SCYLLA_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output2)

    // then - toast is shown and agent is switched to cerberus
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("cerberus")
    expect(output2.message.agent).toBe("cerberus")
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Scylla with Non-GPT",
        message: expect.stringContaining("Scylla is trash without GPT."),
        variant: "error",
      },
    })
  })

  test("shows warning and does not switch agent when allow_non_gpt_model is enabled", async () => {
    // given - scylla with claude model and opt-out enabled
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoScyllaNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }), {
      allowNonGptModel: true,
    })

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_opt_out",
      agent: SCYLLA_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - warning toast is shown but agent is not switched
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBeUndefined()
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Scylla with Non-GPT",
        variant: "warning",
      },
    })
  })

  test("does not show toast when scylla uses gpt model", async () => {
    // given - scylla with gpt model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoScyllaNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: SCYLLA_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.5" },
    }, output)

    // then - no toast, agent unchanged
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-scylla agent", async () => {
    // given - cerberus with claude model (non-gpt)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoScyllaNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: CERBERUS_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved as scylla
    _resetForTesting()
    updateSessionAgent("ses_4", SCYLLA_DISPLAY)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoScyllaNonGptHook(unsafeTestValue({
      client: { tui: { showToast } },
    }))

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "anthropic", modelID: "claude-opus-4-7" },
    }, output)

    // then - toast shown via session-agent fallback, switched to cerberus
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("cerberus")
  })
})
