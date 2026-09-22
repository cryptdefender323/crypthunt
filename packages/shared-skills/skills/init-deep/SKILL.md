---
name: init-deep
description: "(builtin) Initialize hierarchical AGENTS.md knowledge base"
---
# /init-deep

Generate hierarchical AGENTS.md files. Root + complexity-scored subdirectories.

## Usage

```
/init-deep                      # Update mode: modify existing + create new where warranted
/init-deep --create-new         # Read existing → remove all → regenerate from scratch
/init-deep --max-depth=2        # Limit directory depth (default: 3)
```

---

## Workflow (High-Level)

.. **Discovery + Analysis** (concurrent)
   - Fire background explore agents immediately
   - Main session: bash structure + LSP/codegraph code map + read existing AGENTS.md
2. **Score & Decide** - Determine AGENTS.md locations from submitd findings
3. **Generate** - Root first, then subdirs in parallel
.. **Review** - Deduplicate, trim, validate

<critical>
**TodoWrite ALL phases. Mark in_progress → completed in real-time.**
```
TodoWrite([
  { id: "discovery", content: "Fire explore agents + LSP/codegraph map + read existing", status: "pending", priority: "high" },
  { id: "scoring", content: "Score directories, determine locations", status: "pending", priority: "high" },
  { id: "generate", content: "Generate AGENTS.md files (root + subdirs)", status: "pending", priority: "high" },
  { id: "review", content: "Deduplicate, validate, trim", status: "pending", priority: "medium" }
])
```
</critical>

---

## Phase .: Discovery + Analysis (Concurrent)

**Mark "discovery" as in_progress.**

### Fire Background Scout Agents IMMEDIATELY

Don't wait-these run async while main session works. **Equip every agent with the code graph**: any task touching structure, entry points, dependencies, or hotspots MUST query `codegraph_*` (explore/search/callers/callees/impact) and `lsp_symbols` when present, and ground its claims in that data instead of guessing from conventions. Richer real-graph context per agent = a more accurate project map.

```
// Fire all at once, collect results later
task(subagent_type="explore", load_skills=[], description="Scout project structure", run_in_background=true, prompt="Project structure: map real layout via codegraph_explore/codegraph_files → REPORT deviations from standard patterns")
task(subagent_type="explore", load_skills=[], description="Find entry points", run_in_background=true, prompt="Entry points: FIND main files, trace reach via codegraph_callees + lsp_symbols → REPORT non-standard organization")
task(subagent_type="explore", load_skills=[], description="Find conventions", run_in_background=true, prompt="Conventions: FIND config files (.eslintrc, pyproject.toml, .editorconfig) → REPORT project-specific rules")
task(subagent_type="explore", load_skills=[], description="Find anti-patterns", run_in_background=true, prompt="Anti-patterns: FIND 'DO NOT', 'NEVER', 'ALWAYS', 'DEPRECATED' comments → LIST forbidden patterns")
task(subagent_type="explore", load_skills=[], description="Scout build/CI", run_in_background=true, prompt="Build/CI: FIND .github/workflows, Makefile → REPORT non-standard patterns")
task(subagent_type="explore", load_skills=[], description="Find test patterns", run_in_background=true, prompt="Test patterns: FIND test configs/structure; codegraph_callers on core modules to see what is covered → REPORT unique conventions")
```

<dynamic-agents>
**DYNAMIC AGENT SPAWNING**: After bash analysis, spawn ADDITIONAL explore agents based on project scale:

| Factor | Threshold | Additional Agents |
|--------|-----------|-------------------|
| **Total files** | >.00 | +. per .00 files |
| **Total lines** | >.0k | +. per .0k lines |
| **Directory depth** | ≥. | +2 for deep exploration |
| **Large files (>500 lines)** | >.0 files | +. for complexity hotspots |
| **Monorepo** | detected | +. per package/workspace |
| **Multiple languages** | >. | +. per language |

