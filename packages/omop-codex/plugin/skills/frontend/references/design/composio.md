# Design System Inspired by Composio

## .. Visual Theme & Atmosphere

Composio's interface is a nocturnal command center — a dense, developer-focused darkness punctuated by electric cyan and deep cobalt signals. The entire experience is built on an almost-pure-black canvas (`#0f0f0f`) where content floats within barely-visible containment borders, creating the feeling of a high-tech control panel rather than a traditional marketing page. It's a site that whispers authority to developers who live in dark terminals.

The visual language leans heavily into the aesthetic of code editors and terminal windows. JetBrains Mono appears alongside the geometric precision of abcDiatype, reinforcing the message that this is a tool built *by* developers *for* developers. Decorative elements are restrained but impactful — subtle cyan-blue gradient glows emanate from cards and sections like bioluminescent organisms in deep water, while hard-offset shadows (`.px .px`) on select elements add a raw, brutalist edge that prevents the design from feeling sterile.

What makes Composio distinctive is its tension between extreme minimalism and strategic bursts of luminous color. The site never shouts — headings use tight line-heights (0.87) that compress text into dense, authoritative blocks. Color is rationed like a rare resource: white text for primary content, semi-transparent white (`rgba(255,255,255,0.5-0.6)`) for secondary, and brand blue (`#0007cd`) or electric cyan (`#00ffff`) reserved exclusively for interactive moments and accent glows.

**Key Characteristics:**
- Pitch-black canvas with near-invisible white-border containment (.-.2% opacity)
- Dual-font identity: geometric sans-serif (abcDiatype) for content, monospace (JetBrains Mono) for technical credibility
- Ultra-tight heading line-heights (0.87-..0) creating compressed, impactful text blocks
- Bioluminescent accent strategy — cyan and blue glows that feel like they're emitting light from within
- Hard-offset brutalist shadows (`.px .px`) on select interactive elements
- Monochrome hierarchy with color used only at the highest-signal moments
- Developer-terminal aesthetic that bridges marketing and documentation

## 2. Color Palette & Roles

### Primary
- **Composio Cobalt** (`#0007cd`): The core brand color — a deep, saturated blue used sparingly for high-priority interactive elements and brand moments. It anchors the identity with quiet intensity.

### Secondary & Accent
- **Electric Cyan** (`#00ffff`): The attention-grabbing accent — used at low opacity (`rgba(0,255,255,0..2)`) for glowing button backgrounds and card highlights. At full saturation, it serves as the energetic counterpoint to the dark canvas.
- **Signal Blue** (`#0089ff` / `rgb(0,.37,255)`): Used for select button borders and interactive focus states, bridging the gap between Cobalt and Cyan.
- **Ocean Blue** (`#0096ff` / `rgb(0,.50,255)`): Accent border color on CTA buttons, slightly warmer than Signal Blue.

### Surface & Background
- **Void Black** (`#0f0f0f`): The primary page background — not pure black, but a hair warmer, reducing eye strain on dark displays.
- **Pure Black** (`#000000`): Used for card interiors and deep-nested containers, creating a subtle depth distinction from the page background.
- **Charcoal** (`#2c2c2c` / `rgb(..,..,..)`): Used for secondary button borders and divider lines on dark surfaces.

### Neutrals & Text
- **Pure White** (`#ffffff`): Primary heading and high-emphasis text color on dark surfaces.
- **Muted Smoke** (`#......`): De-emphasized body text, metadata, and tertiary content.
- **Ghost White** (`rgba(255,255,255,0.6)`): Secondary body text and link labels — visible but deliberately receded.
- **Whisper White** (`rgba(255,255,255,0.5)`): Tertiary button text and placeholder content.
- **Phantom White** (`rgba(255,255,255,0.2)`): Subtle button backgrounds and deeply receded UI chrome.

