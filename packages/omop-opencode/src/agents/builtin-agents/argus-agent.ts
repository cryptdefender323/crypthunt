import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS } from "../../shared"
import { log } from "../../shared/logger"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution } from "./model-resolution"
import { createArgusAgent } from "../argus"

export function maybeCreateArgusConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories,
  } = input

  if (disabledAgents.includes("argus")) return undefined

  const orchestratorOverride = agentOverrides["argus"]
  const argusRequirement = AGENT_MODEL_REQUIREMENTS["argus"]

  let argusResolution = applyModelResolution({
    uiSelectedModel: orchestratorOverride?.model !== undefined ? undefined : uiSelectedModel,
    userModel: orchestratorOverride?.model,
    requirement: argusRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (!argusResolution && orchestratorOverride?.model) {
    // User explicitly configured a model but resolution failed (e.g., cold cache, no system default).
    // Honor the user's choice directly instead of dropping Argus entirely.
    argusResolution = { model: orchestratorOverride.model, provenance: "override" as const }
  }

  if (!argusResolution) {
    log("[agent-registration] Agent skipped: model resolution returned no result", {
      agent: "argus",
      configuredModel: orchestratorOverride?.model,
    })
    return undefined
  }
  const { model: argusModel, variant: argusResolvedVariant } = argusResolution

  let orchestratorConfig = createArgusAgent({
    model: argusModel,
    availableAgents,
    availableSkills,
    userCategories,
  })

  if (argusResolvedVariant) {
    orchestratorConfig = { ...orchestratorConfig, variant: argusResolvedVariant }
  }

  orchestratorConfig = applyOverrides(orchestratorConfig, orchestratorOverride, mergedCategories, directory)

  return orchestratorConfig
}
