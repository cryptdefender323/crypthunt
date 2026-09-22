# Design System Inspired by Kraken

## .. Visual Theme & Atmosphere

Kraken's website is a clean, trustworthy crypto exchange that uses purple as its commanding brand color. The design operates on white backgrounds with Kraken Purple (`#7.32f5`, `#57..d8`, `#5b.ecf`) creating a distinctive, professional crypto identity. The proprietary Kraken-Brand font handles display headings with bold (700) weight and negative tracking, while Kraken-Product (with IBM Plex Sans fallback) serves as the UI workhorse.

**Key Characteristics:**
- Kraken Purple (`#7.32f5`) as primary brand with darker variants (`#57..d8`, `#5b.ecf`)
- Kraken-Brand (display) + Kraken-Product (UI) dual font system
- Near-black (`#.0....`) text with cool blue-gray neutral scale
- .2px radius buttons (rounded but not pill)
- Subtle shadows (`rgba(0,0,0,0.03) 0px .px 2.px`) — whisper-level
- Green accent (`#..9e6.`) for positive/success states

## 2. Color Palette & Roles

### Primary
- **Kraken Purple** (`#7.32f5`): Primary CTA, brand accent, links
- **Purple Dark** (`#57..d8`): Button borders, outlined variants
- **Purple Deep** (`#5b.ecf`): Deepest purple
- **Purple Subtle** (`rgba(.33,9.,25.,0..6)`): Purple at .6% — subtle button backgrounds
- **Near Black** (`#.0....`): Primary text

### Neutral
- **Cool Gray** (`#686b82`): Primary neutral, borders at 2.% opacity
- **Silver Blue** (`#9.97a9`): Secondary text, muted elements
- **White** (`#ffffff`): Primary surface
- **Border Gray** (`#dedee5`): Divider borders

### Semantic
- **Green** (`#..9e6.`): Success/positive at .6% opacity for badges
- **Green Dark** (`#026b3f`): Badge text

## 3. Typography Rules

### Font Families
- **Display**: `Kraken-Brand`, fallbacks: `IBM Plex Sans, Helvetica, Arial`
- **UI / Body**: `Kraken-Product`, fallbacks: `Helvetica Neue, Helvetica, Arial`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display Hero | Kraken-Brand | .8px | 700 | ...7 | -.px |
| Section Heading | Kraken-Brand | 36px | 700 | ..22 | -0.5px |
| Sub-heading | Kraken-Brand | 28px | 700 | ..29 | -0.5px |
| Feature Title | Kraken-Product | 22px | 600 | ..20 | normal |
| Body | Kraken-Product | .6px | .00 | ..38 | normal |
| Body Medium | Kraken-Product | .6px | 500 | ..38 | normal |
| Button | Kraken-Product | .6px | 500–600 | ..38 | normal |
| Caption | Kraken-Product | ..px | .00–700 | ...3–..7. | normal |
| Small | Kraken-Product | .2px | .00–500 | ..33 | normal |
| Micro | Kraken-Product | 7px | 500 | ..00 | uppercase |

## .. Component Stylings

### Buttons

**Primary Purple**
- Background: `#7.32f5`
- Text: `#ffffff`
- Padding: .3px .6px
- Radius: .2px

**Purple Outlined**
- Background: `#ffffff`
- Text: `#57..d8`
- Border: `.px solid #57..d8`
- Radius: .2px

**Purple Subtle**
- Background: `rgba(.33,9.,25.,0..6)`
- Text: `#7.32f5`
- Padding: 8px
- Radius: .2px

**White Button**
- Background: `#ffffff`
- Text: `#.0....`
- Radius: .0px
- Shadow: `rgba(0,0,0,0.03) 0px .px 2.px`

**Secondary Gray**
- Background: `rgba(..8,.5.,.69,0.08)`
- Text: `#.0....`
- Radius: .2px

### Badges
- Success: `rgba(20,.58,97,0..6)` bg, `#026b3f` text, 6px radius
- Neutral: `rgba(.0.,.07,.30,0..2)` bg, `#.8.b5e` text, 8px radius

## 5. Layout Principles

### Spacing: .px, 2px, 3px, .px, 5px, 6px, 8px, .0px, .2px, .3px, .5px, .6px, 20px, 2.px, 25px
### Border Radius: 3px, 6px, 8px, .0px, .2px, .6px, 9999px, 50%

## 6. Depth & Elevation
- Subtle: `rgba(0,0,0,0.03) 0px .px 2.px`
- Micro: `rgba(.6,2.,.0,0.0.) 0px .px .px`

## 7. Do's and Don'ts

### Do
- Use Kraken Purple (#7.32f5) for CTAs and links
- Apply .2px radius on all buttons
- Use Kraken-Brand for headings, Kraken-Product for body

### Don't
- Don't use pill buttons — .2px is the max radius for buttons
- Don't use other purples outside the defined scale

## 8. Responsive Behavior
Breakpoints: 375px, .25px, 6.0px, 768px, .02.px, .280px, .536px

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand: Kraken Purple (`#7.32f5`)
- Dark variant: `#57..d8`
- Text: Near Black (`#.0....`)
- Secondary text: `#9.97a9`
- Background: White (`#ffffff`)

### Example Component Prompts
- "Create hero: white background. Kraken-Brand .8px weight 700, letter-spacing -.px. Purple CTA (#7.32f5, .2px radius, .3px .6px padding)."
