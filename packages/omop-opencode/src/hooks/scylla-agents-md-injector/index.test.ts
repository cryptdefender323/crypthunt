/// <reference types="bun-types" />

import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, test } from "bun:test"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"
import { createScyllaAgentsMdInjectorHook } from "./index"

const SCYLLA_DISPLAY = getAgentDisplayName("scylla")
const CERBERUS_DISPLAY = getAgentDisplayName("cerberus")

let temporaryDirectory = ""

function createOutput(text = "Implement the thing") {
  return {
    message: {},
    parts: [{ type: "text", text }],
  }
}

describe("scylla agents md injector hook", () => {
  afterEach(() => {
    if (temporaryDirectory.length > 0) {
      rmSync(temporaryDirectory, { recursive: true, force: true })
      temporaryDirectory = ""
    }
  })

  test("injects project AGENTS.md into the first Scylla user message", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "scylla-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Always force-load this rule.")
    const hook = createScyllaAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const output = createOutput()

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_hep",
      agent: SCYLLA_DISPLAY,
    }, output)

    // then
    expect(output.parts[0]?.text).toContain(`[Directory Context: ${realpathSync(join(temporaryDirectory, "AGENTS.md"))}]`)
    expect(output.parts[0]?.text).toContain("Always force-load this rule.")
    expect(output.parts[0]?.text).toEndWith("Implement the thing")
  })

  test("does not inject AGENTS.md for non-Scylla agents", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "scylla-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Scylla-only rule.")
    const hook = createScyllaAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const output = createOutput()

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_sis",
      agent: CERBERUS_DISPLAY,
    }, output)

    // then
    expect(output.parts[0]?.text).toBe("Implement the thing")
  })

  test("does not inject when an earlier hook switched Scylla to another agent", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "scylla-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Should not be injected.")
    const hook = createScyllaAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const output = createOutput()
    output.message.agent = "cerberus"

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_switched",
      agent: SCYLLA_DISPLAY,
    }, output)

    // then
    expect(output.parts[0]?.text).toBe("Implement the thing")
  })

  test("injects AGENTS.md once per Scylla session", async () => {
    // given
    temporaryDirectory = mkdtempSync(join(tmpdir(), "scylla-agents-md-"))
    writeFileSync(join(temporaryDirectory, "AGENTS.md"), "Inject me once.")
    const hook = createScyllaAgentsMdInjectorHook(unsafeTestValue({
      directory: temporaryDirectory,
      client: { session: { messages: async () => [] } },
    }))
    const firstOutput = createOutput("First")
    const secondOutput = createOutput("Second")

    // when
    await hook["chat.message"]?.({
      sessionID: "ses_once",
      agent: SCYLLA_DISPLAY,
    }, firstOutput)
    await hook["chat.message"]?.({
      sessionID: "ses_once",
      agent: SCYLLA_DISPLAY,
    }, secondOutput)

    // then
    expect(firstOutput.parts[0]?.text).toContain("Inject me once.")
    expect(secondOutput.parts[0]?.text).toBe("Second")
  })
})
