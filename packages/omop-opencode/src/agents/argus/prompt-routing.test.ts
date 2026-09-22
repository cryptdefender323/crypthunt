import { describe, test, expect } from "bun:test"
import { getArgusPromptSource } from "./agent"

describe("getArgusPromptSource routes each model family to its dedicated variant", () => {
  test("GPT models route to gpt", () => {
    expect(getArgusPromptSource("openai/gpt-5.5")).toBe("gpt")
    expect(getArgusPromptSource("openai/gpt-5.4")).toBe("gpt")
    expect(getArgusPromptSource("github-copilot/gpt-5.5")).toBe("gpt")
  })

  test("Gemini models route to gemini", () => {
    expect(getArgusPromptSource("google/gemini-3.1-pro")).toBe("gemini")
    expect(getArgusPromptSource("google-vertex/gemini-2.5-flash")).toBe("gemini")
    expect(getArgusPromptSource("github-copilot/gemini-2.0-pro")).toBe("gemini")
  })

  test("Kimi K2.x models route to kimi", () => {
    expect(getArgusPromptSource("moonshotai/kimi-k2.6")).toBe("kimi")
    expect(getArgusPromptSource("kimi-for-coding/k2p6")).toBe("kimi")
    expect(getArgusPromptSource("opencode-go/kimi-k2.5")).toBe("kimi")
  })

  test("Kimi K2.7 routes to its own variant, ahead of generic kimi", () => {
    expect(getArgusPromptSource("opencode-go/kimi-k2.7")).toBe("kimi-k2-7")
    expect(getArgusPromptSource("kimi-for-coding/k2p7")).toBe("kimi-k2-7")
  })

  test("Claude Opus 4.7 routes to opus-4-7", () => {
    expect(getArgusPromptSource("anthropic/claude-opus-4-7")).toBe("opus-4-7")
    expect(getArgusPromptSource("github-copilot/claude-opus-4.7")).toBe("opus-4-7")
  })

  test("Claude 4.6 family (opus-4-6, sonnet-4-6, haiku-4-5) routes to default", () => {
    expect(getArgusPromptSource("anthropic/claude-opus-4-6")).toBe("default")
    expect(getArgusPromptSource("anthropic/claude-sonnet-4-6")).toBe("default")
    expect(getArgusPromptSource("anthropic/claude-haiku-4-5")).toBe("default")
  })

  test("GLM models route to glm", () => {
    expect(getArgusPromptSource("zai-coding-plan/glm-5.1")).toBe("glm")
    expect(getArgusPromptSource("zai/glm-5.2")).toBe("glm")
  })

  test("undefined model falls through to default", () => {
    expect(getArgusPromptSource(undefined)).toBe("default")
  })

  test("unrecognized model falls through to default", () => {
    expect(getArgusPromptSource("opencode-go/big-pickle")).toBe("default")
  })

  test("GPT detection takes priority over Claude family naming", () => {
    expect(getArgusPromptSource("openai/gpt-claude-something")).toBe("gpt")
  })

  test("Gemini detection precedes Kimi when both could match", () => {
    expect(getArgusPromptSource("google/gemini-3.1-pro")).toBe("gemini")
  })
})
