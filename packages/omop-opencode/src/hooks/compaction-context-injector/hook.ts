import type { BackgroundManager } from "../../features/background-agent"
import {
  clearCompactionAgentConfigCheckpoint,
  setCompactionAgentConfigCheckpoint,
} from "../../shared/compaction-agent-config-checkpoint"
import { resolveMessageEventSessionID } from "../../shared/event-session-id"
import { log } from "../../shared/logger"
import { COMPACTION_CONTEXT_PROMPT } from "./compaction-context-prompt"
import { resolveSessionPromptConfig } from "./session-prompt-config-resolver"
import { finalizeTrackedAssistantMessage, shouldTreatAssistantPartAsOutput, trackAssistantOutput, type TailMonitorState } from "./tail-monitor"
import { resolveSessionID } from "./session-id"
import type { CompactionContextClient, CompactionContextInjector } from "./types"
import { createRecoveryLogic } from "./recovery"
import { getOrCreateModel, serializeModelToJson } from "@omop/pentest-core"

export function createCompactionContextInjector(options?: {
  ctx?: CompactionContextClient
  backgroundManager?: BackgroundManager
}): CompactionContextInjector {
  const ctx = options?.ctx
  const backgroundManager = options?.backgroundManager
  const tailStates = new Map<string, TailMonitorState>()

  const getTailState = (sessionID: string): TailMonitorState => {
    const existing = tailStates.get(sessionID)
    if (existing) {
      return existing
    }

    const created: TailMonitorState = {
      currentHasOutput: false,
      consecutiveNoTextMessages: 0,
    }
    tailStates.set(sessionID, created)
    return created
  }

  const { recoverCheckpointedAgentConfig, maybeWarnAboutNoTextTail } = createRecoveryLogic(ctx, getTailState)

  const restore = async (sessionID: string): Promise<boolean> => {
    return recoverCheckpointedAgentConfig(sessionID, "compaction.autocontinue")
  }

  const capture = async (sessionID: string): Promise<void> => {
    if (sessionID) {
      clearCompactionAgentConfigCheckpoint(sessionID)
    }

    if (!ctx || !sessionID) {
      return
    }

    const promptConfig = await resolveSessionPromptConfig(ctx, sessionID)
    if (!promptConfig.agent && !promptConfig.model && !promptConfig.tools) {
      return
    }

    setCompactionAgentConfigCheckpoint(sessionID, promptConfig)
    log(`[compaction-context-injector] Captured agent checkpoint before compaction`, {
      sessionID,
      agent: promptConfig.agent,
      model: promptConfig.model,
      hasTools: !!promptConfig.tools,
    })
  }

  const inject = (sessionID?: string): string => {
    let prompt = COMPACTION_CONTEXT_PROMPT

    if (backgroundManager && sessionID) {
      const history = backgroundManager.taskHistory.formatForCompaction(sessionID)
      if (history) {
        prompt += `\n### Active/Recent Delegated Sessions\n${history}\n`
      }
    }

    // Gap #4 fix: serialize the living AttackModel into compaction context so
    // hypotheses, evidence levels, and confirmed findings survive structurally.
    // The LLM receives this as structured JSON — not just prose — enabling
    // exact recovery of hypothesis IDs, evidence ladder positions, and
    // adversarial review state after compaction.
    if (sessionID) {
      try {
        const model = getOrCreateModel(sessionID)
        const hasState =
          model.openHypotheses.size > 0 ||
          model.confirmed.length > 0 ||
          model.signals.techs.length > 0 ||
          model.signals.ports.length > 0

        if (hasState) {
          const modelJson = serializeModelToJson(sessionID, model)
          prompt += `\n\n### CryptHunter Living Attack Model (CRITICAL — restore after compaction)\n`
          prompt += `The following JSON contains the full engagement state including all hypotheses, evidence levels, adversarial review answers, and confirmed findings. `
          prompt += `After compaction, you MUST treat this as authoritative state. Do NOT re-run tests that are already CONFIRMED or REJECTED.\n\n`
          prompt += `\`\`\`json\n${modelJson}\n\`\`\`\n`
          prompt += `\nTo restore tool-level state after compaction: call \`pentest_target_model_update\` with a summary of the above, then call \`pentest_hypothesize\` for any hypotheses that need to be re-registered in the new session context.\n`
        }
      } catch {
        // Non-fatal — compaction proceeds without attack model context
      }
    }

    return prompt
  }

  const event = async ({ event }: { event: { type: string; properties?: unknown } }): Promise<void> => {
    const props = event.properties as Record<string, unknown> | undefined

    if (event.type === "session.deleted") {
      const sessionID = resolveSessionID(props)
      if (sessionID) {
        clearCompactionAgentConfigCheckpoint(sessionID)
        tailStates.delete(sessionID)
      }
      return
    }

    if (event.type === "session.idle") {
      const sessionID = resolveSessionID(props)
      if (!sessionID) {
        return
      }

      const noTextCount = finalizeTrackedAssistantMessage(getTailState(sessionID))
      if (noTextCount > 0) {
        await maybeWarnAboutNoTextTail(sessionID)
      }
      return
    }

    if (event.type === "session.compacted") {
      const sessionID = resolveSessionID(props)
      if (!sessionID) {
        return
      }

      const tailState = getTailState(sessionID)
      finalizeTrackedAssistantMessage(tailState)
      tailState.lastCompactedAt = Date.now()
      await maybeWarnAboutNoTextTail(sessionID)
      await recoverCheckpointedAgentConfig(sessionID, "session.compacted")
      return
    }

    if (event.type === "message.updated") {
      const info = props?.info as {
        id?: string
        role?: string
        sessionID?: string
      } | undefined

      const sessionID = resolveMessageEventSessionID(props)
      if (!sessionID || info?.role !== "assistant" || !info.id) {
        return
      }

      const tailState = getTailState(sessionID)
      if (tailState.currentMessageID && tailState.currentMessageID !== info.id) {
        finalizeTrackedAssistantMessage(tailState)
        await maybeWarnAboutNoTextTail(sessionID)
      }

      if (tailState.currentMessageID !== info.id) {
        tailState.currentMessageID = info.id
        tailState.currentHasOutput = false
      }
      return
    }

    if (event.type === "message.part.delta") {
      const sessionID = resolveMessageEventSessionID(props)
      const messageID = props?.messageID as string | undefined
      const field = props?.field as string | undefined
      const delta = props?.delta as string | undefined

      if (!sessionID || field !== "text" || !delta?.trim()) {
        return
      }

      trackAssistantOutput(getTailState(sessionID), messageID)
      return
    }

    if (event.type === "message.part.updated") {
      const part = props?.part as {
        messageID?: string
        sessionID?: string
        type?: string
        text?: string
      } | undefined

      if (!part?.sessionID || !shouldTreatAssistantPartAsOutput(part)) {
        return
      }

      trackAssistantOutput(getTailState(part.sessionID), part.messageID)
    }
  }

  return { capture, restore, inject, event }
}
