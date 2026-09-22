# Design System Inspired by Ollama

## .. Visual Theme & Atmosphere

Ollama's interface is radical minimalism taken to its logical conclusion — a pure-white void where content floats without decoration, shadow, or color. The design philosophy mirrors the product itself: strip away everything unnecessary until only the essential tool remains. This is the digital equivalent of a Dieter Rams object — every pixel earns its place, and the absence of design IS the design.

The entire page exists in pure grayscale. There is zero chromatic color in the interface — no brand blue, no accent green, no semantic red. The only colors that exist are shades between pure black (`#000000`) and pure white (`#ffffff`), creating a monochrome environment that lets the user's mental model of "open models" remain uncolored by brand opinion. The Ollama llama mascot, rendered in simple black line art, is the only illustration — and even it's monochrome.

What makes Ollama distinctive is the combination of SF Pro Rounded (Apple's rounded system font) with an exclusively pill-shaped geometry (9999px radius on everything interactive). The rounded letterforms + rounded buttons + rounded containers create a cohesive "softness language" that makes a developer CLI tool feel approachable and friendly rather than intimidating. This is minimalism with warmth — not cold Swiss-style grid minimalism, but the kind where the edges are literally softened.

**Key Characteristics:**
- Pure white canvas with zero chromatic color — completely grayscale
- SF Pro Rounded headlines creating a distinctively Apple-like softness
- Binary border-radius system: .2px (containers) or 9999px (everything interactive)
- Zero shadows — depth comes exclusively from background color shifts and borders
- Pill-shaped geometry on all interactive elements (buttons, tabs, inputs, tags)
- The Ollama llama as the sole illustration — black line art, no color
- Extreme content restraint — the homepage is short, focused, and uncluttered

## 2. Color Palette & Roles

### Primary
- **Pure Black** (`#000000`): Primary headlines, primary links, and the darkest text. The only "color" that demands attention.
- **Near Black** (`#262626`): Button text on light surfaces, secondary headline weight.
- **Darkest Surface** (`#090909`): The darkest possible surface — barely distinguishable from pure black, used for footer or dark containers.

### Surface & Background
- **Pure White** (`#ffffff`): The primary page background — not off-white, not cream, pure white. Button surfaces for secondary actions.
- **Snow** (`#fafafa`): The subtlest possible surface distinction from white — used for section backgrounds and barely-elevated containers.
- **Light Gray** (`#e5e5e5`): Button backgrounds, borders, and the primary containment color. The workhorse neutral.

### Neutrals & Text
- **Stone** (`#737373`): Secondary body text, footer links, and de-emphasized content. The primary "muted" tone.
- **Mid Gray** (`#525252`): Emphasized secondary text, slightly darker than Stone.
- **Silver** (`#a3a3a3`): Tertiary text, placeholders, and deeply de-emphasized metadata.
- **Button Text Dark** (`#.0.0.0`): Specific to white-surface button text.

### Semantic & Accent
- **Ring Blue** (`#3b82f6` at 50%): The ONLY non-gray color in the entire system — Tailwind's default focus ring, used exclusively for keyboard accessibility. Never visible in normal interaction flow.
- **Border Light** (`#d.d.d.`): A slightly darker gray for white-surface button borders.

### Gradient System
- **None.** Ollama uses absolutely no gradients. Visual separation comes from flat color blocks and single-pixel borders. This is a deliberate, almost philosophical design choice.

## 3. Typography Rules

### Font Family
- **Display**: `SF Pro Rounded`, with fallbacks: `system-ui, -apple-system, system-ui`
- **Body / UI**: `ui-sans-serif`, with fallbacks: `system-ui, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`
- **Monospace**: `ui-monospace`, with fallbacks: `SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New`

*Note: SF Pro Rounded is Apple's system font — it renders with rounded terminals on macOS/iOS and falls back to the system sans-serif on other platforms.*

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | SF Pro Rounded | .8px (3rem) | 500 | ..00 (tight) | normal | Maximum impact, rounded letterforms |
| Section Heading | SF Pro Rounded | 36px (2.25rem) | 500 | .... (tight) | normal | Feature section titles |
| Sub-heading | SF Pro Rounded / ui-sans-serif | 30px (..88rem) | .00–500 | ..20 (tight) | normal | Card headings, feature names |
| Card Title | ui-sans-serif | 2.px (..5rem) | .00 | ..33 | normal | Medium emphasis headings |
| Body Large | ui-sans-serif | .8px (...3rem) | .00–500 | ..56 | normal | Hero descriptions, button text |
| Body / Link | ui-sans-serif | .6px (.rem) | .00–500 | ..50 | normal | Standard body text, navigation |
| Caption | ui-sans-serif | ..px (0.88rem) | .00 | ...3 | normal | Metadata, descriptions |
| Small | ui-sans-serif | .2px (0.75rem) | .00 | ..33 | normal | Smallest sans-serif text |
| Code Body | ui-monospace | .6px (.rem) | .00 | ..50 | normal | Inline code, commands |
| Code Caption | ui-monospace | ..px (0.88rem) | .00 | ...3 | normal | Code snippets, secondary |
| Code Small | ui-monospace | .2px (0.75rem) | .00–700 | ..63 | normal | Tags, labels |

### Principles
- **Rounded display, standard body**: SF Pro Rounded carries display headlines with its distinctive rounded terminals, while the standard system sans handles all body text. The rounded font IS the brand expression.
- **Weight restraint**: Only two weights matter — .00 (regular) for body and 500 (medium) for headings. No bold, no light, no black weight. This extreme restraint reinforces the minimal philosophy.
- **Tight display, comfortable body**: Headlines compress to ..0 line-height, while body text relaxes to ...3–..56. The contrast creates clear hierarchy without needing weight contrast.
- **Monospace for developer identity**: Code blocks and terminal commands appear throughout as primary content, using the system monospace stack.

## .. Component Stylings

### Buttons

**Gray Pill (Primary)**
- Background: Light Gray (`#e5e5e5`)
- Text: Near Black (`#262626`)
- Padding: .0px 2.px
- Border: thin solid Light Gray (`.px solid #e5e5e5`)
- Radius: pill-shaped (9999px)
- The primary action button — understated, grayscale, always pill-shaped

**White Pill (Secondary)**
- Background: Pure White (`#ffffff`)
- Text: Button Text Dark (`#.0.0.0`)
- Padding: .0px 2.px
- Border: thin solid Border Light (`.px solid #d.d.d.`)
- Radius: pill-shaped (9999px)
- Secondary action — visually lighter than Gray Pill

**Black Pill (CTA)**
- Background: Pure Black (`#000000`)
- Text: Pure White (`#ffffff`)
- Radius: pill-shaped (9999px)
- Inferred from "Create account" and "Scout" buttons
- Maximum emphasis — black on white

### Cards & Containers
- Background: Pure White or Snow (`#fafafa`)
- Border: thin solid Light Gray (`.px solid #e5e5e5`) when needed
- Radius: comfortably rounded (.2px) — the ONLY non-pill radius in the system
- Shadow: **none** — zero shadows on any element
- Hover: likely subtle background shift or border darkening

### Inputs & Forms
- Background: Pure White
- Border: `.px solid #e5e5e5`
- Radius: pill-shaped (9999px) — search inputs and form fields are pill-shaped
- Focus: Ring Blue (`#3b82f6` at 50%) ring
- Placeholder: Silver (`#a3a3a3`)

### Navigation
- Clean horizontal nav with minimal elements
- Logo: Ollama llama icon + wordmark in black
- Links: "Models", "Docs", "Pricing" in black at .6px, weight .00
- Search bar: pill-shaped with placeholder text
- Right side: "Sign in" link + "Download" black pill CTA
- No borders, no background — transparent nav on white page

### Image Treatment
- The Ollama llama mascot is the only illustration — black line art on white
- Code screenshots/terminal outputs shown in bordered containers (.2px radius)
- Integration logos displayed as simple icons in a grid
- No photographs, no gradients, no decorative imagery

### Distinctive Components

**Tab Pills**
- Pill-shaped tab selectors (e.g., "Coding" | "OpenClaw")
- Active: Light Gray bg; Inactive: transparent
- All pill-shaped (9999px)

**Model Tags**
- Small pill-shaped tags (e.g., "ollama", "launch", "claude")
- Light Gray background, dark text
- The primary way to browse models

**Terminal Command Block**
- Monospace code showing `ollama run` commands
- Minimal styling — just a bordered .2px-radius container
- Copy button integrated

**Integration Grid**
- Grid of integration logos (Codex, Claude Code, OpenCode, LangChain, etc.)
- Each in a bordered pill or card with icon + name
- Tabbed by category (Coding, Documents & RAG, Automation, Chat)

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 6px, 8px, 9px, .0px, .2px, ..px, .6px, 20px, 2.px, 32px, .0px, .8px, 88px, ..2px
- Button padding: .0px 2.px (consistent across all buttons)
- Card internal padding: approximately 2.–32px
- Section vertical spacing: very generous (88px–..2px)

### Grid & Container
- Max container width: approximately .02.–.280px, centered
- Hero: centered single-column with llama illustration
- Feature sections: 2-column layout (text left, code right)
- Integration grid: responsive multi-column
- Footer: clean single-row

### Whitespace Philosophy
- **Emptiness as luxury**: The page is remarkably short and sparse — no feature section overstays its welcome. Each concept gets minimal but sufficient space.
- **Content density is low by design**: Where other AI companies pack feature after feature, Ollama presents three ideas (run models, use with apps, integrations) and stops.
- **The white space IS the brand**: Pure white space with zero decoration communicates "this tool gets out of your way."

### Border Radius Scale
- Comfortably rounded (.2px): The sole container radius — code blocks, cards, panels
- Pill-shaped (9999px): Everything interactive — buttons, tabs, inputs, tags, badges

*This binary system is extreme and distinctive. There is no .px, no 8px, no gradient of roundness. Elements are either containers (.2px) or interactive (pill).*

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, most content |
| Bordered (Level .) | `.px solid #e5e5e5` | Cards, code blocks, buttons |

**Shadow Philosophy**: Ollama uses **zero shadows**. This is not an oversight — it's a deliberate design decision. Every other major AI product site uses at least subtle shadows. Ollama's flat, shadowless approach creates a paper-like experience where elements are distinguished purely by background color and single-pixel borders. Depth is communicated through **content hierarchy and typography weight**, not visual layering.

## 7. Do's and Don'ts

### Do
- Use pure white (`#ffffff`) as the page background — never off-white or cream
- Use pill-shaped (9999px) radius on all interactive elements — buttons, tabs, inputs, tags
- Use .2px radius on all non-interactive containers — code blocks, cards, panels
- Keep the palette strictly grayscale — no chromatic colors except the blue focus ring
- Use SF Pro Rounded at weight 500 for display headings — the rounded terminals are the brand expression
- Maintain zero shadows — depth comes from borders and background shifts only
- Keep content density low — each section should present one clear idea
- Use monospace for terminal commands and code — it's primary content, not decoration
- Keep all buttons at .0px 2.px padding with pill shape — consistency is absolute

### Don't
- Don't introduce any chromatic color — no brand blue, no accent green, no warm tones
- Don't use border-radius between .2px and 9999px — the system is binary
- Don't add shadows to any element — the flat aesthetic is intentional
- Don't use font weights above 500 — no bold, no black weight
- Don't add decorative illustrations beyond the llama mascot
- Don't use gradients anywhere — flat blocks and borders only
- Don't overcomplicate the layout — two columns maximum, no complex grids
- Don't use borders heavier than .px — containment is always the lightest possible touch
- Don't add hover animations or transitions — interactions should feel instant and direct

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <6.0px | Single column, stacked everything, hamburger nav |
| Small Tablet | 6.0–768px | Minor adjustments to spacing |
| Tablet | 768–850px | 2-column layouts begin |
| Desktop | 850–.02.px | Standard layout, expanded features |
| Large Desktop | .02.–.280px | Maximum content width |

### Touch Targets
- All buttons are pill-shaped with generous padding (.0px 2.px)
- Navigation links at comfortable .6px size
- Minimum touch area easily exceeds ..x..px

### Collapsing Strategy
- **Navigation**: Collapses to hamburger menu on mobile
- **Feature sections**: 2-column → stacked single column
- **Hero text**: .8px → 36px → 30px progressive scaling
- **Integration grid**: Multi-column → 2-column → single column
- **Code blocks**: Horizontal scroll maintained

### Image Behavior
- Llama mascot scales proportionally
- Code blocks maintain monospace formatting
- Integration icons reflow to fewer columns
- No art direction changes

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Text: "Pure Black (#000000)"
- Page Background: "Pure White (#ffffff)"
- Secondary Text: "Stone (#737373)"
- Button Background: "Light Gray (#e5e5e5)"
- Borders: "Light Gray (#e5e5e5)"
- Muted Text: "Silver (#a3a3a3)"
- Dark Text: "Near Black (#262626)"
- Subtle Surface: "Snow (#fafafa)"

### Example Component Prompts
- "Create a hero section on pure white (#ffffff) with an illustration centered above a headline at .8px SF Pro Rounded weight 500, line-height ..0. Use Pure Black (#000000) text. Below, add a black pill-shaped CTA button (9999px radius, .0px 2.px padding) and a gray pill button."
- "Design a code block with a .2px border-radius, .px solid Light Gray (#e5e5e5) border on white background. Use ui-monospace at .6px for the terminal command. No shadow."
- "Build a tab bar with pill-shaped tabs (9999px radius). Active tab: Light Gray (#e5e5e5) background, Near Black (#262626) text. Inactive: transparent background, Stone (#737373) text."
- "Create an integration card grid. Each card is a bordered pill (9999px radius) or a .2px-radius card with .px solid #e5e5e5 border. Icon + name inside. Grid of . columns on desktop."
- "Design a navigation bar: transparent background, no border. Ollama logo on the left, 3 text links (Pure Black, .6px, weight .00), pill search input in the center, 'Sign in' text link and black pill 'Download' button on the right."

### Iteration Guide
.. Focus on ONE component at a time
2. Keep all values grayscale — "Stone (#737373)" not "use a light color"
3. Always specify pill (9999px) or container (.2px) radius — nothing in between
.. Shadows are always zero — never add them
5. Weight is always .00 or 500 — never bold
6. If something feels too decorated, remove it — less is always more for Ollama
