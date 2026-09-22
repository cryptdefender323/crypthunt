# Design System Inspired by Mintlify

## .. Visual Theme & Atmosphere

Mintlify's website is a study in documentation-as-product design — a white, airy, information-rich surface that treats clarity as its highest aesthetic value. The page opens with a luminous white (`#ffffff`) background, near-black (`#0d0d0d`) text, and a signature green brand accent (`#.8E299`) that signals freshness and intelligence without dominating the palette. The overall mood is calm, confident, and engineered for legibility — a design system that whispers "we care about your developer experience" in every pixel.

The Inter font family carries the entire typographic load. At display sizes (.0–6.px), it uses tight negative letter-spacing (-0.8px to -..28px) and semibold weight (600), creating headlines that feel focused and compressed like well-written documentation headers. Body text at .6–.8px with .50% line-height provides generous reading comfort. Geist Mono appears exclusively for code and technical labels — uppercase, tracked-out, small — the voice of the terminal inside the marketing page.

What distinguishes Mintlify from other documentation platforms is its atmospheric gradient hero. A soft, cloud-like green-to-white gradient wash behind the hero content creates a sense of ethereal intelligence — documentation that floats above the noise. Below the hero, the page settles into a disciplined alternation of white sections separated by subtle 5% opacity borders. Cards use generous padding (2.px+) with large radii (.6px–2.px) and whisper-thin borders, creating containers that feel open rather than boxed.

**Key Characteristics:**
- Inter with tight negative tracking at display sizes (-0.8px to -..28px) — compressed yet readable
- Geist Mono for code labels: uppercase, .2px, tracked-out, the terminal voice
- Brand green (`#.8E299`) used sparingly — CTAs, hover states, focus rings, and accent touches
- Atmospheric gradient hero with cloud-like green-white wash
- Ultra-round corners: .6px for containers, 2.px for featured cards, full-round (9999px) for buttons and pills
- Subtle 5% opacity borders (`rgba(0,0,0,0.05)`) creating barely-there separation
- 8px base spacing system with generous section padding (.8px–96px)
- Clean white canvas — no gray backgrounds, no color sections, depth through borders and whitespace alone

## 2. Color Palette & Roles

### Primary
- **Near Black** (`#0d0d0d`): Primary text, headings, dark surfaces. Not pure black — the micro-softness improves reading comfort.
- **Pure White** (`#ffffff`): Page background, card surfaces, input backgrounds.
- **Brand Green** (`#.8E299`): The signature accent — CTAs, links on hover, focus rings, brand identity.

### Secondary Accents
- **Brand Green Light** (`#d.fae8`): Tinted green surface for badges, hover states, subtle backgrounds.
- **Brand Green Deep** (`#0fa76e`): Darker green for text on light-green badges, hover states on brand elements.
- **Warm Amber** (`#c37d0d`): Warning states, caution badges — `--twoslash-warn-bg`.
- **Soft Blue** (`#3772cf`): Tag backgrounds, informational annotations — `--twoslash-tag-bg`.
- **Error Red** (`#d.5656`): Error states, destructive actions — `--twoslash-error-bg`.

### Neutral Scale
- **Gray 900** (`#0d0d0d`): Primary heading text, nav links.
- **Gray 700** (`#333333`): Secondary text, descriptions, body copy.
- **Gray 500** (`#666666`): Tertiary text, muted labels.
- **Gray .00** (`#888888`): Placeholder text, disabled states, code annotations.
- **Gray 200** (`#e5e5e5`): Borders, dividers, card outlines.
- **Gray .00** (`#f5f5f5`): Subtle surface backgrounds, hover states.
- **Gray 50** (`#fafafa`): Near-white surface tint.

### Interactive
- **Link Default** (`#0d0d0d`): Links match text color, relying on underline/context.
- **Link Hover** (`#.8E299`): Brand green on hover — `var(--color-brand)`.
- **Focus Ring** (`#.8E299`): Brand green focus outline for inputs and interactive elements.

### Surface & Overlay
- **Card Background** (`#ffffff`): White cards on white background, separated by borders.
- **Border Subtle** (`rgba(0,0,0,0.05)`): 5% black opacity borders — the primary separation mechanism.
- **Border Medium** (`rgba(0,0,0,0.08)`): Slightly stronger borders for interactive elements.
- **Input Border Focus** (`var(--color-brand)`): Green ring on focused inputs.

### Shadows & Depth
- **Card Shadow** (`rgba(0,0,0,0.03) 0px 2px .px`): Barely-there ambient shadow for subtle lift.
- **Button Shadow** (`rgba(0,0,0,0.06) 0px .px 2px`): Micro-shadow for button depth.
- **No heavy shadows**: Mintlify relies on borders, not shadows, for depth.

