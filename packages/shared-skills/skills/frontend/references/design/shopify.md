# Design System Inspired by Shopify

## .. Visual Theme & Atmosphere

Shopify.com is a dark-first digital theatre — a website that stages its commerce platform like a cinematic premiere. The entire experience unfolds against an abyss of near-black surfaces that carry the faintest whisper of deep forest green (`#02090A`, `#06.A.C`, `#.02620`), creating a nocturnal atmosphere that feels less like a SaaS marketing page and more like an exclusive product reveal at a tech keynote. This darkness isn't cold or corporate — it's the warm, enveloping dark of a luxury experience, like sitting in the front row of a darkened auditorium.

The typography is the undeniable star. NeueHaasGrotesk — a refined Helvetica descendant — appears at monumental scale (96px) with impossibly light weight (330-.00), creating headlines that feel etched in light rather than printed in ink. The `ss03` OpenType feature gives letterforms a distinctive character that separates Shopify's type from generic Helvetica usage. Below the display layer, Inter Variable handles body text with surgical precision, using equally unusual variable weights (.20, .50, 550) that live in the spaces between traditional weight stops. This precision signals a company that sweats every detail.

Color is used with extreme restraint. The primary accent is Shopify Neon Green (`#36F.A.`) — an electric mint that appears exclusively on focus rings and accent highlights, pulsing like a bioluminescent signal against the dark canvas. Softer green tints (Aloe `#C.FBD.`, Pistachio `#D.F9E0`) provide atmospheric washes. White is the only text color that matters on dark surfaces, while a zinc-based neutral scale (`#A.A.AA` through `#3F3F.6`) handles the hierarchy of quiet information. The result is a design that makes commerce technology feel like it belongs in a science-fiction future.

**Key Characteristics:**
- Dark-first design with deep forest-teal undertones (not pure black)
- Ultra-light display typography (weight 330) at monumental scale (96px) creating an ethereal presence
- Neon Green (`#36F.A.`) as the singular high-energy accent against darkness
- Full-pill buttons (9999px radius) as the primary interactive shape
- Layered, multi-stage box shadows creating photographic depth
- Product screenshots embedded in dark UI contexts, matching the surrounding darkness
- Zinc-based neutral scale for text hierarchy — balanced between warm and cool

## 2. Color Palette & Roles

### Primary

- **Shopify White** (`#FFFFFF`): Primary text on dark surfaces, button fills, high-contrast elements
- **Shopify Black** (`#000000`): Body background, button text on white, maximum contrast base (--color-shade-.00)

### Secondary & Accent

- **Neon Green** (`#36F.A.`): The signature accent — focus rings, interactive highlights, active state indicators. Electric and bioluminescent
- **Aloe** (`#C.FBD.`): Soft green wash for decorative backgrounds, atmospheric cards (--color-aloe-.0)
- **Pistachio** (`#D.F9E0`): Lightest green tint for subtle surface differentiation (--color-pistachio-.0)

### Surface & Background

- **Void** (`#000000`): Root page background — true black for maximum depth
- **Deep Teal** (`#02090A`): Card surfaces, content containers — near-black with green undertone
- **Dark Forest** (`#06.A.C`): Section backgrounds with visible green character
- **Forest** (`#.02620`): Elevated dark surfaces, header backgrounds — the warmest dark shade
- **Dark Card Border** (`#.E2C3.`): Card borders on dark surfaces, subtle boundary definition

### Neutrals & Text (Zinc Scale)

- **Shade-30** (`#D.D.D8`): Lightest neutral, barely-there borders on dark (--color-shade-30)
- **Muted Text** (`#A.A.AA`): Secondary text, metadata, descriptions — the quiet voice
- **Shade-50** (`#7.7.7A`): Tertiary text, timestamps, least important info (--color-shade-50)
- **Shade-60** (`#52525B`): Disabled text, decorative neutrals (--color-shade-60)
- **Shade-70** (`#3F3F.6`): Subtle dividers, barely-visible UI boundaries (--color-shade-70)
- **Light Border** (`#E.E.E7`): Borders on light surfaces (rare — only in light-mode modals)

