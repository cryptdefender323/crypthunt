/// <reference types="bun-types" />

import { afterEach, beforeAll, describe, expect, test } from "bun:test"

import { installAgentSortShim, setAgentSortOrder, setDefaultAgentForSort } from "./agent-sort-shim"
import { AGENT_DISPLAY_NAMES } from "./agent-display-names"

type AgentListItem = {
  name: string
  default_agent?: boolean
}

declare global {
  interface Array<T> {
    toSorted(compareFn?: (a: T, b: T) => number): T[]
  }
}

describe("agent-sort-shim", () => {
  beforeAll(() => {
    installAgentSortShim()
  })

  afterEach(() => {
    setAgentSortOrder(undefined)
  })

  describe("#given an array of all 4 core agent objects in random order", () => {
    describe("#when toSorted with alphabetical compareFn", () => {
      test("#then returns canonical cerberus->scylla->talos->argus order", () => {
        // given
        setAgentSortOrder(undefined)
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const input = [argus, talos, scylla, cerberus]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toEqual([cerberus, scylla, talos, argus])
      })

      test("#then follows configured core agent order", () => {
        // given
        setAgentSortOrder(["scylla", "cerberus", "talos", "argus"])
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const input = [argus, talos, scylla, cerberus]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toEqual([scylla, cerberus, talos, argus])
      })
    })
  })

  describe("#given 4 core agents mixed with 2 non-core agent objects", () => {
    describe("#when toSorted with alphabetical compareFn", () => {
      test("#then core agents come first in canonical order followed by non-core agents alphabetically", () => {
        // given
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const build = { name: "build" }
        const plan = { name: "plan" }
        const input = [argus, build, talos, plan, scylla, cerberus]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toEqual([cerberus, scylla, talos, argus, build, plan])
      })
    })
  })

  describe("#given OpenCode Agent.list style sort with default agent priority", () => {
    describe("#when toSorted compares default_agent first and then name", () => {
      test("#then core agents stay in canonical order before non-core agents", () => {
        // given
        const cerberus = { name: AGENT_DISPLAY_NAMES.cerberus, default_agent: true }
        const scylla = { name: AGENT_DISPLAY_NAMES.scylla }
        const talos = { name: AGENT_DISPLAY_NAMES.talos }
        const argus = { name: AGENT_DISPLAY_NAMES.argus }
        const cipher = { name: AGENT_DISPLAY_NAMES.cipher }
        const scout = { name: AGENT_DISPLAY_NAMES.scout }
        const input: AgentListItem[] = [cipher, argus, scout, talos, scylla, cerberus]

        // when
        const result = input.toSorted((left, right) => {
          const leftDefault = left.default_agent ? 1 : 0
          const rightDefault = right.default_agent ? 1 : 0
          if (leftDefault !== rightDefault) return rightDefault - leftDefault
          return left.name.localeCompare(right.name)
        })

        // then
        expect(result).toEqual([cerberus, scylla, talos, argus, cipher, scout])
      })
    })
  })

  describe("#given an array with only one core agent and several non-core agent-like objects", () => {
    describe("#when toSorted with case-sensitive string-comparison compareFn", () => {
      test("#then activation predicate fails and result is ASCII-sensitive order with capital S before lowercase letters", () => {
        // given
        const cipher = { name: "cipher" }
        const intel = { name: "intel" }
        const cerberus = { name: "Cerberus - fullscaner" }
        const scout = { name: "scout" }
        const input = [cipher, intel, cerberus, scout]

        // when
        const result = input.toSorted((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
        )

        // then
        expect(result).toEqual([cerberus, cipher, intel, scout])
      })
    })
  })

  describe("#given a mixed-type array containing null, objects, a string, and a number", () => {
    describe("#when toSorted with a string-coercing compareFn", () => {
      test("#then activation predicate fails, shim does not throw, and result matches native semantics", () => {
        // given
        const cerberusObj = { name: "Cerberus - fullscaner" }
        const scyllaObj = { name: "Scylla - Deep Agent" }
        const input: unknown[] = [null, cerberusObj, "string", 42, scyllaObj]
        const compare = (a: unknown, b: unknown): number => {
          const sa = String(a)
          const sb = String(b)
          if (sa < sb) return -1
          if (sa > sb) return 1
          return 0
        }

        // when
        const result = input.toSorted(compare)

        // then
        expect(result).toEqual([42, cerberusObj, scyllaObj, null, "string"])
      })
    })
  })

  describe("#given a plain string array", () => {
    describe("#when toSorted with no compareFn", () => {
      test("#then returns native alphabetical ordering untouched", () => {
        // given
        const input = ["zebra", "apple", "mango"]

        // when
        const result = input.toSorted()

        // then
        expect(result).toEqual(["apple", "mango", "zebra"])
      })
    })
  })

  describe("#given a number array", () => {
    describe("#when sort with numeric compareFn (in-place)", () => {
      test("#then mutates the array and returns the same reference in ascending order", () => {
        // given
        const input = [3, 1, 4, 1, 5, 9, 2, 6]

        // when
        const result = input.sort((a, b) => a - b)

        // then
        expect(result).toBe(input)
        expect(input).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
      })
    })
  })

  describe("#given agent objects with all 4 core display names in random order", () => {
    describe("#when sort with alphabetical compareFn (in-place)", () => {
      test("#then mutates the original array to canonical order", () => {
        // given
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const input = [argus, talos, scylla, cerberus]

        // when
        const result = input.sort((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toBe(input)
        expect(input).toEqual([cerberus, scylla, talos, argus])
      })
    })
  })

  describe("#given installAgentSortShim has been invoked multiple times", () => {
    describe("#when toSorted is called on core agents after duplicate installs", () => {
      test("#then result is canonical order with no double-wrapping side effects", () => {
        // given
        installAgentSortShim()
        installAgentSortShim()
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const input = [argus, talos, scylla, cerberus]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toEqual([cerberus, scylla, talos, argus])
      })
    })
  })

  describe("#given a custom default_agent configured via setDefaultAgentForSort", () => {
    describe("#when toSorted is called on core agents mixed with the custom default agent", () => {
      test("#then the custom default agent sorts first, followed by core agents in canonical order", () => {
        // given
        setAgentSortOrder(undefined)
        setDefaultAgentForSort("crystal")
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const crystal = { name: "crystal" }
        const input = [argus, crystal, talos, scylla, cerberus]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toEqual([crystal, cerberus, scylla, talos, argus])
      })
    })

    describe("#when setDefaultAgentForSort is called with a core agent name", () => {
      test("#then that core agent sorts first, others follow in remaining canonical order", () => {
        // given
        setAgentSortOrder(undefined)
        setDefaultAgentForSort("Scylla - Deep Agent")
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const input = [argus, talos, scylla, cerberus]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then
        expect(result).toEqual([scylla, cerberus, talos, argus])
      })
    })
  })

  describe("#given agent_order configured without default_agent", () => {
    describe("#when setAgentSortOrder sets a non-canonical order and setDefaultAgentForSort is NOT called", () => {
      test("#then the custom agent_order is preserved without implicit override", () => {
        // given
        setAgentSortOrder(["scylla", "cerberus", "talos", "argus"])
        // setDefaultAgentForSort is intentionally NOT called (user did not set default_agent)
        const cerberus = { name: "Cerberus - fullscaner" }
        const scylla = { name: "Scylla - Deep Agent" }
        const talos = { name: "Talos - Plan Builder" }
        const argus = { name: "Argus - Plan Executor" }
        const input = [argus, cerberus, talos, scylla]

        // when
        const result = input.toSorted((a, b) => a.name.localeCompare(b.name))

        // then — Scylla must remain first per the user's agent_order
        expect(result).toEqual([scylla, cerberus, talos, argus])
      })
    })
  })
})
