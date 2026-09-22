# Design System Inspired by Supabase

## .. Visual Theme & Atmosphere

Supabase's website is a dark-mode-native developer platform that channels the aesthetic of a premium code editor — deep black backgrounds (`#0f0f0f`, `#.7.7.7`) with emerald green accents (`#3ecf8e`, `#00c573`) that reference the brand's open-source, PostgreSQL-green identity. The design system feels like it was born in a terminal window and evolved into a sophisticated marketing surface without losing its developer soul.

The typography is built on "Circular" — a geometric sans-serif with rounded terminals that softens the technical edge. At 72px with a ..00 line-height, the hero text is compressed to its absolute minimum vertical space, creating dense, impactful statements that waste nothing. The monospace companion (Source Code Pro) appears sparingly for uppercase technical labels with ..2px letter-spacing, creating the "developer console" markers that connect the marketing site to the product experience.

What makes Supabase distinctive is its sophisticated HSL-based color token system. Rather than flat hex values, Supabase uses HSL with alpha channels for nearly every color (`--colors-crimson.`, `--colors-purple5`, `--colors-slateA.2`), enabling a nuanced layering system where colors interact through transparency. This creates depth through translucency — borders at `rgba(.6, .6, .6)`, surfaces at `rgba(.., .., .., 0.8.)`, and accents at partial opacity all blend with the dark background to create a rich, dimensional palette from minimal color ingredients.

The green accent (`#3ecf8e`) appears selectively — in the Supabase logo, in link colors (`#00c573`), and in border highlights (`rgba(62, 207, ..2, 0.3)`) — always as a signal of "this is Supabase" rather than as a decorative element. Pill-shaped buttons (9999px radius) for primary CTAs contrast with standard 6px radius for secondary elements, creating a clear visual hierarchy of importance.

**Key Characteristics:**
- Dark-mode-native: near-black backgrounds (`#0f0f0f`, `#.7.7.7`) — never pure black
- Emerald green brand accent (`#3ecf8e`, `#00c573`) used sparingly as identity marker
- Circular font — geometric sans-serif with rounded terminals
- Source Code Pro for uppercase technical labels (..2px letter-spacing)
- HSL-based color token system with alpha channels for translucent layering
- Pill buttons (9999px) for primary CTAs, 6px radius for secondary
- Neutral gray scale from `#.7.7.7` through `#898989` to `#fafafa`
- Border system using dark grays (`#2e2e2e`, `#363636`, `#393939`)
- Minimal shadows — depth through border contrast and transparency
- Radix color primitives (crimson, purple, violet, indigo, yellow, tomato, orange, slate)

## 2. Color Palette & Roles

### Brand
- **Supabase Green** (`#3ecf8e`): Primary brand color, logo, accent borders
- **Green Link** (`#00c573`): Interactive green for links and actions
- **Green Border** (`rgba(62, 207, ..2, 0.3)`): Subtle green border accent

### Neutral Scale (Dark Mode)
- **Near Black** (`#0f0f0f`): Primary button background, deepest surface
- **Dark** (`#.7.7.7`): Page background, primary canvas
- **Dark Border** (`#2.2.2.`): Horizontal rule, section dividers
- **Border Dark** (`#2e2e2e`): Card borders, tab borders
- **Mid Border** (`#363636`): Button borders, dividers
- **Border Light** (`#393939`): Secondary borders
- **Charcoal** (`#.3.3.3`): Tertiary borders, dark accents
- **Dark Gray** (`#.d.d.d`): Heavy secondary text
- **Mid Gray** (`#898989`): Muted text, link color
- **Light Gray** (`#b.b.b.`): Secondary link text
- **Near White** (`#efefef`): Light border, subtle surface
- **Off White** (`#fafafa`): Primary text, button text

### Radix Color Tokens (HSL-based)
- **Slate Scale**: `--colors-slate5` through `--colors-slateA.2` — neutral progression
- **Purple**: `--colors-purple.`, `--colors-purple5`, `--colors-purpleA7` — accent spectrum
- **Violet**: `--colors-violet.0` (`hsl(25., 63.2%, 63.2%)`) — vibrant accent
- **Crimson**: `--colors-crimson.`, `--colors-crimsonA9` — warm accent / alert
- **Indigo**: `--colors-indigoA2` — subtle blue wash
- **Yellow**: `--colors-yellowA7` — attention/warning
- **Tomato**: `--colors-tomatoA.` — error accent
- **Orange**: `--colors-orange6` — warm accent

### Surface & Overlay
- **Glass Dark** (`rgba(.., .., .., 0.8.)`): Translucent dark overlay
- **Slate Alpha** (`hsla(2.0, 87.8%, .6..%, 0.03.)`): Ultra-subtle blue wash
- **Fixed Scale Alpha** (`hsla(200, 90.3%, 93..%, 0..09)`): Light frost overlay

### Shadows
- Supabase uses **almost no shadows** in its dark theme. Depth is created through border contrast and surface color differences rather than box-shadows. Focus states use `rgba(0, 0, 0, 0..) 0px .px .2px` — minimal, functional.

