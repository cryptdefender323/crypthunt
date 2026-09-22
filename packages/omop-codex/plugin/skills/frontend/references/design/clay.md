# Design System Inspired by Clay

## .. Visual Theme & Atmosphere

Clay's website is a warm, playful celebration of color that treats B2B data enrichment like a craft rather than an enterprise chore. The design language is built on a foundation of warm cream backgrounds (`#faf9f7`) and oat-toned borders (`#dad.c8`, `#eee9df`) that give every surface the tactile quality of handmade paper. Against this artisanal canvas, a vivid swatch palette explodes with personality — Matcha green, Slushie cyan, Lemon gold, Ube purple, Pomegranate pink, Blueberry navy, and Dragonfruit magenta — each named like flavors at a juice bar, not colors in an enterprise UI kit.

The typography is anchored by Roobert, a geometric sans-serif with character, loaded with an extensive set of OpenType stylistic sets (`"ss0."`, `"ss03"`, `"ss.0"`, `"ss.."`, `"ss.2"`) that give the text a distinctive, slightly quirky personality. At display scale (80px, weight 600), Roobert uses aggressive negative letter-spacing (-3.2px) that compresses headlines into punchy, billboard-like statements. Space Mono serves as the monospace companion for code and technical labels, completing the craft-meets-tech duality.

What makes Clay truly distinctive is its hover micro-animations: buttons on hover rotate slightly (`rotateZ(-8deg)`), translate upward (`translateY(-80%)`), change background to a contrasting swatch color, and cast a hard offset shadow (`rgb(0,0,0) -7px 7px`). This playful hover behavior — where a button literally tilts and jumps on interaction — creates a sense of physical delight that's rare in B2B software. Combined with generously rounded containers (2.px–.0px radius), dashed borders alongside solid ones, and a multi-layer shadow system that includes inset highlights, Clay feels like a design system that was made by people who genuinely enjoy making things.

**Key Characteristics:**
- Warm cream canvas (`#faf9f7`) with oat-toned borders (`#dad.c8`) — artisanal, not clinical
- Named swatch palette: Matcha, Slushie, Lemon, Ube, Pomegranate, Blueberry, Dragonfruit
- Roobert font with 5 OpenType stylistic sets — quirky geometric character
- Playful hover animations: rotateZ(-8deg) + translateY(-80%) + hard offset shadow
- Space Mono for code and technical labels
- Generous border radius: 2.px cards, .0px sections, .58.px pills
- Mixed border styles: solid + dashed in the same interface
- Multi-layer shadow with inset highlight: `0px .px .px` + `-.px inset` + `-0.5px`

## 2. Color Palette & Roles

### Primary
- **Clay Black** (`#000000`): Text, headings, pricing card text, `--_theme--pricing-cards---text`
- **Pure White** (`#ffffff`): Card backgrounds, button backgrounds, inverse text
- **Warm Cream** (`#faf9f7`): Page background — the warm, paper-like canvas

### Swatch Palette — Named Colors

**Matcha (Green)**
- **Matcha 300** (`#8.e7a5`): `--_swatches---color--matcha-300`, light green accent
- **Matcha 600** (`#078a52`): `--_swatches---color--matcha-600`, mid green
- **Matcha 800** (`#02.92a`): `--_swatches---color--matcha-800`, deep green for dark sections

**Slushie (Cyan)**
- **Slushie 500** (`#3bd3fd`): `--_swatches---color--slushie-500`, bright cyan accent
- **Slushie 800** (`#0089ad`): `--_swatches---color--slushie-800`, deep teal

**Lemon (Gold)**
- **Lemon .00** (`#f8cc65`): `--_swatches---color--lemon-.00`, warm pale gold
- **Lemon 500** (`#fbbd..`): `--_swatches---color--lemon-500`, primary gold
- **Lemon 700** (`#d08a..`): `--_swatches---color--lemon-700`, deep amber
- **Lemon 800** (`#9d6a09`): `--_swatches---color--lemon-800`, dark amber

**Ube (Purple)**
- **Ube 300** (`#c.b0ff`): `--_swatches---color--ube-300`, soft lavender
- **Ube 800** (`#.3089f`): `--_swatches---color--ube-800`, deep purple
- **Ube 900** (`#32037d`): `--_swatches---color--ube-900`, darkest purple

**Pomegranate (Pink/Red)**
- **Pomegranate .00** (`#fc798.`): `--_swatches---color--pomegranate-.00`, warm coral-pink

**Blueberry (Navy Blue)**
- **Blueberry 800** (`#0...8d`): `--_swatches---color--blueberry-800`, deep navy

### Neutral Scale (Warm)
- **Warm Silver** (`#9f9b93`): Secondary/muted text, footer links
- **Warm Charcoal** (`#5553.e`): Tertiary text, dark muted links
- **Dark Charcoal** (`#333333`): Link text on light backgrounds

