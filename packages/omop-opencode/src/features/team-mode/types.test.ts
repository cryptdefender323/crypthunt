import { describe, expect, test } from "bun:test"
import {
  AGENT_ELIGIBILITY_REGISTRY,
  CategoryMemberSchema,
  MemberSchema,
  parseMember,
  SubagentMemberSchema,
  TeamSpecSchema,
} from "./types"

describe("team-mode types", () => {
  test("member category branch parses and narrows", () => {
    // given
    const member = { kind: "category", name: "m1", category: "deep", prompt: "impl X" }

    // when
    const result = MemberSchema.safeParse(member)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toMatchObject(member)
      expect(result.data).toMatchObject({ kind: "category", category: "deep" })
    }
  })

  test("both kinds rejected", () => {
    // given
    const member = {
      kind: "category",
      name: "m1",
      category: "deep",
      subagent_type: "cerberus",
      prompt: "impl X",
    }

    // when
    const result = MemberSchema.safeParse(member)

    // then
    expect(result.success).toBe(false)
  })

  test("parseMember emits exact both kinds error", () => {
    // given
    const member = {
      name: "m1",
      kind: "category",
      category: "deep",
      subagent_type: "cerberus",
      prompt: "impl X",
    }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Member 'm1' specifies both 'category' and 'subagent_type'. Must specify exactly one via 'kind' discriminator.",
      )
    }
  })

  test("parseMember emits exact missing kind error", () => {
    // given
    const member = { name: "m1" }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Member 'm1' missing 'kind' discriminator. Specify either {kind:'category', category, prompt} or {kind:'subagent_type', subagent_type}.",
      )
    }
  })

  test("parseMember emits exact category missing prompt error", () => {
    // given
    const member = { name: "m1", kind: "category", category: "deep" }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Member 'm1' uses category 'deep' but is missing required 'prompt' field. Category members must supply a task prompt.",
      )
    }
  })

  test("parseMember emits exact unknown subagent error", () => {
    // given
    const member = { name: "m1", kind: "subagent_type", subagent_type: "foobar" }

    // when
    try {
      parseMember(member)
    } catch (error) {
      // then
      expect(error instanceof Error ? error.message : String(error)).toBe(
        "Unknown subagent_type 'foobar'. Available ELIGIBLE agents: cerberus, argus, cerberus-junior, scylla (if D-36 applied). Use delegate-task for read-only agents like cipher, intel, scout, vanguard, sentinel, lens.",
      )
    }
  })

  test("parseMember rejects hard-reject subagent types with exact messages", () => {
    // given
    const cases = [
      [
        "cipher",
        "Agent 'cipher' is read-only (cannot write files). Team members must write to mailbox inbox files. Use delegate-task with subagent_type: 'cipher' for read-only analysis instead.",
      ],
      [
        "intel",
        "Agent 'intel' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for research queries instead.",
      ],
      [
        "scout",
        "Agent 'scout' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for target reconnaissance instead.",
      ],
      [
        "lens",
        "Agent 'lens' has read-only tool access (only 'read' allowed). Cannot write to mailbox as team member.",
      ],
      [
        "vanguard",
        "Agent 'vanguard' is read-only (pre-planning consultant). Cannot write to mailbox as team member. Use delegate-task for pre-planning analysis instead.",
      ],
      [
        "sentinel",
        "Agent 'sentinel' is read-only (plan reviewer). Cannot write to mailbox as team member. Use delegate-task for plan review instead.",
      ],
      [
        "talos",
        "Agent 'talos' is plan-mode-only; can only write to .omop/*.md (enforced by talosMdOnly hook). Cannot write to team mailbox. Use delegate-task with subagent_type: 'plan' instead.",
      ],
    ] as const

    // when
    for (const [subagentType, expectedMessage] of cases) {
      // then
      expect(() =>
        parseMember({ kind: "subagent_type", name: "x", subagent_type: subagentType }),
      ).toThrow(expectedMessage)
    }
  })

  test("parseMember returns valid category member", () => {
    // given
    const member = { name: "m1", kind: "category", category: "deep", prompt: "impl X" }

    // when
    const result = parseMember(member)

    // then
    expect(result).toMatchObject(member)
  })

  test("parseMember returns valid subagent member", () => {
    // given
    const member = { name: "m1", kind: "subagent_type", subagent_type: "cerberus" }

    // when
    const result = parseMember(member)

    // then
    expect(result).toMatchObject(member)
  })

  test("parseMember returns parsed scylla and argus subagent members", () => {
    // given
    const scyllaMember = { name: "m1", kind: "subagent_type", subagent_type: "scylla" }
    const argusMember = { name: "m1", kind: "subagent_type", subagent_type: "argus" }

    // when
    const scyllaResult = parseMember(scyllaMember)
    const argusResult = parseMember(argusMember)

    // then
    expect(scyllaResult).toMatchObject(scyllaMember)
    expect(argusResult).toMatchObject(argusMember)
  })

  test("category requires prompt", () => {
    // given
    const member = { kind: "category", name: "m1", category: "deep" }

    // when
    const result = CategoryMemberSchema.safeParse(member)

    // then
    expect(result.success).toBe(false)
  })

  test("team spec defaults version when omitted", () => {
    // given
    const teamSpec = { name: "solo-team", members: [{ kind: "category", name: "solo", category: "deep", prompt: "implement the assigned work" }] }

    // when
    const result = TeamSpecSchema.parse(teamSpec)

    // then
    expect(result.version).toBe(1)
    expect(result.leadAgentId).toBe("solo")
  })

  test("team spec defaults createdAt from Date.now when omitted", () => {
    // given
    const originalDateNow = Date.now
    Date.now = () => 123_456_789
    const teamSpec = { name: "solo-team", members: [{ kind: "category", name: "solo", category: "deep", prompt: "implement the assigned work" }] }

    try {
      // when
      const result = TeamSpecSchema.parse(teamSpec)

      // then
      expect(result.createdAt).toBe(123_456_789)
    } finally {
      Date.now = originalDateNow
    }
  })

  test("team spec rejects multi-member configs without a lead hint", () => {
    // given
    const teamSpec = {
      name: "pair-team",
      members: [
        { kind: "category", name: "m1", category: "deep", prompt: "implement the assigned work" },
        { kind: "category", name: "m2", category: "quick", prompt: "review the assigned work" },
      ],
    }

    // when
    const result = TeamSpecSchema.safeParse(teamSpec)

    // then
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ["leadAgentId"],
        message: "leadAgentId required (or write a `lead: {...}` field, or mark one member with `isLead: true`)",
      }))
    }
  })

  test("eligibility registry shape", () => {
    // given
    const entries = Object.entries(AGENT_ELIGIBILITY_REGISTRY)

    // when
    const verdictCounts = entries.reduce(
      (counts, [, value]) => {
        counts[value.verdict] += 1
        return counts
      },
      { eligible: 0, conditional: 0, "hard-reject": 0 },
    )

    // then
    expect(entries).toHaveLength(11)
    expect(verdictCounts).toEqual({ eligible: 3, conditional: 1, "hard-reject": 7 })
    expect(AGENT_ELIGIBILITY_REGISTRY.scylla.rejectionMessage).toBe(
      "Agent 'scylla' lacks teammate permission. Either apply D-36 (add teammate: \"allow\" in tool-config-handler.ts) or use subagent_type: \"cerberus\" instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.cipher.rejectionMessage).toBe(
      "Agent 'cipher' is read-only (cannot write files). Team members must write to mailbox inbox files. Use delegate-task with subagent_type: 'cipher' for read-only analysis instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.intel.rejectionMessage).toBe(
      "Agent 'intel' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for research queries instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.scout.rejectionMessage).toBe(
      "Agent 'scout' is read-only (write/edit denied). Cannot write to mailbox as team member. Use delegate-task for target reconnaissance instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY["lens"].rejectionMessage).toBe(
      "Agent 'lens' has read-only tool access (only 'read' allowed). Cannot write to mailbox as team member.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.vanguard.rejectionMessage).toBe(
      "Agent 'vanguard' is read-only (pre-planning consultant). Cannot write to mailbox as team member. Use delegate-task for pre-planning analysis instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.sentinel.rejectionMessage).toBe(
      "Agent 'sentinel' is read-only (plan reviewer). Cannot write to mailbox as team member. Use delegate-task for plan review instead.",
    )
    expect(AGENT_ELIGIBILITY_REGISTRY.talos.rejectionMessage).toBe(
      "Agent 'talos' is plan-mode-only; can only write to .omop/*.md (enforced by talosMdOnly hook). Cannot write to team mailbox. Use delegate-task with subagent_type: 'plan' instead.",
    )
    expect(CategoryMemberSchema).toBeDefined()
    expect(SubagentMemberSchema).toBeDefined()
  })
})
