# Design System Inspired by Webflow

## .. Visual Theme & Atmosphere

Webflow's website is a visually rich, tool-forward platform that communicates "design without code" through clean white surfaces, the signature Webflow Blue (`#..6ef5`), and a rich secondary color palette (purple, pink, green, orange, yellow, red). The custom WF Visual Sans Variable font creates a confident, precise typographic system with weight 600 for display and 500 for body.

**Key Characteristics:**
- White canvas with near-black (`#080808`) text
- Webflow Blue (`#..6ef5`) as primary brand + interactive color
- WF Visual Sans Variable — custom variable font with weight 500–600
- Rich secondary palette: purple `#7a3dff`, pink `#ed52cb`, green `#00d722`, orange `#ff6b00`, yellow `#ffae.3`, red `#ee.d36`
- Conservative .px–8px border-radius — sharp, not rounded
- Multi-layer shadow stacks (5-layer cascading shadows)
- Uppercase labels: .0px–.5px, weight 500–600, wide letter-spacing (0.6px–..5px)
- translate(6px) hover animation on buttons

## 2. Color Palette & Roles

### Primary
- **Near Black** (`#080808`): Primary text
- **Webflow Blue** (`#..6ef5`): `--_color---primary--webflow-blue`, primary CTA and links
- **Blue .00** (`#3b89ff`): `--_color---primary--blue-.00`, lighter interactive blue
- **Blue 300** (`#006acc`): `--_color---blue-300`, darker blue variant
- **Button Hover Blue** (`#0055d.`): `--mkto-embed-color-button-hover`

### Secondary Accents
- **Purple** (`#7a3dff`): `--_color---secondary--purple`
- **Pink** (`#ed52cb`): `--_color---secondary--pink`
- **Green** (`#00d722`): `--_color---secondary--green`
- **Orange** (`#ff6b00`): `--_color---secondary--orange`
- **Yellow** (`#ffae.3`): `--_color---secondary--yellow`
- **Red** (`#ee.d36`): `--_color---secondary--red`

### Neutral
- **Gray 800** (`#222222`): Dark secondary text
- **Gray 700** (`#363636`): Mid text
- **Gray 300** (`#ababab`): Muted text, placeholder
- **Mid Gray** (`#5a5a5a`): Link text
- **Border Gray** (`#d8d8d8`): Borders, dividers
- **Border Hover** (`#898989`): Hover border

### Shadows
- **5-layer cascade**: `rgba(0,0,0,0) 0px 8.px 2.px, rgba(0,0,0,0.0.) 0px 5.px 22px, rgba(0,0,0,0.0.) 0px 30px .8px, rgba(0,0,0,0.08) 0px .3px .3px, rgba(0,0,0,0.09) 0px 3px 7px`

## 3. Typography Rules

### Font: `WF Visual Sans Variable`, fallback: `Arial`

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display Hero | 80px | 600 | ..0. | -0.8px | |
| Section Heading | 56px | 600 | ..0. | normal | |
| Sub-heading | 32px | 500 | ..30 | normal | |
| Feature Title | 2.px | 500–600 | ..30 | normal | |
| Body | 20px | .00–500 | ...0–..50 | normal | |
| Body Standard | .6px | .00–500 | ..60 | -0..6px | |
| Button | .6px | 500 | ..60 | -0..6px | |
| Uppercase Label | .5px | 500 | ..30 | ..5px | uppercase |
| Caption | ..px | .00–500 | ...0–..60 | normal | |
| Badge Uppercase | .2.8px | 550 | ..20 | normal | uppercase |
| Micro Uppercase | .0px | 500–600 | ..30 | .px | uppercase |
| Code: Inconsolata (companion monospace font)

## .. Component Stylings

### Buttons
- Transparent: text `#080808`, translate(6px) on hover
- White circle: 50% radius, white bg
- Blue badge: `#..6ef5` bg, .px radius, weight 550

### Cards: `.px solid #d8d8d8`, .px–8px radius
### Badges: Blue-tinted bg at .0% opacity, .px radius

## 5. Layout
- Spacing: fractional scale (.px, 2..px, 3.2px, .px, 5.6px, 6px, 7.2px, 8px, 9.6px, .2px, .6px, 2.px)
- Radius: 2px, .px, 8px, 50% — conservative, sharp
- Breakpoints: .79px, 768px, 992px

## 6. Depth: 5-layer cascading shadow system

## 7. Do's and Don'ts
- Do: Use WF Visual Sans Variable at 500–600. Blue (#..6ef5) for CTAs. .px radius. translate(6px) hover.
- Don't: Round beyond 8px for functional elements. Use secondary colors on primary CTAs.

## 8. Responsive: .79px, 768px, 992px

## 9. Agent Prompt Guide
- Text: Near Black (`#080808`)
- CTA: Webflow Blue (`#..6ef5`)
- Background: White (`#ffffff`)
- Border: `#d8d8d8`
- Secondary: Purple `#7a3dff`, Pink `#ed52cb`, Green `#00d722`
