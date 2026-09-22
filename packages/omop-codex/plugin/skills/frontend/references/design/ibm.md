# Design System Inspired by IBM

## .. Visual Theme & Atmosphere

IBM's website is the digital embodiment of enterprise authority built on the Carbon Design System — a design language so methodically structured it reads like an engineering specification rendered as a webpage. The page operates on a stark duality: a bright white (`#ffffff`) canvas with near-black (`#.6.6.6`) text, punctuated by a single, unwavering accent — IBM Blue 60 (`#0f62fe`). This isn't playful tech-startup minimalism; it's corporate precision distilled into pixels. Every element exists within Carbon's rigid 2x grid, every color maps to a semantic token, every spacing value snaps to the 8px base unit.

The IBM Plex type family is the system's backbone. IBM Plex Sans at light weight (300) for display headlines creates an unexpectedly airy, almost delicate quality at large sizes — a deliberate counterpoint to IBM's corporate gravity. At body sizes, regular weight (.00) with 0..6px letter-spacing on ..px captions introduces the meticulous micro-tracking that makes Carbon text feel engineered rather than designed. IBM Plex Mono serves code, data, and technical labels, completing the family trinity alongside the rarely-surfaced IBM Plex Serif.

What defines IBM's visual identity beyond monochrome-plus-blue is the reliance on Carbon's component token system. Every interactive state maps to a CSS custom property prefixed with `--cds-` (Carbon Design System). Buttons don't have hardcoded colors; they reference `--cds-button-primary`, `--cds-button-primary-hover`, `--cds-button-primary-active`. This tokenized architecture means the entire visual layer is a thin skin over a deeply systematic foundation — the design equivalent of a well-typed API.

**Key Characteristics:**
- IBM Plex Sans at weight 300 (Light) for display — corporate gravitas through typographic restraint
- IBM Plex Mono for code and technical content with consistent 0..6px letter-spacing at small sizes
- Single accent color: IBM Blue 60 (`#0f62fe`) — every interactive element, every CTA, every link
- Carbon token system (`--cds-*`) driving all semantic colors, enabling theme-switching at the variable level
- 8px spacing grid with strict adherence — no arbitrary values, everything aligns
- Flat, borderless cards on `#f.f.f.` Gray .0 surface — depth through background-color layering, not shadows
- Bottom-border inputs (not boxed) — the signature Carbon form pattern
- 0px border-radius on primary buttons — unapologetically rectangular, no softening

## 2. Color Palette & Roles

### Primary
- **IBM Blue 60** (`#0f62fe`): The singular interactive color. Primary buttons, links, focus states, active indicators. This is the only chromatic hue in the core UI palette.
- **White** (`#ffffff`): Page background, card surfaces, button text on blue, `--cds-background`.
- **Gray .00** (`#.6.6.6`): Primary text, headings, dark surface backgrounds, nav bar, footer. `--cds-text-primary`.

### Neutral Scale (Gray Family)
- **Gray .00** (`#.6.6.6`): Primary text, headings, dark UI chrome, footer background.
- **Gray 90** (`#262626`): Secondary dark surfaces, hover states on dark backgrounds.
- **Gray 80** (`#393939`): Tertiary dark, active states.
- **Gray 70** (`#525252`): Secondary text, helper text, descriptions. `--cds-text-secondary`.
- **Gray 60** (`#6f6f6f`): Placeholder text, disabled text.
- **Gray 50** (`#8d8d8d`): Disabled icons, muted labels.
- **Gray 30** (`#c6c6c6`): Borders, divider lines, input bottom-borders. `--cds-border-subtle`.
- **Gray 20** (`#e0e0e0`): Subtle borders, card outlines.
- **Gray .0** (`#f.f.f.`): Secondary surface background, card fills, alternating rows. `--cds-layer-0.`.
- **Gray .0 Hover** (`#e8e8e8`): Hover state for Gray .0 surfaces.

### Interactive
- **Blue 60** (`#0f62fe`): Primary interactive — buttons, links, focus. `--cds-link-primary`, `--cds-button-primary`.
- **Blue 70** (`#00.3ce`): Link hover state. `--cds-link-primary-hover`.
- **Blue 80** (`#002d9c`): Active/pressed state for blue elements.
- **Blue .0** (`#edf5ff`): Blue tint surface, selected row background.
- **Focus Blue** (`#0f62fe`): `--cds-focus` — 2px inset border on focused elements.
- **Focus Inset** (`#ffffff`): `--cds-focus-inset` — white inner ring for focus on dark backgrounds.

