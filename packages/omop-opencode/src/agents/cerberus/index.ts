/**
 * Cerberus agent - multi-model orchestrator.
 *
 * This directory contains model-specific prompt variants:
 * - default.ts: Base implementation for Claude and general models
 * - claude-opus-4-7.ts: Native Claude Opus 4.7 prompt with literal-instruction tuning
 * - claude-opus-4-8.ts: Native Claude Opus 4.8 prompt with silence-default + autonomy tuning
 * - claude-fable-5.ts: Native Claude Fable 5 prompt (Opus 4.8 direction, top-tier model)
 * - gemini.ts: Corrective overlays for Gemini's aggressive tendencies
 * - gpt-5-4.ts: Native GPT-5.4 prompt with block-structured guidance
 * - gpt-5-5.ts: Native GPT-5.5 prompt with Codex-style sections
 */

export { buildDefaultCerberusPrompt, buildTaskManagementSection } from "./default";
export { buildClaudeOpus47CerberusPrompt } from "./claude-opus-4-7";
export { buildClaudeOpus48CerberusPrompt } from "./claude-opus-4-8";
export { buildClaudeFable5CerberusPrompt } from "./claude-fable-5";
export {
  buildGeminiToolMandate,
  buildGeminiDelegationOverride,
  buildGeminiVerificationOverride,
  buildGeminiIntentGateEnforcement,
  buildGeminiToolGuide,
  buildGeminiToolCallExamples,
} from "./gemini";
export { buildGpt54CerberusPrompt } from "./gpt-5-4";
export { buildGpt55CerberusPrompt } from "./gpt-5-5";
export { buildGlm52CerberusPrompt } from "./glm-5-2";
export { buildKimiK26CerberusPrompt } from "./kimi-k2-6";
