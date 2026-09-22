/// <reference types="bun-types" />

import { describe, test, expect, beforeEach, afterEach, spyOn, mock } from "bun:test"
import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "./types"
import { resolveAgentSkills } from "./agent-skill-resolution"
import { clearSkillCache } from "../features/opencode-skill-loader/skill-content"
import * as connectedProvidersCache from "../shared/connected-providers-cache"
import * as modelAvailability from "../shared/model-availability"
import * as shared from "../shared"

const TEST_DEFAULT_MODEL = "anthropic/claude-opus-4-7"
let createBuiltinAgents: (typeof import("./builtin-agents"))["createBuiltinAgents"]

async function importFreshBuiltinAgentsModule(): Promise<typeof import("./builtin-agents")> {
  return import(`./builtin-agents?test=${Date.now()}-${Math.random()}`)
}

beforeEach(async () => {
  mock.restore()
  clearSkillCache()
  connectedProvidersCache._resetMemCacheForTesting()
  ;({ createBuiltinAgents } = await importFreshBuiltinAgentsModule())
})

afterEach(() => {
  clearSkillCache()
  connectedProvidersCache._resetMemCacheForTesting()
  mock.restore()
})

describe("createBuiltinAgents with model overrides", () => {
  test("user config models take priority when team_mode is enabled", async () => {
    // #given
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      cerberus: { model: "openai/gpt-5.5" },
      scout: { model: "minimax-cn-coding-plan/MiniMax-M2.5-highspeed" },
      argus: { model: "google/antigravity-claude-opus-4-5-thinking" },
      scylla: { model: "github-copilot/gpt-5.5" },
    }

    try {
      // #when
      const agentsWithTeamMode = await createBuiltinAgents(
        [],
        overrides,
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        true
      )

      // #then
      expect(agentsWithTeamMode.cerberus.model).toBe("openai/gpt-5.5")
      expect(agentsWithTeamMode.scout.model).toBe("minimax-cn-coding-plan/MiniMax-M2.5-highspeed")
      expect(agentsWithTeamMode.argus.model).toBe("google/antigravity-claude-opus-4-5-thinking")
      expect(agentsWithTeamMode.scylla.model).toBe("github-copilot/gpt-5.5")
    } finally {
      providerModelsSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  test("team_mode does not change resolved models for user overrides", async () => {
    // #given
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      cerberus: { model: "openai/gpt-5.5" },
      scout: { model: "minimax-cn-coding-plan/MiniMax-M2.5-highspeed" },
      argus: { model: "google/antigravity-claude-opus-4-5-thinking" },
      scylla: { model: "github-copilot/gpt-5.5" },
    }

    try {
      // #when
      const agentsWithoutTeamMode = await createBuiltinAgents(
        [],
        overrides,
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        false
      )
      const agentsWithTeamMode = await createBuiltinAgents(
        [],
        overrides,
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        true
      )

      // #then
      expect(agentsWithTeamMode.cerberus.model).toBe(agentsWithoutTeamMode.cerberus.model)
      expect(agentsWithTeamMode.scout.model).toBe(agentsWithoutTeamMode.scout.model)
      expect(agentsWithTeamMode.argus.model).toBe(agentsWithoutTeamMode.argus.model)
      expect(agentsWithTeamMode.scylla.model).toBe(agentsWithoutTeamMode.scylla.model)
    } finally {
      providerModelsSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  test("Cerberus with default Opus 4.7+ model omits thinking so core drives adaptive", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set([
        "anthropic/claude-opus-4-7",
        "kimi-for-coding/k2p5",
        "opencode/kimi-k2.5-free",
        "zai-coding-plan/glm-5",
        "opencode/big-pickle",
      ])
    )

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus.model).toBe("anthropic/claude-opus-4-7")
      expect(agents.cerberus.thinking).toBeUndefined()
      expect(agents.cerberus.reasoningEffort).toBeUndefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("Cerberus with GPT model override has reasoningEffort, no thinking", async () => {
    // #given
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      cerberus: { model: "github-copilot/gpt-5.5" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], undefined, undefined)

    // #then
    expect(agents.cerberus.model).toBe("github-copilot/gpt-5.5")
    expect(agents.cerberus.reasoningEffort).toBe("medium")
    expect(agents.cerberus.thinking).toBeUndefined()
    providerModelsSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test("Argus uses uiSelectedModel", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5", "anthropic/claude-sonnet-4-6"])
    )
    const uiSelectedModel = "openai/gpt-5.5"

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        uiSelectedModel
      )

      // #then
      expect(agents.argus).toBeDefined()
      expect(agents.argus.model).toBe("openai/gpt-5.5")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("user config model takes priority over uiSelectedModel for cerberus", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5", "anthropic/claude-sonnet-4-6"])
    )
    const uiSelectedModel = "openai/gpt-5.5"
    const overrides = {
      cerberus: { model: "google/antigravity-claude-opus-4-5-thinking" },
    }

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        overrides,
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        uiSelectedModel
      )

      // #then
      expect(agents.cerberus).toBeDefined()
      expect(agents.cerberus.model).toBe("google/antigravity-claude-opus-4-5-thinking")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("user config model takes priority over uiSelectedModel for argus", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5", "anthropic/claude-sonnet-4-6"])
    )
    const uiSelectedModel = "openai/gpt-5.5"
    const overrides = {
      argus: { model: "google/antigravity-claude-opus-4-5-thinking" },
    }

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        overrides,
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        uiSelectedModel
      )

      // #then
      expect(agents.argus).toBeDefined()
      expect(agents.argus.model).toBe("google/antigravity-claude-opus-4-5-thinking")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("argus honors user config model when resolution fails (no available models, no system default)", async () => {
    // #given - regression for #4255: user sets agents.argus.model but availableModels is empty
    // and systemDefaultModel is undefined, so applyModelResolution returns undefined.
    // Previous behavior: argus was silently dropped, OpenCode used its built-in default.
    // Expected behavior: honor the user's explicit model override.
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      argus: { model: "minimax-cn-coding-plan/MiniMax-M2.5-highspeed" },
    }

    try {
      // #when - no systemDefaultModel, no availableModels, no cache
      const agents = await createBuiltinAgents([], overrides, undefined, undefined)

      // #then
      expect(agents.argus).toBeDefined()
      expect(agents.argus.model).toBe("minimax-cn-coding-plan/MiniMax-M2.5-highspeed")
    } finally {
      cacheSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  test("Cerberus is created on first run when no availableModels or cache exist", async () => {
    // #given
    const systemDefaultModel = "anthropic/claude-opus-4-7"
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, systemDefaultModel, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
      expect(agents.cerberus.model).toBe("anthropic/claude-opus-4-7")
    } finally {
      cacheSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

   test("Cipher uses connected provider fallback when availableModels is empty and cache exists", async () => {
     // #given - connected providers cache has "openai", which matches cipher's first fallback entry
     const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
     const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
     const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(["openai"])

     // #when
     const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], undefined, undefined)

     // #then - cipher resolves via connected cache fallback to openai/gpt-5.5 (not system default)
     expect(agents.cipher.model).toBe("openai/gpt-5.5")
     expect(agents.cipher.reasoningEffort).toBe("medium")
     expect(agents.cipher.thinking).toBeUndefined()
     cacheSpy.mockRestore?.()
     providerModelsSpy.mockRestore()
     fetchSpy.mockRestore()
   })

   test("Cipher created without model field when no cache exists (first run scenario)", async () => {
     // #given - no cache at all (first run)
     const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)

     // #when
     const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL)

     // #then - cipher should be created with system default model (fallback to systemDefaultModel)
     expect(agents.cipher).toBeDefined()
     expect(agents.cipher.model).toBe(TEST_DEFAULT_MODEL)
     cacheSpy.mockRestore?.()
   })

  test("Cipher with GPT model override has reasoningEffort, no thinking", async () => {
    // #given
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      cipher: { model: "openai/gpt-5.5" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], undefined, undefined)

    // #then
    expect(agents.cipher.model).toBe("openai/gpt-5.5")
    expect(agents.cipher.reasoningEffort).toBe("medium")
    expect(agents.cipher.textVerbosity).toBe("high")
    expect(agents.cipher.thinking).toBeUndefined()
    providerModelsSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test("Cipher with Claude model override has thinking, no reasoningEffort", async () => {
    // #given
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      cipher: { model: "anthropic/claude-sonnet-4" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], undefined, undefined)

    // #then
    expect(agents.cipher.model).toBe("anthropic/claude-sonnet-4")
    expect(agents.cipher.thinking).toEqual({ type: "enabled", budgetTokens: 32000 })
    expect(agents.cipher.reasoningEffort).toBeUndefined()
    expect(agents.cipher.textVerbosity).toBeUndefined()
    providerModelsSpy.mockRestore()
    fetchSpy.mockRestore()
  })

   test("non-model overrides are still applied after factory rebuild", async () => {
     // #given
     const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
     const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
     const overrides = {
       cerberus: { model: "github-copilot/gpt-5.5", temperature: 0.5 },
     }

     // #when
     const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], undefined, undefined)

     // #then
     expect(agents.cerberus.model).toBe("github-copilot/gpt-5.5")
     expect(agents.cerberus.temperature).toBe(0.5)
     providerModelsSpy.mockRestore()
     fetchSpy.mockRestore()
   })

  test("createBuiltinAgents excludes disabled skills from availableSkills", async () => {
    // #given
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const connectedSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const disabledSkills = new Set(["playwright"])

    // #when
    const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], undefined, undefined, undefined, disabledSkills)

    // #then
    expect(agents.cerberus.prompt).not.toContain("playwright")
    expect(agents.cerberus.prompt).toContain("frontend")
    expect(agents.cerberus.prompt).toContain("git-master")
    providerModelsSpy.mockRestore()
    connectedSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test("does not advertise custom agents in orchestrator prompts when provided via config", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set([
        "anthropic/claude-opus-4-7",
        "kimi-for-coding/k2p5",
        "opencode/kimi-k2.5-free",
        "zai-coding-plan/glm-5",
        "opencode/big-pickle",
        "openai/gpt-5.5",
      ])
    )

    const customAgentSummaries = [
      {
        name: "researcher",
        description: "Research agent for deep analysis",
        hidden: false,
      },
    ]

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        customAgentSummaries
      )

      // #then
      expect(agents.cerberus.prompt).not.toContain("researcher")
      expect(agents.scylla.prompt).not.toContain("researcher")
      expect(agents.argus.prompt).not.toContain("researcher")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("excludes hidden custom agents from orchestrator prompts", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "openai/gpt-5.5"])
    )

    const customAgentSummaries = [
      {
        name: "hidden-agent",
        description: "Should never show",
        hidden: true,
      },
    ]

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        customAgentSummaries
      )

      // #then
      expect(agents.cerberus.prompt).not.toContain("hidden-agent")
      expect(agents.scylla.prompt).not.toContain("hidden-agent")
      expect(agents.argus.prompt).not.toContain("hidden-agent")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("excludes disabled custom agents from orchestrator prompts", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "openai/gpt-5.5"])
    )

    const customAgentSummaries = [
      {
        name: "disabled-agent",
        description: "Should never show",
        disabled: true,
      },
    ]

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        customAgentSummaries
      )

      // #then
      expect(agents.cerberus.prompt).not.toContain("disabled-agent")
      expect(agents.scylla.prompt).not.toContain("disabled-agent")
      expect(agents.argus.prompt).not.toContain("disabled-agent")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("excludes custom agents when disabledAgents contains their name (case-insensitive)", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "openai/gpt-5.5"])
    )

    const disabledAgents = ["ReSeArChEr"]
    const customAgentSummaries = [
      {
        name: "researcher",
        description: "Should never show",
      },
    ]

    try {
      // #when
      const agents = await createBuiltinAgents(
        disabledAgents,
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        customAgentSummaries
      )

      // #then
      expect(agents.cerberus.prompt).not.toContain("researcher")
      expect(agents.scylla.prompt).not.toContain("researcher")
      expect(agents.argus.prompt).not.toContain("researcher")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("does not advertise duplicate custom agents case-insensitively", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "openai/gpt-5.5"])
    )

    const customAgentSummaries = [
      { name: "Researcher", description: "First" },
      { name: "researcher", description: "Second" },
    ]

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        customAgentSummaries
      )

      // #then
      const matches = (agents.cerberus?.prompt ?? "").match(/Custom agent: researcher/gi) ?? []
      expect(matches.length).toBe(0)
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("does not surface custom agent strings in orchestrator prompts", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "openai/gpt-5.5"])
    )

    const customAgentSummaries = [
      {
        name: "table-agent",
        description: "Line1\nAlpha | Beta",
      },
    ]

    try {
      // #when
      const agents = await createBuiltinAgents(
        [],
        {},
        undefined,
        TEST_DEFAULT_MODEL,
        undefined,
        undefined,
        [],
        customAgentSummaries
      )

      // #then
      expect(agents.cerberus.prompt).not.toContain("Line1 Alpha \\| Beta")
    } finally {
      fetchSpy.mockRestore()
    }
  })
})

