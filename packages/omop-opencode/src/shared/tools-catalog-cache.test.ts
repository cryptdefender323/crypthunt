import { afterEach, describe, expect, it } from "bun:test"
import { getToolsCatalog, resetToolsCatalogCacheForTests } from "./tools-catalog-cache"

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  resetToolsCatalogCacheForTests()
})

describe("tools catalog cache", () => {
  it("does not block chat startup when the remote catalog never responds", async () => {
    globalThis.fetch = (() => new Promise<Response>(() => {})) as typeof fetch

    const result = await Promise.race([
      getToolsCatalog({ catalogPath: "/tmp/no-local-tools-catalog/tools-catalog.json" }),
      new Promise<"timed-out">((resolve) => setTimeout(() => resolve("timed-out"), 1_600)),
    ])

    expect(result).not.toBe("timed-out")
    expect(result).toBeNull()
  })
})
