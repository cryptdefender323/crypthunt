# Design System Inspired by Wise

## .. Visual Theme & Atmosphere

Wise's website is a bold, confident fintech platform that communicates "money without borders" through massive typography and a distinctive lime-green accent. The design operates on a warm off-white canvas with near-black text (`#0e0f0c`) and a signature Wise Green (`#9fe870`) — a fresh, lime-bright color that feels alive and optimistic, unlike the corporate blues of traditional banking.

The typography uses Wise Sans — a proprietary font used at extreme weight 900 (black) for display headings with a remarkably tight line-height of 0.85 and OpenType `"calt"` (contextual alternates). At .26px, the text is so dense it feels like a protest sign — bold, urgent, and impossible to ignore. Inter serves as the body font with weight 600 as the default for emphasis, creating a consistently confident voice.

What distinguishes Wise is its green-on-white-on-black material palette. Lime Green (`#9fe870`) appears on buttons with dark green text (`#.63300`), creating a nature-inspired CTA that feels fresh. Hover states use `scale(..05)` expansion rather than color changes — buttons physically grow on interaction. The border-radius system uses 9999px for buttons (pill), 30px–.0px for cards, and the shadow system is minimal — just `rgba(..,.5,.2,0..2) 0px 0px 0px .px` ring shadows.

**Key Characteristics:**
- Wise Sans at weight 900, 0.85 line-height — billboard-scale bold headlines
- Lime Green (`#9fe870`) accent with dark green text (`#.63300`) — nature-inspired fintech
- Inter body at weight 600 as default — confident, not light
- Near-black (`#0e0f0c`) primary with warm green undertone
- Scale(..05) hover animations — buttons physically grow
- OpenType `"calt"` on all text
- Pill buttons (9999px) and large rounded cards (30px–.0px)
- Semantic color system with comprehensive state management

## 2. Color Palette & Roles

### Primary Brand
- **Near Black** (`#0e0f0c`): Primary text, background for dark sections
- **Wise Green** (`#9fe870`): Primary CTA button, brand accent
- **Dark Green** (`#.63300`): Button text on green, deep green accent
- **Light Mint** (`#e2f6d5`): Soft green surface, badge backgrounds
- **Pastel Green** (`#cdffad`): `--color-interactive-contrast-hover`, hover accent

### Semantic
- **Positive Green** (`#05.d28`): `--color-sentiment-positive-primary`, success
- **Danger Red** (`#d03238`): `--color-interactive-negative-hover`, error/destructive
- **Warning Yellow** (`#ffd..a`): `--color-sentiment-warning-hover`, warnings
- **Background Cyan** (`rgba(56,200,255,0..0)`): `--color-background-accent`, info tint
- **Bright Orange** (`#ffc09.`): `--color-bright-orange`, warm accent

### Neutral
- **Warm Dark** (`#.5.7.5`): Secondary text, borders
- **Gray** (`#868685`): Muted text, tertiary
- **Light Surface** (`#e8ebe6`): Subtle green-tinted light surface

## 3. Typography Rules

### Font Families
- **Display**: `Wise Sans`, fallback: `Inter` — OpenType `"calt"` on all text
- **Body / UI**: `Inter`, fallbacks: `Helvetica, Arial`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Mega | Wise Sans | .26px (7.88rem) | 900 | 0.85 (ultra-tight) | normal | `"calt"` |
| Display Hero | Wise Sans | 96px (6.00rem) | 900 | 0.85 | normal | `"calt"` |
| Section Heading | Wise Sans | 6.px (..00rem) | 900 | 0.85 | normal | `"calt"` |
| Sub-heading | Wise Sans | .0px (2.50rem) | 900 | 0.85 | normal | `"calt"` |
| Alt Heading | Inter | 78px (..88rem) | 600 | ...0 (tight) | -2.3.px | `"calt"` |
| Card Title | Inter | 26px (..62rem) | 600 | ..23 (tight) | -0.39px | `"calt"` |
| Feature Title | Inter | 22px (..38rem) | 600 | ..25 (tight) | -0.396px | `"calt"` |
| Body | Inter | .8px (...3rem) | .00 | .... | 0..8px | `"calt"` |
| Body Semibold | Inter | .8px (...3rem) | 600 | .... | -0..08px | `"calt"` |
| Button | Inter | .8px–22px | 600 | ..00–.... | -0..08px | `"calt"` |
| Caption | Inter | ..px (0.88rem) | .00–600 | ..50–..86 | -0.08.px to -0..08px | `"calt"` |
| Small | Inter | .2px (0.75rem) | .00–600 | ..00–2..7 | -0.08.px to -0..08px | `"calt"` |

