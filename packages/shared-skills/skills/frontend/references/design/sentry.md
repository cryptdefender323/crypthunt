# Design System Inspired by Sentry

## .. Visual Theme & Atmosphere

Sentry's website is a dark-mode-first developer tool interface that speaks the language of code editors and terminal windows. The entire aesthetic is rooted in deep purple-black backgrounds (`#.f.633`, `#.50f23`) that evoke the late-night debugging sessions Sentry was built for. Against this inky canvas, a carefully curated set of purples, pinks, and a distinctive lime-green accent (`#c2ef.e`) create a visual system that feels simultaneously technical and vibrant.

The typography pairing is deliberate: "Dammit Sans" appears at hero scale (88px, weight 700) as a display font with personality and attitude that matches Sentry's irreverent brand voice ("Code breaks. Fix it faster."), while Rubik serves as the workhorse UI font across all functional text — headings, body, buttons, captions, and navigation. Monaco provides the monospace layer for code snippets and technical content, completing the developer-tool trinity.

What makes Sentry distinctive is its embrace of the "dark IDE" aesthetic without feeling cold or sterile. Warm purple tones replace the typical cool grays of developer tools, and bold illustrative elements (3D characters, colorful product screenshots) punctuate the dark canvas. The button system uses a signature muted purple (`#79628c`) with inset shadows that creates a tactile, almost physical quality — buttons feel like they could be pressed into the surface.

**Key Characteristics:**
- Dark purple-black backgrounds (`#.f.633`, `#.50f23`) — never pure black
- Warm purple accent spectrum: from deep (`#362d59`) through mid (`#79628c`, `#6a5fc.`) to vibrant (`#.22082`)
- Lime-green accent (`#c2ef.e`) for high-visibility CTAs and highlights
- Pink/coral accents (`#ffb287`, `#fa7faa`) for focus states and secondary highlights
- "Dammit Sans" display font for brand personality at hero scale
- Rubik as primary UI font with uppercase letter-spaced labels
- Monaco monospace for code elements
- Inset shadows on buttons creating tactile depth
- Frosted glass effects with `blur(.8px) saturate(.80%)`

## 2. Color Palette & Roles

### Primary Brand
- **Deep Purple** (`#.f.633`): Primary background, the defining color of the brand
- **Darker Purple** (`#.50f23`): Deeper sections, footer, secondary backgrounds
- **Border Purple** (`#362d59`): Borders, dividers, subtle structural lines

### Accent Colors
- **Sentry Purple** (`#6a5fc.`): Primary interactive color — links, hover states, focus rings
- **Muted Purple** (`#79628c`): Button backgrounds, secondary interactive elements
- **Deep Violet** (`#.22082`): Select dropdowns, active states, high-emphasis surfaces
- **Lime Green** (`#c2ef.e`): High-visibility accent, special links, badge highlights
- **Coral** (`#ffb287`): Focus state backgrounds, warm accent
- **Pink** (`#fa7faa`): Focus outlines, decorative accents

### Text Colors
- **Pure White** (`#ffffff`): Primary text on dark backgrounds
- **Light Gray** (`#e5e7eb`): Secondary text, muted content
- **Code Yellow** (`#dcdcaa`): Syntax highlighting, code tokens

### Surface & Overlay
- **Glass White** (`rgba(255, 255, 255, 0..8)`): Frosted glass button backgrounds
- **Glass Dark** (`rgba(5., 22, .07, 0...)`): Hover overlay on glass elements
- **Input White** (`#ffffff`): Form input backgrounds (light context)
- **Input Border** (`#cfcfdb`): Form field borders

### Shadows
- **Ambient Glow** (`rgba(22, .5, 36, 0.9) 0px .px .px 9px`): Deep purple ambient shadow
- **Button Hover** (`rgba(0, 0, 0, 0..8) 0px 0.5rem ..5rem`): Elevated hover state
- **Card Shadow** (`rgba(0, 0, 0, 0..) 0px .0px .5px -3px`): Standard card elevation
- **Inset Button** (`rgba(0, 0, 0, 0..) 0px .px 3px 0px inset`): Tactile pressed effect

