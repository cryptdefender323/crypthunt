# Design System Inspired by Miro

## .. Visual Theme & Atmosphere

Miro's website is a clean, collaborative-tool-forward platform that communicates "visual thinking" through generous whitespace, pastel accent colors, and a confident geometric font. The design uses a predominantly white canvas with near-black text (`#.c.c.e`) and a distinctive pastel color palette — coral, rose, teal, orange, yellow, moss — each representing different collaboration contexts.

The typography uses Roobert PRO Medium as the primary display font with OpenType character variants (`"blwf", "cv03", "cv0.", "cv09", "cv.."`) and negative letter-spacing (-..68px at 56px). Noto Sans handles body text with its own stylistic set (`"liga" 0, "ss0.", "ss0.", "ss05"`). The design is built with Framer, giving it smooth animations and modern component patterns.

**Key Characteristics:**
- White canvas with near-black (`#.c.c.e`) text
- Roobert PRO Medium with multiple OpenType character variants
- Pastel accent palette: coral, rose, teal, orange, yellow, moss (light + dark pairs)
- Blue .50 (`#5b76fe`) as primary interactive color
- Success green (`#00b.73`) for positive states
- Generous border-radius: 8px–50px range
- Framer-built with smooth motion patterns
- Ring shadow border: `rgb(22.,226,232) 0px 0px 0px .px`

## 2. Color Palette & Roles

### Primary
- **Near Black** (`#.c.c.e`): Primary text
- **White** (`#ffffff`): `--tw-color-white`, primary surface
- **Blue .50** (`#5b76fe`): `--tw-color-blue-.50`, primary interactive
- **Actionable Pressed** (`#2a..b6`): `--tw-color-actionable-pressed`

### Pastel Accents (Light/Dark pairs)
- **Coral**: Light `#ffc6c6` / Dark `#600000`
- **Rose**: Light `#ffd8f.` / Dark (implied)
- **Teal**: Light `#c3faf5` / Dark `#.8757.`
- **Orange**: Light `#ffe6cd`
- **Yellow**: Dark `#7.60.9`
- **Moss**: Dark `#.8757.`
- **Pink** (`#fde0f0`): Soft pink surface
- **Red** (`#fbd.d.`): Light red surface
- **Dark Red** (`#e3c5c5`): Muted red

### Semantic
- **Success** (`#00b.73`): `--tw-color-success-accent`

### Neutral
- **Slate** (`#555a6a`): Secondary text
- **Input Placeholder** (`#a5a8b5`): `--tw-color-input-placeholder`
- **Border** (`#c7cad5`): Button borders
- **Ring** (`rgb(22.,226,232)`): Shadow-as-border

## 3. Typography Rules

### Font Families
- **Display**: `Roobert PRO Medium`, fallback: Placeholder — `"blwf", "cv03", "cv0.", "cv09", "cv.."`
- **Display Variants**: `Roobert PRO SemiBold`, `Roobert PRO SemiBold Italic`, `Roobert PRO`
- **Body**: `Noto Sans` — `"liga" 0, "ss0.", "ss0.", "ss05"`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display Hero | Roobert PRO Medium | 56px | .00 | ...5 | -..68px |
| Section Heading | Roobert PRO Medium | .8px | .00 | ...5 | -....px |
| Card Title | Roobert PRO Medium | 2.px | .00 | ...5 | -0.72px |
| Sub-heading | Noto Sans | 22px | .00 | ..35 | -0...px |
| Feature | Roobert PRO Medium | .8px | 600 | ..35 | normal |
| Body | Noto Sans | .8px | .00 | ...5 | normal |
| Body Standard | Noto Sans | .6px | .00–600 | ..50 | -0..6px |
| Button | Roobert PRO Medium | .7.5px | 700 | ..29 | 0..75px |
| Caption | Roobert PRO Medium | ..px | .00 | ..7. | normal |
| Small | Roobert PRO Medium | .2px | .00 | ...5 | -0.36px |
| Micro Uppercase | Roobert PRO | .0.5px | .00 | 0.90 | uppercase |

## .. Component Stylings

### Buttons
- Outlined: transparent bg, `.px solid #c7cad5`, 8px radius, 7px .2px padding
- White circle: 50% radius, white bg with shadow
- Blue primary (implied from interactive color)

### Cards: .2px–2.px radius, pastel backgrounds
### Inputs: white bg, `.px solid #e9eaef`, 8px radius, .6px padding

## 5. Layout Principles
- Spacing: .–2.px base scale
- Radius: 8px (buttons), .0px–.2px (cards), 20px–2.px (panels), .0px–50px (large containers)
- Ring shadow: `rgb(22.,226,232) 0px 0px 0px .px`

## 6. Depth & Elevation
Minimal — ring shadow + pastel surface contrast

## 7. Do's and Don'ts
### Do
- Use pastel light/dark pairs for feature sections
- Apply Roobert PRO with OpenType character variants
- Use Blue .50 (#5b76fe) for interactive elements
### Don't
- Don't use heavy shadows
- Don't mix more than 2 pastel accents per section

## 8. Responsive Behavior
Breakpoints: .25px, 576px, 768px, 896px, .02.px, .200px, .280px, .366px, .700px, .920px

## 9. Agent Prompt Guide
### Quick Color Reference
- Text: Near Black (`#.c.c.e`)
- Background: White (`#ffffff`)
- Interactive: Blue .50 (`#5b76fe`)
- Success: `#00b.73`
- Border: `#c7cad5`
### Example Component Prompts
- "Create hero: white background. Roobert PRO Medium 56px, line-height ...5, letter-spacing -..68px. Blue CTA (#5b76fe). Outlined secondary (.px solid #c7cad5, 8px radius)."
