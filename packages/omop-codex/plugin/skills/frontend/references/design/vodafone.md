# Design System Inspired by Vodafone

## .. Visual Theme & Atmosphere

Vodafone's corporate web system carries the confident, broadcast-scale presence of a global telecom brand — built around a single, fiercely-owned brand red and a restrained, editorial layout that lets imagery and type carry the emotional weight. Every page opens the same way: a cinematic dark hero image behind a towering, tight-tracked uppercase display headline ("EVERYONE. CONNECTED.", "INVESTORS", "OUR BUSINESS") followed by a deep red full-width band that acts as a chapter break, then a crisp white editorial grid or a near-black section reserved for institutional content (share ticker, global map, ESG data). The voice is institutional but human: warm documentary photography — cable-laying crews, coral reefs, pine forests, urban twilight — photographed with color-graded realism and set against clean neutral surfaces that never compete with the content.

The typography system is the signature. A custom Vodafone display face runs all the way up to ...px in heavy 800-weight uppercase with negative tracking, and it holds that voice consistently across every page template. Body copy sits in a calm .6-.8px mid-weight rhythm. This dual scale — monumental at the top, almost quiet at the bottom — creates the "corporate newsroom" feeling: every page reads like the front of a national paper whose masthead happens to be red.

Surface treatment is disciplined and predictable: a three-surface pass of white (editorial canvas) → Vodafone red (band dividers, CTA buttons, the famous speech-mark logo) → near-black charcoal (footer, share-ticker panel, global-impact map). There is almost no decorative shadow, almost no gradient, and almost no rounded-corner softness. Edges are small and clinical (2px and 6px), buttons operate as a two-tier system — tight 2px rectangles for utility/form actions, and fully-rounded 60px pills for primary content CTAs. This is a design system that trusts the brand color to do the heavy lifting and gets out of its way everywhere else.

**Key Characteristics:**
- Vodafone Red (`#e60000`) is the single dominant accent — used for CTAs, dividers, band sections, the speech-mark logo, and the rotated "IMPACT" brand-mark type on the sustainability map
- Monumental uppercase display type (up to ...px, weight 800, negative letter-spacing) paired with calm .6-.8px body copy
- A universal page rhythm: dark atmospheric hero → monumental uppercase headline → full-width red band → white editorial canvas → dark charcoal institutional panel → charcoal footer
- Two-tier button system: tight 2px-radius rectangles for utility actions, fully-pill 60px buttons for primary content CTAs (both equally primary, selected by context)
- Documentary photography (people, infrastructure, cities, nature) dominates over illustration; no stock-icon noise
- Near-absence of shadows and gradients — hierarchy comes from type weight, color blocks, and spacing rather than elevation
- Deep charcoal surface (`#25282b`) is reused as the footer AND the institutional data panel (share ticker, world map) — a single material for anything formal and numeric

## 2. Color Palette & Roles

### Primary

- **Vodafone Red** (`#e60000`): The brand's single, non-negotiable signature — used for primary CTA backgrounds, the speech-mark logo, full-bleed band dividers between editorial sections, tag-pill outlines, and the rotated brand-mark type that labels the global-impact map. This red must never be substituted or tinted; it is the identity.

### Secondary & Accent

- **Pure White** (`#ffffff`): The dominant editorial canvas — page background, card backgrounds, reversed text on dark or red surfaces, and circular icon-button fills.
- **Signal Blue** (`#3860be`): Reserved for inline text links in their resting state (underlined), providing a calm accessible blue that reads clearly against both white and dark surfaces.
- **Deep Brand Red Shade** (`#ac.8..`): A darker red appears on quiet label chips (notably on the sustainability page) — used sparingly for low-prominence tag elements that need red identity without drawing primary attention.

### Surface & Background

- **Canvas White** (`#ffffff`): The primary page and card surface. Every editorial module sits on this canvas.
- **Light Neutral** (`#f2f2f2`): Used for filled neutral pill-badge backgrounds and quiet UI chrome where full white would disappear against the canvas.
- **Charcoal Institutional Panel** (`#25282b`): The same color used for text is reused as a full-width dark surface for the footer, the share-ticker panel, and the global-impact map section. It transforms the page into a "data mode" environment.
- **Translucent White Overlay** (`rgba(255,255,255,0..)`): A soft glass tint used for pill buttons that sit on dark hero imagery — lets the photo breathe through the button.