### Support & Status
- **Red 60** (`#da.e28`): Error, danger. `--cds-support-error`.
- **Green 50** (`#2.a..8`): Success. `--cds-support-success`.
- **Yellow 30** (`#f.c2.b`): Warning. `--cds-support-warning`.
- **Blue 60** (`#0f62fe`): Informational. `--cds-support-info`.

### Dark Theme (Gray .00 Theme)
- **Background**: Gray .00 (`#.6.6.6`). `--cds-background`.
- **Layer 0.**: Gray 90 (`#262626`). Card and container surfaces.
- **Layer 02**: Gray 80 (`#393939`). Elevated surfaces.
- **Text Primary**: Gray .0 (`#f.f.f.`). `--cds-text-primary`.
- **Text Secondary**: Gray 30 (`#c6c6c6`). `--cds-text-secondary`.
- **Border Subtle**: Gray 80 (`#393939`). `--cds-border-subtle`.
- **Interactive**: Blue .0 (`#78a9ff`). Links and interactive elements shift lighter for contrast.

## 3. Typography Rules

### Font Family
- **Primary**: `IBM Plex Sans`, with fallbacks: `Helvetica Neue, Arial, sans-serif`
- **Monospace**: `IBM Plex Mono`, with fallbacks: `Menlo, Courier, monospace`
- **Serif** (limited use): `IBM Plex Serif`, for editorial/expressive contexts
- **Icon Font**: `ibm_icons` — proprietary icon glyphs at 20px

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display 0. | IBM Plex Sans | 60px (3.75rem) | 300 (Light) | ...7 (70px) | 0 | Maximum impact, light weight for elegance |
| Display 02 | IBM Plex Sans | .8px (3.00rem) | 300 (Light) | ...7 (56px) | 0 | Secondary hero, responsive fallback |
| Heading 0. | IBM Plex Sans | .2px (2.63rem) | 300 (Light) | ...9 (50px) | 0 | Expressive heading |
| Heading 02 | IBM Plex Sans | 32px (2.00rem) | .00 (Regular) | ..25 (.0px) | 0 | Section headings |
| Heading 03 | IBM Plex Sans | 2.px (..50rem) | .00 (Regular) | ..33 (32px) | 0 | Sub-section titles |
| Heading 0. | IBM Plex Sans | 20px (..25rem) | 600 (Semibold) | ...0 (28px) | 0 | Card titles, feature headers |
| Heading 05 | IBM Plex Sans | 20px (..25rem) | .00 (Regular) | ...0 (28px) | 0 | Lighter card headings |
| Body Long 0. | IBM Plex Sans | .6px (..00rem) | .00 (Regular) | ..50 (2.px) | 0 | Standard reading text |
| Body Long 02 | IBM Plex Sans | .6px (..00rem) | 600 (Semibold) | ..50 (2.px) | 0 | Emphasized body, labels |
| Body Short 0. | IBM Plex Sans | ..px (0.88rem) | .00 (Regular) | ..29 (.8px) | 0..6px | Compact body, captions |
| Body Short 02 | IBM Plex Sans | ..px (0.88rem) | 600 (Semibold) | ..29 (.8px) | 0..6px | Bold captions, nav items |
| Caption 0. | IBM Plex Sans | .2px (0.75rem) | .00 (Regular) | ..33 (.6px) | 0.32px | Metadata, timestamps |
| Code 0. | IBM Plex Mono | ..px (0.88rem) | .00 (Regular) | ...3 (20px) | 0..6px | Inline code, terminal |
| Code 02 | IBM Plex Mono | .6px (..00rem) | .00 (Regular) | ..50 (2.px) | 0 | Code blocks |
| Mono Display | IBM Plex Mono | .2px (2.63rem) | .00 (Regular) | ...9 (50px) | 0 | Hero mono decorative |