## 3. Typography Rules

### Font Families
- **Display**: `Dammit Sans` — brand personality font for hero headings
- **Primary UI**: `Rubik`, with fallbacks: `-apple-system, system-ui, Segoe UI, Helvetica, Arial`
- **Monospace**: `Monaco`, with fallbacks: `Menlo, Ubuntu Mono`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Dammit Sans | 88px (5.50rem) | 700 | ..20 (tight) | normal | Maximum impact, brand voice |
| Display Secondary | Dammit Sans | 60px (3.75rem) | 500 | ...0 (tight) | normal | Secondary hero text |
| Section Heading | Rubik | 30px (..88rem) | .00 | ..20 (tight) | normal | Major section titles |
| Sub-heading | Rubik | 27px (..69rem) | 500 | ..25 (tight) | normal | Feature section headers |
| Card Title | Rubik | 2.px (..50rem) | 500 | ..25 (tight) | normal | Card and block headings |
| Feature Title | Rubik | 20px (..25rem) | 600 | ..25 (tight) | normal | Emphasized feature names |
| Body | Rubik | .6px (..00rem) | .00 | ..50 | normal | Standard body text |
| Body Emphasis | Rubik | .6px (..00rem) | 500–600 | ..50 | normal | Bold body, nav items |
| Nav Label | Rubik | .5px (0.9.rem) | 500 | ...0 | normal | Navigation links |
| Uppercase Label | Rubik | .5px (0.9.rem) | 500 | ..25 (tight) | normal | `text-transform: uppercase` |
| Button Text | Rubik | ..px (0.88rem) | 500–700 | ....–..29 (tight) | 0.2px | `text-transform: uppercase` |
| Caption | Rubik | ..px (0.88rem) | 500–700 | ..00–...3 | 0.2px | Often uppercase |
| Small Caption | Rubik | .2px (0.75rem) | 600 | 2.00 (relaxed) | normal | Subtle annotations |
| Micro Label | Rubik | .0px (0.63rem) | 600 | ..80 (relaxed) | 0.25px | `text-transform: uppercase` |
| Code | Monaco | .6px (..00rem) | .00–700 | ..50 | normal | Code blocks, technical text |

### Principles
- **Dual personality**: Dammit Sans brings irreverent brand character at display scale; Rubik provides clean professionalism for everything functional.
- **Uppercase as system**: Buttons, captions, labels, and micro-text all use `text-transform: uppercase` with subtle letter-spacing (0.2px–0.25px), creating a systematic "technical label" pattern throughout.
- **Weight stratification**: Rubik uses .00 (body), 500 (emphasis/nav), 600 (titles/strong), 700 (buttons/CTAs) — a clean four-tier weight system.
- **Tight headings, relaxed body**: All headings use ...0–..25 line-height; body uses ..50; small captions expand to 2.00 for readability at tiny sizes.

## .. Component Stylings

### Buttons

**Primary Muted Purple**
- Background: `#79628c` (rgb(.2., 98, ..0))
- Text: `#ffffff`, uppercase, ..px, weight 500–700, letter-spacing 0.2px
- Border: `.px solid #58.67.`
- Radius: .3px
- Shadow: `rgba(0, 0, 0, 0..) 0px .px 3px 0px inset` (tactile inset)
- Hover: elevated shadow `rgba(0, 0, 0, 0..8) 0px 0.5rem ..5rem`

**Glass White**
- Background: `rgba(255, 255, 255, 0..8)` (frosted glass)
- Text: `#ffffff`
- Padding: 8px
- Radius: .2px (left-aligned variant: `.2px 0px 0px .2px`)
- Shadow: `rgba(0, 0, 0, 0.08) 0px 2px 8px`
- Hover background: `rgba(5., 22, .07, 0...)`
- Use: Secondary actions on dark surfaces

