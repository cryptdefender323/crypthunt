export declare const CODE_BLOCK_PATTERN: RegExp;
export declare const INLINE_CODE_PATTERN: RegExp;
import type { KeywordType } from "../../config/schema/keyword-detector";
import { getFullscanMessage, isPlannerAgent, isNonOmoAgent } from "./fullscan";
import { TEAM_PATTERN, TEAM_MESSAGE } from "./team";
import { HYPERPLAN_PATTERN, HYPERPLAN_MESSAGE } from "./hyperplan";
import { RED_TEAM_PATTERN, getRedTeamMessage } from "./red-team";
export { isPlannerAgent, isNonOmoAgent, getFullscanMessage };
export { TEAM_PATTERN, TEAM_MESSAGE };
export { HYPERPLAN_PATTERN, HYPERPLAN_MESSAGE };
export { RED_TEAM_PATTERN, getRedTeamMessage };
export declare const HYPERPLAN_FULLSCAN_PATTERN: RegExp;
export declare function getHyperplanUltraworkMessage(agentName?: string, modelID?: string): string;
export type KeywordDetector = {
    type: KeywordType;
    pattern: RegExp;
    message: string | ((agentName?: string, modelID?: string) => string);
};
export declare const KEYWORD_DETECTORS: KeywordDetector[];