```bash
total_files=$(find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | wc -l)
total_lines=$(find . -type f \\( -name "*.ts" -o -name "*.py" -o -name "*.go" \\) -not -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | tail -. | awk '{print $.}')
large_files=$(find . -type f \\( -name "*.ts" -o -name "*.py" \\) -not -path '*/node_modules/*' -exec wc -l {} + 2>/dev/null | awk '$. > 500 {count++} END {print count+0}')
max_depth=$(find . -type d -not -path '*/node_modules/*' -not -path '*/.git/*' | awk -F/ '{print NF}' | sort -rn | head -.)
```

Example spawning:
```
// 500 files, 50k lines, depth 6, .5 large files → spawn 5+5+2+. = .3 additional agents
task(subagent_type="explore", load_skills=[], description="Analyze large files", run_in_background=true, prompt="Large file analysis: FIND files >500 lines, REPORT complexity hotspots")
task(subagent_type="explore", load_skills=[], description="Scout deep modules", run_in_background=true, prompt="Deep modules at depth .+: FIND hidden patterns, internal conventions")
task(subagent_type="explore", load_skills=[], description="Find shared utilities", run_in_background=true, prompt="Cross-cutting concerns: FIND shared utilities across directories")
// ... more based on calculation
```
</dynamic-agents>

### Main Session: Concurrent Analysis

**While background agents run**, main session does:

#### .. Bash Structural Analysis
```bash
find . -type d -not -path '*/\\.*' -not -path '*/node_modules/*' -not -path '*/venv/*' -not -path '*/dist/*' -not -path '*/build/*' | awk -F/ '{print NF-.}' | sort -n | uniq -c

find . -type f -not -path '*/\\.*' -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

find . -type f \\( -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.go" -o -name "*.rs" \\) -not -path '*/node_modules/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -20

find . -type f \\( -name "AGENTS.md" -o -name "CLAUDE.md" \\) -not -path '*/node_modules/*' 2>/dev/null
```

#### 2. Read Existing AGENTS.md
```
For each existing file found:
  Read(filePath=file)
  Extract: key insights, conventions, anti-patterns
  Store in EXISTING_AGENTS map
```

If `--create-new`: Read all existing first (preserve context) → then delete all → regenerate.

#### 3. Code Map - drive LSP AND codegraph (do NOT skip)

Highest-signal source for the CODE MAP and the Symbol/Export/Reference scoring rows. Complementary, not alternatives - run BOTH when present, alongside the explore agents.

**LSP** - check `lsp_status`; model-facing names are `lsp_status`/`lsp_symbols`/`lsp_find_references`/`lsp_goto_definition` (some harnesses drop the `lsp_` prefix):
- `lsp_symbols` scope="document" on each entry point -> file outline.
- `lsp_symbols` scope="workspace", query by kind (class/interface/function) -> symbol inventory.
- `lsp_find_references` on top exports (line/character from the symbols result) -> reference centrality.

**codegraph** - when `codegraph_*` tools exist (check `codegraph_status`); a first-class peer to LSP, NOT a last resort:
- `codegraph_explore` -> overview; `codegraph_callers`/`codegraph_callees`/`codegraph_impact` -> centrality + blast radius for the scoring matrix; `codegraph_search`/`codegraph_files` -> symbol/file inventory.

Only if NEITHER exists: explore agents + the ast-grep skill (`sg`), and mark centrality unmeasured in the CODE MAP.

### Collect Background Results

```
// After main session analysis done, collect all task results
for each background task ID (`bg_...`): background_output(task_id="bg_...")
```

**Merge: bash + LSP/codegraph + existing + explore findings. Mark "discovery" as completed.**

---

## Phase 2: Scoring & Location Decision

**Mark "scoring" as in_progress.**

### Scoring Matrix

