import type { AvailableSkill } from "../agents/dynamic-agent-prompt-builder";
import type { CryptHunterConfig } from "../config";
import type { BrowserAutomationProvider } from "../config/schema/browser-automation";
import type { LoadedSkill } from "../features/opencode-skill-loader/types";
import { collectDisabledSkillAliases } from "../features/opencode-skill-loader";
export type SkillContext = {
    mergedSkills: LoadedSkill[];
    availableSkills: AvailableSkill[];
    browserProvider: BrowserAutomationProvider;
    disabledSkills: Set<string>;
};
export { collectDisabledSkillAliases };
export declare function createSkillContext(args: {
    directory: string;
    pluginConfig: CryptHunterConfig;
}): Promise<SkillContext>;
