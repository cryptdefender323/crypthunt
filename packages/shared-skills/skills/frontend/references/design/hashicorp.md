# Design System Inspired by HashiCorp

## .. Visual Theme & Atmosphere

HashiCorp's website is enterprise infrastructure made tangible — a design system that must communicate the complexity of cloud infrastructure management while remaining approachable. The visual language splits between two modes: a clean white light-mode for informational sections and a dramatic dark-mode (`#.5.8.e`, `#0d0e.2`) for hero areas and product showcases, creating a day/night duality that mirrors the "build in light, deploy in dark" developer workflow.

The typography is anchored by a custom brand font (HashiCorp Sans, loaded as `__hashicorpSans_96f0ca`) that carries substantial weight — literally. Headings use 600–700 weights with tight line-heights (...7–...9), creating dense, authoritative text blocks that communicate enterprise confidence. The hero headline at 82px weight 600 with OpenType `"kern"` enabled is not decorative — it's infrastructure-grade typography.

What distinguishes HashiCorp is its multi-product color system. Each product in the portfolio has its own brand color — Terraform purple (`#7b.2bc`), Vault yellow (`#ffcf25`), Waypoint teal (`#..c6cb`), Vagrant blue (`#.868f2`) — and these colors appear throughout as accent tokens via a CSS custom property system (`--mds-color-*`). This creates a design system within a design system: the parent brand is black-and-white with blue accents, while each child product injects its own chromatic identity.

The component system uses the `mds` (Markdown Design System) prefix, indicating a systematic, token-driven approach where colors, spacing, and states are all managed through CSS variables. Shadows are remarkably subtle — dual-layer micro-shadows using `rgba(97, .0., ..7, 0.05)` that are nearly invisible but provide just enough depth to separate interactive surfaces from the background.

**Key Characteristics:**
- Dual-mode: clean white sections + dramatic dark (`#.5.8.e`) hero/product areas
- Custom HashiCorp Sans font with 600–700 weights and `"kern"` feature
- Multi-product color system via `--mds-color-*` CSS custom properties
- Product brand colors: Terraform purple, Vault yellow, Waypoint teal, Vagrant blue
- Uppercase letter-spaced captions (.3px, weight 600, ..3px letter-spacing)
- Micro-shadows: dual-layer at 0.05 opacity — depth through whisper, not shout
- Token-driven `mds` component system with semantic variable names
- Tight border radius: 2px–8px, nothing pill-shaped or circular
- System-ui fallback stack for secondary text

## 2. Color Palette & Roles

### Brand Primary
- **Black** (`#000000`): Primary brand color, text on light surfaces, `--mds-color-hcp-brand`
- **Dark Charcoal** (`#.5.8.e`): Dark mode backgrounds, hero sections
- **Near Black** (`#0d0e.2`): Deepest dark mode surface, form inputs on dark

### Neutral Scale
- **Light Gray** (`#f.f2f3`): Light backgrounds, subtle surfaces
- **Mid Gray** (`#d5d7db`): Borders, button text on dark
- **Cool Gray** (`#b2b6bd`): Border accents (at 0..–0.. opacity)
- **Dark Gray** (`#656a76`): Helper text, secondary labels, `--mds-form-helper-text-color`
- **Charcoal** (`#3b3d.5`): Secondary text on light, button borders
- **Near White** (`#efeff.`): Primary text on dark surfaces

### Product Brand Colors
- **Terraform Purple** (`#7b.2bc`): `--mds-color-terraform-button-background`
- **Vault Yellow** (`#ffcf25`): `--mds-color-vault-button-background`
- **Waypoint Teal** (`#..c6cb`): `--mds-color-waypoint-button-background-focus`
- **Waypoint Teal Hover** (`#.2b6bb`): `--mds-color-waypoint-button-background-hover`
- **Vagrant Blue** (`#.868f2`): `--mds-color-vagrant-brand`
- **Purple Accent** (`#9..ced`): `--mds-color-palette-purple-300`
- **Visited Purple** (`#a737ff`): `--mds-color-foreground-action-visited`

