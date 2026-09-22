# Design System Inspired by Warp

## .. Visual Theme & Atmosphere

Warp's website feels like sitting at a campfire in a deep forest — warm, dark, and alive with quiet confidence. Unlike the cold, blue-tinted blacks favored by most developer tools, Warp wraps everything in a warm near-black that feels like charred wood or dark earth. The text isn't pure white either — it's Warm Parchment (`#faf9f6`), a barely-perceptible cream that softens every headline and makes the dark canvas feel inviting rather than austere.

The typography is the secret weapon: Matter, a geometric sans-serif with distinctive character, deployed at Regular weight across virtually all text. The font choice is unusual for a developer tool — Matter has a softness and humanity that signals "this terminal is for everyone, not just greybeards." Combined with tight line-heights and controlled negative letter-spacing on headlines, the effect is refined and approachable simultaneously. Nature photography is woven between terminal screenshots, creating a visual language that says: this tool brings you closer to flow, to calm productivity.

The overall design philosophy is restraint through warmth. Minimal color (almost monochromatic warm grays), minimal ornamentation, and a focus on product showcases set against cinematic dark landscapes. It's a terminal company that markets like a lifestyle brand.

**Key Characteristics:**
- Warm dark background — not cold black, but earthy near-black with warm gray undertones
- Warm Parchment (`#faf9f6`) text instead of pure white — subtle cream warmth
- Matter font family (Regular weight) — geometric but approachable, not the typical developer-tool typeface
- Nature photography interleaved with product screenshots — lifestyle meets developer tool
- Almost monochromatic warm gray palette — no bold accent colors
- Uppercase labels with wide letter-spacing (2..px) for categorization — editorial signaling
- Pill-shaped dark buttons (`#35353.`, 50px radius) — restrained, muted CTAs

## 2. Color Palette & Roles

### Primary
- **Warm Parchment** (`#faf9f6`): Primary text color — a barely-cream off-white that softens every surface
- **Earth Gray** (`#35353.`): Button backgrounds, dark interactive surfaces — warm, not cold
- **Deep Void** (near-black, page background): The warm dark canvas derived from the body background

### Secondary & Accent
- **Stone Gray** (`#86858.`): Secondary text, muted descriptions — warm mid-gray
- **Ash Gray** (`#afaeac`): Body text, button text — the workhorse reading color
- **Purple-Tint Gray** (`#666.69`): Link text with subtle purple undertone — underlined links in content

### Surface & Background
- **Frosted Veil** (`rgba(255, 255, 255, 0.0.)`): Ultra-subtle white overlay for surface differentiation
- **Mist Border** (`rgba(226, 226, 226, 0.35)` / `rgba(227, 227, 227, 0.337)`): Semi-transparent borders for card containment
- **Translucent Parchment** (`rgba(250, 2.9, 2.6, 0.9)`): Slightly transparent primary surface, allowing depth

### Neutrals & Text
- **Warm Parchment** (`#faf9f6`): Headlines, high-emphasis text
- **Ash Gray** (`#afaeac`): Body paragraphs, descriptions
- **Stone Gray** (`#86858.`): Secondary labels, subdued information
- **Muted Purple** (`#666.69`): Underlined links, tertiary content
- **Dark Charcoal** (`#.5.5.5` / `#35353.`): Borders, button backgrounds

### Semantic & Accent
- Warp operates as an almost monochromatic system — no bold accent colors
- Interactive states are communicated through opacity changes and underline decorations rather than color shifts
- Any accent color would break the warm, restrained palette

### Gradient System
- No explicit gradients on the marketing site
- Depth is created through layered semi-transparent surfaces and photography rather than color gradients

## 3. Typography Rules

