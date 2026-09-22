import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { renderExecutionSections } from "./cerberus-dynamic-prompt-execution";
import { renderExplorationSection } from "./cerberus-dynamic-prompt-exploration";
import { renderRoleAndIntentSections } from "./cerberus-dynamic-prompt-role";
import { buildCerberusDynamicPromptSections } from "./cerberus-dynamic-prompt-sections";
import { renderToneAndConstraintsSection } from "./cerberus-dynamic-prompt-style";

export function buildCerberusDynamicPromptContent(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  useTaskSystem: boolean,
): string {
  const sections = buildCerberusDynamicPromptSections(
    model,
    availableAgents,
    availableTools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  );

  return `${renderRoleAndIntentSections(sections)}

${renderExplorationSection(sections)}

${renderExecutionSections(sections)}

${renderToneAndConstraintsSection(sections)}`;
}
