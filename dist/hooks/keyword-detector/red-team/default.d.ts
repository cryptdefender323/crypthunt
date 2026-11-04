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
export declare function getRedTeamMessage(): string;
