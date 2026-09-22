# Design System Inspired by MongoDB

## .. Visual Theme & Atmosphere

MongoDB's website is a deep-forest-meets-terminal experience — a design system rooted in the darkest teal-black (`#00.e2b`) that evokes both the density of a database and the depth of a forest canopy. Against this near-black canvas, a striking neon green (`#00ed6.`) pulses as the brand accent — bright enough to feel electric, organic enough to feel alive. This isn't the cold neon of cyberpunk; it's the bioluminescent green of something growing in the dark.

The typography system is architecturally ambitious: MongoDB Value Serif for massive hero headlines (96px) creates an editorial, authoritative presence — serif type at database-company scale is a bold choice that says "we're not just another tech company." Euclid Circular A handles the heavy lifting of body and UI text with an unusually wide weight range (300–700), while Source Code Pro serves as the code and label font with distinctive uppercase treatments featuring very wide letter-spacing (.px–3px). This three-font system creates a hierarchy that spans editorial elegance → geometric professionalism → engineering precision.

What makes MongoDB distinctive is its dual-mode design: a dark hero/feature section world (`#00.e2b` with neon green accents) and a light content world (white with teal-gray borders `#b8c.c2`). The transition between these modes creates dramatic contrast. The shadow system uses teal-tinted dark shadows (`rgba(0, 30, .3, 0..2)`) that maintain the forest-dark atmosphere even on light surfaces. Buttons use pill shapes (.00px–999px radius) with MongoDB Green borders (`#0068.a`), and the entire component system references the LeafyGreen design system.

**Key Characteristics:**
- Deep teal-black backgrounds (`#00.e2b`) — forest-dark, not space-dark
- Neon MongoDB Green (`#00ed6.`) as the singular brand accent — electric and organic
- MongoDB Value Serif for hero headlines — editorial authority at tech scale
- Euclid Circular A for body with weight 300 (light) as a distinctive body weight
- Source Code Pro with wide uppercase letter-spacing (.px–3px) for technical labels
- Teal-tinted shadows: `rgba(0, 30, .3, 0..2)` — shadows carry the forest color
- Dual-mode: dark teal hero sections + light white content sections
- Pill buttons (.00px radius) with green borders (`#0068.a`)
- Link Blue (`#006cfa`) and hover transition to `#3860be`

## 2. Color Palette & Roles

### Primary Brand
- **Forest Black** (`#00.e2b`): Primary dark background — the deepest teal-black
- **MongoDB Green** (`#00ed6.`): Primary brand accent — neon green for highlights, underlines, gradients
- **Dark Green** (`#0068.a`): Button borders, link text on light — muted green for functional use

### Interactive
- **Action Blue** (`#006cfa`): Secondary accent — links, interactive highlights
- **Hover Blue** (`#3860be`): All link hover states transition to this blue
- **Teal Active** (`#.eaedb`): Button hover background — bright teal

### Neutral Scale
- **Deep Teal** (`#.c2d38`): Dark button backgrounds, secondary dark surfaces
- **Teal Gray** (`#3d.f58`): Dark borders on dark surfaces
- **Dark Slate** (`#2.3.3c`): Dark link text variant
- **Cool Gray** (`#5c6c75`): Muted text on dark, secondary button text
- **Silver Teal** (`#b8c.c2`): Borders on light surfaces, dividers
- **Light Input** (`#e8edeb`): Input text on dark surfaces
- **Pure White** (`#ffffff`): Light section background, button text on dark
- **Black** (`#000000`): Text on light surfaces, darkest elements

### Shadows
- **Forest Shadow** (`rgba(0, 30, .3, 0..2) 0px 26px ..px, rgba(0, 0, 0, 0..3) 0px 7px .3px`): Primary card elevation — teal-tinted
- **Standard Shadow** (`rgba(0, 0, 0, 0..5) 0px 3px 20px`): General elevation
- **Subtle Shadow** (`rgba(0, 0, 0, 0..) 0px 2px .px`): Light card lift

