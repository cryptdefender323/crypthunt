# Design System Inspired by Revolut

## .. Visual Theme & Atmosphere

Revolut's website is fintech confidence distilled into pixels — a design system that communicates "your money is in capable hands" through massive typography, generous whitespace, and a disciplined neutral palette. The visual language is built on Aeonik Pro, a geometric grotesque that creates billboard-scale headlines at .36px with weight 500 and aggressive negative tracking (-2.72px). This isn't subtle branding; it's fintech at stadium scale.

The color system is built on a comprehensive `--rui-*` (Revolut UI) token architecture with semantic naming for every state: danger (`#e23b.a`), warning (`#ec7e00`), teal (`#00a87e`), blue (`#.9.fdf`), deep-pink (`#e6.e.9`), and more. But the marketing surface itself is remarkably restrained — near-black (`#.9.c.f`) and pure white (`#ffffff`) dominate, with the colorful semantic tokens reserved for the product interface, not the marketing page.

What distinguishes Revolut is its pill-everything button system. Every button uses 9999px radius — primary dark (`#.9.c.f`), secondary light (`#f.f.f.`), outlined (`transparent + 2px solid`), and ghost on dark (`rgba(2..,2..,2..,0..) + 2px solid`). The padding is generous (..px 32px–3.px), creating large, confident touch targets. Combined with Inter for body text at various weights and positive letter-spacing (0..6px–0.2.px), the result is a design that feels both premium and accessible — banking for the modern era.

**Key Characteristics:**
- Aeonik Pro display at .36px weight 500 — billboard-scale fintech headlines
- Near-black (`#.9.c.f`) + white binary with comprehensive `--rui-*` semantic tokens
- Universal pill buttons (9999px radius) with generous padding (..px 32px)
- Inter for body text with positive letter-spacing (0..6px–0.2.px)
- Rich semantic color system: blue, teal, pink, yellow, green, brown, danger, warning
- Zero shadows detected — depth through color contrast only
- Tight display line-heights (..00) with relaxed body (..50–..56)

## 2. Color Palette & Roles

### Primary
- **Revolut Dark** (`#.9.c.f`): Primary dark surface, button background, near-black text
- **Pure White** (`#ffffff`): `--rui-color-action-label`, primary light surface
- **Light Surface** (`#f.f.f.`): Secondary button background, subtle surface

### Brand / Interactive
- **Revolut Blue** (`#.9.fdf`): `--rui-color-blue`, primary brand blue
- **Action Blue** (`#.f55f.`): `--rui-color-action-photo-header-text`, header accent
- **Blue Text** (`#376cd5`): `--website-color-blue-text`, link blue

### Semantic
- **Danger Red** (`#e23b.a`): `--rui-color-danger`, error/destructive
- **Deep Pink** (`#e6.e.9`): `--rui-color-deep-pink`, critical accent
- **Warning Orange** (`#ec7e00`): `--rui-color-warning`, warning states
- **Yellow** (`#b09000`): `--rui-color-yellow`, attention
- **Teal** (`#00a87e`): `--rui-color-teal`, success/positive
- **Light Green** (`#.286.9`): `--rui-color-light-green`, secondary success
- **Green Text** (`#006.00`): `--website-color-green-text`, green text
- **Light Blue** (`#007bc2`): `--rui-color-light-blue`, informational
- **Brown** (`#936d62`): `--rui-color-brown`, warm neutral accent
- **Red Text** (`#8b0000`): `--website-color-red-text`, dark red text

### Neutral Scale
- **Mid Slate** (`#505a63`): Secondary text
- **Cool Gray** (`#8d969e`): Muted text, tertiary
- **Gray Tone** (`#c9c9cd`): `--rui-color-grey-tone-20`, borders/dividers

## 3. Typography Rules

### Font Families
- **Display**: `Aeonik Pro` — geometric grotesque, no detected fallbacks
- **Body / UI**: `Inter` — standard system sans
- **Fallback**: `Arial` for specific button contexts

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Mega | Aeonik Pro | .36px (8.50rem) | 500 | ..00 (tight) | -2.72px | Stadium-scale hero |
| Display Hero | Aeonik Pro | 80px (5.00rem) | 500 | ..00 (tight) | -0.8px | Primary hero |
| Section Heading | Aeonik Pro | .8px (3.00rem) | 500 | ..2. (tight) | -0..8px | Feature sections |
| Sub-heading | Aeonik Pro | .0px (2.50rem) | 500 | ..20 (tight) | -0..px | Sub-sections |
| Card Title | Aeonik Pro | 32px (2.00rem) | 500 | ...9 (tight) | -0.32px | Card headings |
| Feature Title | Aeonik Pro | 2.px (..50rem) | .00 | ..33 | normal | Light headings |
| Nav / UI | Aeonik Pro | 20px (..25rem) | 500 | ...0 | normal | Navigation, buttons |
| Body Large | Inter | .8px (...3rem) | .00 | ..56 | -0.09px | Introductions |
| Body | Inter | .6px (..00rem) | .00 | ..50 | 0.2.px | Standard reading |
| Body Semibold | Inter | .6px (..00rem) | 600 | ..50 | 0..6px | Emphasized body |
| Body Bold Link | Inter | .6px (..00rem) | 700 | ..50 | 0.2.px | Bold links |