### Neutrals & Text

- **Charcoal Headline** (`#25282b`): All heading text on light surfaces and the charcoal surface color itself — a near-black with a faint cool tint, never pure black.
- **Secondary Body Grey** (`#7e7e7e`): Body copy, meta text, and secondary labels — a true mid-grey that reads as unemphatic but still legible.
- **Form Text Grey** (`#333333`): Borders on input-style ghost buttons and the text color inside them.
- **Disabled Grey** (`#bebebe`): Inactive chip text on subtle ghost-style controls.
- **Translucent White Divider** (`rgba(255,255,255,0.25)`): Hairline column dividers on dark institutional panels (footer columns, map legend rows).

### Semantic & Accent

- **Surface Red Band** (`#e60000`): The same brand red deployed as a full-width band between editorial sections — functions as a chapter divider and a visual amplifier for the brand. Appears on every page template.
- **Tag Pill Red Border** (`#e60000`): .px outline on light tag pills, letting the brand color touch small UI without drowning card content.

### Gradient System

Vodafone's design is intentionally gradient-free. The only tonal variation is a subtle photographic vignette on hero imagery (dim coral reefs, pine forests, cable-laying crews, urban twilight), where the image itself — not a CSS gradient — provides the tonal ramp. No linear gradients are used on buttons, cards, or surfaces.

## 3. Typography Rules

### Font Family

- **Primary**: `Vodafone` (custom corporate sans-serif)
- **Fallback stack**: `Vodafone, "Helvetica Neue", Arial, sans-serif`
- **Icon font**: `icomoon` — carries pictograph glyphs at .8px/2.px/.8px fixed sizes
- **Rendering**: `font-smoothing: antialiased` across the board; OpenType features are not aggressively used — the design relies on weight and tracking, not stylistic alternates

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display / Hero XL | ...px | 800 | 0.79 | -.px | Uppercase; the signature "EVERYONE. CONNECTED." treatment |
| Display / Hero L | .26px | 800 | 0.90 | -.px | Uppercase; used when the hero headline is longer |
| Display / Hero M | 90px | 800 | 0.93 | — | Uppercase; secondary hero or full-bleed section heads |
| Display / Impact | 70px | 800 | ...7 | -.px | Sustainability section numeric / callout scale |
| H. — Light | .8px | 300 | ..08 | — | Section headlines set in light weight for editorial calm |
| H. — Bold | .8px | 800 | ..00 | -.px | Institutional data headers (share price on charcoal panel) |
| H2 — Light | .0px | 300 | ...0 | — | Sub-section headers |
| H2 — Bold | .0px | 700 | ...0 | — | Denser sub-section headers |
| H3 — Bold | 32px | 700 | ..25 | — | Card cluster titles and feature intros |
| H. — Bold | 2.px | 700 | ..00 | — | Card titles (news, feature, article modules) |
| H. — Light | 2.px | 300 | ...2 | — | Intro paragraphs on investor / sustainability pages |
| H5 — Bold | 20px | 700 | ..30 | — | Compact module titles and side callouts |
| Lead Body | 20px | .00 | ...0 | — | Introductory paragraphs under large headlines |
| Body Large | .8px | .00 | ..56 | — | Long-form article body and prominent copy |
| Body Bold | .8px | 600 | ..56 | — | Emphasized inline phrases |
| Body Base | .6px | .00 | ..38 | — | Default paragraph size |
| Label Uppercase | .6px | 800 | ..50 | — | Uppercase navigational labels |
| Eyebrow / Date | ..px | .00/700 | ...3 | — | Article date stamps and meta (.. APR 2026) |
| Tag Pill | ..px | 700 | ..50 | — | Badge text inside red-outlined pills |
| Caption Uppercase | ..px | .00 | .... | — | Uppercase meta label |
| Caption | .2px | 500 | 2.00 | — | Footer meta, legal lines |
| Micro Label | .2px | 600 | ..33 | — | Uppercase tiny labels on badges and counters |
| Button Primary | ....px | 700 | ..00 | 0....px | Primary filled button label |
| Button Compact | .2px | 700 | ..00 | 0..2px | Compact button label |

