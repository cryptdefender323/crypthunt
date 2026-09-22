import { existsSync, readFileSync, watch } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  resolveOmopDir,
  listEngagements,
  loadFindings,
  loadAttackModel,
  loadReport,
  loadPhantomAuditLog,
  loadToolStatus,
  loadCtfChallenges,
  loadResearchState,
  loadDashboardSettings,
  saveDashboardSettings,
} from "./data/engagement"
import { fetchSessions, triggerEngagement } from "./data/opencode-client"

function resolvePublicDir(): string {
  const fromMeta = join(dirname(fileURLToPath(import.meta.url)), "public")
  if (existsSync(fromMeta)) return fromMeta
  const fromPkg = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "public")
  if (existsSync(fromPkg)) return fromPkg
  const fromRoot = join(process.cwd(), "packages", "dashboard", "src", "public")
  if (existsSync(fromRoot)) return fromRoot
  return fromMeta
}
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
}

export interface DashboardOptions {
  port: number
  cwd: string
  opencodePort: number
  open: boolean
}

const sseClients = new Set<ReadableStreamDefaultController<Uint8Array>>()

function broadcast(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(payload)
  for (const ctrl of sseClients) {
    try {
      ctrl.enqueue(encoded)
    } catch {
      sseClients.delete(ctrl)
    }
  }
}

function serveStatic(pathname: string, publicDir: string): Response | null {
  const clean = pathname === "/" ? "/index.html" : pathname
  const ext = clean.slice(clean.lastIndexOf("."))
  const filePath = join(publicDir, clean)
  if (!existsSync(filePath)) return null
  const content = readFileSync(filePath)
  return new Response(content, {
    headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
  })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  })
}

export function startDashboardServer(opts: DashboardOptions): void {
  const omopDir = resolveOmopDir(opts.cwd)
  const publicDir = resolvePublicDir()

  if (existsSync(omopDir)) {
    try {
      watch(omopDir, { recursive: true }, () => {
        broadcast("refresh", { ts: Date.now() })
      })
    } catch {
      // watch not supported on this platform — SSE still works on poll
    }
  }

  Bun.serve({
    port: opts.port,
    hostname: "127.0.0.1",
    async fetch(req) {
      const url = new URL(req.url)
      const path = url.pathname

      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST", "Access-Control-Allow-Headers": "Content-Type" },
        })
      }

      if (path === "/events") {
        let ctrl: ReadableStreamDefaultController<Uint8Array>
        const stream = new ReadableStream<Uint8Array>({
          start(c) {
            ctrl = c
            sseClients.add(ctrl)
            const hello = new TextEncoder().encode(`event: connected\ndata: {}\n\n`)
            ctrl.enqueue(hello)
          },
          cancel() {
            sseClients.delete(ctrl)
          },
        })
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
          },
        })
      }

      if (path === "/api/engagements") {
        return json(listEngagements(omopDir))
      }

      if (path.startsWith("/api/engagements/") && path.endsWith("/findings")) {
        const id = path.split("/")[3]
        const engagements = listEngagements(omopDir)
        const eng = engagements.find((e) => e.id === id)
        if (!eng) return json({ error: "not found" }, 404)
        return json(loadFindings(eng.dir))
      }

      if (path.startsWith("/api/engagements/") && path.endsWith("/report")) {
        const id = path.split("/")[3]
        const engagements = listEngagements(omopDir)
        const eng = engagements.find((e) => e.id === id)
        if (!eng) return json({ error: "not found" }, 404)
        const report = loadReport(eng.dir)
        return json({ markdown: report ?? "" })
      }

      if (path === "/api/attack-model") {
        return json(loadAttackModel(omopDir) ?? {})
      }

      if (path === "/api/sessions") {
        const sessions = await fetchSessions(opts.opencodePort)
        return json(sessions)
      }

      if (path === "/api/phantom/audit") {
        return json({ log: loadPhantomAuditLog(omopDir) ?? "" })
      }

      if (path === "/api/tools/status") {
        const eng = listEngagements(omopDir)[0]
        return json({ status: eng ? loadToolStatus(eng.dir) ?? "" : "" })
      }

      if (path === "/api/ctf/challenges") {
        return json(loadCtfChallenges(omopDir))
      }

      if (path === "/api/research/state") {
        return json(loadResearchState(omopDir) ?? null)
      }

      if (path === "/api/settings" && req.method === "GET") {
        return json(loadDashboardSettings(opts.cwd))
      }

      if (path === "/api/settings" && req.method === "POST") {
        const body = await req.json().catch(() => null) as import("./data/engagement").DashboardSettings | null
        if (!body) return json({ error: "invalid body" }, 400)
        try {
          saveDashboardSettings(opts.cwd, body)
          return json({ ok: true })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          return json({ error: msg }, 500)
        }
      }

      if (path === "/api/engage" && req.method === "POST") {
        const body = await req.json().catch(() => ({})) as { mode?: string; target?: string; message?: string }
        const mode = body.mode ?? "red-team"
        const target = body.target ?? ""
        const message = body.message ?? `${mode} fullscan ${target}`
        const result = await triggerEngagement({ message, mode, port: opts.opencodePort })
        return json(result, result.error ? 500 : 200)
      }

      const staticResp = serveStatic(path, publicDir)
      if (staticResp) return staticResp

      const indexResp = serveStatic("/index.html", publicDir)
      return indexResp ?? new Response("Not found", { status: 404 })
    },
    error(err) {
      console.error("[dashboard] server error:", err.message)
      return new Response("Internal error", { status: 500 })
    },
  })

  const url = `http://localhost:${opts.port}`
  console.log(`\n  CryptHunter Dashboard → ${url}\n`)

  if (opts.open) {
    const open = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"
    Bun.spawn([open, url], { stdout: "ignore", stderr: "ignore" })
  }
}
