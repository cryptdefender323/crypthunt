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

export const RED_TEAM_PATTERN =
  /--mode\s+red-?team\b|\bred-?team\s+engage\b|\bpentest\s+engage\s+red-?team\b|\brt\s+(?:fullscan|engage)\b|\bred\s+team\s+engage\b|\bred-?team\b/i

export function getRedTeamMessage(): string {
  return `<red-team-mode>
Red-team mode selected. Follow the mode context and configured skill chain.
Configured chain: red-team-workflow → red-recon → red-assess → red-team-report.
If the user has not supplied a target, ask only for its domain or IP and wait.
Do not add an engagement menu, stealth claims, C2/persistence instructions, or
an alternate skill chain here. Passive OSINT may follow the supplied target.
Active reconnaissance and testing require a current signed authorization
letter/rules of engagement naming the target scope, permitted methods, and
time window. If that document is not available, stop before active work.
</red-team-mode>`
}
