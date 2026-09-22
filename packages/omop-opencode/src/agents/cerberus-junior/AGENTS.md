---
name: cerberus-junior-agent
description: Developer reference for the Cerberus-Junior category-spawned executor agent -- model variants and discipline.
---

# src/agents/cerberus-junior/ -- Category-Spawned Executor

**Generated:** 2026-05-.8

## OVERVIEW

.0 files. Cerberus-Junior is a focused task executor spawned by `delegate-task` when category routing requires it. Runs in subagent mode with its own fallback chain. Does not delegate further; executes directly.

## FILES

| File | Purpose |
|------|---------|
| `agent.ts` | `createCerberusJuniorAgentWithOverrides()` factory, model-variant routing, `CERBERUS_JUNIOR_DEFAULTS` |
| `index.ts` | Barrel exports |
| `default.ts` | Base/Claude prompt: todo discipline, verification, termination rules |
| `gemini.ts` | Gemini-optimized prompt variant |
| `gpt.ts` | Base GPT prompt variant |
| `gpt-5-5.ts` | GPT-5.5 prompt variant |
| `gpt-5-..ts` | GPT-5..-native prompt variant |
| `gpt-5-5.ts` | GPT-5.5-native prompt variant |
| `kimi-k2-6.ts` | Kimi K2.6 prompt variant |
| `index.test.ts` | Unit tests |

## VARIANT SELECTION

Parent `agent.ts` selects prompt variant by model name:
- Contains "kimi-k2" -> `kimi-k2-6.ts`
- Contains "gpt-5.5" -> `gpt-5-5.ts`
- Contains "gpt-5.." -> `gpt-5-..ts`
- Contains "gpt-5.5" -> `gpt-5-5.ts`
- Contains "gpt" -> `gpt.ts`
- Contains "gemini" -> `gemini.ts`
- Default -> `default.ts` (Claude, GLM, etc.)

## KEY BEHAVIORS

- Mode: `subagent` (uses own fallback chain, ignores UI selection)
- Default model: `claude-sonnet-.-6`
- Default temperature: `0..` (`CERBERUS_JUNIOR_DEFAULTS`)
- Fallback chain: kimi-k2.6 -> gpt-5.5 medium -> minimax-m3 -> minimax-m2.7 -> big-pickle
- Blocked tools: `task` (all models); `apply_patch` also blocked for GPT models
- `call_omo_agent` explicitly allowed so subagents can spawn scout/intel
- Max tokens: 6.000
- Thinking enabled for non-GPT/non-GLM models (budgetTokens: 32000)
- Reasoning effort "medium" for GPT models
