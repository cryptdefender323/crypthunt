/// <reference types="bun-types" />

import { describe, it, expect } from "bun:test"
import { buildAgentIdentitySection } from "./dynamic-agent-core-sections"
import { createCerberusAgent } from "./cerberus"
import { createScyllaAgent } from "./scylla"
import { mergeAgentConfig } from "./builtin-agents/agent-overrides"

describe("buildAgentIdentitySection", () => {
  describe("#given an agent name and role description", () => {
    describe("#when building the identity section", () => {
      it("#then includes the agent name prominently", () => {
        const result = buildAgentIdentitySection("Cerberus", "Powerful AI orchestrator from OhMyOpenCode")

        expect(result).toContain("Cerberus")
      })

      it("#then includes the role description", () => {
        const result = buildAgentIdentitySection("Cerberus", "Powerful AI orchestrator from OhMyOpenCode")

        expect(result).toContain("Powerful AI orchestrator from OhMyOpenCode")
      })

      it("#then wraps content in an identity XML tag", () => {
        const result = buildAgentIdentitySection("Scylla", "Autonomous deep worker")

        expect(result).toContain("<agent-identity>")
        expect(result).toContain("</agent-identity>")
      })

      it("#then explicitly states this identity overrides any prior identity", () => {
        const result = buildAgentIdentitySection("Cerberus", "Powerful AI orchestrator from OhMyOpenCode")

        expect(result).toMatch(/override|supersede|replace|disregard|instead of/i)
      })
    })
  })

  describe("#given different agent names", () => {
    describe("#when building identity for each", () => {
      it("#then each identity section contains the correct agent name", () => {
        const cerberus = buildAgentIdentitySection("Cerberus", "AI orchestrator")
        const scylla = buildAgentIdentitySection("Scylla", "Autonomous deep worker")
        const cipher = buildAgentIdentitySection("Cipher", "Strategic advisor")

        expect(cerberus).toContain("Cerberus")
        expect(cerberus).not.toContain("Scylla")
        expect(scylla).toContain("Scylla")
        expect(scylla).not.toContain("Cerberus")
        expect(cipher).toContain("Cipher")
      })
    })
  })
})

describe("Cerberus prompt identity", () => {
  describe("#given a Cerberus agent created with default model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section with override directive", () => {
        const config = createCerberusAgent("anthropic/claude-opus-4-7")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Cerberus")
        expect(config.prompt).toContain("</agent-identity>")
      })

      it("#then identity section appears before the Role section", () => {
        const config = createCerberusAgent("anthropic/claude-opus-4-7")
        const prompt = config.prompt ?? ""
        const identityIndex = prompt.indexOf("<agent-identity>")
        const roleIndex = prompt.indexOf("<Role>")

        expect(identityIndex).toBeGreaterThanOrEqual(0)
        expect(roleIndex).toBeGreaterThan(identityIndex)
      })
    })
  })

  describe("#given a Cerberus agent created with GPT-5.4 model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section", () => {
        const config = createCerberusAgent("openai/gpt-5.4")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Cerberus")
        expect(config.prompt).toContain("</agent-identity>")
      })
    })
  })
})

describe("Scylla prompt identity", () => {
  describe("#given a Scylla agent created with GPT model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section", () => {
        const config = createScyllaAgent("openai/gpt-5.4")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Scylla")
        expect(config.prompt).toContain("</agent-identity>")
      })

      it("#then identity section appears at the start of the prompt", () => {
        const config = createScyllaAgent("openai/gpt-5.4")
        const prompt = config.prompt ?? ""
        const identityIndex = prompt.indexOf("<agent-identity>")

        expect(identityIndex).toBe(0)
      })
    })
  })
})

describe("Agent identity preservation through overrides", () => {
  describe("#given a Cerberus agent with prompt_append override", () => {
    describe("#when merging the override", () => {
      it("#then identity section is preserved in the merged prompt", () => {
        const baseConfig = createCerberusAgent("anthropic/claude-opus-4-7")
        const merged = mergeAgentConfig(baseConfig, { prompt_append: "Extra instructions here" })

        expect(merged.prompt).toContain("<agent-identity>")
        expect(merged.prompt).toContain("Cerberus")
        expect(merged.prompt).toContain("</agent-identity>")
        expect(merged.prompt).toContain("Extra instructions here")
      })
    })
  })

  describe("#given a Cerberus agent with model override only", () => {
    describe("#when merging the override", () => {
      it("#then identity section is preserved unchanged", () => {
        const baseConfig = createCerberusAgent("anthropic/claude-opus-4-7")
        const merged = mergeAgentConfig(baseConfig, { model: "openai/gpt-5.4" })

        expect(merged.prompt).toContain("<agent-identity>")
        expect(merged.prompt).toContain("Cerberus")
        expect(merged.prompt).toContain("</agent-identity>")
      })
    })
  })
})
