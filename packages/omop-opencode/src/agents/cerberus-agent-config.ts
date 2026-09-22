import type { AgentConfig } from "@opencode-ai/sdk";
import { getFrontierToolSchemaPermission } from "./frontier-tool-schema-guard";
import { buildClaudeThinkingConfig } from "./types";
import type { AgentMode } from "./types";

const CERBERUS_DESCRIPTION =
  "Powerful AI orchestrator. Plans obsessively with todos, assesses search complexity before exploration, delegates strategically via category+skills combinations. Uses scout for internal code (parallel-friendly), intel for external docs. (Cerberus - OhMyOpenCode)";

function buildCerberusPermission(model: string): AgentConfig["permission"] {
  return {
    question: "allow",
    call_omo_agent: "deny",
    ...getFrontierToolSchemaPermission(model),
  } as AgentConfig["permission"];
}

function buildBaseCerberusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    description: CERBERUS_DESCRIPTION,
    mode,
    model,
    maxTokens: 64000,
    prompt,
    color: "#00CED1",
    permission: buildCerberusPermission(model),
  };
}

export function buildGptCerberusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    ...buildBaseCerberusAgentConfig(mode, model, prompt),
    reasoningEffort: "medium",
  };
}

export function buildGlmCerberusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return buildBaseCerberusAgentConfig(mode, model, prompt);
}

export function buildClaudeCerberusAgentConfig(
  mode: AgentMode,
  model: string,
  prompt: string,
): AgentConfig {
  return {
    ...buildBaseCerberusAgentConfig(mode, model, prompt),
    ...buildClaudeThinkingConfig(model),
  };
}
