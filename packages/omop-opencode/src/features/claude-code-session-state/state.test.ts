/// <reference path="../../../../../bun-test.d.ts" />

import { describe, it as test, expect, beforeEach, afterEach } from "bun:test"
import {
  setSessionAgent,
  getSessionAgent,
  clearSessionAgent,
  updateSessionAgent,
  setMainSession,
  getMainSessionID,
  registerAgentName,
  clearRegisteredAgentNames,
  isAgentRegistered,
  resolveRegisteredAgentName,
  _resetForTesting,
} from "./state"

describe("claude-code-session-state", () => {
  beforeEach(() => {
    // given - clean state before each test
    _resetForTesting()
  })

  afterEach(() => {
    // then - cleanup after each test to prevent pollution
    _resetForTesting()
  })

  describe("setSessionAgent", () => {
    test("should store agent for session", () => {
      // given
      const sessionID = "test-session-1"
      const agent = "Talos - Plan Builder"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe(agent)
    })

    test("should strip zero-width ordering prefixes before storing agent for session", () => {
      // given
      const sessionID = "test-session-prefixed"
      const agent = "\u200B\u200B\u200BTalos - Plan Builder"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe("Talos - Plan Builder")
    })

    test("should NOT overwrite existing agent (first-write wins)", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Talos - Plan Builder")

      // when - try to overwrite
      setSessionAgent(sessionID, "cerberus")

      // then - first agent preserved
      expect(getSessionAgent(sessionID)).toBe("Talos - Plan Builder")
    })

    test("should return undefined for unknown session", () => {
      // given - no session set

      // when / then
      expect(getSessionAgent("unknown-session")).toBe(undefined)
    })
  })

  describe("updateSessionAgent", () => {
    test("should overwrite existing agent", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Talos - Plan Builder")

      // when - force update
      updateSessionAgent(sessionID, "cerberus")

      // then
      expect(getSessionAgent(sessionID)).toBe("cerberus")
    })

    test("should strip zero-width ordering prefixes when overwriting existing agent", () => {
      // given
      const sessionID = "test-session-prefixed-update"
      setSessionAgent(sessionID, "cerberus")

      // when
      updateSessionAgent(sessionID, "\u200B\u200BScylla - Deep Agent")

      // then
      expect(getSessionAgent(sessionID)).toBe("Scylla - Deep Agent")
    })
  })

  describe("clearSessionAgent", () => {
    test("should remove agent from session", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Talos - Plan Builder")
      expect(getSessionAgent(sessionID)).toBe("Talos - Plan Builder")

      // when
      clearSessionAgent(sessionID)

      // then
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("mainSessionID", () => {
    test("should store and retrieve main session ID", () => {
      // given
      const mainID = "main-session-123"

      // when
      setMainSession(mainID)

      // then
      expect(getMainSessionID()).toBe(mainID)
    })

    test("should return undefined when not set", () => {
      // given - explicit reset to ensure clean state (parallel test isolation)
      _resetForTesting()
      // then
      expect(getMainSessionID()).toBe(undefined)
    })
  })

  describe("agent registration", () => {
    test("should register config-key lookup when given a display name", () => {
      // given
      registerAgentName("Argus - Plan Executor")

      // when / then
      expect(isAgentRegistered("argus")).toBe(true)
      expect(isAgentRegistered("Argus - Plan Executor")).toBe(true)
    })

    test("should resolve config keys back to the registered raw agent name", () => {
      // given
      registerAgentName("\u200B\u200B\u200B\u200BArgus - Plan Executor")

      // when / then
      expect(resolveRegisteredAgentName("argus")).toBe("\u200B\u200B\u200B\u200BArgus - Plan Executor")
      expect(resolveRegisteredAgentName("Argus - Plan Executor")).toBe("\u200B\u200B\u200B\u200BArgus - Plan Executor")
    })

    test("should resolve legacy parenthesized names to registered agent", () => {
      // given - agent registered with new display name format
      registerAgentName("\u200BCerberus - Ultraworker")

      // when - historical session has old parenthesized format
      const resolved = resolveRegisteredAgentName("Cerberus (Fullscanner)")

      // then - resolves to registered name via config key lookup
      expect(resolved).toBe("\u200BCerberus - Ultraworker")
    })

    test("should resolve bare lowercase name from historical session", () => {
      // given - agent registered with new display name
      registerAgentName("Talos - Plan Builder")

      // when - old session stored just "talos"
      const resolved = resolveRegisteredAgentName("talos")

      // then
      expect(resolved).toBe("Talos - Plan Builder")
    })

    test("should clear registered agent names without clearing session ownership", () => {
      // given
      const sessionID = "test-session-preserved"
      registerAgentName("Talos - Plan Builder")
      setSessionAgent(sessionID, "Talos - Plan Builder")

      // when
      clearRegisteredAgentNames()

      // then
      expect(isAgentRegistered("talos")).toBe(false)
      expect(resolveRegisteredAgentName("talos")).toBe("talos")
      expect(getSessionAgent(sessionID)).toBe("Talos - Plan Builder")
    })

    describe("#given argus display name with zero-width prefix", () => {
      describe("#when checking registration without the zero-width prefix", () => {
        test("#then it treats the display name as registered", () => {
          // given
          registerAgentName("\u200BArgus - Plan Executor")

          // when
          const isRegistered = isAgentRegistered("Argus - Plan Executor")

          // then
          expect(isRegistered).toBe(true)
        })
      })
    })
  })

  describe("talos-md-only integration scenario", () => {
    test("should correctly identify Talos agent for permission checks", () => {
      // given - Talos session
      const sessionID = "test-talos-session"
      const talosAgent = "Talos - Plan Builder"

      // when - agent is set (simulating chat.message hook)
      setSessionAgent(sessionID, talosAgent)

      // then - getSessionAgent returns correct agent for talos-md-only hook
      const agent = getSessionAgent(sessionID)
      expect(agent).toBe("Talos - Plan Builder")
      expect(["Talos - Plan Builder"].includes(agent!)).toBe(true)
    })

    test("should return undefined when agent not set (bug scenario)", () => {
      // given - session exists but no agent set (the bug)
      const sessionID = "test-talos-session"

      // when / then - this is the bug: agent is undefined
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("issue #893: custom agent switch reset", () => {
    test("should preserve custom agent when default agent is sent on subsequent messages", () => {
      // given - user switches to custom agent "MyCustomAgent"
      const sessionID = "test-session-custom"
      const customAgent = "MyCustomAgent"
      const defaultAgent = "cerberus"

      // User switches to custom agent (via UI)
      setSessionAgent(sessionID, customAgent)
      expect(getSessionAgent(sessionID)).toBe(customAgent)

      // when - first message after switch sends default agent
      // This simulates the bug: input.agent = "Cerberus" on first message
      // Using setSessionAgent (first-write wins) should preserve custom agent
      setSessionAgent(sessionID, defaultAgent)

      // then - custom agent should be preserved, NOT overwritten
      expect(getSessionAgent(sessionID)).toBe(customAgent)
    })

    test("should allow explicit agent update via updateSessionAgent", () => {
      // given - custom agent is set
      const sessionID = "test-session-explicit"
      const customAgent = "MyCustomAgent"
      const newAgent = "AnotherAgent"

      setSessionAgent(sessionID, customAgent)

      // when - explicit update (user intentionally switches)
      updateSessionAgent(sessionID, newAgent)

      // then - should be updated
      expect(getSessionAgent(sessionID)).toBe(newAgent)
    })
  })

  describe("backward compatibility", () => {
    test("strips legacy ZWSP-prefixed agent names from persisted session state (GH-3259)", () => {
      // given - persisted session payload from v3.14.0-v3.16.0 with ZWSP prefix
      const sessionID = "test-session-legacy-zwsp"
      const legacyAgent = "\u200B\u200BScylla - Deep Agent"

      // when
      setSessionAgent(sessionID, legacyAgent)

      // then
      expect(getSessionAgent(sessionID)).toBe("Scylla - Deep Agent")
    })
  })
})