## 3. Typography Rules

### Font Families
- **Display Serif**: `MongoDB Value Serif` — editorial hero headlines
- **Body / UI**: `Euclid Circular A` — geometric sans-serif workhorse
- **Code / Labels**: `Source Code Pro` — monospace with uppercase label treatments
- **Fallbacks**: `Akzidenz-Grotesk Std` (with CJK: Noto Sans KR/SC/JP), `Times`, `Arial`, `system-ui`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | MongoDB Value Serif | 96px (6.00rem) | .00 | ..20 (tight) | normal | Serif authority |
| Display Secondary | MongoDB Value Serif | 6.px (..00rem) | .00 | ..00 (tight) | normal | Serif sub-hero |
| Section Heading | Euclid Circular A | 36px (2.25rem) | 500 | ..33 | normal | Geometric precision |
| Sub-heading | Euclid Circular A | 2.px (..50rem) | 500 | ..33 | normal | Feature titles |
| Body Large | Euclid Circular A | 20px (..25rem) | .00 | ..60 (relaxed) | normal | Introductions |
| Body | Euclid Circular A | .8px (...3rem) | .00 | ..33 | normal | Standard body |
| Body Light | Euclid Circular A | .6px (..00rem) | 300 | ..50–2.00 | normal | Light-weight reading text |
| Nav / UI | Euclid Circular A | .6px (..00rem) | 500 | ..00–..88 | 0..6px | Navigation, emphasized |
| Body Bold | Euclid Circular A | .5px (0.9.rem) | 700 | ..50 | normal | Strong emphasis |
| Button | Euclid Circular A | .3.5px–.6px | 500–700 | ..00 | 0..35px–0.9px | CTA labels |
| Caption | Euclid Circular A | ..px (0.88rem) | .00 | ..7. (relaxed) | normal | Metadata |
| Small | Euclid Circular A | ..px (0.69rem) | 600 | ..82 (relaxed) | 0.2px | Tags, annotations |
| Code Heading | Source Code Pro | .0px (2.50rem) | .00 | ..60 (relaxed) | normal | Code showcase titles |
| Code Body | Source Code Pro | .6px (..00rem) | .00 | ..50 | normal | Code blocks |
| Code Label | Source Code Pro | ..px (0.88rem) | .00–500 | .... (tight) | .px–2px | `text-transform: uppercase` |
| Code Micro | Source Code Pro | 9px (0.56rem) | 600 | 2.67 (relaxed) | 2.5px | `text-transform: uppercase` |

### Principles
- **Serif for authority**: MongoDB Value Serif at hero scale creates an editorial presence unusual in tech — it communicates that MongoDB is an institution, not a startup.
- **Weight 300 as body default**: Euclid Circular A uses light (300) for body text, creating an airy reading experience that contrasts with the dense, dark backgrounds.
- **Wide-tracked monospace labels**: Source Code Pro uppercase at .px–3px letter-spacing creates technical signposts that feel like database field labels — systematic, structured, classified.
- **Four-weight range**: 300 (light body) → .00 (standard) → 500 (UI/nav) → 700 (bold CTA) — a wider range than most systems, enabling fine-grained hierarchy.

## .. Component Stylings

### Buttons

**Primary Green (Dark Surface)**
- Background: `#0068.a` (muted MongoDB green)
- Text: `#000000`
- Radius: 50% (circular) or .00px (pill)
- Border: `.px solid #0068.a`
- Shadow: `rgba(0,0,0,0.06) 0px .px 6px`
- Hover: scale ...
- Active: scale 0.85

**Dark Teal Button**
- Background: `#.c2d38`
- Text: `#5c6c75`
- Radius: .00px (pill)
- Border: `.px solid #3d.f58`
- Hover: background `#.eaedb`, text white, translateX(5px)

