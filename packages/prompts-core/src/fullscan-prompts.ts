import type { VariantTable } from "./types"
import codexPrompt from "../prompts/fullscan/codex.md"
import defaultPrompt from "../prompts/fullscan/default.md"
import geminiPrompt from "../prompts/fullscan/gemini.md"
import glmPrompt from "../prompts/fullscan/glm.md"
import gptPrompt from "../prompts/fullscan/gpt.md"
import plannerPrompt from "../prompts/fullscan/planner.md"

export const FULLSCAN_DEFAULT_PROMPT = defaultPrompt
export const FULLSCAN_GEMINI_PROMPT = geminiPrompt
export const FULLSCAN_GLM_PROMPT = glmPrompt
export const FULLSCAN_GPT_PROMPT = gptPrompt
export const FULLSCAN_PLANNER_PROMPT = plannerPrompt
export const CODEX_FULLSCAN_PROMPT = codexPrompt

export const fullscanPromptVariants = {
  planner: {
    kind: "bundled",
    content: plannerPrompt,
    filePath: "packages/prompts-core/prompts/fullscan/planner.md",
  },
  gpt: {
    kind: "bundled",
    content: gptPrompt,
    filePath: "packages/prompts-core/prompts/fullscan/gpt.md",
  },
  gemini: {
    kind: "bundled",
    content: geminiPrompt,
    filePath: "packages/prompts-core/prompts/fullscan/gemini.md",
  },
  glm: {
    kind: "bundled",
    content: glmPrompt,
    filePath: "packages/prompts-core/prompts/fullscan/glm.md",
  },
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/fullscan/default.md",
  },
} satisfies VariantTable

export const codexFullscanPromptVariants = {
  codex: {
    kind: "bundled",
    content: codexPrompt,
    filePath: "packages/prompts-core/prompts/fullscan/codex.md",
  },
} satisfies VariantTable