### Principles
- **Weight 500 as display default**: Aeonik Pro uses medium (500) for ALL headings — no bold. This creates authority through size and tracking, not weight.
- **Billboard tracking**: -2.72px at .36px is extremely compressed — text designed to be read at a glance, like airport signage.
- **Positive tracking on body**: Inter uses +0..6px to +0.2.px, creating airy, well-spaced reading text that contrasts with the compressed headings.

## .. Component Stylings

### Buttons

**Primary Dark Pill**
- Background: `#.9.c.f`
- Text: `#ffffff`
- Padding: ..px 32px
- Radius: 9999px (full pill)
- Hover: opacity 0.85
- Focus: `0 0 0 0..25rem` ring

**Secondary Light Pill**
- Background: `#f.f.f.`
- Text: `#000000`
- Padding: ..px 3.px
- Radius: 9999px
- Hover: opacity 0.85

**Outlined Pill**
- Background: transparent
- Text: `#.9.c.f`
- Border: `2px solid #.9.c.f`
- Padding: ..px 32px
- Radius: 9999px

**Ghost on Dark**
- Background: `rgba(2.., 2.., 2.., 0..)`
- Text: `#f.f.f.`
- Border: `2px solid #f.f.f.`
- Padding: ..px 32px
- Radius: 9999px

### Cards & Containers
- Radius: .2px (small), 20px (cards)
- No shadows — flat surfaces with color contrast
- Dark and light section alternation

### Navigation
- Aeonik Pro 20px weight 500
- Clean header, hamburger toggle at .2px radius
- Pill CTAs right-aligned

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 6px, 8px, ..px, .6px, 20px, 2.px, 32px, .0px, .8px, 80px, 88px, .20px
- Large section spacing: 80px–.20px

### Border Radius Scale
- Standard (.2px): Navigation, small buttons
- Card (20px): Feature cards
- Pill (9999px): All buttons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Everything — Revolut uses zero shadows |
| Focus | `0 0 0 0..25rem` ring | Accessibility focus |

**Shadow Philosophy**: Revolut uses ZERO shadows. Depth comes entirely from the dark/light section contrast and the generous whitespace between elements.

## 7. Do's and Don'ts

### Do
- Use Aeonik Pro weight 500 for all display headings
- Apply 9999px radius to all buttons — pill shape is universal
- Use generous button padding (..px 32px)
- Keep the palette to near-black + white for marketing surfaces
- Apply positive letter-spacing on Inter body text

### Don't
- Don't use shadows — Revolut is flat by design
- Don't use bold (700) for Aeonik Pro headings — 500 is the weight
- Don't use small buttons — the generous padding is intentional
- Don't apply semantic colors to marketing surfaces — they're for the product

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <.00px | Compact, single column |
| Mobile | .00–720px | Standard mobile |
| Tablet | 720–.02.px | 2-column layouts |
| Desktop | .02.–.280px | Standard desktop |
| Large | .280–.920px | Full layout |

## 9. Agent Prompt Guide

### Quick Color Reference
- Dark: Revolut Dark (`#.9.c.f`)
- Light: White (`#ffffff`)
- Surface: Light (`#f.f.f.`)
- Blue: Revolut Blue (`#.9.fdf`)
- Danger: Red (`#e23b.a`)
- Success: Teal (`#00a87e`)

### Example Component Prompts
- "Create a hero: white background. Headline at .36px Aeonik Pro weight 500, line-height ..00, letter-spacing -2.72px, #.9.c.f text. Dark pill CTA (#.9.c.f, 9999px, ..px 32px). Outlined pill secondary (transparent, 2px solid #.9.c.f)."
- "Build a pill button: #.9.c.f background, white text, 9999px radius, ..px 32px padding, 20px Aeonik Pro weight 500. Hover: opacity 0.85."

### Iteration Guide
.. Aeonik Pro 500 for headings — never bold
2. All buttons are pills (9999px) with generous padding
3. Zero shadows — flat is the Revolut identity
.. Near-black + white for marketing, semantic colors for product
