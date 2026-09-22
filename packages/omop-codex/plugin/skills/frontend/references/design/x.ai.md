# Design System Inspired by xAI

## .. Visual Theme & Atmosphere

xAI's website is a masterclass in dark-first, monospace-driven brutalist minimalism -- a design system that feels like it was built by engineers who understand that restraint is the ultimate form of sophistication. The entire experience is anchored to an almost-black background (`#.f2228`) with pure white text (`#ffffff`), creating a high-contrast, terminal-inspired aesthetic that signals deep technical credibility. There are no gradients, no decorative illustrations, no color accents competing for attention. This is a site that communicates through absence.

The typographic system is split between two carefully chosen typefaces. `GeistMono` (Vercel's monospace font) handles display-level headlines at an extraordinary 320px with weight 300, and also serves as the button typeface in uppercase with tracked-out letter-spacing (...px). `universalSans` handles all body and secondary heading text with a clean, geometric sans-serif voice. The monospace-as-display-font choice is the defining aesthetic decision -- it positions xAI not as a consumer product but as infrastructure, as something built by people who live in terminals.

The spacing system operates on an 8px base grid with values concentrated at the small end (.px, 8px, 2.px, .8px), reflecting a dense, information-focused layout philosophy. Border radius is minimal -- the site barely rounds anything, maintaining sharp, architectural edges. There are no decorative shadows, no gradients, no layered elevation. Depth is communicated purely through contrast and whitespace.

**Key Characteristics:**
- Pure dark theme: `#.f2228` background with `#ffffff` text -- no gray middle ground
- GeistMono at extreme display sizes (320px, weight 300) -- monospace as luxury
- Uppercase monospace buttons with ...px letter-spacing -- technical, commanding
- universalSans for body text at .6px/..5 and headings at 30px/..2 -- clean contrast
- Zero decorative elements: no shadows, no gradients, no colored accents
- 8px spacing grid with a sparse, deliberate scale
- Heroicons SVG icon system -- minimal, functional
- Tailwind CSS with arbitrary values -- utility-first engineering approach

## 2. Color Palette & Roles

### Primary
- **Pure White** (`#ffffff`): The singular text color, link color, and all foreground elements. In xAI's system, white is not a background -- it is the voice.
- **Dark Background** (`#.f2228`): The canvas. A warm near-black with a subtle blue undertone (not pure black, not neutral gray). This specific hue prevents the harsh eye strain of `#000000` while maintaining deep darkness.

### Interactive
- **White Default** (`#ffffff`): Link and interactive element color in default state.
- **White Muted** (`rgba(255, 255, 255, 0.5)`): Hover state for links -- a deliberate dimming rather than brightening, which is unusual and distinctive.
- **White Subtle** (`rgba(255, 255, 255, 0.2)`): Borders, dividers, and subtle surface treatments.
- **Ring Blue** (`rgb(59, .30, 2.6) / 0.5`): Tailwind's default focus ring color (`--tw-ring-color`), used for keyboard accessibility focus states.

### Surface & Borders
- **Surface Elevated** (`rgba(255, 255, 255, 0.05)`): Subtle card backgrounds and hover surfaces -- barely visible lift.
- **Surface Hover** (`rgba(255, 255, 255, 0.08)`): Slightly more visible hover state for interactive containers.
- **Border Default** (`rgba(255, 255, 255, 0..)`): Standard border for cards, dividers, and containers.
- **Border Strong** (`rgba(255, 255, 255, 0.2)`): Emphasized borders for active states and button outlines.

### Functional
- **Text Primary** (`#ffffff`): All headings, body text, labels.
- **Text Secondary** (`rgba(255, 255, 255, 0.7)`): Descriptions, captions, supporting text.
- **Text Tertiary** (`rgba(255, 255, 255, 0.5)`): Muted labels, placeholder text, timestamps.
- **Text Quaternary** (`rgba(255, 255, 255, 0.3)`): Disabled text, very subtle annotations.

## 3. Typography Rules

### Font Family
- **Display / Buttons**: `GeistMono`, with fallback: `ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Liberation Mono, DejaVu Sans Mono, Courier New`
- **Body / Headings**: `universalSans`, with fallback: `universalSans Fallback`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Transform | Notes |
|------|------|------|--------|-------------|----------------|-----------|-------|
| Display Hero | GeistMono | 320px (20rem) | 300 | ..50 | normal | none | Extreme scale, monospace luxury |
| Section Heading | universalSans | 30px (..88rem) | .00 | ..20 (tight) | normal | none | Clean sans-serif contrast |
| Body | universalSans | .6px (.rem) | .00 | ..50 | normal | none | Standard reading text |
| Button | GeistMono | ..px (0.88rem) | .00 | ...3 | ...px | uppercase | Tracked monospace, commanding |
| Label / Caption | universalSans | ..px (0.88rem) | .00 | ..50 | normal | none | Supporting text |
| Small / Meta | universalSans | .2px (0.75rem) | .00 | ..50 | normal | none | Timestamps, footnotes |

### Principles
- **Monospace as display**: GeistMono at 320px is not a gimmick -- it is the brand statement. The fixed-width characters at extreme scale create a rhythmic, architectural quality that no proportional font can achieve.
- **Light weight at scale**: Weight 300 for the 320px headline prevents the monospace from feeling heavy or brutish at extreme sizes. It reads as precise, not overwhelming.
- **Uppercase buttons**: All button text is uppercase GeistMono with ...px letter-spacing. This creates a distinctly technical, almost command-line aesthetic for interactive elements.
- **Sans-serif for reading**: universalSans at .6px/..5 provides excellent readability for body content, creating a clean contrast against the monospace display elements.
- **Two-font clarity**: The system uses exactly two typefaces with clear roles -- monospace for impact and interaction, sans-serif for information and reading. No overlap, no ambiguity.

## .. Component Stylings

### Buttons

**Primary (White on Dark)**
- Background: `#ffffff`
- Text: `#.f2228`
- Padding: .2px 2.px
- Radius: 0px (sharp corners)
- Font: GeistMono ..px weight .00, uppercase, letter-spacing ...px
- Hover: `rgba(255, 255, 255, 0.9)` background
- Use: Primary CTA ("TRY GROK", "GET STARTED")

**Ghost / Outlined**
- Background: transparent
- Text: `#ffffff`
- Padding: .2px 2.px
- Radius: 0px
- Border: `.px solid rgba(255, 255, 255, 0.2)`
- Font: GeistMono ..px weight .00, uppercase, letter-spacing ...px
- Hover: `rgba(255, 255, 255, 0.05)` background
- Use: Secondary actions ("LEARN MORE", "VIEW API")

**Text Link**
- Background: none
- Text: `#ffffff`
- Font: universalSans .6px weight .00
- Hover: `rgba(255, 255, 255, 0.5)` -- dims on hover
- Use: Inline links, navigation items

### Cards & Containers
- Background: `rgba(255, 255, 255, 0.03)` or transparent
- Border: `.px solid rgba(255, 255, 255, 0..)`
- Radius: 0px (sharp) or .px (subtle)
- Shadow: none -- xAI does not use box shadows
- Hover: border shifts to `rgba(255, 255, 255, 0.2)`

### Navigation
- Dark background matching page (`#.f2228`)
- Brand logotype: white text, left-aligned
- Links: universalSans ..px weight .00, `#ffffff` text
- Hover: `rgba(255, 255, 255, 0.5)` text color
- CTA: white primary button, right-aligned
- Mobile: hamburger toggle

### Badges / Tags
**Monospace Tag**
- Background: transparent
- Text: `#ffffff`
- Padding: .px 8px
- Border: `.px solid rgba(255, 255, 255, 0.2)`
- Radius: 0px
- Font: GeistMono .2px uppercase, letter-spacing .px

### Inputs & Forms
- Background: transparent or `rgba(255, 255, 255, 0.05)`
- Border: `.px solid rgba(255, 255, 255, 0.2)`
- Radius: 0px
- Focus: ring with `rgb(59, .30, 2.6) / 0.5`
- Text: `#ffffff`
- Placeholder: `rgba(255, 255, 255, 0.3)`
- Label: `rgba(255, 255, 255, 0.7)`, universalSans ..px

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 8px, 2.px, .8px
- The scale is deliberately sparse -- xAI avoids granular spacing distinctions, preferring large jumps that create clear visual hierarchy through whitespace alone

### Grid & Container
- Max content width: approximately .200px
- Hero: full-viewport height with massive centered monospace headline
- Feature sections: simple vertical stacking with generous section padding (.8px-96px)
- Two-column layouts for feature descriptions at desktop
- Full-width dark sections maintain the single dark background throughout

### Whitespace Philosophy
- **Extreme generosity**: xAI uses vast amounts of whitespace. The 320px headline with .8px+ surrounding padding creates a sense of emptiness that is itself a design statement -- the content is so important it needs room to breathe.
- **Vertical rhythm over horizontal density**: Content stacks vertically with large gaps between sections rather than packing horizontally. This creates a scroll-driven experience that feels deliberate and cinematic.
- **No visual noise**: The absence of decorative elements, borders between sections, and color variety means whitespace is the primary structural tool.

### Breakpoints
- 2000px, .536px, .280px, .02.px, .000px, 768px, 6.0px
- Tailwind responsive modifiers drive breakpoint behavior

### Border Radius Scale
- Sharp (0px): Primary treatment for buttons, cards, inputs -- the default
- Subtle (.px): Occasional softening on secondary containers
- The near-zero radius philosophy is core to the brand's brutalist identity

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, body content |
| Surface (Level .) | `rgba(255,255,255,0.03)` background | Subtle card surfaces |
| Bordered (Level 2) | `.px solid rgba(255,255,255,0..)` border | Cards, containers, dividers |
| Active (Level 3) | `.px solid rgba(255,255,255,0.2)` border | Hover states, active elements |
| Focus (Accessibility) | `ring` with `rgb(59,.30,2.6)/0.5` | Keyboard focus indicator |

**Elevation Philosophy**: xAI rejects the conventional shadow-based elevation system entirely. There are no box-shadows anywhere on the site. Instead, depth is communicated through three mechanisms: (.) opacity-based borders that brighten on interaction, creating a sense of elements "activating" rather than lifting; (2) extremely subtle background opacity shifts (`0.03` to `0.08`) that create barely-perceptible surface differentiation; and (3) the massive scale contrast between the 320px display type and .6px body text, which creates typographic depth. This is elevation through contrast and opacity, not through simulated light and shadow.

## 7. Do's and Don'ts

### Do
- Use `#.f2228` as the universal background -- never pure black `#000000`
- Use GeistMono for all display headlines and button text -- monospace IS the brand
- Apply uppercase + ...px letter-spacing to all button labels
- Use weight 300 for the massive display headline (320px)
- Keep borders at `rgba(255, 255, 255, 0..)` -- barely visible, not absent
- Dim interactive elements on hover to `rgba(255, 255, 255, 0.5)` -- the reverse of convention
- Maintain sharp corners (0px radius) as the default -- brutalist precision
- Use universalSans for all body and reading text at .6px/..5

### Don't
- Don't use box-shadows -- xAI has zero shadow elevation
- Don't introduce color accents beyond white and the dark background -- the monochromatic palette is sacred
- Don't use large border-radius (8px+, pill shapes) -- the sharp edge is intentional
- Don't use bold weights (600-700) for headlines -- weight 300-.00 only
- Don't brighten elements on hover -- xAI dims to `0.5` opacity instead
- Don't add decorative gradients, illustrations, or color blocks
- Don't use proportional fonts for buttons -- GeistMono uppercase is mandatory
- Don't use colored status indicators unless absolutely necessary -- keep everything in the white/dark spectrum

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <6.0px | Single column, hero headline scales dramatically down |
| Small Tablet | 6.0-768px | Slight increase in padding |
| Tablet | 768-.02.px | Two-column layouts begin, heading sizes increase |
| Desktop | .02.-.280px | Full layout, generous whitespace |
| Large | .280-.536px | Wider containers, more breathing room |
| Extra Large | .536-2000px | Maximum content width, centered |
| Ultra | >2000px | Content stays centered, extreme margins |

### Touch Targets
- Buttons use .2px 2.px padding for comfortable touch
- Navigation links spaced with 2.px gaps
- Minimum tap target: ..px height
- Mobile: full-width buttons for easy thumb reach

### Collapsing Strategy
- Hero: 320px monospace headline scales down dramatically (to ~.8px-6.px on mobile)
- Navigation: horizontal links collapse to hamburger menu
- Feature sections: two-column to single-column stacking
- Section padding: 96px -> .8px -> 2.px across breakpoints
- Massive display type is the first thing to resize -- it must remain impactful but not overflow

### Image Behavior
- Minimal imagery -- the site relies on typography and whitespace
- Any product screenshots maintain sharp corners
- Full-width media scales proportionally with viewport

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Dark (`#.f2228`)
- Text Primary: White (`#ffffff`)
- Text Secondary: White 70% (`rgba(255, 255, 255, 0.7)`)
- Text Muted: White 50% (`rgba(255, 255, 255, 0.5)`)
- Text Disabled: White 30% (`rgba(255, 255, 255, 0.3)`)
- Border Default: White .0% (`rgba(255, 255, 255, 0..)`)
- Border Strong: White 20% (`rgba(255, 255, 255, 0.2)`)
- Surface Subtle: White 3% (`rgba(255, 255, 255, 0.03)`)
- Surface Hover: White 8% (`rgba(255, 255, 255, 0.08)`)
- Focus Ring: Blue (`rgb(59, .30, 2.6)` at 50% opacity)
- Button Primary BG: White (`#ffffff`), text Dark (`#.f2228`)

### Example Component Prompts
- "Create a hero section on #.f2228 background. Headline in GeistMono at 72px weight 300, color #ffffff, centered. Subtitle in universalSans .8px weight .00, rgba(255,255,255,0.7), max-width 600px centered. Two buttons: primary (white bg, #.f2228 text, 0px radius, GeistMono ..px uppercase, ...px letter-spacing, .2px 2.px padding) and ghost (transparent bg, .px solid rgba(255,255,255,0.2), white text, same font treatment)."
- "Design a card: transparent or rgba(255,255,255,0.03) background, .px solid rgba(255,255,255,0..) border, 0px radius, 2.px padding. No shadow. Title in universalSans 22px weight .00, #ffffff. Body in universalSans .6px weight .00, rgba(255,255,255,0.7), line-height ..5. Hover: border changes to rgba(255,255,255,0.2)."
- "Build navigation: #.f2228 background, full-width. Brand text left (GeistMono ..px uppercase). Links in universalSans ..px #ffffff with hover to rgba(255,255,255,0.5). White primary button right-aligned (GeistMono ..px uppercase, ...px letter-spacing)."
- "Create a form: dark background #.f2228. Label in universalSans ..px rgba(255,255,255,0.7). Input with transparent bg, .px solid rgba(255,255,255,0.2) border, 0px radius, white text .6px universalSans. Focus: blue ring rgb(59,.30,2.6)/0.5. Placeholder: rgba(255,255,255,0.3)."
- "Design a monospace tag/badge: transparent bg, .px solid rgba(255,255,255,0.2), 0px radius, GeistMono .2px uppercase, .px letter-spacing, white text, .px 8px padding."

### Iteration Guide
.. Always start with `#.f2228` background -- never use pure black or gray backgrounds
2. GeistMono for display and buttons, universalSans for everything else -- never mix these roles
3. All buttons must be GeistMono uppercase with ...px letter-spacing -- this is non-negotiable
.. No shadows, ever -- depth comes from border opacity and background opacity only
5. Borders are always white with low opacity (0.. default, 0.2 for emphasis)
6. Hover behavior dims to 0.5 opacity rather than brightening -- the reverse of most systems
7. Sharp corners (0px) by default -- only use .px for specific secondary containers
8. Body text at .6px universalSans with ..5 line-height for comfortable reading
9. Generous section padding (.8px-96px) -- let content breathe in the darkness
.0. The monochromatic white-on-dark palette is absolute -- resist adding color unless critical for function