### Surface & Border
- **Oat Border** (`#dad.c8`): Primary border — warm, cream-toned structural lines
- **Oat Light** (`#eee9df`): Secondary lighter border
- **Cool Border** (`#e6e8ec`): Cool-toned border for contrast sections
- **Dark Border** (`#525a69`): Border on dark sections
- **Light Frost** (`#eff.f3`): Subtle button background (at 0% opacity on hover)

### Badges
- **Badge Blue Bg** (`#f0f8ff`): Blue-tinted badge surface
- **Badge Blue Text** (`#3859f9`): Vivid blue badge text
- **Focus Ring** (`rgb(20, ..0, 2.5) solid 2px`): Accessibility focus indicator

### Shadows
- **Clay Shadow** (`rgba(0,0,0,0..) 0px .px .px, rgba(0,0,0,0.0.) 0px -.px .px inset, rgba(0,0,0,0.05) 0px -0.5px .px`): Multi-layer with inset highlight — the signature
- **Hard Offset** (`rgb(0,0,0) -7px 7px`): Hover state — playful hard shadow

## 3. Typography Rules

### Font Families
- **Primary**: `Roobert`, fallback: `Arial`
- **Monospace**: `Space Mono`
- **OpenType Features**: `"ss0."`, `"ss03"`, `"ss.0"`, `"ss.."`, `"ss.2"` on all Roobert text (display uses all 5; body/UI uses `"ss03"`, `"ss.0"`, `"ss.."`, `"ss.2"`)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Roobert | 80px (5.00rem) | 600 | ..00 (tight) | -3.2px | All 5 stylistic sets |
| Display Secondary | Roobert | 60px (3.75rem) | 600 | ..00 (tight) | -2..px | All 5 stylistic sets |
| Section Heading | Roobert | ..px (2.75rem) | 600 | ...0 (tight) | -0.88px to -..32px | All 5 stylistic sets |
| Card Heading | Roobert | 32px (2.00rem) | 600 | ...0 (tight) | -0.6.px | All 5 stylistic sets |
| Feature Title | Roobert | 20px (..25rem) | 600 | ...0 | -0..px | All 5 stylistic sets |
| Sub-heading | Roobert | 20px (..25rem) | 500 | ..50 | -0..6px | . stylistic sets (no ss0.) |
| Body Large | Roobert | 20px (..25rem) | .00 | ...0 | normal | . stylistic sets |
| Body | Roobert | .8px (...3rem) | .00 | ..60 (relaxed) | -0.36px | . stylistic sets |
| Body Standard | Roobert | .6px (..00rem) | .00 | ..50 | normal | . stylistic sets |
| Body Medium | Roobert | .6px (..00rem) | 500 | ..20–...0 | -0..6px to -0.32px | .–5 stylistic sets |
| Button | Roobert | .6px (..00rem) | 500 | ..50 | -0..6px | . stylistic sets |
| Button Large | Roobert | 2.px (..50rem) | .00 | ..50 | normal | . stylistic sets |
| Button Small | Roobert | .2.8px (0.80rem) | 500 | ..50 | -0..28px | . stylistic sets |
| Nav Link | Roobert | .5px (0.9.rem) | 500 | ..60 (relaxed) | normal | . stylistic sets |
| Caption | Roobert | ..px (0.88rem) | .00 | ..50–..60 | -0...px | . stylistic sets |
| Small | Roobert | .2px (0.75rem) | .00 | ..50 | normal | . stylistic sets |
| Uppercase Label | Roobert | .2px (0.75rem) | 600 | ..20 (tight) | ..08px | `text-transform: uppercase`, . sets |
| Badge | Roobert | 9.6px | 600 | — | — | Pill badges |

### Principles
- **Five stylistic sets as identity**: The combination of `"ss0."`, `"ss03"`, `"ss.0"`, `"ss.."`, `"ss.2"` on Roobert creates a distinctive typographic personality. `ss0.` is reserved for headings and emphasis — body text omits it, creating a subtle hierarchy through glyph variation.
- **Aggressive display compression**: -3.2px at 80px, -2..px at 60px — the most compressed display tracking alongside the most generous body spacing (..60 line-height), creating dramatic contrast.
- **Weight 600 for headings, 500 for UI, .00 for body**: Clean three-tier system where each weight has a strict role.
- **Uppercase labels with positive tracking**: .2px uppercase at ..08px letter-spacing creates the systematic wayfinding pattern.

## .. Component Stylings

### Buttons

