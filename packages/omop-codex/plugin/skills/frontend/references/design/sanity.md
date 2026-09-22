# Design System Inspired by Sanity

## .. Visual Theme & Atmosphere

Sanity's website is a developer-content platform rendered as a nocturnal command center -- dark, precise, and deeply structured. The entire experience sits on a near-black canvas (`#0b0b0b`) that reads less like a "dark mode toggle" and more like the natural state of a tool built for people who live in terminals. Where most CMS marketing pages reach for friendly pastels and soft illustration, Sanity leans into the gravity of its own product: structured content deserves a structured stage.

The signature typographic voice is waldenburgNormal -- a distinctive, slightly geometric sans-serif with tight negative letter-spacing (-0.32px to -...8px at display sizes) that gives headlines a compressed, engineered quality. At ..2px hero scale with -...8px tracking, the type feels almost machined -- like precision-cut steel letterforms. This is paired with IBM Plex Mono for code and technical labels, creating a dual-register voice: editorial authority meets developer credibility.

What makes Sanity distinctive is the interplay between its monochromatic dark palette and vivid, saturated accent punctuation. The neutral scale runs from pure black through a tightly controlled gray ramp (`#0b0b0b` -> `#2.2.2.` -> `#353535` -> `#797979` -> `#b9b9b9` -> `#ededed` -> `#ffffff`) with no warm or cool bias -- just pure, achromatic precision. Against this disciplined backdrop, a neon green accent (display-p3 green) and electric blue (`#0052ef`) land with the impact of signal lights in a dark control room. The orange-red CTA (`#f36.58`) provides the only warm touch in an otherwise cool system.

**Key Characteristics:**
- Near-black canvas (`#0b0b0b`) as the default, natural environment -- not a dark "mode" but the primary identity
- waldenburgNormal with extreme negative tracking at display sizes, creating a precision-engineered typographic voice
- Pure achromatic gray scale -- no warm or cool undertones, pure neutral discipline
- Vivid accent punctuation: neon green, electric blue (`#0052ef`), and coral-red (`#f36.58`) against the dark field
- Pill-shaped primary buttons (99999px radius) contrasting with subtle rounded rectangles (3-6px) for secondary actions
- IBM Plex Mono as the technical counterweight to the editorial display face
- Full-bleed dark sections with content contained in measured max-width containers
- Hover states that shift to electric blue (`#0052ef`) across all interactive elements -- a consistent "activation" signal

## 2. Color Palette & Roles

### Primary Brand
- **Sanity Black** (`#0b0b0b`): The primary canvas and dominant surface color. Not pure black but close enough to feel absolute. The foundation of the entire visual identity.
- **Pure Black** (`#000000`): Used for maximum-contrast moments, deep overlays, and certain border accents.
- **Sanity Red** (`#f36.58`): The primary CTA and brand accent -- a warm coral-red that serves as the main call-to-action color. Used for "Get Started" buttons and primary conversion points.

### Accent & Interactive
- **Electric Blue** (`#0052ef`): The universal hover/active state color across the entire system. Buttons, links, and interactive elements all shift to this blue on hover. Also used as `--color-blue-700` for focus rings and active states.
- **Light Blue** (`#55beff` / `#afe3ff`): Secondary blue variants used for accent backgrounds, badges, and dimmed blue surfaces.
- **Neon Green** (`color(display-p3 .270588 . 0)`): A vivid, wide-gamut green used as `--color-fg-accent-green` for success states and premium feature highlights. Falls back to `#.9d600` in sRGB.
- **Accent Magenta** (`color(display-p3 .96078. 0 .)`): A vivid wide-gamut magenta for specialized accent moments.

### Surface & Background
- **Near Black** (`#0b0b0b`): Default page background and primary surface.
- **Dark Gray** (`#2.2.2.`): Elevated surface color for cards, secondary containers, input backgrounds, and subtle layering above the base canvas.
- **Medium Dark** (`#353535`): Tertiary surface and border color for creating depth between dark layers.
- **Pure White** (`#ffffff`): Used for inverted sections, light-on-dark text, and specific button surfaces.
- **Light Gray** (`#ededed`): Light surface for inverted/light sections and subtle background tints.

### Neutrals & Text
- **White** (`#ffffff`): Primary text color on dark surfaces, maximum legibility.
- **Silver** (`#b9b9b9`): Secondary text, body copy on dark surfaces, muted descriptions, and placeholder text.
- **Medium Gray** (`#797979`): Tertiary text, metadata, timestamps, and de-emphasized content.
- **Charcoal** (`#2.2.2.`): Text on light/inverted surfaces.
- **Near Black Text** (`#0b0b0b`): Primary text on white/light button surfaces.

