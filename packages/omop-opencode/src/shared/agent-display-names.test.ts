import { describe, it, expect } from "bun:test"
import { AGENT_DISPLAY_NAMES, getAgentConfigKey, getAgentDisplayName, getAgentListDisplayName, normalizeAgentForPrompt, normalizeAgentForPromptKey, stripAgentListSortPrefix } from "./agent-display-names"

describe("getAgentDisplayName", () => {
  it("returns display name for lowercase config key (new format)", () => {
    // given config key "cerberus"
    const configKey = "cerberus"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Cerberus - fullscaner"
    expect(result).toBe("Cerberus - fullscaner")
  })

  it("returns display name for uppercase config key (old format - case-insensitive)", () => {
    // given config key "Cerberus" (old format)
    const configKey = "Cerberus"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Cerberus - fullscaner" (case-insensitive lookup)
    expect(result).toBe("Cerberus - fullscaner")
  })

  it("returns original key for unknown agents (fallback)", () => {
    // given config key "custom-agent"
    const configKey = "custom-agent"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "custom-agent" (original key unchanged)
    expect(result).toBe("custom-agent")
  })

  it("returns display name for argus", () => {
    // given config key "argus"
    const configKey = "argus"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "Argus - Plan Executor"
    expect(result).toBe("Argus - Plan Executor")
  })

  it("returns display name for talos", () => {
    // given config key "talos"
    const configKey = "talos"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Talos - Plan Builder"
    expect(result).toBe("Talos - Plan Builder")
  })

  it("returns display name for cerberus-junior", () => {
    // given config key "cerberus-junior"
    const configKey = "cerberus-junior"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Cerberus-Junior"
    expect(result).toBe("Cerberus-Junior")
  })

  it("returns display name for vanguard", () => {
    // given config key "vanguard"
    const configKey = "vanguard"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Vanguard - Plan Consultant"
    expect(result).toBe("Vanguard - Plan Consultant")
  })

  it("returns display name for sentinel", () => {
    // given config key "sentinel"
    const configKey = "sentinel"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "Sentinel - Plan Critic"
    expect(result).toBe("Sentinel - Plan Critic")
  })

  it("returns display name for cipher", () => {
    // given config key "cipher"
    const configKey = "cipher"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "cipher"
    expect(result).toBe("cipher")
  })

  it("returns display name for intel", () => {
    // given config key "intel"
    const configKey = "intel"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "intel"
    expect(result).toBe("intel")
  })

  it("returns display name for scout", () => {
    // given config key "scout"
    const configKey = "scout"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "scout"
    expect(result).toBe("scout")
  })

  it("returns display name for lens", () => {
    // given config key "lens"
    const configKey = "lens"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "lens"
    expect(result).toBe("lens")
  })

  it("preserves CJK display-name overrides verbatim", () => {
    expect(getAgentDisplayName("cerberus", { cerberus: { displayName: "Cerberus - 主脑" } })).toBe("Cerberus - 主脑")
    expect(getAgentDisplayName("scylla", { scylla: { displayName: "헤파이스토스" } })).toBe("헤파이스토스")
    expect(getAgentDisplayName("argus", { argus: { displayName: "アトラス" } })).toBe("アトラス")
  })
})

describe("getAgentConfigKey", () => {
  it("resolves display name to config key", () => {
    // given display name "Cerberus - fullscaner"
    // when getAgentConfigKey called
    // then returns "cerberus"
    expect(getAgentConfigKey("Cerberus - fullscaner")).toBe("cerberus")
  })

  it("resolves display name case-insensitively", () => {
    // given display name in different case
    // when getAgentConfigKey called
    // then returns "argus"
    expect(getAgentConfigKey("argus - plan executor")).toBe("argus")
  })

  it("resolves legacy parenthesized display names", () => {
    // given legacy parenthesized display name from old configs/sessions
    // when getAgentConfigKey called
    // then resolves to canonical config key
    expect(getAgentConfigKey("Cerberus (Fullscanner)")).toBe("cerberus")
    expect(getAgentConfigKey("Argus (Plan Executor)")).toBe("argus")
  })

  it("passes through lowercase config keys unchanged", () => {
    // given lowercase config key "talos"
    // when getAgentConfigKey called
    // then returns "talos"
    expect(getAgentConfigKey("talos")).toBe("talos")
  })

  it("returns lowercased unknown agents", () => {
    // given unknown agent name
    // when getAgentConfigKey called
    // then returns lowercased
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
  })

  it("resolves all core agent display names", () => {
    // given all core display names
    // when/then each resolves to its config key
    expect(getAgentConfigKey("Scylla - Deep Agent")).toBe("scylla")
    expect(getAgentConfigKey("Talos - Plan Builder")).toBe("talos")
    expect(getAgentConfigKey("Argus - Plan Executor")).toBe("argus")
    expect(getAgentConfigKey("Vanguard - Plan Consultant")).toBe("vanguard")
    expect(getAgentConfigKey("Sentinel - Plan Critic")).toBe("sentinel")
    expect(getAgentConfigKey("Cerberus-Junior")).toBe("cerberus-junior")
  })

  it("resolves argus even when the UI ordering prefix is present", () => {
    expect(getAgentConfigKey(getAgentListDisplayName("argus"))).toBe("argus")
  })

  it("resolves display names even when zero-width characters are embedded", () => {
    expect(getAgentConfigKey("Cerberus\u200B - Ultraworker")).toBe("cerberus")
    expect(getAgentConfigKey("\uFEFFArgus - Plan Executor")).toBe("argus")
  })
})

