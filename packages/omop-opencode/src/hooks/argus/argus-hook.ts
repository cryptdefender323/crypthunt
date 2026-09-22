import type { PluginInput } from "@opencode-ai/plugin"
import { createArgusEventHandler } from "./event-handler"
import { createToolExecuteAfterHandler } from "./tool-execute-after"
import { createToolExecuteBeforeHandler } from "./tool-execute-before"
import type { ArgusHookOptions, PendingTaskRef, SessionState } from "./types"

export function createArgusHook(ctx: PluginInput, options?: ArgusHookOptions) {
  const sessions = new Map<string, SessionState>()
  const pendingFilePaths = new Map<string, string>()
  const pendingTaskRefs = new Map<string, PendingTaskRef>()
  const pendingPlanSnapshots = new Map<string, string>()
  const autoCommit = options?.autoCommit ?? true

  function getState(sessionID: string): SessionState {
    let state = sessions.get(sessionID)
    if (!state) {
      state = { promptFailureCount: 0 }
      sessions.set(sessionID, state)
    }
    return state
  }

  return {
    handler: createArgusEventHandler({ ctx, options, sessions, getState }),
    "tool.execute.before": createToolExecuteBeforeHandler({
      ctx,
      pendingFilePaths,
      pendingTaskRefs,
      pendingPlanSnapshots,
      isCallerOrchestrator: options?.isCallerOrchestrator,
    }),
    "tool.execute.after": createToolExecuteAfterHandler({
      ctx,
      pendingFilePaths,
      pendingTaskRefs,
      pendingPlanSnapshots,
      autoCommit,
      getState,
      isCallerOrchestrator: options?.isCallerOrchestrator,
    }),
  }
}
