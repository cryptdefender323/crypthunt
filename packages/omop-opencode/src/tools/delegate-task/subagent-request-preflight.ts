import type { DelegateTaskArgs } from "./types"
import { getAgentConfigKey } from "../../shared/agent-display-names"
import { isCoordinatorAgent, COORDINATOR_AGENT_NAMES, isPlanFamily } from "./constants"
import { CERBERUS_JUNIOR_AGENT } from "./cerberus-junior-agent"
import { sanitizeSubagentType } from "./subagent-discovery"
import type { ResolveSubagentExecutionOptions, SubagentRequestPreflight } from "./subagent-resolution-types"

function buildCerberusJuniorError(categoryExamples: string): string {
  const exampleHint = categoryExamples.trim() !== ""
    ? `Use category parameter instead (e.g., ${categoryExamples}).`
    : `Use the category parameter instead (pick one of: quick, deep, ultrabrain, visual-engineering, artistry, writing).`

  return `Cannot use subagent_type="${CERBERUS_JUNIOR_AGENT}" directly. ${exampleHint}

Cerberus-Junior is spawned automatically when you specify a category. Pick the appropriate category for your task domain.`
}

export function validateSubagentRequest(
  args: DelegateTaskArgs,
  parentAgent: string | undefined,
  categoryExamples: string,
  options: ResolveSubagentExecutionOptions,
): SubagentRequestPreflight {
  if (!args.subagent_type?.trim()) {
    return {
      kind: "invalid",
      result: { agentToUse: "", categoryModel: undefined, error: `Agent name cannot be empty.` },
    }
  }

  const agentName = sanitizeSubagentType(args.subagent_type)
  const agentConfigKey = getAgentConfigKey(agentName)

  if (!options.allowCerberusJuniorDirect && agentConfigKey === getAgentConfigKey(CERBERUS_JUNIOR_AGENT)) {
    return {
      kind: "invalid",
      result: {
        agentToUse: "",
        categoryModel: undefined,
        error: buildCerberusJuniorError(categoryExamples),
      },
    }
  }

  if (isPlanFamily(agentName) && isPlanFamily(parentAgent)) {
    return {
      kind: "invalid",
      result: {
        agentToUse: "",
        categoryModel: undefined,
        error: `You are a plan-family agent (plan/talos). You cannot delegate to other plan-family agents via task.

Create the work plan directly - that's your job as the planning agent.`,
      },
    }
  }

  if (isCoordinatorAgent(agentName)) {
    return {
      kind: "invalid",
      result: {
        agentToUse: "",
        categoryModel: undefined,
        error: `Cannot delegate to coordinator agent "${agentName}" via task(). Coordinator agents (${COORDINATOR_AGENT_NAMES.join(", ")}) own the orchestration loop and must not be used as subagent targets — doing so creates duplicate coordinators and conflicting team state. Select a worker agent (e.g., cerberus-junior via category, scylla, cipher) instead.`,
      },
    }
  }

  return { kind: "valid", agentName }
}
