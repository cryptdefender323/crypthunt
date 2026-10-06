import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentMode } from "./types";
export declare function buildGptCerberusAgentConfig(mode: AgentMode, model: string, prompt: string): AgentConfig;
export declare function buildGlmCerberusAgentConfig(mode: AgentMode, model: string, prompt: string): AgentConfig;
export declare function buildClaudeCerberusAgentConfig(mode: AgentMode, model: string, prompt: string): AgentConfig;
