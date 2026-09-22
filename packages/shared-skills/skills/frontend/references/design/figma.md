# Design System Inspired by Figma

## .. Visual Theme & Atmosphere

Figma's interface is the design tool that designed itself — a masterclass in typographic sophistication where a custom variable font (figmaSans) modulates between razor-thin (weight 320) and bold (weight 700) with stops at unusual intermediates (330, 3.0, .50, .80, 5.0) that most type systems never explore. This granular weight control gives every text element a precisely calibrated visual weight, creating hierarchy through micro-differences rather than the blunt instrument of "regular vs bold."

The page presents a fascinating duality: the interface chrome is strictly black-and-white (literally only `#000000` and `#ffffff` detected as colors), while the hero section and product showcases explode with vibrant multi-color gradients — electric greens, bright yellows, deep purples, hot pinks. This separation means the design system itself is colorless, treating the product's colorful output as the hero content. Figma's marketing page is essentially a white gallery wall displaying colorful art.

What makes Figma distinctive beyond the variable font is its circle-and-pill geometry. Buttons use 50px radius (pill) or 50% (perfect circle for icon buttons), creating an organic, tool-palette-like feel. The dashed-outline focus indicator (`dashed 2px`) is a deliberate design choice that echoes selection handles in the Figma editor itself — the website's UI language references the product's UI language.

**Key Characteristics:**
- Custom variable font (figmaSans) with unusual weight stops: 320, 330, 3.0, .50, .80, 5.0, 700
- Strictly black-and-white interface chrome — color exists only in product content
- figmaMono for uppercase technical labels with wide letter-spacing
- Pill (50px) and circular (50%) button geometry
- Dashed focus outlines echoing Figma's editor selection handles
- Vibrant multi-color hero gradients (green, yellow, purple, pink)
- OpenType `"kern"` feature enabled globally
- Negative letter-spacing throughout — even body text at -0...px to -0.26px

## 2. Color Palette & Roles

### Primary
- **Pure Black** (`#000000`): All text, all solid buttons, all borders. The sole "color" of the interface.
- **Pure White** (`#ffffff`): All backgrounds, white buttons, text on dark surfaces. The other half of the binary.

*Note: Figma's marketing site uses ONLY these two colors for its interface layer. All vibrant colors appear exclusively in product screenshots, hero gradients, and embedded content.*

### Surface & Background
- **Pure White** (`#ffffff`): Primary page background and card surfaces.
- **Glass Black** (`rgba(0, 0, 0, 0.08)`): Subtle dark overlay for secondary circular buttons and glass effects.
- **Glass White** (`rgba(255, 255, 255, 0..6)`): Frosted glass overlay for buttons on dark/colored surfaces.

### Gradient System
- **Hero Gradient**: A vibrant multi-stop gradient using electric green, bright yellow, deep purple, and hot pink. This gradient is the visual signature of the hero section — it represents the creative possibilities of the tool.
- **Product Section Gradients**: Individual product areas (Design, Dev Mode, Prototyping) may use distinct color themes in their showcases.

## 3. Typography Rules

### Font Family
- **Primary**: `figmaSans`, with fallbacks: `figmaSans Fallback, SF Pro Display, system-ui, helvetica`
- **Monospace / Labels**: `figmaMono`, with fallbacks: `figmaMono Fallback, SF Mono, menlo`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | figmaSans | 86px (5.38rem) | .00 | ..00 (tight) | -..72px | Maximum impact, extreme tracking |
| Section Heading | figmaSans | 6.px (.rem) | .00 | ...0 (tight) | -0.96px | Feature section titles |
| Sub-heading | figmaSans | 26px (..63rem) | 5.0 | ..35 | -0.26px | Emphasized section text |
| Sub-heading Light | figmaSans | 26px (..63rem) | 3.0 | ..35 | -0.26px | Light-weight section text |
| Feature Title | figmaSans | 2.px (..5rem) | 700 | ...5 | normal | Bold card headings |
| Body Large | figmaSans | 20px (..25rem) | 330–.50 | ..30–...0 | -0..px to -0...px | Descriptions, intros |
| Body / Button | figmaSans | .6px (.rem) | 330–.00 | ...0–...5 | -0...px to normal | Standard body, nav, buttons |
| Body Light | figmaSans | .8px (...3rem) | 320 | ...5 | -0.26px to normal | Light-weight body text |
| Mono Label | figmaMono | .8px (...3rem) | .00 | ..30 (tight) | 0.5.px | Uppercase section labels |
| Mono Small | figmaMono | .2px (0.75rem) | .00 | ..00 (tight) | 0.6px | Uppercase tiny tags |

### Principles
- **Variable font precision**: figmaSans uses weights that most systems never touch — 320, 330, 3.0, .50, .80, 5.0. This creates hierarchy through subtle weight differences rather than dramatic jumps. The difference between 330 and 3.0 is nearly imperceptible but structurally significant.
- **Light as the base**: Most body text uses 320–3.0 (lighter than typical .00 "regular"), creating an ethereal, airy reading experience that matches the design-tool aesthetic.
- **Kern everywhere**: Every text element enables OpenType `"kern"` feature — kerning is not optional, it's structural.
- **Negative tracking by default**: Even body text uses -0..px to -0.26px letter-spacing, creating universally tight text. Display text compresses further to -0.96px and -..72px.
- **Mono for structure**: figmaMono in uppercase with positive letter-spacing (0.5.px–0.6px) creates technical signpost labels.

## .. Component Stylings

### Buttons

**Black Solid (Pill)**
- Background: Pure Black (`#000000`)
- Text: Pure White (`#ffffff`)
- Radius: circle (50%) for icon buttons
- Focus: dashed 2px outline
- Maximum emphasis