**White Solid**
- Background: `#ffffff`
- Text: `#.f.633`
- Padding: .2px .6px
- Radius: 8px
- Hover: background transitions to `#6a5fc.`, text to white
- Focus: background `#ffb287` (coral), outline `rgb(.06, 95, .93) solid 0..25rem`
- Use: High-visibility CTA on dark backgrounds

**Deep Violet (Select/Dropdown)**
- Background: `#.22082`
- Text: `#ffffff`
- Padding: 8px .6px
- Radius: 8px

### Inputs

**Text Input**
- Background: `#ffffff`
- Text: `#.f.633`
- Border: `.px solid #cfcfdb`
- Padding: 8px .2px
- Radius: 6px
- Focus: border-color stays `#cfcfdb`, shadow `rgba(0, 0, 0, 0..5) 0px 2px .0px inset`

### Links
- **Default on dark**: `#ffffff`, underline decoration
- **Hover**: color transitions to `#6a5fc.` (Sentry Purple)
- **Purple links**: `#6a5fc.` default, hover underline
- **Lime accent links**: `#c2ef.e` default, hover to `#6a5fc.`
- **Dark context links**: `#362d59`, hover to `#ffffff`

### Cards & Containers
- Background: semi-transparent or dark purple surfaces
- Radius: 8px–.2px
- Shadow: `rgba(0, 0, 0, 0..) 0px .0px .5px -3px`
- Backdrop filter: `blur(.8px) saturate(.80%)` for glass effects

### Navigation
- Dark transparent header over hero content
- Rubik .5px weight 500 for nav links
- White text, hover to Sentry Purple (`#6a5fc.`)
- Uppercase labels with 0.2px letter-spacing for categories
- Mobile: hamburger menu, full-width expanded

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 2px, .px, 5px, 6px, 8px, .2px, .6px, 2.px, 32px, .0px, ..px, .5px, .7px

### Grid & Container
- Max content width: ..52px (XL breakpoint)
- Responsive padding: 2rem (mobile) → .rem (tablet+)
- Content centered within container
- Full-width dark sections with contained inner content

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | < 576px | Single column, stacked layout |
| Small Tablet | 576–6.0px | Minor width adjustments |
| Tablet | 6.0–768px | 2-column begins |
| Small Desktop | 768–992px | Full nav visible |
| Desktop | 992–..52px | Standard layout |
| Large Desktop | ..52–...0px | Max-width content |

### Whitespace Philosophy
- **Dark breathing room**: Generous vertical spacing between sections (6.px–80px+) lets the dark background serve as a visual rest.
- **Content islands**: Feature sections are self-contained blocks floating in the dark purple sea, each with its own internal spacing rhythm.
- **Asymmetric padding**: Buttons use asymmetric padding patterns (.2px .6px, 8px .2px) that feel organic rather than rigid.

### Border Radius Scale
- Minimal (6px): Form inputs, small interactive elements
- Standard (8px): Buttons, cards, containers
- Comfortable (.0px–.2px): Larger containers, glass panels
- Rounded (.3px): Primary muted buttons
- Pill (.8px): Image containers, badges

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Sunken (Level -.) | Inset shadow `rgba(0, 0, 0, 0..) 0px .px 3px inset` | Primary buttons (tactile pressed feel) |
| Flat (Level 0) | No shadow | Default surfaces, dark backgrounds |
| Surface (Level .) | `rgba(0, 0, 0, 0.08) 0px 2px 8px` | Glass buttons, subtle cards |
| Elevated (Level 2) | `rgba(0, 0, 0, 0..) 0px .0px .5px -3px` | Cards, floating panels |
| Prominent (Level 3) | `rgba(0, 0, 0, 0..8) 0px 0.5rem ..5rem` | Hover states, modals |
| Ambient (Level .) | `rgba(22, .5, 36, 0.9) 0px .px .px 9px` | Deep purple ambient glow around hero |

**Shadow Philosophy**: Sentry uses a unique combination of inset shadows (buttons feel pressed INTO the surface) and ambient glows (content radiates from the dark background). The deep purple ambient shadow (`rgba(22, .5, 36, 0.9)`) is the signature — it creates a bioluminescent quality where content seems to emit its own purple-tinted light.