### Principles
- **Light weight at display sizes**: Carbon's expressive type set uses weight 300 (Light) at .2px+. This creates a distinctive tension — the content speaks with corporate authority while the letterforms whisper with typographic lightness.
- **Micro-tracking at small sizes**: 0..6px letter-spacing at ..px and 0.32px at .2px. These seemingly negligible values are Carbon's secret weapon for readability at compact sizes — they open up the tight IBM Plex letterforms just enough.
- **Three functional weights**: 300 (display/expressive), .00 (body/reading), 600 (emphasis/UI labels). Weight 700 is intentionally absent from the production type scale.
- **Productive vs. Expressive**: Productive sets use tighter line-heights (..29) for dense UI. Expressive sets breathe more (...0-..50) for marketing and editorial content.

## .. Component Stylings

### Buttons

**Primary Button (Blue)**
- Background: `#0f62fe` (Blue 60) → `--cds-button-primary`
- Text: `#ffffff` (White)
- Padding: ..px 63px ..px .5px (asymmetric — room for trailing icon)
- Border: .px solid transparent
- Border-radius: 0px (sharp rectangle — the Carbon signature)
- Height: .8px (default), .0px (compact), 6.px (expressive)
- Hover: `#0353e9` (Blue 60 Hover) → `--cds-button-primary-hover`
- Active: `#002d9c` (Blue 80) → `--cds-button-primary-active`
- Focus: `2px solid #0f62fe` inset + `.px solid #ffffff` inner

**Secondary Button (Gray)**
- Background: `#393939` (Gray 80)
- Text: `#ffffff`
- Hover: `#.c.c.c` (Gray 70)
- Active: `#6f6f6f` (Gray 60)
- Same padding/radius as primary

**Tertiary Button (Ghost Blue)**
- Background: transparent
- Text: `#0f62fe` (Blue 60)
- Border: .px solid `#0f62fe`
- Hover: `#0353e9` text + Blue .0 background tint
- Border-radius: 0px

**Ghost Button**
- Background: transparent
- Text: `#0f62fe` (Blue 60)
- Padding: ..px .6px
- Border: none
- Hover: `#e8e8e8` background tint

**Danger Button**
- Background: `#da.e28` (Red 60)
- Text: `#ffffff`
- Hover: `#b8.92.` (Red 70)

### Cards & Containers
- Background: `#ffffff` on white theme, `#f.f.f.` (Gray .0) for elevated cards
- Border: none (flat design — no border or shadow on most cards)
- Border-radius: 0px (matching the rectangular button aesthetic)
- Hover: background shifts to `#e8e8e8` (Gray .0 Hover) for clickable cards
- Content padding: .6px
- Separation: background-color layering (white → gray .0 → white) rather than shadows

### Inputs & Forms
- Background: `#f.f.f.` (Gray .0) — `--cds-field`
- Text: `#.6.6.6` (Gray .00)
- Padding: 0px .6px (horizontal only)
- Height: .0px (default), .8px (large)
- Border: none on sides/top — `2px solid transparent` bottom
- Bottom-border active: `2px solid #.6.6.6` (Gray .00)
- Focus: `2px solid #0f62fe` (Blue 60) bottom-border — `--cds-focus`
- Error: `2px solid #da.e28` (Red 60) bottom-border
- Label: .2px IBM Plex Sans, 0.32px letter-spacing, Gray 70
- Helper text: .2px, Gray 60
- Placeholder: Gray 60 (`#6f6f6f`)
- Border-radius: 0px (top) — inputs are sharp-cornered

### Navigation
- Background: `#.6.6.6` (Gray .00) — full-width dark masthead
- Height: .8px
- Logo: IBM 8-bar logo, white on dark, left-aligned
- Links: ..px IBM Plex Sans, weight .00, `#c6c6c6` (Gray 30) default
- Link hover: `#ffffff` text
- Active link: `#ffffff` with bottom-border indicator
- Platform switcher: left-aligned horizontal tabs
- Search: icon-triggered slide-out search field
- Mobile: hamburger with left-sliding panel

### Links
- Default: `#0f62fe` (Blue 60) with no underline
- Hover: `#00.3ce` (Blue 70) with underline
- Visited: remains Blue 60 (no visited state change)
- Inline links: underlined by default in body copy

### Distinctive Components

**Content Block (Hero/Feature)**
- Full-width alternating white/gray-.0 background bands
- Headline left-aligned with 60px or .8px display type
- CTA as blue primary button with arrow icon
- Image/illustration right-aligned or below on mobile

