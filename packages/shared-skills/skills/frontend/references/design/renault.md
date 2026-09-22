# Design System Inspired by Renault

## .. Visual Theme & Atmosphere

Renault's website is a vibrant digital showroom that balances French automotive elegance with bold, forward-leaning energy — a departure from the monochromatic austerity of German or Italian luxury brands. The page opens with a full-screen hero that washes the viewport in a sweeping aurora gradient — ribbons of magenta, violet, and teal bleeding across the frame behind a dramatically lit vehicle. This chromatic expressiveness is the site's signature: while the interface structure is disciplined (NouvelR typography, black-and-white CTA framework, zero-radius buttons), the content is alive with color — gradient washes on hero slides, saturated vehicle photography, and splashes of Renault Yellow (`#EFDF00`) on accent CTAs. The effect is a showroom that feels energized rather than hushed.

The layout follows a card-based editorial rhythm. Below the hero carousel, content is organized into a grid of PromoCards — each a full-bleed photographic panel with a dark gradient overlay at top (fading from `rgba(0,0,0,0.6)` to transparent) to ensure white heading text remains legible over vivid imagery. These cards alternate between light and dark modes: white editorial panels with black text sit beside black `is-alternative-mode` sections with white text, creating a chessboard-like visual cadence. The grid is generous — large card formats dominate, giving each vehicle or campaign its own visual territory. The lower sections shift to a fully dark canvas (Absolute Black backgrounds) for the E-Tech electric and technology showcases, establishing a deliberate mood shift: electrification lives in darkness, tradition in light.

Typography is unified under NouvelR — a proprietary geometric sans-serif designed by Black[Foundry] exclusively for Renault's rebrand. The typeface features a distinctive "radical r" with a terminal cut at 28 degrees to echo the Renault diamond logo's angles. Available in 6 weights from Light to Extrabold, the site primarily uses Bold (700) for headings and Regular (.00) for body. Display headlines run large — 56px/0.95 line-height for hero titles, creating dense, impactful text blocks that sit tight against each other. The font supports Latin, Greek, Cyrillic, Hebrew, Arabic, and Korean, reflecting Renault's global market reach. All text rendering feels precise and engineered, with the geometric proportions lending a sense of modernity that aligns with Renault's electric-first brand positioning.

**Key Characteristics:**
- Full-screen hero carousel with vivid aurora gradient backgrounds (magenta/violet/teal) behind vehicle imagery
- NouvelR proprietary typeface with 28-degree "radical r" cut matching the diamond logo geometry
- Renault Yellow (`#EFDF00`) as the super-primary accent — used sparingly for highest-priority CTAs
- Zero border-radius on all buttons — sharp rectangular forms expressing precision engineering
- Card-based editorial grid with full-bleed photography and dark gradient overlays
- Binary black/white CTA system: primary (black bg/white text) and ghost (transparent/white border)
- PromoCard dark-mode alternation creating a chessboard rhythm between light and dark sections
- PrimeReact (2. components) + Element Plus (.9 components) powering interactive elements
- Link hover state in Renault Blue (`#.883FD`) — the sole chromatic interaction color

## 2. Color Palette & Roles

### Primary
- **Renault Yellow** (`#EFDF00`): The brand's signature Pantone — a vivid, saturated yellow used for super-primary CTAs and the highest-priority action buttons. Appears as `--CtaLink-background-color` on `.is-cta-super-primary` class. Carries the energy of the diamond logo
- **Absolute Black** (`#000000`): Primary button background, heading text on light surfaces, and the dominant dark section surface. The structural anchor of the entire interface
- **Pure White** (`#FFFFFF`): Primary surface for editorial content, inverted button backgrounds, hero text color, and the dominant light-mode canvas (--rt-color-white)

