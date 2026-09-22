/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import * as p from "@clack/prompts"
import { ULTIMATE_FALLBACK } from "./model-fallback"
import * as prompts from "./tui-install-prompts"
import type { DetectedConfig, InstallConfig, InstallPlatform } from "./types"

function createDetectedConfig(): DetectedConfig {
  return {
    isInstalled: false,
    installedVersion: null,
    hasClaude: false,
    isMax20: false,
    hasOpenAI: false,
    hasGemini: false,
    hasCopilot: false,
    hasCodex: false,
    hasOpencodeZen: false,
    hasZaiCodingPlan: false,
    hasKimiForCoding: false,
    hasOpencodeGo: false,
    hasBailianCodingPlan: false,
    hasMinimaxCnCodingPlan: false,
    hasMinimaxCodingPlan: false,
    hasVercelAiGateway: false,
  }
}

function withTty(): () => void {
  const originalIsStdinTty = process.stdin.isTTY
  const originalIsStdoutTty = process.stdout.isTTY
  Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: true })
  Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: true })
  return () => {
    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: originalIsStdinTty })
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: originalIsStdoutTty })
  }
}

describe("promptInstallPlatform", () => {
  let restoreTty: () => void

  beforeEach(() => {
    restoreTty = withTty()
  })

  afterEach(() => {
    restoreTty()
    mock.restore()
  })

  test("offers OpenCode, Codex, Hermes, and Both choices", async () => {
    // given
    const selectSpy = spyOn(p, "select").mockResolvedValue("opencode")

    // when
    const value = await prompts.promptInstallPlatform("opencode")

    // then
    expect(value).toBe("opencode")
    expect(selectSpy).toHaveBeenCalledTimes(1)
    expect(selectSpy.mock.calls[0]?.[0]).toMatchObject({
      initialValue: "opencode",
      options: [
        { value: "opencode" },
        { value: "codex" },
        { value: "hermes" },
        { value: "both" },
      ],
    })
  })

  test("preserves Codex as the initial platform", async () => {
    // given
    const selectSpy = spyOn(p, "select").mockResolvedValue("codex")

    // when
    const value = await prompts.promptInstallPlatform("codex")

    // then
    expect(value).toBe("codex")
    expect(selectSpy).toHaveBeenCalledTimes(1)
    expect(selectSpy.mock.calls[0]?.[0]).toMatchObject({
      initialValue: "codex",
      options: [
        { value: "opencode" },
        { value: "codex" },
        { value: "hermes" },
        { value: "both" },
      ],
    })
  })
})