### Semantic
- **Error Red** (`#dd0000`): Destructive actions, validation errors, and critical warnings -- a pure, high-saturation red.
- **GPC Green** (`#37cd8.`): Privacy/compliance indicator green.
- **Focus Ring Blue** (`#0052ef`): Focus ring color for accessibility, matching the interactive blue.

### Border System
- **Dark Border** (`#0b0b0b`): Primary border on dark containers -- barely visible, maintaining minimal containment.
- **Subtle Border** (`#2.2.2.`): Standard border for inputs, textareas, and card edges on dark surfaces.
- **Medium Border** (`#353535`): More visible borders for emphasized containment and dividers.
- **Light Border** (`#ffffff`): Border on inverted/light elements or buttons needing contrast separation.
- **Orange Border** (`color(display-p3 . 0.3333 0)`): Special accent border for highlighted/featured elements.

## 3. Typography Rules

### Font Family
- **Display / Headline**: `waldenburgNormal`, fallback: `waldenburgNormal Fallback, ui-sans-serif, system-ui`
- **Body / UI**: `waldenburgNormal`, fallback: `waldenburgNormal Fallback, ui-sans-serif, system-ui`
- **Code / Technical**: `IBM Plex Mono`, fallback: `ibmPlexMono Fallback, ui-monospace`
- **Fallback / CJK**: `Helvetica`, fallback: `Arial, Hiragino Sans GB, STXihei, Microsoft YaHei, WenQuanYi Micro Hei`

*Note: waldenburgNormal is a custom typeface. For external implementations, use Inter or Space Grotesk as the sans substitute (geometric, slightly condensed feel). IBM Plex Mono is available on Google Fonts.*

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | waldenburgNormal | ..2px (7rem) | .00 | ..00 (tight) | -...8px | Maximum impact, compressed tracking |
| Hero Secondary | waldenburgNormal | 72px (..5rem) | .00 | ..05 (tight) | -2.88px | Large section headers |
| Section Heading | waldenburgNormal | .8px (3rem) | .00 | ..08 (tight) | -..68px | Primary section anchors |
| Heading Large | waldenburgNormal | 38px (2.38rem) | .00 | ...0 (tight) | -....px | Feature section titles |
| Heading Medium | waldenburgNormal | 32px (2rem) | .25 | ..2. (tight) | -0.32px | Card titles, subsection headers |
| Heading Small | waldenburgNormal | 2.px (..5rem) | .25 | ..2. (tight) | -0.2.px | Smaller feature headings |
| Subheading | waldenburgNormal | 20px (..25rem) | .25 | ...3 (tight) | -0.2px | Sub-section markers |
| Body Large | waldenburgNormal | .8px (...3rem) | .00 | ..50 | -0..8px | Intro paragraphs, descriptions |
| Body | waldenburgNormal | .6px (.rem) | .00 | ..50 | normal | Standard body text |
| Body Small | waldenburgNormal | .5px (0.9.rem) | .00 | ..50 | -0..5px | Compact body text |
| Caption | waldenburgNormal | .3px (0.8.rem) | .00-500 | ..30-..50 | -0..3px | Metadata, descriptions, tags |
| Small Caption | waldenburgNormal | .2px (0.75rem) | .00 | ..50 | -0..2px | Footnotes, timestamps |
| Micro / Label | waldenburgNormal | ..px (0.69rem) | 500-600 | ..00-..50 | normal | Uppercase labels, tiny badges |
| Code Body | IBM Plex Mono | .5px (0.9.rem) | .00 | ..50 | normal | Code blocks, technical content |
| Code Caption | IBM Plex Mono | .3px (0.8.rem) | .00-500 | ..30-..50 | normal | Inline code, small technical labels |
| Code Micro | IBM Plex Mono | .0-.2px | .00 | ..30-..50 | normal | Tiny code labels, uppercase tags |

