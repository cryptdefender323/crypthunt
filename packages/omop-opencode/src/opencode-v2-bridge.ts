import { detectMode, MODE_PRESETS } from "@omop/pentest-core"
import type { PentestMode } from "@omop/pentest-core"
import { applyManagedToolEnvironment } from "./shared/managed-tool-environment"
import { createOpenCodeV2PlaywrightMcpConfig } from "./shared"

export type OpenCodeV2PromptEvent = {
  readonly sessionID: string
  prompt: { text: string; skills?: OpenCodeV2SkillAttachment[] }
}

export type OpenCodeV2SkillAttachment = {
  readonly id: string
  readonly name: string
  readonly text?: string
  readonly mention?: { readonly start: number; readonly end: number; readonly text: string }
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

type OpenCodeV2McpEditor = {
  get(name: string): Record<string, unknown> | undefined
  set(name: string, server: Record<string, unknown>): void
}

export type OpenCodeV2Context = {
  readonly session: SessionHookRegistry
  readonly command: { transform(callback: (editor: ModeCommandEditor) => void): Promise<unknown> }
  readonly mcp: {
    transform(callback: (editor: OpenCodeV2McpEditor) => void): Promise<unknown>
    reload(): Promise<void>
  }
}

type SessionModeState = {
  readonly mode: PentestMode
  readonly explicit: boolean
  readonly prompt: string
}

const modeCommand = /^(?:\/mode|--mode)\s+([\w-]+)(?:\s+.+)?$/m
const modeOnlyCommand = /^(?:\/mode|--mode)\s+[\w-]+\s*$/m

function parseMode(text: string): PentestMode | undefined {
  const name = modeCommand.exec(text)?.[1]
  return isPentestMode(name) ? name : undefined
}

function isPentestMode(name: string | undefined): name is PentestMode {
  return name !== undefined && Object.hasOwn(MODE_PRESETS, name)
}

function skillsForMode(mode: PentestMode): OpenCodeV2SkillAttachment[] {
  const ids = mode === "bug-bounty"
    ? ["bug-bounty-research", "tool-browser-automation"]
    : MODE_PRESETS[mode].skill_chain.slice(0, 2)
  return ids.map((id) => ({ id, name: id }))
}

function modeInstructions(state: SessionModeState): string {
  const config = MODE_PRESETS[state.mode]
  const modeOnly = modeOnlyCommand.test(state.prompt)
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
      "Load bug-bounty-research and tool-browser-automation skills. Use playwright_browser_navigate and playwright_browser_snapshot from the connected headed Playwright MCP before asking about authorization: search HackerOne, Bugcrowd, Intigriti, YesWeHack, and other relevant official program directories discoverable through browser search for the exact hostname/owner, then inspect the exact owner's VDP/security.txt page. This applies to government agencies, presidential offices, public/private companies, and organizations of any size. Do not claim no program exists until official-source searches have been attempted; report MCP failure explicitly if browser tools cannot run. General web search/third-party aggregators are leads only; record official URLs and exact scope entries. Platform registration is optional only when authoritative written owner permission covers the exact asset and methods. When a target arrives, also gather passive information from external public sources; do not make the user answer questions before this lookup. Do not browse the target application or send test requests until the exact asset and permitted methods are verified. If no public policy or permission is found, finish passive research without probing, then ask once for the private program URL or owner authorization and exact scope/method/time window. Before READY_TO_REPORT, require verified scope/RoE, reproducible raw evidence, demonstrated eligible impact, authorized test data, and consistent evidence files; use only the defined final classifications. Do not submit or contact the program without explicit user instruction. Automated scanners such as sqlmap are allowed only if that verified policy or permission permits them; use narrow, low-rate tests and do not dump data, access files, invoke shells, or continue past a positive signal without explicit authorization.",
      modeOnly
        ? "Ask only for the target domain/IP and wait."
        : "Start the engagement automatically. First use the visible Playwright MCP to search official program directories, including relevant platforms discoverable through browser search, and the owner's VDP/security.txt, while gathering external passive intelligence. This applies equally to government, presidential, public/private company, and other organizations. Do not ask whether to start or show a menu. Verify exact asset/method scope from official policy or owner authorization. Once verified, continue in this session without another start approval through the configured chain (pentest-recon → pentest-enum → pentest-exploit → pentest-report), with hypothesis → permitted test → evidence → control/negative → disproof → report-readiness audit. Load phase skills as needed; preserve CryptHunter's evidence ladder, false-positive review, and reasoning tools. Show concise progress instead of stopping for routine confirmation. Ask only if a required private program URL, account, or rule detail is inaccessible or ambiguous; otherwise continue. If scope cannot be established, finish passive work and ask once before active testing. Stop each test at minimum proof and stop the engagement if policy prohibits the next step. Produce a draft for human review, but never submit/contact the program without explicit user instruction.",
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
      const selectedSkills = new Map((event.prompt.skills ?? []).map((skill) => [skill.id, skill]))
      for (const skill of skillsForMode(detected)) {
        if (!selectedSkills.has(skill.id)) selectedSkills.set(skill.id, skill)
      }
      event.prompt.skills = Array.from(selectedSkills.values())
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
  await context.mcp.transform((editor) => {
    if (editor.get("playwright") !== undefined) return
    editor.set("playwright", createOpenCodeV2PlaywrightMcpConfig())
  })

  const handlers = createOpenCodeV2ModeHandlers()
  await context.session.hook("prompt", handlers.onPrompt)
  await context.session.hook("context", handlers.onContext)
  await context.command.transform((editor) => {
    editor.add({
      name: "mode",
      description: "Select a CryptHunter engagement mode",
      execute: async ({ sessionID, prompt, delivery }) => {
        const [modeName, ...targetParts] = prompt.text.trim().split(/\s+/)
        const selected = parseMode(prompt.text) ?? (isPentestMode(modeName) ? modeName : undefined)
        if (!selected) return
        const target = targetParts.join(" ").trim()
        await context.session.prompt({ sessionID, text: `--mode ${selected}${target ? ` ${target}` : ""}`, delivery })
      },
    })
  })
  await context.mcp.reload()
}