### Semantic & Accent
- **Border Mist .2** (`rgba(255,255,255,0..2)`): Highest-opacity border treatment — used for prominent card edges and content separators.
- **Border Mist .0** (`rgba(255,255,255,0..0)`): Standard container borders on dark surfaces.
- **Border Mist 08** (`rgba(255,255,255,0.08)`): Subtle section dividers and secondary card edges.
- **Border Mist 06** (`rgba(255,255,255,0.06)`): Near-invisible containment borders for background groupings.
- **Border Mist 0.** (`rgba(255,255,255,0.0.)`): The faintest border — used for atmospheric separation only.
- **Light Border** (`#e0e0e0` / `rgb(22.,22.,22.)`): Reserved for light-surface contexts (rare on this site).

### Gradient System
- **Cyan Glow**: Radial gradients using `#00ffff` at very low opacity, creating bioluminescent halos behind cards and feature sections.
- **Blue-to-Black Fade**: Linear gradients from Composio Cobalt (`#0007cd`) fading into Void Black (`#0f0f0f`), used in hero backgrounds and section transitions.
- **White Fog**: Bottom-of-page gradient transitioning from dark to a diffused white/gray, creating an atmospheric "horizon line" effect near the footer.

## 3. Typography Rules

### Font Family
- **Primary**: `abcDiatype`, with fallbacks: `abcDiatype Fallback, ui-sans-serif, system-ui, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`
- **Monospace**: `JetBrains Mono`, with fallbacks: `JetBrains Mono Fallback, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New`
- **System Monospace** (fallback): `Menlo`, `monospace` for smallest inline code

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | abcDiatype | 6.px (.rem) | .00 | 0.87 (ultra-tight) | normal | Massive, compressed headings |
| Section Heading | abcDiatype | .8px (3rem) | .00 | ..00 (tight) | normal | Major feature section titles |
| Sub-heading Large | abcDiatype | .0px (2.5rem) | .00 | ..00 (tight) | normal | Secondary section markers |
| Sub-heading | abcDiatype | 28px (..75rem) | .00 | ..20 (tight) | normal | Card titles, feature names |
| Card Title | abcDiatype | 2.px (..5rem) | 500 | ..20 (tight) | normal | Medium-emphasis card headings |
| Feature Label | abcDiatype | 20px (..25rem) | 500 | ..20 (tight) | normal | Smaller card titles, labels |
| Body Large | abcDiatype | .8px (...25rem) | .00 | ..20 (tight) | normal | Intro paragraphs |
| Body / Button | abcDiatype | .6px (.rem) | .00 | ..50 | normal | Standard body text, nav links, buttons |
| Body Small | abcDiatype | .5px (0.9.rem) | .00 | ..63 (relaxed) | normal | Longer-form body text |
| Caption | abcDiatype | ..px (0.875rem) | .00 | ..63 (relaxed) | normal | Descriptions, metadata |
| Label | abcDiatype | .3px (0.8.rem) | 500 | ..50 | normal | UI labels, badges |
| Tag / Overline | abcDiatype | .2px (0.75rem) | 500 | ..00 (tight) | 0.3px | Uppercase overline labels |
| Micro | abcDiatype | .2px (0.75rem) | .00 | ..00 (tight) | 0.3px | Smallest sans-serif text |
| Code Body | JetBrains Mono | .6px (.rem) | .00 | ..50 | -0.32px | Inline code, terminal output |
| Code Small | JetBrains Mono | ..px (0.875rem) | .00 | ..50 | -0.28px | Code snippets, technical labels |
| Code Caption | JetBrains Mono | .2px (0.75rem) | .00 | ..50 | -0.28px | Small code references |
| Code Overline | JetBrains Mono | ..px (0.875rem) | .00 | ...3 | 0.7px | Uppercase technical labels |
| Code Micro | JetBrains Mono | ..px (0.69rem) | .00 | ..33 | 0.55px | Tiny uppercase code tags |
| Code Nano | JetBrains Mono | 9-.0px | .00 | ..33 | 0..5-0.5px | Smallest monospace text |