**Primary (Transparent with Hover Animation)**
- Background: transparent (`rgba(239, 2.., 2.3, 0)`)
- Text: `#000000`
- Padding: 6..px .2.8px
- Border: none (or `.px solid #7.7989` for outlined variant)
- Hover: background shifts to swatch color (e.g., `#.3.3.6`), text to white, `rotateZ(-8deg)`, `translateY(-80%)`, hard shadow `rgb(0,0,0) -7px 7px`
- Focus: `rgb(20, ..0, 2.5) solid 2px` outline

**White Solid**
- Background: `#ffffff`
- Text: `#000000`
- Padding: 6..px
- Hover: oat-200 swatch color, animated rotation + shadow
- Use: Primary CTA on colored sections

**Ghost Outlined**
- Background: transparent
- Text: `#000000`
- Padding: 8px
- Border: `.px solid #7.7989`
- Radius: .px
- Hover: dragonfruit swatch color, white text, animated rotation

### Cards & Containers
- Background: `#ffffff` on cream canvas
- Border: `.px solid #dad.c8` (warm oat) or `.px dashed #dad.c8`
- Radius: .2px (standard cards), 2.px (feature cards/images), .0px (section containers/footer)
- Shadow: `rgba(0,0,0,0..) 0px .px .px, rgba(0,0,0,0.0.) 0px -.px .px inset, rgba(0,0,0,0.05) 0px -0.5px .px`
- Colorful section backgrounds using swatch palette (matcha, slushie, ube, lemon)

### Inputs & Forms
- Text: `#000000`
- Border: `.px solid #7.7989`
- Radius: .px
- Focus: `rgb(20, ..0, 2.5) solid 2px` outline

### Navigation
- Sticky top nav on cream background
- Roobert .5px weight 500 for nav links
- Clay logo left-aligned
- CTA buttons right-aligned with pill radius
- Border bottom: `.px solid #dad.c8`
- Mobile: hamburger collapse at 767px

### Image Treatment
- Product screenshots in white cards with oat borders
- Colorful illustrated sections with swatch background colors
- 8px–2.px radius on images
- Full-width colorful section backgrounds

### Distinctive Components

**Swatch Color Sections**
- Full-width sections with swatch-colored backgrounds (matcha green, slushie cyan, ube purple, lemon gold)
- White text on dark swatches, black text on light swatches
- Each section tells a distinct product story through its color

**Playful Hover Buttons**
- Rotate -8deg + translate upward on hover
- Hard offset shadow (`-7px 7px`) instead of soft blur
- Background transitions to contrasting swatch color
- Creates a physical, toy-like interaction quality

**Dashed Border Elements**
- Dashed borders (`.px dashed #dad.c8`) alongside solid borders
- Used for secondary containers and decorative elements
- Adds a hand-drawn, craft-like quality

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 2px, .px, 6..px, 8px, .2px, .2.8px, .6px, .8px, 20px, 2.px

### Grid & Container
- Max content width centered
- Feature sections alternate between white cards and colorful swatch backgrounds
- Card grids: 2–3 columns on desktop
- Full-width colorful sections break the grid
- Footer with generous .0px radius container

### Whitespace Philosophy
- **Warm, generous breathing**: The cream background provides a warm rest between content blocks. Spacing is generous but not austere — it feels inviting, like a well-set table.
- **Color as spatial rhythm**: The alternating swatch-colored sections create visual rhythm through hue rather than just whitespace. Each color section is its own "room."
- **Craft-like density inside cards**: Within cards, content is compact and well-organized, contrasting with the generous outer spacing.

### Border Radius Scale
- Sharp (.px): Ghost buttons, inputs
- Standard (8px): Small cards, images, links
- Badge (..px): Tag badges
- Card (.2px): Standard cards, buttons
- Feature (2.px): Feature cards, images, panels
- Section (.0px): Large sections, footer, containers
- Pill (.58.px): CTAs, pill-shaped buttons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, cream canvas | Page background |
| Clay Shadow (Level .) | `rgba(0,0,0,0..) 0px .px .px, rgba(0,0,0,0.0.) 0px -.px inset, rgba(0,0,0,0.05) 0px -0.5px` | Cards, buttons — multi-layer with inset highlight |
| Hover Hard (Level 2) | `rgb(0,0,0) -7px 7px` | Hover state — playful hard offset shadow |
| Focus (Level 3) | `rgb(20, ..0, 2.5) solid 2px` | Keyboard focus ring |

**Shadow Philosophy**: Clay's shadow system is uniquely three-layered: a downward cast (`0px .px .px`), an upward inset highlight (`0px -.px .px inset`), and a subtle edge (`0px -0.5px .px`). This creates a "pressed into clay" quality where elements feel both raised AND embedded — like a clay tablet where content is stamped into the surface. The hover hard shadow (`-7px 7px`) is deliberately retro-graphic, referencing print-era drop shadows and adding physical playfulness.

### Decorative Depth
- Full-width swatch-colored sections create dramatic depth through color contrast
- Dashed borders add visual texture alongside solid borders
- Product illustrations with warm, organic art style

