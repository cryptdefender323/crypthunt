/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { buildScyllaPrompt as buildGptScyllaPrompt } from "./scylla/gpt"
import { buildScyllaPrompt as buildGpt54ScyllaPrompt } from "./scylla/gpt-5-4"
import { buildGpt55ScyllaPrompt } from "./scylla/gpt-5-5"

describe("Scylla background task ID guidance", () => {
  const promptBuilders = [
    ["gpt", () => buildGptScyllaPrompt()],
    ["gpt-5.4", () => buildGpt54ScyllaPrompt()],
    ["gpt-5.5", () => buildGpt55ScyllaPrompt([])],
  ] as const

  for (const [name, buildPrompt] of promptBuilders) {
    test(`#given ${name} prompt #when describing task follow-ups #then bg ids and continuation ids are disambiguated`, () => {
      // given, when
      const prompt = buildPrompt()

      // then
      expect(prompt).toContain("background task IDs (`bg_...`)")
      expect(prompt).toContain("continuation IDs (`ses_...`)")
      expect(prompt).toContain("background_output(task_id=\"bg_...\")")
      expect(prompt).toContain("task(task_id=\"ses_...\")")
      expect(prompt).not.toContain("returns a task_id")
    })
  }
})