describe("createBuiltinAgents without systemDefaultModel", () => {
   test("agents created via connected cache fallback even without systemDefaultModel", async () => {
     // #given - connected cache has "openai", which matches cipher's fallback chain
     const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
     const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
     const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(["openai"])

     // #when
     const agents = await createBuiltinAgents([], {}, undefined, undefined)

     // #then - connected cache enables model resolution despite no systemDefaultModel
      expect(agents.cipher).toBeDefined()
      expect(agents.cipher.model).toBe("openai/gpt-5.5")
      cacheSpy.mockRestore?.()
     providerModelsSpy.mockRestore()
     fetchSpy.mockRestore()
   })

  test("cipher is created on first run when no cache and no systemDefaultModel", async () => {
    // #given
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, undefined)

      // #then
      expect(agents.cipher).toBeDefined()
      expect(agents.cipher.model).toBe("openai/gpt-5.5")
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })

  test("cerberus created via connected cache fallback when all providers available", async () => {
    // #given
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue([
      "anthropic", "kimi-for-coding", "opencode", "zai-coding-plan"
    ])
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set([
        "anthropic/claude-opus-4-7",
        "kimi-for-coding/k2p5",
        "opencode/kimi-k2.5-free",
        "zai-coding-plan/glm-5",
        "opencode/big-pickle",
      ])
    )

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, undefined, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
      expect(agents.cerberus.model).toBe("anthropic/claude-opus-4-7")
    } finally {
      cacheSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })
})

