import {
  buildAgentIdentitySection,
  buildAntiPatternsSection,
  buildCategorySkillsDelegationGuide,
  buildDelegationTable,
  buildScoutSection,
  buildHardBlocksSection,
  buildKeyTriggersSection,
  buildIntelSection,
  buildNonClaudePlannerSection,
  buildCipherSection,
  buildParallelDelegationSection,
  buildToolSelectionTable,
} from "./dynamic-agent-prompt-builder";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { buildTaskManagementSection } from "./cerberus/default";

export interface CerberusDynamicPromptSections {
  readonly agentIdentity: string;
  readonly antiPatterns: string;
  readonly categorySkillsGuide: string;
  readonly delegationTable: string;
  readonly scoutSection: string;
  readonly hardBlocks: string;
  readonly keyTriggers: string;
  readonly intelSection: string;
  readonly nonClaudePlannerSection: string;
  readonly cipherSection: string;
  readonly parallelDelegationSection: string;
  readonly taskManagementSection: string;
  readonly todoHookNote: string;
  readonly toolSelection: string;
}

export function buildCerberusDynamicPromptSections(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  useTaskSystem: boolean,
): CerberusDynamicPromptSections {
  return {
    agentIdentity: buildAgentIdentitySection(
      "Cerberus",
      "Powerful AI Agent with orchestration capabilities from OhMyOpenCode",
    ),
    antiPatterns: buildAntiPatternsSection(),
    categorySkillsGuide: buildCategorySkillsDelegationGuide(
      availableCategories,
      availableSkills,
    ),
    delegationTable: buildDelegationTable(availableAgents),
    scoutSection: buildScoutSection(availableAgents),
    hardBlocks: buildHardBlocksSection(),
    keyTriggers: buildKeyTriggersSection(availableAgents, availableSkills),
    intelSection: buildIntelSection(availableAgents),
    nonClaudePlannerSection: buildNonClaudePlannerSection(model),
    cipherSection: buildCipherSection(availableAgents),
    parallelDelegationSection: buildParallelDelegationSection(model, availableCategories),
    taskManagementSection: buildTaskManagementSection(useTaskSystem),
    todoHookNote: buildTodoHookNote(useTaskSystem),
    toolSelection: buildToolSelectionTable(availableAgents, availableTools, availableSkills),
  };
}

function buildTodoHookNote(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return "YOUR TASK CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TASK CONTINUATION])";
  }

  return "YOUR TODO CREATION WOULD BE TRACKED BY HOOK([SYSTEM REMINDER - TODO CONTINUATION])";
}
