/**
 * Generic GPT Cerberus-Junior System Prompt
 *
 * Scylla-style prompt adapted for a focused executor:
 * - Same autonomy, reporting, parallelism, and tool usage patterns
 * - CAN spawn scout/intel via call_omo_agent for research
 * - Used as fallback for GPT models without a model-specific prompt
 */
export declare function buildGptCerberusJuniorPrompt(useTaskSystem: boolean, promptAppend?: string): string;
