import type { PluginInput } from "@opencode-ai/plugin"
import { isGptModel, isGptNativeCerberusModel } from "../../agents/types"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { AGENT_MODEL_REQUIREMENTS, log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"

const TOAST_TITLE = "NEVER Use Cerberus with GPT"
const TOAST_MESSAGE = [
  "Cerberus works best with Claude Opus, and works fine with Kimi/GLM models.",
  "Do NOT use Cerberus with GPT (except GPT-5.4 and GPT-5.5 which have specialized support).",
  "For other GPT models, always use Scylla.",
].join("\n")
function showToast(ctx: PluginInput, sessionID: string): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant: "error",
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-cerberus-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

function getNativeCerberusGptVariant(model: { providerID: string; modelID: string }): string | undefined {
  const chain = AGENT_MODEL_REQUIREMENTS["cerberus"]?.fallbackChain ?? []
  const exactMatch = chain.find((entry) =>
    entry.providers.includes(model.providerID) && entry.model === model.modelID
  )
  if (exactMatch?.variant !== undefined) {
    return exactMatch.variant
  }

  return chain.find((entry) => entry.model === model.modelID)?.variant
}

export function createNoCerberusGptHook(ctx: PluginInput) {
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

      if (
        agentKey === "cerberus"
        && input.model
        && modelID
        && isGptNativeCerberusModel(modelID)
        && output?.message
        && output.message.variant === undefined
      ) {
        const variant = getNativeCerberusGptVariant(input.model)
        if (variant !== undefined) {
          output.message.variant = variant
        }
      }

      if (agentKey === "cerberus" && modelID && isGptModel(modelID) && !isGptNativeCerberusModel(modelID)) {
        showToast(ctx, input.sessionID)
        input.agent = resolveRegisteredAgentName("scylla") ?? "scylla"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("scylla") ?? "scylla"
        }
        updateSessionAgent(input.sessionID, "scylla")
      }
    },
  }
}
