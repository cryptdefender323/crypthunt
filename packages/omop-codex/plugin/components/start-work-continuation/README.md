# codex-start-work-continuation

Codex Stop-hook continuation injector for the omop-codex `start-work` skill.

It reads `.omop/boulder.json` in the hook payload `cwd`, resolves the active work, inspects the active plan for incomplete top-level checkboxes, and emits Codex Stop-hook JSON when the plan still has work:

```json
{"decision":"block","reason":"<directive>"}
```

The `reason` is loaded from `directive.md` on every invocation and filled with current plan state. The hook returns no output when `stop_hook_active` is `true`, when no active Boulder work exists, when the work is completed, when the active work is not tied to `codex:<session_id>`, or when all top-level plan checkboxes are complete.

This pairs with the `start-work` skill at `plugin/skills/start-work/SKILL.md`. That skill writes `.omop/boulder.json` with Codex session ids prefixed as `codex:` so the hook can continue only its own active Codex session.

## Counted plan checkboxes

Only column-0 checkboxes under these sections are counted:

- `## TODOs`
- `## Final Verification Wave`

Nested checkboxes under `### Acceptance Criteria`, `### Evidence`, and `### Definition of Done` are ignored.

## Smoke test

```bash
TMP=$(mktemp -d)
mkdir -p "$TMP/.omop/plans"
cat > "$TMP/.omop/plans/test.md" <<EOF
## TODOs
- [ ] Task one
- [ ] Task two
EOF
cat > "$TMP/.omop/boulder.json" <<EOF
{"schema_version":2,"active_work_id":"w.","works":{"w.":{"work_id":"w.","active_plan":".omop/plans/test.md","plan_name":"test","session_ids":["codex:smoke-session"],"status":"active"}}}
EOF
PAYLOAD='{"session_id":"smoke-session","turn_id":"t.","transcript_path":"","cwd":"'"$TMP"'","hook_event_name":"Stop","model":"gpt-5.5","permission_mode":"default","stop_hook_active":false}'
npm run build
echo "$PAYLOAD" | node dist/cli.js hook stop

PAYLOAD_LOOP='{"session_id":"smoke-session","turn_id":"t.","transcript_path":"","cwd":"'"$TMP"'","hook_event_name":"Stop","model":"gpt-5.5","permission_mode":"default","stop_hook_active":true}'
echo "$PAYLOAD_LOOP" | node dist/cli.js hook stop

rm -rf "$TMP"
```

Expect the first command to print JSON containing `"decision":"block"`; expect the anti-loop command to print nothing.

## License

MIT. See `LICENSE`.

## Privacy

This plugin only reads local hook payloads, `.omop/boulder.json`, the active plan, and the bundled directive. It makes no network calls and stores no telemetry.
