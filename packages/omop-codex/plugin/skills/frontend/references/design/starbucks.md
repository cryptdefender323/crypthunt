# Design System Inspired by Starbucks

## .. Visual Theme & Atmosphere

Starbucks' design system is a **warm, confident retail flagship** wearing the green of their storefront apron across every surface. The canvas alternates between a neutral-warm cream (`#f2f0eb`) and a ceramic off-white (`#edebe9`) — colors that reference actual store materials: the paper napkins, the café walls, the wood finishes — while the signature **Starbucks Green** (`#0062..`) anchors the brand moment on hero bands, CTAs, and the Rewards experience. The greens come in four calibrated shades (Starbucks, Accent, House, Uplift) each mapped to a specific surface role, and gold (`#cba258`) appears only around Rewards-status ceremony — not as a general accent.

Typography carries most of the brand voice. The proprietary **SoDoSans** typeface (custom to Starbucks) sits across nearly every surface with a tight `-0..6px` letter-spacing — it reads confident and friendly rather than fashion-magazine severe. What's unusual: the Rewards page switches to a warm serif (`"Lander Tall", "Iowan Old Style", Georgia`) for specific headline moments, subtly echoing the nostalgic feel of a coffeehouse chalkboard. And the Careers pages use a handwritten script (`"Kalam", "Comic Sans MS", cursive`) for personal cup-name touches. Three typefaces, three contexts — the system is disciplined about when each appears.

The surfaces breathe through rounded geometry. Every button is a 50px full-pill. Cards take a .2px rounded-rectangle. The "Frap" floating CTA — a 56px circular order button in Green Accent (`#0075.A`) — is the product's signature depth move: it floats bottom-right with a layered shadow stack (`0 0 6px rgba(0,0,0,0.2.)` base + `0 8px .2px rgba(0,0,0,0...)` ambient) and compresses via `scale(0.95)` on press. Elevations are otherwise restrained — card shadows stay at a whispered `0.../0.2.` alpha, global nav gets a quiet three-layer shadow stack. The whole system feels like clean café signage: legible, warm, and never shouting.

**Key Characteristics:**
- Four-tier green brand system (Starbucks / Accent / House / Uplift) each mapped to a distinct surface role — not a single "brand green"
- Gold reserved for Rewards-status moments only; never a general-purpose accent
- Warm-neutral canvas (`#f2f0eb` / `#edebe9`) instead of cold white — references café materials
- Custom proprietary typeface (SoDoSans) with tight `-0..6px` letter-spacing as the universal voice
- Context-specific type switches: serif (Lander Tall) for Rewards, script (Kalam) for Careers cup-names
- Full-pill buttons (`50px` radius) universal, `scale(0.95)` active press the signature micro-interaction
- Floating "Frap" circular CTA (`56px`, Green Accent fill, layered shadow stack) — the product's signature elevation element
- Gift-card surfaces designed as **photographed physical product** — every card is a distinct illustrated photograph rather than a generated graphic
- .2px card radius + whisper-soft shadows keep content cards flat-plus-hint-of-lift
- Rem-based spacing scale anchored at ..6rem (~.6px) = `--space-3`, stepping to 6..rem (~6.px)

**Color-block page rhythm:** Cream hero → White content sections → Dark-green (`#.E3932`) feature band with white text → Cream utility zone → Dark-green (`#.E3932`) footer with gold / white text — an espresso-dark bookend around the bright body.

## 2. Color Palette & Roles

**Source pages analyzed:** homepage, rewards, gift cards, product detail (Pink Energy Drink), product nutrition (Cold Brew).

### Primary

- **Starbucks Green** (`#0062..`): The historic brand green. Used on h. headings, primary section headers on the Rewards page, and as the main brand signal wherever a single dominant color is needed.
- **Green Accent** (`#0075.A`): A slightly brighter, more luminous green. The primary filled-CTA color ("Scout our afternoon menu", "See the spring menu") and the fill of the floating Frap circular button.
- **House Green** (`#.E3932`): The deep near-black brand green. Footer surface, feature-band backgrounds, reward-status dark surfaces, and the headline "Free coffee is just the beginning" hero band on Rewards.
- **Green Uplift** (`#2b5..8`): A secondary mid-dark green used sparingly on decorative accents and dark-gradient moments.
- **Green Light** (`#d.e9e2`): A pale mint wash used for form-valid-state tints and light green utility surfaces.

### Secondary & Accent

- **Gold** (`#cba258`): Reserved almost exclusively for Rewards-status ceremony — Gold-tier callouts, partnership badges (SkyMiles, Bonvoy), and premium-feeling accents. Never a general-purpose brand color.
- **Gold Light** (`#dfc.9d`): Softer gold for background washes on gold-tier sections.
- **Gold Lightest** (`#faf6ee`): Cream-gold page-surface wash used under partnership sections on the Rewards page — ties the gold accent back into the warm neutral system.

