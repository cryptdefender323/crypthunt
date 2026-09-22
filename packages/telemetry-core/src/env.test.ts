import { describe, expect, test } from "bun:test"

import { shouldDisableTelemetry } from "./index"

const OPT_OUT_CASES = [
  ["unset env enables telemetry", {}, false],
  ["global disable 1", { OMOP_DISABLE_POSTHOG: "1" }, true],
  ["global disable true", { OMOP_DISABLE_POSTHOG: "true" }, true],
  ["global disable yes", { OMOP_DISABLE_POSTHOG: "yes" }, true],
  ["global send 0", { OMOP_SEND_ANONYMOUS_TELEMETRY: "0" }, true],
  ["global send false", { OMOP_SEND_ANONYMOUS_TELEMETRY: "false" }, true],
  ["global send no", { OMOP_SEND_ANONYMOUS_TELEMETRY: "no" }, true],
  ["codex disable 1", { OMOP_CODEX_DISABLE_POSTHOG: "1" }, true],
  ["codex disable true", { OMOP_CODEX_DISABLE_POSTHOG: "true" }, true],
  ["codex disable yes", { OMOP_CODEX_DISABLE_POSTHOG: "yes" }, true],
  ["codex send 0", { OMOP_CODEX_SEND_ANONYMOUS_TELEMETRY: "0" }, true],
  ["codex send false", { OMOP_CODEX_SEND_ANONYMOUS_TELEMETRY: "false" }, true],
  ["codex send no", { OMOP_CODEX_SEND_ANONYMOUS_TELEMETRY: "no" }, true],
  ["approved codex send yes convergence", { OMOP_CODEX_SEND_ANONYMOUS_TELEMETRY: "yes" }, true],
  ["invalid disable value", { OMOP_CODEX_DISABLE_POSTHOG: "maybe" }, false],
] as const

describe("opt-out telemetry env matrix", () => {
  test.each(OPT_OUT_CASES)(
    "#given %s #when evaluated #then disabled=%p",
    (_name, env, expected) => {
      // given
      const productPrefix = "OMOP_CODEX"

      // when
      const result = shouldDisableTelemetry({ env, productEnvPrefix: productPrefix })

      // then
      expect(result).toBe(expected)
    },
  )
})