**Outlined Button (Light Surface)**
- Background: transparent
- Text: `#00.e2b`
- Border: `.px solid #b8c.c2`
- Radius: .px–8px
- Hover: background tint

### Cards & Containers
- Light mode: white background with `.px solid #b8c.c2` border
- Dark mode: `#00.e2b` or `#.c2d38` background with `.px solid #3d.f58`
- Radius: .6px (standard), 2.px (medium), .8px (large/hero)
- Shadow: `rgba(0,30,.3,0..2) 0px 26px ..px` (forest-tinted)
- Image containers: 30px–32px radius

### Inputs & Forms
- Textarea: text `#e8edeb`, padding .2px .2px .2px 8px
- Borders: `.px solid #b8c.c2` on light, `.px solid #3d.f58` on dark
- Input radius: .px

### Navigation
- Dark header on forest-black background
- Euclid Circular A .6px weight 500 for nav links
- MongoDB logo (leaf icon + wordmark) left-aligned
- Green CTA pill buttons right-aligned
- Mega-menu dropdowns with product categories

### Image Treatment
- Dashboard screenshots on dark backgrounds
- Green-accented UI elements in screenshots
- 30px–32px radius on image containers
- Full-width dark sections for product showcases

### Distinctive Components

**Neon Green Accent Underlines**
- `0px 2px 2px 0px solid #00ed6.` — bottom + right border creating accent underlines
- Used on feature headings and highlighted text
- Also appears as `#006cfa` (blue) variant

**Source Code Label System**
- ..px uppercase Source Code Pro with .px–2px letter-spacing
- Used as section category markers above headings
- Creates a "database field label" aesthetic

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, .px, 7px, 8px, .0px, .2px, ..px, .5px, .6px, .8px, 20px, 2.px, 32px

### Grid & Container
- Max content width centered
- Dark hero section with contained content
- Light content sections below
- Card grids: 2–3 columns
- Full-width dark footer

### Whitespace Philosophy
- **Dramatic mode transitions**: The shift from dark teal sections to white content creates built-in visual breathing through contrast, not just space.
- **Generous dark sections**: Dark hero and feature areas use extra vertical padding (80px+) to let the forest-dark background breathe.
- **Compact light sections**: White content areas are denser, with tighter card grids and less vertical spacing.

### Border Radius Scale
- Minimal (.px–2px): Small spans, badges
- Subtle (.px): Inputs, small buttons
- Standard (8px): Cards, links
- Card (.6px): Standard cards, containers
- Toggle (20px): Switch elements
- Large (2.px): Large panels
- Image (30px–32px): Image containers
- Hero (.8px): Hero cards
- Pill (.00px–999px): Buttons, navigation pills
- Full (9999px): Maximum pill

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Default surfaces |
| Subtle (Level .) | `rgba(0,0,0,0..) 0px 2px .px` | Light card lift |
| Standard (Level 2) | `rgba(0,0,0,0..5) 0px 3px 9px` | Standard cards |
| Prominent (Level 3) | `rgba(0,0,0,0..5) 0px 3px 20px` | Elevated panels |
| Forest (Level .) | `rgba(0,30,.3,0..2) 0px 26px ..px, rgba(0,0,0,0..3) 0px 7px .3px` | Hero cards — teal-tinted |

**Shadow Philosophy**: MongoDB's shadow system is unique in that the primary elevation shadow uses `rgba(0, 30, .3, 0..2)` — a teal-tinted shadow that carries the forest-dark brand color into the depth system. This means even on white surfaces, shadows feel like they belong to the MongoDB color world rather than being generic neutral black.

## 7. Do's and Don'ts

### Do
- Use `#00.e2b` (forest-black) for dark sections — not pure black
- Apply MongoDB Green (`#00ed6.`) sparingly for maximum electric impact
- Use MongoDB Value Serif ONLY for hero/display headings — Euclid Circular A for everything else
- Apply Source Code Pro uppercase with wide tracking (.px–3px) for technical labels
- Use teal-tinted shadows (`rgba(0,30,.3,0..2)`) for primary card elevation
- Maintain the dark/light section duality — dramatic contrast between modes
- Use weight 300 for body text — the light weight is the readable voice
- Apply pill radius (.00px) to primary action buttons