### Principles

- **Dual-scale drama**: the system deliberately stretches from ...px down to 8.5px without mid-range showing off. The result is a clear corporate hierarchy — monumental for brand moments, calm for reading.
- **Uppercase display, mixed-case body**: all the largest display sizes are uppercase with negative tracking, while everything .8px and below is sentence case with normal tracking.
- **Weight spread**: only three real weights do the work — 800 (display), 700 (bold bodies, buttons, tags), and .00 (reading body). A lighter 300-weight is used for editorial-style .0px/.8px headlines when a calmer voice is wanted.
- **No italics, no decorative letterspacing on body**: the body system is deliberately neutral so the display work can shout.
- **Rotated brand-mark type**: on the sustainability section, the word "IMPACT" is set in brand red at a large display size and rotated 90° to run vertically along the edge of a dark world-map panel — a distinctive typographic flourish that the template uses to label its institutional data surfaces.

### Note on Font Substitutes

The Vodafone corporate typeface is proprietary. When recreating the look in open systems, substitute with **Inter** at weights .00/600/800, or **Neue Haas Grotesk** if available. Inter needs its letter-spacing reduced by roughly .-2% at display sizes (80px+) to approximate the Vodafone face's tight tracking; its line-height should be set to 0.85-0.95 for the uppercase display tier.

## .. Component Stylings

### Buttons

Vodafone operates a genuine two-tier primary button system. Both tiers are used as primary calls to action — the difference is context (form/chrome vs editorial/content), not hierarchy.

**Primary Red Rectangle** (utility / form CTA — "Accept All Cookies", "Subscribe")
- Background: Vodafone Red (`#e60000`)
- Text: Pure White (`#ffffff`), ....px, weight 700, letter-spacing 0....px
- Padding: .2px vertical, .0px horizontal
- Border: .px solid Vodafone Red (`#e60000`)
- Border radius: 2px — deliberately sharp-cornered
- Default state: solid red fill with crisp 2px corners
- Active state: brief opacity drop to `0.9` on press

**Primary Red Pill** (editorial / content CTA — "Link to Our approach to ESG", "EXPLORE CONNECTING PEOPLE")
- Background: Vodafone Red (`#e60000`)
- Text: Pure White (`#ffffff`), ....px, weight 700, letter-spacing 0....px
- Padding: .6px uniform
- Border radius: 60px — fully pill-shaped
- Default state: solid red fill with rounded ends
- Active state: brief opacity drop to `0.9` on press

**Ghost White Rectangle** (secondary form action)
- Background: Pure White (`#ffffff`)
- Text: Form Text Grey (`#333333`), ....px, weight 700
- Padding: .2px vertical, .0px horizontal
- Border: .px solid Form Text Grey (`#333333`)
- Border radius: 2px
- Default state: white fill with charcoal outline
- Active state: opacity `0.9` on press

**Glass Pill** (sits on dark hero imagery — secondary content CTA)
- Background: Pure White at .0% opacity (`rgba(255,255,255,0..)`)
- Text: Pure White (`#ffffff`), weight 700
- Padding: 8px vertical, .6px horizontal
- Border radius: 2.px — fully pill-shaped
- Default state: soft translucent pill lets the photo breathe through

**Content Ghost Pill** (inline within editorial cards — low-emphasis content CTA)
- Background: Black at 5% opacity (`rgba(0,0,0,0.05)`)
- Text: Vodafone Red (`#e60000`), ....px, weight 700
- Padding: .5px uniform
- Border radius: 60px — fully pill-shaped
- Default state: nearly transparent pill with red text

**Icon Control Button** (video play/pause, carousel arrows, close)
- Background: Pure White (`#ffffff`)
- Icon color: Charcoal Headline (`#25282b`)
- Border radius: 50% — perfect circle
- Outline: .px solid white, used for focus indication
- Size: typically 32-.0px diameter

### Cards & Containers

