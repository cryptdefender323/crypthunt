import { describe, expect, it } from "bun:test"
import { renderRoleAndIntentSections } from "./cerberus-dynamic-prompt-role"
import type { CerberusDynamicPromptSections } from "./cerberus-dynamic-prompt-sections"

const sections = {
  agentIdentity: "IDENTITY_MARKER",
  todoHookNote: "TODO_HOOK_NOTE",
  keyTriggers: "KEY_TRIGGERS_MARKER",
} as unknown as CerberusDynamicPromptSections

describe("cerberus role prompt (pentest)", () => {
  it("#given sections #when renderRoleAndIntentSections #then is pentest orchestrator not software-dev lead", () => {
    // given / when
    const out = renderRoleAndIntentSections(sections)

    // then
    expect(out).toContain("IDENTITY_MARKER")
    expect(out).toContain("KEY_TRIGGERS_MARKER")
    expect(out).toContain("TODO_HOOK_NOTE")
    expect(out).toContain("autonomous pentest orchestrator")
    expect(out).toContain("fullscan")
    expect(out).toContain("Scope-bound")
    expect(out).toMatch(/engagement/i)
    expect(out).not.toContain("SF Bay Area engineer")
    expect(out).not.toContain("senior engineer's")
    expect(out).not.toContain("Assess codebase first")
  })

  it("#given role text #when inspected #then intent map covers engagement and exploit routes", () => {
    // given / when
    const out = renderRoleAndIntentSections(sections)

    // then
    expect(out).toContain("fullscan")
    expect(out).toContain("exploit")
    expect(out).toContain("Context-Completion Gate (BEFORE Active Testing)")
  })
})