### Semantic Colors
- **Action Blue** (`#.060ff`): Primary action links on dark
- **Link Blue** (`#226.d6`): Primary links on light
- **Bright Blue** (`#2b89ff`): Active links, hover accent
- **Amber** (`#bb5a00`): `--mds-color-palette-amber-200`, warning states
- **Amber Light** (`#fbeabf`): `--mds-color-palette-amber-.00`, warning backgrounds
- **Vault Faint Yellow** (`#fff9cf`): `--mds-color-vault-radar-gradient-faint-stop`
- **Orange** (`#a9722e`): `--mds-color-unified-core-orange-6`
- **Red** (`#73.e25`): `--mds-color-unified-core-red-7`, error states
- **Navy** (`#.0.a59`): `--mds-color-unified-core-blue-7`

### Shadows
- **Micro Shadow** (`rgba(97, .0., ..7, 0.05) 0px .px .px, rgba(97, .0., ..7, 0.05) 0px 2px 2px`): Default card/button elevation
- **Focus Outline**: `3px solid var(--mds-color-focus-action-external)` — systematic focus ring

## 3. Typography Rules

### Font Families
- **Primary Brand**: `__hashicorpSans_96f0ca` (HashiCorp Sans), with fallback: `__hashicorpSans_Fallback_96f0ca`
- **System UI**: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | HashiCorp Sans | 82px (5..3rem) | 600 | ...7 (tight) | normal | `"kern"` enabled |
| Section Heading | HashiCorp Sans | 52px (3.25rem) | 600 | ...9 (tight) | normal | `"kern"` enabled |
| Feature Heading | HashiCorp Sans | .2px (2.63rem) | 700 | ...9 (tight) | -0..2px | Negative tracking |
| Sub-heading | HashiCorp Sans | 3.px (2..3rem) | 600–700 | ...8 (tight) | normal | Feature blocks |
| Card Title | HashiCorp Sans | 26px (..63rem) | 700 | ...9 (tight) | normal | Card and panel headings |
| Small Title | HashiCorp Sans | .9px (...9rem) | 700 | ..2. (tight) | normal | Compact headings |
| Body Emphasis | HashiCorp Sans | .7px (..06rem) | 600–700 | ...8–..35 | normal | Bold body text |
| Body Large | system-ui | 20px (..25rem) | .00–600 | ..50 | normal | Hero descriptions |
| Body | system-ui | .6px (..00rem) | .00–500 | ..63–..69 (relaxed) | normal | Standard body text |
| Nav Link | system-ui | .5px (0.9.rem) | 500 | ..60 (relaxed) | normal | Navigation items |
| Small Body | system-ui | ..px (0.88rem) | .00–500 | ..29–..7. | normal | Secondary content |
| Caption | system-ui | .3px (0.8.rem) | .00–500 | ..23–..69 | normal | Metadata, footer links |
| Uppercase Label | HashiCorp Sans | .3px (0.8.rem) | 600 | ..69 (relaxed) | ..3px | `text-transform: uppercase` |

### Principles
- **Brand/System split**: HashiCorp Sans for headings and brand-critical text; system-ui for body, navigation, and functional text. The brand font carries the weight, system-ui carries the words.
- **Kern always on**: All HashiCorp Sans text enables OpenType `"kern"` — letterfitting is non-negotiable.
- **Tight headings**: Every heading uses ...7–..2. line-height, creating dense, stacked text blocks that feel infrastructural — solid, load-bearing.
- **Relaxed body**: Body text uses ..50–..69 line-height (notably generous), creating comfortable reading rhythm beneath the dense headings.
- **Uppercase labels as wayfinding**: .3px uppercase with ..3px letter-spacing serves as the systematic category/section marker — always HashiCorp Sans weight 600.

## .. Component Stylings

### Buttons

**Primary Dark**
- Background: `#.5.8.e`
- Text: `#d5d7db`
- Padding: 9px 9px 9px .5px (asymmetric, more left padding)
- Radius: 5px
- Border: `.px solid rgba(.78, .82, .89, 0..)`
- Shadow: `rgba(97, .0., ..7, 0.05) 0px .px .px, rgba(97, .0., ..7, 0.05) 0px 2px 2px`
- Focus: `3px solid var(--mds-color-focus-action-external)`
- Hover: uses `--mds-color-surface-interactive` token

