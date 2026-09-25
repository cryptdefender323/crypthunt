import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"
import type { CategoriesConfig, GitMasterConfig } from "../config/schema"
import type { LoadedSkill } from "../features/opencode-skill-loader/types"
import type { BrowserAutomationProvider } from "../config/schema"
import { createCerberusAgent } from "./cerberus"
import { createCipherAgent, ORACLE_PROMPT_METADATA } from "./cipher"
import { createIntelAgent, LIBRARIAN_PROMPT_METADATA } from "./intel"
import { createScoutAgent, EXPLORE_PROMPT_METADATA } from "./scout"
import { createMultimodalLookerAgent, LENS_PROMPT_METADATA } from "./lens"
import { createVanguardAgent, vanguardPromptMetadata } from "./vanguard"
import { createArgusAgent, argusPromptMetadata } from "./argus"
import { createSentinelAgent, sentinelPromptMetadata } from "./sentinel"
import { createScyllaAgent } from "./scylla"
import { createCerberusJuniorAgentWithOverrides } from "./cerberus-junior"
import type { AvailableCategory } from "./dynamic-agent-prompt-builder"
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  readProviderModelsCache,
} from "../shared"
import { CATEGORY_DESCRIPTIONS } from "../tools/delegate-task/constants"
import { mergeCategories } from "../shared/merge-categories"
import { buildAvailableSkills } from "./builtin-agents/available-skills"
import { collectPendingBuiltinAgents } from "./builtin-agents/general-agents"
import { maybeCreateCerberusConfig } from "./builtin-agents/cerberus-agent"
import { maybeCreateScyllaConfig } from "./builtin-agents/scylla-agent"
import { maybeCreateArgusConfig } from "./builtin-agents/argus-agent"
import { enhanceAgentForMultiAgentCoordination } from "./multi-agent-coordination"

type AgentSource = AgentFactory | AgentConfig

const agentSources: Record<BuiltinAgentName, AgentSource> = {
  cerberus: createCerberusAgent,
  scylla: createScyllaAgent,
  cipher: createCipherAgent,
  intel: createIntelAgent,
  scout: createScoutAgent,
  "lens": createMultimodalLookerAgent,
  vanguard: createVanguardAgent,
  sentinel: createSentinelAgent,
  // Note: Argus is handled specially in createBuiltinAgents()
  // because it needs OrchestratorContext, not just a model string
  argus: createArgusAgent as AgentFactory,
  "cerberus-junior": createCerberusJuniorAgentWithOverrides as AgentFactory,
}

/**
 * Metadata for each agent, used to build Cerberus's dynamic prompt sections
 * (Delegation Table, Tool Selection, Key Triggers, etc.)
 */
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  cipher: ORACLE_PROMPT_METADATA,
  intel: LIBRARIAN_PROMPT_METADATA,
  scout: EXPLORE_PROMPT_METADATA,
  "lens": LENS_PROMPT_METADATA,
  vanguard: vanguardPromptMetadata,
  sentinel: sentinelPromptMetadata,
  argus: argusPromptMetadata,
}

export async function createBuiltinAgents(
  disabledAgents: string[] = [],
  agentOverrides: AgentOverrides = {},
  directory?: string,
  systemDefaultModel?: string,
  categories?: CategoriesConfig,
  gitMasterConfig?: GitMasterConfig,
  discoveredSkills: LoadedSkill[] = [],
  _customAgentSummaries?: unknown,
  browserProvider?: BrowserAutomationProvider,
  uiSelectedModel?: string,
  disabledSkills?: Set<string>,
  useTaskSystem = false,
  disableOmoEnv = false,
  teamModeEnabled = false,
): Promise<Record<string, AgentConfig>> {

  const connectedProviders = readConnectedProvidersCache()
  const providerModelsConnected = connectedProviders
    ? (readProviderModelsCache()?.connected ?? [])
    : []
  const mergedConnectedProviders = Array.from(
    new Set([...(connectedProviders ?? []), ...providerModelsConnected])
  )
  // IMPORTANT: Do NOT call OpenCode client APIs during plugin initialization.
  // This function is called from config handler, and calling client API causes deadlock.
  // See: https://github.com/cryptdefender323/crypthunter/issues/1301
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: mergedConnectedProviders.length > 0 ? mergedConnectedProviders : undefined,
  })
  const isFirstRunNoCache =
    availableModels.size === 0 && mergedConnectedProviders.length === 0

  const result: Record<string, AgentConfig> = {}

  const mergedCategories = mergeCategories(categories)

  const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(([name]) => ({
    name,
    description: categories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks",
  }))

  // Collect general agents first (for availableAgents), but don't add to result yet
  const { pendingAgentConfigs, availableAgents } = collectPendingBuiltinAgents({
    agentSources,
    agentMetadata,
    disabledAgents,
    agentOverrides,
    directory,
    systemDefaultModel,
    mergedCategories,
    gitMasterConfig,
    browserProvider,
    uiSelectedModel,
    availableModels,
    isFirstRunNoCache,
    disabledSkills,
    teamModeEnabled,
    disableOmoEnv,
  })

  const cerberusConfig = maybeCreateCerberusConfig({
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills: buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills, teamModeEnabled, "cerberus"),
    availableCategories,
    mergedCategories,
    directory,
    userCategories: categories,
    useTaskSystem,
    disableOmoEnv,
  })
  if (cerberusConfig) {
    result["cerberus"] = cerberusConfig
  }

  const scyllaConfig = maybeCreateScyllaConfig({
    disabledAgents,
    agentOverrides,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills: buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills, teamModeEnabled, "scylla"),
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv,
  })
  if (scyllaConfig) {
    result["scylla"] = scyllaConfig
  }

  // Add pending agents after cerberus and scylla to maintain order
  for (const [name, config] of pendingAgentConfigs) {
    result[name] = config
  }

  const argusConfig = maybeCreateArgusConfig({
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills: buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills, teamModeEnabled, "argus"),
    mergedCategories,
    directory,
    userCategories: categories,
  })
  if (argusConfig) {
    result["argus"] = argusConfig
  }

  return Object.fromEntries(
    Object.entries(result).map(([name, config]) => [
      name,
      enhanceAgentForMultiAgentCoordination(config, name),
    ]),
  )
}
