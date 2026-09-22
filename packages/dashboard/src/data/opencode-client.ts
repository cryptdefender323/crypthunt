import { createOpencodeClient } from "@opencode-ai/sdk"

const DEFAULT_PORT = 4096

export interface SessionInfo {
  id: string
  title?: string
  parentID?: string
  createdAt?: number
  updatedAt?: number
}

export interface MessageInfo {
  id: string
  role: string
  text?: string
  toolName?: string
  toolInput?: string
  toolOutput?: string
}

export function createClient(port = DEFAULT_PORT) {
  return createOpencodeClient({ baseUrl: `http://127.0.0.1:${port}` })
}

export async function fetchSessions(port = DEFAULT_PORT): Promise<SessionInfo[]> {
  try {
    const client = createClient(port)
    const res = await client.session.list({})
    const sessions = (res as { sessions?: SessionInfo[] }).sessions ?? []
    return sessions
  } catch {
    return []
  }
}

export async function fetchSessionMessages(
  sessionId: string,
  port = DEFAULT_PORT,
): Promise<MessageInfo[]> {
  try {
    const client = createClient(port)
    const res = await (client.session as unknown as {
      messages: (opts: { path: { id: string } }) => Promise<{ messages?: MessageInfo[] }>
    }).messages({ path: { id: sessionId } })
    return res.messages ?? []
  } catch {
    return []
  }
}

export async function triggerEngagement(opts: {
  message: string
  mode: string
  port?: number
}): Promise<{ sessionId?: string; error?: string }> {
  try {
    const client = createClient(opts.port ?? DEFAULT_PORT)
    const session = await client.session.create({
      body: {
        title: `crypthunter engagement: ${opts.mode}`,
      },
      query: { directory: process.cwd() },
    })
    const sessionId = (session as { id?: string }).id
    if (!sessionId) return { error: "no session id returned" }

    await (client.session as unknown as {
      prompt: (opts: { path: { id: string }; body: { parts: { type: string; text: string }[] } }) => Promise<void>
    }).prompt({
      path: { id: sessionId },
      body: {
        parts: [{ type: "text", text: `--mode ${opts.mode}\n\n${opts.message}` }],
      },
    })

    return { sessionId }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
