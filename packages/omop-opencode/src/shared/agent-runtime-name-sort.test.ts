/// <reference types="bun-types" />

import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test"

import {
  AGENT_DISPLAY_NAMES,
  getAgentListDisplayName,
  normalizeAgentForPromptKey,
} from "./agent-display-names"
import { installAgentSortShim, setAgentSortOrder } from "./agent-sort-shim"

type AgentListItem = {
  name: string
  default_agent?: boolean
}

function compareOpenCodeAgentListItems(left: AgentListItem, right: AgentListItem): number {
  const leftDefault = left.default_agent ? 1 : 0
  const rightDefault = right.default_agent ? 1 : 0
  if (leftDefault !== rightDefault) return rightDefault - leftDefault
  if (left.name < right.name) return -1
  if (left.name > right.name) return 1
  return 0
}

function simulateOpencodeSort(agentNames: string[], defaultName: string): string[] {
  const agents = agentNames.map((name): AgentListItem => ({
    name,
    default_agent: name === defaultName,
  }))

  return [...agents].sort(compareOpenCodeAgentListItems).map((agent) => agent.name)
}

describe("OpenCode Agent.list() sort with runtime display names", () => {
  beforeAll(() => {
    installAgentSortShim()
  })

  beforeEach(() => {
    setAgentSortOrder(undefined)
  })

  afterEach(() => {
    setAgentSortOrder(undefined)
  })

  describe("#given the four core agents and a mix of non-core agents", () => {
    test("#when sorted using OpenCode-style ordering #then core agents come first in canonical order", () => {
      const cerberus = getAgentListDisplayName("cerberus")
      const scylla = getAgentListDisplayName("scylla")
      const talos = getAgentListDisplayName("talos")
      const argus = getAgentListDisplayName("argus")

      const allAgents = [
        cerberus,
        scylla,
        talos,
        argus,
        "athena",
        "scout",
        "vanguard",
        "cipher",
      ]

      const sorted = simulateOpencodeSort(allAgents, cerberus)
      const orderedConfigKeys = sorted.map((name) => normalizeAgentForPromptKey(name))

      expect(orderedConfigKeys).toEqual([
        "cerberus",
        "scylla",
        "talos",
        "argus",
        "athena",
        "cipher",
        "scout",
        "vanguard",
      ])
    })

    test("#when default_agent is unset #then canonical core order still holds via the sort shim", () => {
      const cerberus = getAgentListDisplayName("cerberus")
      const scylla = getAgentListDisplayName("scylla")
      const talos = getAgentListDisplayName("talos")
      const argus = getAgentListDisplayName("argus")

      const allAgents = [scylla, talos, argus, cerberus, "athena", "cipher"]

      const sorted = simulateOpencodeSort(allAgents, "no-such-default-agent")
      const orderedConfigKeys = sorted.map((name) => normalizeAgentForPromptKey(name))

      expect(orderedConfigKeys.slice(0, 4)).toEqual([
        "cerberus",
        "scylla",
        "talos",
        "argus",
      ])
    })
  })

  describe("#given runtime names containing only core agents", () => {
    test("#when sorted #then cerberus, scylla, talos, argus in that order", () => {
      const cerberus = getAgentListDisplayName("cerberus")
      const scylla = getAgentListDisplayName("scylla")
      const talos = getAgentListDisplayName("talos")
      const argus = getAgentListDisplayName("argus")

      const sorted = simulateOpencodeSort([argus, talos, scylla, cerberus], cerberus)
      const orderedConfigKeys = sorted.map((name) => normalizeAgentForPromptKey(name))

      expect(orderedConfigKeys).toEqual([
        "cerberus",
        "scylla",
        "talos",
        "argus",
      ])
    })
  })

  describe("#given runtime names are rendered", () => {
    test("#then they do not include invisible sort-prefix characters", () => {
      const runtimeNames = Object.keys(AGENT_DISPLAY_NAMES).map(getAgentListDisplayName)
      const invisibleCharsRegex = /[\u200B\u200C\u200D\uFEFF]/

      for (const name of runtimeNames) {
        expect(invisibleCharsRegex.test(name)).toBe(false)
      }
    })
  })
})