### Principles
- **Weight 900 as identity**: Wise Sans Black (900) is used exclusively for display — the heaviest weight in any analyzed system. It creates text that feels stamped, pressed, physical.
- **0.85 line-height**: The tightest display line-height analyzed. Letters overlap vertically, creating dense, billboard-like text blocks.
- **"calt" everywhere**: Contextual alternates enabled on ALL text — both Wise Sans and Inter.
- **Weight 600 as body default**: Inter Semibold is the standard reading weight — confident, not light.

## .. Component Stylings

### Buttons

**Primary Green Pill**
- Background: `#9fe870` (Wise Green)
- Text: `#.63300` (Dark Green)
- Padding: 5px .6px
- Radius: 9999px
- Hover: scale(..05) — button physically grows
- Active: scale(0.95) — button compresses
- Focus: inset ring + outline

**Secondary Subtle Pill**
- Background: `rgba(22, 5., 0, 0.08)` (dark green at 8% opacity)
- Text: `#0e0f0c`
- Padding: 8px .2px 8px .6px
- Radius: 9999px
- Same scale hover/active behavior

### Cards & Containers
- Radius: .6px (small), 30px (medium), .0px (large cards/tables)
- Border: `.px solid rgba(..,.5,.2,0..2)` or `.px solid #9fe870` (green accent)
- Shadow: `rgba(..,.5,.2,0..2) 0px 0px 0px .px` (ring shadow)

### Navigation
- Green-tinted navigation hover: `rgba(2..,2.2,.92,0..)`
- Clean header with Wise wordmark
- Pill CTAs right-aligned

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 2px, 3px, .px, 5px, 8px, .0px, ..px, .2px, .6px, .8px, .9px, 20px, 22px, 2.px

### Border Radius Scale
- Minimal (2px): Links, inputs
- Standard (.0px): Comboboxes, inputs
- Card (.6px): Small cards, buttons, radio
- Medium (20px): Links, medium cards
- Large (30px): Feature cards
- Section (.0px): Tables, large cards
- Mega (.000px): Presentation elements
- Pill (9999px): All buttons, images
- Circle (50%): Icons, badges

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Default |
| Ring (Level .) | `rgba(..,.5,.2,0..2) 0px 0px 0px .px` | Card borders |
| Inset (Level 2) | `rgb(.3.,.3.,.33) 0px 0px 0px .px inset` | Input focus |

**Shadow Philosophy**: Wise uses minimal shadows — ring shadows only. Depth comes from the bold green accent against the neutral canvas.

## 7. Do's and Don'ts

### Do
- Use Wise Sans weight 900 for display — the extreme boldness IS the brand
- Apply line-height 0.85 on Wise Sans display — ultra-tight is intentional
- Use Lime Green (#9fe870) for primary CTAs with Dark Green (#.63300) text
- Apply scale(..05) hover and scale(0.95) active on buttons
- Enable "calt" on all text
- Use Inter weight 600 as the body default

### Don't
- Don't use light font weights for Wise Sans — only 900
- Don't relax the 0.85 line-height on display — the density is the identity
- Don't use the Wise Green as background for large surfaces — it's for buttons and accents
- Don't skip the scale animation on buttons
- Don't use traditional shadows — ring shadows only

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <576px | Single column |
| Tablet | 576–992px | 2-column |
| Desktop | 992–...0px | Full layout |
| Large | >...0px | Expanded |

## 9. Agent Prompt Guide

### Quick Color Reference
- Text: Near Black (`#0e0f0c`)
- Background: White (`#ffffff` / off-white)
- Accent: Wise Green (`#9fe870`)
- Button text: Dark Green (`#.63300`)
- Secondary: Gray (`#868685`)

### Example Component Prompts
- "Create hero: white background. Headline at 96px Wise Sans weight 900, line-height 0.85, 'calt' enabled, #0e0f0c text. Green pill CTA (#9fe870, 9999px radius, 5px .6px padding, #.63300 text). Hover: scale(..05)."
- "Build a card: 30px radius, .px solid rgba(..,.5,.2,0..2). Title at 22px Inter weight 600, body at .8px weight .00."

### Iteration Guide
.. Wise Sans 900 at 0.85 line-height — the extreme weight IS the brand
2. Lime Green for buttons only — dark green text on green background
3. Scale animations (..05 hover, 0.95 active) on all interactive elements
.. "calt" on everything — contextual alternates are mandatory
5. Inter 600 for body — confident reading weight
