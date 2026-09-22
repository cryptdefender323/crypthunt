import {
  resolveTelemetryStateDir,
} from "@omop/telemetry-core"
import type { XdgOsProvider } from "@omop/utils"
import { dirname } from "node:path"

import { createCodexTelemetryProductConfig } from "./product-identity"

type OsProvider = XdgOsProvider

let osProviderOverride: OsProvider | null = null

export function getOsProvider(): OsProvider | undefined {
  return osProviderOverride ?? undefined
}

export function __setOsProviderForTesting(provider: OsProvider): void {
  osProviderOverride = provider
}

export function __resetOsProviderForTesting(): void {
  osProviderOverride = null
}

export function getDataDir(): string {
  return dirname(resolveTelemetryStateDir(createCodexTelemetryProductConfig(), {
    env: process.env,
    osProvider: getOsProvider(),
  }))
}

export function getActivityStateDir(): string {
  return resolveTelemetryStateDir(createCodexTelemetryProductConfig(), {
    env: process.env,
    osProvider: getOsProvider(),
  })
}
