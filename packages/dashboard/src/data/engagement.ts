import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { homedir } from "node:os"

export interface Finding {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  host?: string
  evidence?: string
  confidence?: string
  validationLevel?: number
  timestamp?: string
  source?: "phantom" | "tool" | "manual"
}

export interface EngagementMeta {
  id: string
  name: string
  target: string
  mode: string
  scope?: string
  startTime?: string
  status: "active" | "complete" | "paused" | "unknown"
  findingCount: number
  dir: string
}

export interface AttackModelSnapshot {
  mode: string
  signals: {
    techs: string[]
    ports: string[]
    vulnKeywords: string[]
  }
  openHypotheses: string[]
  confirmed: string[]
  rejected: string[]
  chainCandidateCount: number
}

export interface PhantomSession {
  id: string
  host?: string
  arch?: string
  os?: string
  status: "active" | "idle"
  engagementId?: string
}

function safeReadJson<T>(path: string): T | null {
  try {
    const raw = readFileSync(path, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function safeReadText(path: string): string | null {
  try {
    return readFileSync(path, "utf8")
  } catch {
    return null
  }
}

export function resolveOmopDir(cwd: string): string {
  const local = join(cwd, ".omop")
  if (existsSync(local)) return local
  return join(homedir(), ".omop")
}

export function listEngagements(omopDir: string): EngagementMeta[] {
  const redTeamDir = join(omopDir, "red-team")
  const engagementsDir = join(omopDir, "engagements")
  const results: EngagementMeta[] = []

  for (const baseDir of [redTeamDir, engagementsDir]) {
    if (!existsSync(baseDir)) continue
    for (const name of readdirSync(baseDir)) {
      const dir = join(baseDir, name)
      if (!statSync(dir).isDirectory()) continue
      const state = safeReadJson<Record<string, unknown>>(join(dir, "state.json"))
      const findings = loadFindings(dir)
      results.push({
        id: name,
        name,
        target: (state?.target as string) ?? name,
        mode: (state?.mode as string) ?? "red-team",
        scope: state?.scope as string | undefined,
        startTime: state?.start_time as string | undefined,
        status: deriveStatus(state),
        findingCount: findings.length,
        dir,
      })
    }
  }

  return results.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1
    if (b.status === "active" && a.status !== "active") return 1
    return (b.startTime ?? "").localeCompare(a.startTime ?? "")
  })
}

function deriveStatus(state: Record<string, unknown> | null): EngagementMeta["status"] {
  if (!state) return "unknown"
  const s = state.status as string | undefined
  if (s === "complete") return "complete"
  if (s === "active" || s === "running") return "active"
  if (s === "paused") return "paused"
  return "unknown"
}

export function loadFindings(engagementDir: string): Finding[] {
  const findings: Finding[] = []

  const phantomJson = safeReadJson<{ findings?: Finding[] }>(
    join(engagementDir, "c2", "phantom-findings.json"),
  )
  if (phantomJson?.findings) findings.push(...phantomJson.findings)

  const findingsJson = safeReadJson<Finding[]>(join(engagementDir, "findings.json"))
  if (findingsJson) findings.push(...findingsJson)

  const findingsTxt = safeReadText(join(engagementDir, "exploit", "findings.txt"))
  if (findingsTxt) {
    for (const line of findingsTxt.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      findings.push({
        id: `txt-${findings.length}`,
        title: trimmed,
        severity: guessSeverity(trimmed),
        source: "tool",
      })
    }
  }

  const deduped = new Map<string, Finding>()
  for (const f of findings) {
    deduped.set(f.id ?? f.title, f)
  }
  return [...deduped.values()]
}

function guessSeverity(text: string): Finding["severity"] {
  const lower = text.toLowerCase()
  if (lower.includes("critical") || lower.includes("rce") || lower.includes("sqli")) return "critical"
  if (lower.includes("high") || lower.includes("admin") || lower.includes("privesc")) return "high"
  if (lower.includes("medium") || lower.includes("xss") || lower.includes("csrf")) return "medium"
  if (lower.includes("low") || lower.includes("info")) return "low"
  return "info"
}

export function loadAttackModel(omopDir: string): AttackModelSnapshot | null {
  return safeReadJson<AttackModelSnapshot>(join(omopDir, "attack-model.json"))
}

export function loadReport(engagementDir: string): string | null {
  for (const candidate of [
    join(engagementDir, "report", "executive-report.md"),
    join(engagementDir, "report", "report.md"),
    join(engagementDir, "report.md"),
    join(engagementDir, "report", "technical-report.md"),
  ]) {
    const text = safeReadText(candidate)
    if (text) return text
  }
  return null
}

export function loadPhantomAuditLog(omopDir: string): string | null {
  return (
    safeReadText(join(omopDir, "c2", "phantom-audit.txt")) ??
    safeReadText(join(omopDir, "red-team", "c2", "phantom-audit.txt"))
  )
}

export function loadToolStatus(engagementDir: string): string | null {
  return safeReadText(join(engagementDir, "tool-status.txt"))
}

export interface CtfChallenge {
  id: string
  name: string
  category: string
  skill: string
  status: "active" | "solved" | "stuck" | "unknown"
  flag: string | null
  techniques: string[]
  notes: string | null
  startedAt: string | null
}

export interface ResearchStateSnapshot {
  engagementId: string
  role: string
  objective: string
  taskGraph: {
    total: number
    complete: number
    active: number
    blocked: number
    pending: number
  }
  hypotheses: {
    open: number
    confirmed: number
    rejected: number
    deferred: number
    items: Array<{ id: string; claim: string; evidenceLevel: number; state: string }>
  }
  findings: {
    candidate: number
    investigating: number
    needsValidation: number
    readyForReview: number
    validated: number
    disproven: number
    outOfScope: number
  }
  metrics: {
    candidateCount: number
    disproveCount: number
    validatedCount: number
    toolFailures: number
    repeatedTestRate: number
    evidenceCompleteness: number
  }
  nextActions: string[]
  unansweredQuestions: string[]
  updatedAt: string | null
}

export interface DashboardSettings {
  defaultMode: string
  preferredHarness: "opencode" | "codex"
  providers: Array<{
    name: string
    enabled: boolean
    apiKey: string
    baseUrl: string | null
    model: string | null
  }>
  ctfFlagRegex: string
  ctfdUrl: string | null
  dashboardPort: number
}

export function loadCtfChallenges(omopDir: string): CtfChallenge[] {
  const ctfDir = join(omopDir, "ctf")
  const challenges: CtfChallenge[] = []
  if (!existsSync(ctfDir)) return challenges

  for (const name of readdirSync(ctfDir)) {
    const dir = join(ctfDir, name)
    if (!statSync(dir).isDirectory()) continue
    const state = safeReadJson<Record<string, unknown>>(join(dir, "ctf-state.json"))
    const flagFile = safeReadText(join(dir, "flag.txt"))
    challenges.push({
      id: name,
      name: (state?.name as string) ?? name,
      category: (state?.category as string) ?? "unknown",
      skill: (state?.skill as string) ?? "",
      status: deriveCtfStatus(state, flagFile),
      flag: flagFile?.trim() ?? null,
      techniques: (state?.techniques as string[]) ?? [],
      notes: safeReadText(join(dir, "notes.md")),
      startedAt: (state?.started_at as string) ?? null,
    })
  }
  return challenges.sort((a, b) => {
    const order = { active: 0, stuck: 1, unknown: 2, solved: 3 }
    return (order[a.status] ?? 2) - (order[b.status] ?? 2)
  })
}

function deriveCtfStatus(
  state: Record<string, unknown> | null,
  flag: string | null,
): CtfChallenge["status"] {
  if (flag?.trim()) return "solved"
  if (!state) return "unknown"
  const s = state.status as string | undefined
  if (s === "active" || s === "running") return "active"
  if (s === "stuck") return "stuck"
  return "unknown"
}

export function loadResearchState(omopDir: string): ResearchStateSnapshot | null {
  const candidates = [
    join(omopDir, "research-state.json"),
    join(omopDir, "engagements"),
    join(omopDir, "red-team"),
  ]

  const direct = safeReadJson<Record<string, unknown>>(candidates[0])
  if (direct) return toResearchSnapshot(direct)

  for (const base of candidates.slice(1)) {
    if (!existsSync(base)) continue
    const dirs = readdirSync(base).map((n) => join(base, n)).filter((d) => statSync(d).isDirectory())
    for (const dir of dirs.sort().reverse()) {
      const state = safeReadJson<Record<string, unknown>>(join(dir, "research-state.json"))
      if (state) return toResearchSnapshot(state)
    }
  }
  return null
}

function toResearchSnapshot(raw: Record<string, unknown>): ResearchStateSnapshot {
  const hyp = (raw.hypotheses as Record<string, unknown[]>) ?? {}
  const findings = (raw.findings as Record<string, unknown[]>) ?? {}
  const metrics = (raw.metrics as Record<string, number>) ?? {}
  const graph = raw.task_graph as Record<string, unknown> | null
  const tasks = graph ? (Object.values(graph.tasks ?? {}) as Array<Record<string, string>>) : []

  return {
    engagementId: (raw.engagement_id as string) ?? "",
    role: (raw.role as string) ?? "",
    objective: (raw.objective as string) ?? "",
    taskGraph: {
      total: tasks.length,
      complete: tasks.filter((t) => t.status === "complete").length,
      active: tasks.filter((t) => t.status === "active").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      pending: tasks.filter((t) => t.status === "pending").length,
    },
    hypotheses: {
      open: (hyp.open ?? []).length,
      confirmed: (hyp.confirmed ?? []).length,
      rejected: (hyp.rejected ?? []).length,
      deferred: (hyp.deferred ?? []).length,
      items: ((hyp.open ?? []) as Array<Record<string, unknown>>).slice(0, 10).map((h) => ({
        id: (h.hypothesis_id as string) ?? "",
        claim: (h.claim as string) ?? "",
        evidenceLevel: (h.evidence_level as number) ?? 1,
        state: (h.state as string) ?? "open",
      })),
    },
    findings: {
      candidate: (findings.candidate ?? []).length,
      investigating: (findings.investigating ?? []).length,
      needsValidation: (findings.needs_validation ?? []).length,
      readyForReview: (findings.ready_for_human_review ?? []).length,
      validated: (findings.validated ?? []).length,
      disproven: (findings.disproven ?? []).length,
      outOfScope: (findings.out_of_scope ?? []).length,
    },
    metrics: {
      candidateCount: metrics.candidate_count ?? 0,
      disproveCount: metrics.disproven_count ?? 0,
      validatedCount: metrics.validated_count ?? 0,
      toolFailures: metrics.tool_failures ?? 0,
      repeatedTestRate: metrics.repeated_test_rate ?? 0,
      evidenceCompleteness: metrics.evidence_completeness ?? 0,
    },
    nextActions: (raw.next_actions as string[]) ?? [],
    unansweredQuestions: (raw.unanswered_questions as string[]) ?? [],
    updatedAt: (raw.updated_at as string) ?? null,
  }
}

export function loadDashboardSettings(cwd: string): DashboardSettings {
  const defaults: DashboardSettings = {
    defaultMode: "auto",
    preferredHarness: "opencode",
    providers: [
      { name: "anthropic", enabled: false, apiKey: "", baseUrl: null, model: "claude-opus-4-5" },
      { name: "openai", enabled: false, apiKey: "", baseUrl: null, model: "gpt-4o" },
      { name: "gemini", enabled: false, apiKey: "", baseUrl: null, model: "gemini-2.0-flash" },
      { name: "deepseek", enabled: false, apiKey: "", baseUrl: null, model: "deepseek-reasoner" },
      { name: "groq", enabled: false, apiKey: "", baseUrl: null, model: "llama-3.3-70b-versatile" },
      { name: "ollama", enabled: false, apiKey: "", baseUrl: "http://localhost:11434", model: "llama3.2" },
      { name: "custom", enabled: false, apiKey: "", baseUrl: "", model: "" },
    ],
    ctfFlagRegex: "FLAG\\{[^}]+\\}",
    ctfdUrl: null,
    dashboardPort: 7474,
  }

  const configPath = join(cwd, ".opencode", "crypthunter.jsonc")
  const raw = safeReadJson<Record<string, unknown>>(configPath)
  if (!raw) return defaults

  const dashboard = raw.dashboard as Record<string, unknown> | null
  if (!dashboard) return defaults

  return {
    ...defaults,
    defaultMode: (raw.default_mode as Record<string, string>)?.engagement_mode ?? defaults.defaultMode,
    preferredHarness: (dashboard.preferred_harness as "opencode" | "codex") ?? defaults.preferredHarness,
    providers: (dashboard.providers as DashboardSettings["providers"]) ?? defaults.providers,
    ctfFlagRegex: (dashboard.ctf_flag_regex as string) ?? defaults.ctfFlagRegex,
    ctfdUrl: (dashboard.ctfd_url as string) ?? defaults.ctfdUrl,
    dashboardPort: (dashboard.port as number) ?? defaults.dashboardPort,
  }
}

export function saveDashboardSettings(cwd: string, settings: DashboardSettings): void {
  const configDir = join(cwd, ".opencode")
  mkdirSync(configDir, { recursive: true })
  const configPath = join(configDir, "crypthunter.jsonc")

  const existing = safeReadJson<Record<string, unknown>>(configPath) ?? {}
  existing["$schema"] = "https://raw.githubusercontent.com/cryptdefender323/crypthunter/dev/assets/crypthunter.schema.json"
  existing["default_mode"] = { engagement_mode: settings.defaultMode }
  existing["dashboard"] = {
    preferred_harness: settings.preferredHarness,
    providers: settings.providers,
    ctf_flag_regex: settings.ctfFlagRegex,
    ctfd_url: settings.ctfdUrl,
    port: settings.dashboardPort,
  }
  writeFileSync(configPath, JSON.stringify(existing, null, 2), "utf8")
}
