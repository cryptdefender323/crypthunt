import { describe, expect, test } from "bun:test"
import { createCryptHunterJsonSchema } from "./build-schema-document"

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null
}

describe("build-schema-document", () => {
  test("generates schema with skills property", () => {
    // given
    const expectedDraft = "http://json-schema.org/draft-07/schema#"

    // when
    const schema = createCryptHunterJsonSchema()

    // then
    expect(schema.$schema).toBe(expectedDraft)
    expect(schema.title).toBe("CryptHunter Configuration")
    expect(isRecord(schema.properties)).toBe(true)
    const properties = isRecord(schema.properties) ? schema.properties : {}
    expect(properties.skills).toBeDefined()
  })
})