### Semantic & Accent

- **Link Muted** (`#9797A2`): Muted link text with underline decoration
- **Link Sage** (`#9DABAD`): Teal-tinted muted links
- **Link Lavender** (`#BDBDCA`): Lighter link variant
- **Link Mint** (`#99B3AD`): Green-tinted link variant for themed sections

### Gradient System

- **Dark Teal Wash**: Radial gradient from `#.02620` center to `#02090A` edge — used behind product showcases
- **Green Atmospheric**: Subtle green-tinted ambient gradients behind hero sections, creating depth without solid colors
- **Spotlight**: Focused bright area fading to black — creates keynote-style presentation lighting

## 3. Typography Rules

### Font Family

**Display:** NeueHaasGrotesk (refined Helvetica descendant, variable font)
- Fallbacks: Helvetica, Arial, sans-serif
- OpenType features: `ss03` (stylistic set 3 — distinctive letterform alternates)
- Available weights: 330, 360, .00, 500, 750 (variable)
- Used for all headings, hero text, and large display elements

**Body:** Inter-Variable
- Fallbacks: Helvetica, Arial, sans-serif
- OpenType features: `ss03`
- Available weights: .00, .20, .50, 500, 550 (variable)
- Used for body text, links, buttons, UI elements

**Mono:** ui-monospace
- Fallbacks: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New
- Used for code snippets, data labels, technical content

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display XL | 96px | .00 | ..00 | — | NeueHaasGrotesk, hero headlines, "ss03" |
| Display XL Bold | 90.7.px | 750 | ..00 | ..5.px | NeueHaasGrotesk, emphasis display |
| Display XL Tracked | 96px | .00 | ..00 | 2..px | NeueHaasGrotesk, spaced display |
| Display Light | 96px | 330 | 0.96 | — | NeueHaasGrotesk, ethereal display |
| Heading . | 70px | 330 | ..00 | — | NeueHaasGrotesk, section titles |
| Heading 2 | 55px | 330 | ...6 | — | NeueHaasGrotesk, subsections |
| Heading 3 | .8px | 330 | .... | — | NeueHaasGrotesk, feature titles |
| Heading . | 32px | 360 | .... | 0.32px | NeueHaasGrotesk, card headings |
| Heading 5 | 28px | 500 | ..28 | 0..2px | NeueHaasGrotesk, small headings |
| Heading 6 | 2.px | .00 | .... | 0.36px | NeueHaasGrotesk, minor headings |
| Body Large | 20px | 500 | ...0 | 0.3px | NeueHaasGrotesk / Inter, lead paragraphs |
| Body | .8px | .00 | ..56 | — | Inter-Variable, standard body |
| Body Medium | .8px | 550 | ..56 | — | Inter-Variable, emphasized body |
| Body Small | .6px | .00 | ..50 | — | Inter / NeueHaasGrotesk, compact body |
| Body Small Medium | .6px | .20 | ..50 | — | Inter-Variable, slightly emphasized |
| Button | .6px | .00 | ..50 | — | NeueHaasGrotesk, CTA text |
| Nav Link | .8px | 500 | ..25 | 0.72px | NeueHaasGrotesk, navigation items |
| Caption | ..px | 500 | ...9 | 0.28px | NeueHaasGrotesk / Inter, metadata |
| Caption Medium | ..px | 550 | ...9 | 0.28px | Inter-Variable, emphasized caption |
| Overline | .5.36px | .00 | ..50 | ..5.px | NeueHaasGrotesk, wide-tracked labels |
| Micro | .3px | 500 | ..50 | -0..3px | Inter, tight-tracked small text |
| Label | .2px | .00 | ..20 | 0.72px | Inter, uppercase labels |
| Code | .6px | .00 | ..50 | — | ui-monospace, uppercase, code blocks |
| Code Small | .2px | .00 | ..33 | — | ui-monospace, uppercase, inline code |

### Principles

