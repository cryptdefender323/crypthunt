import { describe, expect, test } from "bun:test"

import { createDelegateTaskPresentation } from "./tool-description"

describe("createDelegateTaskPresentation", () => {
  test("#given sync task usage #when description is rendered #then timeout is described as inactivity based", () => {
    //#given
    const presentation = createDelegateTaskPresentation({})

    //#when
    const description = presentation.description

    //#then
    expect(description).toContain("30-minute inactivity window")
    expect(description).toContain("busy/retry/running")
    expect(description).toContain("not a total wall-clock limit")
  })

  test("#given continuation usage #when description is rendered #then task_id is described as a session id", () => {
    //#given
    const presentation = createDelegateTaskPresentation({})

    //#when
    const description = presentation.description

    //#then
    expect(description).toContain("task_id: Continuation session id")
    expect(description).toContain("ses_")
    expect(description).toContain("not the background task id")
    expect(description).toContain("bg_")
  })

  test("#given independent tasks #when description is rendered #then it encourages complete parallel waves", () => {
    const presentation = createDelegateTaskPresentation({})

    const description = presentation.description

    expect(description).toContain("there is no minimum query count")
    expect(description).toContain("within the active mode's parallelism")
    expect(description).toContain("collect every required result before final reporting")
  })
})
