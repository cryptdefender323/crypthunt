/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import {
  reorderAgentsByPriority,
  CANONICAL_CORE_AGENT_ORDER,
} from "./agent-priority-order"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("agent-priority-order", () => {
  describe("CANONICAL_CORE_AGENT_ORDER", () => {
    // given: The canonical order constant must exist and be correct

    test("exports canonical order as readonly array", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toBeDefined()
      expect(Array.isArray(CANONICAL_CORE_AGENT_ORDER)).toBe(true)
    })

    test("canonical order is exactly [cerberus, scylla, talos, argus]", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toEqual([
        "cerberus",
        "scylla",
        "talos",
        "argus",
      ])
    })

    test("canonical order length is exactly 4", () => {
      // then
      expect(CANONICAL_CORE_AGENT_ORDER).toHaveLength(4)
    })
  })

  describe("reorderAgentsByPriority", () => {
    // given: display names for all core agents
    const cerberus = getAgentListDisplayName("cerberus")
    const scylla = getAgentListDisplayName("scylla")
    const talos = getAgentListDisplayName("talos")
    const argus = getAgentListDisplayName("argus")
    const cipher = getAgentDisplayName("cipher")
    const intel = getAgentDisplayName("intel")
    const scout = getAgentDisplayName("scout")

    describe("#given agents in random order", () => {
      test("#when all core agents present #then orders as cerberus→scylla→talos→argus", () => {
        // given: agents in reverse order
        const agents: Record<string, unknown> = {
          [argus]: { name: "argus" },
          [talos]: { name: "talos" },
          [scylla]: { name: "scylla" },
          [cerberus]: { name: "cerberus" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        expect(keys[0]).toBe(cerberus)
        expect(keys[1]).toBe(scylla)
        expect(keys[2]).toBe(talos)
        expect(keys[3]).toBe(argus)
      })

      test("#when custom agent order is provided #then follows configured core ordering", () => {
        // given
        const agents: Record<string, unknown> = {
          [argus]: { name: "argus" },
          [talos]: { name: "talos" },
          [scylla]: { name: "scylla" },
          [cerberus]: { name: "cerberus" },
        }

        // when
        const result = reorderAgentsByPriority(agents, [
          "scylla",
          "cerberus",
          "talos",
          "argus",
        ])

        // then
        expect(Object.keys(result)).toEqual([scylla, cerberus, talos, argus])
      })

      test("#when custom agent order contains invalid entries #then ignores them and keeps valid/default ordering", () => {
        // given
        const agents: Record<string, unknown> = {
          [argus]: { name: "argus" },
          [talos]: { name: "talos" },
          [scylla]: { name: "scylla" },
          [cerberus]: { name: "cerberus" },
        }

        // when
        const result = reorderAgentsByPriority(agents, [
          "not-real",
          "argus",
          "scylla",
          "argus",
        ])

        // then
        expect(Object.keys(result)).toEqual([argus, scylla, cerberus, talos])
      })

      test("#when core agents mixed with non-core #then core agents come first in canonical order", () => {
        // given: mixed order with non-core agents interleaved
        const agents: Record<string, unknown> = {
          [cipher]: { name: "cipher" },
          [argus]: { name: "argus" },
          [intel]: { name: "intel" },
          [talos]: { name: "talos" },
          [scout]: { name: "scout" },
          [scylla]: { name: "scylla" },
          custom: { name: "custom" },
          [cerberus]: { name: "cerberus" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        expect(keys.slice(0, 4)).toEqual([cerberus, scylla, talos, argus])
      })
    })

    describe("#given 100 random permutations", () => {
      test("#when reordered #then result is ALWAYS identical", () => {
        // given: base agent config
        const baseAgents = {
          [cerberus]: { name: "cerberus" },
          [scylla]: { name: "scylla" },
          [talos]: { name: "talos" },
          [argus]: { name: "argus" },
          [cipher]: { name: "cipher" },
          [intel]: { name: "intel" },
          custom1: { name: "custom1" },
          custom2: { name: "custom2" },
        }

        // given: shuffle function
        const shuffle = <T>(array: T[]): T[] => {
          const result = [...array]
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[result[i], result[j]] = [result[j], result[i]]
          }
          return result
        }

        // when: run 100 times with different key orders
        const results: string[][] = []
        for (let i = 0; i < 100; i++) {
          const shuffledKeys = shuffle(Object.keys(baseAgents))
          const shuffledAgents: Record<string, unknown> = {}
          for (const key of shuffledKeys) {
            shuffledAgents[key] = baseAgents[key]
          }
          const result = reorderAgentsByPriority(shuffledAgents)
          results.push(Object.keys(result))
        }

        // then: all results should have identical key order
        const firstResult = results[0]
        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(firstResult)
        }

        // then: core agents are always first 4 in canonical order
        expect(firstResult.slice(0, 4)).toEqual([
          cerberus,
          scylla,
          talos,
          argus,
        ])
      })
    })

    describe("#given partial core agents", () => {
      test("#when only cerberus and argus present #then orders as cerberus→argus", () => {
        // given
        const agents: Record<string, unknown> = {
          [argus]: { name: "argus" },
          custom: { name: "custom" },
          [cerberus]: { name: "cerberus" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        const cerberusIdx = keys.indexOf(cerberus)
        const argusIdx = keys.indexOf(argus)
        expect(cerberusIdx).toBeLessThan(argusIdx)
        expect(cerberusIdx).toBe(0)
      })

      test("#when only scylla and talos present #then orders as scylla→talos", () => {
        // given
        const agents: Record<string, unknown> = {
          [talos]: { name: "talos" },
          custom: { name: "custom" },
          [scylla]: { name: "scylla" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        const keys = Object.keys(result)
        const scyllaIdx = keys.indexOf(scylla)
        const talosIdx = keys.indexOf(talos)
        expect(scyllaIdx).toBeLessThan(talosIdx)
        expect(scyllaIdx).toBe(0)
      })
    })

    describe("#given order field injection", () => {
      test("#when core agent is object #then injects order field", () => {
        // given
        const agents: Record<string, unknown> = {
          [cerberus]: { name: "cerberus", mode: "primary" },
          [scylla]: { name: "scylla", mode: "primary" },
          [talos]: { name: "talos", mode: "primary" },
          [argus]: { name: "argus", mode: "primary" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[cerberus]).toEqual({ name: "cerberus", mode: "primary", order: 1 })
        expect(result[scylla]).toEqual({ name: "scylla", mode: "primary", order: 2 })
        expect(result[talos]).toEqual({ name: "talos", mode: "primary", order: 3 })
        expect(result[argus]).toEqual({ name: "argus", mode: "primary", order: 4 })
      })

      test("#when custom agent order is provided #then injects matching order fields", () => {
        // given
        const agents: Record<string, unknown> = {
          [cerberus]: { name: "cerberus", mode: "primary" },
          [scylla]: { name: "scylla", mode: "primary" },
        }

        // when
        const result = reorderAgentsByPriority(agents, ["scylla", "cerberus"])

        // then
        expect(result[scylla]).toEqual({ name: "scylla", mode: "primary", order: 1 })
        expect(result[cerberus]).toEqual({ name: "cerberus", mode: "primary", order: 2 })
      })

      test("#when core agent is non-object #then leaves value unchanged", () => {
        // given
        const agents: Record<string, unknown> = {
          [cerberus]: "string-config",
          [argus]: null,
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[cerberus]).toBe("string-config")
        expect(result[argus]).toBe(null)
      })

      test("#when non-core agent #then does NOT inject order field", () => {
        // given
        const agents: Record<string, unknown> = {
          [cipher]: { name: "cipher", mode: "subagent" },
          custom: { name: "custom" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then
        expect(result[cipher]).toEqual({ name: "cipher", mode: "subagent" })
        expect(result.custom).toEqual({ name: "custom" })
      })
    })

    describe("#given non-core agent ordering", () => {
      test("#when multiple non-core agents #then sorted alphabetically after core agents", () => {
        // given: non-core agents in random order
        const agents: Record<string, unknown> = {
          zebra: { name: "zebra" },
          [cerberus]: { name: "cerberus" },
          apple: { name: "apple" },
          mango: { name: "mango" },
          [argus]: { name: "argus" },
        }

        // when
        const result = reorderAgentsByPriority(agents)

        // then: core agents first, then alphabetical
        const keys = Object.keys(result)
        expect(keys.slice(0, 2)).toEqual([cerberus, argus])
        expect(keys.slice(2)).toEqual(["apple", "mango", "zebra"])
      })
    })
  })
})