**News / Editorial Card** (homepage article tile)
- Background: Pure White (`#ffffff`)
- Border radius: 6px (applied to image corners and card container)
- Shadow: none — cards rely on spacing and the image aspect ratio for separation
- Internal layout: .6:9 image on top → .2px gap → eyebrow row (date + tag pill) → 8px gap → H. Bold title → .6px card padding on sides and bottom
- The card image uses `object-fit: cover` and rounded top corners (6px top-left/top-right)

**Asymmetric Corner Card** (featured homepage cards)
- Background: Pure White (`#ffffff`)
- Border radius: `0px 6px 0px 0px` — a deliberate single-corner-rounded shape that echoes the Vodafone speech-mark logo's curved geometry
- No shadow, no border — the asymmetric radius itself is the visual signature

**Circular Portrait / Pictogram Container** (sustainability page)
- Background: Pure White (`#ffffff`)
- Border radius: .00% — perfect circle
- Used for ESG pictograms and executive portraits inside the institutional content area

### Inputs & Forms

Vodafone's corporate site does not expose many inline form controls on the homepage, but button-style inputs follow these rules:

- Background: Pure White (`#ffffff`)
- Text: Form Text Grey (`#333333`), .6px, weight .00
- Border: .px solid Form Text Grey (`#333333`)
- Border radius: 2px
- Padding: .2px .0px
- Error state (when shown): the .px border shifts to Vodafone Red (`#e60000`) and error message text inherits the same red at .2px weight 600

### Navigation

**Top bar**
- Background: transparent over hero imagery; solid white (`#ffffff`) on scroll or interior pages
- Height: approximately 6.px desktop, 56px mobile
- Logo: Vodafone speech-mark, .0×.0px red circle with a white "speech-mark" cut-out, left-aligned
- Nav links: .6px weight .00 Charcoal Headline (`#25282b`) on white; reversed to white when sitting on dark hero imagery
- Right-side utility: small icon links (search, locale, menu) rendered as 2.px icomoon glyphs
- On interior pages (Investors, Sustainable Business), the top bar shows additional secondary-nav row: "Vodafone Business / Vodafone Foundation / Our site" labels, aligned right

**Mobile collapse**
- At approximately 768px the horizontal nav collapses into a hamburger
- Mobile menu opens as a full-width overlay with white surface, .8px weight .00 link rows, .6px vertical padding per row

### Image Treatment

- **Hero images**: full-bleed, dark atmospheric photography (coral reefs, pine forests, cable crews, urban twilight) with a natural vignette or cool-tone color grade — no CSS overlay is needed because the imagery itself is pre-graded
- **Card thumbnails**: .6:9 aspect ratio, 6px top corner radius matching the card
- **Square editorial images**: .:. ratio used in feature modules, always 6px corner radius
- **Round portraits**: .00% (perfect circle) for executive headshots and ESG pictograms
- **Loading**: lazy-loading triggers on scroll; images stabilize within ~200ms of entering the viewport
- **No decorative borders on images** — the card radius does all the framing work

### Tag Pills / Badges

Two distinct pill styles appear:

**Outlined Red Pill** (used inline on article card metadata, e.g., "EMPOWERING PEOPLE")
- Background: Pure White at 80% opacity (`rgba(255,255,255,0.8)`)
- Text: Near-black at 80% opacity (`rgba(0,0,0,0.8)`), .2px, weight 600, uppercase
- Border: .px solid Vodafone Red (`#e60000`)
- Padding: 6px
- Border radius: small-rounded (roughly 2px)

**Filled Neutral Pill** (quieter tags)
- Background: Light Neutral (`#f2f2f2`)
- Text: Charcoal Headline (`#25282b`), ..px, weight 700
- Padding: .px .2px
- Border radius: 32px — fully pill-shaped

### Red Divider Band

A signature reusable component that appears on every page template: a full-width band of Vodafone Red (`#e60000`) that runs horizontally across the page to separate the monumental hero from the editorial body beneath it. It carries no text and no controls — it simply is the brand's way of saying "new chapter." Typical height: .0-80px.

### Share Ticker Panel (Investor pages)

