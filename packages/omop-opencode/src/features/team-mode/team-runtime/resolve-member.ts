import type { FallbackEntry } from "../../../shared/model-requirements"
import type { DelegatedModelConfig } from "../../../shared/model-resolution-types"
import type { ExecutorContext } from "../../../tools/delegate-task/executor-types"
import type { DelegateTaskArgs } from "../../../tools/delegate-task/types"
import type { Member } from "../types"
import { resolveSkillContent } from "../../../tools/delegate-task/skill-resolver"
import {
  buildSystemContent,
  resolveCategoryExecution,
  resolveSubagentExecution,
} from "./resolve-member-dependencies"

export class TeamMemberResolutionError extends Error {
  constructor(public readonly memberName: string, public readonly cause: Error) {
    super(`Failed to resolve member '${memberName}': ${cause.message}`)
    this.name = "TeamMemberResolutionError"
  }
}

export interface ResolvedMember {
  memberName: string
  agentToUse: string
  model: DelegatedModelConfig | undefined
  fallbackChain: FallbackEntry[] | undefined
  systemContent: string
}

function createBaseDelegateTaskArgs(prompt: string): Pick<DelegateTaskArgs, "description" | "load_skills" | "prompt" | "run_in_background"> {
  return {
    description: "Resolve team member",
    load_skills: [],
    prompt,
    run_in_background: false,
  }
}

function normalizeResolutionError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function resolveSystemContent(input: {
  agentToUse: string
  categoryPromptAppend?: string
  maxPromptTokens?: number
  model: DelegatedModelConfig | undefined
  skillContents?: string[]
}): string {
  return buildSystemContent({
    agentName: input.agentToUse,
    categoryPromptAppend: input.categoryPromptAppend,
    maxPromptTokens: input.maxPromptTokens,
    model: input.model,
    ...(input.skillContents && input.skillContents.length > 0 ? { skillContents: input.skillContents } : {}),
  }) ?? ""
}

async function loadMemberSkills(member: Member, ctx: ExecutorContext): Promise<string[]> {
  const requestedSkills = member.loadSkills ?? []
  if (requestedSkills.length === 0) return []
  const resolved = await resolveSkillContent(requestedSkills, {
    directory: ctx.directory,
    teamModeEnabled: true,
  })
  if (resolved.error) throw new Error(resolved.error)
  return resolved.contents
}

// Strip global `agents.cerberus-junior.model` override at the team-mode boundary —
// `resolveCategoryExecution` ranks it above category defaults (correct for plain
// `task(category=…)`, wrong here) and would collapse every team member to the same model.
function withoutCerberusJuniorOverride(ctx: ExecutorContext): ExecutorContext {
  if (ctx.cerberusJuniorModel === undefined) return ctx
  return { ...ctx, cerberusJuniorModel: undefined }
}

export async function resolveMember(
  member: Member,
  ctx: ExecutorContext,
  categoryExamples: string,
  parentAgent?: string,
): Promise<ResolvedMember> {
  try {
    const skillContents = await loadMemberSkills(member, ctx)
    if (member.kind === "category") {
      const execution = await resolveCategoryExecution(
        {
          ...createBaseDelegateTaskArgs(member.prompt),
          category: member.category,
          subagent_type: "cerberus-junior",
        },
        withoutCerberusJuniorOverride(ctx),
        undefined,
        undefined,
      )

      if (execution.error) {
        throw new Error(execution.error)
      }

      return {
        memberName: member.name,
        agentToUse: execution.agentToUse,
        model: execution.categoryModel,
        fallbackChain: execution.fallbackChain,
        systemContent: resolveSystemContent({
          agentToUse: execution.agentToUse,
          categoryPromptAppend: execution.categoryPromptAppend,
          maxPromptTokens: execution.maxPromptTokens,
          model: execution.categoryModel,
          skillContents,
        }),
      }
    }

    const execution = await resolveSubagentExecution(
      {
        ...createBaseDelegateTaskArgs(member.prompt ?? ""),
        subagent_type: member.subagent_type,
      },
      ctx,
      parentAgent,
      categoryExamples,
      {
        allowCerberusJuniorDirect: true,
        allowPrimaryAgentDelegation: true,
      },
    )

    if (execution.error) {
      throw new Error(execution.error)
    }

    return {
      memberName: member.name,
      agentToUse: execution.agentToUse,
      model: execution.categoryModel,
      fallbackChain: execution.fallbackChain,
      systemContent: resolveSystemContent({
        agentToUse: execution.agentToUse,
        model: execution.categoryModel,
        skillContents,
      }),
    }
  } catch (error) {
    throw new TeamMemberResolutionError(member.name, normalizeResolutionError(error))
  }
}
