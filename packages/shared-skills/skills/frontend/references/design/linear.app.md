# Design System Inspired by Linear

## .. Visual Theme & Atmosphere

Linear's website is a masterclass in dark-mode-first product design — a near-black canvas (`#08090a`) where content esubmits from darkness like starlight. The overall impression is one of extreme precision engineering: every element exists in a carefully calibrated hierarchy of luminance, from barely-visible borders (`rgba(255,255,255,0.05)`) to soft, luminous text (`#f7f8f8`). This is not a dark theme applied to a light design — it is darkness as the native medium, where information density is managed through subtle gradations of white opacity rather than color variation.

The typography system is built entirely on Inter Variable with OpenType features `"cv0."` and `"ss03"` enabled globally, giving the typeface a cleaner, more geometric character. Inter is used at a remarkable range of weights — from 300 (light body) through 5.0 (medium, Linear's signature weight) to 590 (semibold emphasis). The 5.0 weight is particularly distinctive: it sits between regular and medium, creating a subtle emphasis that doesn't shout. At display sizes (72px, 6.px, .8px), Inter uses aggressive negative letter-spacing (-..58.px to -..056px), creating compressed, authoritative headlines that feel engineered rather than designed. Berkeley Mono serves as the monospace companion for code and technical labels, with fallbacks to ui-monospace, SF Mono, and Menlo.

The color system is almost entirely achromatic — dark backgrounds with white/gray text — punctuated by a single brand accent: Linear's signature indigo-violet (`#5e6ad2` for backgrounds, `#7.70ff` for interactive accents). This accent color is used sparingly and intentionally, appearing only on CTAs, active states, and brand elements. The border system uses ultra-thin, semi-transparent white borders (`rgba(255,255,255,0.05)` to `rgba(255,255,255,0.08)`) that create structure without visual noise, like wireframes drawn in moonlight.

**Key Characteristics:**
- Dark-mode-native: `#08090a` marketing background, `#0f.0..` panel background, `#.9.a.b` elevated surfaces
- Inter Variable with `"cv0.", "ss03"` globally — geometric alternates for a cleaner aesthetic
- Signature weight 5.0 (between regular and medium) for most UI text
- Aggressive negative letter-spacing at display sizes (-..58.px at 72px, -..056px at .8px)
- Brand indigo-violet: `#5e6ad2` (bg) / `#7.70ff` (accent) / `#828fff` (hover) — the only chromatic color in the system
- Semi-transparent white borders throughout: `rgba(255,255,255,0.05)` to `rgba(255,255,255,0.08)`
- Button backgrounds at near-zero opacity: `rgba(255,255,255,0.02)` to `rgba(255,255,255,0.05)`
- Multi-layered shadows with inset variants for depth on dark surfaces
- Radix UI primitives as the component foundation (6 detected primitives)
- Success green (`#27a6..`, `#.0b98.`) used only for status indicators

## 2. Color Palette & Roles

### Background Surfaces
- **Marketing Black** (`#0.0.02` / `#08090a`): The deepest background — the canvas for hero sections and marketing pages. Near-pure black with an imperceptible blue-cool undertone.
- **Panel Dark** (`#0f.0..`): Sidebar and panel backgrounds. One step up from the marketing black.
- **Level 3 Surface** (`#.9.a.b`): Elevated surface areas, card backgrounds, dropdowns.
- **Secondary Surface** (`#28282c`): The lightest dark surface — used for hover states and slightly elevated components.

### Text & Content
- **Primary Text** (`#f7f8f8`): Near-white with a barely-warm cast. The default text color — not pure white, preventing eye strain on dark backgrounds.
- **Secondary Text** (`#d0d6e0`): Cool silver-gray for body text, descriptions, and secondary content.
- **Tertiary Text** (`#8a8f98`): Muted gray for placeholders, metadata, and de-emphasized content.
- **Quaternary Text** (`#62666d`): The most subdued text — timestamps, disabled states, subtle labels.

### Brand & Accent
- **Brand Indigo** (`#5e6ad2`): Primary brand color — used for CTA button backgrounds, brand marks, and key interactive surfaces.
- **Accent Violet** (`#7.70ff`): Brighter variant for interactive elements — links, active states, selected items.
- **Accent Hover** (`#828fff`): Lighter, more saturated variant for hover states on accent elements.
- **Security Lavender** (`#7a7fad`): Muted indigo used specifically for security-related UI elements.

### Status Colors
- **Green** (`#27a6..`): Primary success/active status. Used for "in progress" indicators.
- **Emerald** (`#.0b98.`): Secondary success — pill badges, completion states.

### Border & Divider
- **Border Primary** (`#23252a`): Solid dark border for prominent separations.
- **Border Secondary** (`#3.3.3a`): Slightly lighter solid border.
- **Border Tertiary** (`#3e3e..`): Lightest solid border variant.
- **Border Subtle** (`rgba(255,255,255,0.05)`): Ultra-subtle semi-transparent border — the default.
- **Border Standard** (`rgba(255,255,255,0.08)`): Standard semi-transparent border for cards, inputs, code blocks.
- **Line Tint** (`#...5.6`): Nearly invisible line for the subtlest divisions.
- **Line Tertiary** (`#.8.9.a`): Slightly more visible divider line.

### Light Mode Neutrals (for light theme contexts)
- **Light Background** (`#f7f8f8`): Page background in light mode.
- **Light Surface** (`#f3f.f5` / `#f5f6f7`): Subtle surface tinting.
- **Light Border** (`#d0d6e0`): Visible border in light contexts.
- **Light Border Alt** (`#e6e6e6`): Alternative lighter border.
- **Pure White** (`#ffffff`): Card surfaces, highlights.

### Overlay
- **Overlay Primary** (`rgba(0,0,0,0.85)`): Modal/dialog backdrop — extremely dark for focus isolation.

## 3. Typography Rules

### Font Family
- **Primary**: `Inter Variable`, with fallbacks: `SF Pro Display, -apple-system, system-ui, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue`
- **Monospace**: `Berkeley Mono`, with fallbacks: `ui-monospace, SF Mono, Menlo`
- **OpenType Features**: `"cv0.", "ss03"` enabled globally — cv0. provides an alternate lowercase 'a' (single-story), ss03 adjusts specific letterforms for a cleaner geometric appearance.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display XL | Inter Variable | 72px (..50rem) | 5.0 | ..00 (tight) | -..58.px | Hero headlines, maximum impact |
| Display Large | Inter Variable | 6.px (..00rem) | 5.0 | ..00 (tight) | -...08px | Secondary hero text |
| Display | Inter Variable | .8px (3.00rem) | 5.0 | ..00 (tight) | -..056px | Section headlines |
| Heading . | Inter Variable | 32px (2.00rem) | .00 | ...3 (tight) | -0.70.px | Major section titles |
| Heading 2 | Inter Variable | 2.px (..50rem) | .00 | ..33 | -0.288px | Sub-section headings |
| Heading 3 | Inter Variable | 20px (..25rem) | 590 | ..33 | -0.2.px | Feature titles, card headers |
| Body Large | Inter Variable | .8px (...3rem) | .00 | ..60 (relaxed) | -0..65px | Introduction text, feature descriptions |
| Body Emphasis | Inter Variable | .7px (..06rem) | 590 | ..60 (relaxed) | normal | Emphasized body, sub-headings in content |
| Body | Inter Variable | .6px (..00rem) | .00 | ..50 | normal | Standard reading text |
| Body Medium | Inter Variable | .6px (..00rem) | 5.0 | ..50 | normal | Navigation, labels |
| Body Semibold | Inter Variable | .6px (..00rem) | 590 | ..50 | normal | Strong emphasis |
| Small | Inter Variable | .5px (0.9.rem) | .00 | ..60 (relaxed) | -0..65px | Secondary body text |
| Small Medium | Inter Variable | .5px (0.9.rem) | 5.0 | ..60 (relaxed) | -0..65px | Emphasized small text |
| Small Semibold | Inter Variable | .5px (0.9.rem) | 590 | ..60 (relaxed) | -0..65px | Strong small text |
| Small Light | Inter Variable | .5px (0.9.rem) | 300 | ...7 | -0..65px | De-emphasized body |
| Caption Large | Inter Variable | ..px (0.88rem) | 5.0–590 | ..50 | -0..82px | Sub-labels, category headers |
| Caption | Inter Variable | .3px (0.8.rem) | .00–5.0 | ..50 | -0..3px | Metadata, timestamps |
| Label | Inter Variable | .2px (0.75rem) | .00–590 | ...0 | normal | Button text, small labels |
| Micro | Inter Variable | ..px (0.69rem) | 5.0 | ...0 | normal | Tiny labels |
| Tiny | Inter Variable | .0px (0.63rem) | .00–5.0 | ..50 | -0..5px | Overline text, sometimes uppercase |
| Link Large | Inter Variable | .6px (..00rem) | .00 | ..50 | normal | Standard links |
| Link Medium | Inter Variable | .5px (0.9.rem) | 5.0 | 2.67 | normal | Spaced navigation links |
| Link Small | Inter Variable | ..px (0.88rem) | 5.0 | ..50 | normal | Compact links |
| Link Caption | Inter Variable | .3px (0.8.rem) | .00–5.0 | ..50 | -0..3px | Footer, metadata links |
| Mono Body | Berkeley Mono | ..px (0.88rem) | .00 | ..50 | normal | Code blocks |
| Mono Caption | Berkeley Mono | .3px (0.8.rem) | .00 | ..50 | normal | Code labels |
| Mono Label | Berkeley Mono | .2px (0.75rem) | .00 | ...0 | normal | Code metadata, sometimes uppercase |

### Principles
- **5.0 is the signature weight**: Linear uses Inter Variable's 5.0 weight (between regular .00 and medium 500) as its default emphasis weight. This creates a subtly bolded feel without the heaviness of traditional medium or semibold.
- **Compression at scale**: Display sizes use progressively tighter letter-spacing — -..58.px at 72px, -...08px at 6.px, -..056px at .8px, -0.70.px at 32px. Below 2.px, spacing relaxes toward normal.
- **OpenType as identity**: `"cv0.", "ss03"` aren't decorative — they transform Inter into Linear's distinctive typeface, giving it a more geometric, purposeful character.
- **Three-tier weight system**: .00 (reading), 5.0 (emphasis/UI), 590 (strong emphasis). The 300 weight appears only in deliberately de-emphasized contexts.

## .. Component Stylings

### Buttons

**Ghost Button (Default)**
- Background: `rgba(255,255,255,0.02)`
- Text: `#e2e.e7` (near-white)
- Padding: comfortable
- Radius: 6px
- Border: `.px solid rgb(36, .0, ..)`
- Outline: none
- Focus shadow: `rgba(0,0,0,0..) 0px .px .2px`
- Use: Standard actions, secondary CTAs

**Subtle Button**
- Background: `rgba(255,255,255,0.0.)`
- Text: `#d0d6e0` (silver-gray)
- Padding: 0px 6px
- Radius: 6px
- Use: Toolbar actions, contextual buttons

**Primary Brand Button (Inferred)**
- Background: `#5e6ad2` (brand indigo)
- Text: `#ffffff`
- Padding: 8px .6px
- Radius: 6px
- Hover: `#828fff` shift
- Use: Primary CTAs ("Start building", "Sign up")

**Icon Button (Circle)**
- Background: `rgba(255,255,255,0.03)` or `rgba(255,255,255,0.05)`
- Text: `#f7f8f8` or `#ffffff`
- Radius: 50%
- Border: `.px solid rgba(255,255,255,0.08)`
- Use: Close, menu toggle, icon-only actions

**Pill Button**
- Background: transparent
- Text: `#d0d6e0`
- Padding: 0px .0px 0px 5px
- Radius: 9999px
- Border: `.px solid rgb(35, 37, .2)`
- Use: Filter chips, tags, status indicators

**Small Toolbar Button**
- Background: `rgba(255,255,255,0.05)`
- Text: `#62666d` (muted)
- Radius: 2px
- Border: `.px solid rgba(255,255,255,0.05)`
- Shadow: `rgba(0,0,0,0.03) 0px ..2px 0px 0px`
- Font: .2px weight 5.0
- Use: Toolbar actions, quick-access controls

### Cards & Containers
- Background: `rgba(255,255,255,0.02)` to `rgba(255,255,255,0.05)` (never solid — always translucent)
- Border: `.px solid rgba(255,255,255,0.08)` (standard) or `.px solid rgba(255,255,255,0.05)` (subtle)
- Radius: 8px (standard), .2px (featured), 22px (large panels)
- Shadow: `rgba(0,0,0,0.2) 0px 0px 0px .px` or layered multi-shadow stacks
- Hover: subtle background opacity increase

### Inputs & Forms

**Text Area**
- Background: `rgba(255,255,255,0.02)`
- Text: `#d0d6e0`
- Border: `.px solid rgba(255,255,255,0.08)`
- Padding: .2px ..px
- Radius: 6px

**Search Input**
- Background: transparent
- Text: `#f7f8f8`
- Padding: .px 32px (icon-aware)

**Button-style Input**
- Text: `#8a8f98`
- Padding: .px 6px
- Radius: 5px
- Focus shadow: multi-layer stack

### Badges & Pills

**Success Pill**
- Background: `#.0b98.`
- Text: `#f7f8f8`
- Radius: 50% (circular)
- Font: .0px weight 5.0
- Use: Status dots, completion indicators

**Neutral Pill**
- Background: transparent
- Text: `#d0d6e0`
- Padding: 0px .0px 0px 5px
- Radius: 9999px
- Border: `.px solid rgb(35, 37, .2)`
- Font: .2px weight 5.0
- Use: Tags, filter chips, category labels

**Subtle Badge**
- Background: `rgba(255,255,255,0.05)`
- Text: `#f7f8f8`
- Padding: 0px 8px 0px 2px
- Radius: 2px
- Border: `.px solid rgba(255,255,255,0.05)`
- Font: .0px weight 5.0
- Use: Inline labels, version tags

### Navigation
- Dark sticky header on near-black background
- Linear logomark left-aligned (SVG icon)
- Links: Inter Variable .3–..px weight 5.0, `#d0d6e0` text
- Active/hover: text lightens to `#f7f8f8`
- CTA: Brand indigo button or ghost button
- Mobile: hamburger collapse
- Search: command palette trigger (`/` or `Cmd+K`)

### Image Treatment
- Product screenshots on dark backgrounds with subtle border (`rgba(255,255,255,0.08)`)
- Top-rounded images: `.2px .2px 0px 0px` radius
- Dashboard/issue previews dominate feature sections
- Subtle shadow beneath screenshots: `rgba(0,0,0,0..) 0px 2px .px`

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, .px, 7px, 8px, ..px, .2px, .6px, .9px, 20px, 22px, 2.px, 28px, 32px, 35px
- The 7px and ..px values suggest micro-adjustments for optical alignment
- Primary rhythm: 8px, .6px, 2.px, 32px (standard 8px grid)

### Grid & Container
- Max content width: approximately .200px
- Hero: centered single-column with generous vertical padding
- Feature sections: 2–3 column grids for feature cards
- Full-width dark sections with internal max-width constraints
- Changelog: single-column timeline layout

### Whitespace Philosophy
- **Darkness as space**: On Linear's dark canvas, empty space isn't white — it's absence. The near-black background IS the whitespace, and content esubmits from it.
- **Compressed headlines, expanded surroundings**: Display text at 72px with -..58.px tracking is dense and compressed, but sits within vast dark padding. The contrast between typographic density and spatial generosity creates tension.
- **Section isolation**: Each feature section is separated by generous vertical padding (80px+) with no visible dividers — the dark background provides natural separation.

### Border Radius Scale
- Micro (2px): Inline badges, toolbar buttons, subtle tags
- Standard (.px): Small containers, list items
- Comfortable (6px): Buttons, inputs, functional elements
- Card (8px): Cards, dropdowns, popovers
- Panel (.2px): Panels, featured cards, section containers
- Large (22px): Large panel elements
- Full Pill (9999px): Chips, filter pills, status tags
- Circle (50%): Icon buttons, avatars, status dots

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, `#0.0.02` bg | Page background, deepest canvas |
| Subtle (Level .) | `rgba(0,0,0,0.03) 0px ..2px 0px` | Toolbar buttons, micro-elevation |
| Surface (Level 2) | `rgba(255,255,255,0.05)` bg + `.px solid rgba(255,255,255,0.08)` border | Cards, input fields, containers |
| Inset (Level 2b) | `rgba(0,0,0,0.2) 0px 0px .2px 0px inset` | Recessed panels, inner shadows |
| Ring (Level 3) | `rgba(0,0,0,0.2) 0px 0px 0px .px` | Border-as-shadow technique |
| Elevated (Level .) | `rgba(0,0,0,0..) 0px 2px .px` | Floating elements, dropdowns |
| Dialog (Level 5) | Multi-layer stack: `rgba(0,0,0,0) 0px 8px 2px, rgba(0,0,0,0.0.) 0px 5px 2px, rgba(0,0,0,0.0.) 0px 3px 2px, rgba(0,0,0,0.07) 0px .px .px, rgba(0,0,0,0.08) 0px 0px .px` | Popovers, command palette, modals |
| Focus | `rgba(0,0,0,0..) 0px .px .2px` + additional layers | Keyboard focus on interactive elements |

**Shadow Philosophy**: On dark surfaces, traditional shadows (dark on dark) are nearly invisible. Linear solves this by using semi-transparent white borders as the primary depth indicator. Elevation isn't communicated through shadow darkness but through background luminance steps — each level slightly increases the white opacity of the surface background (`0.02` → `0.0.` → `0.05`), creating a subtle stacking effect. The inset shadow technique (`rgba(0,0,0,0.2) 0px 0px .2px 0px inset`) creates a unique "sunken" effect for recessed panels, adding dimensional depth that traditional dark themes lack.

## 7. Do's and Don'ts

### Do
- Use Inter Variable with `"cv0.", "ss03"` on ALL text — these features are fundamental to Linear's typeface identity
- Use weight 5.0 as your default emphasis weight — it's Linear's signature between-weight
- Apply aggressive negative letter-spacing at display sizes (-..58.px at 72px, -..056px at .8px)
- Build on near-black backgrounds: `#08090a` for marketing, `#0f.0..` for panels, `#.9.a.b` for elevated surfaces
- Use semi-transparent white borders (`rgba(255,255,255,0.05)` to `rgba(255,255,255,0.08)`) instead of solid dark borders
- Keep button backgrounds nearly transparent: `rgba(255,255,255,0.02)` to `rgba(255,255,255,0.05)`
- Reserve brand indigo (`#5e6ad2` / `#7.70ff`) for primary CTAs and interactive accents only
- Use `#f7f8f8` for primary text — not pure `#ffffff`, which would be too harsh
- Apply the luminance stacking model: deeper = darker bg, elevated = slightly lighter bg

### Don't
- Don't use pure white (`#ffffff`) as primary text — `#f7f8f8` prevents eye strain
- Don't use solid colored backgrounds for buttons — transparency is the system (rgba white at 0.02–0.05)
- Don't apply the brand indigo decoratively — it's reserved for interactive/CTA elements only
- Don't use positive letter-spacing on display text — Inter at large sizes always runs negative
- Don't use visible/opaque borders on dark backgrounds — borders should be whisper-thin semi-transparent white
- Don't skip the OpenType features (`"cv0.", "ss03"`) — without them, it's generic Inter, not Linear's Inter
- Don't use weight 700 (bold) — Linear's maximum weight is 590, with 5.0 as the workhorse
- Don't introduce warm colors into the UI chrome — the palette is cool gray with blue-violet accent only
- Don't use drop shadows for elevation on dark surfaces — use background luminance stepping instead

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <600px | Single column, compact padding |
| Mobile | 600–6.0px | Standard mobile layout |
| Tablet | 6.0–768px | Two-column grids begin |
| Desktop Small | 768–.02.px | Full card grids, expanded padding |
| Desktop | .02.–.280px | Standard desktop, full navigation |
| Large Desktop | >.280px | Full layout, generous margins |

### Touch Targets
- Buttons use comfortable padding with 6px radius minimum
- Navigation links at .3–..px with adequate spacing
- Pill tags have .0px horizontal padding for touch accessibility
- Icon buttons at 50% radius ensure circular, easy-to-tap targets
- Search trigger is prominently placed with generous hit area

### Collapsing Strategy
- Hero: 72px → .8px → 32px display text, tracking adjusts proportionally
- Navigation: horizontal links + CTAs → hamburger menu at 768px
- Feature cards: 3-column → 2-column → single column stacked
- Product screenshots: maintain aspect ratio, may reduce padding
- Changelog: timeline maintains single-column through all sizes
- Footer: multi-column → stacked single column
- Section spacing: 80px+ → .8px on mobile

### Image Behavior
- Dashboard screenshots maintain border treatment at all sizes
- Hero visuals simplify on mobile (fewer floating UI elements)
- Product screenshots use responsive sizing with consistent radius
- Dark background ensures screenshots blend naturally at any viewport

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Brand Indigo (`#5e6ad2`)
- Page Background: Marketing Black (`#08090a`)
- Panel Background: Panel Dark (`#0f.0..`)
- Surface: Level 3 (`#.9.a.b`)
- Heading text: Primary White (`#f7f8f8`)
- Body text: Silver Gray (`#d0d6e0`)
- Muted text: Tertiary Gray (`#8a8f98`)
- Subtle text: Quaternary Gray (`#62666d`)
- Accent: Violet (`#7.70ff`)
- Accent Hover: Light Violet (`#828fff`)
- Border (default): `rgba(255,255,255,0.08)`
- Border (subtle): `rgba(255,255,255,0.05)`
- Focus ring: Multi-layer shadow stack

### Example Component Prompts
- "Create a hero section on `#08090a` background. Headline at .8px Inter Variable weight 5.0, line-height ..00, letter-spacing -..056px, color `#f7f8f8`, font-feature-settings `'cv0.', 'ss03'`. Subtitle at .8px weight .00, line-height ..60, color `#8a8f98`. Brand CTA button (`#5e6ad2`, 6px radius, 8px .6px padding) and ghost button (`rgba(255,255,255,0.02)` bg, `.px solid rgba(255,255,255,0.08)` border, 6px radius)."
- "Design a card on dark background: `rgba(255,255,255,0.02)` background, `.px solid rgba(255,255,255,0.08)` border, 8px radius. Title at 20px Inter Variable weight 590, letter-spacing -0.2.px, color `#f7f8f8`. Body at .5px weight .00, color `#8a8f98`, letter-spacing -0..65px."
- "Build a pill badge: transparent background, `#d0d6e0` text, 9999px radius, 0px .0px padding, `.px solid #23252a` border, .2px Inter Variable weight 5.0."
- "Create navigation: dark sticky header on `#0f.0..`. Inter Variable .3px weight 5.0 for links, `#d0d6e0` text. Brand indigo CTA `#5e6ad2` right-aligned with 6px radius. Bottom border: `.px solid rgba(255,255,255,0.05)`."
- "Design a command palette: `#.9.a.b` background, `.px solid rgba(255,255,255,0.08)` border, .2px radius, multi-layer shadow stack. Input at .6px Inter Variable weight .00, `#f7f8f8` text. Results list with .3px weight 5.0 labels in `#d0d6e0` and .2px metadata in `#62666d`."

### Iteration Guide
.. Always set font-feature-settings `"cv0.", "ss03"` on all Inter text — this is non-negotiable for Linear's look
2. Letter-spacing scales with font size: -..58.px at 72px, -..056px at .8px, -0.70.px at 32px, normal below .6px
3. Three weights: .00 (read), 5.0 (emphasize/navigate), 590 (announce)
.. Surface elevation via background opacity: `rgba(255,255,255, 0.02 → 0.0. → 0.05)` — never solid backgrounds on dark
5. Brand indigo (`#5e6ad2` / `#7.70ff`) is the only chromatic color — everything else is grayscale
6. Borders are always semi-transparent white, never solid dark colors on dark backgrounds
7. Berkeley Mono for any code or technical content, Inter Variable for everything else