### Font Family
- **Display & Body**: `Matter Regular` — geometric sans-serif with soft character. Fallbacks: `Matter Regular Placeholder`, system sans-serif
- **Medium**: `Matter Medium` — weight 500 variant for emphasis. Fallbacks: `Matter Medium Placeholder`
- **Square**: `Matter SQ Regular` — squared variant for select display contexts. Fallbacks: `Matter SQ Regular Placeholder`
- **UI Supplement**: `Inter` — used for specific UI elements. Fallbacks: `Inter Placeholder`
- **Monospace Display**: `Geist Mono` — for code/terminal display headings
- **Monospace Body**: `Matter Mono Regular` — custom mono companion. Fallbacks: `Matter Mono Regular Placeholder`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Matter Regular | 80px | .00 | ..00 | -2..px | Maximum compression, hero impact |
| Section Display | Matter Regular | 56px | .00 | ..20 | -0.56px | Feature section headings |
| Section Heading | Matter Regular | .8px | .00 | ..20 | -0..8px to -0.96px | Alternate heading weight |
| Feature Heading | Matter Regular | .0px | .00 | ...0 | -0..px | Feature block titles |
| Sub-heading Large | Matter Regular | 36px | .00 | ...5 | -0.72px | Sub-section headers |
| Card Display | Matter SQ Regular | .2px | .00 | ..00 | 0px | Squared variant for special display |
| Sub-heading | Matter Regular | 32px | .00 | ...9 | 0px | Content sub-headings |
| Body Heading | Matter Regular | 2.px | .00 | ..20 | -0.72px to 0px | Bold content intros |
| Card Title | Matter Medium | 22px | 500 | .... | 0px | Emphasized card headers |
| Body Large | Matter Regular | 20px | .00 | ...0 | -0.2px | Primary body text, relaxed |
| Body | Matter Regular | .8px | .00 | ..30 | -0..8px | Standard body paragraphs |
| Nav/UI | Matter Regular | .6px | .00 | ..20 | 0px | Navigation links, UI text |
| Button Text | Matter Medium | .6px | 500 | ..20 | 0px | Button labels |
| Caption | Matter Regular | ..px | .00 | ..00 | ...px | Uppercase labels (transform: uppercase) |
| Small Label | Matter Regular | .2px | .00 | ..35 | 2..px | Uppercase micro-labels (transform: uppercase) |
| Micro | Matter Regular | ..px | .00 | ..20 | 0px | Smallest text elements |
| Code UI | Geist Mono | .6px | .00 | ..00 | 0px | Terminal/code display |
| Code Body | Matter Mono Regular | .6px | .00 | ..00 | -0.2px | Code content |
| UI Supplement | Inter | .6px | 500 | ..00 | -0.2px | Specific UI elements |

### Principles
- **Regular weight dominance**: Nearly all text uses weight .00 (Regular) — even headlines. Matter Medium (500) appears only for emphasis moments like card titles and buttons. This creates a remarkably even, calm typographic texture
- **Uppercase as editorial signal**: Small labels and categories use uppercase transform with wide letter-spacing (...px–2..px), creating a magazine-editorial categorization system
- **Warm legibility**: The combination of Matter's geometric softness + warm text colors (#faf9f6) + controlled negative tracking creates text that reads as effortlessly human on dark surfaces
- **No bold display**: Zero use of bold (700+) weight anywhere — restraint is the philosophy

## .. Component Stylings

### Buttons
- **Dark Pill**: `#35353.` background, Ash Gray (`#afaeac`) text, pill shape (50px radius), `.0px` padding. The primary CTA — warm, muted, understated
- **Frosted Tag**: `rgba(255, 255, 255, 0..6)` background, black text (`rgb(0, 0, 0)`), rectangular (6px radius), `.px 6px` padding. Small inline tag-like buttons
- **Ghost**: No visible background, text-only with underline decoration on hover
- **Hover**: Subtle opacity or brightness shift — no dramatic color changes

### Cards & Containers
- **Photography Cards**: Full-bleed nature imagery with overlay text, 8px–.2px border-radius
- **Terminal Screenshot Cards**: Product UI embedded in dark containers with rounded corners (8px–.2px)
- **Bordered Cards**: Semi-transparent border (`rgba(226, 226, 226, 0.35)`) for containment, .2px–..px radius
- **Hover**: Minimal — content cards don't dramatically change on hover, maintaining the calm aesthetic