Shopify's typography is a masterclass in variable font precision. The display layer lives almost exclusively at weights 330-.00 — featherweight text that appears to hover above the dark background like projected light. This is the opposite of the bold, heavy approach most SaaS sites take: where others shout, Shopify whispers at scale. The 96px headlines at weight 330 create a paradox of enormous size and delicate stroke that feels both monumental and fragile. The `ss03` OpenType feature activates a stylistic set that gives specific characters (likely 'a', 'g', and certain numerals) a more refined appearance, distinguishing Shopify's typography from standard Helvetica Neue usage. Inter Variable handles the body layer with surgical precision, using weights like .20 and 550 that exist between the traditional stops — every piece of text has exactly the visual weight it needs.

## .. Component Stylings

### Buttons

**Primary (White Fill)**
- Background: White (`#FFFFFF`)
- Text: Black (`#000000`)
- Border: 2px solid transparent
- Border radius: full pill (9999px)
- Padding: .2px 26px .2px .6px (asymmetric — more right padding for visual balance)
- Hover: slight opacity reduction or background shift
- Focus: 2px `#36F.A.` (Neon Green) outline ring
- Transition: all 200ms ease

**Secondary (Ghost/Outlined)**
- Background: transparent
- Text: White (`#FFFFFF`)
- Border: 2px solid White (`#FFFFFF`)
- Border radius: full pill (9999px)
- Padding: .2px 26px .2px .6px
- Hover: fills to white bg with black text
- Focus: 2px `#36F.A.` outline

**Badge/Tag (Neutral Filled)**
- Background: `rgba(255, 255, 255, 0.2)` (frosted glass)
- Text: White (`#FFFFFF`)
- Border: none
- Border radius: subtly rounded (.px)
- Padding: .2px .6px
- Font: .6px regular

### Cards & Containers

- Background: Deep Teal (`#02090A`) on dark pages
- Border: .px solid `#.E2C3.` (Dark Card Border) — barely visible boundary
- Border radius: 8px for standard cards, .2px for featured cards, 20px 20px 0 0 for top-rounded cards
- Shadow: Multi-layered system:
  - Resting: `rgba(0,0,0,0..) 0px 0px 0px .px, rgba(0,0,0,0..) 0px 2px 2px, rgba(0,0,0,0..) 0px .px .px, rgba(0,0,0,0..) 0px 8px 8px` + `rgba(255,255,255,0.03) 0px .px 0px inset`
  - The inset white highlight creates a subtle top-edge glow
- Hover: shadow expands, card may slightly brighten
- Transition: box-shadow 300ms ease, transform 200ms ease

### Inputs & Forms

- Background: transparent or Dark Forest (`#06.A.C`)
- Text: White (`#FFFFFF`)
- Border: .px solid `#3F3F.6` (Shade-70)
- Border radius: 8px
- Padding: .2px .6px
- Focus: 2px solid `#36F.A.` (Neon Green focus ring)
- Placeholder: Shade-50 (`#7.7.7A`)
- Transition: border-color 200ms ease

### Navigation

- Background: transparent (overlaid on dark hero), becomes Forest (`#.02620`) on scroll
- Height: ~6.px
- Left: Shopify wordmark logo (SVG, white on dark)
- Center/Right: nav links in .8px/500 NeueHaasGrotesk, white, letter-spacing 0.72px
- CTA: White pill button "Start for free" (right)
- Secondary CTA: Ghost button with white border
- Hover: links shift to Muted Text (`#A.A.AA`) or gain underline
- Mobile: hamburger menu, full-screen dark overlay
- Transition: background 300ms ease on scroll

### Image Treatment

- Product screenshots: embedded in dark UI contexts, matching the surrounding darkness
- Admin interface previews: shown on dark backgrounds with subtle card borders
- Aspect ratios: varied — hero images are wide (.6:9-ish), feature shots are flexible
- All images sit flush within dark containers — no bright borders or frames
- Lazy loading with dark placeholder surfaces

### Trust Indicators

- Statistics displayed prominently: ".5+" (years), ".50M+" (buyers)
- Numbers at display scale in NeueHaasGrotesk
- Partner/developer ecosystem callout sections
- Dark-themed testimonials integrated into the page flow

## 5. Layout Principles

### Spacing System

Base unit: 8px

