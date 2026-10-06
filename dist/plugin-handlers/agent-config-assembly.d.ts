import type { AgentConfig } from "@opencode-ai/sdk";
import type { CryptHunterConfig } from "../config";
import type { AgentSources } from "./agent-config-types";
type BuiltinAgentMap = Record<string, AgentConfig | undefined>;
type AssembleAgentConfigParams = {
    config: Record<string, unknown>;
    pluginConfig: CryptHunterConfig;
    builtinAgents: BuiltinAgentMap;
    sources: AgentSources;
    currentModel: string | undefined;
    useTaskSystem: boolean;
    disabledAgentNames: ReadonlySet<string>;
};
type AssemblyResult = {
    configuredDefaultAgent: string | undefined;
};
export declare function getConfiguredDefaultAgent(config: Record<string, unknown>): string | undefined;
export declare function assembleAgentConfig(params: AssembleAgentConfigParams): Promise<AssemblyResult>;
export {};
