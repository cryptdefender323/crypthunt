import type { PluginInput } from "@opencode-ai/plugin"
import { isGptModel } from "../../agents/types"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"

const TOAST_TITLE = "NEVER Use Scylla with Non-GPT"
const TOAST_MESSAGE = [
  "Scylla is designed exclusively for GPT models.",
  "Scylla is trash without GPT.",
  "For Claude/Kimi/GLM models, always use Cerberus.",
].join("\n")
type NoScyllaNonGptHookOptions = {
  allowNonGptModel?: boolean
}

function showToast(ctx: PluginInput, sessionID: string, variant: "error" | "warning"): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant,
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-scylla-non-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

export function createNoScyllaNonGptHook(
  ctx: PluginInput,
  options?: NoScyllaNonGptHookOptions,
) {
  return {
    "chat.message": async (input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
    }, output?: {
      message?: { agent?: string; [key: string]: unknown }
    }): Promise<void> => {
      const rawAgent = input.agent ?? getSessionAgent(input.sessionID) ?? ""
      const agentKey = getAgentConfigKey(rawAgent)
      const modelID = input.model?.modelID
      const allowNonGptModel = options?.allowNonGptModel === true

      if (agentKey === "scylla" && modelID && !isGptModel(modelID)) {
        showToast(ctx, input.sessionID, allowNonGptModel ? "warning" : "error")
        if (allowNonGptModel) {
          return
        }
        input.agent = resolveRegisteredAgentName("cerberus") ?? "cerberus"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("cerberus") ?? "cerberus"
        }
        updateSessionAgent(input.sessionID, "cerberus")
      }
    },
  }
}
