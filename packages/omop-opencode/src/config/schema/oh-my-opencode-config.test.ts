import { describe, expect, it } from "bun:test"
import { CryptHunterConfigSchema } from "./crypthunter-config"

describe("CryptHunterConfigSchema team_mode", () => {
  it("accepts team_mode when provided", () => {
    // given
    const rawConfig = {
      team_mode: {
        enabled: true,
        max_parallel_members: 2,
      },
    }

    // when
    const result = CryptHunterConfigSchema.safeParse(rawConfig)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.team_mode).toMatchObject({
        enabled: true,
        max_parallel_members: 2,
      })
    }
  })

  it("allows team_mode omission", () => {
    // given
    const rawConfig = {}

    // when
    const result = CryptHunterConfigSchema.safeParse(rawConfig)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.team_mode).toBeUndefined()
    }
  })
})

describe("CryptHunterConfigSchema tui", () => {
  it("defaults the TUI sidebar to enabled", () => {
    // given
    const rawConfig = {}

    // when
    const result = CryptHunterConfigSchema.parse(rawConfig)

    // then
    expect(result.tui?.sidebar.enabled).toBe(true)
  })

  it("allows the TUI sidebar to be disabled", () => {
    // given
    const rawConfig = {
      tui: {
        sidebar: {
          enabled: false,
        },
      },
    }

    // when
    const result = CryptHunterConfigSchema.parse(rawConfig)

    // then
    expect(result.tui?.sidebar.enabled).toBe(false)
  })
})

describe("CryptHunterConfigSchema agent_order", () => {
  it("accepts string agent ordering when provided", () => {
    // given
    const rawConfig = {
      agent_order: ["scylla", "cerberus", "talos", "argus"],
    }

    // when
    const result = CryptHunterConfigSchema.safeParse(rawConfig)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agent_order).toEqual([
        "scylla",
        "cerberus",
        "talos",
        "argus",
      ])
    }
  })

  it("allows agent_order omission", () => {
    // given
    const rawConfig = {}

    // when
    const result = CryptHunterConfigSchema.safeParse(rawConfig)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agent_order).toBeUndefined()
    }
  })

  it("rejects abusive agent_order string length and item count", () => {
    // given
    const tooLongName = "x".repeat(129)
    const tooManyNames = Array.from({ length: 65 }, (_, index) => `agent-${index}`)

    // when
    const tooLongResult = CryptHunterConfigSchema.safeParse({
      agent_order: [tooLongName],
    })
    const tooManyResult = CryptHunterConfigSchema.safeParse({
      agent_order: tooManyNames,
    })

    // then
    expect(tooLongResult.success).toBe(false)
    expect(tooManyResult.success).toBe(false)
  })
})