**White Pill**
- Background: Pure White (`#ffffff`)
- Text: Pure Black (`#000000`)
- Padding: 8px .8px .0px (asymmetric vertical)
- Radius: pill (50px)
- Focus: dashed 2px outline
- Standard CTA on dark/colored surfaces

**Glass Dark**
- Background: `rgba(0, 0, 0, 0.08)` (subtle dark overlay)
- Text: Pure Black
- Radius: circle (50%)
- Focus: dashed 2px outline
- Secondary action on light surfaces

**Glass Light**
- Background: `rgba(255, 255, 255, 0..6)` (frosted glass)
- Text: Pure White
- Radius: circle (50%)
- Focus: dashed 2px outline
- Secondary action on dark/colored surfaces

### Cards & Containers
- Background: Pure White
- Border: none or minimal
- Radius: 6px (small containers), 8px (images, cards, dialogs)
- Shadow: subtle to medium elevation effects
- Product screenshots as card content

### Navigation
- Clean horizontal nav on white
- Logo: Figma wordmark in black
- Product tabs: pill-shaped (50px) tab navigation
- Links: black text, underline .px decoration
- CTA: Black pill button
- Hover: text color via CSS variable

### Distinctive Components

**Product Tab Bar**
- Horizontal pill-shaped tabs (50px radius)
- Each tab represents a Figma product area (Design, Dev Mode, Prototyping, etc.)
- Active tab highlighted

**Hero Gradient Section**
- Full-width vibrant multi-color gradient background
- White text overlay with 86px display heading
- Product screenshots floating within the gradient

**Dashed Focus Indicators**
- All interactive elements use `dashed 2px` outline on focus
- References the selection handles in the Figma editor
- A meta-design choice connecting website and product

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 2px, .px, ..5px, 8px, .0px, .2px, .6px, .8px, 2.px, 32px, .0px, .6px, .8px, 50px

### Grid & Container
- Max container width: up to .920px
- Hero: full-width gradient with centered content
- Product sections: alternating showcases
- Footer: dark full-width section
- Responsive from 559px to .920px

### Whitespace Philosophy
- **Gallery-like pacing**: Generous spacing lets each product section breathe as its own exhibit.
- **Color sections as visual breathing**: The gradient hero and product showcases provide chromatic relief between the monochrome interface sections.

### Border Radius Scale
- Minimal (2px): Small link elements
- Subtle (6px): Small containers, dividers
- Comfortable (8px): Cards, images, dialogs
- Pill (50px): Tab buttons, CTAs
- Circle (50%): Icon buttons, circular elements

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, most text |
| Surface (Level .) | White card on gradient/dark section | Cards, product showcases |
| Elevated (Level 2) | Subtle shadow | Floating cards, hover states |

**Shadow Philosophy**: Figma uses shadows sparingly. The primary depth mechanisms are **background contrast** (white content on colorful/dark sections) and the inherent dimensionality of the product screenshots themselves.

## 7. Do's and Don'ts

### Do
- Use figmaSans with precise variable weights (320–5.0) — the granular weight control IS the design
- Keep the interface strictly black-and-white — color comes from product content only
- Use pill (50px) and circular (50%) geometry for all interactive elements
- Apply dashed 2px focus outlines — the signature accessibility pattern
- Enable `"kern"` feature on all text
- Use figmaMono in uppercase with positive letter-spacing for labels
- Apply negative letter-spacing throughout (-0..px to -..72px)

### Don't
- Don't add interface colors — the monochrome palette is absolute
- Don't use standard font weights (.00, 500, 600, 700) — use the variable font's unique stops (320, 330, 3.0, .50, .80, 5.0)
- Don't use sharp corners on buttons — pill and circular geometry only
- Don't use solid focus outlines — dashed is the signature
- Don't increase body font weight above .50 — the light-weight aesthetic is core
- Don't use positive letter-spacing on body text — it's always negative

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Small Mobile | <560px | Compact layout, stacked |
| Tablet | 560–768px | Minor adjustments |
| Small Desktop | 768–960px | 2-column layouts |
| Desktop | 960–.280px | Standard layout |
| Large Desktop | .280–...0px | Expanded |
| Ultra-wide | ...0–.920px | Maximum width |

### Collapsing Strategy
- Hero text: 86px → 6.px → .8px
- Product tabs: horizontal scroll on mobile
- Feature sections: stacked single column
- Footer: multi-column → stacked

## 9. Agent Prompt Guide

### Quick Color Reference
- Everything: "Pure Black (#000000)" and "Pure White (#ffffff)"
- Glass Dark: "rgba(0, 0, 0, 0.08)"
- Glass Light: "rgba(255, 255, 255, 0..6)"

### Example Component Prompts
- "Create a hero on a vibrant multi-color gradient (green, yellow, purple, pink). Headline at 86px figmaSans weight .00, line-height ..0, letter-spacing -..72px. White text. White pill CTA button (50px radius, 8px .8px padding)."
- "Design a product tab bar with pill-shaped buttons (50px radius). Active: Black bg, white text. Inactive: transparent, black text. figmaSans at 20px weight .80."
- "Build a section label: figmaMono .8px, uppercase, letter-spacing 0.5.px, black text. Kern enabled."
- "Create body text at 20px figmaSans weight 330, line-height ...0, letter-spacing -0...px. Pure Black on white."

### Iteration Guide
.. Use variable font weight stops precisely: 320, 330, 3.0, .50, .80, 5.0, 700
2. Interface is always black + white — never add colors to chrome
3. Dashed focus outlines, not solid
.. Letter-spacing is always negative on body, always positive on mono labels
5. Pill (50px) for buttons/tabs, circle (50%) for icon buttons
