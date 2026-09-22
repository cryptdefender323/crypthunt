import { describe, expect, it } from "bun:test"
import { selectToolsByPhase, buildCommand, validateCatalog } from "@omop/tools"

describe("tools re-exports pentest-core surface", () => {
  it("#given catalog shape #when validateCatalog #then accepts minimal catalog", () => {
    // given
    const catalog = {
      $schema: "tools-catalog.schema.json",
      version: "1.0.0",
      categories: ["recon"],
      tools: [],
    }

    // when / then
    expect(validateCatalog(catalog)).toBe(true)
  })

  it("#given empty catalog #when selectToolsByPhase #then empty list", () => {
    // given
    const catalog = {
      $schema: "x",
      version: "1",
      categories: [],
      tools: [],
    }

    // when / then
    expect(selectToolsByPhase(catalog as never, "recon")).toEqual([])
  })

  it("#given tool entry #when buildCommand #then joins base + args", () => {
    // given
    const tool = {
      tools_name: "nmap",
      requires_root: false,
      command: {
        base: "nmap",
        flags: [{ name: "-sV", type: "boolean", description: "version" }],
        positional: [],
      },
    }

    // when
    const result = buildCommand(tool as never, { flags: { "-sV": true } })

    // then
    expect(result.fullCommand).toContain("nmap")
    expect(result.args).toContain("-sV")
  })
})