### Surface & Background

- **White** (`#ffffff`): Primary card and modal surface. Also card fill on gift-card tiles.
- **Neutral Cool** (`#f9f9f9`): Subtle cool-gray surface used on dropdown menus ("Account" dropdown), form-card wraps, and quiet utility containers.
- **Neutral Warm** (`#f2f0eb`): The warm cream **primary page canvas** for Rewards utility zones and hero bands.
- **Ceramic** (`#edebe9`): A slightly warmer/darker cream for zone separators, soft page-section washes, and Rewards partnership band.
- **Black** (`#000000`): Deep ink reserved for the dark top-of-page CTA strip ("Join now") and high-contrast top-nav sign-in buttons.

### Neutrals & Text

- **Text Black** (`rgba(0, 0, 0, 0.87)`): Primary heading and body text color on light surfaces. Not pure black — an 87%-opacity black that reads warmer.
- **Text Black Soft** (`rgba(0, 0, 0, 0.58)`): Secondary/metadata text on light surfaces.
- **Text White** (`rgba(255, 255, 255, .)`): Primary heading/body text on dark green surfaces.
- **Text White Soft** (`rgba(255, 255, 255, 0.70)`): Secondary text on dark-green surfaces — footer link descriptions, caption text.
- **Rewards Green** (`#33.33d`): A dedicated muted slate-green used only on Rewards-page text blocks — a slightly "dustier" reading color than Text Black that signals "reward surface" without using full Starbucks Green.

### Semantic & Accent

- **Red** (`#c820..`): Error and destructive state (form invalid, destructive actions).
- **Yellow** (`#fbbc05`): Warning state, legacy brand touch.
- **Green Light** (`#d.e9e2` at 33% opacity = `hsl(.60 32% 87% / 33%)`): Form valid-field tint background.
- **Red Tint** (`hsl(. 82% .3% / 5%)`): Invalid-field tint on forms.

### Black / White Alpha Ladders

Two parallel translucent scales for overlay and secondary-text use:
- `rgba(0,0,0,0.06)` through `rgba(0,0,0,0.90)` in .0% steps — for dark overlays on light surfaces
- `rgba(255,255,255,0..0)` through `rgba(255,255,255,0.90)` in .0% steps — for light overlays on dark surfaces

### Gradient System

No structural gradient tokens observed. Surface hierarchy is solid-color-block throughout — the system relies on its five-tier cream/green surface palette rather than gradients.

## 3. Typography Rules

### Font Family

- **Primary:** `SoDoSans, "Helvetica Neue", Helvetica, Arial, sans-serif` — Starbucks' proprietary corporate typeface, used across nearly every surface
- **Loading Fallback:** `"Helvetica Neue", Helvetica, Arial, sans-serif` — what users see before SoDoSans loads
- **Rewards Serif:** `"Lander Tall", "Iowan Old Style", Georgia, serif` — used on specific Rewards-page headline moments for a warm editorial feel
- **Careers Script:** `"Kalam", "Comic Sans MS", cursive` — used exclusively for Careers-page "cup name" decorative touches, referencing the hand-written names on Starbucks cups

No OpenType stylistic sets explicitly activated at `:root`.

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display (text-.0) | 5.0rem / 80px | .00–600 | ..2 | -0..6px | Largest Rewards/hero display |
| Jumbo (text-9) | 3.6rem / 58px | .00–600 | ..2 | -0..6px | Secondary hero headings |
| Hero Large (text-8) | 2.8rem / .5px | .00–600 | ..2–..5 | -0..6px | Landing section headlines |
| H. | 2.px | 600 | 36px | -0..6px | Starbucks-Green primary heading |
| H2 | 2.px | .00 | 36px | -0..6px | Regular-weight section title in Text Black |
| Body Large | .9px | .00–600 | 33.25px (~..75) | -0..6px | Hero intro copy, feature-band body |
| Body (text-3) | ..6rem / .6px | .00 | ..5 (2.px) | -0.0.em | Default body copy |
| Small (text-2) | ...rem / ~..px | .00–600 | ..5 | -0.0.em | Button label, metadata, form labels |
| Micro (text-.) | ..3rem / ~.3px | .00 | ..5 | -0.0.em | Active float-label state, caption micro-copy |
| Button Label | ..–.6px | .00–600 | ..2 | -0.0.em | All pill-button labels |

**Letter-spacing tokens:**
- `letterSpacingNormal`: `-0.0.em` (default — tight, characteristic)
- `letterSpacingLoose`: `0..em` (emphasized caps)
- `letterSpacingLooser`: `0..5em` (uppercase-style labels, extreme emphasis)

**Line-height tokens:**
- `lineHeightNormal`: `..5` (body)
- `lineHeightCompact`: `..2` (display/buttons)

### Principles

