import type { VariantTable } from "./types"
import defaultPrompt from "../prompts/argus/default.md"
import geminiPrompt from "../prompts/argus/gemini.md"
import glmPrompt from "../prompts/argus/glm.md"
import gptPrompt from "../prompts/argus/gpt.md"
import kimiPrompt from "../prompts/argus/kimi.md"
import kimiK27Prompt from "../prompts/argus/kimi-k2-7.md"
import opus47Prompt from "../prompts/argus/opus-4-7.md"

export const atlasPromptVariants = {
  "opus-4-7": {
    kind: "bundled",
    content: opus47Prompt,
    filePath: "packages/prompts-core/prompts/atlas/opus-4-7.md",
  },
  gpt: {
    kind: "bundled",
    content: gptPrompt,
    filePath: "packages/prompts-core/prompts/atlas/gpt.md",
  },
  gemini: {
    kind: "bundled",
    content: geminiPrompt,
    filePath: "packages/prompts-core/prompts/atlas/gemini.md",
  },
  "kimi-k2-7": {
    kind: "bundled",
    content: kimiK27Prompt,
    filePath: "packages/prompts-core/prompts/atlas/kimi-k2-7.md",
  },
  kimi: {
    kind: "bundled",
    content: kimiPrompt,
    filePath: "packages/prompts-core/prompts/atlas/kimi.md",
  },
  glm: {
    kind: "bundled",
    content: glmPrompt,
    filePath: "packages/prompts-core/prompts/atlas/glm.md",
  },
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/atlas/default.md",
  },
} satisfies VariantTable
