# Design System Inspired by Airtable

## .. Visual Theme & Atmosphere

Airtable's website is a clean, enterprise-friendly platform that communicates "sophisticated simplicity" through a white canvas with deep navy text (`#.8.d26`) and Airtable Blue (`#.b6.c9`) as the primary interactive accent. The Haas font family (display + text variants) creates a Swiss-precision typography system with positive letter-spacing throughout.

**Key Characteristics:**
- White canvas with deep navy text (`#.8.d26`)
- Airtable Blue (`#.b6.c9`) as primary CTA and link color
- Haas + Haas Groot Disp dual font system
- Positive letter-spacing on body text (0.08px–0.28px)
- .2px radius buttons, .6px–32px for cards
- Multi-layer blue-tinted shadow: `rgba(.5,.27,2.9,0.28) 0px .px 3px`
- Semantic theme tokens: `--theme_*` CSS variable naming

## 2. Color Palette & Roles

### Primary
- **Deep Navy** (`#.8.d26`): Primary text
- **Airtable Blue** (`#.b6.c9`): CTA buttons, links
- **White** (`#ffffff`): Primary surface
- **Spotlight** (`rgba(2.9,252,255,0.97)`): `--theme_button-text-spotlight`

### Semantic
- **Success Green** (`#006.00`): `--theme_success-text`
- **Weak Text** (`rgba(.,..,32,0.69)`): `--theme_text-weak`
- **Secondary Active** (`rgba(7,.2,20,0.82)`): `--theme_button-text-secondary-active`

### Neutral
- **Dark Gray** (`#333333`): Secondary text
- **Mid Blue** (`#25.fad`): Link/accent blue variant
- **Border** (`#e0e2e6`): Card borders
- **Light Surface** (`#f8fafc`): Subtle surface

### Shadows
- **Blue-tinted** (`rgba(0,0,0,0.32) 0px 0px .px, rgba(0,0,0,0.08) 0px 0px 2px, rgba(.5,.27,2.9,0.28) 0px .px 3px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px inset`)
- **Soft** (`rgba(.5,.8,.06,0.05) 0px 0px 20px`)

## 3. Typography Rules

### Font Families
- **Primary**: `Haas`, fallbacks: `-apple-system, system-ui, Segoe UI, Roboto`
- **Display**: `Haas Groot Disp`, fallback: `Haas`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display Hero | Haas | .8px | .00 | ...5 | normal |
| Display Bold | Haas Groot Disp | .8px | 900 | ..50 | normal |
| Section Heading | Haas | .0px | .00 | ..25 | normal |
| Sub-heading | Haas | 32px | .00–500 | ...5–..25 | normal |
| Card Title | Haas | 2.px | .00 | ..20–..30 | 0..2px |
| Feature | Haas | 20px | .00 | ..25–..50 | 0..px |
| Body | Haas | .8px | .00 | ..35 | 0..8px |
| Body Medium | Haas | .6px | 500 | ..30 | 0.08–0..6px |
| Button | Haas | .6px | 500 | ..25–..30 | 0.08px |
| Caption | Haas | ..px | .00–500 | ..25–..35 | 0.07–0.28px |

## .. Component Stylings

### Buttons
- **Primary Blue**: `#.b6.c9`, white text, .6px 2.px padding, .2px radius
- **White**: white bg, `#.8.d26` text, .2px radius, .px border white
- **Cookie Consent**: `#.b6.c9` bg, 2px radius (sharp)

### Cards: `.px solid #e0e2e6`, .6px–2.px radius
### Inputs: Standard Haas styling

## 5. Layout
- Spacing: .–.8px (8px base)
- Radius: 2px (small), .2px (buttons), .6px (cards), 2.px (sections), 32px (large), 50% (circles)

## 6. Depth
- Blue-tinted multi-layer shadow system
- Soft ambient: `rgba(.5,.8,.06,0.05) 0px 0px 20px`

## 7. Do's and Don'ts
### Do: Use Airtable Blue for CTAs, Haas with positive tracking, .2px radius buttons
### Don't: Skip positive letter-spacing, use heavy shadows

## 8. Responsive Behavior
Breakpoints: .25–.66.px (23 breakpoints)

## 9. Agent Prompt Guide
- Text: Deep Navy (`#.8.d26`)
- CTA: Airtable Blue (`#.b6.c9`)
- Background: White (`#ffffff`)
- Border: `#e0e2e6`