### Principles
- **Compression creates authority**: Heading line-heights are drastically tight (0.87-..0), making large text feel dense and commanding rather than airy and decorative.
- **Dual personality**: abcDiatype carries the marketing voice — geometric, precise, friendly. JetBrains Mono carries the technical voice — credible, functional, familiar to developers.
- **Weight restraint**: Almost everything is weight .00 (regular). Weight 500 (medium) is reserved for small labels, badges, and select card titles. Weight 700 (bold) appears only in microscopic system-monospace contexts.
- **Negative letter-spacing on code**: JetBrains Mono uses negative letter-spacing (-0.28px to -0.98px) for dense, compact code blocks that feel like a real IDE.
- **Uppercase is earned**: The `uppercase` + `letter-spacing` treatment is reserved exclusively for tiny overline labels and technical tags — never for headings.

## .. Component Stylings

### Buttons

**Primary CTA (White Fill)**
- Background: Pure White (`#ffffff`)
- Text: Near Black (`oklch(0...5 0 0)`)
- Padding: comfortable (8px 2.px)
- Border: none
- Radius: subtly rounded (likely .px based on token scale)
- Hover: likely subtle opacity reduction or slight gray shift

**Cyan Accent CTA**
- Background: Electric Cyan at .2% opacity (`rgba(0,255,255,0..2)`)
- Text: Near Black (`oklch(0...5 0 0)`)
- Padding: comfortable (8px 2.px)
- Border: thin solid Ocean Blue (`.px solid rgb(0,.50,255)`)
- Radius: subtly rounded (.px)
- Creates a "glowing from within" effect on dark backgrounds

**Ghost / Outline (Signal Blue)**
- Background: transparent
- Text: Near Black (`oklch(0...5 0 0)`)
- Padding: balanced (.0px)
- Border: thin solid Signal Blue (`.px solid rgb(0,.37,255)`)
- Hover: likely fill or border color shift

**Ghost / Outline (Charcoal)**
- Background: transparent
- Text: Near Black (`oklch(0...5 0 0)`)
- Padding: balanced (.0px)
- Border: thin solid Charcoal (`.px solid rgb(..,..,..)`)
- For secondary/tertiary actions on dark surfaces

**Phantom Button**
- Background: Phantom White (`rgba(255,255,255,0.2)`)
- Text: Whisper White (`rgba(255,255,255,0.5)`)
- No visible border
- Used for deeply de-emphasized actions

### Cards & Containers
- Background: Pure Black (`#000000`) or transparent
- Border: white at very low opacity, ranging from Border Mist 0. (`rgba(255,255,255,0.0.)`) to Border Mist .2 (`rgba(255,255,255,0..2)`) depending on prominence
- Radius: barely rounded corners (2px for inline elements, .px for content cards)
- Shadow: select cards use the hard-offset brutalist shadow (`rgba(0,0,0,0..5) .px .px 0px 0px`) — a distinctive design choice that adds raw depth
- Elevation shadow: deeper containers use soft diffuse shadow (`rgba(0,0,0,0.5) 0px 8px 32px`)
- Hover behavior: likely subtle border opacity increase or faint glow effect

### Inputs & Forms
- No explicit input token data extracted — inputs likely follow the dark-surface pattern with:
  - Background: transparent or Pure Black
  - Border: Border Mist .0 (`rgba(255,255,255,0..0)`)
  - Focus: border shifts to Signal Blue (`#0089ff`) or Electric Cyan
  - Text: Pure White with Ghost White placeholder

### Navigation
- Sticky top nav bar on dark/black background
- Logo (white SVG): Composio wordmark on the left
- Nav links: Pure White (`#ffffff`) at standard body size (.6px, abcDiatype)
- CTA button in the nav: White Fill Primary style
- Mobile: collapses to hamburger menu, single-column layout
- Subtle bottom border on nav (Border Mist 06-08)

### Image Treatment
- Dark-themed product screenshots and UI mockups dominate
- Images sit within bordered containers matching the card system
- Blue/cyan gradient glows behind or beneath feature images
- No visible border-radius on images beyond container rounding (.px)
- Full-bleed within their card containers

### Distinctive Components

**Stats/Metrics Display**
- Large monospace numbers (JetBrains Mono) — ".0k+" style
- Tight layout with subtle label text beneath

**Code Blocks / Terminal Previews**
- Dark containers with JetBrains Mono
- Syntax-highlighted content
- Subtle bordered containers (Border Mist .0)

