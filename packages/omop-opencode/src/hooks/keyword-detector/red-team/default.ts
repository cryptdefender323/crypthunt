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

/**
 * Red-team injection message.
 *
 * Stacks three layers on top of the user message:
 * 1. Forces red-team mode context so pentest-context hook overrides mode detection.
 * 2. Injects the fullscan ULW protocol so all agents are at disposal.
 * 3. Mandates the skill chain: red-recon → red-exploit → red-lateral → red-persistence.
 *    Also loads phantom-c2 as the primary C2 skill.
 */
export function getRedTeamMessage(): string {
  return `<red-team-mode>
**RED TEAM ENGAGEMENT ACTIVATED**

ENGAGEMENT MODE: red-team
SKILL CHAIN: red-recon → red-exploit → red-lateral → red-persistence
C2 FRAMEWORK: phantom-c2 (primary), sliver/havoc/mythic (alternatives)
STEALTH: ON | PARALLELISM: 2 | SPEED: slow | REPORT: executive

MANDATORY EXECUTION ORDER:
1. Load skill "red-recon" immediately via skill(name="red-recon") and complete recon phase.
2. Load skill "red-exploit" for initial access — use phantom-c2 as primary C2. Generate implant with --evasion --obfuscate.
3. Load skill "red-lateral" for AD attacks, pivoting, and BOF-based lateral movement.
4. Load skill "red-persistence" for redundant C2 persistence (multi-protocol beacon profiles).
5. Load skill "phantom-c2" whenever Phantom C2 operations are needed (sessions, BOF, engagement tracking).

SCOPE ENFORCEMENT:
- Scope is STRICT. Never test targets outside the declared scope.
- All tool executions respect scope_strict=true, no_dos=true, no_exfiltration=true.
- Stop immediately and report if a scope violation is detected.

TOOL PRIORITY (in order): recon → exploitation → enumeration → reporting
TOOLS AVAILABLE (prioritized for red-team):
  phantom, metasploit, bloodhound, crackmapexec, impacket, netexec, nmap, amass, subfinder,
  responder, hashcat, mimikatz, peass-ng, pwncat-cs, ligolo-ng, sliver, havoc, mythic

OPSEC REMINDERS:
- Prefer in-memory / BOF execution over disk writes.
- Use Phantom C2 beacon with --evasion --obfuscate for all implants.
- Sleep obfuscation and indirect syscalls are always on with --evasion.
- Set beacon jitter to avoid timing fingerprinting.
- Run all long-running processes (phantom-server, listeners) in tmux sessions.

OUTPUT: Save all findings to .omop/red-team/<engagement>/{recon,exploit,lateral,persistence,c2}/

After completing the engagement, compile an executive report covering:
  - Attack path from initial access to objective
  - Evidence per phase (screenshots, command output)
  - Risk ratings per finding
  - Remediation recommendations

Say "RED TEAM ENGAGEMENT ACTIVATED" exactly once as your first response.
Do NOT say the standalone "ULTRAWORK MODE ENABLED!" banner — the red-team banner replaces it.
</red-team-mode>`
}