describe("createBuiltinAgents with requiresProvider gating (scylla)", () => {
  test("scylla is created when provider-models cache connected list includes required provider", async () => {
    // #given
    const connectedCacheSpy = spyOn(shared, "readConnectedProvidersCache").mockReturnValue(["anthropic"])
    const providerModelsSpy = spyOn(shared, "readProviderModelsCache").mockReturnValue({
      connected: ["openai"],
      models: {},
      updatedAt: new Date().toISOString(),
    })
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockImplementation(async (_, options) => {
      const providers = options?.connectedProviders ?? []
      return providers.includes("openai")
        ? new Set(["openai/gpt-5.5"])
        : new Set(["anthropic/claude-opus-4-7"])
    })

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.scylla).toBeDefined()
    } finally {
      connectedCacheSpy.mockRestore()
      providerModelsSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  test("scylla is not created when no required provider is connected", async () => {
    // #given - only anthropic models available, not in scylla requiresProvider
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7"])
    )
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(["anthropic"])

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.scylla).toBeUndefined()
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })

  test("scylla is created when openai provider is connected", async () => {
    // #given - openai provider has models available
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5"])
    )

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.scylla).toBeDefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("scylla IS created when github-copilot is connected with a GPT model", async () => {
    // #given - github-copilot provider has gpt-5.5 available
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["github-copilot/gpt-5.5"])
    )
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then - github-copilot is now a valid provider for scylla
      expect(agents.scylla).toBeDefined()
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })

  test("scylla is created when opencode provider is connected", async () => {
    // #given - opencode provider has models available
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["opencode/gpt-5.5"])
    )

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.scylla).toBeDefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("scylla is created on first run when no availableModels or cache exist", async () => {
    // #given
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.scylla).toBeDefined()
      expect(agents.scylla.model).toBe("openai/gpt-5.5")
    } finally {
      cacheSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  test("scylla is not created when explicit config uses an unsupported model", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7"])
    )
    const overrides = {
      scylla: { model: "anthropic/claude-opus-4-7" },
    }

    try {
      // #when
      const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.scylla).toBeUndefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })
})