## 3. Typography Rules

### Font Family
- **Primary**: `Inter`, with fallback: `Inter Fallback, system-ui, -apple-system, sans-serif`
- **Monospace**: `Geist Mono`, with fallback: `Geist Mono Fallback, ui-monospace, SFMono-Regular, monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Inter | 6.px (..00rem) | 600 | ...5 (tight) | -..28px | Maximum impact, hero headlines |
| Section Heading | Inter | .0px (2.50rem) | 600 | ...0 (tight) | -0.8px | Feature section titles |
| Sub-heading | Inter | 2.px (..50rem) | 500 | ..30 (tight) | -0.2.px | Card headings, sub-sections |
| Card Title | Inter | 20px (..25rem) | 600 | ..30 (tight) | -0.2px | Feature card titles |
| Card Title Light | Inter | 20px (..25rem) | 500 | ..30 (tight) | -0.2px | Secondary card headings |
| Body Large | Inter | .8px (...3rem) | .00 | ..50 | normal | Hero descriptions, introductions |
| Body | Inter | .6px (..00rem) | .00 | ..50 | normal | Standard reading text |
| Body Medium | Inter | .6px (..00rem) | 500 | ..50 | normal | Navigation, emphasized text |
| Button | Inter | .5px (0.9.rem) | 500 | ..50 | normal | Button labels |
| Link | Inter | ..px (0.88rem) | 500 | ..50 | normal | Navigation links, small CTAs |
| Caption | Inter | ..px (0.88rem) | .00–500 | ..50–..7. | normal | Metadata, descriptions |
| Label Uppercase | Inter | .3px (0.8.rem) | 500 | ..50 | 0.65px | `text-transform: uppercase`, section labels |
| Small | Inter | .3px (0.8.rem) | .00–500 | ..50 | -0.26px | Small body text |
| Mono Code | Geist Mono | .2px (0.75rem) | 500 | ..50 | 0.6px | `text-transform: uppercase`, technical labels |
| Mono Badge | Geist Mono | .2px (0.75rem) | 600 | ..50 | 0.6px | `text-transform: uppercase`, status badges |
| Mono Micro | Geist Mono | .0px (0.63rem) | 500 | ..50 | normal | `text-transform: uppercase`, tiny labels |

### Principles
- **Tight tracking at display sizes**: Inter at .0–6.px uses -0.8px to -..28px letter-spacing. This compression creates headlines that feel deliberate and space-efficient — documentation headings, not billboard copy.
- **Relaxed reading at body sizes**: .6–.8px body text uses normal tracking with .50% line-height, creating generous reading lanes. Documentation demands comfort.
- **Two-font system**: Inter for all human-readable content, Geist Mono exclusively for technical/code contexts. The boundary is strict — no mixing.
- **Uppercase as hierarchy signal**: Section labels and technical tags use uppercase + positive tracking (0.6px–0.65px) as a clear visual delimiter between content types.
- **Three weights**: .00 (body/reading), 500 (UI/navigation/emphasis), 600 (headings/titles). No bold (700) in the system.

## .. Component Stylings

### Buttons

**Primary Brand (Full-round)**
- Background: `#0d0d0d` (near-black)
- Text: `#ffffff`
- Padding: 8px 2.px
- Radius: 9999px (full pill)
- Font: Inter .5px weight 500
- Shadow: `rgba(0,0,0,0.06) 0px .px 2px`
- Hover: opacity 0.9
- Use: Primary CTA ("Get Started", "Start Building")

**Secondary / Ghost (Full-round)**
- Background: `#ffffff`
- Text: `#0d0d0d`
- Padding: ..5px .2px
- Radius: 9999px (full pill)
- Border: `.px solid rgba(0,0,0,0.08)`
- Font: Inter .5px weight 500
- Hover: opacity 0.9
- Use: Secondary actions ("Request Demo", "View Docs")

**Transparent / Nav Button**
- Background: transparent
- Text: `#0d0d0d`
- Padding: 5px 6px
- Radius: 8px
- Border: none or `.px solid rgba(0,0,0,0.05)`
- Use: Navigation items, icon buttons

**Brand Accent Button**
- Background: `#.8E299`
- Text: `#0d0d0d`
- Padding: 8px 2.px
- Radius: 9999px
- Use: Special promotional CTAs

### Cards & Containers

