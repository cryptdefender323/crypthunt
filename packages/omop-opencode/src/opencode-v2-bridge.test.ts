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
    expect(event.system[0]?.text).toContain("ask the user directly whether they have real authorization")
    expect(event.system[0]?.text).toContain("Ask only for the target domain/IP and wait")
  })

  it("selects Bug Bounty and browser skills during prompt admission", () => {
    const hooks = createOpenCodeV2ModeHandlers()
    const event = prompt("skills-v2", "/mode bug-bounty")

    hooks.onPrompt(event)

    expect(event.prompt.skills).toEqual(["bug-bounty-research", "tool-browser-automation"])
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
    }

    await setupOpenCodeV2(context)
    await registeredCommand?.execute({
      sessionID: "mode-command-v2",
      prompt: { text: "bug-bounty" },
      delivery: "steer",
    })

    expect(registeredCommand?.name).toBe("mode")
    expect(submittedPrompt).toEqual({ sessionID: "mode-command-v2", text: "/mode bug-bounty", delivery: "steer" })
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