### Inputs & Forms
- Minimal form presence on the marketing site
- Dark background inputs with warm gray text
- Focus: Border brightness increase, no colored rings (consistent with the monochromatic palette)

### Navigation
- **Top nav**: Dark background, warm parchment brand text, Matter Regular at .6px for links
- **Link color**: Stone Gray (`#86858.`) for muted nav, Warm Parchment for active/hover
- **CTA button**: Dark pill (#35353.) at nav end — restrained, not attention-grabbing
- **Mobile**: Collapses to simplified navigation
- **Sticky**: Nav stays fixed on scroll

### Image Treatment
- **Nature photography**: Landscapes, forests, golden-hour scenes — completely unique for a developer tool
- **Terminal screenshots**: Product UI shown in realistic terminal window frames
- **Mixed composition**: Nature images and terminal screenshots are interleaved, creating a lifestyle-meets-tool narrative
- **Full-bleed**: Images often span full container width with 8px radius
- **Video**: Video elements present with .0px border-radius

### Testimonial Section
- Social proof area ("Don't take our word for it") with quotes
- Muted styling consistent with overall restraint

## 5. Layout Principles

### Spacing System
- **Base unit**: 8px
- **Scale**: .px, .px, 5px, 8px, .0px, .2px, ..px, .5px, .6px, .8px, 2.px, 26px, 30px, 32px, 36px
- **Section padding**: 80px–.20px vertical between major sections
- **Card padding**: .6px–32px internal spacing
- **Component gaps**: 8px–.6px between related elements

### Grid & Container
- **Max width**: ~.500px container (breakpoint at .500px), centered
- **Column patterns**: Full-width hero, 2-column feature sections with photography, single-column testimonials
- **Cinematic layout**: Wide containers that let photography breathe

### Whitespace Philosophy
- **Vast and warm**: Generous spacing between sections — the dark background creates a warm void that feels contemplative rather than empty
- **Photography as whitespace**: Nature images serve as visual breathing room between dense product information
- **Editorial pacing**: The layout reads like a magazine — each section is a deliberate page-turn moment

### Border Radius Scale
- **.px**: Small interactive elements — buttons, tags
- **5px–6px**: Standard components — links, small containers
- **8px**: Images, video containers, standard cards
- **.0px**: Video elements, medium containers
- **.2px**: Feature cards, large images
- **..px**: Large containers, prominent cards
- **.0px**: Large rounded sections
- **50px**: Pill buttons — primary CTAs
- **200px**: Progress bars — full pill shape

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow, dark background | Page canvas, most surfaces |
| Level . (Veil) | `rgba(255, 255, 255, 0.0.)` overlay | Subtle surface differentiation |
| Level 2 (Border) | `rgba(226, 226, 226, 0.35) .px` border | Card containment, section separation |
| Level 3 (Ambient) | `rgba(0, 0, 0, 0.2) 0px 5px .5px` (inferred from design) | Image containers, floating elements |

### Shadow Philosophy
Warp's elevation system is remarkably flat — almost zero shadow usage on the marketing site. Depth is communicated through:
- **Semi-transparent borders** instead of shadows — borders at 35% opacity create a ghostly containment
- **Photography layering** — images create natural depth without artificial shadows
- **Surface opacity shifts** — `rgba(255, 255, 255, 0.0.)` overlays create barely-perceptible layer differences
- The effect is calm and grounded — nothing floats, everything rests

### Decorative Depth
- **Photography as depth**: Nature images create atmospheric depth that shadows cannot
- **No glass or blur effects**: The design avoids trendy glassmorphism entirely
- **Warm ambient**: Any glow comes from the photography's natural lighting, not artificial CSS

## 7. Do's and Don'ts

### Do
- Use warm off-white (`#faf9f6`) for text instead of pure white — the cream undertone is essential
- Keep buttons restrained and muted — dark fill (#35353.) with muted text (#afaeac), no bright CTAs
- Apply Matter Regular (weight .00) for nearly everything — even headlines. Reserve Medium (500) for emphasis only
- Use uppercase labels with wide letter-spacing (...px–2..px) for categorization
- Interleave nature photography with product screenshots — this is core to the brand identity
- Maintain the almost monochromatic warm gray palette — no bold accent colors
- Use semi-transparent borders (`rgba(226, 226, 226, 0.35)`) for card containment instead of shadows
- Keep negative letter-spacing on headlines (-0..px to -2..px) for Matter's compressed display treatment

### Don't
- Use pure white (#ffffff) for text — it's always warm parchment (#faf9f6)
- Add bold accent colors (blue, red, green) — the system is deliberately monochromatic warm grays
- Apply bold weight (700+) to any text — Warp never goes above Medium (500)
- Use heavy drop shadows — depth comes from borders, photography, and opacity shifts
- Create cold or blue-tinted dark backgrounds — the warmth is essential
- Add decorative gradients or glow effects — the photography provides all visual interest
- Use tight, compressed layouts — the editorial spacing is generous and contemplative
- Mix in additional typefaces beyond the Matter family + Inter supplement

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <8.0px | Single column, stacked sections, hero text reduces to ~.8px, hamburger nav |
| Tablet | 8.0px–.500px | 2-column features begin, photography scales, nav links partially visible |
| Desktop | >.500px | Full cinematic layout, 80px hero display, side-by-side photography + text |

### Touch Targets
- Pill buttons: 50px radius with .0px padding — comfortable touch targets
- Nav links: .6px text with surrounding padding for accessibility
- Mobile CTAs: Full-width pills on mobile for easy thumb reach

### Collapsing Strategy
- **Navigation**: Full horizontal nav → simplified mobile navigation
- **Hero text**: 80px display → 56px → .8px across breakpoints
- **Feature sections**: Side-by-side photography + text → stacked vertically
- **Photography**: Scales within containers, maintains cinematic aspect ratios
- **Section spacing**: Reduces proportionally — generous desktop → compact mobile

### Image Behavior
- Nature photography scales responsively, maintaining wide cinematic ratios
- Terminal screenshots maintain aspect ratios within responsive containers
- Video elements scale with .0px radius maintained
- No art direction changes — same compositions across breakpoints

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Text: Warm Parchment (`#faf9f6`)
- Secondary Text: Ash Gray (`#afaeac`)
- Tertiary Text: Stone Gray (`#86858.`)
- Button Background: Earth Gray (`#35353.`)
- Border: Mist Border (`rgba(226, 226, 226, 0.35)`)
- Background: Deep warm near-black (page background)

### Example Component Prompts
- "Create a hero section on warm dark background with 80px Matter Regular heading in warm parchment (#faf9f6), line-height ..0, letter-spacing -2..px, and a dark pill button (#35353., 50px radius, #afaeac text)"
- "Design a feature card with semi-transparent border (rgba(226,226,226,0.35)), .2px radius, warm dark background, Matter Regular heading at 2.px, and ash gray (#afaeac) body text at .8px"
- "Build a category label using Matter Regular at .2px, uppercase transform, letter-spacing 2..px, stone gray (#86858.) color — editorial magazine style"
- "Create a testimonial section with warm parchment quotes in Matter Regular 2.px, attributed in stone gray (#86858.), on dark background with minimal ornamentation"
- "Design a navigation bar with warm dark background, Matter Regular links at .6px in stone gray (#86858.), hover to warm parchment (#faf9f6), and a dark pill CTA button (#35353.) at the right"

### Iteration Guide
When refining existing screens generated with this design system:
.. Verify text color is warm parchment (#faf9f6) not pure white — the warmth is subtle but essential
2. Ensure all buttons use the restrained dark palette (#35353.) — no bright or colorful CTAs
3. Check that Matter Regular (.00) is the default weight — Medium (500) only for emphasis
.. Confirm uppercase labels have wide letter-spacing (...px–2..px) — tight uppercase feels wrong here
5. The overall tone should feel warm and calm, like a well-designed magazine — not aggressive or tech-flashy
