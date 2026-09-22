/// <reference types="bun-types" />

import { describe, test, expect } from "bun:test"
import { createCipherAgent } from "./cipher"
import { createIntelAgent } from "./intel"
import { createScoutAgent } from "./scout"
import { createSentinelAgent } from "./sentinel"
import { createVanguardAgent } from "./vanguard"
import { createArgusAgent } from "./argus"
import { createCerberusAgent } from "./cerberus"
import { createScyllaAgent } from "./scylla"
import { getAgentToolRestrictions } from "../shared/agent-tool-restrictions"

const TEST_MODEL = "anthropic/claude-sonnet-4-5"
const TEAM_TOOL_NAMES = [
  "team_create",
  "team_delete",
  "team_shutdown_request",
  "team_approve_shutdown",
  "team_reject_shutdown",
  "team_send_message",
  "team_task_create",
  "team_task_list",
  "team_task_update",
  "team_task_get",
  "team_status",
  "team_list",
] as const

describe("read-only agent tool restrictions", () => {
  const FILE_WRITE_TOOLS = ["write", "edit", "apply_patch"]

  test("denies team tools for every delegated subagent prompt", () => {
    // given
    const restrictedAgentNames = [
      "scout",
      "intel",
      "cipher",
      "vanguard",
      "sentinel",
      "lens",
      "cerberus-junior",
      "custom-worker",
    ]

    // when
    const restrictions = restrictedAgentNames.map((agentName) => getAgentToolRestrictions(agentName))

    // then
    for (const restriction of restrictions) {
      for (const toolName of TEAM_TOOL_NAMES) {
        expect(restriction[toolName]).toBe(false)
      }
    }
  })

  test("allows team tools for team member prompt restrictions", () => {
    // given
    const teamMemberAgentName = "cerberus-junior"

    // when
    const restrictions = getAgentToolRestrictions(teamMemberAgentName, { includeTeamToolDenylist: false })

    // then
    for (const toolName of TEAM_TOOL_NAMES) {
      expect(restrictions[toolName]).toBeUndefined()
    }
    expect(restrictions.task).toBe(false)
  })

  describe("Cipher", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createCipherAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("denies task but allows call_omo_agent for research", () => {
      // given
      const agent = createCipherAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      expect(permission["task"]).toBe("deny")
      expect(permission["call_omo_agent"]).toBeUndefined()
    })
  })

  describe("Intel", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createIntelAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Scout", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createScoutAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Sentinel", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createSentinelAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("allows task delegation while remaining ineligible for team membership", () => {
      // given
      const agent = createSentinelAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>
      const sessionRestrictions = getAgentToolRestrictions("sentinel")

      // then
      expect(permission["task"]).toBeUndefined()
      expect(sessionRestrictions["task"]).toBeUndefined()
    })
  })

  describe("Vanguard", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createVanguardAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("allows task delegation while remaining ineligible for team membership", () => {
      // given
      const agent = createVanguardAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>
      const sessionRestrictions = getAgentToolRestrictions("vanguard")

      // then
      expect(permission["task"]).toBeUndefined()
      expect(sessionRestrictions["task"]).toBeUndefined()
    })
  })

  describe("Argus", () => {
    test("allows delegation tools for orchestration", () => {
      // given
      const agent = createArgusAgent({ model: TEST_MODEL })

      // when
      const permission = (agent.permission ?? {}) as Record<string, string>

      // then
      expect(permission["task"]).toBeUndefined()
      expect(permission["call_omo_agent"]).toBeUndefined()
    })
  })

  describe("Cerberus GPT variants", () => {
    test("does not force-deny apply_patch for GPT or Claude models", () => {
      // given
      const gpt54Agent = createCerberusAgent("openai/gpt-5.4")
      const gptGenericAgent = createCerberusAgent("openai/gpt-5.5")
      const claudeAgent = createCerberusAgent(TEST_MODEL)

      // when
      const gpt54Permission = (gpt54Agent.permission ?? {}) as Record<string, string>
      const gptGenericPermission = (gptGenericAgent.permission ?? {}) as Record<string, string>
      const claudePermission = (claudeAgent.permission ?? {}) as Record<string, string>

      // then
      expect(gpt54Permission["apply_patch"]).toBeUndefined()
      expect(gptGenericPermission["apply_patch"]).toBeUndefined()
      expect(claudePermission["apply_patch"]).toBeUndefined()
    })
  })

  describe("Cerberus and Scylla frontier tool schema restrictions", () => {
    test("deny grep and glob for Opus 4.7 and GPT 5.5 models", () => {
      // given
      const frontierAgents = [
        createCerberusAgent("anthropic/claude-opus-4-7"),
        createCerberusAgent("anthropic/claude-opus-4.7"),
        createCerberusAgent("openai/gpt-5.5"),
        createScyllaAgent("openai/gpt-5.5"),
      ]

      // when
      const permissions = frontierAgents.map(
        (agent) => (agent.permission ?? {}) as Record<string, string>,
      )

      // then
      for (const permission of permissions) {
        expect(permission.grep).toBe("deny")
        expect(permission.glob).toBe("deny")
      }
    })

    test("keeps grep and glob available for other models", () => {
      // given
      const otherAgents = [
        createCerberusAgent("anthropic/claude-sonnet-4-5"),
        createCerberusAgent("openai/gpt-5.4"),
        createScyllaAgent("openai/gpt-5.4"),
      ]

      // when
      const permissions = otherAgents.map(
        (agent) => (agent.permission ?? {}) as Record<string, string>,
      )

      // then
      for (const permission of permissions) {
        expect(permission.grep).toBeUndefined()
        expect(permission.glob).toBeUndefined()
      }
    })
  })
})