## 3. Typography Rules

### Font Families
- **Primary**: `Circular`, with fallbacks: `custom-font, Helvetica Neue, Helvetica, Arial`
- **Monospace**: `Source Code Pro`, with fallbacks: `Office Code Pro, Menlo`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Circular | 72px (..50rem) | .00 | ..00 (tight) | normal | Maximum density, zero waste |
| Section Heading | Circular | 36px (2.25rem) | .00 | ..25 (tight) | normal | Feature section titles |
| Card Title | Circular | 2.px (..50rem) | .00 | ..33 | -0..6px | Slight negative tracking |
| Sub-heading | Circular | .8px (...3rem) | .00 | ..56 | normal | Secondary headings |
| Body | Circular | .6px (..00rem) | .00 | ..50 | normal | Standard body text |
| Nav Link | Circular | ..px (0.88rem) | 500 | ..00–...3 | normal | Navigation items |
| Button | Circular | ..px (0.88rem) | 500 | .... (tight) | normal | Button labels |
| Caption | Circular | ..px (0.88rem) | .00–500 | ...3 | normal | Metadata, tags |
| Small | Circular | .2px (0.75rem) | .00 | ..33 | normal | Fine print, footer links |
| Code Label | Source Code Pro | .2px (0.75rem) | .00 | ..33 | ..2px | `text-transform: uppercase` |

### Principles
- **Weight restraint**: Nearly all text uses weight .00 (regular/book). Weight 500 appears only for navigation links and button labels. There is no bold (700) in the detected system — hierarchy is created through size, not weight.
- **..00 hero line-height**: The hero text is compressed to absolute zero leading. This is the defining typographic gesture — text that feels like a terminal command: dense, efficient, no wasted vertical space.
- **Negative tracking on cards**: Card titles use -0..6px letter-spacing, a subtle tightening that differentiates them from body text without being obvious.
- **Monospace as ritual**: Source Code Pro in uppercase with ..2px letter-spacing is the "developer console" voice — used sparingly for technical labels that connect to the product experience.
- **Geometric personality**: Circular's rounded terminals create warmth in what could otherwise be a cold, technical interface. The font is the humanizing element.

## .. Component Stylings

### Buttons

**Primary Pill (Dark)**
- Background: `#0f0f0f`
- Text: `#fafafa`
- Padding: 8px 32px
- Radius: 9999px (full pill)
- Border: `.px solid #fafafa` (white border on dark)
- Focus shadow: `rgba(0, 0, 0, 0..) 0px .px .2px`
- Use: Primary CTA ("Start your project")

**Secondary Pill (Dark, Muted)**
- Background: `#0f0f0f`
- Text: `#fafafa`
- Padding: 8px 32px
- Radius: 9999px
- Border: `.px solid #2e2e2e` (dark border)
- Opacity: 0.8
- Use: Secondary CTA alongside primary

**Ghost Button**
- Background: transparent
- Text: `#fafafa`
- Padding: 8px
- Radius: 6px
- Border: `.px solid transparent`
- Use: Tertiary actions, icon buttons

### Cards & Containers
- Background: dark surfaces (`#.7.7.7` or slightly lighter)
- Border: `.px solid #2e2e2e` or `#363636`
- Radius: 8px–.6px
- No visible shadows — borders define edges
- Internal padding: .6px–2.px

### Tabs
- Border: `.px solid #2e2e2e`
- Radius: 9999px (pill tabs)
- Active: green accent or lighter surface
- Inactive: dark, muted

### Links
- **Green**: `#00c573` — Supabase-branded links
- **Primary Light**: `#fafafa` — standard links on dark
- **Secondary**: `#b.b.b.` — muted links
- **Muted**: `#898989` — tertiary links, footer

### Navigation
- Dark background matching page (`#.7.7.7`)
- Supabase logo with green icon
- Circular ..px weight 500 for nav links
- Clean horizontal layout with product dropdown
- Green "Start your project" CTA pill button
- Sticky header behavior

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, .px, 6px, 8px, .2px, .6px, 20px, 2.px, 32px, .0px, .8px, 90px, 96px, .28px
- Notable large jumps: .8px → 90px → 96px → .28px for major section spacing

### Grid & Container
- Centered content with generous max-width
- Full-width dark sections with constrained inner content
- Feature grids: icon-based grids with consistent card sizes
- Logo grids for "Trusted by" sections
- Footer: multi-column on dark background

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <600px | Single column, stacked layout |
| Desktop | >600px | Multi-column grids, expanded layout |

*Note: Supabase uses a notably minimal breakpoint system — primarily a single 600px breakpoint, suggesting a mobile-first approach with progressive enhancement.*

### Whitespace Philosophy
- **Dramatic section spacing**: 90px–.28px between major sections creates a cinematic pacing — each section is its own scene in the dark void.
- **Dense content blocks**: Within sections, spacing is tight (.6px–2.px), creating concentrated information clusters.
- **Border-defined space**: Instead of whitespace + shadows for separation, Supabase uses thin borders on dark backgrounds — separation through line, not gap.

