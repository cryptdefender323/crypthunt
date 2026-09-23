/// <reference path="../../../../../bun-test.d.ts" />

import { describe, expect, test } from "bun:test"
import { CryptHunterConfigSchema } from "./crypthunter-config"

describe("CryptHunterConfigSchema disabled_skills", () => {
  test("accepts review-work, shared aliases, and runtime security skills", () => {
    // given
    const config = {
      disabled_skills: [
        "review-work",
        "remove-ai-slops",
        "init-deep",
        "security-research",
        "security-review",
        "vulnerability analysis",
        "visual-qa",
        "shared/ulw-plan",
      ],
    }

    // when
    const result = CryptHunterConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disabled_skills).toEqual([
        "review-work",
        "remove-ai-slops",
        "init-deep",
        "security-research",
        "security-review",
        "vulnerability analysis",
        "visual-qa",
        "shared/ulw-plan",
      ])
    }
  })
})
