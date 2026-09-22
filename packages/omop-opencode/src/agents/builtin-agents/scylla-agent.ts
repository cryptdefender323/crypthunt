import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyProviderConnected } from "../../shared"
import { log } from "../../shared/logger"
import { createScyllaAgent, isScyllaSupportedModel } from "../scylla"
import { applyEnvironmentContext } from "./environment-context"
import { applyCategoryOverride, mergeAgentConfig } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { applyFrontierToolSchemaPermission } from "../frontier-tool-schema-guard"

export function maybeCreateScyllaConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
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

  if (disabledAgents.includes("scylla")) return undefined

  const scyllaOverride = agentOverrides["scylla"]
  const scyllaRequirement = AGENT_MODEL_REQUIREMENTS["scylla"]
  const hasScyllaExplicitConfig = scyllaOverride !== undefined

  const hasRequiredProvider =
    !scyllaRequirement?.requiresProvider ||
    hasScyllaExplicitConfig ||
    isFirstRunNoCache ||
    isAnyProviderConnected(scyllaRequirement.requiresProvider, availableModels)

  if (!hasRequiredProvider) {
    log("[agent-registration] Agent skipped: required provider not connected", {
      agent: "scylla",
      requiredProvider: scyllaRequirement?.requiresProvider,
    })
    return undefined
  }

  let scyllaResolution = applyModelResolution({
    userModel: scyllaOverride?.model,
    requirement: scyllaRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !scyllaOverride?.model) {
    scyllaResolution = getFirstFallbackModel(scyllaRequirement)
  }

  if (!scyllaResolution) {
    log("[agent-registration] Agent skipped: model resolution returned no result", {
      agent: "scylla",
      configuredModel: scyllaOverride?.model,
    })
    return undefined
  }
  const { model: scyllaModel, variant: scyllaResolvedVariant } = scyllaResolution

  if (!isScyllaSupportedModel(scyllaModel)) {
    log("[agent-registration] Agent skipped: unsupported Scylla model", {
      agent: "scylla",
      configuredModel: scyllaModel,
    })
    return undefined
  }

  let scyllaConfig = createScyllaAgent(
    scyllaModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  scyllaConfig = { ...scyllaConfig, variant: scyllaResolvedVariant ?? "medium" }

  const hepOverrideCategory = (scyllaOverride as Record<string, unknown> | undefined)?.category as string | undefined
  if (hepOverrideCategory) {
    scyllaConfig = applyCategoryOverride(scyllaConfig, hepOverrideCategory, mergedCategories)
    if (!isScyllaSupportedModel(scyllaConfig.model)) {
      log("[agent-registration] Agent skipped: unsupported Scylla category model", {
        agent: "scylla",
        configuredModel: scyllaConfig.model,
      })
      return undefined
    }
  }

  scyllaConfig = applyEnvironmentContext(scyllaConfig, directory, { disableOmoEnv })

  if (scyllaOverride) {
    scyllaConfig = mergeAgentConfig(scyllaConfig, scyllaOverride, directory)
    if (!isScyllaSupportedModel(scyllaConfig.model)) {
      log("[agent-registration] Agent skipped: unsupported Scylla override model", {
        agent: "scylla",
        configuredModel: scyllaConfig.model,
      })
      return undefined
    }
  }

  const resolvedModel = scyllaConfig.model ?? ""
  scyllaConfig.permission = applyFrontierToolSchemaPermission(
    scyllaConfig.permission,
    resolvedModel,
    scyllaOverride?.permission,
    (scyllaOverride as { tools?: Record<string, boolean> } | undefined)?.tools
  )

  return scyllaConfig
}