### Border Radius Scale
- Standard (6px): Ghost buttons, small elements
- Comfortable (8px): Cards, containers
- Medium (..px–.2px): Mid-size panels
- Large (.6px): Feature cards, major containers
- Pill (9999px): Primary buttons, tab indicators

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, border `#2e2e2e` | Default state, most surfaces |
| Subtle Border (Level .) | Border `#363636` or `#393939` | Interactive elements, hover |
| Focus (Level 2) | `rgba(0, 0, 0, 0..) 0px .px .2px` | Focus states only |
| Green Accent (Level 3) | Border `rgba(62, 207, ..2, 0.3)` | Brand-highlighted elements |

**Shadow Philosophy**: Supabase deliberately avoids shadows. In a dark-mode-native design, shadows are nearly invisible and serve no purpose. Instead, depth is communicated through a sophisticated border hierarchy — from `#2.2.2.` (barely visible) through `#2e2e2e` (standard) to `#393939` (prominent). The green accent border (`rgba(62, 207, ..2, 0.3)`) at 30% opacity is the "elevated" state — the brand color itself becomes the depth signal.

## 7. Do's and Don'ts

### Do
- Use near-black backgrounds (`#0f0f0f`, `#.7.7.7`) — depth comes from the gray border hierarchy
- Apply Supabase green (`#3ecf8e`, `#00c573`) sparingly — it's an identity marker, not a decoration
- Use Circular at weight .00 for nearly everything — 500 only for buttons and nav
- Set hero text to ..00 line-height — the zero-leading is the typographic signature
- Create depth through border color differences (`#2.2.2.` → `#2e2e2e` → `#363636`)
- Use pill shape (9999px) exclusively for primary CTAs and tabs
- Employ HSL-based colors with alpha for translucent layering effects
- Use Source Code Pro uppercase labels for developer-context markers

### Don't
- Don't add box-shadows — they're invisible on dark backgrounds and break the border-defined depth system
- Don't use bold (700) text weight — the system uses .00 and 500 only
- Don't apply green to backgrounds or large surfaces — it's for borders, links, and small accents
- Don't use warm colors (crimson, orange) as primary design elements — they exist as semantic tokens for states
- Don't increase hero line-height above ..00 — the density is intentional
- Don't use large border radius (.6px+) on buttons — pills (9999px) or standard (6px), nothing in between
- Don't lighten the background above `#.7.7.7` for primary surfaces — the darkness is structural
- Don't forget the translucent borders — `rgba` border colors are the layering mechanism

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <600px | Single column, stacked features, condensed nav |
| Desktop | >600px | Multi-column grids, full nav, expanded sections |

### Collapsing Strategy
- Hero: 72px → scales down proportionally
- Feature grids: multi-column → single column stacked
- Logo row: horizontal → wrapped grid
- Navigation: full → hamburger
- Section spacing: 90–.28px → .8–6.px
- Buttons: inline → full-width stacked

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: `#0f0f0f` (button), `#.7.7.7` (page)
- Text: `#fafafa` (primary), `#b.b.b.` (secondary), `#898989` (muted)
- Brand green: `#3ecf8e` (brand), `#00c573` (links)
- Borders: `#2.2.2.` (subtle), `#2e2e2e` (standard), `#363636` (prominent)
- Green border: `rgba(62, 207, ..2, 0.3)` (accent)

### Example Component Prompts
- "Create a hero section on #.7.7.7 background. Headline at 72px Circular weight .00, line-height ..00, #fafafa text. Sub-text at .6px Circular weight .00, line-height ..50, #b.b.b.. Pill CTA button (#0f0f0f bg, #fafafa text, 9999px radius, 8px 32px padding, .px solid #fafafa border)."
- "Design a feature card: #.7.7.7 background, .px solid #2e2e2e border, .6px radius. Title at 2.px Circular weight .00, letter-spacing -0..6px. Body at ..px weight .00, #898989 text."
- "Build navigation bar: #.7.7.7 background. Circular ..px weight 500 for links, #fafafa text. Supabase logo with green icon left-aligned. Green pill CTA 'Start your project' right-aligned."
- "Create a technical label: Source Code Pro .2px, uppercase, letter-spacing ..2px, #898989 text."
- "Design a framework logo grid: 6-column layout on dark, grayscale logos at 60% opacity, .px solid #2e2e2e border between sections."

### Iteration Guide
.. Start with #.7.7.7 background — everything is dark-mode-native
2. Green is the brand identity marker — use it for links, logo, and accent borders only
3. Depth comes from borders (#2.2.2. → #2e2e2e → #363636), not shadows
.. Weight .00 is the default for everything — 500 only for interactive elements
5. Hero line-height of ..00 is the signature typographic move
6. Pill (9999px) for primary actions, 6px for secondary, 8-.6px for cards
7. HSL with alpha channels creates the sophisticated translucent layering