describe("getAgentListDisplayName", () => {
  it("returns the canonical display name for the core agent list", () => {
    expect(getAgentListDisplayName("cerberus")).toBe("Cerberus - fullscaner")
    expect(getAgentListDisplayName("scylla")).toBe("Scylla - Deep Agent")
    expect(getAgentListDisplayName("talos")).toBe("Talos - Plan Builder")
    expect(getAgentListDisplayName("argus")).toBe("Argus - Plan Executor")
  })

  it("keeps non-core agents unchanged for list display", () => {
    expect(getAgentListDisplayName("cipher")).toBe("cipher")
  })

  it("is a thin alias for getAgentDisplayName", () => {
    expect(getAgentListDisplayName("cerberus")).toBe(getAgentDisplayName("cerberus"))
  })
})

describe("stripAgentListSortPrefix", () => {
  it("strips legacy zero-width sort prefixes baked into v3.14.0–v3.16.0 sessions", () => {
    expect(stripAgentListSortPrefix("\u200B\u200BScylla - Deep Agent")).toBe("Scylla - Deep Agent")
  })

  it("strips leading and trailing wrapper characters after sort prefix removal", () => {
    expect(stripAgentListSortPrefix("\\Scylla - Deep Agent\\")).toBe("Scylla - Deep Agent")
  })
})

describe("normalizeAgentForPrompt", () => {
  it("strips core UI ordering prefixes back to canonical display names", () => {
    expect(normalizeAgentForPrompt(getAgentListDisplayName("cerberus"))).toBe("Cerberus - fullscaner")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("scylla"))).toBe("Scylla - Deep Agent")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("talos"))).toBe("Talos - Plan Builder")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("argus"))).toBe("Argus - Plan Executor")
  })

  it("removes zero-width characters before returning canonical names", () => {
    expect(normalizeAgentForPrompt("Cerberus\u200B - Ultraworker")).toBe("Cerberus - fullscaner")
  })

  it("converts legacy parenthesized names to canonical display names", () => {
    expect(normalizeAgentForPrompt("Argus (Plan Executor)")).toBe("Argus - Plan Executor")
  })
})

describe("normalizeAgentForPromptKey", () => {
  it("converts built-in display names to config keys", () => {
    expect(normalizeAgentForPromptKey("Cerberus (Fullscanner)")).toBe("cerberus")
  })

  it("strips UI ordering prefixes before returning config keys", () => {
    expect(normalizeAgentForPromptKey(getAgentListDisplayName("argus"))).toBe("argus")
  })

  it("preserves custom agents", () => {
    expect(normalizeAgentForPromptKey("MyCustomAgent")).toBe("MyCustomAgent")
  })
})

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all expected agent mappings", () => {
    // given expected mappings
    const expectedMappings = {
      cerberus: "Cerberus - fullscaner",
      scylla: "Scylla - Deep Agent",
      talos: "Talos - Plan Builder",
      argus: "Argus - Plan Executor",
      "cerberus-junior": "Cerberus-Junior",
      vanguard: "Vanguard - Plan Consultant",
      sentinel: "Sentinel - Plan Critic",
      athena: "Athena - Council",
      "athena-junior": "Athena-Junior - Council",
      cipher: "cipher",
      intel: "intel",
      scout: "scout",
      "lens": "lens",
      "council-member": "council-member",
    }

    // when checking the constant
    // then contains all expected mappings
    expect(AGENT_DISPLAY_NAMES).toEqual(expectedMappings)
  })

  it("all display names must be HTTP-header-safe (no parentheses)", () => {
    // given all agent display names
    const httpHeaderUnsafe = /[()]/

    // when checking each display name
    for (const [, displayName] of Object.entries(AGENT_DISPLAY_NAMES)) {
      // then none should contain parentheses
      expect(httpHeaderUnsafe.test(displayName)).toBe(false)
    }
  })
})