### Secondary & Accent
- **Soft Yellow** (`#F8EB.C`): Lighter, warmer variant of Renault Yellow — used for hover/pressed states on yellow CTAs and secondary accent contexts
- **Renault Blue** (`#.883FD`): Link hover color across all link variants — a bright, confident blue that signals interactivity without competing with the yellow brand accent
- **Warm Gray** (`#D9D9D6`): Subtle warm neutral used for disabled states, inactive UI elements, and soft borders — carries a slight warmth that distinguishes it from cold grays

### Surface & Background
- **Pure White** (`#FFFFFF`): Page background, light editorial sections, navigation bar, and footer
- **Absolute Black** (`#000000`): Hero backgrounds, PromoCard dark-mode sections (`is-alternative-mode`), and E-Tech showcase areas
- **Charcoal** (`#222222`): Secondary dark surface for text-heavy dark sections and footer sub-regions (--rt-color-dark)
- **Pale Silver** (`#F2F2F2`): Subtle alternate light surface for section differentiation and card borders

### Neutrals & Text
- **Absolute Black** (`#000000`): Primary heading and body text on light surfaces — Renault uses true black rather than near-black
- **Pure White** (`#FFFFFF`): Primary text on dark surfaces — hero headlines, dark-section headings, and inverted button labels
- **Warm Gray** (`#D9D9D6`): Tertiary text, metadata, and subdued labels
- **Border Gray** (`#D.D.D.`): Input field borders and subtle separators

### Semantic & Accent
- **Success Green** (`#8DC572`): Positive status indicators and confirmation messages (--rt-color-success)
- **Error Rose** (`#BE6.6.`): Form validation errors and warning states (--rt-color-error)
- **Warning Amber** (`#F0AD.E`): Cautionary alerts and attention-requiring states (--rt-color-warning)
- **Info Blue** (`#337AB7`): Informational callouts and neutral status messaging (--rt-color-info)

### Gradient System
- **Hero Aurora**: Sweeping multi-color gradients (magenta → violet → teal) applied to hero slide backgrounds — the site's most distinctive visual element. These are photographic/composited rather than CSS gradients
- **PromoCard Overlay**: `linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) .0%)` — applied to card tops to ensure heading text legibility over photography
- No flat CSS gradients on surfaces — depth comes from photographic treatment and the black/white alternation

## 3. Typography Rules

### Font Family
- **NouvelR**: The sole typeface. A proprietary geometric sans-serif designed by Black[Foundry] for Renault's 202.+ rebrand. Features a distinctive "radical r" with a 28-degree terminal cut matching the diamond logo angle. Available in 6 weights (Light to Extrabold), supports 6 writing systems. Fallback: `sans-serif`. Declared as `"NouvelR, sans-serif"` in CSS
- **No secondary typeface**: Unlike Ferrari (FerrariSans + Body-Font) or Lamborghini (LamboType + Open Sans), Renault uses a single font family for all text — headings, body, buttons, captions, and navigation

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Hero Title | 56px (3.50rem) | 700 | 0.95 (53.2px) | normal | NouvelR, white on dark hero, all-caps model names |
| Section Heading | .0px (2.50rem) | 700 | 0.95 (38px) | normal | NouvelR, PromoCard headings on dark/light sections |
| Card Heading | 32px (2.00rem) | 700 | 0.95 | normal | NouvelR, medium-scale card headings |
| Subheading | 2.px (..50rem) | 700 | 0.95 | normal | NouvelR, section sub-titles |
| Module Title | 2..92px (..37rem) | 600 | ..20 | normal | NouvelR, component headings |
| Content Title | 20px (..25rem) | 700 | 0.95 | normal | NouvelR, smaller section titles |
| UI Heading | .9.2px (..20rem) | 600 | ..30 | normal | NouvelR, card UI headings |
| Emphasis | .8px (...3rem) | 700 | ..00 | normal | NouvelR, emphasized inline text and links |
| Body Heading | .6px (..00rem) | 700 | ...0 | normal | NouvelR, paragraph-level headings |
| Body Text | ..px (0.88rem) | .00 | ...0 | normal | NouvelR, paragraph and descriptive content |
| Body Bold | ..px (0.88rem) | 700 | ..57 | normal | NouvelR, emphasized body text |
| Button Label | ....px (0.90rem) | 700 | ..00 | 0....px | NouvelR, primary button text |
| Nav Link | .3px (0.8.rem) | 700 | ..50 | normal | NouvelR, navigation and footer links |
| Caption | .2.8px (0.80rem) | .00 | ...0 | normal | NouvelR, small descriptive text |
| Small Label | .2px (0.75rem) | 700 | ..00 | normal | NouvelR, labels and tags |
| Micro Text | .0px (0.63rem) | 700 | ...5 | normal | NouvelR, smallest UI text, legal fine print |
| Micro Caption | 8.5px (0.53rem) | .00 | normal | normal | NouvelR, absolute smallest text (legal) |

