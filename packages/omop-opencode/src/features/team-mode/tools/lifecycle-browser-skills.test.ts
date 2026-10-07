import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { clearTeamSessionRegistry } from "../team-session-registry"
import { clearPentestSessionMode, getPentestSessionMode, setPentestSessionMode } from "../../../shared/pentest-session-mode"
import { createTeamCreateTool } from "./lifecycle-create-tool"
import {
  backgroundManager,
  config,
  createSpec,
  createTeamRunMock,
  createToolContext,
  listActiveTeamsMock,
  loadRuntimeStateMock,
  loadTeamSpecMock,
  mockClient,
  resetLifecycleTestState,
} from "./lifecycle-test-fixture"

const dependencies = {
  createTeamRun: createTeamRunMock,
  loadTeamSpec: loadTeamSpecMock,
  listActiveTeams: listActiveTeamsMock,
  loadRuntimeState: loadRuntimeStateMock,
}

describe("team browser skill routing", () => {
  afterAll(() => mock.restore())

  beforeEach(() => {
    resetLifecycleTestState()
    clearTeamSessionRegistry()
    clearPentestSessionMode("lead-session")
    clearPentestSessionMode("member-a-session")
  })

  test("team_create adds Playwright and live checks to web-assessment workers", async () => {
    // given
    const leadSessionID = "lead-session"
    setPentestSessionMode(leadSessionID, "bug-bounty")
    const source = createSpec()
    const members = source.members.map((member) => member.name === "member-a"
      ? { ...member, prompt: "Assess https://target.example.test for XSS and SQLi in the browser" }
      : member)
    const spec = { ...source, members }
    const createTool = createTeamCreateTool(config, mockClient, backgroundManager, undefined, undefined, dependencies)

    // when
    await createTool.execute({ inline_spec: spec }, createToolContext(leadSessionID))

    // then
    const createdSpec = createTeamRunMock.mock.calls[0]?.[0]
    const browserMember = createdSpec?.members.find((member) => member.name === "member-a")
    const leadMember = createdSpec?.members.find((member) => member.name === "lead")
    expect(browserMember?.loadSkills).toContain("playwright")
    expect(browserMember?.loadSkills).toContain("browser-pentest-live")
    expect(leadMember?.loadSkills).not.toContain("browser-pentest-live")
    expect(getPentestSessionMode("member-a-session")).toBe("bug-bounty")
    clearPentestSessionMode("member-a-session")
  })
})
