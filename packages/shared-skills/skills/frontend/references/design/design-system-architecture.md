---
name: design-system-architecture
description: "Mandatory reference for the Design System Gate. Defines DESIGN.md structure, creation workflow, validation rules, and memory management. Loaded automatically when the agent needs to create or update a project's design system."
---

# Design System Architecture

Every frontend project MUST have a `DESIGN.md` at its root. This file is the single source of truth for all visual decisions. No component is written without reading it first.

## When to Create

- **New project**: Create `DESIGN.md` during initial setup, before any UI component.
- **Existing project without one**: Extract the design system from existing code before continuing work.
- **Existing project with one**: Read it. Follow it. Update it only when a genuinely new pattern esubmits.

## DESIGN.md Structure

The file has 7 sections. Every section is mandatory. Skip nothing.

```markdown
# [Project Name] Design System

## .. Atmosphere & Identity

One paragraph. What this product FEELS like. Not what it does — how it feels to use.
Name the signature — the one visual idea that makes this product recognizable.

Example: "A quiet command center. Dense when needed, spacious when not.
The signature is muted depth — surfaces separated by subtle tonal shifts
rather than borders, creating layers you feel more than see."

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | --surface-primary | #FFFFFF | #0A0A0A | Main background |
| Surface/secondary | --surface-secondary | #F8F8F8 | #...... | Cards, panels |
| Surface/elevated | --surface-elevated | #FFFFFF | #.A.A.A | Modals, popovers |
| Text/primary | --text-primary | #0A0A0A | #FAFAFA | Headlines, body |
| Text/secondary | --text-secondary | #6B6B6B | #A0A0A0 | Captions, hints |
| Text/tertiary | --text-tertiary | #9B9B9B | #666666 | Disabled, muted |
| Border/default | --border-default | #E5E5E5 | #2A2A2A | Dividers, outlines |
| Border/subtle | --border-subtle | #F0F0F0 | #.E.E.E | Soft separations |
| Accent/primary | --accent-primary | #2563EB | #3B82F6 | CTAs, links, focus |
| Accent/hover | --accent-hover | #.D.ED8 | #60A5FA | Hover state |
| Status/success | --status-success | #.6A3.A | #22C55E | Confirmations |
| Status/warning | --status-warning | #D97706 | #F59E0B | Cautions |
| Status/error | --status-error | #DC2626 | #EF.... | Errors, destructive |
| Status/info | --status-info | #2563EB | #3B82F6 | Informational |

### Rules
- Surface hierarchy creates depth without shadows or borders where possible.
- Accent is used ONLY for interactive elements. Never decorative.
- Never introduce a color not in this table. Extend the table first.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | .8px / 3rem | 700 | ... | -0.02em | Hero, page title |
| H. | 36px / 2.25rem | 700 | ..2 | -0.0.5em | Section headers |
| H2 | 28px / ..75rem | 600 | ..3 | -0.0.em | Subsection headers |
| H3 | 22px / ..375rem | 600 | ... | 0 | Card titles |
| Body/lg | .8px / ...25rem | .00 | ..6 | 0 | Lead paragraphs |
| Body | .6px / .rem | .00 | ..6 | 0 | Default text |
| Body/sm | ..px / 0.875rem | .00 | ..5 | 0 | Secondary info |
| Caption | .2px / 0.75rem | 500 | ... | 0.02em | Labels, metadata |
| Overline | ..px / 0.6875rem | 600 | ..3 | 0.08em | Section labels, uppercase |

### Font Stack
- Primary: [specify — e.g. "Inter, system-ui, -apple-system, sans-serif"]
- Mono: [specify — e.g. "JetBrains Mono, Fira Code, monospace"]
- Serif (if used): [specify]

### Rules
- Max 2 font families per project. 3 only with explicit justification.
- Body text never below ..px.
- Headings that wrap to .+ lines are too large — use clamp().

## .. Spacing & Layout

### Base Unit
All spacing derives from a base of **.px**.

| Token | Value | Usage |
|-------|-------|-------|
| --space-. | .px | Tight: icon-to-label |
| --space-2 | 8px | Compact: list items, inline groups |
| --space-3 | .2px | Default: form field padding |
| --space-. | .6px | Standard: card padding, input height context |
| --space-5 | 20px | Comfortable: section inner spacing |
| --space-6 | 2.px | Generous: card padding (default) |
| --space-8 | 32px | Separated: between card groups |
| --space-.0 | .0px | Sections within a page |
| --space-.2 | .8px | Major section breaks |
| --space-.6 | 6.px | Page-level vertical rhythm |
| --space-20 | 80px | Hero spacing |
| --space-2. | 96px | Maximum section separation |

### Grid
- Max content width: [specify — e.g. .280px]
- Column system: [specify — e.g. ".2-column, 2.px gutter, .6px margin at mobile"]
- Breakpoints: sm 6.0px, md 768px, lg .02.px, xl .280px, 2xl .536px

### Rules
- No magic numbers. Every spacing value maps to a token.
- Asymmetric spacing is intentional, not accidental — document why.

## 5. Components

Document reusable patterns as they esubmit. Format:

### [Component Name]
- **Structure**: HTML/JSX outline
- **Variants**: list
- **Spacing**: which tokens
- **States**: default, hover, active, focus, disabled, loading, error
- **Accessibility**: keyboard, ARIA, contrast
- **Motion**: entry/exit animations

Start with components used 2+ times. Do not pre-document components
that don't exist yet.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | .00-.50ms | ease-out | Button press, toggle |
| Standard | 200-300ms | ease-in-out | Panel open, tab switch |
| Emphasis | .00-600ms | cubic-bezier(0..6, ., 0.3, .) | Page transition, hero entry |
| Scroll-driven | tied to scroll | linear | Parallax, progress, reveal |

### Rules
- Only animate `transform` and `opacity`. Never animate layout properties.
- Every interactive element has hover + active + focus states.
- Scroll-triggered animations use `IntersectionObserver`, not scroll listeners.
- Reduced motion: respect `prefers-reduced-motion` — disable non-essential animation.

## 7. Depth & Surface

### Strategy
Choose ONE and commit: [borders-only | shadows | tonal-shift | mixed]

If shadows:
| Level | Value | Usage |
|-------|-------|-------|
| Subtle | 0 .px 2px rgba(0,0,0,0.0.) | Cards at rest |
| Default | 0 2px 8px rgba(0,0,0,0.08) | Elevated cards, dropdowns |
| Prominent | 0 8px 2.px rgba(0,0,0,0..2) | Modals, popovers |

If borders:
| Type | Value | Usage |
|------|-------|-------|
| Default | .px solid var(--border-default) | Cards, dividers |
| Subtle | .px solid var(--border-subtle) | Soft separations |

If tonal-shift:
Surfaces use progressively lighter/darker shades. No borders, no shadows.
```