**Integration/Partner Logos Grid**
- Grid layout of tool logos on dark surface
- Contained within bordered card
- Demonstrates ecosystem breadth

**"COMPOSIO" Brand Display**
- Oversized brand typography — likely the largest text on the page
- Used as a section divider/brand statement
- Stark white on black

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 2px, .px, 6px, 8px, .0px, .2px, ..px, .6px, .8px, 20px, 2.px, 30px, 32px, .0px
- Component padding: typically .0px (buttons) to 2.px (CTA buttons horizontal)
- Section padding: generous vertical spacing (estimated 80-.20px between major sections)
- Card internal padding: approximately 2.-32px

### Grid & Container
- Max container width: approximately .200px, centered
- Content sections use single-column or 2-3 column grids for feature cards
- Hero: centered single-column with maximum impact
- Feature sections: asymmetric layouts mixing text blocks with product screenshots

### Whitespace Philosophy
- **Breathing room between sections**: Large vertical gaps create distinct "chapters" in the page scroll.
- **Dense within components**: Cards and text blocks are internally compact (tight line-heights, minimal internal padding), creating focused information nodes.
- **Contrast-driven separation**: Rather than relying solely on whitespace, Composio uses border opacity differences and subtle background shifts to delineate content zones.

### Border Radius Scale
- Nearly squared (2px): Inline code spans, small tags, pre blocks — the sharpest treatment, conveying technical precision
- Subtly rounded (.px): Content cards, images, standard containers — the workhorse radius
- Pill-shaped (37px): Select buttons and badges — creates a softer, more approachable feel for key CTAs
- Full round (9999px+): Circular elements, avatar-like containers, decorative dots

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, inline text |
| Contained (Level .) | Border Mist 0.-08, no shadow | Background groupings, subtle sections |
| Card (Level 2) | Border Mist .0-.2, no shadow | Standard content cards, code blocks |
| Brutalist (Level 3) | Hard offset shadow (`.px .px`, .5% black) | Select interactive cards, distinctive feature highlights |
| Floating (Level .) | Soft diffuse shadow (`0px 8px 32px`, 50% black) | Modals, overlays, deeply elevated content |

**Shadow Philosophy**: Composio uses shadows sparingly and with deliberate contrast. The hard-offset brutalist shadow is the signature — it breaks the sleek darkness with a raw, almost retro-computing feel. The soft diffuse shadow is reserved for truly floating elements. Most depth is communicated through border opacity gradations rather than shadows.

### Decorative Depth
- **Cyan Glow Halos**: Radial gradient halos using Electric Cyan at low opacity behind feature cards and images. Creates a "screen glow" effect as if the UI elements are emitting light.
- **Blue-Black Gradient Washes**: Linear gradients from Composio Cobalt to Void Black used as section backgrounds, adding subtle color temperature shifts.
- **White Fog Horizon**: A gradient from dark to diffused white/gray at the bottom of the page, creating an atmospheric "dawn" effect before the footer.

## 7. Do's and Don'ts

### Do
- Use Void Black (`#0f0f0f`) as the primary page background — never pure white for main surfaces
- Keep heading line-heights ultra-tight (0.87-..0) for compressed, authoritative text blocks
- Use white-opacity borders (.-.2%) for containment — they're more important than shadows here
- Reserve Electric Cyan (`#00ffff`) for high-signal moments only — CTAs, glows, interactive accents
- Pair abcDiatype with JetBrains Mono to reinforce the developer-tool identity
- Use the hard-offset shadow (`.px .px`) intentionally on select elements for brutalist personality
- Keep button text dark (`oklch(0...5 0 0)`) even on the darkest backgrounds — buttons carry their own surface
- Layer opacity-based borders to create subtle depth without shadows
- Use uppercase + letter-spacing only for tiny overline labels (.2px or smaller)