describe("promptInstallConfig platform branching", () => {
  let restoreTty: () => void

  beforeEach(() => {
    restoreTty = withTty()
  })

  afterEach(() => {
    restoreTty()
    mock.restore()
  })

  test("skips OpenCode questions when the user selects codex", async () => {
    // given
    const selectSpy = spyOn(p, "select").mockResolvedValue("no")

    // when
    const config = await prompts.promptInstallConfig(createDetectedConfig(), "codex")

    // then
    expect(config).toMatchObject({
      platform: "codex",
      hasOpenCode: false,
      hasCodex: true,
      hasHermes: false,
      codexAutonomous: true,
    } satisfies Partial<InstallConfig>)
    expect(selectSpy).not.toHaveBeenCalled()
  })

  test.each([
    ["opencode", false],
    ["both", true],
  ] satisfies readonly [InstallPlatform, boolean][])(
    "asks OpenCode questions when the user selects %s",
    async (platform, hasCodex) => {
      // given
      const selectSpy = spyOn(p, "select").mockResolvedValue("no")

      // when
      const config = await prompts.promptInstallConfig(createDetectedConfig(), platform)

      // then
      expect(config).toMatchObject({ platform, hasOpenCode: true, hasCodex } satisfies Partial<InstallConfig>)
      expect(selectSpy).toHaveBeenCalledTimes(13)
    },
  )

  test("Claude subscription No option hint uses ultimate fallback", async () => {
    // given
    const selectSpy = spyOn(p, "select").mockResolvedValue("no")

    // when
    await prompts.promptInstallConfig(createDetectedConfig(), "opencode")

    // then
    const claudeCall = selectSpy.mock.calls[1]?.[0]
    expect(claudeCall?.message).toBe("Do you have a Claude Pro/Max subscription?")
    const options = claudeCall?.options as Array<{ value: string; hint?: string }>
    const noOption = options?.find((o) => o.value === "no")
    expect(noOption?.hint).toContain(ULTIMATE_FALLBACK)
    expect(noOption?.hint).not.toContain("big-pickle")
  })

  test("uses explicit Codex autonomous override without asking", async () => {
    // given
    const selectSpy = spyOn(p, "select").mockResolvedValue("no")

    // when
    const config = await prompts.promptInstallConfig(createDetectedConfig(), "codex", false)

    // then
    expect(config).toMatchObject({
      platform: "codex",
      hasCodex: true,
      hasHermes: false,
      codexAutonomous: false,
    } satisfies Partial<InstallConfig>)
    expect(selectSpy).not.toHaveBeenCalled()
  })

  test("does not ask the old Codex adapter question", async () => {
    // given
    const selectSpy = spyOn(p, "select").mockResolvedValue("no")

    // when
    await prompts.promptInstallConfig(createDetectedConfig(), "both")

    // then
    const messages = selectSpy.mock.calls.map((call) => call[0].message)
    expect(messages).not.toContain("Install Codex harness adapter into ~/.codex?")
  })
})

describe("promptInstallConfig OpenClaw branching", () => {
  let restoreTty: () => void

  beforeEach(() => {
    restoreTty = withTty()
  })

  afterEach(() => {
    restoreTty()
    mock.restore()
  })

  function respondByMessage(overrides: Record<string, string>) {
    return async (opts: { message: string }) => overrides[opts.message] ?? "no"
  }

  test("defaults to OpenClaw disabled when the user declines", async () => {
    // given
    spyOn(p, "select").mockImplementation(respondByMessage({}) as never)

    // when
    const config = await prompts.promptInstallConfig(createDetectedConfig(), "opencode")

    // then
    expect(config).toMatchObject({ hasOpenClaw: false } satisfies Partial<InstallConfig>)
    expect(config?.openClawGateway).toBeUndefined()
  })

  test("enables OpenClaw with an HTTP gateway when the user configures one", async () => {
    // given
    spyOn(p, "select").mockImplementation(
      respondByMessage({
        "Enable OpenClaw integration? (relay session events to Discord/Telegram/webhook; chat replies can drive the session)":
          "yes",
        "OpenClaw outbound gateway": "http",
      }) as never,
    )
    spyOn(p, "text").mockResolvedValue("https://example.com/openclaw-webhook")

    // when
    const config = await prompts.promptInstallConfig(createDetectedConfig(), "opencode")

    // then
    expect(config).toMatchObject({
      hasOpenClaw: true,
      openClawGateway: { type: "http", url: "https://example.com/openclaw-webhook" },
    } satisfies Partial<InstallConfig>)
  })

  test("enables OpenClaw without a gateway when the user chooses to configure later", async () => {
    // given
    spyOn(p, "select").mockImplementation(
      respondByMessage({
        "Enable OpenClaw integration? (relay session events to Discord/Telegram/webhook; chat replies can drive the session)":
          "yes",
        "OpenClaw outbound gateway": "skip",
      }) as never,
    )

    // when
    const config = await prompts.promptInstallConfig(createDetectedConfig(), "opencode")

    // then
    expect(config).toMatchObject({ hasOpenClaw: true } satisfies Partial<InstallConfig>)
    expect(config?.openClawGateway).toBeUndefined()
  })
})
