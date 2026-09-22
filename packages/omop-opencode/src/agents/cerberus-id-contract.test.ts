/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { buildClaudeOpus47CerberusPrompt } from "./cerberus/claude-opus-4-7"
import { buildDefaultCerberusPrompt } from "./cerberus/default"
import { buildGpt54CerberusPrompt } from "./cerberus/gpt-5-4"
import { buildGpt55CerberusPrompt } from "./cerberus/gpt-5-5"
import { buildKimiK26CerberusPrompt } from "./cerberus/kimi-k2-6"
import { buildKimiK26CerberusJuniorPrompt } from "./cerberus-junior/kimi-k2-6"

function expectKimiToolLoopGuardrail(prompt: string): void {
  const guardrail = prompt.match(/<tool_loop_guard>[\s\S]*?<\/tool_loop_guard>/)?.[0] ?? ""

  expect(guardrail).toContain("<tool_loop_guard>")
  expect(guardrail).toMatch(/\bsame tool\b/i)
  expect(guardrail).toMatch(/\bsame arguments\b/i)
  expect(guardrail).toMatch(/\btwice\b|\b2\b/i)
  expect(guardrail).toMatch(/\bthird\b|\b3\b/i)
  expect(guardrail).toMatch(/\bstop\b/i)
  expect(guardrail).toMatch(/\bloop\b/i)
}

describe("Cerberus background task ID guidance", () => {
  const promptBuilders = [
    ["claude-opus-4-7", buildClaudeOpus47CerberusPrompt],
    ["default", buildDefaultCerberusPrompt],
    ["gpt-5.4", buildGpt54CerberusPrompt],
    ["gpt-5.5", buildGpt55CerberusPrompt],
    ["kimi-k2.6", buildKimiK26CerberusPrompt],
  ] as const

  for (const [name, buildPrompt] of promptBuilders) {
    test(`#given ${name} prompt #when describing background tasks #then bg ids and session ids are disambiguated`, () => {
      // given, when
      const prompt = buildPrompt(name, [])

      // then
      expect(prompt).toContain("background task IDs (`bg_...`)")
      expect(prompt).toContain("continuation session IDs (`ses_...`)")
      expect(prompt).toContain("background_output(task_id=\"bg_...\")")
      expect(prompt).toContain("task(task_id=\"ses_...\")")
      expect(prompt).not.toContain("receive task_ids")
    })
  }

  test("#given gpt-5.5 prompt #when waiting on background tasks #then system reminders are input-only", () => {
    // given, when
    const prompt = buildGpt55CerberusPrompt("gpt-5.5", [])

    // then
    expect(prompt).toContain("System reminders are input-only signals")
    expect(prompt).toContain("Never write, quote, simulate, or pre-emptively emit `<system-reminder>`")
    expect(prompt).toContain("never call `background_output` merely because you imagined such a reminder")
    expect(prompt).toContain("actual harness-provided completion notification")
  })
})

describe("Kimi tool-call loop guardrails", () => {
  test("#given Kimi Cerberus prompt #when tool use is described #then identical tool calls are bounded", () => {
    const prompt = buildKimiK26CerberusPrompt("opencode-go/kimi-k2.6", [])

    expectKimiToolLoopGuardrail(prompt)
  })

  test("#given Kimi Cerberus-Junior prompt #when tool use is described #then identical tool calls are bounded", () => {
    const prompt = buildKimiK26CerberusJuniorPrompt(false)

    expectKimiToolLoopGuardrail(prompt)
  })
})
