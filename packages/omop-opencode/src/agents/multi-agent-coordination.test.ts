import { describe, expect, test } from "bun:test"
import type { AgentConfig } from "@opencode-ai/sdk"
import { enhanceAgentForMultiAgentCoordination } from "./multi-agent-coordination"

describe("enhanceAgentForMultiAgentCoordination", () => {
  test("adds collaboration protocol and research delegation to every agent", () => {
    // given
    const agent: AgentConfig = {
      mode: "subagent",
      prompt: "base prompt",
      permission: { task: "deny" },
    }

    // when
    const enhanced = enhanceAgentForMultiAgentCoordination(agent, "scout")

    // then
    expect(enhanced.prompt).toContain("<multi_agent_coordination>")
    expect(enhanced.prompt).toContain("evidence_packet")
    expect(enhanced.permission?.call_omo_agent).toBe("allow")
    expect(enhanced.permission?.task).toBe("deny")
  })

  test("does not duplicate the protocol when the registry is rebuilt", () => {
    // given
    const agent: AgentConfig = { prompt: "base prompt" }

    // when
    const enhanced = enhanceAgentForMultiAgentCoordination(
      enhanceAgentForMultiAgentCoordination(agent, "cipher"),
      "cipher",
    )

    // then
    expect(enhanced.prompt?.match(/<multi_agent_coordination>/g)).toHaveLength(1)
  })
})
