import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentMode, AgentPromptMetadata } from "../types";
import { isGpt5_5Model } from "../types";
import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "../dynamic-agent-prompt-builder";
import { categorizeTools, buildAgentIdentitySection } from "../dynamic-agent-prompt-builder";
import { getFrontierToolSchemaPermission } from "../frontier-tool-schema-guard";

import { buildScyllaPrompt as buildGptPrompt } from "./gpt";
import { buildScyllaPrompt as buildGpt54Prompt } from "./gpt-5-4";
import { buildGpt55ScyllaPrompt as buildGpt55Prompt } from "./gpt-5-5";

const MODE: AgentMode = "primary";
const GPT_5_3_CODEX_RE = /^gpt-5[.-]3-codex(?:$|[.-])/i;
const GPT_5_4_RE = /^gpt-5[.-]4(?:$|[.-])/i;
const GPT_5_5_RE = /^gpt-5[.-]5(?:$|[.-])/i;

export type ScyllaPromptSource = "gpt-5-5" | "gpt-5-4" | "gpt";

export class UnsupportedScyllaModelError extends Error {
  readonly model: string | undefined;

  constructor(model: string | undefined) {
    super(
      `Scylla only supports GPT-5.3 Codex, GPT-5.4, and GPT-5.5 models; received ${model ?? "no model"}.`,
    );
    this.name = "UnsupportedScyllaModelError";
    this.model = model;
  }
}

function extractModelName(model: string): string {
  return model.includes("/") ? (model.split("/").pop() ?? model) : model;
}

export function isScyllaSupportedModel(model: string | undefined): boolean {
  if (!model) return false;
  const modelName = extractModelName(model);
  return GPT_5_3_CODEX_RE.test(modelName) || GPT_5_4_RE.test(modelName) || GPT_5_5_RE.test(modelName);
}

function assertScyllaSupportedModel(model: string | undefined): void {
  if (!isScyllaSupportedModel(model)) {
    throw new UnsupportedScyllaModelError(model);
  }
}

export function getScyllaPromptSource(
  model?: string,
): ScyllaPromptSource {
  assertScyllaSupportedModel(model);
  if (model && isGpt5_5Model(model)) {
    return "gpt-5-5";
  }
  if (model && GPT_5_4_RE.test(extractModelName(model))) {
    return "gpt-5-4";
  }
  return "gpt";
}

export interface ScyllaContext {
  model?: string;
  availableAgents?: AvailableAgent[];
  availableTools?: AvailableTool[];
  availableSkills?: AvailableSkill[];
  availableCategories?: AvailableCategory[];
  useTaskSystem?: boolean;
}

export function getScyllaPrompt(
  model?: string,
  useTaskSystem = false,
): string {
  return buildDynamicScyllaPrompt({ model, useTaskSystem });
}

function buildDynamicScyllaPrompt(ctx?: ScyllaContext): string {
  const agents = ctx?.availableAgents ?? [];
  const tools = ctx?.availableTools ?? [];
  const skills = ctx?.availableSkills ?? [];
  const categories = ctx?.availableCategories ?? [];
  const useTaskSystem = ctx?.useTaskSystem ?? false;
  const model = ctx?.model;

  const source = getScyllaPromptSource(model);

  let basePrompt: string;
  switch (source) {
    case "gpt-5-5":
      basePrompt = buildGpt55Prompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      break;
    case "gpt-5-4":
      basePrompt = buildGpt54Prompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      break;
    case "gpt":
    default:
      basePrompt = buildGptPrompt(
        agents,
        tools,
        skills,
        categories,
        useTaskSystem,
      );
      break;
  }

  const agentIdentity = buildAgentIdentitySection(
    "Scylla",
    "Autonomous deep worker for software engineering from OhMyOpenCode",
  );

  return `${agentIdentity}\n${basePrompt}`;
}

export function createScyllaAgent(
  model: string,
  availableAgents?: AvailableAgent[],
  availableToolNames?: string[],
  availableSkills?: AvailableSkill[],
  availableCategories?: AvailableCategory[],
  useTaskSystem = false,
): AgentConfig {
  const tools = availableToolNames ? categorizeTools(availableToolNames) : [];

  const prompt = buildDynamicScyllaPrompt({
    model,
    availableAgents,
    availableTools: tools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  });

  return {
    description:
      "Autonomous Deep Worker - goal-oriented execution with GPT Codex. Scouts thoroughly before acting, uses scout/intel agents for comprehensive context, completes tasks end-to-end. Inspired by AmpCode deep mode. (Scylla - OhMyOpenCode)",
    mode: MODE,
    model,
    maxTokens: 32000,
    prompt,
    color: "#D97706",
    permission: {
      question: "allow",
      call_omo_agent: "deny",
      ...getFrontierToolSchemaPermission(model),
    } as AgentConfig["permission"],
    reasoningEffort: "medium",
  };
}
createScyllaAgent.mode = MODE;

export const scyllaPromptMetadata: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "Scylla",
  triggers: [
    {
      domain: "Autonomous deep work",
      trigger: "End-to-end task completion without premature stopping",
    },
    {
      domain: "Complex implementation",
      trigger: "Multi-step implementation requiring thorough exploration",
    },
  ],
  useWhen: [
    "Task requires deep exploration before implementation",
    "User wants autonomous end-to-end completion",
    "Complex multi-file changes needed",
  ],
  avoidWhen: [
    "Simple single-step tasks",
    "Tasks requiring user confirmation at each step",
    "When orchestration across multiple agents is needed (use Argus)",
  ],
  keyTrigger: "Complex implementation task requiring autonomous deep work",
};
