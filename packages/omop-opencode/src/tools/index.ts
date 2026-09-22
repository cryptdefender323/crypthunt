export { createGrepTools } from "./grep"
export { createGlobTools } from "./glob"
export { createSkillTool } from "./skill"
export { discoverCommandsSync } from "./slashcommand"
export { createSessionManagerTools } from "./session-manager"

export { sessionExists } from "./session-manager/storage"

export { interactive_bash, startBackgroundCheck as startTmuxCheck } from "./interactive-bash"
export { createSkillMcpTool } from "./skill-mcp"

import {
  createBackgroundOutput,
  createBackgroundCancel,
  type BackgroundOutputManager,
  type BackgroundCancelClient,
} from "./background-task"

import type { PluginInput, ToolDefinition } from "@opencode-ai/plugin"
import type { BackgroundManager } from "../features/background-agent"

type OpencodeClient = PluginInput["client"]

export { createCallOmoAgent } from "./call-omop-agent"
export { createLookAt } from "./look-at"
export { createMonitorTools } from "./monitor"
export { createDelegateTask } from "./delegate-task"
export {
  createTaskCreateTool,
  createTaskGetTool,
  createTaskList,
  createTaskUpdateTool,
} from "./task"
export { createHashlineEditTool } from "./hashline-edit"
export { createTeamSendMessageTool } from "../features/team-mode/tools/messaging"

export function createBackgroundTools(manager: BackgroundManager, client: OpencodeClient): Record<string, ToolDefinition> {
  const outputManager: BackgroundOutputManager = manager
  const cancelClient: BackgroundCancelClient = client
  return {
    background_output: createBackgroundOutput(outputManager, client),
    background_cancel: createBackgroundCancel(manager, cancelClient),
  }
}

// ── Reasoning Layer tools (additive only) ──
export { createPentestTargetModelUpdateTool } from "./pentest-target-model-update"
export { createPentestHypothesizeTool } from "./pentest-hypothesize"
export { createPentestValidateTool } from "./pentest-validate"
export { createPentestConfidenceTool } from "./pentest-confidence"
export { createPentestPivotTool } from "./pentest-pivot"
export { createPentestHandoffTool } from "./pentest-handoff"
