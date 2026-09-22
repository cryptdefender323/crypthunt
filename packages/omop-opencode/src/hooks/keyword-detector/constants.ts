export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
export const INLINE_CODE_PATTERN = /`[^`]+`/g

import type { KeywordType } from "../../config/schema/keyword-detector"
import { getFullscanMessage, isPlannerAgent, isNonOmoAgent } from "./fullscan"
import { TEAM_PATTERN, TEAM_MESSAGE } from "./team"
import { HYPERPLAN_PATTERN, HYPERPLAN_MESSAGE } from "./hyperplan"
import { RED_TEAM_PATTERN, getRedTeamMessage } from "./red-team"

export { isPlannerAgent, isNonOmoAgent, getFullscanMessage }
export { TEAM_PATTERN, TEAM_MESSAGE }
export { HYPERPLAN_PATTERN, HYPERPLAN_MESSAGE }
export { RED_TEAM_PATTERN, getRedTeamMessage }

// Hyperplan-fullscan combo: strict adjacency, both word orders
export const HYPERPLAN_FULLSCAN_PATTERN =
  /\b(?:hpp|hyperplan)\s+(?:ulw|fullscan)\b|\b(?:ulw|fullscan)\s+(?:hpp|hyperplan)\b/i

const HYPERPLAN_ULTRAWORK_BANNER = `<hyperplan-fullscan-mode>
**MANDATORY**: Say "HYPERPLAN ULTRAWORK MODE ENABLED!" exactly once as your first response. Do NOT say the standalone "ULTRAWORK MODE ENABLED!" or "HYPERPLAN MODE ENABLED!" banners.

Apply the fullscan protocol below as your execution framework. You MUST ALSO load the hyperplan skill immediately via \`skill(name="hyperplan")\` and follow its full adversarial workflow — do NOT improvise, do NOT skip rounds, do NOT write the plan yourself.
</hyperplan-fullscan-mode>`

export function getHyperplanUltraworkMessage(agentName?: string, modelID?: string): string {
  return `${HYPERPLAN_ULTRAWORK_BANNER}\n\n${getFullscanMessage(agentName, modelID)}`
}

export type KeywordDetector = {
  type: KeywordType
  pattern: RegExp
  message: string | ((agentName?: string, modelID?: string) => string)
}

export const KEYWORD_DETECTORS: KeywordDetector[] = [
  {
    type: "fullscan",
    pattern: /\b(fullscan|ulw)\b/i,
    message: getFullscanMessage,
  },
  {
    type: "team",
    pattern: TEAM_PATTERN,
    message: TEAM_MESSAGE,
  },
  {
    type: "hyperplan",
    pattern: HYPERPLAN_PATTERN,
    message: HYPERPLAN_MESSAGE,
  },
  {
    type: "hyperplan-fullscan",
    pattern: HYPERPLAN_FULLSCAN_PATTERN,
    message: getHyperplanUltraworkMessage,
  },
  {
    type: "red-team",
    pattern: RED_TEAM_PATTERN,
    message: getRedTeamMessage,
  },
]