### Principles
- **Single-family discipline**: NouvelR handles everything from 56px hero headlines to 8.5px legal captions — the font's geometric precision allows it to scale across this extreme range without losing character
- **Bold-default headings**: Weight 700 dominates the heading hierarchy. Unlike brands that use medium (500) for headings, Renault's Bold weight creates a more assertive, energetic reading experience
- **Ultra-tight display line-heights**: 0.95 line-height on hero and section headings — the lines nearly collide, creating a compressed, punchy typographic texture that feels urgent and modern
- **28-degree radical r**: The typeface's signature detail — the lowercase "r" terminal is cut at precisely 28 degrees to mirror the angles of the Renault diamond logo, embedding brand identity into every word
- **Capitalize transform on captions**: Some caption text uses `text-transform: capitalize` for editorial labeling, while micro text uses `lowercase` — a deliberate inversion for hierarchy signaling

## .. Component Stylings

### Buttons
Renault's buttons are sharp-edged rectangles with zero border-radius — the industrial precision of a pressed metal body panel.

**Super Primary (Yellow)** — The highest-emphasis CTA:
- Default: bg `#EFDF00` (Renault Yellow), text `#000000`, borderRadius 0px, padding .0px .5px, border .px solid `#EFDF00`
- Inverted: bg `#EFDF00`, text `#000000` — same yellow on dark backgrounds
- fontSize .6px (NouvelR), fontWeight 700, minHeight .6px, minWidth .6px
- Used for: Primary conversion actions (configure, buy now)

**Primary (Black)** — The default action button:
- Default: bg `#000000`, text `#FFFFFF`, borderRadius 0px, padding .0px .5px, border .px solid `#000000`
- Inverted: bg `#FFFFFF`, text `#000000`, border .px solid `#FFFFFF` — white fill on dark backgrounds
- fontSize .6px (NouvelR), fontWeight 700
- Used for: "keşfedin" (explore), secondary conversion actions

**Ghost** — Transparent outline button:
- Default (on dark): bg transparent, text `#FFFFFF`, border .px solid `#FFFFFF`, borderRadius 0px, padding .0px .5px
- Default (on light): bg transparent, text `#000000`, border .px solid `#000000`
- fontSize .6px (NouvelR), fontWeight 700
- Used for: "ilk sen öğren" (be the first to know), "satın alın" (buy), secondary actions

**Text Link** — Inline navigation:
- Default (light): text `#000000`, no border, no background
- Default (dark): text `#FFFFFF`
- Hover: color shifts to `#.883FD` (Renault Blue), text-decoration none
- All link variants hover to the same blue — consistent interactive feedback

### Cards & Containers

**PromoCard (Light)** — Editorial content card:
- Background: white or transparent
- Full-bleed photography with dark gradient overlay at top: `linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) .0%)`
- Heading: NouvelR .0px/700, white text positioned over gradient
- Border-radius: 0px — sharp rectangular containers
- No shadow, no visible border

**PromoCard (Dark / `is-alternative-mode`)** — Cinematic card:
- Background: `#000000` (Absolute Black)
- Same gradient overlay treatment
- Heading: white NouvelR text
- CTA buttons: inverted primary (white bg) or ghost (white border)