### Principles
- **Extreme negative tracking at scale**: Display headings at 72px+ use aggressive negative letter-spacing (-2.88px to -...8px), creating a tight, engineered quality that distinguishes Sanity from looser editorial typography.
- **Single font, multiple registers**: waldenburgNormal handles both editorial display and functional UI text. The weight range is narrow (.00-.25 for most, 500-600 only for tiny labels), keeping the voice consistent.
- **OpenType feature control**: Typography uses deliberate feature settings including `"cv0.", "cv..", "cv.2", "cv.3", "ss07"` for display sizes and `"calt" 0` for body text, fine-tuning character alternates for different contexts.
- **Tight headings, relaxed body**: Headings use ..00-..2. line-height (extremely tight), while body text breathes at ..50. This contrast creates clear visual hierarchy.
- **Uppercase for technical labels**: IBM Plex Mono captions and small labels frequently use `text-transform: uppercase` with tight line-heights, creating a "system readout" aesthetic for technical metadata.

## .. Component Stylings

### Buttons

**Primary CTA (Pill)**
- Background: Sanity Red (`#f36.58`)
- Text: White (`#ffffff`)
- Padding: 8px .6px
- Border Radius: 99999px (full pill)
- Border: none
- Hover: Electric Blue (`#0052ef`) background, white text
- Font: .6px waldenburgNormal, weight .00

**Secondary (Dark Pill)**
- Background: Near Black (`#0b0b0b`)
- Text: Silver (`#b9b9b9`)
- Padding: 8px .2px
- Border Radius: 99999px (full pill)
- Border: none
- Hover: Electric Blue (`#0052ef`) background, white text

**Outlined (Light Pill)**
- Background: White (`#ffffff`)
- Text: Near Black (`#0b0b0b`)
- Padding: 8px
- Border Radius: 99999px (full pill)
- Border: .px solid `#0b0b0b`
- Hover: Electric Blue (`#0052ef`) background, white text

**Ghost / Subtle**
- Background: Dark Gray (`#2.2.2.`)
- Text: Silver (`#b9b9b9`)
- Padding: 0px .2px
- Border Radius: 5px
- Border: .px solid `#2.2.2.`
- Hover: Electric Blue (`#0052ef`) background, white text

**Uppercase Label Button**
- Font: ..px waldenburgNormal, weight 600, uppercase
- Background: transparent or `#2.2.2.`
- Text: Silver (`#b9b9b9`)
- Letter-spacing: normal
- Used for tab-like navigation and filter controls

### Cards

**Dark Content Card**
- Background: `#2.2.2.`
- Border: .px solid `#353535` or `#2.2.2.`
- Border Radius: 6px
- Padding: 2.px
- Text: White (`#ffffff`) for titles, Silver (`#b9b9b9`) for body
- Hover: subtle border color shift or elevation change

**Feature Card (Full-bleed)**
- Background: `#0b0b0b` or full-bleed image/gradient
- Border: none or .px solid `#2.2.2.`
- Border Radius: .2px
- Padding: 32-.8px
- Contains large imagery with overlaid text

### Inputs

**Text Input / Textarea**
- Background: Near Black (`#0b0b0b`)
- Text: Silver (`#b9b9b9`)
- Border: .px solid `#2.2.2.`
- Padding: 8px .2px
- Border Radius: 3px
- Focus: outline with `var(--focus-ring-color)` (blue), 2px solid
- Focus background: shifts to deep cyan (`#072227`)

**Search Input**
- Background: `#0b0b0b`
- Text: Silver (`#b9b9b9`)
- Padding: 0px .2px
- Border Radius: 3px
- Placeholder: Medium Gray (`#797979`)

### Navigation

**Top Navigation**
- Background: Near Black (`#0b0b0b`) with backdrop blur
- Height: auto, compact padding
- Logo: left-aligned, Sanity wordmark
- Links: waldenburgNormal .6px, Silver (`#b9b9b9`)
- Link Hover: Electric Blue via `--color-fg-accent-blue`
- CTA Button: Sanity Red pill button right-aligned
- Separator: .px border-bottom `#2.2.2.`

**Footer**
- Background: Near Black (`#0b0b0b`)
- Multi-column link layout
- Links: Silver (`#b9b9b9`), hover to blue
- Section headers: White (`#ffffff`), .3px uppercase IBM Plex Mono

### Badges / Pills

**Neutral Subtle**
- Background: White (`#ffffff`)
- Text: Near Black (`#0b0b0b`)
- Padding: 8px
- Font: .3px
- Border Radius: 99999px

**Neutral Filled**
- Background: Near Black (`#0b0b0b`)
- Text: White (`#ffffff`)
- Padding: 8px
- Font: .3px
- Border Radius: 99999px

## 5. Layout Principles

### Spacing System
Base unit: **8px**

