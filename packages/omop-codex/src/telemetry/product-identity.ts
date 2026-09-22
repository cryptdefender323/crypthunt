import {
  DEFAULT_POSTHOG_API_KEY,
  DEFAULT_POSTHOG_HOST,
  type TelemetryProductConfig,
} from "@omop/telemetry-core"
import packageJson from "../../package.json" with { type: "json" }

export { DEFAULT_POSTHOG_API_KEY, DEFAULT_POSTHOG_HOST }

export const PRODUCT_NAME = "omop-codex"
export const PACKAGE_NAME = "@omop/omop-codex"
export const CACHE_DIR_NAME = "omop-codex"
export const EVENT_NAME = "omo_codex_daily_active"
export const LEGACY_PARENT_PACKAGE = "oh-my-open-pentest"
export const PRODUCT_ENV_PREFIX = "OMOP_CODEX"
export const MACHINE_ID_PREFIX = "omop-codex:"

export function getProductVersion(): string {
  return packageJson.version
}

export function createCodexTelemetryProductConfig(
  packageVersion: string = getProductVersion(),
  additionalProperties?: TelemetryProductConfig["additionalProperties"],
): TelemetryProductConfig {
  const product = {
    cacheDirName: CACHE_DIR_NAME,
    defaultApiKey: DEFAULT_POSTHOG_API_KEY,
    defaultHost: DEFAULT_POSTHOG_HOST,
    eventName: EVENT_NAME,
    machineIdPrefix: MACHINE_ID_PREFIX,
    packageName: PACKAGE_NAME,
    packageVersion,
    platform: "omop-codex",
    productEnvPrefix: PRODUCT_ENV_PREFIX,
    productName: PRODUCT_NAME,
  }

  if (additionalProperties === undefined) {
    return product
  }

  return {
    ...product,
    additionalProperties,
  }
}