A distinctive institutional component that anchors the investor template:
- Background: Charcoal Institutional Panel (`#25282b`)
- Large numeric display: share price set in .8px weight 800 white type with negative letter-spacing (e.g., "..6.05 GBX")
- Metadata row: delay notice (e.g., ".5-min delayed") and timestamp in ..px weight .00 secondary grey text
- Layout: sits as a horizontal strip above the footer, spans the full content width
- Hairline dividers (`rgba(255,255,255,0.25)`) separate the ticker from the footer columns

### Global Impact Map Panel (Sustainability pages)

A signature reusable component that anchors the sustainability template:
- Background: Charcoal Institutional Panel (`#25282b`)
- A dark minimal world-map illustration in slightly lighter grey
- Red circular markers (`#e60000`) plotted on geographic locations where the brand operates
- Vertically-rotated brand word "IMPACT" set in Vodafone Red at large display size (weight 800, uppercase, 90° rotated) running along one edge of the panel — this is the template's signature typographic move
- Small legend with red markers and white uppercase labels at the top-left

### Footer

A universal component across all page templates:
- Background: Charcoal Institutional Panel (`#25282b`)
- Layout: .-column link grid (Our company / Investors / Vodafone websites / Share price) followed by a "Connect with us" social row and legal/privacy line
- Logo: red speech-mark repeats bottom-right at 32-.0px
- Column header type: .6px weight 800 uppercase white
- Column link type: ..px weight .00 white, stacked vertically with .2px row spacing
- Divider hairlines: `rgba(255,255,255,0.25)` between column group and legal row

## 5. Layout Principles

### Spacing System

Base unit: **8px**. The scale accommodates both tight UI (.px, 2px, .px) and generous editorial rhythm (.6px, 20px, 2.px, 32px). Two values (`32px` and `38px`) appear across every page in the analysis, making them the template's universal rhythm constants.

| Token | Value | Typical Use |
|-------|-------|-------------|
| 2xs | 2px | Hairline separators |
| xs | .px | Icon-to-text gap in tight controls |
| sm | 8px | Base rhythm unit |
| md | .2px | Card internal padding, eyebrow-to-title gap |
| base | .6px | Paragraph rhythm, card padding, pill button padding |
| lg | 20px | Section-internal spacing |
| xl | 2.px | Card-to-card spacing, column gutters |
| 2xl | 32px | Section intro-to-content breaks — universal constant |
| 3xl | 38px | Band-to-next-section vertical push — universal constant |
| section | 6.-96px | Vertical rhythm between major editorial modules |

### Grid & Container

- **Max content width**: approximately ...0px on very large screens; articles and hero modules typically sit at .200px
- **Column pattern on cards**: 3-up or .-up card grid at desktop (.200-...0px), 2-up at tablet (768-.02.px), stacked .-up at mobile (<768px)
- **Horizontal padding**: 32px at desktop edge, 20px at tablet, .6px at mobile
- **Gutters between cards**: 2.px desktop, .6px mobile
- **Institutional panel (share ticker, world map, footer)**: always full-bleed edge-to-edge at every breakpoint

### Whitespace Philosophy

Vodafone's editorial canvas leans generous — whitespace is used as a visual palette cleanser between a monumental headline and the card grid or data panel that follows. Sections are separated by tall vertical rhythm (6.-96px) plus the occasional red band that acts as both a separator and a brand signal. Within cards, spacing is tight and efficient (.2-.6px) so the photography can take the stage.

### Border Radius Scale

| Token | Value | Typical Use |
|-------|-------|-------------|
| hairline | .px | Inline text wraps, small badges |
| button-tight | 2px | Primary and secondary rectangle button corners — the brand's utility-form look |
| card | 6px | News cards, images, input fields |
| asymmetric | `0px 6px 0px 0px` | Featured cards (top-right corner only) |
| glass-pill | 2.px | Translucent white pills sitting on dark hero imagery |
| badge-pill | 32px | Filled neutral pill badges |
| cta-pill | 60px | Primary red content CTAs — the brand's editorial button look |
| circle | 50% | Icon buttons, carousel arrows, close controls |
| portrait | .00% | Circular portraits and ESG pictograms |