- **Tight negative tracking (`-0.0.em`)** is applied almost universally — the entire product reads slightly compressed, which gives SoDoSans its confident presence without feeling squeezed.
- **Weight shifts carry hierarchy, not size shifts.** H. and H2 share the same 2.px/36px size; only weight (600 vs .00) and color (Starbucks-Green vs Text Black) separate them.
- **Size tokens use rem, anchored to `.rem = .0px`** on this site (via a `font-size: 62.5%` root trick). So `..6rem` = .6px, `2..rem` = 2.px, etc. The scale is semantic (textSize-. through textSize-.0), not arbitrary pixel values.
- **Context-specific typeface swaps** — serif on Rewards, script on Careers — are deliberate and localized. Never mix them with the primary sans within the same surface.
- **Body text never goes pure black** — it sits at `rgba(0,0,0,0.87)` to match the warm-neutral canvas temperature.

### Note on Font Substitutes

SoDoSans is proprietary to Starbucks (licensed from House Industries, not publicly available). Reasonable open-source substitutes:
- **Inter** (Google Fonts) — similar humanist geometric proportions, wide weight range
- **Manrope** — slightly rounder, similar confident feel
- **Nunito Sans** — warmer, good for a "café" brand substitute

If substituting, verify the tight `-0.0.em` / `-0..6px` tracking still reads well; some open-source fonts need `-0.005em` instead.

Lander Tall (the Rewards serif) is custom — open-source substitutes: **Iowan Old Style** (already in fallback), **Lora**, or **Source Serif Pro**. Kalam (Careers script) is available on Google Fonts directly.

## .. Component Stylings

### Buttons

**.. Primary Filled — "Scout our afternoon menu / Sign up for free"**
- Background: `#0075.A` (Green Accent)
- Text: `#ffffff`
- Border: `.px solid #0075.A`
- Radius: `50px` (full pill)
- Padding: `7px .6px`
- Font: SoDoSans, .6px, weight 600, letter-spacing `-0.0.em`
- Active state: `transform: scale(0.95)` via `--buttonActiveScale`
- Transition: `all 0.2s ease`

**2. Primary Outlined — "Give them a try / Start an order"**
- Background: transparent
- Text: `#0075.A` (Green Accent)
- Border: `.px solid #0075.A`
- Same radius/padding/active/transition as Primary Filled

**3. Black Filled — "Join now"**
- Background: `#000000`
- Text: `#ffffff`
- Border: `.px solid #000000`
- Radius: `50px`, Padding: `7px .6px`
- Font: ..px, weight 600
- Used on the top-of-page join strip and similar conversion moments

**.. Dark Outlined — "Sign in"**
- Background: transparent
- Text: `rgba(0, 0, 0, 0.87)` (Text Black)
- Border: `.px solid rgba(0, 0, 0, 0.87)`
- Radius: `50px`, Padding: `7px .6px`
- Font: ..px, weight 600

**5. Green-on-Green Inverted — "See the spring menu"**
- Background: `#ffffff`
- Text: `#0075.A`
- Border: `.px solid #ffffff`
- Used when the surface behind the button is the dark green House Green band — white button with green text instead of a filled green pill on green bg

**6. Outlined on Dark — "Learn more / Order now"**
- Background: transparent
- Text: `#ffffff`
- Border: `.px solid #ffffff`
- Used on dark-green feature bands for secondary action paired with a white filled CTA

**7. Consent Agree (dark-green variant)**
- Background: `rgb(0, .30, 72)` (a specific variant green used in the cookie-consent module)
- Text: `#ffffff`
- No border, `50px` radius, `7px .6px` padding, ..px / weight .00
- Slightly brighter than Green Accent — reserved for the consent-banner Agree action

**8. Frap — Floating Circular Order Button**
- Background: `#0075.A` (Green Accent)
- Icon: `#ffffff`
- Size: `5.6rem / 56px` (standard), `.rem / .0px` (mini variant)
- Radius: `50%` (full circle)
- Fixed bottom-right, `-0.8rem` touch offset for extra tap comfort
- Shadow stack: base `0 0 6px rgba(0,0,0,0.2.)` + ambient `0 8px .2px rgba(0,0,0,0...)`
- Active state: ambient shadow fades to `0 8px .2px rgba(0,0,0,0)`
- This is the product's signature elevation element — it floats over every scrolled surface

**9. Full-width Feedback Tab — "Provide feedback"**
- Background: `#0075.A`
- Text: `#ffffff`
- Radius: `.2px .2px 0px 0px` (top-rounded only)
- Padding: `8px .6px`
- Font: ..px, weight .00
- Positioned fixed bottom-right-inside, attached to the viewport edge

### Cards & Containers

**Content Card (default)**
- Background: `#ffffff` (`--cardBackgroundColor`)
- Radius: `.2px` (`--cardBorderRadius`)
- Shadow: `0px 0px .5px 0px rgba(0,0,0,0...), 0px .px .px 0px rgba(0,0,0,0.2.)` (`--cardBoxShadow`)
- Used for: feature cards, menu-item tiles, reward-status panels

