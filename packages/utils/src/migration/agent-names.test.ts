/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { AGENT_NAME_MAP, migrateAgentNames } from "./agent-names"

describe("AGENT_NAME_MAP parenthesized aliases", () => {
  test("maps Cerberus (Fullscanner) to cerberus", () => {
    // given
    const alias = "Cerberus (Fullscanner)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("cerberus")
  })

  test("maps Scylla (Deep Agent) to scylla", () => {
    // given
    const alias = "Scylla (Deep Agent)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("scylla")
  })

  test("maps Talos (Plan Builder) to talos", () => {
    // given
    const alias = "Talos (Plan Builder)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("talos")
  })

  test("maps Atlas (Plan Executor) to atlas", () => {
    // given
    const alias = "Atlas (Plan Executor)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("atlas")
  })

  test("maps Vanguard (Plan Consultant) to vanguard", () => {
    // given
    const alias = "Vanguard (Plan Consultant)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("vanguard")
  })

  test("maps Sentinel (Plan Critic) to sentinel", () => {
    // given
    const alias = "Sentinel (Plan Critic)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("sentinel")
  })
})

describe("migrateAgentNames with parenthesized aliases", () => {
  test("migrates all parenthesized aliases to canonical names", () => {
    // given
    const legacyAgents = {
      "Cerberus (Fullscanner)": { model: "claude-opus-4" },
      "Scylla (Deep Agent)": { model: "gpt-5.4" },
      "Talos (Plan Builder)": { model: "claude-opus-4" },
      "Atlas (Plan Executor)": { model: "kimi-k2.5" },
      "Vanguard (Plan Consultant)": { model: "claude-opus-4" },
      "Sentinel (Plan Critic)": { model: "claude-opus-4" },
    }

    // when
    const { migrated, changed } = migrateAgentNames(legacyAgents)

    // then
    expect(changed).toBe(true)
    expect(migrated.cerberus).toEqual({ model: "claude-opus-4" })
    expect(migrated.scylla).toEqual({ model: "gpt-5.4" })
    expect(migrated.talos).toEqual({ model: "claude-opus-4" })
    expect(migrated.atlas).toEqual({ model: "kimi-k2.5" })
    expect(migrated.vanguard).toEqual({ model: "claude-opus-4" })
    expect(migrated.sentinel).toEqual({ model: "claude-opus-4" })
    expect(migrated["Cerberus (Fullscanner)"]).toBeUndefined()
    expect(migrated["Scylla (Deep Agent)"]).toBeUndefined()
  })
})