## 6. Depth & Elevation

Vodafone's system is deliberately flat. There is almost no conventional box-shadow in the UI. Hierarchy is carried by color (red bands, charcoal institutional panels), typography weight (800 vs .00), and spacing.

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 — Surface | No shadow, no border | Default card, default section |
| . — Outline | .px solid border at low-opacity | Ghost buttons, outlined pills |
| 2 — Inset Highlight | `inset 0 0 0 .px` on focus | Pressed / focused controls |
| 3 — Photographic depth | The photography itself carries the depth | Hero imagery |
| . — Surface shift | Charcoal institutional panel below a white editorial canvas | Share ticker / world map / footer |

Shadow philosophy: Vodafone treats drop shadows as a distraction from brand clarity. The few extracted shadow tokens are reserved for inset focus rings. The dominant "elevation" in the system is a **color surface shift** — switching from the white editorial canvas to the charcoal institutional panel — rather than a lift-off drop shadow.

### Decorative Depth

The only decorative depth cues are:
- Atmospheric dark hero photography that carries its own cinematic tonal depth (no CSS overlay needed)
- The rotated vertical "IMPACT" wordmark on the sustainability map, which creates the illusion of a fourth wall alongside the map panel

## 7. Do's and Don'ts

### Do

- Use Vodafone Red (`#e60000`) as the single loudest element on any screen — one primary CTA per fold, one red band per editorial break
- Set display headlines in uppercase 800-weight with tight negative tracking; let them run to 90-...px on desktop
- Pair monumental display type with calm .6-.8px body copy — the scale jump is the system
- Switch the button radius based on context: 2px rectangles for form and utility actions, 60px pills for editorial content CTAs
- Let documentary photography breathe at .6:9 or .:. on a 6px radius — no decorative borders, no heavy overlays
- Use the red band as a full-width chapter divider between every hero and the content below it
- Anchor every page with a charcoal institutional surface (`#25282b`) — the footer always, and on investor/sustainability pages extend the same color up to include the share ticker or the global-impact map
- Respect the universal page rhythm: dark hero → red band → white editorial → charcoal institutional → charcoal footer

### Don't

- Don't introduce a second brand hue to rival Vodafone Red — no teals, no purples, no orange accents
- Don't soften rectangle button corners beyond 2px, and don't shrink pill button corners below 60px — the two shapes are both load-bearing
- Don't add drop shadows to cards or buttons — the system is intentionally flat and uses surface color to carry elevation
- Don't use gradients on backgrounds, buttons, or text
- Don't mix uppercase tracking on body text — uppercase is reserved for display, labels, and micro-labels
- Don't use italics for emphasis — use weight 600/700 instead
- Don't decorate headlines with colored underlines or highlights — the type does the work
- Don't use pure black (`#000000`) for text or surfaces — always use Charcoal Headline (`#25282b`)

## 8. Responsive Behavior

### Breakpoints

The practical tiers observed across all three templates:

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | ≤ 600px | Nav collapses to hamburger; hero display drops to ~56-72px; cards stack .-up |
| Mobile Large | 60.-767px | Hero display ~72-90px; cards still stack .-up |
| Tablet | 768-.023px | Nav re-expands; cards grid 2-up; hero display ~90-.20px |
| Laptop | .02.-..99px | Full nav; cards 3-up; hero display ~.20-...px |
| Desktop | .200-..39px | Standard editorial layout; cards 3-up or .-up |
| Wide | ≥ ...0px | Content caps at ...0px; outer canvas padding grows |

### Touch Targets

All interactive controls meet a ..×..px minimum on mobile. Icon buttons use .0×.0px circular hit areas which expand with .px invisible padding on touch devices. Primary CTA buttons land at approximately .8×.8px on mobile (.6px top/bottom + text line for pills; .2px + text line for rectangles).

### Collapsing Strategy