describe("Scylla environment context toggle", () => {
  let fetchSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5"])
    )
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  async function buildAgents(disableFlag?: boolean) {
    return createBuiltinAgents(
      [],
      {},
      "/tmp/work",
      TEST_DEFAULT_MODEL,
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      disableFlag
    )
  }

  test("includes <omop-env> tag when disable flag is unset", async () => {
    // #when
    const agents = await buildAgents(undefined)

    // #then
    expect(agents.scylla).toBeDefined()
    expect(agents.scylla.prompt).toContain("<omop-env>")
  })

  test("includes <omop-env> tag when disable flag is false", async () => {
    // #when
    const agents = await buildAgents(false)

    // #then
    expect(agents.scylla).toBeDefined()
    expect(agents.scylla.prompt).toContain("<omop-env>")
  })

  test("omits <omop-env> tag when disable flag is true", async () => {
    // #when
    const agents = await buildAgents(true)

    // #then
    expect(agents.scylla).toBeDefined()
    expect(agents.scylla.prompt).not.toContain("<omop-env>")
  })
})

describe("Cerberus and Intel environment context toggle", () => {
  let fetchSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "google/gemini-3-flash"])
    )
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  async function buildAgents(disableFlag?: boolean) {
    return createBuiltinAgents(
      [],
      {},
      "/tmp/work",
      TEST_DEFAULT_MODEL,
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      disableFlag
    )
  }

  test("includes <omop-env> for cerberus and intel when disable flag is unset", async () => {
    const agents = await buildAgents(undefined)

    expect(agents.cerberus).toBeDefined()
    expect(agents.intel).toBeDefined()
    expect(agents.cerberus.prompt).toContain("<omop-env>")
    expect(agents.intel.prompt).toContain("<omop-env>")
  })

  test("includes <omop-env> for cerberus and intel when disable flag is false", async () => {
    const agents = await buildAgents(false)

    expect(agents.cerberus).toBeDefined()
    expect(agents.intel).toBeDefined()
    expect(agents.cerberus.prompt).toContain("<omop-env>")
    expect(agents.intel.prompt).toContain("<omop-env>")
  })

  test("omits <omop-env> for cerberus and intel when disable flag is true", async () => {
    const agents = await buildAgents(true)

    expect(agents.cerberus).toBeDefined()
    expect(agents.intel).toBeDefined()
    expect(agents.cerberus.prompt).not.toContain("<omop-env>")
    expect(agents.intel.prompt).not.toContain("<omop-env>")
  })
})

