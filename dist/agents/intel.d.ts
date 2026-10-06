import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentPromptMetadata } from "./types";
export declare const LIBRARIAN_PROMPT_METADATA: AgentPromptMetadata;
export declare function createIntelAgent(model: string): AgentConfig;
export declare namespace createIntelAgent {
    var mode: "subagent";
}
