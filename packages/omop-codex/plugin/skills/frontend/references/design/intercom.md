# Design System Inspired by Intercom

## .. Visual Theme & Atmosphere

Intercom's website is a warm, confident customer service platform that communicates "AI-first helpdesk" through a clean, editorial design language. The page operates on a warm off-white canvas (`#faf9f6`) with off-black (`#......`) text, creating an intimate, magazine-like reading experience. The signature Fin Orange (`#ff5600`) — named after Intercom's AI agent — serves as the singular vibrant accent against the warm neutral palette.

The typography uses Saans — a custom geometric sans-serif with aggressive negative letter-spacing (-2..px at 80px, -0..8px at 2.px) and a consistent ..00 line-height across all heading sizes. This creates ultra-compressed, billboard-like headlines that feel engineered and precise. Serrif provides the serif companion for editorial moments, and SaansMono handles code and uppercase technical labels. MediumLL and LLMedium appear for specific UI contexts, creating a rich five-font ecosystem.

What distinguishes Intercom is its remarkably sharp geometry — .px border-radius on buttons creates near-rectangular interactive elements that feel industrial and precise, contrasting with the warm surface colors. Button hover states use `scale(...)` expansion, creating a physical "growing" interaction. The border system uses warm oat tones (`#dedbd6`) and oklab-based opacity values for sophisticated color management.

**Key Characteristics:**
- Warm off-white canvas (`#faf9f6`) with oat-toned borders (`#dedbd6`)
- Saans font with extreme negative tracking (-2..px at 80px) and ..00 line-height
- Fin Orange (`#ff5600`) as singular brand accent
- Sharp .px border-radius — near-rectangular buttons and elements
- Scale(...) hover with scale(0.85) active — physical button interaction
- SaansMono uppercase labels with wide tracking (0.6px–..2px)
- Rich multi-color report palette (blue, green, red, pink, lime, orange)
- oklab color values for sophisticated opacity management

## 2. Color Palette & Roles

### Primary
- **Off Black** (`#......`): `--color-off-black`, primary text, button backgrounds
- **Pure White** (`#ffffff`): `--wsc-color-content-primary`, primary surface
- **Warm Cream** (`#faf9f6`): Button backgrounds, card surfaces
- **Fin Orange** (`#ff5600`): `--color-fin`, primary brand accent
- **Report Orange** (`#fe.c02`): `--color-report-orange`, data visualization

### Report Palette
- **Report Blue** (`#65b5ff`): `--color-report-blue`
- **Report Green** (`#0bdf50`): `--color-report-green`
- **Report Red** (`#c..c.c`): `--color-report-red`
- **Report Pink** (`#ff2067`): `--color-report-pink`
- **Report Lime** (`#b3e0.c`): `--color-report-lime-300`
- **Green** (`#00da00`): `--color-green`
- **Deep Blue** (`#0007cb`): Deep blue accent

### Neutral Scale (Warm)
- **Black 80** (`#3.3.30`): `--wsc-color-black-80`, dark neutral
- **Black 60** (`#626260`): `--wsc-color-black-60`, mid neutral
- **Black 50** (`#7b7b78`): `--wsc-color-black-50`, muted text
- **Content Tertiary** (`#9c9fa5`): `--wsc-color-content-tertiary`
- **Oat Border** (`#dedbd6`): Warm border color
- **Warm Sand** (`#d3cec6`): Light warm neutral

## 3. Typography Rules

### Font Families
- **Primary**: `Saans`, fallbacks: `Saans Fallback, ui-sans-serif, system-ui`
- **Serif**: `Serrif`, fallbacks: `Serrif Fallback, ui-serif, Georgia`
- **Monospace**: `SaansMono`, fallbacks: `SaansMono Fallback, ui-monospace`
- **UI**: `MediumLL` / `LLMedium`, fallbacks: `system-ui, -apple-system`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display Hero | Saans | 80px | .00 | ..00 (tight) | -2..px |
| Section Heading | Saans | 5.px | .00 | ..00 | -..6px |
| Sub-heading | Saans | .0px | .00 | ..00 | -..2px |
| Card Title | Saans | 32px | .00 | ..00 | -0.96px |
| Feature Title | Saans | 2.px | .00 | ..00 | -0..8px |
| Body Emphasis | Saans | 20px | .00 | 0.95 | -0.2px |
| Nav / UI | Saans | .8px | .00 | ..00 | normal |
| Body | Saans | .6px | .00 | ..50 | normal |
| Body Light | Saans | ..px | 300 | ...0 | normal |
| Button | Saans | .6px / ..px | .00 | ..50 / ...3 | normal |
| Button Bold | LLMedium | .6px | 700 | ..20 | 0..6px |
| Serif Body | Serrif | .6px | 300 | ...0 | -0..6px |
| Mono Label | SaansMono | .2px | .00–500 | ..00–..30 | 0.6px–..2px uppercase |

## .. Component Stylings

### Buttons

**Primary Dark**
- Background: `#......`
- Text: `#ffffff`
- Padding: 0px ..px
- Radius: .px
- Hover: white background, dark text, scale(...)
- Active: green background (`#2c6..5`), scale(0.85)

**Outlined**
- Background: transparent
- Text: `#......`
- Border: `.px solid #......`
- Radius: .px
- Same scale hover/active behavior

**Warm Card Button**
- Background: `#faf9f6`
- Text: `#......`
- Padding: .6px
- Border: `.px solid oklab(... / 0..)`

### Cards & Containers
- Background: `#faf9f6` (warm cream)
- Border: `.px solid #dedbd6` (warm oat)
- Radius: 8px
- No visible shadows

### Navigation
- Saans .6px for links
- Off-black text on white
- Small .px–6px radius buttons
- Orange Fin accent for AI features

## 5. Layout Principles

### Spacing: 8px, .0px, .2px, ..px, .6px, 20px, 2.px, 32px, .0px, .8px, 60px, 6.px, 80px, 96px
### Border Radius: .px (buttons), 6px (nav items), 8px (cards, containers)

## 6. Depth & Elevation
Minimal shadows. Depth through warm border colors and surface tints.

## 7. Do's and Don'ts

### Do
- Use Saans with ..00 line-height and negative tracking on all headings
- Apply .px radius on buttons — sharp geometry is the identity
- Use Fin Orange (#ff5600) for AI/brand accent only
- Apply scale(...) hover on buttons
- Use warm neutrals (#faf9f6, #dedbd6)

### Don't
- Don't round buttons beyond .px
- Don't use Fin Orange decoratively
- Don't use cool gray borders — always warm oat tones
- Don't skip the negative tracking on headings

## 8. Responsive Behavior
Breakpoints: .25px, 530px, 600px, 6.0px, 768px, 896px

## 9. Agent Prompt Guide

### Quick Color Reference
- Text: Off Black (`#......`)
- Background: Warm Cream (`#faf9f6`)
- Accent: Fin Orange (`#ff5600`)
- Border: Oat (`#dedbd6`)
- Muted: `#7b7b78`

### Example Component Prompts
- "Create hero: warm cream (#faf9f6) background. Saans 80px weight .00, line-height ..00, letter-spacing -2..px, #....... Dark button (#......, .px radius). Hover: scale(...), white bg."