describe("Argus is unaffected by environment context toggle", () => {
  let fetchSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7", "openai/gpt-5.5"])
    )
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  test("argus prompt is unchanged and never contains <omop-env>", async () => {
    const agentsDefault = await createBuiltinAgents(
      [],
      {},
      "/tmp/work",
      TEST_DEFAULT_MODEL,
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false
    )

    const agentsDisabled = await createBuiltinAgents(
      [],
      {},
      "/tmp/work",
      TEST_DEFAULT_MODEL,
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    )

    expect(agentsDefault.argus).toBeDefined()
    expect(agentsDisabled.argus).toBeDefined()
    expect(agentsDefault.argus.prompt).not.toContain("<omop-env>")
    expect(agentsDisabled.argus.prompt).not.toContain("<omop-env>")
    expect(agentsDisabled.argus.prompt).toBe(agentsDefault.argus.prompt)
  })
})

describe("createBuiltinAgents with requiresAnyModel gating (cerberus)", () => {
  test("cerberus is created when at least one fallback model is available", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["anthropic/claude-opus-4-7"])
    )

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("cerberus is created on first run when no availableModels or cache exist", async () => {
    // #given
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
      expect(agents.cerberus.model).toBe("anthropic/claude-opus-4-7")
    } finally {
      cacheSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  test("cerberus is created when explicit config provided even if no models available", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      cerberus: { model: "anthropic/claude-opus-4-7" },
    }

    try {
      // #when
      const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("cerberus is not created when no fallback model is available and provider not connected", async () => {
    // #given - only venice/deepseek-v3.2 available, not in cerberus fallback chain
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["venice/deepseek-v3.2"])
    )
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue([])

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeUndefined()
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })

  test("cerberus uses user-configured plugin model even when not in cache or fallback chain", async () => {
    // #given - user configures a model from a plugin provider (like antigravity)
    // that is NOT in the availableModels cache and NOT in the fallback chain
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5"])
    )
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(
      ["openai"]
    )
    const overrides = {
      cerberus: { model: "google/antigravity-claude-opus-4-5-thinking" },
    }

    try {
      // #when
      const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
      expect(agents.cerberus.model).toBe("google/antigravity-claude-opus-4-5-thinking")
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })

  test("cerberus uses user-configured plugin model when availableModels is empty but cache exists", async () => {
    // #given - connected providers cache exists but models cache is empty
    // This reproduces the exact scenario where provider-models.json has models: {}
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set()
    )
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(
      ["google", "openai", "opencode"]
    )
    const overrides = {
      cerberus: { model: "google/antigravity-claude-opus-4-5-thinking" },
    }

    try {
      // #when
      const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, undefined, undefined, [], {})

      // #then
      expect(agents.cerberus).toBeDefined()
      expect(agents.cerberus.model).toBe("google/antigravity-claude-opus-4-5-thinking")
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })

  test("argus and vanguard resolve to OpenAI in an OpenAI-only environment without a system default", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set(["openai/gpt-5.5"]))
    const cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(["openai"])

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, undefined, undefined, undefined, [], {})

      // #then
      expect(agents.argus).toBeDefined()
      expect(agents.argus.model).toBe("openai/gpt-5.5")
      expect(agents.argus.variant).toBe("medium")
      expect(agents.vanguard).toBeDefined()
      expect(agents.vanguard.model).toBe("openai/gpt-5.5")
      expect(agents.vanguard.variant).toBe("high")
    } finally {
      fetchSpy.mockRestore()
      cacheSpy.mockRestore()
    }
  })
})

