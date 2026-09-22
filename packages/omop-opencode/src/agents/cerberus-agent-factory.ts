import type { AgentConfig } from "@opencode-ai/sdk";
import { categorizeTools } from "./dynamic-agent-prompt-builder";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-builder";
import {
  buildClaudeCerberusAgentConfig,
  buildGlmCerberusAgentConfig,
  buildGptCerberusAgentConfig,
} from "./cerberus-agent-config";
import { buildFallbackCerberusPrompt } from "./cerberus-dynamic-prompt";
import { buildClaudeFable5CerberusPrompt } from "./cerberus/claude-fable-5";
import { buildClaudeOpus47CerberusPrompt } from "./cerberus/claude-opus-4-7";
import { buildClaudeOpus48CerberusPrompt } from "./cerberus/claude-opus-4-8";
import { buildGlm52CerberusPrompt } from "./cerberus/glm-5-2";
import { buildGpt54CerberusPrompt } from "./cerberus/gpt-5-4";
import { buildGpt55CerberusPrompt } from "./cerberus/gpt-5-5";
import { buildKimiK26CerberusPrompt } from "./cerberus/kimi-k2-6";
import { buildKimiK27CerberusPrompt } from "./cerberus/kimi-k2-7";
import type { AgentMode } from "./types";
import {
  isClaudeFable5Model,
  isClaudeOpus47Model,
  isClaudeOpus48Model,
  isGlmModel,
  isGpt5_5Model,
  isGptModel,
  isGptNativeCerberusModel,
  isKimiK2Model,
  isKimiK27Model,
} from "./types";

const MODE: AgentMode = "primary";

export function createCerberusAgent(
  model: string,
  availableAgents?: AvailableAgent[],
  availableToolNames?: string[],
  availableSkills?: AvailableSkill[],
  availableCategories?: AvailableCategory[],
  useTaskSystem = false,
): AgentConfig {
  const tools = availableToolNames ? categorizeTools(availableToolNames) : [];
  const skills = availableSkills ?? [];
  const categories = availableCategories ?? [];
  const agents = availableAgents ?? [];

  if (isKimiK27Model(model)) {
    return buildGptCerberusAgentConfig(
      MODE,
      model,
      buildKimiK27CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isKimiK2Model(model)) {
    return buildGptCerberusAgentConfig(
      MODE,
      model,
      buildKimiK26CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isGpt5_5Model(model)) {
    return buildGptCerberusAgentConfig(
      MODE,
      model,
      buildGpt55CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isGptNativeCerberusModel(model)) {
    return buildGptCerberusAgentConfig(
      MODE,
      model,
      buildGpt54CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isClaudeFable5Model(model)) {
    return buildClaudeCerberusAgentConfig(
      MODE,
      model,
      buildClaudeFable5CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isClaudeOpus48Model(model)) {
    return buildClaudeCerberusAgentConfig(
      MODE,
      model,
      buildClaudeOpus48CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isClaudeOpus47Model(model)) {
    return buildClaudeCerberusAgentConfig(
      MODE,
      model,
      buildClaudeOpus47CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  if (isGlmModel(model)) {
    return buildGlmCerberusAgentConfig(
      MODE,
      model,
      buildGlm52CerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
    );
  }

  const prompt = buildFallbackCerberusPrompt(
    model,
    agents,
    tools,
    skills,
    categories,
    useTaskSystem,
  );

  if (isGptModel(model)) {
    return buildGptCerberusAgentConfig(MODE, model, prompt);
  }

  return buildClaudeCerberusAgentConfig(MODE, model, prompt);
}
createCerberusAgent.mode = MODE;
