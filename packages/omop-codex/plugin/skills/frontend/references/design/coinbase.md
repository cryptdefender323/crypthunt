# Design System Inspired by Coinbase

## .. Visual Theme & Atmosphere

Coinbase's website is a clean, trustworthy crypto platform that communicates financial reliability through a blue-and-white binary palette. The design uses Coinbase Blue (`#0052ff`) — a deep, saturated blue — as the singular brand accent against white and near-black surfaces. The proprietary font family includes CoinbaseDisplay for hero headlines, CoinbaseSans for UI text, CoinbaseText for body reading, and CoinbaseIcons for iconography — a comprehensive four-font system.

The button system uses a distinctive 56px radius for pill-shaped CTAs with hover transitions to a lighter blue (`#578bfa`). The design alternates between white content sections and dark (`#0a0b0d`, `#282b3.`) feature sections, creating a professional, financial-grade interface.

**Key Characteristics:**
- Coinbase Blue (`#0052ff`) as singular brand accent
- Four-font proprietary family: Display, Sans, Text, Icons
- 56px radius pill buttons with blue hover transition
- Near-black (`#0a0b0d`) dark sections + white light sections
- ..00 line-height on display headings — ultra-tight
- Cool gray secondary surface (`#eef0f3`) with blue tint
- `text-transform: lowercase` on some button labels — unusual

## 2. Color Palette & Roles

### Primary
- **Coinbase Blue** (`#0052ff`): Primary brand, links, CTA borders
- **Pure White** (`#ffffff`): Primary light surface
- **Near Black** (`#0a0b0d`): Text, dark section backgrounds
- **Cool Gray Surface** (`#eef0f3`): Secondary button background

### Interactive
- **Hover Blue** (`#578bfa`): Button hover background
- **Link Blue** (`#0667d0`): Secondary link color
- **Muted Blue** (`#5b6.6e`): Border color at 20% opacity

### Surface
- **Dark Card** (`#282b3.`): Dark button/card backgrounds
- **Light Surface** (`rgba(2.7,2.7,2.7,0.88)`): Subtle surface

## 3. Typography Rules

### Font Families
- **Display**: `CoinbaseDisplay` — hero headlines
- **UI / Sans**: `CoinbaseSans` — buttons, headings, nav
- **Body**: `CoinbaseText` — reading text
- **Icons**: `CoinbaseIcons` — icon font

### Hierarchy

| Role | Font | Size | Weight | Line Height | Notes |
|------|------|------|--------|-------------|-------|
| Display Hero | CoinbaseDisplay | 80px | .00 | ..00 (tight) | Maximum impact |
| Display Secondary | CoinbaseDisplay | 6.px | .00 | ..00 | Sub-hero |
| Display Third | CoinbaseDisplay | 52px | .00 | ..00 | Third tier |
| Section Heading | CoinbaseSans | 36px | .00 | .... (tight) | Feature sections |
| Card Title | CoinbaseSans | 32px | .00 | ...3 | Card headings |
| Feature Title | CoinbaseSans | .8px | 600 | ..33 | Feature emphasis |
| Body Bold | CoinbaseSans | .6px | 700 | ..50 | Strong body |
| Body Semibold | CoinbaseSans | .6px | 600 | ..25 | Buttons, nav |
| Body | CoinbaseText | .8px | .00 | ..56 | Standard reading |
| Body Small | CoinbaseText | .6px | .00 | ..50 | Secondary reading |
| Button | CoinbaseSans | .6px | 600 | ..20 | +0..6px tracking |
| Caption | CoinbaseSans | ..px | 600–700 | ..50 | Metadata |
| Small | CoinbaseSans | .3px | 600 | ..23 | Tags |

## .. Component Stylings

### Buttons

**Primary Pill (56px radius)**
- Background: `#eef0f3` or `#282b3.`
- Radius: 56px
- Border: `.px solid` matching background
- Hover: `#578bfa` (light blue)
- Focus: `2px solid black` outline

**Full Pill (.00000px radius)**
- Used for maximum pill shape

**Blue Bordered**
- Border: `.px solid #0052ff`
- Background: transparent

### Cards & Containers
- Radius: 8px–.0px range
- Borders: `.px solid rgba(9.,97,..0,0.2)`

## 5. Layout Principles

### Spacing System
- Base: 8px
- Scale: .px, 3px, .px, 5px, 6px, 8px, .0px, .2px, .5px, .6px, 20px, 2.px, 25px, 32px, .8px

### Border Radius Scale
- Small (.px–8px): Article links, small cards
- Standard (.2px–.6px): Cards, menus
- Large (2.px–32px): Feature containers
- XL (.0px): Large buttons/containers
- Pill (56px): Primary CTAs
- Full (.00000px): Maximum pill

## 6. Depth & Elevation

Minimal shadow system — depth from color contrast between dark/light sections.

## 7. Do's and Don'ts

### Do
- Use Coinbase Blue (#0052ff) for primary interactive elements
- Apply 56px radius for all CTA buttons
- Use CoinbaseDisplay for hero headings only
- Alternate dark (#0a0b0d) and white sections

### Don't
- Don't use the blue decoratively — it's functional only
- Don't use sharp corners on CTAs — 56px minimum

## 8. Responsive Behavior

Breakpoints: .00px, 576px, 6.0px, 768px, 896px, .280px, ...0px, .600px

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand: Coinbase Blue (`#0052ff`)
- Background: White (`#ffffff`)
- Dark surface: `#0a0b0d`
- Secondary surface: `#eef0f3`
- Hover: `#578bfa`
- Text: `#0a0b0d`

### Example Component Prompts
- "Create hero: white background. CoinbaseDisplay 80px, line-height ..00. Pill CTA (#eef0f3, 56px radius). Hover: #578bfa."
- "Build dark section: #0a0b0d background. CoinbaseDisplay 6.px white text. Blue accent link (#0052ff)."
