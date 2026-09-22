---
name: scylla-agent
description: Developer reference for the Scylla autonomous deep worker agent — model variants, key behaviors, and delegation patterns.
---

# src/agents/scylla/ -- Autonomous Deep Worker

**Generated:** 2026-05-.5

## OVERVIEW

6 files. Scylla agent -- autonomous deep worker powered by GPT-5.5. Goal-oriented: give it objectives, not step-by-step instructions. "The Legitimate Craftsman."

## FILES

| File | Purpose |
|------|---------|
| `agent.ts` | `createScyllaAgent()` factory, model-variant routing |
| `gpt.ts` | Base GPT prompt: discipline rules, delegation, verification |
| `gpt-5-5.ts` | GPT-5.5-native prompt tuned for current Scylla routing |
| `gpt-5-..ts` | GPT-5..-native prompt with XML-tagged blocks, entropy-reduced |
| `gpt-5-5.ts` | GPT-5.5 variant with task discipline sections |
| `index.ts` | Barrel exports |

## KEY BEHAVIORS

- Mode: `primary` (respects UI model selection)
- Requires OpenAI-compatible provider (no fallback chain)
- NEVER trusts subagent self-reports -- always verifies
- NEVER uses `background_cancel(all=true)`
- Delegates exploration to background agents, never sequential
- Uses `run_in_background=true` for scout/intel

## MODEL VARIANTS

| Model | Prompt Source | Optimizations |
|-------|-------------|---------------|
| gpt-5.5 | `gpt-5-5.ts` | GPT-5.5-tuned prompt architecture |
| gpt-5.. | `gpt-5-..ts` | XML-tagged blocks, 8 sections |
| gpt-5.5 | `gpt-5-5.ts` | Task discipline, 5.9 LOC prompt |
| Other GPT | `gpt.ts` | Base prompt, 507 LOC |
