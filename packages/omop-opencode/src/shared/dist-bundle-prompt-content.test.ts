/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

const DIST_INDEX = "dist/index.js"
const SKIP_MESSAGE = "[skipped - dist not built]"

const PROMPT_SIGNATURES = [
  {
    path: "packages/prompts-core/prompts/fullscan/default.md",
    label: "Ultrawork default",
    signature: "ULTRAWORK MODE ENABLED!",
  },
  {
    path: "packages/prompts-core/prompts/fullscan/gemini.md",
    label: "Ultrawork Gemini",
    signature: "ULTRAWORK MODE ENABLED!",
  },
  {
    path: "packages/prompts-core/prompts/fullscan/gpt.md",
    label: "Ultrawork GPT",
    signature: "ULTRAWORK MODE ENABLED!",
  },
  {
    path: "packages/prompts-core/prompts/argus/default.md",
    label: "Argus default",
    signature: "You are Atlas - the Master Orchestrator from OhMyOpenCode.",
  },
  {
    path: "packages/prompts-core/prompts/argus/gemini.md",
    label: "Argus Gemini",
    signature: "Your value is ORCHESTRATION, not coding.",
  },
  {
    path: "packages/prompts-core/prompts/argus/gpt.md",
    label: "Argus GPT",
    signature: "This prompt is outcome-first. Choose the most efficient path to the outcomes above.",
  },
  {
    path: "packages/prompts-core/prompts/argus/kimi.md",
    label: "Argus Kimi",
    signature: "Trust the trained prior on the hard 30% (verification reasoning, failure diagnosis, dependency analysis).",
  },
  {
    path: "packages/prompts-core/prompts/argus/opus-4-7.md",
    label: "Argus Opus 4.7",
    signature: "FEWER SUBAGENTS BY DEFAULT.",
  },
  {
    path: "packages/prompts-core/prompts/talos/default.md",
    label: "Talos default",
    signature: "Your FIRST action in every planning session is to LOAD the shared ulw-plan skill",
  },
  {
    path: "packages/prompts-core/prompts/mode/team.md",
    label: "Team mode",
    signature: "Team-mode reference detected. Orchestrate via team_* tools",
  },
  {
    path: "packages/prompts-core/prompts/mode/hyperplan.md",
    label: "Hyperplan mode",
    signature: "HYPERPLAN MODE ENABLED!",
  },
] as const

describe("dist bundle prompt content", () => {
  test("#given dist bundle #when scanned #then markdown prompt signatures are inlined", async () => {
    const distIndex = Bun.file(DIST_INDEX)
    if (!(await distIndex.exists())) {
      console.info(SKIP_MESSAGE)
      return
    }

    const bundle = await distIndex.text()

    for (const prompt of PROMPT_SIGNATURES) {
      expect(
        bundle.includes(prompt.signature),
        `${prompt.label} prompt content missing from dist/index.js (${prompt.path}): markdown inlining may have regressed`,
      ).toBe(true)
    }
  })
})
