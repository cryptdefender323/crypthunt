---
name: work-with-pr-workspace
description: "Git workflow skill for working with pull requests in isolated worktrees — branch creation, implementation, QA evidence, PR creation via gh CLI. Triggers: 'create pr', 'pull request', 'work with pr', 'git worktree', 'isolated branch', 'submit work', 'pr workflow'."
---

# Work With PR (Isolated Worktree Workflow)

Standard workflow for all non-hotfix work: isolated worktree → implement → QA → PR → merge.

## Phase 1: Create Isolated Worktree

```bash
BRANCH="feature/your-feature-name"
BASE="dev"

git fetch origin "$BASE"

git worktree add "../$(basename $(pwd))-$BRANCH" -b "$BRANCH" "origin/$BASE"

cd "../$(basename $(pwd))-$BRANCH"
```

## Phase 2: Implement Changes

```bash
bun install

bun run build 2>&1 | tail -5

bun run typecheck 2>&1 | grep error | head -20

bun test 2>&1 | tail -10
```

## Phase 3: QA Evidence (Required for omop-opencode changes)

```bash
SLUG="feature-short-slug"
DATE=$(date +%Y%m%d)
EVIDENCE_DIR=".omop/evidence/${DATE}-${SLUG}"

mkdir -p "$EVIDENCE_DIR"

# Run tests and capture
bun test 2>&1 | tee "$EVIDENCE_DIR/test-output.txt"

bun run typecheck 2>&1 | tee "$EVIDENCE_DIR/typecheck.txt"

bun run build 2>&1 | tee "$EVIDENCE_DIR/build.txt"

cat > "$EVIDENCE_DIR/evidence.md" << EOF

Date: $DATE
Branch: $BRANCH

## Changes
- File 1 — what changed
- File 2 — what changed

## Static Verification
- bun test: PASS (N/N tests)
- bun run typecheck: PASS (0 errors)
- bun run build: PASS (X.XX MB, Y modules)

## Manual QA
Describe steps taken to manually verify the feature works.
EOF
```

## Phase 4: Create Pull Request

```bash
git add -p  # interactive staging — never use git add -A
git commit -m "feat: description of change"

git push -u origin "$BRANCH"

gh pr create \
  --base dev \
  --title "feat: your feature title" \
  --body "$(cat << 'EOF'
## Summary
- Change 1
- Change 2

## Test plan
- [ ] bun test passes
- [ ] bun run typecheck passes
- [ ] Manual QA verified (see .omop/evidence/)

🤖 Generated with Claude Code
EOF
)"

gh pr view --web
```

## Phase 5: Merge (After Review)

```bash
PR_NUMBER=123

gh pr merge "$PR_NUMBER" --merge --delete-branch

cd ..
git worktree remove "$(basename $(pwd))-$BRANCH"
git fetch --prune
```

## Output

- PR URL from `gh pr create`
- Evidence in `.omop/evidence/<date>-<slug>/`

## Rules

- PRs target `dev`, never `master`
- Merge = merge commit only (`--merge`), never `--squash` or `--rebase`
- No commit without explicit user request
- QA evidence required for any `packages/omop-opencode/` change