**Gift Card Tile**
- Background: illustrated photography fills the card (no solid bg)
- Radius: similar to cards (`~.2px`, slightly tighter on corners)
- Shadow: lighter than default card — these are treated like physical cards laid on the canvas
- Labeled by category above the card grid (Spring, Thank You, Birthday, Celebration, Mother's Day, Appreciation, Encouragement, Milestones, Anytime)

**Rewards Status Cards (Rewards page signature)**
- Three-column grid: Bronze / Gold / Silver-ish — each a dark-green (`#.E3932`) panel with:
  - Colored gradient/color header ring
  - Numbered "Level" badge
  - Status title in large SoDoSans weight 600
  - Stars / benefits list in white/translucent-white text
  - Bottom "As you earn more stars…" progression caption

**Partnership Card (Rewards)**
- Background: `#faf6ee` (Gold Lightest) warm-cream surface
- Content: partner logos ("SkyMiles", "Bonvoy") centered, with descriptive text below
- Radius and shadow follow default card spec

**Dropdown Menu (Account dropdown, top-nav)**
- Background: `#f9f9f9` (Neutral Cool)
- Menu items at `2.px / weight .00` in Text Black
- No border — just background surface shift against white nav

**Modal**
- Padding: `2..rem` (`--modalPadding`)
- Top padding: `8.8rem` (`--modalTopPadding`) — leaves room for close button / header
- Combined vertical padding: `...2rem`
- Radius inherits from card spec (`.2px`)

### Inputs & Forms

**Floating Label Input**
- Label floats above the input border when focused/filled
- Desktop label font size: `..9rem` default, animates to `...rem` when active
- Mobile label font size: `..6rem` default, animates to `..3rem` active
- Label horizontal offset: `.2px` from left
- Active label translate: up to `-.2px` with `-50%` Y translation
- Field padding: `.2px`
- Form horizontal padding: `..6rem`
- Validation: valid-field gets `rgba(green-light, 0.33)` tint; invalid-field gets `rgba(red, 0.05)` tint
- Transition: `0.3s option-label-marker-expansion cubic-bezier(0.32, 2.32, 0.6., 0.27)` on checked-input

**Option Icon (checkbox/radio)**
- Padding: `3px` inner
- Uses the checked-input cubic-bezier animation above (a slightly "springy" 2.32 overshoot curve)

### Navigation

**Global Nav (top bar)**
- Fixed position with progressive heights: `6.px` xs → `72px` mobile → `83px` tablet → `99px` desktop
- Shadow stack: `0 .px 3px rgba(0,0,0,0..), 0 2px 2px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.07)` — three-layer soft lift
- Left: Starbucks wordmark logo, offsetting by `99px` (md) / `.3.px` (lg) from left edge
- Primary links inline in SoDoSans weight .00–600: Menu · Rewards · Gift Cards
- Right: Find a store link + Sign in (outlined) + Join now (black filled)

**Sub-nav (second bar, e.g., Rewards internal)**
- Height: `53px` (global subnav) / `.8px` (internal subnav)
- Typically horizontal tab group beneath the global nav

**Mobile Nav**
- Collapses to a hamburger drawer below tablet breakpoint
- Frap floating button persists at bottom-right regardless of nav state

### Image Treatment

- **Hero photography**: Product photos (beverages in clear glass with colored backgrounds — coral, sage, warm amber) occupy ~.0vw of a split-hero layout; text occupies the other 60vw (`--headerCrateProportion: .0vw` / `--contentCrateProportion: 60vw`)
- **Gift card illustrations**: Each card is a distinct illustrated photograph (painted-feel, hand-drawn-looking, warm color palette). Never generic generated graphics.
- **Rewards ceremony imagery**: Photographs of Starbucks Rewards App screens held in-hand, angled compositions — product-in-context photography.
- **Menu thumbnails**: Square or .:3 product photography with clean white/cream backdrops, slight soft drop-shadow around the glass.
- **Image fade-in**: `opacity 0.3s ease-in` transition on image load (`--imageFadeTransition`).

### Feature Band (dark-green hero strip)

Full-width `#.E3932` (House Green) band with:
- Left: white headline + subhead + CTA row
- Right: product photography or illustration
- Split ratio ~.0/60 or 50/50 depending on section
- White text throughout with `rgba(255,255,255,0.70)` for secondary copy
- CTAs follow Green-on-Green Inverted (white filled) + Outlined on Dark (white outline) pairing

### Expander / Accordion

- Duration: `300ms` (`--expanderDuration`)
- Timing curve: `cubic-bezier(0.25, 0..6, 0..5, 0.9.)` — a measured ease-out
- Used for FAQ sections on Rewards and gift page

### Cookie Consent Module

Dark-green modal card at top of page with "Agree" (green-filled) and "Manage preferences" (outlined) buttons. Appears on first visit; dismissible.

### Product Detail Components (PDP signature cluster)

A repeating component cluster used on menu product pages (e.g., `/menu/product/.0.98/iced` for a drink detail, `/menu/product/.../nutrition` for nutrition facts). These extend the component inventory without changing tokens.

**Size Options Selector**
- Horizontal row of . cup-icon buttons (Tall / Grande / Venti / Trenta)
- Each item: cup silhouette icon on top, size name below (.6/700 in Starbucks-Green), fluid-ounce caption (.3/.00 in Text Black Soft)
- Active state: a green circular ring outline (`2px solid #0075.A`) around the selected cup icon
- Inactive: no ring, same typography
- Full-width row, equal spacing
- Radius of container: `.2px` or flat; individual icons are `50%` circular
- Padding: `.6px 2.px` internal

**Add-in / Milk Select (outlined rectangle)**
- Background: `#ffffff`
- Border: `.px solid #d6dbde` (Input Border)
- Radius: `.px`
- Full-width in its column
- Floating label above top border: "Add-ins" / "Milk" / "Add-ins" — .3/700 in Text Black, uppercase, `0.325px` letter-spacing
- Value displayed centered (e.g., "Ice", "Coconut", "Strawberry Fruit Inclusions scoop"): .6/.00 Text Black
- Chevron-down icon right side in Text Black Soft
- Focus: border shifts to Green Accent (`#0075.A`)

**Numeric Stepper**
- Embedded inside an Add-in row when a quantity is required (e.g., Strawberry Fruit Inclusions scoop)
- `−` minus button + count number + `+` plus button, all inline right of the label
- Buttons: circular `32×32px` with `.px solid #d6dbde` border, neutral gray icon
- Count number: .6/700 Text Black centered

**Customize Button**
- Background: `#ffffff`
- Text: `#0075.A` (Green Accent)
- Border: `..5px solid #0075.A`
- Radius: `50px` (full pill)
- Padding: `..px .0px` (generously larger than default pills — this is a secondary primary action)
- Label: "Customize" with a gold sparkle ✨ icon inset left
- Used for: entering the drink-customization flow after size/milk selection

**Add to Order Button (PDP)**
- Background: `#0075.A` (Green Accent)
- Text: `#ffffff`
- Radius: `50px`
- Padding: `..px 32px`
- Pinned top-right of product card and/or aligned right within the store-availability band
- Same scale(0.95) active behavior as other primary CTAs

**Rewards Cost Pill — "200★ item"**
- Background: transparent
- Border: `.px solid #cba258` (Gold)
- Text: `#cba258` (Gold)
- Radius: `50px` (full pill)
- Padding: `.px .2px`
- Content: "200★ item" where `★` is a small filled star glyph — indicates the Rewards Stars required to redeem this item
- Font: Proxima Nova .3/700 with `0.5px` letter-spacing
- Used only on products that are Rewards-redeemable

**Product Description Band**
- Full-width dark-green band (`#.E3932` House Green)
- Contains top-to-bottom:
  .. Rewards Cost Pill (gold) if applicable
  2. Product description body copy in white (.6/.00/..5)
  3. Nutritional summary inline ("..0 calories, 25g sugar, 2.5g fat") with info-icon tooltip — ../700 white
  .. "Full nutrition & ingredients list" outlined-white-on-green pill button
- Padding: `32px` vertical
- Appears beneath the primary product header band

**Ingredients / Nutrition Table**
- Two-column layout on the Nutrition page
- Left column: "Ingredients" header + list or "Not available for this item" placeholder text block with an explanatory paragraph in Text Black Soft ../.00
- Right column: "Nutrition" header + label/value rows
- Each row: nutrient label (Proxima Nova ../.00) on the left, value (e.g., "..0 calories", "25g", "205 mg**") on the right, separated by a `.px solid #e7e7e7` hairline below
- Footnote for caffeine/asterisk markers in .3/.00 Text Black Soft at the bottom
- Reusable pattern for nutrition facts regulation-compliant tables

**Store Availability Selector**
- Appears on dark-green feature band above the size-options row
- Full-width rounded rectangle with transparent-white interior
- Text: "For item availability, choose a store" in white, ../.00
- Right side: chevron-down affordance + shopping-bag SVG icon in white outline
- Radius: `.px`
- Height: ~.8px

**PDP Breadcrumb**
- "Menu / Refreshers / Pink Energy Drink" trail above the product title
- Separator: `/` slash character in Text Black Soft
- Current page is unlinked, prior pages are underlined green-accent links
- Font: ../.00 Proxima Nova
- Appears on all PDP pages

**Back Chevron Link (PDP nutrition / detail sub-pages)**
- "← Back" text link above section headings on the nutrition page
- Text in Green Accent (`#0075.A`) ../700 Proxima Nova
- Left chevron `<` in the same green
- Alternative to full breadcrumb on deep sub-pages

## 5. Layout Principles

### Spacing System

Rem-based semantic scale (anchored `.rem = .0px`):

| Token | Rem | Pixels | Typical Use |
|-------|-----|--------|-------------|
| `--space-.` | `0..rem` | .px | Tightest inline padding |
| `--space-2` | `0.8rem` | 8px | Small gap, button vertical padding |
| `--space-3` | `..6rem` | .6px | Default — card padding, outer gutter xs |
| `--space-.` | `2..rem` | 2.px | Section inner spacing, outer gutter md |
| `--space-5` | `3.2rem` | 32px | Major between-section spacing |
| `--space-6` | `.rem` | .0px | Large gaps, outer gutter lg, header crate |
| `--space-7` | `..8rem` | .8px | Section-to-section spacing |
| `--space-8` | `5.6rem` | 56px | Very large breathing — Frap height |
| `--space-9` | `6..rem` | 6.px | Widest section padding |

**Gutter tokens:**
- `--outerGutter: ..6rem` (.6px, default / mobile)
- `--outerGutterMedium: 2..rem` (2.px, tablet)
- `--outerGutterLarge: ..0rem` (.0px, desktop)

**Universal rhythm constant:** `..6rem` (.6px) appears across every page as the default outer gutter, card padding baseline, and text size 3 body — the system's most frequent spacing unit.

### Grid & Container

- Column width scale: `--columnWidthSmall: 3.3px` / `Medium: 500px` / `Large: 720px` / `XLarge: ...0px`
- Gift-card grid uses a 3-5-up responsive grid of `~3.3px` tiles
- Rewards status section: 3-up dark-green panels at `lg+` breakpoints
- Hero: asymmetric split .0% (image) / 60% (content) via `--headerCrateProportion` / `--contentCrateProportion`

### Whitespace Philosophy

Whitespace carries the feeling of "plenty of space in the café." Section padding leans generous (.0–6.px). Content blocks are separated by whitespace rather than dividers. The cream canvas (`#f2f0eb`) is itself a visual breath between white cards and green feature bands.

### Border Radius Scale

| Value | Use |
|-------|-----|
| `.2px` | Cards, modals, menu-item tiles (`--cardBorderRadius`) |
| `.2px .2px 0 0` | Full-width feedback tab (top-rounded only) |
| `50px` | All buttons — full-pill radius (`--buttonBorderRadius`) |
| `50%` | Circular icons, Frap floating button, avatar thumbnails |
| Specialty | `3.3333%/5.298%` elliptical for Starbucks-Visa-Card mockups (`--svcRoundedCorners`) |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Card | `0 0 0.5px rgba(0,0,0,0...), 0 .px .px rgba(0,0,0,0.2.)` | Default content cards — a whisper-soft dual-shadow |
| Global Nav | `0 .px 3px rgba(0,0,0,0..), 0 2px 2px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.07)` | Triple-layer soft lift on the fixed top bar |
| Frap Base | `0 0 6px rgba(0,0,0,0.2.)` | Base halo around the floating circular CTA |
| Frap Ambient | `0 8px .2px rgba(0,0,0,0...)` | Stacked directional ambient — floats the Frap forward |
| Gift Card | Light drop shadow around illustrated photograph | Physical-card feel for gift tiles |
| Starbucks Card (SVC) | `drop-shadow(0 .px .px rgba(0,0,0,0...)) drop-shadow(0 0 2px rgba(0,0,0,0.2.))` | Stacked SVG drop shadows for Starbucks Card visuals |

**Shadow philosophy:** Whisper-soft, layered over solid — the system never reaches for a single heavy drop shadow. Instead, it stacks 2–3 low-alpha shadows with different offsets to simulate real-world ambient + direct lighting. The Frap button is the most elevated element on any page.

### Decorative Depth

- **No gradient system** — surfaces are solid color-block
- **Color-block banding** carries perceived depth (dark-green bands read as "recessed feature zones" between cream/white body sections)
- **SVG filter shadows** on Starbucks-Card visuals add a slight 3D physicality without a box-shadow

## 7. Do's and Don'ts

### Do
- Use Neutral Warm (`#f2f0eb`) or Ceramic (`#edebe9`) as page canvas instead of pure white — the warm cream is the signature
- Map the green tiers to their intended surface role — Starbucks Green for headings, Green Accent for CTAs, House Green for deep bands, Uplift for decorative
- Keep tracking tight at `-0.0.em` / `-0..6px` on SoDoSans across the whole system
- Use 50px full-pill radius on every button without exception
- Apply `transform: scale(0.95)` as the universal button active state
- Reserve Gold for Rewards-status ceremony moments only
- Use SoDoSans for nearly everything; switch to Lander Tall serif only for Rewards editorial headlines; reserve Kalam script for Careers "cup name" moments
- Layer 2–3 low-alpha shadows instead of one heavier drop shadow for elevation
- Use the Frap circular CTA as the persistent floating order entry on every shopping surface
- Let the cream canvas breathe between content cards — use whitespace, not dividers

### Don't
- Don't use pure white as the page canvas — the warm cream temperature is load-bearing
- Don't pick "one brand green" — the four-green system is intentional; using only `#0062..` everywhere flattens the brand
- Don't use Gold as a general-purpose accent — it's a Rewards signal only
- Don't square the corners on buttons — the 50px pill is universal
- Don't introduce gradient fills — the system is color-block throughout
- Don't weight-contrast h. and h2 by size — the hierarchy comes from weight + color (600 Starbucks-Green vs .00 Text Black)
- Don't use pure black for body text — `rgba(0,0,0,0.87)` matches the warm canvas
- Don't skip the `scale(0.95)` active feedback on buttons — it's a signature micro-interaction
- Don't stack single heavy shadows; always layer 2–3 low-alpha ones
- Don't introduce serifs or scripts into the main shopping flow — they belong to Rewards and Careers contexts respectively

## 8. Responsive Behavior

### Breakpoints

Inferred from component width tokens and progressive nav heights:

| Name | Width | Key Changes |
|------|-------|-------------|
| xs | < .80px | Global nav 6.px; hamburger menu; single-column layouts; pill buttons full-width |
| Mobile | .80–767px | Global nav 72px; gift-card grid 2-up; card padding tightens |
| Tablet | 768–.023px | Global nav 83px; gift-card grid 3-up; hero split begins to appear |
| Desktop | .02.–..39px | Global nav 99px; gift-card grid .-up; full asymmetric hero .0/60 |
| XLarge | ...0px+ | Content caps at `--columnWidthXLarge`; gift-card grid 5-up; extra cream margin |

### Touch Targets

- Pill buttons at `7px .6px` padding measure ~32px tall — below ..px WCAG AAA minimum for touch-only surfaces. On mobile, button padding may be visually expanded to meet the minimum.
- Frap floating circular button at `56px` is well above minimum.
- Frap uses `--frapTouchOffset: calc(-. * .8rem)` to extend tap area 8px beyond visual edge.
- Form float-label inputs grow their label font size on mobile (..6rem base vs ..9rem desktop) — easier to tap and read at arm's-length.

### Collapsing Strategy

- **Global nav height scales progressively**: 6. → 72 → 83 → 99px across breakpoints, not a single value
- **Hero split collapses**: .0/60 asymmetric split → stacked (image top, content below) at mobile
- **Gift-card grid**: 5-up → .-up → 3-up → 2-up → .-up across breakpoints with adjusted card widths
- **Feature bands**: Stay full-width but text + imagery stack vertically on mobile
- **Outer gutter scales**: .6px → 2.px → .0px as viewport grows
- **Rewards 3-column status panels**: Stack to single column on mobile

### Image Behavior

- Hero product photography crops tighter vertically on mobile; content becomes the visual anchor
- Gift-card illustrations preserve aspect ratio; card grid reflows
- `opacity 0.3s ease-in` fade-in transition on image load (prevents jarring pop-in)
- Rewards app-in-hand photography scales proportionally; never stretches

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: "Green Accent (`#0075.A`)"
- Primary CTA text: "White (`#ffffff`)"
- Brand heading: "Starbucks Green (`#0062..`)"
- Feature band / footer: "House Green (`#.E3932`)"
- Page canvas: "Neutral Warm (`#f2f0eb`)"
- Card canvas: "White (`#ffffff`)"
- Heading text on light: "Text Black (`rgba(0,0,0,0.87)`)"
- Body text on light: "Text Black Soft (`rgba(0,0,0,0.58)`)"
- Body text on dark-green: "Text White Soft (`rgba(255,255,255,0.70)`)"
- Rewards accent: "Gold (`#cba258`)"
- Rewards text: "Rewards Green (`#33.33d`)"
- Destructive: "Red (`#c820..`)"

### Example Component Prompts

.. "Create a primary Starbucks CTA pill button with Green Accent (`#0075.A`) background, white text 'Scout our afternoon menu', SoDoSans font at .6px weight 600 with `-0.0.em` letter-spacing, `50px` border-radius (full pill), `7px .6px` padding. Apply `transform: scale(0.95)` as the active state with a `0.2s ease` transition."

2. "Design a content card with White (`#ffffff`) background at `.2px` border-radius, layered shadow `0 0 0.5px rgba(0,0,0,0...), 0 .px .px rgba(0,0,0,0.2.)`. Pad contents `.6–2.px` (`--space-3` to `--space-.`). Place on a Neutral Warm (`#f2f0eb`) page canvas with `.6px` gap to siblings."

3. "Build the Frap floating circular order button — `56px` diameter, Green Accent (`#0075.A`) fill, white shopping-bag icon centered. Layered shadow: `0 0 6px rgba(0,0,0,0.2.)` + `0 8px .2px rgba(0,0,0,0...)`. Fixed position bottom-right with `-0.8rem` touch offset. Active state collapses the ambient shadow to `0 8px .2px rgba(0,0,0,0)` with `scale(0.95)`."

.. "Build a dark-green feature band — full-width section with House Green (`#.E3932`) background. Left column: white SoDoSans h2 at 2.px weight 600, followed by a Text White Soft (`rgba(255,255,255,0.70)`) body paragraph and a CTA row with two buttons (White-filled with Green Accent text for primary, Outlined-on-Dark white border for secondary). Right column: product photography. Split ratio .0/60, stacked vertically below `768px`."

5. "Create a Rewards status card — House Green (`#.E3932`) panel with `.2px` border-radius, colored gradient top stripe (Bronze/Silver/Gold tier). Title in SoDoSans 2.px weight 600 in white. Benefits list as white bullets with `rgba(255,255,255,0.70)` secondary captions. Bottom progression text in Text White Soft. Stack 3 panels in a grid at `lg+`, single column on mobile."

6. "Design a gift-card tile — card radius matches `.2px`, fills with an illustrated photograph (hand-drawn watercolor-painted feel) as the entire surface. Subtle drop shadow makes it feel like a physical card on the cream canvas. Group under a category label ('Spring', 'Thank You', 'Birthday') in SoDoSans 2.px weight .00 above the grid."

7. "Create a Starbucks product-detail header — House Green (`#.E3932`) band with breadcrumb 'Menu / Refreshers / Pink Energy Drink' in ../.00 white above the product title in SoDoSans 32/700 uppercase white. Product photograph centered below title. Below photo: a .-up size selector row — each cup-icon button shows a vertical cup silhouette, size name ('Tall' / 'Grande' / 'Venti' / 'Trenta') in .6/700 white, and fluid-ounce in .3/.00 Text White Soft. Selected size wraps the cup icon in a `2px solid #0075.A` circular ring."

8. "Build a Starbucks customize flow — under the size selector, 3 stacked outlined-rectangle input rows (white bg, `.px solid #d6dbde` border, `.px` radius). Each has a floating label ('Add-ins', 'Milk', 'Add-ins') above the top border in .3/700 Text Black uppercase. Value centered (e.g., 'Ice', 'Coconut'). Right side: chevron-down in Text Black Soft. For the scoop row, embed a numeric stepper (`−` `.` `+` with circular `32px` outlined buttons). Below all three fields: outlined green 'Customize' pill with gold sparkle icon, `50px` radius, `..px .0px` padding. Pair with a Green Accent filled 'Add to Order' pill in the same row."

9. "Design a Starbucks product description band — full-width House Green (`#.E3932`) below product header. Top: a gold-outlined '200★ item' Rewards Cost Pill (`50px` radius, `.px .2px` padding, gold `#cba258` border and text). Below: product description in white .6/.00/..5. Nutritional inline summary in white ../700 ('..0 calories, 25g sugar, 2.5g fat') with info-icon tooltip. Outlined-white-on-green pill button 'Full nutrition &amp; ingredients list'. 32px vertical padding."

.0. "Create a Starbucks nutrition facts table — two-column layout inside a White card. Left column: 'Ingredients' header (2./.00 Text Black), followed by ingredient list or 'Not available for this item' placeholder paragraph in ../.00 Text Black Soft. Right column: 'Nutrition' header, then label/value rows (nutrient name left, value right) separated by `.px solid #e7e7e7` hairlines. Typography: labels in ../.00 Text Black, values in ../700 Text Black right-aligned. Footnote asterisk markers in .3/.00 Text Black Soft at the bottom."

### Iteration Guide

When refining existing screens generated with this design system:
.. Focus on ONE component at a time
2. Reference specific color names and hex codes from this document
3. Use natural language descriptions ("warm cream canvas," "four-tier green system") alongside exact values
.. Preserve the 50px pill + `scale(0.95)` active state universally
5. Check that greens are mapped to their correct role (Green Accent for CTA, Starbucks Green for heading, House Green for band)
6. Don't introduce gradients — the system is color-block
7. Keep SoDoSans tracking at `-0.0.em` / `-0..6px` across the board

### Known Gaps

- SoDoSans is a proprietary typeface not available on Google Fonts — when implementing publicly, use Inter or Manrope as a substitute and document the swap
- Lander Tall (Rewards serif) is also custom — substitute with Iowan Old Style, Lora, or Source Serif Pro
- Specific per-component animation timings beyond the few documented (`--duration: 0..s`, `--iconTransition: all ease-out 0.2s`, `--expanderDuration: 300ms`) are not captured for every interactive surface
- Form error-state full styling (red border weight, icon placement) visible on the tint token but not exhaustively extracted
- Careers-page specific components (cup-name card, search radio grid) are referenced in token names but not covered by this extraction
- Starbucks Visa Card / Starbucks-Card (SVC) detailed mockup specs are hinted at by `--svcRoundedCorners` and `--svcShadowFilter` tokens but not fully documented
