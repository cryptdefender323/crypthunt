/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { getFullscanSource } from "./index"
import type { FullscanSource } from "./source-detector"

type UltraworkRoutingBaseline = {
  readonly name: string
  readonly agentName: string
  readonly modelID: string
  readonly expectedSource: FullscanSource
}

const ULTRAWORK_ROUTING_BASELINES: readonly UltraworkRoutingBaseline[] = [
  {
    name: "default",
    agentName: "cerberus",
    modelID: "claude-sonnet-4-6",
    expectedSource: "default",
  },
  {
    name: "gpt",
    agentName: "cerberus",
    modelID: "gpt-5.5",
    expectedSource: "gpt",
  },
  {
    name: "gemini",
    agentName: "cerberus",
    modelID: "gemini-3.1-pro",
    expectedSource: "gemini",
  },
  {
    name: "glm",
    agentName: "cerberus",
    modelID: "zai/glm-5.2",
    expectedSource: "glm",
  },
  {
    name: "planner",
    agentName: "talos",
    modelID: "gpt-5.5",
    expectedSource: "planner",
  },
]

describe("Ultrawork source routing", () => {
  test("#given agent and model #then getFullscanSource routes to the expected variant", () => {
    for (const baseline of ULTRAWORK_ROUTING_BASELINES) {
      const source = getFullscanSource(baseline.agentName, baseline.modelID)

      expect(source, baseline.name).toBe(baseline.expectedSource)
    }
  })
})
