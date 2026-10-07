import { beforeEach, describe, expect, it } from "bun:test"
import {
  clearBrowserAssessmentSession,
  isBrowserAssessmentAuthorized,
  recordBrowserAssessmentAuthorization,
  rememberBrowserAssessmentTarget,
} from "./browser-assessment-scope"

describe("browser assessment authorization", () => {
  beforeEach(() => clearBrowserAssessmentSession("session-a"))

  it("limits active tests to the origin and path explicitly authorized by the user", () => {
    // given
    const authorization = "I explicitly authorize active security testing of https://target.example.test/app"

    // when
    const recorded = recordBrowserAssessmentAuthorization("session-a", authorization)

    // then
    expect(recorded).toBe(true)
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/app/search?q=test")).toBe(true)
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/admin")).toBe(false)
    expect(isBrowserAssessmentAuthorized("session-a", "https://other.example.test/app")).toBe(false)
  })

  it("does not register authorization when the user negates permission", () => {
    // given
    const denial = "I am not authorized to test https://target.example.test/"

    // when
    const recorded = recordBrowserAssessmentAuthorization("session-a", denial)

    // then
    expect(recorded).toBe(false)
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/")).toBe(false)
  })

  it("revokes a previously recorded scope when the user withdraws permission", () => {
    // given
    recordBrowserAssessmentAuthorization("session-a", "I authorize active testing of https://target.example.test/")

    // when
    const recorded = recordBrowserAssessmentAuthorization("session-a", "I am not authorized to test this anymore")

    // then
    expect(recorded).toBe(false)
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/")).toBe(false)
  })

  it("applies a direct follow-up authorization to the pending target in the same session", () => {
    // given
    rememberBrowserAssessmentTarget("session-a", "https://target.example.test/app")

    // when
    const recorded = recordBrowserAssessmentAuthorization("session-a", "I am authorized to test it")

    // then
    expect(recorded).toBe(true)
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/app/search")).toBe(true)
    expect(isBrowserAssessmentAuthorized("session-a", "https://other.example.test/app")).toBe(false)
  })

  it("accepts a concise authorization confirmation for the pending target", () => {
    // given
    rememberBrowserAssessmentTarget("session-a", "https://target.example.test/app")

    // when
    const recorded = recordBrowserAssessmentAuthorization("session-a", "Yes, authorized")

    // then
    expect(recorded).toBe(true)
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/app/search")).toBe(true)
  })

  it("clears recorded scope and page state when requested", () => {
    // given
    recordBrowserAssessmentAuthorization("session-a", "Written authorization is available for https://target.example.test/")

    // when
    clearBrowserAssessmentSession("session-a")

    // then
    expect(isBrowserAssessmentAuthorized("session-a", "https://target.example.test/")).toBe(false)
  })
})
