import type { CategoryConfig } from "../config/schema";
import { TALOS_PERMISSION, getTalosPrompt } from "../agents/talos";
import { resolvePromptAppend } from "../agents/builtin-agents/resolve-file-uri";
import { AGENT_MODEL_REQUIREMENTS } from "../shared/model-requirements";
import type { FallbackEntry } from "../shared/model-requirements";
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  resolveModelPipeline,
} from "../shared";
import { resolveCategoryConfig } from "./category-config-resolver";

type TalosOverride = Record<string, unknown> & {
  category?: string;
  model?: string;
  variant?: string;
  reasoningEffort?: string;
  textVerbosity?: string;
  thinking?: { type: string; budgetTokens?: number };
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  prompt?: string;
  prompt_append?: string;
};

function isModelInFallbackChain(
  model: string | undefined,
  fallbackChain: FallbackEntry[] | undefined,
): boolean {
  if (!model || !fallbackChain || fallbackChain.length === 0) {
    return false;
  }

  const modelParts = model.split("/");
  const modelName = modelParts.length >= 2 ? modelParts.slice(1).join("/") : model;

  return fallbackChain.some((entry) => entry.model === modelName);
}

export async function buildTalosAgentConfig(params: {
  configAgentPlan: Record<string, unknown> | undefined;
  pluginTalosOverride: TalosOverride | undefined;
  userCategories: Record<string, CategoryConfig> | undefined;
  currentModel: string | undefined;
  disabledTools?: readonly string[];
}): Promise<Record<string, unknown>> {
  const categoryConfig = params.pluginTalosOverride?.category
    ? resolveCategoryConfig(params.pluginTalosOverride.category, params.userCategories)
    : undefined;

  const requirement = AGENT_MODEL_REQUIREMENTS["talos"];
  const connectedProviders = readConnectedProvidersCache();
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: connectedProviders ?? undefined,
  });

  const configuredTalosModel =
    params.pluginTalosOverride?.model ?? categoryConfig?.model;

  const shouldUseCurrentModel = isModelInFallbackChain(
    params.currentModel,
    requirement?.fallbackChain,
  );

  const modelResolution = resolveModelPipeline({
    intent: {
      uiSelectedModel: configuredTalosModel
        ? undefined
        : shouldUseCurrentModel
          ? params.currentModel
          : undefined,
      userModel: params.pluginTalosOverride?.model,
      categoryDefaultModel: categoryConfig?.model,
    },
    constraints: { availableModels },
    policy: {
      fallbackChain: requirement?.fallbackChain,
      systemDefaultModel: undefined,
    },
  });

  const resolvedModel = modelResolution?.model;
  const resolvedVariant = modelResolution?.variant;

  const variantToUse = params.pluginTalosOverride?.variant ?? resolvedVariant;
  const reasoningEffortToUse =
    params.pluginTalosOverride?.reasoningEffort ?? categoryConfig?.reasoningEffort;
  const textVerbosityToUse =
    params.pluginTalosOverride?.textVerbosity ?? categoryConfig?.textVerbosity;
  const thinkingToUse = params.pluginTalosOverride?.thinking ?? categoryConfig?.thinking;
  const temperatureToUse =
    params.pluginTalosOverride?.temperature ?? categoryConfig?.temperature;
  const topPToUse = params.pluginTalosOverride?.top_p ?? categoryConfig?.top_p;
  const maxTokensToUse =
    params.pluginTalosOverride?.maxTokens ?? categoryConfig?.maxTokens;

  const base: Record<string, unknown> = {
    ...(resolvedModel ? { model: resolvedModel } : {}),
    ...(variantToUse ? { variant: variantToUse } : {}),
    mode: "primary",
    prompt: getTalosPrompt(resolvedModel, params.disabledTools),
    permission: TALOS_PERMISSION,
    description: `${(params.configAgentPlan?.description as string) ?? "Plan agent"} (Talos - OhMyOpenCode)`,
    color: (params.configAgentPlan?.color as string) ?? "#FF5722",
    ...(temperatureToUse !== undefined ? { temperature: temperatureToUse } : {}),
    ...(topPToUse !== undefined ? { top_p: topPToUse } : {}),
    ...(maxTokensToUse !== undefined ? { maxTokens: maxTokensToUse } : {}),
    ...(categoryConfig?.tools ? { tools: categoryConfig.tools } : {}),
    ...(thinkingToUse ? { thinking: thinkingToUse } : {}),
    ...(reasoningEffortToUse !== undefined
      ? { reasoningEffort: reasoningEffortToUse }
      : {}),
    ...(textVerbosityToUse !== undefined
      ? { textVerbosity: textVerbosityToUse }
      : {}),
  };

  const override = params.pluginTalosOverride;
  if (!override) return base;

  const { prompt, prompt_append, ...restOverride } = override;
  const merged = { ...base, ...restOverride };
  if (typeof merged.prompt === "string") {
    for (const promptAddition of [prompt, prompt_append]) {
      if (promptAddition) {
        merged.prompt = merged.prompt + "\n" + resolvePromptAppend(promptAddition);
      }
    }
  }
  return merged;
}
