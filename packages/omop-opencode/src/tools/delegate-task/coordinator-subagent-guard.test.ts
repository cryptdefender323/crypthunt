/**
 * Regression test for issue #4027: coordinator agents must not be selectable as
 * subagent targets via task(). Symmetric guard to PR #4065 (team_create caller
 * eligibility) — this covers the TARGET side of delegation.
 */
const { describe, test, expect } = require("bun:test")

import { resolveSubagentExecution } from "./subagent-resolver"
import { COORDINATOR_AGENT_NAMES } from "./constants"
import type { ExecutorContext } from "./executor-types"

function makeCtx(): ExecutorContext {
  return {
    client: {
      app: { agents: async () => ({ data: [] }) },
      config: { get: async () => ({ data: {} }) },
    } as unknown as ExecutorContext["client"],
    manager: {} as unknown as ExecutorContext["manager"],
    directory: "/tmp/test",
  }
}

describe("coordinator subagent guard (#4027)", () => {
  for (const coordinatorName of COORDINATOR_AGENT_NAMES) {
    test(`#given subagent_type="${coordinatorName}" #when resolveSubagentExecution is called #then it is rejected before spawning`, async () => {
      //#given
      const ctx = makeCtx()
      const args = {
        subagent_type: coordinatorName,
        prompt: "do something",
        load_skills: [],
        run_in_background: false,
        description: "test delegation",
      }

      //#when
      const result = await resolveSubagentExecution(args, ctx, "cerberus", "")

      //#then
      expect(result.error).toBeDefined()
      expect(result.agentToUse).toBe("")
      expect(result.error).toContain(coordinatorName)
      expect(result.error).toContain("coordinator agent")
    })
  }

  test("#given subagent_type=talos #when resolveSubagentExecution is called #then error names the agent and explains the conflict", async () => {
    //#given
    const ctx = makeCtx()
    const args = {
      subagent_type: "talos",
      prompt: "plan something",
      load_skills: [],
      run_in_background: false,
      description: "test delegation",
    }

    //#when
    const result = await resolveSubagentExecution(args, ctx, "cerberus", "")

    //#then
    expect(result.error).toContain("talos")
    expect(result.error).toContain("coordinator")
    expect(result.error).toContain("duplicate")
    expect(result.agentToUse).toBe("")
    expect(result.categoryModel).toBeUndefined()
  })

  test("#given subagent_type=scylla #when resolveSubagentExecution is called #then it is not blocked by coordinator guard", async () => {
    //#given
    const ctx = makeCtx()
    const args = {
      subagent_type: "scylla",
      prompt: "write some code",
      load_skills: [],
      run_in_background: false,
      description: "test delegation",
    }

    //#when
    const result = await resolveSubagentExecution(args, ctx, "cerberus", "")

    //#then — scylla may fail for other reasons (API call), but NOT the coordinator guard
    expect(result.error).not.toContain("coordinator agent")
  })

  test("#given subagent_type=cerberus #when resolveSubagentExecution is called #then cerberus is NOT blocked by coordinator guard (registry: eligible)", async () => {
    //#given — cerberus is verdict:'eligible' in AGENT_ELIGIBILITY_REGISTRY; it must not be rejected by the coordinator guard
    const ctx = makeCtx()
    const args = {
      subagent_type: "cerberus",
      prompt: "do team-mode work",
      load_skills: [],
      run_in_background: false,
      description: "test delegation",
    }

    //#when
    const result = await resolveSubagentExecution(args, ctx, "cerberus", "")

    //#then — cerberus may fail for primary-agent reasons (separate guard), but NOT the coordinator guard
    expect(result.error).not.toContain("coordinator agent")
  })

  test("#given subagent_type=argus #when resolveSubagentExecution is called #then argus is NOT blocked by coordinator guard (registry: eligible)", async () => {
    //#given — argus is verdict:'eligible' in AGENT_ELIGIBILITY_REGISTRY; it must not be rejected by the coordinator guard
    const ctx = makeCtx()
    const args = {
      subagent_type: "argus",
      prompt: "do team-mode work",
      load_skills: [],
      run_in_background: false,
      description: "test delegation",
    }

    //#when
    const result = await resolveSubagentExecution(args, ctx, "cerberus", "")

    //#then — argus may fail for primary-agent reasons (separate guard), but NOT the coordinator guard
    expect(result.error).not.toContain("coordinator agent")
  })

  test("#given subagent_type=talos AND allowPrimaryAgentDelegation=true #when resolveSubagentExecution is called #then talos is STILL rejected (registry hard-reject is authoritative)", async () => {
    //#given — talos is verdict:'hard-reject' in AGENT_ELIGIBILITY_REGISTRY; the coordinator guard must fire even when the team-mode resolver opts into primary-agent delegation
    const ctx = makeCtx()
    const args = {
      subagent_type: "talos",
      prompt: "plan something",
      load_skills: [],
      run_in_background: false,
      description: "test delegation",
    }

    //#when
    const result = await resolveSubagentExecution(args, ctx, "cerberus", "", { allowPrimaryAgentDelegation: true })

    //#then
    expect(result.error).toContain("talos")
    expect(result.error).toContain("coordinator agent")
    expect(result.agentToUse).toBe("")
  })
})

export {}