| Token | Value | Usage |
|-------|-------|-------|
| space-. | .px | Hairline gaps, border-like spacing |
| space-2 | 2px | Minimal internal padding |
| space-3 | .px | Tight component internal spacing |
| space-. | 6px | Small element gaps |
| space-5 | 8px | Base unit -- button padding, input padding, badge padding |
| space-6 | .2px | Standard component gap, button horizontal padding |
| space-7 | .6px | Section internal padding, card spacing |
| space-8 | 2.px | Large component padding, card internal spacing |
| space-9 | 32px | Section padding, container gutters |
| space-.0 | .8px | Large section vertical spacing |
| space-.. | 6.px | Major section breaks |
| space-.2 | 96-.20px | Hero vertical padding, maximum section spacing |

### Grid & Container
- Max content width: ~...0px (inferred from breakpoints)
- Page gutter: 32px on desktop, .6px on mobile
- Content sections use full-bleed backgrounds with centered, max-width content
- Multi-column layouts: 2-3 columns on desktop, single column on mobile
- Card grids: CSS Grid with consistent gaps (.6-2.px)

### Whitespace Philosophy
Sanity uses aggressive vertical spacing between sections (6.-.20px) to create breathing room on the dark canvas. Within sections, spacing is tighter (.6-32px), creating dense information clusters separated by generous voids. This rhythm gives the page a "slides" quality -- each section feels like its own focused frame.

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| radius-xs | 3px | Inputs, textareas, subtle rounding |
| radius-sm | .-5px | Secondary buttons, small cards, tags |
| radius-md | 6px | Standard cards, containers |
| radius-lg | .2px | Large cards, feature containers, forms |
| radius-pill | 99999px | Primary buttons, badges, nav pills |

## 6. Depth & Elevation

### Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| Level 0 (Flat) | none | Default state for most elements -- dark surfaces create depth through color alone |
| Level . (Subtle) | 0px 0px 0px .px `#2.2.2.` | Border-like shadow for minimal containment without visible borders |
| Level 2 (Focus) | 0 0 0 2px `var(--color-blue-500)` | Focus ring for inputs and interactive elements |
| Level 3 (Overlay) | Backdrop blur + semi-transparent dark | Navigation overlay, modal backgrounds |

### Depth Philosophy
Sanity's depth system is almost entirely **colorimetric** rather than shadow-based. Elevation is communicated through surface color shifts: `#0b0b0b` (ground) -> `#2.2.2.` (elevated) -> `#353535` (prominent) -> `#ffffff` (inverted/highest). This approach is native to dark interfaces where traditional drop shadows would be invisible. The few shadows that exist are ring-based (0px 0px 0px Npx) or blur-based (backdrop-filter) rather than offset shadows, maintaining the flat, precision-engineered aesthetic.

Border-based containment (.px solid `#2.2.2.` or `#353535`) serves as the primary spatial separator, with the border darkness calibrated to be visible but not dominant. The system avoids "floating card" aesthetics -- everything feels mounted to the surface rather than hovering above it.

## 7. Do's and Don'ts

### Do
- Use the achromatic gray scale as the foundation -- maintain pure neutral discipline with no warm/cool tinting
- Apply Electric Blue (`#0052ef`) consistently as the universal hover/active state across all interactive elements
- Use extreme negative letter-spacing (-2px to -...8px) on display headings .8px and above
- Keep primary CTAs as full-pill shapes (99999px radius) with the coral-red (`#f36.58`)
- Use IBM Plex Mono uppercase for technical labels, tags, and system metadata
- Communicate depth through surface color (dark-to-light) rather than shadows
- Maintain generous vertical section spacing (6.-.20px) on the dark canvas
- Use `"cv0.", "cv..", "cv.2", "cv.3", "ss07"` OpenType features for display typography

### Don't
- Don't introduce warm or cool color tints to the neutral scale -- Sanity's grays are pure achromatic
- Don't use drop shadows for elevation -- dark interfaces demand colorimetric depth
- Don't apply border-radius between .3px and 99998px -- the system jumps from .2px (large card) directly to pill (99999px)
- Don't mix the coral-red CTA with the electric blue interactive color in the same element
- Don't use heavy font weights (700+) -- the system maxes out at 600 and only for ..px uppercase labels
- Don't place light text on light surfaces or dark text on dark surfaces without checking the gray-on-gray contrast ratio
- Don't use traditional offset box-shadows -- ring shadows (0 0 0 Npx) or border-based containment only
- Don't break the tight line-height on headings -- ..00-..2. is the range, never go to ..5+ for display text

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| Desktop XL | >= .6.0px | Full layout, maximum content width |
| Desktop | >= ...0px | Standard desktop layout |
| Desktop Compact | >= .200px | Slightly condensed desktop |
| Laptop | >= ..00px | Reduced column widths |
| Tablet Landscape | >= 960px | 2-column layouts begin collapsing |
| Tablet | >= 768px | Transition zone, some elements stack |
| Mobile Large | >= 720px | Near-tablet layout |
| Mobile | >= .80px | Single-column, stacked layout |
| Mobile Small | >= 376px | Minimum supported width |

