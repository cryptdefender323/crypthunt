import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyFallbackModelAvailable } from "../../shared"
import { log } from "../../shared/logger"
import { applyEnvironmentContext } from "./environment-context"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { createCerberusAgent } from "../cerberus"
import { applyFrontierToolSchemaPermission } from "../frontier-tool-schema-guard"

export function maybeCreateCerberusConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv = false,
  } = input

  const cerberusOverride = agentOverrides["cerberus"]
  const cerberusRequirement = AGENT_MODEL_REQUIREMENTS["cerberus"]
  const hasCerberusExplicitConfig = cerberusOverride !== undefined
  const meetsCerberusAnyModelRequirement =
    !cerberusRequirement?.requiresAnyModel ||
    hasCerberusExplicitConfig ||
    isFirstRunNoCache ||
    isAnyFallbackModelAvailable(cerberusRequirement.fallbackChain, availableModels)

  if (!disabledAgents.includes("cerberus") && !meetsCerberusAnyModelRequirement) {
    log("[agent-registration] Agent skipped: no model in fallback chain is available", {
      agent: "cerberus",
    })
  }
  if (disabledAgents.includes("cerberus") || !meetsCerberusAnyModelRequirement) return undefined

  let cerberusResolution = applyModelResolution({
    uiSelectedModel: cerberusOverride?.model !== undefined ? undefined : uiSelectedModel,
    userModel: cerberusOverride?.model,
    requirement: cerberusRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !cerberusOverride?.model && !uiSelectedModel) {
    cerberusResolution = getFirstFallbackModel(cerberusRequirement)
  }

  if (!cerberusResolution) {
    log("[agent-registration] Agent skipped: model resolution returned no result", {
      agent: "cerberus",
      configuredModel: cerberusOverride?.model,
    })
    return undefined
  }
  const { model: cerberusModel, variant: cerberusResolvedVariant } = cerberusResolution

  let cerberusConfig = createCerberusAgent(
    cerberusModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  if (cerberusResolvedVariant) {
    cerberusConfig = { ...cerberusConfig, variant: cerberusResolvedVariant }
  }

  cerberusConfig = applyOverrides(cerberusConfig, cerberusOverride, mergedCategories, directory)

  const resolvedModel = cerberusConfig.model ?? ""
  cerberusConfig.permission = applyFrontierToolSchemaPermission(
    cerberusConfig.permission,
    resolvedModel,
    cerberusOverride?.permission,
    (cerberusOverride as { tools?: Record<string, boolean> } | undefined)?.tools
  )

  cerberusConfig = applyEnvironmentContext(cerberusConfig, directory, {
    disableOmoEnv,
  })

  return cerberusConfig
}
