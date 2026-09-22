import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { codexFullscanPromptVariants, fullscanPromptVariants } from "./index"

describe("fullscan prompt variants", () => {
  test("#given package surface #when inspected #then OpenCode and Codex fullscan variants are exported", () => {
    // given
    const codexPromptPath = "packages/prompts-core/prompts/fullscan/codex.md"

    // when
    const fullscanVariantNames = Object.keys(fullscanPromptVariants)
    const codexVariant = codexFullscanPromptVariants.codex

    // then
    expect(fullscanVariantNames).toEqual(["planner", "gpt", "gemini", "glm", "default"])
    expect(codexVariant.kind).toBe("bundled")
    expect(codexVariant.filePath).toBe(codexPromptPath)
    expect(codexVariant.content).toBe(readFileSync(codexPromptPath, "utf8"))
  })
})