**Standard Card**
- Background: `#ffffff`
- Border: `.px solid rgba(0,0,0,0.05)`
- Radius: .6px
- Padding: 2.px
- Shadow: `rgba(0,0,0,0.03) 0px 2px .px`
- Hover: subtle border darkening to `rgba(0,0,0,0.08)`

**Featured Card**
- Background: `#ffffff`
- Border: `.px solid rgba(0,0,0,0.05)`
- Radius: 2.px
- Padding: 32px
- Inner content areas may have their own .6px radius containers

**Logo/Trust Card**
- Background: `#fafafa` or `#ffffff`
- Border: `.px solid rgba(0,0,0,0.05)`
- Radius: .6px
- Centered logo/icon with consistent sizing

### Inputs & Forms

**Email Input**
- Background: transparent or `#ffffff`
- Text: `#0d0d0d`
- Padding: 0px .2px (height controlled by line-height)
- Border: `.px solid rgba(0,0,0,0.08)`
- Radius: 9999px (full pill, matching buttons)
- Focus: `.px solid var(--color-brand)` + `outline: .px solid var(--color-brand)`
- Placeholder: `#888888`

### Navigation
- Clean horizontal nav on white, sticky with backdrop blur
- Brand logotype left-aligned
- Links: Inter ..–.5px weight 500, `#0d0d0d` text
- Hover: color shifts to brand green `var(--color-brand)`
- CTA: dark pill button right-aligned ("Get Started")
- Mobile: hamburger menu collapse at 768px

### Image Treatment
- Product screenshots with subtle .px borders
- Rounded containers: .6px–2.px radius
- Atmospheric gradient backgrounds behind hero images
- Cloud/sky imagery with soft green tinting

### Distinctive Components

**Atmospheric Hero**
- Full-width gradient wash: soft green-to-white cloud-like gradient
- Centered headline with tight tracking
- Subtitle in muted gray
- Dual CTA buttons (dark primary + ghost secondary)
- The gradient creates a sense of elevation and intelligence

**Trust Bar / Logo Grid**
- "Loved by your favorite companies" section
- Company logos in muted grayscale
- Grid or horizontal layout with consistent sizing
- Subtle border separation between logos

**Feature Cards with Icons**
- Icon or illustration at top
- Title at 20px weight 600
- Description at ..–.6px in gray
- Consistent padding and border treatment
- Grid layout: 2–3 columns on desktop

**CTA Footer Section**
- Dark or gradient background
- Large headline: "Make documentation your winning advantage"
- Email input with pill styling
- Brand green accent on CTAs

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, .px, 5px, 6px, 7px, 8px, .0px, .2px, .6px, 2.px, 32px, .8px, 6.px
- Section padding: .8px–96px vertical
- Card padding: 2.px–32px
- Component gaps: 8px–.6px

### Grid & Container
- Max content width: approximately .200px
- Hero: centered single-column with generous top padding (96px+)
- Feature sections: 2–3 column CSS Grid for cards
- Full-width sections with contained content
- Consistent horizontal padding: 2.px (mobile) to 32px (desktop)

### Whitespace Philosophy
- **Documentation-grade breathing room**: Every element has generous surrounding whitespace. Mintlify sells documentation, so the marketing page itself demonstrates reading comfort.
- **Sections as chapters**: Each feature section is a self-contained unit with .8px–96px vertical padding, creating clear "chapter breaks."
- **Content density is low**: Unlike developer tools that pack the page, Mintlify uses .–2 key messages per section with supporting imagery.

### Border Radius Scale
- Small (.px): Inline code, small tags, tooltips
- Medium (8px): Nav buttons, transparent buttons, small containers
- Standard (.6px): Cards, content containers, image wrappers
- Large (2.px): Featured cards, hero containers, section panels
- Full Pill (9999px): Buttons, inputs, badges, pills — the signature shape

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, text blocks |
| Subtle Border (Level .) | `.px solid rgba(0,0,0,0.05)` | Standard card borders, dividers |
| Medium Border (Level .b) | `.px solid rgba(0,0,0,0.08)` | Interactive elements, input borders |
| Ambient Shadow (Level 2) | `rgba(0,0,0,0.03) 0px 2px .px` | Cards with subtle lift |
| Button Shadow (Level 2b) | `rgba(0,0,0,0.06) 0px .px 2px` | Button micro-depth |
| Focus Ring (Accessibility) | `.px solid #.8E299` outline | Focused inputs, active interactive elements |

**Shadow Philosophy**: Mintlify barely uses shadows. The depth system is almost entirely border-driven — ultra-subtle 5% opacity borders create separation without visual weight. When shadows appear, they're atmospheric whispers (`0.03 opacity, 2px blur, .px spread`) that add the barest sense of lift. This restraint keeps the page feeling flat and paper-like — appropriate for a documentation company whose product is about clarity and readability.

