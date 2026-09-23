import type { ToolDefinition } from "@opencode-ai/plugin"
import type { SkillLoadOptions } from "../tools/skill/types"
import type { AvailableCategory } from "../agents/dynamic-agent-prompt-builder"
import type { CryptHunterConfig } from "../config"
import type { Managers } from "../create-managers"
import type { SkillContext } from "./skill-context"
import type { PluginContext, ToolsRecord } from "./types"
import type { ToolRegistryFactories } from "./tool-registry-factories"

import { getMainSessionID } from "../features/claude-code-session-state"
import * as openclawRuntimeDispatch from "../openclaw/runtime-dispatch"
import { log } from "../shared"
import { getCerberusJuniorModelOverride } from "./tool-registry-team-tools"

export function createCoreTools(args: {
  readonly ctx: PluginContext
  readonly pluginConfig: CryptHunterConfig
  readonly managers: Pick<Managers, "backgroundManager" | "tmuxSessionManager" | "skillMcpManager" | "modelFallbackControllerAccessor">
  readonly skillContext: SkillContext
  readonly availableCategories: AvailableCategory[]
  readonly factories: ToolRegistryFactories
}): Record<string, ToolDefinition> {
  const { ctx, pluginConfig, managers, skillContext, availableCategories, factories } = args
  const backgroundTools = factories.createBackgroundTools(managers.backgroundManager, ctx.client)
  const callOmoAgent = factories.createCallOmoAgent(
    ctx,
    managers.backgroundManager,
    pluginConfig.disabled_agents ?? [],
    pluginConfig.agents,
    pluginConfig.categories,
    managers.modelFallbackControllerAccessor,
  )
  const isMultimodalLookerEnabled = !(pluginConfig.disabled_agents ?? []).some(
    (agent) => agent.toLowerCase() === "lens",
  )
  const delegateTask = factories.createDelegateTask({
    manager: managers.backgroundManager,
    client: ctx.client,
    directory: ctx.directory,
    userCategories: pluginConfig.categories,
    agentOverrides: pluginConfig.agents,
    gitMasterConfig: pluginConfig.git_master,
    cerberusJuniorModel: getCerberusJuniorModelOverride(pluginConfig.agents?.["cerberus-junior"]),
    browserProvider: skillContext.browserProvider,
    disabledSkills: skillContext.disabledSkills,
    teamModeEnabled: pluginConfig.team_mode?.enabled ?? false,
    availableCategories,
    availableSkills: skillContext.availableSkills,
    nativeSkills: "skills" in ctx ? (ctx as { skills: SkillLoadOptions["nativeSkills"] }).skills : undefined,
    cerberusAgentConfig: pluginConfig.cerberus_agent,
    syncPollTimeoutMs: pluginConfig.background_task?.syncPollTimeoutMs,
    modelFallbackControllerAccessor: managers.modelFallbackControllerAccessor,
    onSyncSessionCreated: async (event) => {
      log("[index] onSyncSessionCreated callback", {
        sessionID: event.sessionID,
        parentID: event.parentID,
        title: event.title,
      })
      await managers.tmuxSessionManager.onSessionCreated({
        type: "session.created",
        properties: {
          info: {
            id: event.sessionID,
            parentID: event.parentID,
            title: event.title,
          },
        },
      })

      if (pluginConfig.openclaw) {
        await openclawRuntimeDispatch.dispatchOpenClawEvent({
          config: pluginConfig.openclaw,
          rawEvent: "session.created",
          context: {
            sessionId: event.sessionID,
            projectPath: ctx.directory,
            tmuxPaneId: managers.tmuxSessionManager.getTrackedPaneId?.(event.sessionID) ?? process.env.TMUX_PANE,
          },
        })
      }
    },
  })

  const getSessionIDForMcp = (): string | undefined => getMainSessionID()
  const skillMcpTool = factories.createSkillMcpTool({
    manager: managers.skillMcpManager,
    getLoadedSkills: () => skillContext.mergedSkills,
    getSessionID: getSessionIDForMcp,
  })
  const commands = factories.discoverCommandsSync(ctx.directory, {
    pluginsEnabled: pluginConfig.claude_code?.plugins ?? true,
    enabledPluginsOverride: pluginConfig.claude_code?.plugins_override,
  })
  const skillTool = factories.createSkillTool({
    directory: ctx.directory,
    commands,
    skills: skillContext.mergedSkills,
    mcpManager: managers.skillMcpManager,
    getSessionID: getSessionIDForMcp,
    gitMasterConfig: pluginConfig.git_master,
    browserProvider: skillContext.browserProvider,
    disabledSkills: skillContext.disabledSkills,
    teamModeEnabled: pluginConfig.team_mode?.enabled ?? false,
    nativeSkills: "skills" in ctx ? (ctx as { skills: SkillLoadOptions["nativeSkills"] }).skills : undefined,
    pluginsEnabled: pluginConfig.claude_code?.plugins ?? true,
    enabledPluginsOverride: pluginConfig.claude_code?.plugins_override,
    includeSkillsInDescription: true,
  })

  const tools: ToolsRecord = {
    ...factories.createGrepTools(ctx),
    ...factories.createGlobTools(ctx),
    ...factories.createSessionManagerTools(ctx),
    ...backgroundTools,
    call_omo_agent: callOmoAgent,
  }
  if (isMultimodalLookerEnabled) {
    tools.look_at = factories.createLookAt(ctx)
  }
  tools.task = delegateTask
  tools.skill_mcp = skillMcpTool
  tools.skill = skillTool

  // ── Reasoning Layer — always-on ──
  tools.pentest_target_model_update = factories.createPentestTargetModelUpdateTool()
  tools.pentest_hypothesize = factories.createPentestHypothesizeTool()
  tools.pentest_validate = factories.createPentestValidateTool()
  tools.pentest_confidence = factories.createPentestConfidenceTool()
  tools.pentest_pivot = factories.createPentestPivotTool()
  tools.pentest_handoff = factories.createPentestHandoffTool()

  return tools
}