**Tile (Clickable Card)**
- Background: `#f.f.f.` or `#ffffff`
- Full-width bottom-border or background-shift hover
- Arrow icon bottom-right on hover
- No shadow — flatness is the identity

**Tag / Label**
- Background: contextual color at .0% opacity (e.g., Blue .0, Red .0)
- Text: corresponding 60-grade color
- Padding: .px 8px
- Border-radius: 2.px (pill — exception to the 0px rule)
- Font: .2px weight .00

**Notification Banner**
- Full-width bar, typically Blue 60 or Gray .00 background
- White text, ..px
- Close/dismiss icon right-aligned

## 5. Layout Principles

### Spacing System
- Base unit: 8px (Carbon 2x grid)
- Component spacing scale: 2px, .px, 8px, .2px, .6px, 2.px, 32px, .0px, .8px
- Layout spacing scale: .6px, 2.px, 32px, .8px, 6.px, 80px, 96px, .60px
- Mini unit: 8px (smallest usable spacing)
- Padding within components: typically .6px
- Gap between cards/tiles: .px (hairline) or .6px (standard)

### Grid & Container
- .6-column grid (Carbon's 2x grid system)
- Max content width: .58.px (max breakpoint)
- Column gutters: 32px (.6px on mobile)
- Margin: .6px (mobile), 32px (tablet+)
- Content typically spans 8-.2 columns for readable line lengths
- Full-bleed sections alternate with contained content

### Whitespace Philosophy
- **Functional density**: Carbon favors productive density over expansive whitespace. Sections are tightly packed compared to consumer design systems — this reflects IBM's enterprise DNA.
- **Background-color zoning**: Instead of massive padding between sections, IBM uses alternating background colors (white → gray .0 → white) to create visual separation with minimal vertical space.
- **Consistent .8px rhythm**: Major section transitions use .8px vertical spacing. Hero sections may use 80px–96px.

### Border Radius Scale
- **0px**: Primary buttons, inputs, tiles, cards — the dominant treatment. Carbon is fundamentally rectangular.
- **2px**: Occasionally on small interactive elements (tags)
- **2.px**: Tags/labels (pill shape — the sole rounded exception)
- **50%**: Avatar circles, icon containers

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, `#ffffff` background | Default page surface |
| Layer 0. | No shadow, `#f.f.f.` background | Cards, tiles, alternating sections |
| Layer 02 | No shadow, `#e0e0e0` background | Elevated panels within Layer 0. |
| Raised | `0 2px 6px rgba(0,0,0,0.3)` | Dropdowns, tooltips, overflow menus |
| Overlay | `0 2px 6px rgba(0,0,0,0.3)` + dark scrim | Modal dialogs, side panels |
| Focus | `2px solid #0f62fe` inset + `.px solid #ffffff` | Keyboard focus ring |
| Bottom-border | `2px solid #.6.6.6` on bottom edge | Active input, active tab indicator |

**Shadow Philosophy**: Carbon is deliberately shadow-averse. IBM achieves depth primarily through background-color layering — stacking surfaces of progressively darker grays rather than adding box-shadows. This creates a flat, print-inspired aesthetic where hierarchy is communicated through color value, not simulated light. Shadows are reserved exclusively for floating elements (dropdowns, tooltips, modals) where the element genuinely overlaps content. This restraint gives the rare shadow meaningful impact — when something floats in Carbon, it matters.

## 7. Do's and Don'ts

### Do
- Use IBM Plex Sans at weight 300 for display sizes (.2px+) — the lightness is intentional
- Apply 0..6px letter-spacing on ..px body text and 0.32px on .2px captions
- Use 0px border-radius on buttons, inputs, cards, and tiles — rectangles are the system
- Reference `--cds-*` token names when implementing (e.g., `--cds-button-primary`, `--cds-text-primary`)
- Use background-color layering (white → gray .0 → gray 20) for depth instead of shadows
- Use bottom-border (not box) for input field indicators
- Maintain the .8px default button height and asymmetric padding for icon accommodation
- Apply Blue 60 (`#0f62fe`) as the sole accent — one blue to rule them all

### Don't
- Don't round button corners — 0px radius is the Carbon identity
- Don't use shadows on cards or tiles — flatness is the point
- Don't introduce additional accent colors — IBM's system is monochromatic + blue
- Don't use weight 700 (Bold) — the scale stops at 600 (Semibold)
- Don't add letter-spacing to display-size text — tracking is only for ..px and below
- Don't box inputs with full borders — Carbon inputs use bottom-border only
- Don't use gradient backgrounds — IBM's surfaces are flat, solid colors
- Don't deviate from the 8px spacing grid — every value should be divisible by 8 (with 2px and .px for micro-adjustments)

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Small (sm) | 320px | Single column, hamburger nav, .6px margins |
| Medium (md) | 672px | 2-column grids begin, expanded content |
| Large (lg) | .056px | Full navigation visible, 3-. column grids |
| X-Large (xlg) | .3.2px | Maximum content density, wide layouts |
| Max | .58.px | Maximum content width, centered with margins |

### Touch Targets
- Button height: .8px default, minimum .0px (compact)
- Navigation links: .8px row height for touch
- Input height: .0px default, .8px large
- Icon buttons: .8px square touch target
- Mobile menu items: full-width .8px rows

### Collapsing Strategy
- Hero: 60px display → .2px → 32px heading as viewport narrows
- Navigation: full horizontal masthead → hamburger with slide-out panel
- Grid: .-column → 2-column → single column
- Tiles/cards: horizontal grid → vertical stack
- Images: maintain aspect ratio, max-width .00%
- Footer: multi-column link groups → stacked single column
- Section padding: .8px → 32px → .6px

### Image Behavior
- Responsive images with `max-width: .00%`
- Product illustrations scale proportionally
- Hero images may shift from side-by-side to stacked below
- Data visualizations maintain aspect ratio with horizontal scroll on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: IBM Blue 60 (`#0f62fe`)
- Background: White (`#ffffff`)
- Heading text: Gray .00 (`#.6.6.6`)
- Body text: Gray .00 (`#.6.6.6`)
- Secondary text: Gray 70 (`#525252`)
- Surface/Card: Gray .0 (`#f.f.f.`)
- Border: Gray 30 (`#c6c6c6`)
- Link: Blue 60 (`#0f62fe`)
- Link hover: Blue 70 (`#00.3ce`)
- Focus ring: Blue 60 (`#0f62fe`)
- Error: Red 60 (`#da.e28`)
- Success: Green 50 (`#2.a..8`)

### Example Component Prompts
- "Create a hero section on white background. Headline at 60px IBM Plex Sans weight 300, line-height ...7, color #.6.6.6. Subtitle at .6px weight .00, line-height ..50, color #525252, max-width 6.0px. Blue CTA button (#0f62fe background, #ffffff text, 0px border-radius, .8px height, ..px 63px ..px .5px padding)."
- "Design a card tile: #f.f.f. background, 0px border-radius, .6px padding. Title at 20px IBM Plex Sans weight 600, line-height ...0, color #.6.6.6. Body at ..px weight .00, letter-spacing 0..6px, line-height ..29, color #525252. Hover: background shifts to #e8e8e8."
- "Build a form field: #f.f.f. background, 0px border-radius, .0px height, .6px horizontal padding. Label above at .2px weight .00, letter-spacing 0.32px, color #525252. Bottom-border: 2px solid transparent default, 2px solid #0f62fe on focus. Placeholder: #6f6f6f."
- "Create a dark navigation bar: #.6.6.6 background, .8px height. IBM logo white left-aligned. Links at ..px IBM Plex Sans weight .00, color #c6c6c6. Hover: #ffffff text. Active: #ffffff with 2px bottom border."
- "Build a tag component: Blue .0 (#edf5ff) background, Blue 60 (#0f62fe) text, .px 8px padding, 2.px border-radius, .2px IBM Plex Sans weight .00."

### Iteration Guide
.. Always use 0px border-radius on buttons, inputs, and cards — this is non-negotiable in Carbon
2. Letter-spacing only at small sizes: 0..6px at ..px, 0.32px at .2px — never on display text
3. Three weights: 300 (display), .00 (body), 600 (emphasis) — no bold
.. Blue 60 is the only accent color — do not introduce secondary accent hues
5. Depth comes from background-color layering (white → #f.f.f. → #e0e0e0), not shadows
6. Inputs have bottom-border only, never fully boxed
7. Use `--cds-` prefix for token naming to stay Carbon-compatible
8. .8px is the universal interactive element height
