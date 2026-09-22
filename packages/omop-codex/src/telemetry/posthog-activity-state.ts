import {
  getDailyActiveCaptureState,
  getTelemetryActivityStateFilePath,
} from "@omop/telemetry-core"
import type {
  PostHogActivityCaptureState,
  PostHogActivityState,
} from "@omop/telemetry-core"

import { getActivityStateDir } from "./data-path"
import { writeTelemetryDiagnostic } from "./diagnostics"

export type {
  PostHogActivityCaptureState,
  PostHogActivityState,
}

export function getPostHogActivityStateFilePath(): string {
  return getTelemetryActivityStateFilePath(getActivityStateDir())
}

export function getPostHogActivityCaptureState(
  now: Date = new Date(),
): PostHogActivityCaptureState {
  return getDailyActiveCaptureState({
    diagnostics: writeTelemetryDiagnostic,
    now,
    stateDir: getActivityStateDir(),
  })
}
