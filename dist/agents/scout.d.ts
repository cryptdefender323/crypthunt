import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentPromptMetadata } from "./types";
export declare const EXPLORE_PROMPT_METADATA: AgentPromptMetadata;
export declare function createScoutAgent(model: string): AgentConfig;
export declare namespace createScoutAgent {
    var mode: "subagent";
}