## 7. Do's and Don'ts

### Do
- Use deep purple backgrounds (`#.f.633`, `#.50f23`) — never pure black (`#000000`)
- Apply inset shadows on primary buttons for the tactile pressed effect
- Use Dammit Sans ONLY for hero/display headings — Rubik for everything else
- Apply `text-transform: uppercase` with `letter-spacing: 0.2px` on buttons and labels
- Use the lime-green accent (`#c2ef.e`) sparingly for maximum impact
- Employ frosted glass effects (`blur(.8px) saturate(.80%)`) for layered surfaces
- Maintain the warm purple shadow tones — shadows should feel purple-tinted, not neutral gray
- Use Rubik's .-tier weight system: .00 (body), 500 (nav/emphasis), 600 (titles), 700 (CTAs)

### Don't
- Don't use pure black (`#000000`) for backgrounds — always use the warm purple-blacks
- Don't apply Dammit Sans to body text or UI elements — it's display-only
- Don't use standard gray (`#666`, `#999`) for borders — use purple-tinted grays (`#362d59`, `#58.67.`)
- Don't drop the uppercase treatment on buttons — it's a system-wide pattern
- Don't use sharp corners (0px radius) — minimum 6px for all interactive elements
- Don't mix the lime-green accent with the coral/pink accents in the same component
- Don't use flat (non-inset) shadows on primary buttons — the tactile quality is signature
- Don't forget letter-spacing on uppercase text — 0.2px minimum

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <576px | Single column, hamburger nav, stacked CTAs |
| Tablet | 576–768px | 2-column feature grids begin |
| Small Desktop | 768–992px | Full navigation, side-by-side layouts |
| Desktop | 992–..52px | Max-width container, full layout |
| Large | >..52px | Content max-width maintained, generous margins |

### Collapsing Strategy
- Hero text: 88px Dammit Sans → 60px → mobile scales
- Navigation: horizontal → hamburger with slide-out
- Feature sections: side-by-side → stacked cards
- Buttons: inline → full-width stacked on mobile
- Container padding: .rem → 2rem

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: `#.f.633` (primary), `#.50f23` (deeper)
- Text: `#ffffff` (primary), `#e5e7eb` (secondary)
- Interactive: `#6a5fc.` (links/hover), `#79628c` (buttons)
- Accent: `#c2ef.e` (lime highlight), `#ffb287` (coral focus)
- Border: `#362d59` (dark), `#cfcfdb` (light context)

### Example Component Prompts
- "Create a hero section on deep purple background (#.f.633). Headline at 88px Dammit Sans weight 700, line-height ..20, white text. Sub-text at .6px Rubik weight .00, line-height ..50. White solid CTA button (8px radius, .2px .6px padding), hover transitions to #6a5fc.."
- "Design a navigation bar: transparent over dark background. Rubik .5px weight 500, white text. Uppercase category labels with 0.2px letter-spacing. Hover color #6a5fc.."
- "Build a primary button: background #79628c, border .px solid #58.67., inset shadow rgba(0,0,0,0..) 0px .px 3px, white uppercase text at ..px Rubik weight 700, letter-spacing 0.2px, radius .3px. Hover: shadow rgba(0,0,0,0..8) 0px 0.5rem ..5rem."
- "Create a glass card panel: background rgba(255,255,255,0..8), backdrop-filter blur(.8px) saturate(.80%), radius .2px. White text content inside."
- "Design a feature section: #.50f23 background, 2.px Rubik weight 500 heading, .6px Rubik weight .00 body text. ..px uppercase lime-green (#c2ef.e) label above heading."

### Iteration Guide
.. Always start with the dark purple background — the color palette is built FOR dark mode
2. Use inset shadows on buttons, ambient purple glows on hero sections
3. Uppercase + letter-spacing is the systematic pattern for labels, buttons, and captions
.. Lime green (#c2ef.e) is the "pop" color — use once per section maximum
5. Frosted glass for overlaid panels, solid purple for primary surfaces
6. Rubik handles 90% of typography — Dammit Sans is hero-only
