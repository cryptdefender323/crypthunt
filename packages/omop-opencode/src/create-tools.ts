import type { AvailableCategory, AvailableSkill } from "./agents/dynamic-agent-prompt-builder"
import type { CryptHunterConfig } from "./config"
import type { BrowserAutomationProvider } from "./config/schema/browser-automation"
import type { LoadedSkill } from "./features/opencode-skill-loader/types"
import type { PluginContext, ToolsRecord } from "./plugin/types"
import type { Managers } from "./create-managers"

import { createAvailableCategories } from "./plugin/available-categories"
import { createSkillContext } from "./plugin/skill-context"
import { createToolRegistry } from "./plugin/tool-registry"
import { registerPersistenceFs } from "@omop/pentest-core"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

type CreateToolsResult = {
  filteredTools: ToolsRecord
  mergedSkills: LoadedSkill[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  browserProvider: BrowserAutomationProvider
  disabledSkills: Set<string>
  taskSystemEnabled: boolean
}

export async function createTools(args: {
  ctx: PluginContext
  pluginConfig: CryptHunterConfig
  managers: Pick<Managers, "backgroundManager" | "tmuxSessionManager" | "skillMcpManager" | "modelFallbackControllerAccessor" | "monitorManager">
}): Promise<CreateToolsResult> {
  const { ctx, pluginConfig, managers } = args

  // Wire persistence fs so AttackModel survives process restarts (Gap #1 fix)
  const engagementBaseDir = join(ctx.directory, ".omop", "engagement")
  registerPersistenceFs(
    {
      writeFile(path: string, content: string): void {
        try {
          writeFileSync(path, content, "utf8")
        } catch {
          // Non-fatal — in-memory model is still the source of truth
        }
      },
      readFile(path: string): string | null {
        try {
          if (!existsSync(path)) return null
          return readFileSync(path, "utf8")
        } catch {
          return null
        }
      },
      mkdirp(path: string): void {
        try {
          mkdirSync(path, { recursive: true })
        } catch {
          // Ignore — directory may already exist
        }
      },
    },
    engagementBaseDir,
  )

  const skillContext = await createSkillContext({
    directory: ctx.directory,
    pluginConfig,
  })

  const availableCategories = createAvailableCategories(pluginConfig)

  const { filteredTools, taskSystemEnabled } = createToolRegistry({
    ctx,
    pluginConfig,
    managers,
    skillContext,
    availableCategories,
  })

  return {
    filteredTools,
    mergedSkills: skillContext.mergedSkills,
    availableSkills: skillContext.availableSkills,
    availableCategories,
    browserProvider: skillContext.browserProvider,
    disabledSkills: skillContext.disabledSkills,
    taskSystemEnabled,
  }
}
