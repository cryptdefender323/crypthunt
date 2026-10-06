import type { ToolDefinition } from "@opencode-ai/plugin";
import type { CryptHunterConfig } from "../config";
import type { Managers } from "../create-managers";
import type { PluginContext } from "./types";
import type { ToolRegistryFactories } from "./tool-registry-factories";
export declare function getCerberusJuniorModelOverride(agentOverride?: {
    model?: string;
}): string | undefined;
export declare function createTeamModeToolsRecord(args: {
    readonly pluginConfig: CryptHunterConfig;
    readonly ctx: PluginContext;
    readonly managers: Pick<Managers, "backgroundManager" | "tmuxSessionManager">;
    readonly factories: ToolRegistryFactories;
}): Record<string, ToolDefinition>;
