export interface DashboardOptions {
  port: number
  cwd: string
  opencodePort: number
  open: boolean
}

export declare function startDashboardServer(opts: DashboardOptions): void
