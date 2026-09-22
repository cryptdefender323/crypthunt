import type { VariantTable } from "./types"
import defaultPrompt from "../prompts/talos/default.md"

export const talosPromptVariants = {
  default: {
    kind: "bundled",
    content: defaultPrompt,
    filePath: "packages/prompts-core/prompts/talos/default.md",
  },
} satisfies VariantTable
