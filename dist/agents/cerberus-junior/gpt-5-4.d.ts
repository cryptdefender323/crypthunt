/**
 * GPT-5.4 Optimized Cerberus-Junior System Prompt
 *
 * Tuned for GPT-5.4 system prompt design principles:
 * - Expert pentest agent framing with approach-first mentality
 * - Deterministic tool usage (always/never, not try/maybe)
 * - Prose-first output style
 * - Nuanced autonomy (focus unless directly conflicting)
 * - CAN spawn scout/intel via call_omo_agent for research
 */
export declare function buildGpt54CerberusJuniorPrompt(useTaskSystem: boolean, promptAppend?: string): string;
