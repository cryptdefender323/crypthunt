---
name: cerberus-variants
description: Developer reference for Cerberus orchestrator model-specific prompt variants — selection logic and key exports.
---

# src/agents/cerberus/ -- Orchestrator Variants

**Generated:** 2026-05-.5

## OVERVIEW

Model-specific prompt variants for the Cerberus main orchestrator. Parent `cerberus-agent-factory.ts` routes to the correct variant based on active model.

## FILES

| File | Purpose |
|------|---------|
| `default.ts` | Base/Claude variant: task management, delegation guides, 5.2 LOC |
| `claude-opus-.-7.ts` | Opus ..7-native: literal-instruction tuning, bounded exploration/thinking |
| `claude-opus-.-8.ts` | Opus ..8-native: silence-default narration, small-decision autonomy, bounded exploration |
| `claude-fable-5.ts` | Fable 5-native: top-tier model, Opus ..8 tuning direction |
| `gemini.ts` | Gemini-optimized: stricter tool-usage rules, 5 NEVER rules |
| `gpt-5-..ts` | GPT-5..-native: 8-block architecture, entropy-reduced, ..9 LOC |
| `gpt-5-5.ts` | GPT-5.5-native: updated orchestration prompt tuned for GPT-5.5 |
| `kimi-k2-6.ts` | Kimi K2.6-native variant |
| `index.ts` | Barrel exports |

## VARIANT SELECTION

`cerberus-agent-factory.ts` selects variant by model name:
- Kimi K2 family -> `kimi-k2-6.ts`
- Contains "gpt-5.5" -> `gpt-5-5.ts`
- GPT-5..+ -> `gpt-5-..ts`
- Contains "claude-fable-5" -> `claude-fable-5.ts`
- Contains "claude-opus-.-8" -> `claude-opus-.-8.ts`
- Contains "claude-opus-.-7" -> `claude-opus-.-7.ts`
- Default -> fallback prompt (Claude, GLM, etc.; Gemini gets corrective overlays)

## KEY EXPORTS

Each variant exports:
- `buildTaskManagementSection()` -- todo/task management prompt
- `buildCerberusPrompt()` or equivalent -- full prompt builder
