import type { JSX } from "react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Section } from "@/components/ui/section"

export async function CoreLoopSection(): Promise<JSX.Element> {
  const t = await getTranslations("manifesto")
  const coreLoopKeys = [
    "cerberus",
    "hydra",
    "argus",
    "scylla",
    "hermes",
    "talos",
    "engagementState",
    "findingValidation",
  ] as const

  return (
    <Section data-section="manifesto-core-loop" className="mx-auto max-w-5xl">
      <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">{t("coreLoop.title")}</h2>

      <div className="bg-background border-border/50 mb-16 rounded-xl border p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-center gap-2 py-8 md:gap-4">
          <div className="rounded-lg border-2 border-white bg-black px-4 py-2 text-xs font-semibold text-white md:text-sm">
            Scope
          </div>
          <svg
            className="text-muted-foreground h-6 w-6 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div className="rounded-lg border-2 border-zinc-600 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white md:text-sm">
            Recon
          </div>
          <svg
            className="text-muted-foreground h-6 w-6 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div className="rounded-lg border-2 border-orange-500 bg-black px-4 py-2 text-xs font-semibold text-orange-400 md:text-sm">
            Exploit
          </div>
          <svg
            className="text-muted-foreground h-6 w-6 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div className="rounded-lg border-2 border-cyan-500 bg-black px-4 py-2 text-xs font-semibold text-cyan-400 md:text-sm">
            Verify
          </div>
          <svg
            className="text-muted-foreground h-6 w-6 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div className="rounded-lg border-2 border-green-500 bg-black px-4 py-2 text-xs font-semibold text-green-400 md:text-sm">
            Report
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">↻ Agent-Enforced Boundaries</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {coreLoopKeys.map((key) => (
          <Card key={key} className="bg-secondary/5 border-border/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-lg">
                {t(`coreLoop.features.${key}.feature`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {t(`coreLoop.features.${key}.purpose`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}