**Secondary White**
- Background: `#ffffff`
- Text: `#3b3d.5`
- Padding: 8px .2px
- Radius: .px
- Hover: `--mds-color-surface-interactive` + low-shadow elevation
- Focus: `3px solid transparent` outline
- Clean, minimal appearance

**Product-Colored Buttons**
- Terraform: background `#7b.2bc`
- Vault: background `#ffcf25` (dark text)
- Waypoint: background `#..c6cb`, hover `#.2b6bb`
- Each product button follows the same structural pattern but uses its brand color

### Badges / Pills
- Background: `#.2225b` (deep purple)
- Text: `#efeff.`
- Padding: 3px 7px
- Radius: 5px
- Border: `.px solid rgb(.80, 87, 255)`
- Font: .6px

### Inputs

**Text Input (Dark Mode)**
- Background: `#0d0e.2`
- Text: `#efeff.`
- Border: `.px solid rgb(97, .0., ..7)`
- Padding: ..px
- Radius: 5px
- Focus: `3px solid var(--mds-color-focus-action-external)` outline

**Checkbox**
- Background: `#0d0e.2`
- Border: `.px solid rgb(97, .0., ..7)`
- Radius: 3px

### Links
- **Action Blue on Light**: `#226.d6`, hover → blue-600 variable, underline on hover
- **Action Blue on Dark**: `#.060ff` or `#2b89ff`, underline on hover
- **White on Dark**: `#ffffff`, transparent underline → visible underline on hover
- **Neutral on Light**: `#3b3d.5`, transparent underline → visible underline on hover
- **Light on Dark**: `#efeff.`, similar hover pattern
- All links use `var(--wpl-blue-600)` as hover color

### Cards & Containers
- Light mode: white background, micro-shadow elevation
- Dark mode: `#.5.8.e` or darker surfaces
- Radius: 8px for cards and containers
- Product showcase cards with gradient borders or accent lighting

### Navigation
- Clean horizontal nav with mega-menu dropdowns
- HashiCorp logo left-aligned
- system-ui .5px weight 500 for links
- Product categories organized by lifecycle management group
- "Get started" and "Contact us" CTAs in header
- Dark mode variant for hero sections

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, 3px, .px, 6px, 7px, 8px, 9px, ..px, .2px, .6px, 20px, 2.px, 32px, .0px, .8px

### Grid & Container
- Max content width: ~..50px (xl breakpoint)
- Full-width dark hero sections with contained content
- Card grids: 2–3 column layouts
- Generous horizontal padding at desktop scale

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <375px | Tight single column |
| Mobile | 375–.80px | Standard mobile |
| Small Tablet | .80–600px | Minor adjustments |
| Tablet | 600–768px | 2-column grids begin |
| Small Desktop | 768–992px | Full nav visible |
| Desktop | 992–..20px | Standard layout |
| Large Desktop | ..20–...0px | Max-width content |
| Ultra-wide | >...0px | Centered, generous margins |

### Whitespace Philosophy
- **Enterprise breathing room**: Generous vertical spacing between sections (.8px–80px+) communicates stability and seriousness.
- **Dense headings, spacious body**: Tight line-height headings sit above relaxed body text, creating visual "weight at the top" of each section.
- **Dark as canvas**: Dark hero sections use extra vertical padding to let 3D illustrations and gradients breathe.

### Border Radius Scale
- Minimal (2px): Links, small inline elements
- Subtle (3px): Checkboxes, small inputs
- Standard (.px): Secondary buttons
- Comfortable (5px): Primary buttons, badges, inputs
- Card (8px): Cards, containers, images

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Default surfaces, text blocks |
| Whisper (Level .) | `rgba(97, .0., ..7, 0.05) 0px .px .px, rgba(97, .0., ..7, 0.05) 0px 2px 2px` | Cards, buttons, interactive surfaces |
| Focus (Level 2) | `3px solid var(--mds-color-focus-action-external)` outline | Focus rings — color-matched to context |