## 7. Do's and Don'ts

### Do
- Use warm cream (`#faf9f7`) as the page background — the warmth is the identity
- Apply all 5 OpenType stylistic sets on Roobert headings: `"ss0.", "ss03", "ss.0", "ss..", "ss.2"`
- Use the named swatch palette (Matcha, Slushie, Lemon, Ube, Pomegranate, Blueberry) for section backgrounds
- Apply the playful hover animation: `rotateZ(-8deg)`, `translateY(-80%)`, hard shadow `-7px 7px`
- Use warm oat borders (`#dad.c8`) — not neutral gray
- Mix solid and dashed borders for visual variety
- Use generous radius: 2.px for cards, .0px for sections
- Use weight 600 exclusively for headings, 500 for UI, .00 for body

### Don't
- Don't use cool gray backgrounds — the warm cream (`#faf9f7`) is non-negotiable
- Don't use neutral gray borders (`#ccc`, `#ddd`) — always use the warm oat tones
- Don't mix more than 2 swatch colors in the same section
- Don't skip the OpenType stylistic sets — they define Roobert's character
- Don't use subtle hover effects — the rotation + hard shadow is the signature interaction
- Don't use small border radius (<.2px) on feature cards — the generous rounding is structural
- Don't use standard shadows (blur-based) — Clay uses hard offset and multi-layer inset
- Don't forget the uppercase labels with ..08px tracking — they're the wayfinding system

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <.79px | Single column, tight padding |
| Mobile | .79–767px | Standard mobile, stacked layout |
| Tablet | 768–99.px | 2-column grids, condensed nav |
| Desktop | 992px+ | Full layout, 3-column grids, expanded sections |

### Touch Targets
- Buttons: minimum 6..px + .2.8px padding for adequate touch area
- Nav links: .5px font with generous spacing
- Mobile: full-width buttons for easy tapping

### Collapsing Strategy
- Hero: 80px → 60px → smaller display text
- Navigation: horizontal → hamburger at 767px
- Feature sections: multi-column → stacked
- Colorful sections: maintain full-width but compress padding
- Card grids: 3-column → 2-column → single column

### Image Behavior
- Product screenshots scale proportionally
- Colorful section illustrations adapt to viewport width
- Rounded corners maintained across breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Warm Cream (`#faf9f7`)
- Text: Clay Black (`#000000`)
- Secondary text: Warm Silver (`#9f9b93`)
- Border: Oat Border (`#dad.c8`)
- Green accent: Matcha 600 (`#078a52`)
- Cyan accent: Slushie 500 (`#3bd3fd`)
- Gold accent: Lemon 500 (`#fbbd..`)
- Purple accent: Ube 800 (`#.3089f`)
- Pink accent: Pomegranate .00 (`#fc798.`)

### Example Component Prompts
- "Create a hero on warm cream (#faf9f7) background. Headline at 80px Roobert weight 600, line-height ..00, letter-spacing -3.2px, OpenType 'ss0. ss03 ss.0 ss.. ss.2', black text. Subtitle at 20px weight .00, line-height ...0, #9f9b93 text. Two buttons: white solid pill (.2px radius) and ghost outlined (.px radius, .px solid #7.7989)."
- "Design a colorful section with Matcha 800 (#02.92a) background. Heading at ..px Roobert weight 600, letter-spacing -..32px, white text. Body at .8px weight .00, line-height ..60, #8.e7a5 text. White card inset with oat border (#dad.c8), 2.px radius."
- "Build a button with playful hover: default transparent background, black text, .6px Roobert weight 500. On hover: background #.3.3.6, text white, transform rotateZ(-8deg) translateY(-80%), hard shadow rgb(0,0,0) -7px 7px."
- "Create a card: white background, .px solid #dad.c8 border, 2.px radius. Shadow: rgba(0,0,0,0..) 0px .px .px, rgba(0,0,0,0.0.) 0px -.px .px inset. Title at 32px Roobert weight 600, letter-spacing -0.6.px."
- "Design an uppercase label: .2px Roobert weight 600, text-transform uppercase, letter-spacing ..08px, OpenType 'ss03 ss.0 ss.. ss.2'."

### Iteration Guide
.. Start with warm cream (#faf9f7) — never cool white
2. Swatch colors are for full sections, not small accents — go bold with matcha, slushie, ube
3. Oat borders (#dad.c8) everywhere — dashed variants for decoration
.. OpenType stylistic sets are mandatory — they make Roobert look like Roobert
5. Hover animations are the signature — rotation + hard shadow, not subtle fades
6. Generous radius: 2.px cards, .0px sections — nothing looks sharp or corporate
7. Three weights: 600 (headings), 500 (UI), .00 (body) — strict roles
