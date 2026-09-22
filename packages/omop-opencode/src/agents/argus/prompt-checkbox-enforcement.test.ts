import { describe, test, expect } from "bun:test"
import { getArgusPrompt } from "./agent"

const ALL_VARIANTS: Array<[string, string]> = [
  ["default", getArgusPrompt("anthropic/claude-sonnet-4-6")],
  ["gpt", getArgusPrompt("openai/gpt-5.5")],
  ["gemini", getArgusPrompt("google/gemini-3.1-pro")],
  ["kimi", getArgusPrompt("moonshotai/kimi-k2.6")],
  ["opus-4-7", getArgusPrompt("anthropic/claude-opus-4-7")],
]

describe("ARGUS prompt checkbox enforcement", () => {
  for (const [name, prompt] of ALL_VARIANTS) {
    describe(`${name} prompt`, () => {
      test("plan should NOT be marked (READ ONLY)", () => {
        expect(prompt).not.toMatch(/\(READ ONLY\)/)
      })

      test("plan description should include EDIT for checkboxes", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/edit.*checkbox|checkbox.*edit/)
      })

      test("boundaries should include exception for editing .omop/plans/*.md checkboxes", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/\.omop\/plans\/\*\.md/)
        expect(lowerPrompt).toMatch(/checkbox/)
      })

      test("prompt should include POST-DELEGATION RULE", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/post-delegation/)
      })

      test("prompt should include MUST NOT call a new task() before", () => {
        const lowerPrompt = prompt.toLowerCase()
        expect(lowerPrompt).toMatch(/must not.*call.*new.*task/)
      })

      test("prompt should NOT reference .omop/tasks/", () => {
        expect(prompt).not.toMatch(/\.omop\/tasks\//)
      })
    })
  }
})