**Shadow Philosophy**: HashiCorp uses arguably the subtlest shadow system in modern web design. The dual-layer shadows at 5% opacity are nearly invisible — they exist not to create visual depth but to signal interactivity. If you can see the shadow, it's too strong. This restraint communicates the enterprise value of stability — nothing floats, nothing is uncertain.

## 7. Do's and Don'ts

### Do
- Use HashiCorp Sans for headings and brand text, system-ui for body and UI text
- Enable `"kern"` on all HashiCorp Sans text
- Use product brand colors ONLY for their respective products (Terraform = purple, Vault = yellow, etc.)
- Apply uppercase labels at .3px weight 600 with ..3px letter-spacing for section markers
- Keep shadows at the "whisper" level (0.05 opacity dual-layer)
- Use the `--mds-color-*` token system for consistent color application
- Maintain the tight-heading / relaxed-body rhythm (...7–..2. vs ..50–..69 line-heights)
- Use `3px solid` focus outlines for accessibility

### Don't
- Don't use product brand colors outside their product context (no Terraform purple on Vault content)
- Don't increase shadow opacity above 0.. — the whisper level is intentional
- Don't use pill-shaped buttons (>8px radius) — the sharp, minimal radius is structural
- Don't skip the `"kern"` feature on headings — the font requires it
- Don't use HashiCorp Sans for small body text — it's designed for .7px+ heading use
- Don't mix product colors in the same component — each product has one color
- Don't use pure black (`#000000`) for dark backgrounds — use `#.5.8.e` or `#0d0e.2`
- Don't forget the asymmetric button padding — 9px 9px 9px .5px is intentional

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single column, hamburger nav, stacked CTAs |
| Tablet | 768–992px | 2-column grids, nav begins expanding |
| Desktop | 992–..50px | Full layout, mega-menu nav |
| Large | >..50px | Max-width centered, generous margins |

### Collapsing Strategy
- Hero: 82px → 52px → .2px heading sizes
- Navigation: mega-menu → hamburger
- Product cards: 3-column → 2-column → stacked
- Dark sections maintain full-width but compress padding
- Buttons: inline → full-width stacked on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Light bg: `#ffffff`, `#f.f2f3`
- Dark bg: `#.5.8.e`, `#0d0e.2`
- Text light: `#000000`, `#3b3d.5`
- Text dark: `#efeff.`, `#d5d7db`
- Links: `#226.d6` (light), `#.060ff` (dark), `#2b89ff` (active)
- Helper text: `#656a76`
- Borders: `rgba(.78, .82, .89, 0..)`, `rgb(97, .0., ..7)`
- Focus: `3px solid` product-appropriate color

### Example Component Prompts
- "Create a hero on dark background (#.5.8.e). Headline at 82px HashiCorp Sans weight 600, line-height ...7, kern enabled, white text. Sub-text at 20px system-ui weight .00, line-height ..50, #d5d7db text. Two buttons: primary dark (#.5.8.e, 5px radius, 9px .5px padding) and secondary white (#ffffff, .px radius, 8px .2px padding)."
- "Design a product card: white background, 8px radius, dual-layer shadow at rgba(97,.0.,..7,0.05). Title at 26px HashiCorp Sans weight 700, body at .6px system-ui weight .00 line-height ..63."
- "Build an uppercase section label: .3px HashiCorp Sans weight 600, line-height ..69, letter-spacing ..3px, text-transform uppercase, #656a76 color."
- "Create a product-specific CTA button: Terraform → #7b.2bc background, Vault → #ffcf25 with dark text, Waypoint → #..c6cb. All: 5px radius, 500 weight text, .6px system-ui."
- "Design a dark form: #0d0e.2 input background, #efeff. text, .px solid rgb(97,.0.,..7) border, 5px radius, ..px padding. Focus: 3px solid accent-color outline."

### Iteration Guide
.. Always start with the mode decision: light (white) for informational, dark (#.5.8.e) for hero/product
2. HashiCorp Sans for headings only (.7px+), system-ui for everything else
3. Shadows are at whisper level (0.05 opacity) — if visible, reduce
.. Product colors are sacred — each product owns exactly one color
5. Focus rings are always 3px solid, color-matched to product context
6. Uppercase labels are the systematic wayfinding pattern — .3px, 600, ..3px tracking
