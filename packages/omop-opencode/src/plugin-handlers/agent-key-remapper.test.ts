import { describe, it, expect } from "bun:test"
import { remapAgentKeysToDisplayNames } from "./agent-key-remapper"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("remapAgentKeysToDisplayNames", () => {
  it("remaps known agent keys to display names", () => {
    // given agents with lowercase keys
    const agents = {
      cerberus: { prompt: "test", mode: "primary" },
      cipher: { prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then known agents get display name keys only
    expect(result[getAgentListDisplayName("cerberus")]).toBeDefined()
    expect(result["cipher"]).toBeDefined()
    expect(result["cerberus"]).toBeUndefined()
  })

  it("preserves unknown agent keys unchanged", () => {
    // given agents with a custom key
    const agents = {
      "custom-agent": { prompt: "custom" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then custom key is unchanged
    expect(result["custom-agent"]).toBeDefined()
  })

  it("remaps all core agents to display names", () => {
    // given all core agents
    const agents = {
      cerberus: {},
      scylla: {},
      talos: {},
      argus: {},
      athena: {},
      vanguard: {},
      sentinel: {},
      "cerberus-junior": {},
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then all get display name keys
    expect(result[getAgentListDisplayName("cerberus")]).toBeDefined()
    expect(result["cerberus"]).toBeUndefined()
    expect(result[getAgentListDisplayName("scylla")]).toBeDefined()
    expect(result["scylla"]).toBeUndefined()
    expect(result[getAgentListDisplayName("talos")]).toBeDefined()
    expect(result["talos"]).toBeUndefined()
    expect(result[getAgentListDisplayName("argus")]).toBeDefined()
    expect(result["argus"]).toBeUndefined()
    expect(result[getAgentDisplayName("athena")]).toBeDefined()
    expect(result["athena"]).toBeUndefined()
    expect(result[getAgentDisplayName("vanguard")]).toBeDefined()
    expect(result["vanguard"]).toBeUndefined()
    expect(result[getAgentDisplayName("sentinel")]).toBeDefined()
    expect(result["sentinel"]).toBeUndefined()
    expect(result[getAgentDisplayName("cerberus-junior")]).toBeDefined()
    expect(result["cerberus-junior"]).toBeUndefined()
  })

  it("does not emit both config and display keys for remapped agents", () => {
    // given one remapped agent
    const agents = {
      cerberus: { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then only display key is emitted
    expect(Object.keys(result)).toEqual([getAgentListDisplayName("cerberus")])
    expect(result[getAgentListDisplayName("cerberus")]).toBeDefined()
    expect(result["cerberus"]).toBeUndefined()
  })

  it("returns runtime core agent list names in canonical order", () => {
    // given
    const result = remapAgentKeysToDisplayNames({
      argus: {},
      talos: {},
      scylla: {},
      cerberus: {},
    })

    // when
    const remappedNames = Object.keys(result)

    // then
    expect(remappedNames).toEqual([
      getAgentListDisplayName("argus"),
      getAgentListDisplayName("talos"),
      getAgentListDisplayName("scylla"),
      getAgentListDisplayName("cerberus"),
    ])
  })

  it("keeps remapped core agent name fields aligned with OpenCode list ordering", () => {
    // given agents with raw config-key names
    const agents = {
      cerberus: { name: "cerberus", prompt: "test", mode: "primary" },
      scylla: { name: "scylla", prompt: "test", mode: "primary" },
      talos: { name: "talos", prompt: "test", mode: "primary" },
      argus: { name: "argus", prompt: "test", mode: "primary" },
      cipher: { name: "cipher", prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then keys and names both use the same runtime-facing list names
    expect(Object.keys(result).slice(0, 4)).toEqual([
      getAgentListDisplayName("cerberus"),
      getAgentListDisplayName("scylla"),
      getAgentListDisplayName("talos"),
      getAgentListDisplayName("argus"),
    ])
    expect(result[getAgentListDisplayName("cerberus")]).toEqual({
      name: getAgentListDisplayName("cerberus"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("scylla")]).toEqual({
      name: getAgentListDisplayName("scylla"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("talos")]).toEqual({
      name: getAgentListDisplayName("talos"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("argus")]).toEqual({
      name: getAgentListDisplayName("argus"),
      prompt: "test",
      mode: "primary",
    })
    expect(result.cipher).toEqual({ name: "cipher", prompt: "test", mode: "subagent" })
  })

  it("backfills runtime names for core agents when builtin configs omit name", () => {
    // given builtin-style configs without name fields
    const agents = {
      cerberus: { prompt: "test", mode: "primary" },
      scylla: { prompt: "test", mode: "primary" },
      talos: { prompt: "test", mode: "primary" },
      argus: { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then runtime-facing names stay aligned even when builtin configs omit name
    expect(result[getAgentListDisplayName("cerberus")]).toEqual({
      name: getAgentListDisplayName("cerberus"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("scylla")]).toEqual({
      name: getAgentListDisplayName("scylla"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("talos")]).toEqual({
      name: getAgentListDisplayName("talos"),
      prompt: "test",
      mode: "primary",
    })
    expect(result[getAgentListDisplayName("argus")]).toEqual({
      name: getAgentListDisplayName("argus"),
      prompt: "test",
      mode: "primary",
    })
  })

  it("emits a single literal display-name row with no ZWSP for a single core agent", () => {
    // given a single core agent input
    const agents = {
      cerberus: { foo: "bar" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then exactly one row is emitted under the clean literal display name
    const displayName = getAgentListDisplayName("cerberus")
    expect(Object.keys(result)).toEqual([displayName])
    expect(result[displayName]).toEqual({
      name: displayName,
      foo: "bar",
    })
  })

  describe("displayName i18n override (#4004)", () => {
    it("uses per-agent displayName override when set", () => {
      // given cerberus config with a Chinese displayName override
      const agents = {
        cerberus: { prompt: "test", mode: "primary" },
      }
      const overrides = {
        cerberus: { displayName: "总指挥" },
      }

      // when remapping with overrides
      const result = remapAgentKeysToDisplayNames(agents, overrides)

      // then the localized name is used instead of "Cerberus - Ultraworker"
      expect(result["总指挥"]).toBeDefined()
      expect((result["总指挥"] as Record<string, unknown>).name).toBe("总指挥")
      expect(result["Cerberus - Ultraworker"]).toBeUndefined()
    })

    it("falls back to hardcoded English name when displayName is not set", () => {
      // given cerberus config without displayName override
      const agents = {
        cerberus: { prompt: "test", mode: "primary" },
      }
      const overrides = {
        cerberus: { model: "claude-opus-4-7" },
      }

      // when remapping with overrides that have no displayName
      const result = remapAgentKeysToDisplayNames(agents, overrides)

      // then the legacy AGENT_DISPLAY_NAMES value is used
      expect(result[getAgentListDisplayName("cerberus")]).toBeDefined()
      expect(result["总指挥"]).toBeUndefined()
    })

    it("falls back to hardcoded English name when no overrides are passed", () => {
      // given cerberus config with no overrides at all
      const agents = {
        cerberus: { prompt: "test", mode: "primary" },
      }

      // when remapping without overrides
      const result = remapAgentKeysToDisplayNames(agents)

      // then the legacy AGENT_DISPLAY_NAMES value is used
      expect(result[getAgentListDisplayName("cerberus")]).toBeDefined()
    })
  })
})