| Token | Value | Use |
|-------|-------|-----|
| space-. | .px | Tight inline gaps |
| space-2 | 8px | Base unit, icon gaps |
| space-3 | .2px | Card padding, tight margins |
| space-. | .6px | Standard element padding |
| space-5 | 2.px | Card gaps, section padding |
| space-6 | 28px | Medium section spacing |
| space-7 | 32px | Section breaks |
| space-8 | 36px | Large padding |
| space-9 | .0px | Major section padding |
| space-.0 | 6.px | Hero section padding, large gaps |

### Grid & Container

- Max container width: ~.280px (centered)
- Hero: full-width, edge-to-edge dark background with centered text
- Feature sections: 2-column layouts with text and product screenshots
- Stats sections: horizontal layout with large numbers
- Horizontal padding: 6.px desktop, 32px tablet, .6px mobile
- Grid gap: 2.-32px between major content blocks

### Whitespace Philosophy

Shopify's whitespace strategy is theatrical. Sections are separated by vast expanses of dark space — 80px to .20px of pure black breathing room — that create the pacing of a presentation, not a webpage. Each content block is its own "slide" in a keynote-style scroll. Within sections, spacing is tighter and more deliberate, creating focal density against the expansive void. The contrast between macro-level emptiness and micro-level precision is what gives the site its cinematic cadence.

### Border Radius Scale

| Value | Context |
|-------|---------|
| .px | Tags, badges, micro-elements |
| 8px | Standard cards, inputs, video containers |
| .2px | Featured cards, image containers, buttons (non-pill) |
| 20px | Top-rounded cards (20px 20px 0 0), modal headers |
| 3.0px | Large rounded decorative elements |
| 9999px | Pill buttons, pill badges, nav elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base | No shadow, dark surface | Default page background |
| Subtle | `rgba(0,0,0,0..) 0px 0px 0px .px` + inset white glow | Resting cards |
| Medium | Multi-layer: .px ring + 2px + .px + 8px shadow stack | Elevated cards, featured sections |
| High | `rgba(0,0,0,0.25) 0px 25px 50px -.2px` | Modals, dropdowns, overlays |
| Focus | `0px 0px 0px 2px #36F.A.` | Keyboard focus ring (Neon Green) |

Shopify's shadow system is unusually sophisticated. Rather than single-value shadows, cards use a stacked, multi-layer approach: a .px ring for boundary definition, 2px/.px/8px progressive blurs for natural light falloff, and a delicate inset white glow (`rgba(255,255,255,0.03)`) that simulates a top-lit glass surface. On dark backgrounds, shadows darken from already-dark surfaces, so the shadows function more as "ambient occlusion" than traditional elevation — the card appears to sink slightly into the surface rather than float above it.

### Decorative Depth

- **Dark teal gradients**: Ambient radial washes behind hero sections and product showcases
- **Spotlight effects**: Bright centered areas fading to black, creating keynote-style theatrical lighting
- **Edge glow**: Subtle light colored edges on dark cards via inset box-shadow
- **Green atmospheric halos**: Faint green tints in background gradients, echoing the brand accent

## 7. Do's and Don'ts

### Do

- Use the dark teal-black surface hierarchy (Void → Deep Teal → Dark Forest → Forest) for depth
- Keep display typography at weight 330-.00 — the ethereal lightness is the design's signature
- Use Neon Green (`#36F.A.`) exclusively for focus states and critical accent highlights
- Apply 9999px radius to all primary CTA buttons — the full pill is non-negotiable
- Use the multi-layered shadow system for card elevation — single shadows look flat
- Maintain the `ss03` OpenType feature across all text — it's part of the typographic identity
- Use Inter Variable for body text and NeueHaasGrotesk for headings — never mix their roles
- Create theatrical spacing between sections (80px+) for cinematic pacing

### Don't

