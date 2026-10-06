import type { AvailableCategory, AvailableSkill } from "./agents/dynamic-agent-prompt-builder";
import type { CryptHunterConfig } from "./config";
import type { BrowserAutomationProvider } from "./config/schema/browser-automation";
import type { LoadedSkill } from "./features/opencode-skill-loader/types";
import type { PluginContext, ToolsRecord } from "./plugin/types";
import type { Managers } from "./create-managers";
type CreateToolsResult = {
    filteredTools: ToolsRecord;
    mergedSkills: LoadedSkill[];
    availableSkills: AvailableSkill[];
    availableCategories: AvailableCategory[];
    browserProvider: BrowserAutomationProvider;
    disabledSkills: Set<string>;
    taskSystemEnabled: boolean;
};
export declare function createTools(args: {
    ctx: PluginContext;
    pluginConfig: CryptHunterConfig;
    managers: Pick<Managers, "backgroundManager" | "tmuxSessionManager" | "skillMcpManager" | "modelFallbackControllerAccessor" | "monitorManager">;
}): Promise<CreateToolsResult>;
export {};
