import type { AgentPromptMetadata } from "./types";

export const CERBERUS_PROMPT_METADATA: AgentPromptMetadata = {
  category: "utility",
  cost: "EXPENSIVE",
  promptAlias: "Cerberus",
  triggers: [],
};

export { createCerberusAgent } from "./cerberus-agent-factory";
