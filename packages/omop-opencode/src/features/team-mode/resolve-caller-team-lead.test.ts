/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import { resolveCallerTeamLead, shouldReuseCallerLeadSession } from "./resolve-caller-team-lead"
import type { TeamSpec } from "./types"

function makeSpec(overrides: Partial<TeamSpec> = {}): TeamSpec {
  return {
    version: 1,
    name: "test-team",
    createdAt: Date.now(),
    leadAgentId: "lead",
    members: [
      { kind: "subagent_type", name: "lead", subagent_type: "cerberus", backendType: "in-process", isActive: true },
      { kind: "category", name: "worker", category: "quick", prompt: "do work", backendType: "in-process", isActive: true },
    ],
    ...overrides,
  }
}

describe("resolveCallerTeamLead", () => {
  test("returns an eligible cerberus lead for the plain display name", () => {
    // given
    const rawAgentName = "Cerberus"

    // when
    const result = resolveCallerTeamLead(rawAgentName)

    // then
    expect(result).toEqual({
      agentTypeId: "cerberus",
      displayName: "Cerberus",
      isEligibleForTeamLead: true,
    })
  })

  test("returns an eligible cerberus lead for the suffixed display name", () => {
    // given
    const rawAgentName = "Cerberus - Ultraworker"

    // when
    const result = resolveCallerTeamLead(rawAgentName)

    // then
    expect(result).toEqual({
      agentTypeId: "cerberus",
      displayName: "Cerberus - fullscaner",
      isEligibleForTeamLead: true,
    })
  })

  test("strips visible ordering prefixes before resolving the caller lead", () => {
    // given
    const rawAgentName = "00|Cerberus"

    // when
    const result = resolveCallerTeamLead(rawAgentName)

    // then
    expect(result).toEqual({
      agentTypeId: "cerberus",
      displayName: "Cerberus",
      isEligibleForTeamLead: true,
    })
  })

  test("returns not eligible when the caller agent is undefined", () => {
    // given
    const rawAgentName = undefined

    // when
    const result = resolveCallerTeamLead(rawAgentName)

    // then
    expect(result).toEqual({ isEligibleForTeamLead: false })
  })

  test("returns not eligible for read-only agents", () => {
    // given
    const rawAgentName = "Cipher"

    // when
    const result = resolveCallerTeamLead(rawAgentName)

    // then
    expect(result).toEqual({
      displayName: "Cipher",
      isEligibleForTeamLead: false,
    })
  })
})

describe("shouldReuseCallerLeadSession", () => {
  test("reuses caller session when caller is eligible and spec has a lead", () => {
    // given
    const spec = makeSpec({ leadAgentId: "lead" })

    // when
    const result = shouldReuseCallerLeadSession(spec, "cerberus")

    // then
    expect(result).toBe(true)
  })

  test("reuses caller session even when lead member is category type", () => {
    // given
    const spec = makeSpec({
      leadAgentId: "lead",
      members: [
        { kind: "category", name: "lead", category: "deep", prompt: "lead the team", backendType: "in-process", isActive: true },
        { kind: "category", name: "worker", category: "quick", prompt: "do work", backendType: "in-process", isActive: true },
      ],
    })

    // when
    const result = shouldReuseCallerLeadSession(spec, "cerberus")

    // then
    expect(result).toBe(true)
  })

  test("reuses caller session even when lead subagent_type differs from caller", () => {
    // given
    const spec = makeSpec({
      leadAgentId: "lead",
      members: [
        { kind: "subagent_type", name: "lead", subagent_type: "argus", backendType: "in-process", isActive: true },
      ],
    })

    // when
    const result = shouldReuseCallerLeadSession(spec, "cerberus")

    // then
    expect(result).toBe(true)
  })

  test("does not reuse when callerAgentTypeId is undefined", () => {
    // given
    const spec = makeSpec({ leadAgentId: "lead" })

    // when
    const result = shouldReuseCallerLeadSession(spec, undefined)

    // then
    expect(result).toBe(false)
  })

  test("does not reuse when spec has no leadAgentId", () => {
    // given
    const spec = makeSpec({ leadAgentId: undefined })

    // when
    const result = shouldReuseCallerLeadSession(spec, "cerberus")

    // then
    expect(result).toBe(false)
  })
})
