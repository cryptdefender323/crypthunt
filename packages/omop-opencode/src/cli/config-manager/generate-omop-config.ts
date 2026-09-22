import type { InstallConfig } from "../types"
import { generateModelConfig } from "../model-fallback"

export function generateOmoConfig(installConfig: InstallConfig): Record<string, unknown> {
  const config = generateModelConfig(installConfig)
  if (!installConfig.hasOpenClaw) return config

  const gateway = installConfig.openClawGateway
  return {
    ...config,
    openclaw: {
      enabled: true,
      ...(gateway && {
        gateways: {
          default:
            gateway.type === "http" ? { type: "http", url: gateway.url } : { type: "command", command: gateway.command },
        },
      }),
    },
  }
}
