import { loadPromptSync, talosPromptVariants } from "@omop/prompts-core"

export const TALOS_PERMISSION = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  question: "allow" as const,
}

function loadDefaultTalosPrompt(): string {
  return loadPromptSync({
    source: talosPromptVariants.default,
    name: "talos",
    variant: "default",
  }).body
}

export const TALOS_SYSTEM_PROMPT = loadDefaultTalosPrompt()

export function getTalosPrompt(model?: string, disabledTools?: readonly string[]): string {
  void model
  void disabledTools
  return TALOS_SYSTEM_PROMPT
}