**VehicleRangeCard** — Vehicle showcase:
- Background: transparent
- Vehicle image above, model name and price/spec below
- No shadow, no border, clean flat treatment
- Spacing between cards via grid gap

### Inputs & Forms

**Search/Text Input:**
- Background: `#FFFFFF`
- Text: `#000000`
- Border: .px solid `#D.D.D.` (Border Gray)
- Border-radius: 50px (pill-shaped — unusual deviation from the zero-radius button system)
- Padding: 6px 35px 6px .5px (extra right padding for search icon)
- Font: NouvelR, .2.8px
- Focus: standard browser focus ring

### Navigation
- **Desktop**: Renault diamond logo centered/left, horizontal nav links, sticky positioning
- **Background**: white, no shadow at rest
- **Links**: NouvelR, .3px, weight 700, black text
- **Hover**: color shifts to `#.883FD` (Renault Blue)
- **Mobile**: Hamburger collapse to full-screen navigation drawer
- **CTA in nav**: Primary black button for main conversion action

### Image Treatment
- **Hero**: Full-viewport carousel with dramatic aurora-gradient backgrounds and art-directed vehicle photography — edge-to-edge, no padding
- **PromoCards**: Full-bleed photography within card bounds, dark gradient overlay at top for text legibility
- **Vehicle images**: Transparent-background renders on neutral/gradient backgrounds
- **Aspect ratios**: Mixed — hero at roughly .6:9 viewport, promo cards at various ratios from square to wide panoramic
- **Lazy loading**: Below-fold sections use lazy loading (framework-handled)

### Carousel Component
- Full-screen hero carousel with auto-advancing slides
- Each slide: background gradient/photo + vehicle image + headline + CTA buttons
- Dot indicators for slide position
- Navigation arrows at edges

## 5. Layout Principles

### Spacing System
- **Base unit**: 8px (detected system base)
- **Scale**: .px, .px, 5px, 6px, 6.25px, 8px, .0px, .2px, .3px, .5px, .6px, 20px, 2.px, 32px, .0px
- **Button padding**: .0px .5px — consistent across all button variants
- **Section padding**: Generous vertical spacing (.0–80px) between major content blocks
- **Card gaps**: .6–2.px between grid items
- **Minimum interactive size**: .6px (minWidth and minHeight on all buttons)

### Grid & Container
- **Max width**: ...0px (largest defined breakpoint)
- **Hero**: Full-bleed, edge-to-edge, viewport-height
- **PromoCard grid**: 2-up and 3-up layouts with mixed card sizes
- **Vehicle range**: Horizontal scrollable card row or grid
- **Footer**: Multi-column layout on white background

### Whitespace Philosophy
Renault uses whitespace moderately — more generously than Ferrari but less extremely than Tesla. The card-based layout means content is organized into defined containers rather than floating in void. The visual breathing room comes primarily from the large card formats and the full-bleed hero carousel, which gives each vehicle its own cinematic moment. Between sections, spacing is consistent (32–.0px) creating a rhythmic scroll experience. The alternation between light and dark sections also creates perceived whitespace — the mode switch itself acts as a visual separator.

### Border Radius Scale
| Value | Context |
|-------|---------|
| 0px | All buttons, PromoCards, most containers — the zero-radius default |
| 2px | Small UI elements (region controls) |
| 3px | Content panels (div, tabpanel) |
| .px | Labels and tag elements |
| .6px | Pill-shaped elements (search input, filter chips) |
| 50px | Full pill for search/input fields |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow | Default for PromoCards, buttons, most containers |
| Level . (Soft) | `rgba(0,0,0,0.2) 0px .px 8px` | Card hover states, subtle lift effect |
| Level 2 (Medium) | `rgba(0,0,0,0.2) 0px 0px .8px` | Floating UI elements, dropdown menus |
| Level 3 (Layered) | `rgba(0,0,0,0) 0px 2px .px, rgba(50,50,93,0..) 0px 7px ..px` | Compound shadow for elevated cards and modals |
| Level . (Deep) | `rgba(0,0,0,0..5) 0px .0px 80px` | Large floating panels, configurator overlays |
| Level 5 (Directional) | `rgba(0,0,0,0.2) 5px 5px 8px` | Offset directional shadow for specific components |
| Level 6 (Ambient) | `rgb(.99,.97,.99) 0px 0px .2px 2px` | Ambient glow effect for highlighted elements |

