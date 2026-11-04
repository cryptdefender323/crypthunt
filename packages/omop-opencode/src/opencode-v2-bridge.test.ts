import { describe, expect, it } from "bun:test"
import { createOpenCodeV2ModeHandlers, setupOpenCodeV2 } from "./opencode-v2-bridge"
import type { OpenCodeV2ContextEvent, OpenCodeV2PromptEvent } from "./opencode-v2-bridge"

function prompt(sessionID: string, text: string): OpenCodeV2PromptEvent {
  return { sessionID, prompt: { text } }
}

function context(sessionID: string): OpenCodeV2ContextEvent {
  return { sessionID, system: [] }
}

describe("OpenCode V2 mode bridge", () => {
  it("injects the Bug Bounty authorization gate before target activity", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = context("bug-bounty-v2")

    hooks.onPrompt(prompt("bug-bounty-v2", "/mode bug-bounty"))
    hooks.onContext(event)

    expect(event.system[0]?.text).toContain("Mode: bug-bounty")
    expect(event.system[0]?.text).toContain("Load bug-bounty-research and tool-browser-automation skills")
    expect(event.system[0]?.text).toContain("Use playwright_browser_navigate and playwright_browser_snapshot")
    expect(event.system[0]?.text).toContain("Do not claim no program exists until official-source searches have been attempted")
    expect(event.system[0]?.text).toContain("other relevant official program directories discoverable through browser search")
    expect(event.system[0]?.text).toContain("government agencies, presidential offices, public/private companies")
    expect(event.system[0]?.text).toContain("Platform registration is optional")
    expect(event.system[0]?.text).toContain("owner authorization")
    expect(event.system[0]?.text).toContain("When a target arrives, also gather passive information")
    expect(event.system[0]?.text).toContain("If no public policy or permission is found, finish passive research without probing")
    expect(event.system[0]?.text).toContain("Automated scanners such as sqlmap are allowed only if")
    expect(event.system[0]?.text).toContain("Before READY_TO_REPORT, require verified scope/RoE")
    expect(event.system[0]?.text).toContain("Do not submit or contact the program without explicit user instruction")
    expect(event.system[0]?.text).toContain("Ask only for the target domain/IP and wait")
  })

  it("continues the full authorized Bug Bounty chain without a second start prompt", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = context("bug-bounty-autonomous-v2")

    hooks.onPrompt(prompt("bug-bounty-autonomous-v2", "/mode bug-bounty"))
    hooks.onPrompt(prompt("bug-bounty-autonomous-v2", "fullscan https://target.example.test"))
    hooks.onContext(event)

    expect(event.system[0]?.text).toContain("Start the engagement automatically")
    expect(event.system[0]?.text).toContain("continue in this session without another start approval")
    expect(event.system[0]?.text).toContain("preserve CryptHunter's evidence ladder, false-positive review, and reasoning tools")
    expect(event.system[0]?.text).toContain("pentest-recon → pentest-enum → pentest-exploit → pentest-report")
  })

  it("accepts a target inline with the mode command and starts the workflow", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = prompt("inline-bugbounty-target-v2", "/mode bug-bounty fullscan https://target.example.test")
    const modelContext = context("inline-bugbounty-target-v2")

    hooks.onPrompt(event)
    hooks.onContext(modelContext)

    expect(event.prompt.skills?.map((skill) => skill.id)).toEqual([
      "bug-bounty-research",
      "tool-browser-automation",
    ])
    expect(modelContext.system[0]?.text).toContain("Start the engagement automatically")
    expect(modelContext.system[0]?.text).not.toContain("Ask only for the target domain/IP and wait")
  })

  it("selects Bug Bounty and browser skills during prompt admission", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = prompt("skills-v2", "/mode bug-bounty")

    hooks.onPrompt(event)

    expect(event.prompt.skills).toEqual([
      { id: "bug-bounty-research", name: "bug-bounty-research" },
      { id: "tool-browser-automation", name: "tool-browser-automation" },
    ])
  })

  it("preserves existing skill attachments and adds mode skills without duplicates", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = prompt("existing-skills-v2", "/mode bug-bounty")
    event.prompt.skills = [{ id: "bug-bounty-research", name: "Bug Bounty Research" }]

    hooks.onPrompt(event)

    expect(event.prompt.skills).toEqual([
      { id: "bug-bounty-research", name: "Bug Bounty Research" },
      { id: "tool-browser-automation", name: "tool-browser-automation" },
    ])
  })

  it("retains an explicitly selected Red Team mode when a target arrives", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = context("red-team-v2")

    hooks.onPrompt(prompt("red-team-v2", "/mode red-team"))
    hooks.onPrompt(prompt("red-team-v2", "dpr.go.id"))
    hooks.onContext(event)

    expect(event.system[0]?.text).toContain("Mode: red-team")
    expect(event.system[0]?.text).toContain("red-team-workflow → red-recon")
    expect(event.system[0]?.text).toContain("Start with passive OSINT only")
    expect(event.system[0]?.text).not.toContain("Mode: bug-bounty")
  })

  it("admits the non-slash mode marker forwarded by native commands", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = prompt("forwarded-mode-marker-v2", "--mode grey-hat")
    const modelContext = context("forwarded-mode-marker-v2")

    hooks.onPrompt(event)
    hooks.onContext(modelContext)

    expect(event.prompt.skills).toEqual([
      { id: "greyhat-research", name: "greyhat-research" },
      { id: "pentest-recon", name: "pentest-recon" },
    ])
    expect(modelContext.system[0]?.text).toContain("Mode: grey-hat")
  })

  it("does not inject duplicate mode context into a model call", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = context("duplicate-v2")

    hooks.onPrompt(prompt("duplicate-v2", "/mode bug-bounty"))
    hooks.onContext(event)
    hooks.onContext(event)

    expect(event.system).toHaveLength(1)
  })

  it("registers a native mode command that admits a mode prompt", async () => {
    let registeredCommand: ModeCommandDefinition | undefined
    let submittedPrompt: { readonly sessionID: string; readonly text: string; readonly delivery: "steer" | "queue" } | undefined
    let mcpReloaded = false
    const mcpServers = new Map<string, Record<string, unknown>>()
    const context = {
      session: {
        hook: async () => undefined,
        prompt: async (input: { readonly sessionID: string; readonly text: string; readonly delivery: "steer" | "queue" }) => {
          submittedPrompt = input
        },
      },
      command: {
        transform: async (callback: (editor: { add: (definition: ModeCommandDefinition) => void }) => void) => {
          callback({ add: (definition) => { registeredCommand = definition } })
        },
      },
      mcp: {
        transform: async (callback: (editor: {
          get(name: string): Record<string, unknown> | undefined
          set(name: string, server: Record<string, unknown>): void
        }) => void) => {
          callback({
            get: (name) => mcpServers.get(name),
            set: (name, server) => { mcpServers.set(name, server) },
          })
        },
        reload: async () => { mcpReloaded = true },
      },
    }

    await setupOpenCodeV2(context)
    await registeredCommand?.execute({
      sessionID: "mode-command-v2",
      prompt: { text: "bug-bounty" },
      delivery: "steer",
    })

    expect(registeredCommand?.name).toBe("mode")
    expect(submittedPrompt).toEqual({ sessionID: "mode-command-v2", text: "--mode bug-bounty", delivery: "steer" })
    expect(mcpServers.get("playwright")).toEqual({
      type: "local",
      command: ["npx", "-y", "@playwright/mcp@latest"],
      disabled: false,
      codemode: false,
    })
    expect(mcpReloaded).toBe(true)
  })

  it("preserves a user-configured Playwright MCP server in OpenCode V2", async () => {
    const customServer = { type: "local", command: ["bunx", "custom-playwright-mcp"], disabled: false }
    const mcpServers = new Map([["playwright", customServer]])
    const context = {
      session: { hook: async () => undefined, prompt: async () => undefined },
      command: { transform: async () => undefined },
      mcp: {
        transform: async (callback: (editor: {
          get(name: string): Record<string, unknown> | undefined
          set(name: string, server: Record<string, unknown>): void
        }) => void) => {
          callback({
            get: (name) => mcpServers.get(name),
            set: (name, server) => { mcpServers.set(name, server) },
          })
        },
        reload: async () => undefined,
      },
    }

    await setupOpenCodeV2(context)

    expect(mcpServers.get("playwright")).toBe(customServer)
  })

  it("preserves an inline target passed to the native mode command", async () => {
    let registeredCommand: ModeCommandDefinition | undefined
    let submittedPrompt: { readonly sessionID: string; readonly text: string; readonly delivery: "steer" | "queue" } | undefined
    const context = {
      session: {
        hook: async () => undefined,
        prompt: async (input: { readonly sessionID: string; readonly text: string; readonly delivery: "steer" | "queue" }) => {
          submittedPrompt = input
        },
      },
      command: {
        transform: async (callback: (editor: { add: (definition: ModeCommandDefinition) => void }) => void) => {
          callback({ add: (definition) => { registeredCommand = definition } })
        },
      },
      mcp: {
        transform: async (callback: (editor: {
          get(name: string): Record<string, unknown> | undefined
          set(name: string, server: Record<string, unknown>): void
        }) => void) => {
          callback({ get: () => undefined, set: () => undefined })
        },
        reload: async () => undefined,
      },
    }

    await setupOpenCodeV2(context)
    await registeredCommand?.execute({
      sessionID: "mode-command-inline-target-v2",
      prompt: { text: "bug-bounty https://target.example.test" },
      delivery: "steer",
    })

    expect(submittedPrompt).toEqual({
      sessionID: "mode-command-inline-target-v2",
      text: "--mode bug-bounty https://target.example.test",
      delivery: "steer",
    })
  })
})

type ModeCommandDefinition = {
  readonly name: string
  readonly description: string
  readonly execute: (input: {
    readonly sessionID: string
    readonly prompt: { readonly text: string }
    readonly delivery: "steer" | "queue"
  }) => Promise<void>
}
