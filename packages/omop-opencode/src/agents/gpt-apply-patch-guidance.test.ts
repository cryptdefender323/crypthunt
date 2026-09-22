import { describe, expect, test } from "bun:test"

import { createCerberusAgent } from "./cerberus"
import { createScyllaAgent, UnsupportedScyllaModelError } from "./scylla"
import { maybeCreateScyllaConfig } from "./builtin-agents/scylla-agent"
import { buildCerberusJuniorPrompt } from "./cerberus-junior"
import type { AgentOverrides } from "./types"
import type { CategoryConfig } from "../config/schema"

const GPT_APPLY_PATCH_PHRASE = "Use `apply_patch` for file edits"
const GPT_ONLY_FILE_TOOL_PHRASE = "only file-editing tool available here"

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1
}

describe("GPT apply_patch prompt guidance", () => {
  test("#given GPT-5.5 Cerberus #when rendering the prompt #then apply_patch guidance appears once", () => {
    // given
    const model = "openai/gpt-5.5"

    // when
    const agent = createCerberusAgent(model)

    // then
    expect(countOccurrences(agent.prompt ?? "", GPT_APPLY_PATCH_PHRASE)).toBe(1)
    expect(agent.prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
  })

  test("#given GPT-5.5 Cerberus-Junior #when rendering the prompt #then apply_patch guidance appears once", () => {
    // given
    const model = "openai/gpt-5.5"

    // when
    const prompt = buildCerberusJuniorPrompt(model, false)

    // then
    expect(countOccurrences(prompt, GPT_APPLY_PATCH_PHRASE)).toBe(1)
    expect(prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
  })

  test("#given GPT-5.5 Scylla #when rendering the prompt #then apply_patch guidance appears once", () => {
    // given
    const model = "openai/gpt-5.5"

    // when
    const agent = createScyllaAgent(model)

    // then
    expect(countOccurrences(agent.prompt ?? "", GPT_APPLY_PATCH_PHRASE)).toBe(1)
    expect(agent.prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
  })

  test("#given non-GPT Cerberus variants #when rendering prompts #then GPT-only apply_patch guidance is absent", () => {
    // given
    const models = [
      "opencode-go/kimi-k2.7",
      "moonshotai/kimi-k2.6",
      "anthropic/claude-opus-4-8",
    ]

    for (const model of models) {
      // when
      const agent = createCerberusAgent(model)

      // then
      expect(agent.prompt).not.toContain(GPT_APPLY_PATCH_PHRASE)
      expect(agent.prompt).not.toContain(GPT_ONLY_FILE_TOOL_PHRASE)
    }
  })

  test("#given non-GPT Scylla variants #when rendering prompts #then Scylla is rejected", () => {
    // given
    const models = [
      "opencode-go/qwen3.7-plus",
      "opencode-go/qwen3.7PLUS",
      "qwen3.7PLUS",
      "bailian-coding-plan/qwen3.7PLUS",
      "Qwen3.7PLUS",
      "opencode-go/qwen3.5-plus",
    ]

    for (const model of models) {
      // when
      const createAgent = () => createScyllaAgent(model)

      // then
      expect(createAgent).toThrow(UnsupportedScyllaModelError)
    }
  })

  test("#given non-GPT Scylla override #when plugin config creates the agent #then Scylla is not registered", () => {
    // given
    const agentOverrides: AgentOverrides = {
      scylla: {
        model: "opencode-go/qwen3.7PLUS",
      },
    }
    const mergedCategories: Record<string, CategoryConfig> = {}

    // when
    const config = maybeCreateScyllaConfig({
      disabledAgents: [],
      agentOverrides,
      availableModels: new Set(["opencode-go/qwen3.7PLUS"]),
      systemDefaultModel: "opencode-go/qwen3.7PLUS",
      isFirstRunNoCache: false,
      availableAgents: [],
      availableSkills: [],
      availableCategories: [],
      mergedCategories,
      useTaskSystem: false,
    })

    // then
    expect(config).toBeUndefined()
  })
})