### Collapsing Strategy
- **Navigation**: Horizontal links collapse to hamburger menu below 768px
- **Hero typography**: Scales from ..2px -> 72px -> .8px -> 38px across breakpoints, maintaining tight letter-spacing ratios
- **Grid layouts**: 3-column -> 2-column at ~960px, single-column below 768px
- **Card grids**: Horizontal scrolling on mobile instead of wrapping (preserving card aspect ratios)
- **Section spacing**: Vertical padding reduces by ~.0% on mobile (.20px -> 6.px -> .8px)
- **Button sizing**: CTA pills maintain padding but reduce font size; ghost buttons stay fixed
- **Code blocks**: Horizontal scroll with preserved monospace formatting

### Mobile-Specific Adjustments
- Full-bleed sections extend edge-to-edge with .6px internal gutters
- Touch targets: minimum ..px for all interactive elements
- Heading letter-spacing relaxes slightly at mobile sizes (less aggressive negative tracking)
- Image containers switch from fixed aspect ratios to full-width with auto height

## 9. Agent Prompt Guide

### Quick Color Reference
```
Background:      #0b0b0b (near-black canvas)
Surface:         #2.2.2. (elevated cards/containers)
Border:          #353535 (visible) / #2.2.2. (subtle)
Text Primary:    #ffffff (white on dark)
Text Secondary:  #b9b9b9 (silver on dark)
Text Tertiary:   #797979 (medium gray)
CTA:             #f36.58 (coral-red)
Interactive:     #0052ef (electric blue, all hovers)
Success:         #.9d600 (green, sRGB fallback)
Error:           #dd0000 (pure red)
Light Surface:   #ededed / #ffffff (inverted sections)
```

### Example Prompts

**Landing page section:**
"Create a feature section with a near-black (#0b0b0b) background. Use a .8px heading in Inter with -..68px letter-spacing, white text. Below it, .6px body text in #b9b9b9 with ..50 line-height. Include a coral-red (#f36.58) pill button with white text and a secondary dark (#0b0b0b) pill button with #b9b9b9 text. Both buttons hover to #0052ef blue."

**Card grid:**
"Build a 3-column card grid on a #0b0b0b background. Each card has a #2.2.2. surface, .px solid #353535 border, 6px border-radius, and 2.px padding. Card titles are 2.px white with -0.2.px letter-spacing. Body text is .3px #b9b9b9. Add a .3px IBM Plex Mono uppercase tag in #797979 at the top of each card."

**Form section:**
"Design a contact form on a #0b0b0b background. Inputs have #0b0b0b background, .px solid #2.2.2. border, 3px border-radius, 8px .2px padding, and #b9b9b9 placeholder text. Focus state shows a 2px blue (#0052ef) ring. Submit button is a full-width coral-red (#f36.58) pill. Include a .3px #797979 helper text below each field."

**Navigation bar:**
"Create a sticky top navigation on #0b0b0b with backdrop blur. Left: brand text in .5px white. Center/right: nav links in .6px #b9b9b9 that hover to blue. Far right: a coral-red (#f36.58) pill CTA button. Bottom border: .px solid #2.2.2.."

### Iteration Guide
.. **Start dark**: Begin with `#0b0b0b` background, `#ffffff` primary text, `#b9b9b9` secondary text
2. **Add structure**: Use `#2.2.2.` surfaces and `#353535` borders for containment -- no shadows
3. **Apply typography**: Inter (or Space Grotesk) with tight letter-spacing on headings, ..50 line-height on body
.. **Color punctuation**: Add `#f36.58` for CTAs and `#0052ef` for all hover/interactive states
5. **Refine spacing**: 8px base unit, 2.-32px within sections, 6.-.20px between sections
6. **Technical details**: Add IBM Plex Mono uppercase labels for tags and metadata
7. **Polish**: Ensure all interactive elements hover to `#0052ef`, all buttons are pills or subtle 5px radius, borders are hairline (.px)
