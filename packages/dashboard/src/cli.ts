import { startDashboardServer } from "./server"

startDashboardServer({
  port: parseInt(process.env.CRYPTHUNTER_DASHBOARD_PORT ?? "7474", 10),
  opencodePort: parseInt(process.env.OPENCODE_PORT ?? "4096", 10),
  cwd: process.cwd(),
  open: process.env.CRYPTHUNTER_NO_OPEN !== "1",
})