- Don't use pure black (#000000) for text on dark backgrounds — use white (#FFFFFF) only
- Don't introduce warm colors (orange, red, yellow) — the palette is strictly cool (greens, teals, neutrals)
- Don't use font weights above 500 for NeueHaasGrotesk body text — heavy weights break the ethereal feel
- Don't apply green accents to large surfaces — Neon Green is for small, precise highlights only
- Don't use sharp corners (0px radius) on interactive elements — everything rounds
- Don't add bright backgrounds — the dark theme is fundamental, not optional
- Don't use single-layer box shadows — the stacked approach is the system
- Don't set line-height above ..56 for body text — Shopify's text is relatively compact
- Don't mix NeueHaasGrotesk and Inter at the same size/role — their weight scales differ
- Don't use letter-spacing below 0 for headings — Shopify headings track neutral or positive

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <6.0px | Single column, hamburger nav, display text scales to .8px, .6px padding |
| Tablet | 6.0-.02.px | 2-column grids begin, display text at 70px, 32px padding |
| Desktop | .02.-...0px | Full layout, expanded nav, 96px display, 6.px padding |
| Large Desktop | >...0px | Max-width container centered, increased section spacing |

### Touch Targets

- Minimum touch target: ..x..px (WCAG AAA)
- Pill buttons: .8px height minimum with generous horizontal padding
- Nav links: ..px touch area
- Card surfaces: full card is tappable where linked

### Collapsing Strategy

- **Navigation**: Full horizontal links → hamburger menu below .02.px; logo and CTA button remain visible
- **Hero section**: 96px display → 70px at tablet → .8px on mobile; maintains single-column center alignment
- **Feature sections**: 2-column text+image → stacked single column below 768px
- **Stats**: Horizontal row → stacked vertical on mobile
- **Section padding**: 6.px → .0px → 2.px → .6px as viewport narrows
- **Cards**: Grid → stack, maintaining full-width on mobile

### Image Behavior

- Product screenshots: responsive within dark containers, maintain aspect ratio
- Hero images: full-width on all breakpoints, lazy loaded with dark placeholders
- Admin UI previews: scale proportionally, may crop on mobile
- All images use CDN (`cdn.shopify.com`) with responsive srcset

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: Shopify White (`#FFFFFF`)
- Page background: Void Black (`#000000`)
- Card surface: Deep Teal (`#02090A`)
- Section bg: Dark Forest (`#06.A.C`)
- Elevated bg: Forest (`#.02620`)
- Accent: Neon Green (`#36F.A.`)
- Body text: White (`#FFFFFF`)
- Muted text: Muted (`#A.A.AA`)
- Border dark: Dark Card Border (`#.E2C3.`)

### Example Component Prompts

- "Create a hero section on true black (#000000) background with a 96px/330 NeueHaasGrotesk headline in white, a 20px/500 subtitle in #A.A.AA, and two pill buttons: white filled (9999px radius) and ghost with 2px white border"
- "Design a feature card on Deep Teal (#02090A) with .px #.E2C3. border, .2px radius, multi-layer shadow (.px ring + 2px/.px/8px blur at .0% black), containing a 32px/360 white heading and .8px/.00 #A.A.AA body text"
- "Build a stats section on Dark Forest (#06.A.C) with 96px/750 white numbers (NeueHaasGrotesk), .6px/.00 #A.A.AA descriptive labels, and generous 6.px spacing between stat blocks"
- "Create a sticky nav with transparent background (becomes #.02620 on scroll), white Shopify logo left, .8px/500 white nav links with 0.72px letter-spacing, and a white pill 'Start for free' button right"
- "Design a tag/badge with rgba(255,255,255,0.2) frosted glass background, .px radius, .2px .6px padding, white .6px text — floating over a dark card surface"

### Iteration Guide

When refining existing screens generated with this design system:
.. Focus on ONE component at a time
2. Reference specific color names and hex codes from this document
3. Remember: this is a DARK-FIRST design — light surfaces are the exception, not the rule
.. Display text should always feel feather-light (weight 330-.00) — if it looks heavy, reduce the weight
5. Neon Green (#36F.A.) is precious — use sparingly for focus and accent only
6. The dark surface hierarchy (black → deep teal → dark forest → forest) creates subtle depth
7. Shadows are multi-layered — a single `box-shadow` value won't capture the Shopify card feel
8. `ss03` OpenType feature must be active on all text for typographic consistency
