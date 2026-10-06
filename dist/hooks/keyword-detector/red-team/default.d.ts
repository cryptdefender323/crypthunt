/**
 * Red-team engagement keyword detector.
 *
 * Triggers on explicit red-team mode invocations and the --mode red-team
 * prefix injected by the CLI runner.
 *
 * Matched patterns (case-insensitive, word-bounded):
 *   --mode red-team          (injected by `bunx crypthunter run --mode red-team`)
 *   red-team / redteam       (shorthand in chat)
 *   red team engage          (natural language)
 *   pentest engage red-team  (/pentest-engage red-team <target>)
 *   rt fullscan / rt engage  (ultra-short aliases)
 */
export declare const RED_TEAM_PATTERN: RegExp;
/**
 * Red-team injection message.
 *
 * Stacks three layers on top of the user message:
 * 1. Forces red-team mode context so pentest-context hook overrides mode detection.
 * 2. Injects the fullscan ULW protocol so all agents are at disposal.
 * 3. Mandates the skill chain: red-recon → red-exploit → red-lateral → red-persistence.
 *    Also loads phantom-c2 as the primary C2 skill.
 */
export declare function getRedTeamMessage(): string;
