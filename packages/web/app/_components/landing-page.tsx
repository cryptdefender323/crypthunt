import type { Metadata } from "next"
import type { JSX } from "react"
import { ArchitectureSection } from "@/components/landing/sections/architecture"
import { CtaSection } from "@/components/landing/sections/cta"
import { ScyllaSection } from "@/components/landing/sections/scylla"
import { HeroSection } from "@/components/landing/sections/hero"
import { TalosAtlasSection } from "@/components/landing/sections/talos-atlas"
import { ReviewsSection } from "@/components/landing/sections/reviews"
import { CerberusSection } from "@/components/landing/sections/cerberus"
import { SubAgentsSection } from "@/components/landing/sections/sub-agents"
import { TeamModeSection } from "@/components/landing/sections/team-mode"
import { FullscanSection } from "@/components/landing/sections/fullscan"

export const landingMetadata: Metadata = {
  title: "Oh My Open Pentest — The Best Pentest Platform",
  description:
    "Meet Cerberus: The autonomous agent that tests like you. Multi-model orchestration, Team Mode, background agents, 54+ lifecycle hooks.",
}

export async function LandingPage(): Promise<JSX.Element> {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <link rel="preload" as="image" href="/images/hero.webp" fetchPriority="low" />
      <HeroSection />
      <FullscanSection />
      <CerberusSection />
      <TalosAtlasSection />
      <ScyllaSection />
      <TeamModeSection />
      <SubAgentsSection />
      <ArchitectureSection />
      <ReviewsSection />
      <CtaSection />
    </div>
  )
}