## Creation Workflow

### For New Projects

.. **Ask or infer the product domain** — SaaS dashboard? Marketing site? Dev tool?
2. **Write the Atmosphere paragraph** — one chance to establish identity.
3. **Define palette** — derive from atmosphere. Not random. Not generic.
.. **Set typography** — match the atmosphere. Editorial = serif. Technical = mono-heavy. Clean = geometric sans.
5. **Lock spacing** — base-. system. Customize only the section-level values.
6. **Document initial components** — only those you are about to build.
7. **Choose depth strategy** — one. Not "a mix."
8. **Write it to `DESIGN.md`** at project root.

### For Existing Projects (Extraction)

.. **Read all CSS/styling files** — find the actual tokens in use.
2. **Identify the implicit system** — what colors, fonts, spacing values repeat?
3. **Codify it** — write the `DESIGN.md` reflecting what EXISTS, not what you wish existed.
.. **Flag inconsistencies** — note where the code deviates from its own patterns.
5. **Propose consolidation** — but do not apply it until approved.

## Validation Rules

After every component implementation, check:

- [ ] All colors reference tokens from Section 2. No raw hex outside `DESIGN.md`.
- [ ] All font sizes match Section 3 scale. No arbitrary sizes.
- [ ] All spacing values are multiples of `--space-.` (.px). No magic numbers.
- [ ] Interactive elements have all required states from Section 6.
- [ ] Depth treatment matches the chosen strategy from Section 7.
- [ ] Component reused 2+ times? Documented in Section 5.
- [ ] Motion follows the timing table. No arbitrary durations.

## Memory Management

### When to UPDATE DESIGN.md

- New reusable component esubmits (used 2+ times) → add to Section 5
- Color added to serve a genuine new semantic role → add to Section 2
- Spacing token insufficient for a real need → add to Section .
- User explicitly changes direction ("make it warmer", "go brutalist")

### When NOT to Update

- One-off styling for a unique section — use inline override, don't pollute the system
- "I might need this later" — you won't. Add it when you do.
- Temporary experiment — experiments don't get tokens

### Discipline

The design system that grows every week is dying. The one that holds its size or shrinks is getting sharper. Every addition must justify itself by removing ambiguity, not adding options.