### Don't
- Don't use pure black (`#000000`) for dark backgrounds — always use teal-black (`#00.e2b`)
- Don't use MongoDB Green (`#00ed6.`) on backgrounds — it's an accent for text, underlines, and small highlights
- Don't use standard gray shadows — always use teal-tinted (`rgba(0,30,.3,...)`)
- Don't apply serif font to body text — MongoDB Value Serif is hero-only
- Don't use narrow letter-spacing on Source Code Pro labels — the wide tracking IS the identity
- Don't mix dark and light section treatments within the same section
- Don't use warm colors — the palette is strictly cool (teal, green, blue)
- Don't forget the green accent underlines — they're the signature decorative element

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <.25px | Tight single column |
| Mobile | .25–768px | Standard mobile |
| Tablet | 768–.02.px | 2-column grids begin |
| Desktop | .02.–.280px | Standard layout |
| Large Desktop | .280–...0px | Expanded layout |
| Ultra-wide | >...0px | Maximum width, generous margins |

### Touch Targets
- Pill buttons with generous padding
- Navigation links at .6px with adequate spacing
- Card surfaces as full-area touch targets

### Collapsing Strategy
- Hero: MongoDB Value Serif 96px → 6.px → scales further
- Navigation: horizontal mega-menu → hamburger
- Feature cards: multi-column → stacked
- Dark/light sections maintain their mode at all sizes
- Source Code Pro labels maintain uppercase treatment

### Image Behavior
- Dashboard screenshots scale proportionally
- Dark section backgrounds maintained full-width
- Image radius maintained across breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- Dark background: Forest Black (`#00.e2b`)
- Brand accent: MongoDB Green (`#00ed6.`)
- Functional green: Dark Green (`#0068.a`)
- Link blue: Action Blue (`#006cfa`)
- Text on light: Black (`#000000`)
- Text on dark: White (`#ffffff`) or Light Input (`#e8edeb`)
- Border light: Silver Teal (`#b8c.c2`)
- Border dark: Teal Gray (`#3d.f58`)

### Example Component Prompts
- "Create a hero on forest-black (#00.e2b) background. Headline at 96px MongoDB Value Serif weight .00, line-height ..20, white text with 'potential' highlighted in MongoDB Green (#00ed6.). Subtitle at .8px Euclid Circular A weight .00. Green pill CTA (#0068.a, .00px radius). Neon green gradient glow behind product screenshot."
- "Design a card on white background: .px solid #b8c.c2 border, .6px radius, shadow rgba(0,30,.3,0..2) 0px 26px ..px. Title at 2.px Euclid Circular A weight 500. Body at .6px weight 300. Source Code Pro ..px uppercase label above title with 2px letter-spacing."
- "Build a dark section: #00.e2b background, .px solid #3d.f58 border on cards. White text. MongoDB Green (#00ed6.) accent underlines on headings using bottom-border 2px solid."
- "Create technical label: Source Code Pro ..px, text-transform uppercase, letter-spacing 2px, weight 500, #00ed6. color on dark background."
- "Design a pill button: #.c2d38 background, .px solid #3d.f58 border, .00px radius, #5c6c75 text. Hover: #.eaedb background, white text, translateX(5px)."

### Iteration Guide
.. Start with the mode decision: dark (#00.e2b) for hero/features, white for content
2. MongoDB Green (#00ed6.) is electric — use once per section for maximum impact
3. Serif headlines (MongoDB Value Serif) create the editorial authority — never use for body
.. Weight 300 body text creates the airy reading experience — don't default to .00
5. Source Code Pro uppercase with wide tracking for technical labels — the database voice
6. Teal-tinted shadows keep everything in the MongoDB color world