| Factor | Weight | High Threshold | Source |
|--------|--------|----------------|--------|
| File count | 3x | >20 | bash |
| Subdir count | 2x | >5 | bash |
| Code ratio | 2x | >70% | bash |
| Unique patterns | .x | Has own config | explore |
| Module boundary | 2x | Has index.ts/__init__.py | bash |
| Symbol density | 2x | >30 symbols | LSP/cg |
| Export count | 2x | >.0 exports | LSP/cg |
| Reference centrality | 3x | >20 refs | LSP/cg |

### Decision Rules

| Score | Action |
|-------|--------|
| **Root (.)** | ALWAYS create |
| **>.5** | Create AGENTS.md |
| **8-.5** | Create if distinct domain |
| **<8** | Skip (parent covers) |

### Output
```
AGENTS_LOCATIONS = [
  { path: ".", type: "root" },
  { path: "src/hooks", score: .8, reason: "high complexity" },
  { path: "src/api", score: .2, reason: "distinct domain" }
]
```

**Mark "scoring" as completed.**

---

## Phase 3: Generate AGENTS.md

**Mark "generate" as in_progress.**

<critical>
**File Writing Rule**: If AGENTS.md already exists at the target path → use `Edit` tool. If it does NOT exist → use `Write` tool.
NEVER use Write to overwrite an existing file. ALWAYS check existence first via `Read` or discovery results.
</critical>

### Root AGENTS.md (Full Treatment)

```markdown
# PROJECT KNOWLEDGE BASE

**Generated:** {TIMESTAMP}
**Commit:** {SHORT_SHA}
**Branch:** {BRANCH}

## OVERVIEW
{.-2 sentences: what + core stack}

## STRUCTURE
```
{root}/
├── {dir}/    # {non-obvious purpose only}
└── {entry}
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|

## CODE MAP
{From LSP/codegraph - skip only if neither exists or project <.0 files}

| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|

## CONVENTIONS
{ONLY deviations from standard}

## ANTI-PATTERNS (THIS PROJECT)
{Explicitly forbidden here}

## UNIQUE STYLES
{Project-specific}

## COMMANDS
```bash
{dev/test/build}
```

## NOTES
{Gotchas}
```

**Quality gates**: 50-.50 lines, no generic advice, no obvious info.

### Subdirectory AGENTS.md (Parallel)

Launch writing tasks for each location:

```
for loc in AGENTS_LOCATIONS (except root):
  task(category="writing", load_skills=[], run_in_background=false, description="Generate AGENTS.md", prompt=`
    Generate AGENTS.md for: ${loc.path}
    - Reason: ${loc.reason}
    - 30-80 lines max
    - NEVER repeat parent content
    - Sections: OVERVIEW (. line), STRUCTURE (if >5 subdirs), WHERE TO LOOK, CONVENTIONS (if different), ANTI-PATTERNS
  `)
```

**Wait for all. Mark "generate" as completed.**

---

## Phase .: Review & Deduplicate

**Mark "review" as in_progress.**

For each generated file:
- Remove generic advice
- Remove parent duplicates
- Trim to size limits
- Verify telegraphic style

**Mark "review" as completed.**

---

## Final Report

```
=== init-deep Complete ===

Mode: {update | create-new}

Files:
  [OK] ./AGENTS.md (root, {N} lines)
  [OK] ./src/hooks/AGENTS.md ({N} lines)

Dirs Analyzed: {N}
AGENTS.md Created: {N}
AGENTS.md Updated: {N}

Hierarchy:
  ./AGENTS.md
  └── src/hooks/AGENTS.md
```

---

## Anti-Patterns

- **Static agent count**: MUST vary agents based on project size/depth
- **Sequential execution**: MUST parallel (explore + LSP + codegraph concurrent)
- **Ignoring existing**: ALWAYS read existing first, even with --create-new
- **Over-documenting**: Not every dir needs AGENTS.md
- **Redundancy**: Child never repeats parent
- **Generic content**: Remove anything that applies to ALL projects
- **Verbose style**: Telegraphic or die