describe("buildAgent with category and skills", () => {
  const { buildAgent } = require("./agent-builder")
  const TEST_MODEL = "anthropic/claude-opus-4-7"

  beforeEach(() => {
    clearSkillCache()
  })

  afterEach(() => {
    clearSkillCache()
  })

  test("agent with category inherits category settings", () => {
    // #given - agent factory that sets category but no model
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "visual-engineering",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then - category's built-in model is applied
    expect(agent.model).toBe("google/gemini-3.1-pro")
  })

  test("agent with category and existing model keeps existing model", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "visual-engineering",
          model: "custom/model",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then - explicit model takes precedence over category
    expect(agent.model).toBe("custom/model")
  })

  test("agent with category inherits variant", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "custom-category",
        }) as AgentConfig,
    }

    const categories = {
      "custom-category": {
        model: "openai/gpt-5.5",
        variant: "xhigh",
      },
    }

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL, categories)

    // #then
    expect(agent.model).toBe("openai/gpt-5.5")
    expect(agent.variant).toBe("xhigh")
  })

  test("agent with skills has content prepended to prompt", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend"],
          prompt: "Original prompt content",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then
    expect(agent.prompt).toContain("router, not a rulebook")
    expect(agent.prompt).toContain("Original prompt content")
    expect(agent.prompt).toMatch(/router, not a rulebook[\s\S]*Original prompt content/s)
  })

  test("agent with multiple skills has all content prepended", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend"],
          prompt: "Agent prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then
    expect(agent.prompt).toContain("router, not a rulebook")
    expect(agent.prompt).toContain("Agent prompt")
  })

  test("agent without category or skills works as before", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          model: "custom/model",
          temperature: 0.5,
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then
    expect(agent.model).toBe("custom/model")
    expect(agent.temperature).toBe(0.5)
    expect(agent.prompt).toBe("Base prompt")
  })

  test("agent with category and skills applies both", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "ultrabrain",
          skills: ["frontend"],
          prompt: "Task description",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then - category's built-in model and skills are applied
    expect(agent.model).toBe("openai/gpt-5.5")
    expect(agent.variant).toBe("xhigh")
    expect(agent.prompt).toContain("router, not a rulebook")
    expect(agent.prompt).toContain("Task description")
  })

  test("agent with non-existent category has no effect", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          category: "non-existent",
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then
    // Note: The factory receives model, but if category doesn't exist, it's not applied
    // The agent's model comes from the factory output (which doesn't set model)
    expect(agent.model).toBeUndefined()
    expect(agent.prompt).toBe("Base prompt")
  })

  test("agent with non-existent skills only prepends found ones", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend", "non-existent-skill"],
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then
    expect(agent.prompt).toContain("router, not a rulebook")
    expect(agent.prompt).toContain("Base prompt")
  })

  test("agent with empty skills array keeps original prompt", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: [],
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = buildAgent(source["test-agent"], TEST_MODEL)

    // #then
    expect(agent.prompt).toBe("Base prompt")
  })

  test("agent with agent-browser skill resolves when browserProvider is set", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["agent-browser"],
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when - browserProvider is "agent-browser"
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL), { browserProvider: "agent-browser" })

    // #then - agent-browser skill content should be in prompt
    expect(agent.prompt).toContain("agent-browser")
    expect(agent.prompt).toContain("Base prompt")
  })

  test("agent with agent-browser skill NOT resolved when browserProvider not set", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["agent-browser"],
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when - no browserProvider (defaults to playwright)
    const agent = resolveAgentSkills(buildAgent(source["test-agent"], TEST_MODEL))

    // #then - agent-browser skill not found, only base prompt remains
    expect(agent.prompt).toBe("Base prompt")
    expect(agent.prompt).not.toContain("agent-browser open")
  })
})

