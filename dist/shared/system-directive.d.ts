/**
 * Unified system directive prefix for crypthunter internal messages.
 * All system-generated messages should use this prefix for consistent filtering.
 *
 * Format: [SYSTEM DIRECTIVE: OH-MY-OPENCODE - {TYPE}]
 */
export declare const SYSTEM_DIRECTIVE_PREFIX = "[SYSTEM DIRECTIVE: OH-MY-OPENCODE";
/**
 * Creates a system directive header with the given type.
 * @param type - The directive type (e.g., "TODO CONTINUATION", "PENTEST LOOP")
 * @returns Formatted directive string like "[SYSTEM DIRECTIVE: OH-MY-OPENCODE - TODO CONTINUATION]"
 */
export declare function createSystemDirective(type: string): string;
/**
 * Checks if a message starts with the crypthunter system directive prefix.
 * Used by keyword-detector and other hooks to skip system-generated messages.
 * @param text - The message text to check
 * @returns true if the message is a system directive
 */
export declare function isSystemDirective(text: string): boolean;
/**
 * Checks if a message contains system-generated content that should be excluded
 * from keyword detection and mode triggering.
 * @param text - The message text to check
 * @returns true if the message contains system-reminder tags
 */
export declare function hasSystemReminder(text: string): boolean;
/**
 * Removes system-reminder tag content from text.
 * This prevents automated system messages from triggering mode keywords.
 * @param text - The message text to clean
 * @returns text with system-reminder content removed
 */
export declare function removeSystemReminders(text: string): string;
export declare const SystemDirectiveTypes: {
    readonly TODO_CONTINUATION: "TODO CONTINUATION";
    readonly PENTEST_LOOP: "PENTEST LOOP";
    readonly BOULDER_CONTINUATION: "BOULDER CONTINUATION";
    readonly DELEGATION_REQUIRED: "DELEGATION REQUIRED";
    readonly SINGLE_TASK_ONLY: "SINGLE TASK ONLY";
    readonly COMPACTION_CONTEXT: "COMPACTION CONTEXT";
    readonly CONTEXT_WINDOW_MONITOR: "CONTEXT WINDOW MONITOR";
    readonly TALOS_READ_ONLY: "TALOS READ-ONLY";
};
export type SystemDirectiveType = (typeof SystemDirectiveTypes)[keyof typeof SystemDirectiveTypes];