### Don't
- Don't use bright backgrounds or light surfaces as primary containers
- Don't apply heavy shadows everywhere — depth comes from border opacity, not box-shadow
- Don't use Composio Cobalt (`#0007cd`) as a text color — it's too dark on dark and too saturated on light
- Don't increase heading line-heights beyond ..2 — the compressed feel is core to the identity
- Don't use bold (700) weight for body or heading text — .00-500 is the ceiling
- Don't mix warm colors — the palette is strictly cool (blue, cyan, white, black)
- Don't use border-radius larger than .px on content cards — the precision of near-square corners is intentional
- Don't place Electric Cyan at full opacity on large surfaces — it's an accent, used at .2% max for backgrounds
- Don't use decorative serif or handwritten fonts — the entire identity is geometric sans + monospace
- Don't skip the monospace font for technical content — JetBrains Mono is not decorative, it's a credibility signal

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single column, hamburger nav, full-width cards, reduced section padding, hero text scales down to ~28-.0px |
| Tablet | 768-.02.px | 2-column grid for cards, condensed nav, slightly reduced hero text |
| Desktop | .02.-...0px | Full multi-column layout, expanded nav with all links visible, large hero typography (6.px) |
| Large Desktop | >...0px | Max-width container centered, generous horizontal margins |

### Touch Targets
- Minimum touch target: ..x..px for all interactive elements
- Buttons use comfortable padding (8px 2.px minimum) ensuring adequate touch area
- Nav links spaced with sufficient gap for thumb navigation

### Collapsing Strategy
- **Navigation**: Full horizontal nav on desktop collapses to hamburger on mobile
- **Feature grids**: 3-column → 2-column → single-column stacking
- **Hero text**: 6.px → .0px → 28px progressive scaling
- **Section padding**: Reduces proportionally but maintains generous vertical rhythm
- **Cards**: Stack vertically on mobile with full-width treatment
- **Code blocks**: Horizontal scroll on smaller viewports rather than wrapping

### Image Behavior
- Product screenshots scale proportionally within their containers
- Dark-themed images maintain contrast on the dark background at all sizes
- Gradient glow effects scale with container size
- No visible art direction changes between breakpoints — same crops, proportional scaling

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: "Pure White (#ffffff)"
- Page Background: "Void Black (#0f0f0f)"
- Brand Accent: "Composio Cobalt (#0007cd)"
- Glow Accent: "Electric Cyan (#00ffff)"
- Heading Text: "Pure White (#ffffff)"
- Body Text: "Ghost White (rgba(255,255,255,0.6))"
- Card Border: "Border Mist .0 (rgba(255,255,255,0..0))"
- Button Border: "Signal Blue (#0089ff)"

### Example Component Prompts
- "Create a feature card with a near-black background (#000000), barely visible white border at .0% opacity, subtly rounded corners (.px), and a hard-offset shadow (.px right, .px down, .5% black). Use Pure White for the title in abcDiatype at 2.px weight 500, and Ghost White (60% opacity) for the description at .6px."
- "Design a primary CTA button with a solid white background, near-black text, comfortable padding (8px vertical, 2.px horizontal), and subtly rounded corners. Place it next to a secondary button with transparent background, Signal Blue border, and matching padding."
- "Build a hero section on Void Black (#0f0f0f) with a massive heading at 6.px, line-height 0.87, in abcDiatype. Center the text. Add a subtle blue-to-black gradient glow behind the content. Include a white CTA button and a cyan-accented secondary button below."
- "Create a code snippet display using JetBrains Mono at ..px with -0.28px letter-spacing on a black background. Add a Border Mist .0 border (rgba(255,255,255,0..0)) and .px radius. Show syntax-highlighted content with white and cyan text."
- "Design a navigation bar on Void Black with the Composio wordmark in white on the left, .-5 nav links in white abcDiatype at .6px, and a white-fill CTA button on the right. Add a Border Mist 06 bottom border."

### Iteration Guide
When refining existing screens generated with this design system:
.. Focus on ONE component at a time
2. Reference specific color names and hex codes from this document — "use Ghost White (rgba(255,255,255,0.6))" not "make it lighter"
3. Use natural language descriptions — "make the border barely visible" = Border Mist 0.-06
.. Describe the desired "feel" alongside specific measurements — "compressed and authoritative heading at .8px with line-height ..0"
5. For glow effects, specify "Electric Cyan at .2% opacity as a radial gradient behind the element"
6. Always specify which font — abcDiatype for marketing, JetBrains Mono for technical/code content