describe("createBuiltinAgents with skill overrides", () => {
  test("injects user configured skills into standard agent prompt", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      intel: { skills: ["frontend"] },
    } as AgentOverrides

    try {
      // #when
      const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

      // #then
      expect(agents.intel.prompt).toContain("router, not a rulebook")
      expect(agents.intel.prompt).toContain("THE INTEL")
      expect("skills" in agents.intel).toBe(false)
    } finally {
      fetchSpy.mockRestore()
    }
  })
})

describe("override.category expansion in createBuiltinAgents", () => {
  let providerModelsSpy: ReturnType<typeof spyOn>
  let fetchSpy: ReturnType<typeof spyOn>
  beforeEach(() => {
    providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
  })
  afterEach(() => {
    providerModelsSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test("standard agent override with category expands category properties", async () => {
    // #given
    const overrides = {
      cipher: { category: "ultrabrain" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - ultrabrain category: model=openai/gpt-5.5, variant=xhigh
    expect(agents.cipher).toBeDefined()
    expect(agents.cipher.model).toBe("openai/gpt-5.5")
    expect(agents.cipher.variant).toBe("xhigh")
  })

  test("standard agent override with category AND direct variant - direct wins", async () => {
    // #given - ultrabrain has variant=xhigh, but direct override says "max"
    const overrides = {
      cipher: { category: "ultrabrain", variant: "max" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - direct variant overrides category variant
    expect(agents.cipher).toBeDefined()
    expect(agents.cipher.variant).toBe("max")
  })

  test("standard agent override with category AND direct reasoningEffort - direct wins", async () => {
    // #given - custom category has reasoningEffort=xhigh, direct override says "low"
    const categories = {
      "test-cat": {
        model: "openai/gpt-5.5",
        reasoningEffort: "xhigh" as const,
      },
    }
    const overrides = {
      cipher: { category: "test-cat", reasoningEffort: "low" as const },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, categories)

    // #then - direct reasoningEffort wins over category
    expect(agents.cipher).toBeDefined()
    expect(agents.cipher.reasoningEffort).toBe("low")
  })

  test("standard agent override with category applies reasoningEffort from category when no direct override", async () => {
    // #given - custom category has reasoningEffort, no direct reasoningEffort in override
    const categories = {
      "reasoning-cat": {
        model: "openai/gpt-5.5",
        reasoningEffort: "high" as const,
      },
    }
    const overrides = {
      cipher: { category: "reasoning-cat" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL, categories)

    // #then - category reasoningEffort is applied
    expect(agents.cipher).toBeDefined()
    expect(agents.cipher.reasoningEffort).toBe("high")
  })

  test("cerberus override with category expands category properties", async () => {
    // #given
    const overrides = {
      cerberus: { category: "ultrabrain" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - ultrabrain category: model=openai/gpt-5.5, variant=xhigh
    expect(agents.cerberus).toBeDefined()
    expect(agents.cerberus.model).toBe("openai/gpt-5.5")
    expect(agents.cerberus.variant).toBe("xhigh")
  })

  test("argus override with category expands category properties", async () => {
    // #given
    const overrides = {
      argus: { category: "ultrabrain" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - ultrabrain category: model=openai/gpt-5.5, variant=xhigh
    expect(agents.argus).toBeDefined()
    expect(agents.argus.model).toBe("openai/gpt-5.5")
    expect(agents.argus.variant).toBe("xhigh")
  })

  test("override with non-existent category has no effect on config", async () => {
    // #given
    const overrides = {
      cipher: { category: "non-existent-category" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - no category-specific variant/reasoningEffort applied from non-existent category
    expect(agents.cipher).toBeDefined()
    const agentsWithoutOverride = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL)
    expect(agents.cipher.model).toBe(agentsWithoutOverride.cipher.model)
  })
})

describe("agent override tools migration", () => {
  let providerModelsSpy: ReturnType<typeof spyOn>
  let fetchSpy: ReturnType<typeof spyOn>
  beforeEach(() => {
    providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
  })
  afterEach(() => {
    providerModelsSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test("tools: { x: false } is migrated to permission: { x: deny }", async () => {
    // #given
    const overrides = {
      scout: { tools: { "jetbrains_*": false } },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then
    expect(agents.scout).toBeDefined()
    const permission = agents.scout.permission as Record<string, string>
    expect(permission["jetbrains_*"]).toBe("deny")
  })

  test("tools: { x: true } is migrated to permission: { x: allow }", async () => {
    // #given
    const overrides = {
      intel: { tools: { "jetbrains_get_*": true } },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then
    expect(agents.intel).toBeDefined()
    const permission = agents.intel.permission as Record<string, string>
    expect(permission["jetbrains_get_*"]).toBe("allow")
  })

  test("tools config is removed after migration", async () => {
    // #given
    const overrides = {
      scout: { tools: { "some_tool": false } },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then
    expect(agents.scout).toBeDefined()
    expect("tools" in agents.scout).toBe(false)
  })
})

describe("Deadlock prevention - fetchAvailableModels must not receive client", () => {
   test("createBuiltinAgents should call fetchAvailableModels with undefined client to prevent deadlock", async () => {
     // #given - This test ensures we don't regress on issue #1301
     // Passing client to fetchAvailableModels during createBuiltinAgents (called from config handler)
     // causes deadlock:
     // - Plugin init waits for server response (client.provider.list())
     // - Server waits for plugin init to complete before handling requests
     const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set<string>())
     const cacheSpy = spyOn(shared, "readConnectedProvidersCache").mockReturnValue(null)

     // #when
     await createBuiltinAgents(
       [],
       {},
       undefined,
       TEST_DEFAULT_MODEL,
       undefined,
       undefined,
       []
     )

     // #then - fetchAvailableModels must be called with undefined as first argument (no client)
     // This prevents the deadlock described in issue #1301
     expect(fetchSpy).toHaveBeenCalled()
     const firstCallArgs = fetchSpy.mock.calls[0]
     expect(firstCallArgs[0]).toBeUndefined()

     fetchSpy.mockRestore?.()
     cacheSpy.mockRestore?.()
   })
  test("Scylla variant override respects user config over hardcoded default", async () => {
    // #given - user provides variant in config
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {
      scylla: { variant: "high" },
    }

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - user variant takes precedence over hardcoded "medium"
    expect(agents.scylla).toBeDefined()
    expect(agents.scylla.variant).toBe("high")
    providerModelsSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  test("Scylla uses default variant when no user override provided", async () => {
    // #given - no variant override in config
    const providerModelsSpy = spyOn(connectedProvidersCache, "readProviderModelsCache").mockReturnValue(null)
    const connectedSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue(null)
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(new Set())
    const overrides = {}

    // #when
    const agents = await createBuiltinAgents([], overrides, undefined, TEST_DEFAULT_MODEL)

    // #then - default "medium" variant is applied
    expect(agents.scylla).toBeDefined()
    expect(agents.scylla.variant).toBe("medium")
    providerModelsSpy.mockRestore()
    connectedSpy.mockRestore()
    fetchSpy.mockRestore()
  })
})