- **Nav**: horizontal links collapse into a hamburger at 768px; the logo stays left-aligned at all widths
- **Card grid**: .-up → 3-up at .200px → 2-up at 768px → .-up at 600px, with gutters shrinking from 2.px to .6px
- **Hero display type**: step-reduces through ... → .26 → 90 → 72 → 56px as viewports shrink
- **Section padding**: 96px vertical at desktop, 6.px at tablet, .8px at mobile
- **Red divider bands**: remain full-width at every breakpoint; their vertical height compresses from ~80px at desktop to ~.0px at mobile
- **Institutional panels (share ticker / world map)**: on mobile, multi-column content restacks into a single vertical stream but the charcoal surface stays edge-to-edge
- **Vertically-rotated "IMPACT" wordmark**: becomes a horizontal label or is dropped entirely on mobile where vertical space is limited

### Image Behavior

- Hero imagery: art-directed variant at mobile (tighter crop) versus desktop (wide atmospheric frame)
- Card thumbnails: always .6:9 regardless of viewport; `loading="lazy"` is standard
- Circular portraits: fixed at 80-.20px diameter on desktop, shrinking to 6.-80px on mobile
- Logo: fixed at .0×.0px across breakpoints (consistent brand mark size)

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: "Vodafone Red (`#e60000`)"
- Background: "Canvas White (`#ffffff`)"
- Heading text: "Charcoal Headline (`#25282b`)"
- Body text: "Secondary Body Grey (`#7e7e7e`)"
- Institutional surface: "Charcoal Institutional Panel (`#25282b`)"
- Inline link: "Signal Blue (`#3860be`)"
- Quiet pill background: "Light Neutral (`#f2f2f2`)"

### Example Component Prompts

- "Create a primary red rectangle button: Vodafone Red (`#e60000`) background, pure white ....px weight 700 text, 2px border radius (sharp corners), .2px vertical × .0px horizontal padding. Use for form and utility actions. No shadow, no gradient."
- "Create a primary red pill CTA: Vodafone Red (`#e60000`) background, pure white ....px weight 700 text, 60px border radius (fully pill-shaped), .6px uniform padding. Use for editorial content calls-to-action."
- "Design an editorial news card: white background, 6px border radius, .6:9 image at the top, .2px eyebrow row containing a date and a red-outlined uppercase tag pill, then a 2.px weight 700 Charcoal title. No shadow — spacing alone separates cards."
- "Build a hero section: dark atmospheric photo as the full-bleed background, monumental uppercase headline at ...px weight 800 with -.px letter-spacing, single Vodafone Red pill CTA beneath it, no overlay gradient."
- "Create a red divider band: full-width strip of Vodafone Red (`#e60000`), 6.px tall on desktop and .0px on mobile, no text, no controls — it acts purely as a visual chapter break between editorial sections."
- "Design an institutional data panel: full-bleed Charcoal Institutional Panel (`#25282b`) background, large numeric display at .8px weight 800 white with negative letter-spacing, ..px weight .00 grey meta row beneath. Use for share ticker or stats callout."
- "Design a global impact map: Charcoal Institutional Panel (`#25282b`) background, minimal grey world-map illustration, red Vodafone-red circular markers on operational locations, the brand word 'IMPACT' set at large display size in brand red and rotated 90° to run vertically along one edge."

### Iteration Guide

When refining existing screens generated with this design system:

.. Focus on ONE component at a time — the system has few moving parts, so small refinements compound
2. Reference specific color names and hex codes from this document when describing changes
3. Use natural language ("sharper corners," "more generous vertical rhythm") alongside specific measurements
.. When in doubt about radius, remember: 2px for form/utility buttons, 60px for editorial pills, 6px for cards, 50%/.00% for icon and portrait circles
5. Keep the brand rule absolute: only one Vodafone Red element should dominate any given fold

### Known Gaps

- Form input styles (text fields, dropdowns, toggles) are not exposed on these page templates; their specs are inferred from the ghost-button pattern and may need refinement when real forms are designed
- The Vodafone corporate typeface is proprietary and cannot be reproduced exactly in open systems; Inter with tightened tracking at display sizes is the closest open substitute
- Animation and transition timings are intentionally not documented — the site uses them sparingly and the values are not extractable from static analysis
- The share ticker's exact number styling (separators, currency glyph) is documented from the investor-page screenshot; other regional variants may display differently
