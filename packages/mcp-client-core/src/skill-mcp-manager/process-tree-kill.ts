import { execFileSync } from "node:child_process"
import process from "node:process"

export function killProcessTree(pid: number): void {
  if (!Number.isInteger(pid) || pid <= 0) return

  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/pid", String(pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      })
    } catch {
      // process may already be gone
    }
    return
  }

  try {
    execFileSync("pkill", ["-KILL", "-P", String(pid)], { stdio: "ignore" })
  } catch {
    // no children or pkill unavailable
  }
  try {
    process.kill(pid, "SIGKILL")
  } catch {
    // already exited
  }
}

export function readTransportPid(transport: unknown): number | null {
  if (typeof transport !== "object" || transport === null) return null
  if (!("pid" in transport)) return null
  const pid = (transport as { pid?: unknown }).pid
  return typeof pid === "number" && Number.isInteger(pid) && pid > 0 ? pid : null
}
