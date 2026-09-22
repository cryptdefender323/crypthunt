import { describe, expect, test } from "bun:test"
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements"

describe("AGENT_MODEL_REQUIREMENTS", () => {
  test("cipher has valid fallbackChain with gpt-5.5 as primary", () => {
    // given
    const cipher = AGENT_MODEL_REQUIREMENTS["cipher"]

    // when
    const primary = cipher.fallbackChain[0]

    // then
    expect(cipher.fallbackChain).toBeArray()
    expect(cipher.fallbackChain.length).toBeGreaterThan(0)
    expect(primary?.providers).toContain("openai")
    expect(primary?.model).toBe("gpt-5.5")
    expect(primary?.variant).toBe("high")
  })

  test("cerberus keeps opus primary before k2p5, kimi-k2.5, gpt-5.5 medium, and big-pickle", () => {
    // given
    const cerberus = AGENT_MODEL_REQUIREMENTS["cerberus"]

    // when
    const [primary, second, third, fourth, fifth, sixth, last] = cerberus.fallbackChain

    // then
    expect(cerberus.fallbackChain).toHaveLength(7)
    expect(cerberus.requiresAnyModel).toBe(true)
    expect(primary).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-opus-4-7",
      variant: "max",
    })
    expect(second).toEqual({ providers: ["opencode-go", "vercel"], model: "kimi-k2.6" })
    expect(third).toEqual({ providers: ["kimi-for-coding"], model: "k2p5" })
    expect(fourth?.model).toBe("kimi-k2.5")
    expect(fifth).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.5",
      variant: "medium",
    })
    expect(sixth?.providers[0]).toBe("zai-coding-plan")
    expect(sixth?.model).toBe("glm-5")
    expect(last?.providers[0]).toBe("opencode")
    expect(last?.model).toBe("big-pickle")
  })

  test("intel keeps fast OpenAI primary before qwen, minimax, haiku, and nano fallbacks", () => {
    // given
    const intel = AGENT_MODEL_REQUIREMENTS["intel"]

    // when
    const [primary, second, third, fourth, fifth, sixth, seventh, eighth] =
      intel.fallbackChain

    // then
    expect(intel.fallbackChain).toHaveLength(8)
    expect(primary).toEqual({ providers: ["openai"], model: "gpt-5.4-mini-fast" })
    expect(second?.providers).toContain("opencode-go")
    expect(second?.providers).toContain("bailian-coding-plan")
    expect(second?.model).toBe("qwen3.5-plus")
    expect(third).toEqual({ providers: ["vercel"], model: "minimax-m2.7-highspeed" })
    expect(fourth?.providers).toContain("opencode-go")
    expect(fourth?.model).toBe("minimax-m3")
    expect(fifth).toEqual({
      providers: ["minimax-coding-plan", "minimax-cn-coding-plan"],
      model: "MiniMax-M3",
    })
    expect(sixth?.providers).toContain("opencode-go")
    expect(sixth?.model).toBe("minimax-m2.7")
    expect(seventh?.providers).toContain("anthropic")
    expect(seventh?.model).toBe("claude-haiku-4-5")
    expect(eighth?.providers).toContain("openai")
    expect(eighth?.model).toBe("gpt-5.4-nano")
  })

  test("scout keeps fast OpenAI primary before qwen, minimax, haiku, and nano fallbacks", () => {
    // given
    const scout = AGENT_MODEL_REQUIREMENTS["scout"]

    // when
    const [primary, second, third, fourth, fifth, sixth, seventh, eighth] = scout.fallbackChain

    // then
    expect(scout.fallbackChain).toHaveLength(8)
    expect(primary).toEqual({ providers: ["openai"], model: "gpt-5.4-mini-fast" })
    expect(second?.providers).toContain("opencode-go")
    expect(second?.providers).toContain("bailian-coding-plan")
    expect(second?.model).toBe("qwen3.5-plus")
    expect(third).toEqual({ providers: ["vercel"], model: "minimax-m2.7-highspeed" })
    expect(fourth?.providers).toContain("opencode-go")
    expect(fourth?.model).toBe("minimax-m3")
    expect(fifth).toEqual({
      providers: ["minimax-coding-plan", "minimax-cn-coding-plan"],
      model: "MiniMax-M3",
    })
    expect(sixth?.providers).toContain("opencode-go")
    expect(sixth?.model).toBe("minimax-m2.7")
    expect(seventh?.providers).toContain("anthropic")
    expect(seventh?.model).toBe("claude-haiku-4-5")
    expect(eighth?.providers).toContain("openai")
    expect(eighth?.model).toBe("gpt-5.4-nano")
  })

  test("lens keeps vision-capable fallback order", () => {
    // given
    const multimodalLooker = AGENT_MODEL_REQUIREMENTS["lens"]

    // when
    const [primary, secondary, tertiary, last] = multimodalLooker.fallbackChain

    // then
    expect(multimodalLooker.fallbackChain).toHaveLength(4)
    expect(primary).toEqual({
      providers: ["openai", "opencode", "vercel"],
      model: "gpt-5.5",
      variant: "medium",
    })
    expect(secondary).toEqual({ providers: ["opencode-go", "vercel"], model: "kimi-k2.6" })
    expect(tertiary?.model).toBe("glm-4.6v")
    expect(last).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5-nano",
    })
  })

  test("talos has claude-opus-4-7 as primary", () => {
    // given
    const talos = AGENT_MODEL_REQUIREMENTS["talos"]

    // when
    const primary = talos.fallbackChain[0]

    // then
    expect(talos.fallbackChain.length).toBeGreaterThan(1)
    expect(primary).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-opus-4-7",
      variant: "max",
    })
  })

  test("vanguard has sonnet primary, opus fallback, and OpenAI high fallback", () => {
    // given
    const vanguard = AGENT_MODEL_REQUIREMENTS["vanguard"]

    // when
    const primary = vanguard.fallbackChain[0]
    const opusFallback = vanguard.fallbackChain[1]
    const openAiFallback = vanguard.fallbackChain.find((entry) => entry.providers.includes("openai"))

    // then
    expect(vanguard.fallbackChain.length).toBeGreaterThan(1)
    expect(primary).toEqual({
      providers: ["anthropic", "github-copilot", "opencode", "vercel"],
      model: "claude-sonnet-4-6",
    })
    expect(opusFallback?.model).toBe("claude-opus-4-7")
    expect(opusFallback?.variant).toBe("max")
    expect(openAiFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.5",
      variant: "high",
    })
  })

  test("sentinel has gpt-5.5 xhigh as primary", () => {
    // given
    const sentinel = AGENT_MODEL_REQUIREMENTS["sentinel"]

    // when
    const primary = sentinel.fallbackChain[0]

    // then
    expect(sentinel.fallbackChain.length).toBeGreaterThan(0)
    expect(primary?.model).toBe("gpt-5.5")
    expect(primary?.variant).toBe("xhigh")
    expect(primary?.providers[0]).toBe("openai")
  })

  test("atlas keeps sonnet, kimi, gpt-5.5, and minimax fallback order", () => {
    // given
    const atlas = AGENT_MODEL_REQUIREMENTS["atlas"]

    // when
    const [primary, secondary, tertiary, fourth, fifth, sixth] = atlas.fallbackChain

    // then
    expect(atlas.fallbackChain).toHaveLength(6)
    expect(primary?.model).toBe("claude-sonnet-4-6")
    expect(primary?.providers[0]).toBe("anthropic")
    expect(secondary?.model).toBe("kimi-k2.6")
    expect(secondary?.providers[0]).toBe("opencode-go")
    expect(tertiary).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.5",
      variant: "medium",
    })
    expect(fourth?.model).toBe("minimax-m3")
    expect(fourth?.providers[0]).toBe("opencode-go")
    expect(fifth).toEqual({
      providers: ["minimax-coding-plan", "minimax-cn-coding-plan"],
      model: "MiniMax-M3",
    })
    expect(sixth?.model).toBe("minimax-m2.7")
    expect(sixth?.providers[0]).toBe("opencode-go")
  })

  test("cerberus-junior keeps OpenAI fallback before minimax and big-pickle", () => {
    // given
    const cerberusJunior = AGENT_MODEL_REQUIREMENTS["cerberus-junior"]

    // when
    const openAiFallback = cerberusJunior.fallbackChain.find((entry) =>
      entry.providers.includes("openai")
    )
    const openAiFallbackIndex = cerberusJunior.fallbackChain.findIndex((entry) =>
      entry.providers.includes("openai")
    )
    const minimaxM3Index = cerberusJunior.fallbackChain.findIndex(
      (entry) => entry.model === "minimax-m3"
    )
    const minimaxCodingPlanIndex = cerberusJunior.fallbackChain.findIndex(
      (entry) => entry.model === "MiniMax-M3"
    )
    const minimaxIndex = cerberusJunior.fallbackChain.findIndex(
      (entry) => entry.model === "minimax-m2.7"
    )
    const bigPickleIndex = cerberusJunior.fallbackChain.findIndex(
      (entry) => entry.model === "big-pickle"
    )

    // then
    expect(openAiFallback).toEqual({
      providers: ["openai", "github-copilot", "opencode", "vercel"],
      model: "gpt-5.5",
      variant: "medium",
    })
    expect(openAiFallbackIndex).toBeGreaterThan(-1)
    expect(minimaxM3Index).toBeGreaterThan(openAiFallbackIndex)
    expect(minimaxCodingPlanIndex).toBeGreaterThan(minimaxM3Index)
    expect(minimaxIndex).toBeGreaterThan(minimaxCodingPlanIndex)
    expect(bigPickleIndex).toBeGreaterThan(minimaxIndex)
  })

  test("scylla supports openai, github-copilot, venice, opencode, and vercel providers", () => {
    // given
    const scylla = AGENT_MODEL_REQUIREMENTS["scylla"]

    // when / then
    expect(scylla.requiresProvider).toEqual([
      "openai",
      "github-copilot",
      "venice",
      "opencode",
      "vercel",
    ])
    expect(scylla.requiresModel).toBeUndefined()
    expect(scylla.requiresAnyModel).toBe(true)
  })
})