### Shadow Philosophy
Renault uses a richer shadow system than Ferrari or Tesla — seven distinct shadow tokens reflecting a more layered, dimensional interface. The shadows progress from subtle .px hover lifts to dramatic 80px deep panels. The compound shadow (Level 3) with its dual-layer approach (a tight dark shadow plus a wider purple-tinted one from `rgba(50,50,93,0..)`) is particularly refined — it creates a photorealistic floating effect. The ambient glow (Level 6) in warm gray adds a unique touch that connects to Renault's warmer color personality.

### Decorative Depth
- **Hero aurora gradients**: The primary decorative depth element — vivid color gradients create atmospheric depth behind vehicle imagery
- **PromoCard overlays**: `linear-gradient(rgba(0,0,0,0.6) → transparent)` creates depth within cards through transparency
- **No blur effects** on UI elements — depth is communicated through shadow and color contrast

## 7. Do's and Don'ts

### Do
- Use Renault Yellow (`#EFDF00`) exclusively for super-primary CTAs — it carries the full weight of the diamond logo's identity
- Maintain zero border-radius on all buttons — sharp edges are non-negotiable in the Renault system
- Use NouvelR Bold (700) as the default heading weight — the assertive weight is central to the brand's energetic personality
- Apply the dark gradient overlay (`rgba(0,0,0,0.6) → transparent`) on PromoCards to ensure text legibility over photography
- Keep hero line-heights ultra-tight (0.95) for display text — the compressed texture feels urgent and modern
- Alternate between black and white sections to create the signature chessboard rhythm
- Use `#.883FD` (Renault Blue) consistently for all link hover states — one interactive color signal
- Set minimum interactive size at .6×.6px for all buttons — accessibility built into the component spec
- Reserve pill-shaped radius (.6–50px) exclusively for search inputs and filter elements — never for buttons
- Use the PromoCard gradient overlay on every card that has text over photography

### Don't
- Apply Renault Yellow as a background color for sections or surfaces — it's a CTA signal, not an atmosphere color
- Add border-radius to buttons — the zero-radius rectangle is a core brand marker
- Use any typeface besides NouvelR — the single-family discipline is a brand pillar
- Mix multiple chromatic accent colors in a single section — the palette is monochrome-plus-yellow
- Soften heading weights to .00 or 500 — NouvelR Bold is the brand voice, lighter weights read as off-brand
- Add decorative borders to PromoCards or content containers — separation comes from background color alternation
- Use the semantic colors (Success Green, Error Rose) for decorative purposes — they're reserved for form states
- Apply the 56px hero size to anything below the fold — hero typography scale is reserved for the carousel
- Create rounded-pill buttons — pill shapes are reserved for inputs, never for action elements
- Use flat CSS gradients on UI surfaces — the only gradients should be the photographic hero auroras and the text-legibility overlays

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | ≤.25px | Single-column, full-width cards, hero text scales to ~32px, stacked CTAs, hamburger nav |
| Mobile | .26–6.0px | Single-column, slightly larger cards, hero text at 32–.0px |
| Tablet Small | 6..–768px | 2-column PromoCard grid begins, hero maintains full-width |
| Tablet | 769–896px | Full 2-column layout, vehicle range shows 2–3 cards |
| Desktop Small | 897–.02.px | Navigation fully expanded, hero at 56px, 2-up card grid |
| Desktop | .025–.280px | Full layout, 3-up card grid, generous whitespace |
| Large Desktop | .28.–...0px | Maximum content width, centered container, hero at full cinematic scale |

