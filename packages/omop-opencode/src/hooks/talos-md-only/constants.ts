import { createSystemDirective, SystemDirectiveTypes } from "../../shared/system-directive"
import { getAgentDisplayName } from "../../shared/agent-display-names"

export const HOOK_NAME = "talos-md-only"

export const TALOS_AGENT = "talos"

export const ALLOWED_EXTENSIONS = [".md"]

export const ALLOWED_PATH_PREFIX = ".omop"

export const BLOCKED_TOOLS = ["Write", "Edit", "write", "edit"]

/**
 * XML-tag wrapper used to mark the planning-context boundary in prompts
 * forwarded to external LLMs via task(). This format intentionally avoids
 * the `[SYSTEM DIRECTIVE: ...]` bracket syntax that Azure OpenAI Prompt Shield
 * flags as indirect prompt injection in user-role content (#4036).
 */
export const PLANNING_CONTEXT_OPEN = `<planning-context source="talos-read-only">`
export const PLANNING_CONTEXT_CLOSE = `</planning-context>`

export const PLANNING_CONSULT_WARNING = `

---

${PLANNING_CONTEXT_OPEN}

You are being invoked by ${getAgentDisplayName("talos")}, a planning agent restricted to .omop/*.md plan files only.

**CRITICAL CONSTRAINTS:**
- DO NOT modify any files (no Write, Edit, or any file mutations)
- DO NOT execute commands that change system state
- DO NOT create, delete, or rename files
- ONLY provide analysis, recommendations, and information

**YOUR ROLE**: Provide consultation, research, and analysis to assist with planning.
Return your findings and recommendations. The actual implementation will be handled separately after planning is complete.

${PLANNING_CONTEXT_CLOSE}

---

`

export const TALOS_WORKFLOW_REMINDER = `

---

${createSystemDirective(SystemDirectiveTypes.TALOS_READ_ONLY)}

## TALOS MANDATORY WORKFLOW REMINDER

**You are writing a work plan. STOP AND VERIFY you completed ALL steps:**

┌─────────────────────────────────────────────────────────────────────┐
│                     TALOS WORKFLOW                             │
├──────┬──────────────────────────────────────────────────────────────┤
│  1   │ INTERVIEW: Full consultation with user                       │
│      │    - Gather ALL requirements                                 │
│      │    - Clarify ambiguities                                     │
│      │    - Record decisions to .omop/drafts/                   │
├──────┼──────────────────────────────────────────────────────────────┤
│  2   │ METIS CONSULTATION: Pre-generation gap analysis              │
│      │    - task(agent="Vanguard - Plan Consultant", ...)     │
│      │    - Identify missed questions, guardrails, assumptions      │
├──────┼──────────────────────────────────────────────────────────────┤
│  3   │ PLAN GENERATION: Write to .omop/plans/*.md               │
│      │    <- YOU ARE HERE                                           │
├──────┼──────────────────────────────────────────────────────────────┤
│  4   │ MOMUS REVIEW (if high accuracy requested)                    │
│      │    - task(agent="Sentinel - Plan Critic", ...)         │
│      │    - Loop until OKAY verdict                                 │
├──────┼──────────────────────────────────────────────────────────────┤
│  5   │ SUMMARY: Present to user                                     │
│      │    - Key decisions made                                      │
│      │    - Scope IN/OUT                                            │
│      │    - Offer: "Start Work" vs "High Accuracy Review"           │
│      │    - Guide to /start-work                                    │
└──────┴──────────────────────────────────────────────────────────────┘

**DID YOU COMPLETE STEPS 1-2 BEFORE WRITING THIS PLAN?**
**AFTER WRITING, WILL YOU DO STEPS 4-5?**

If you skipped steps, STOP NOW. Go back and complete them.

---

`