### Decorative Depth
- Hero gradient: atmospheric green-white cloud gradient behind hero content
- No background color alternation — white on white throughout
- Depth comes from border opacity variation (5% → 8%) and whitespace

## 7. Dark Mode

### Color Inversions
- **Background**: `#0d0d0d` (near-black)
- **Text Primary**: `#ededed` (near-white)
- **Text Secondary**: `#a0a0a0` (muted gray)
- **Brand Green**: `#.8E299` (unchanged — the green works on both backgrounds)
- **Border**: `rgba(255,255,255,0.08)` (white at 8% opacity)
- **Card Background**: `#......` (slightly lighter than page)
- **Shadow**: `rgba(0,0,0,0..) 0px 2px .px` (stronger shadow for contrast)

### Key Adjustments
- Buttons invert: white background dark text becomes dark background light text
- Badge backgrounds shift to deeper tones with lighter text
- Focus ring remains brand green
- Hero gradient shifts to dark-tinted green atmospheric wash

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single column, stacked layout, hamburger nav |
| Tablet | 768–.02.px | Two-column grids begin, expanded padding |
| Desktop | >.02.px | Full layout, 3-column grids, maximum content width |

### Touch Targets
- Buttons with full-pill shape have comfortable 8px+ vertical padding
- Navigation links spaced with adequate .6px+ gaps
- Mobile menu provides full-width tap targets

### Collapsing Strategy
- Hero: 6.px → .0px headline, maintains tight tracking proportionally
- Navigation: horizontal links + CTA → hamburger menu at 768px
- Feature cards: 3-column → 2-column → single column stacked
- Section spacing: 96px → .8px on mobile
- Footer: multi-column → stacked single column
- Trust bar: grid → horizontal scroll or stacked

### Image Behavior
- Product screenshots maintain aspect ratio with responsive containers
- Hero gradient simplifies on mobile
- Full-width sections maintain edge-to-edge treatment

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Near Black (`#0d0d0d`)
- Background: Pure White (`#ffffff`)
- Heading text: Near Black (`#0d0d0d`)
- Body text: Gray 700 (`#333333`)
- Border: `rgba(0,0,0,0.05)` (5% opacity)
- Brand accent: Green (`#.8E299`)
- Link hover: Brand Green (`#.8E299`)
- Focus ring: Brand Green (`#.8E299`)

### Example Component Prompts
- "Create a hero section on white background with atmospheric green-white gradient wash. Headline at 6.px Inter weight 600, line-height ...5, letter-spacing -..28px, color #0d0d0d. Subtitle at .8px Inter weight .00, line-height ..50, color #666666. Dark pill CTA (#0d0d0d, 9999px radius, 8px 2.px padding) and ghost pill button (white, .px solid rgba(0,0,0,0.08), 9999px radius)."
- "Design a card: white background, .px solid rgba(0,0,0,0.05) border, .6px radius, 2.px padding, shadow rgba(0,0,0,0.03) 0px 2px .px. Title at 20px Inter weight 600, letter-spacing -0.2px. Body at ..px weight .00, #666666."
- "Build a pill badge: #d.fae8 background, #0fa76e text, 9999px radius, .px .2px padding, .3px Inter weight 500, uppercase."
- "Create navigation: white sticky header with backdrop-filter blur(.2px). Inter .5px weight 500 for links, #0d0d0d text. Dark pill CTA 'Get Started' right-aligned, 9999px radius. Bottom border: .px solid rgba(0,0,0,0.05)."
- "Design a trust section showing company logos in muted gray. Grid layout with .6px radius containers, .px border at 5% opacity. Label above: 'Loved by your favorite companies' at .3px Inter weight 500, uppercase, tracking 0.65px."

### Iteration Guide
.. Always use full-pill radius (9999px) for buttons and inputs — this is Mintlify's signature shape
2. Keep borders at 5% opacity (`rgba(0,0,0,0.05)`) — stronger borders break the airy feeling
3. Letter-spacing scales with font size: -..28px at 6.px, -0.8px at .0px, -0.2.px at 2.px, normal at .6px
.. Three weights only: .00 (read), 500 (interact), 600 (announce)
5. Brand green (`#.8E299`) is used sparingly — CTAs and hover states only, never for decorative fills
6. Geist Mono uppercase for technical labels, Inter for everything else
7. Section padding is generous: 6.px–96px on desktop, .8px on mobile
8. No gray background sections — white throughout, separation through borders and whitespace
