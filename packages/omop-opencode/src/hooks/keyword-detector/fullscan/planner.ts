import { FULLSCAN_PLANNER_PROMPT } from "@omop/prompts-core"

export const ULTRAWORK_PLANNER_SECTION = FULLSCAN_PLANNER_PROMPT

export function getPlannerUltraworkMessage(): string {
  return `<fullscan-mode>

**MANDATORY**: You MUST say "ULTRAWORK MODE ENABLED!" to the user as your first response when this mode activates. This is non-negotiable.

${ULTRAWORK_PLANNER_SECTION}

</fullscan-mode>

`
}