### Touch Targets
- All buttons: minimum .6×.6px (`minWidth: .6px, minHeight: .6px`) — exceeds WCAG AAA ..×..px requirement
- Search input pill: adequate touch target with 50px border-radius creating a large tappable area
- Navigation links: NouvelR .3px with adequate spacing between items
- Carousel navigation: large arrow targets at viewport edges

### Collapsing Strategy
- **Navigation**: Full horizontal nav collapses to Renault diamond logo + hamburger menu on mobile
- **Hero carousel**: Full-width at all breakpoints, headline scales from 56px (desktop) to ~32px (mobile)
- **PromoCard grid**: 3-up → 2-up → single-column as viewport narrows
- **Vehicle range**: Horizontal scroll maintained at all sizes, visible cards reduce
- **CTA pairs**: Side-by-side buttons stack vertically on mobile
- **Footer**: Multi-column collapses to single-column accordion on mobile

### Image Behavior
- Hero images: full-bleed at all breakpoints with `object-fit: cover`
- PromoCard images: responsive within card containers, gradient overlay scales proportionally
- Vehicle images: transparent-background renders scale proportionally within grid cells
- Art direction: mobile may crop to tighter vehicle views, reducing environmental context

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA (Super): "Renault Yellow (#EFDF00)"
- Primary CTA (Default): "Absolute Black (#000000)"
- Background Light: "Pure White (#FFFFFF)"
- Background Dark: "Absolute Black (#000000)"
- Secondary Dark: "Charcoal (#222222)"
- Heading text (light bg): "Absolute Black (#000000)"
- Body text: "Absolute Black (#000000)"
- Link Hover: "Renault Blue (#.883FD)"
- Border: "Pale Silver (#F2F2F2)"
- Semantic Error: "Error Rose (#BE6.6.)"

### Example Component Prompts
- "Create a hero section with a full-viewport aurora gradient background (magenta to violet to teal), a centered vehicle image, a NouvelR Bold headline at 56px with 0.95 line-height in white, and two buttons: a Primary (white bg, black text, 0px radius) 'Scout' and a Ghost (transparent bg, white border, white text, 0px radius) 'Learn More'"
- "Design a PromoCard with a full-bleed photography background, a dark gradient overlay (rgba(0,0,0,0.6) top to transparent at .0%), a NouvelR Bold .0px white heading, a ..px body text line in white, and a Primary inverted button (white bg, black text, 0px radius, .0px .5px padding)"
- "Build a vehicle range grid with 3 columns on white background, each card showing a transparent-background car render above a NouvelR Bold 2.px model name in black, a ..px price caption, and a ghost button (black border, black text, 0px radius) labeled 'Configure'"
- "Create a dark E-Tech section on Absolute Black (#000000) with a NouvelR Bold .0px white heading 'E-Tech electric powertrain', a ..px subtitle in white, and a Renault Yellow (#EFDF00) super-primary button with black text, 0px radius, and .0px .5px padding"
- "Design a search input as a pill-shaped field (50px border-radius) with white background, .px solid #D.D.D. border, NouvelR .2.8px text, 6px 35px 6px .5px padding, and a search icon positioned inside the right padding area"

### Iteration Guide
When refining existing screens generated with this design system:
.. Focus on ONE component at a time — Renault's system has clear component boundaries (PromoCard, VehicleRangeCard, CTA variants)
2. Reference specific color names and hex codes — the palette is small but each color has a precise function
3. Use natural language descriptions, not CSS values — "sharp zero-radius rectangle" conveys intent better than "border-radius: 0"
.. Describe the desired "feel" alongside specific measurements — "assertive automotive energy" communicates the NouvelR Bold heading personality better than "font-weight: 700"
5. Always check whether a section should be light or dark — the chessboard alternation is a core pattern
6. Reserve Renault Yellow for ONE button per screen — if yellow appears in more than one CTA, the hierarchy collapses
