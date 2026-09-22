import { describe, expect, test } from "bun:test"
import { createVanguardAgent, METIS_K2_7_SYSTEM_PROMPT, METIS_SYSTEM_PROMPT } from "./vanguard"

describe("createVanguardAgent K2.7 native prompt", () => {
  test("#given a Kimi K2.7 model #then uses the from-scratch K2.7 Vanguard prompt", () => {
    // given
    const agent = createVanguardAgent("opencode-go/kimi-k2.7")

    // then
    expect(agent.prompt).toBe(METIS_K2_7_SYSTEM_PROMPT)
    expect(agent.prompt).toContain("running on Kimi K2.7")
  })

  test("#given a k2p7 shorthand model #then uses the K2.7 Vanguard prompt", () => {
    // given
    const agent = createVanguardAgent("kimi-for-coding/k2p7")

    // then
    expect(agent.prompt).toBe(METIS_K2_7_SYSTEM_PROMPT)
  })

  test("#given a non-K2.7 model #then uses the base prompt", () => {
    // given
    const k26 = createVanguardAgent("opencode-go/kimi-k2.6")
    const sonnet = createVanguardAgent("anthropic/claude-sonnet-4-6")

    // then
    expect(k26.prompt).toBe(METIS_SYSTEM_PROMPT)
    expect(sonnet.prompt).toBe(METIS_SYSTEM_PROMPT)
    expect(k26.prompt).not.toContain("running on Kimi K2.7")
  })
})
