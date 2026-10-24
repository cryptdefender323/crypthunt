import { detectMode, MODE_PRESETS } from "@omop/pentest-core"
import type { PentestMode } from "@omop/pentest-core"
import { applyManagedToolEnvironment } from "./shared/managed-tool-environment"

export type OpenCodeV2PromptEvent = {
  readonly sessionID: string
  prompt: { text: string; skills?: string[] }
}

type SystemPart = { readonly type: "text"; readonly text: string }

export type OpenCodeV2ContextEvent = {
  readonly sessionID: string
  system: SystemPart[]
}

type SessionHookRegistry = {
  hook(name: "prompt", callback: (event: OpenCodeV2PromptEvent) => void): Promise<unknown>
  hook(name: "context", callback: (event: OpenCodeV2ContextEvent) => void): Promise<unknown>
  prompt(input: { readonly sessionID: string; readonly text: string; readonly delivery: "steer" | "queue" }): Promise<unknown>
}

type ModeCommandInput = {
  readonly sessionID: string
  readonly prompt: { readonly text: string }
  readonly delivery: "steer" | "queue"
}

type ModeCommandEditor = {
  add(definition: {
    readonly name: string
    readonly description: string
    readonly execute: (input: ModeCommandInput) => Promise<void>
  }): void
}

export type OpenCodeV2Context = {
  readonly session: SessionHookRegistry
  readonly command: { transform(callback: (editor: ModeCommandEditor) => void): Promise<unknown> }
}

type SessionModeState = {
  readonly mode: PentestMode
  readonly explicit: boolean
  readonly prompt: string
}

const modeCommand = /^(?:\/mode|--mode)\s+([\w-]+)\s*$/m

function parseMode(text: string): PentestMode | undefined {
  const name = modeCommand.exec(text)?.[1]
  return isPentestMode(name) ? name : undefined
}

function isPentestMode(name: string | undefined): name is PentestMode {
  return name !== undefined && Object.hasOwn(MODE_PRESETS, name)
}

function skillsForMode(mode: PentestMode): string[] {
  if (mode === "bug-bounty") return ["bug-bounty-research", "tool-browser-automation"]
  return MODE_PRESETS[mode].skill_chain.slice(0, 2)
}

function modeInstructions(state: SessionModeState): string {
  const config = MODE_PRESETS[state.mode]
  const modeOnly = modeCommand.test(state.prompt)
  const common = [
    "<PENTEST_CONTEXT>",
    `Mode: ${state.mode} — ${config.description}`,
    "This mode is authoritative for the session. Do not ask the user to choose a mode again.",
    `Skill chain: ${config.skill_chain.join(" → ")}`,
    `Tool priority: ${config.tool_priority.join(" → ")}`,
    `Scope: ${config.scope_enforcement}; no_dos=${config.safety_constraints.no_dos}; no_exfiltration=${config.safety_constraints.no_exfiltration}.`,
  ]

  if (state.mode === "bug-bounty") {
    common.push(
      "Load bug-bounty-research and tool-browser-automation skills. Use Playwright in the browser to inspect the official active bug-bounty program before any target request, crawler, scanner, or target navigation; verify the exact asset, exclusions, policy, and allowed methods. If no official program can be verified, ask the user directly whether they have real authorization. A yes only allows collecting/verifying written authorization naming exact asset, allowed methods, and time window; do not send target traffic until verified. If no authorization, stop.",
      modeOnly
        ? "Ask only for the target domain/IP and wait."
        : "Do not contact the target until official program scope or written authorization has been verified.",
    )
  } else if (state.mode === "red-team") {
    common.push(
      "Load red-team-workflow and red-recon skills. Start with passive OSINT only. Before active recon or testing, verify current written authorization and rules of engagement for the exact target, allowed methods, and time window.",
      modeOnly ? "Ask only for the target domain/IP and wait." : "Keep all active work inside the explicitly authorized boundary.",
    )
  } else {
    common.push(`Load the first skill in the ${state.mode} skill chain and begin the matching workflow.`)
  }

  common.push("</PENTEST_CONTEXT>")
  return common.join("\n")
}

export function createOpenCodeV2ModeHandlers(): {
  readonly onPrompt: (event: OpenCodeV2PromptEvent) => void
  readonly onContext: (event: OpenCodeV2ContextEvent) => void
} {
  const sessionModes = new Map<string, SessionModeState>()

  return {
    onPrompt(event): void {
      const prompt = event.prompt.text.trim()
      const selected = parseMode(prompt)
      const previous = sessionModes.get(event.sessionID)
      const detected = selected ?? (previous?.explicit ? previous.mode : detectMode(prompt).mode)
      event.prompt.skills = Array.from(new Set([
        ...(event.prompt.skills ?? []),
        ...skillsForMode(detected),
      ]))
      sessionModes.set(event.sessionID, {
        mode: detected,
        explicit: selected !== undefined || previous?.explicit === true,
        prompt,
      })
    },
    onContext(event): void {
      const state = sessionModes.get(event.sessionID)
      if (!state) return

      const marker = `<PENTEST_CONTEXT>\nMode: ${state.mode} `
      if (event.system.some((part) => part.text.startsWith(marker))) return
      event.system.push({ type: "text", text: modeInstructions(state) })
    },
  }
}

export async function setupOpenCodeV2(context: OpenCodeV2Context): Promise<void> {
  applyManagedToolEnvironment()
  const handlers = createOpenCodeV2ModeHandlers()
  await context.session.hook("prompt", handlers.onPrompt)
  await context.session.hook("context", handlers.onContext)
  await context.command.transform((editor) => {
    editor.add({
      name: "mode",
      description: "Select a CryptHunter engagement mode",
      execute: async ({ sessionID, prompt, delivery }) => {
        const selected = parseMode(prompt.text) ?? (isPentestMode(prompt.text.trim()) ? prompt.text.trim() : undefined)
        if (!selected) return
        await context.session.prompt({ sessionID, text: `/mode ${selected}`, delivery })
      },
    })
  })
}
