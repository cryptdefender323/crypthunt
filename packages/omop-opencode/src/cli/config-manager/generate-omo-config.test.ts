/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import { generateOmoConfig } from "../config-manager"
import type { InstallConfig } from "../types"

describe("generateOmoConfig - model fallback system", () => {
  test("uses github-copilot sonnet fallback when only copilot available", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: false,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: true,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect([
      "github-copilot/claude-opus-4.7",
      "github-copilot/claude-opus-4-7",
    ]).toContain((result.agents as Record<string, { model: string }>).cerberus.model)
  })

  test("uses ultimate fallback when no providers configured", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: false,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect(result.$schema).toBe("https://raw.githubusercontent.com/cryptdefender323/crypthunter/dev/assets/crypthunter.schema.json")
    expect((result.agents as Record<string, { model: string }>).cerberus).toBeUndefined()
  })

  test("uses Claude fallback for intel when Z.ai is available with Claude", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: true,
      isMax20: true,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: true,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string }>).intel.model).toBe("anthropic/claude-haiku-4-5")
    expect(JSON.stringify(result)).not.toContain("zai-coding-plan/glm-4.7")
    expect((result.agents as Record<string, { model: string }>).cerberus.model).toBe("anthropic/claude-opus-4-7")
  })

  test("uses native OpenAI models when only ChatGPT available", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: false,
      isMax20: false,
      hasOpenAI: true,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string; variant?: string }>).cerberus.model).toBe("openai/gpt-5.5")
    expect((result.agents as Record<string, { model: string; variant?: string }>).cerberus.variant).toBe("medium")
    expect((result.agents as Record<string, { model: string }>).cipher.model).toBe("openai/gpt-5.5")
    expect((result.agents as Record<string, { model: string }>)['lens'].model).toBe("openai/gpt-5.5")
  })

  test("adds fallback_models when multiple providers are available", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: true,
      isMax20: false,
      hasOpenAI: true,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)
    const agents = result.agents as Record<string, {
      model: string
      variant?: string
      fallback_models?: Array<{ model: string; variant?: string }>
    }>
    const categories = result.categories as Record<string, {
      model: string
      variant?: string
      fallback_models?: Array<{ model: string; variant?: string }>
    }>

    //#then
    expect(agents.cerberus.model).toBe("anthropic/claude-opus-4-7")
    expect(agents.cerberus.fallback_models).toEqual([
      {
        model: "openai/gpt-5.5",
        variant: "medium",
      },
    ])
    expect(categories.deep.model).toBe("openai/gpt-5.5")
    expect(categories.deep.fallback_models).toEqual([
      {
        model: "anthropic/claude-opus-4-7",
        variant: "max",
      },
    ])
  })

  test("uses haiku for scout when Claude max20", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: true,
      isMax20: true,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string }>).scout.model).toBe("anthropic/claude-haiku-4-5")
  })

  test("uses haiku for scout regardless of max20 flag", () => {
    //#given
    const config: InstallConfig = {
      platform: "opencode",
      hasOpenCode: true,
      hasCodex: false,
      hasHermes: false,
      codexAutonomous: false,
      hasClaude: true,
      isMax20: false,
      hasOpenAI: false,
      hasGemini: false,
      hasCopilot: false,
      hasOpencodeZen: false,
      hasZaiCodingPlan: false,
      hasKimiForCoding: false,
      hasOpencodeGo: false,
      hasBailianCodingPlan: false,
      hasVercelAiGateway: false,
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect((result.agents as Record<string, { model: string }>).scout.model).toBe("anthropic/claude-haiku-4-5")
  })
})

describe("generateOmoConfig - OpenClaw", () => {
  const baseConfig: InstallConfig = {
    platform: "opencode",
    hasOpenCode: true,
    hasCodex: false,
    hasHermes: false,
    codexAutonomous: false,
    hasClaude: false,
    isMax20: false,
    hasOpenAI: false,
    hasGemini: false,
    hasCopilot: false,
    hasOpencodeZen: false,
    hasZaiCodingPlan: false,
    hasKimiForCoding: false,
    hasOpencodeGo: false,
    hasBailianCodingPlan: false,
    hasVercelAiGateway: false,
    hasOpenClaw: false,
  }

  test("omits the openclaw key when OpenClaw was not enabled", () => {
    //#given
    const config: InstallConfig = { ...baseConfig, hasOpenClaw: false }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect(result.openclaw).toBeUndefined()
  })

  test("writes an enabled openclaw block without a gateway when none was configured", () => {
    //#given
    const config: InstallConfig = { ...baseConfig, hasOpenClaw: true }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect(result.openclaw).toEqual({ enabled: true })
  })

  test("writes the default HTTP gateway when configured", () => {
    //#given
    const config: InstallConfig = {
      ...baseConfig,
      hasOpenClaw: true,
      openClawGateway: { type: "http", url: "https://example.com/hook" },
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect(result.openclaw).toEqual({
      enabled: true,
      gateways: { default: { type: "http", url: "https://example.com/hook" } },
    })
  })

  test("writes the default command gateway when configured", () => {
    //#given
    const config: InstallConfig = {
      ...baseConfig,
      hasOpenClaw: true,
      openClawGateway: { type: "command", command: "notify-send hi" },
    }

    //#when
    const result = generateOmoConfig(config)

    //#then
    expect(result.openclaw).toEqual({
      enabled: true,
      gateways: { default: { type: "command", command: "notify-send hi" } },
    })
  })
})
