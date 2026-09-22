import { describe, expect, test, beforeEach } from "bun:test"
import { mkdirSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { createHashlineEditDiffEnhancerHook } from "./index"

describe("hashline-edit-diff-enhancer", () => {
  let dir: string
  let filePath: string

  beforeEach(() => {
    dir = join(tmpdir(), `hashline-diff-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    mkdirSync(dir, { recursive: true })
    filePath = join(dir, "sample.txt")
    writeFileSync(filePath, "line one\nline two\n")
  })

  test("#given hashline_edit enabled #when write tool runs #then metadata.diff is set", async () => {
    // given
    const hook = createHashlineEditDiffEnhancerHook({ hashline_edit: { enabled: true } })
    const sessionID = "s1"
    const callID = "c1"
    const beforeOut = { args: { path: filePath } }
    const afterOut = { title: "", output: "ok", metadata: {} as Record<string, unknown> }

    // when
    await hook["tool.execute.before"]?.(
      { tool: "Write", sessionID, callID },
      beforeOut,
    )
    writeFileSync(filePath, "line one\nline two changed\nline three\n")
    await hook["tool.execute.after"]?.(
      { tool: "Write", sessionID, callID },
      afterOut,
    )

    // then
    expect(typeof afterOut.metadata.diff).toBe("string")
    expect(String(afterOut.metadata.diff).length).toBeGreaterThan(0)
    expect(afterOut.metadata.filediff).toMatchObject({
      path: filePath,
      additions: expect.any(Number),
      deletions: expect.any(Number),
    })
    expect(afterOut.title).toBe(filePath)
    rmSync(dir, { recursive: true, force: true })
  })

  test("#given hashline_edit disabled #when write tool runs #then no metadata.diff", async () => {
    // given
    const hook = createHashlineEditDiffEnhancerHook({ hashline_edit: { enabled: false } })
    const afterOut = { title: "", output: "ok", metadata: {} as Record<string, unknown> }

    // when
    await hook["tool.execute.before"]?.(
      { tool: "Write", sessionID: "s", callID: "c" },
      { args: { path: filePath } },
    )
    await hook["tool.execute.after"]?.(
      { tool: "Write", sessionID: "s", callID: "c" },
      afterOut,
    )

    // then
    try {
      expect(afterOut.metadata.diff).toBeUndefined()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
})