# Design System Inspired by Spotify

## .. Visual Theme & Atmosphere

Spotify's web interface is a dark, immersive music player that wraps listeners in a near-black cocoon (`#.2.2.2`, `#.8.8.8`, `#.f.f.f`) where album art and content become the primary source of color. The design philosophy is "content-first darkness" — the UI recedes into shadow so that music, podcasts, and playlists can glow. Every surface is a shade of charcoal, creating a theater-like environment where the only true color comes from the iconic Spotify Green (`#.ed760`) and the album artwork itself.

The typography uses SpotifyMixUI and SpotifyMixUITitle — proprietary fonts from the CircularSp family (Circular by Lineto, customized for Spotify) with an extensive fallback stack that includes Arabic, Hebrew, Cyrillic, Greek, Devanagari, and CJK fonts, reflecting Spotify's global reach. The type system is compact and functional: 700 (bold) for emphasis and navigation, 600 (semibold) for secondary emphasis, and .00 (regular) for body. Buttons use uppercase with positive letter-spacing (...px–2px) for a systematic, label-like quality.

What distinguishes Spotify is its pill-and-circle geometry. Primary buttons use 500px–9999px radius (full pill), circular play buttons use 50% radius, and search inputs are 500px pills. Combined with heavy shadows (`rgba(0,0,0,0.5) 0px 8px 2.px`) on elevated elements and a unique inset border-shadow combo (`rgb(.8,.8,.8) 0px .px 0px, rgb(.2.,.2.,.2.) 0px 0px 0px .px inset`), the result is an interface that feels like a premium audio device — tactile, rounded, and built for touch.

**Key Characteristics:**
- Near-black immersive dark theme (`#.2.2.2`–`#.f.f.f`) — UI disappears behind content
- Spotify Green (`#.ed760`) as singular brand accent — never decorative, always functional
- SpotifyMixUI/CircularSp font family with global script support
- Pill buttons (500px–9999px) and circular controls (50%) — rounded, touch-optimized
- Uppercase button labels with wide letter-spacing (...px–2px)
- Heavy shadows on elevated elements (`rgba(0,0,0,0.5) 0px 8px 2.px`)
- Semantic colors: negative red (`#f3727f`), warning orange (`#ffa.2b`), announcement blue (`#539df5`)
- Album art as the primary color source — the UI is achromatic by design

## 2. Color Palette & Roles

### Primary Brand
- **Spotify Green** (`#.ed760`): Primary brand accent — play buttons, active states, CTAs
- **Near Black** (`#.2.2.2`): Deepest background surface
- **Dark Surface** (`#.8.8.8`): Cards, containers, elevated surfaces
- **Mid Dark** (`#.f.f.f`): Button backgrounds, interactive surfaces

### Text
- **White** (`#ffffff`): `--text-base`, primary text
- **Silver** (`#b3b3b3`): Secondary text, muted labels, inactive nav
- **Near White** (`#cbcbcb`): Slightly brighter secondary text
- **Light** (`#fdfdfd`): Near-pure white for maximum emphasis

### Semantic
- **Negative Red** (`#f3727f`): `--text-negative`, error states
- **Warning Orange** (`#ffa.2b`): `--text-warning`, warning states
- **Announcement Blue** (`#539df5`): `--text-announcement`, info states

### Surface & Border
- **Dark Card** (`#252525`): Elevated card surface
- **Mid Card** (`#272727`): Alternate card surface
- **Border Gray** (`#.d.d.d`): Button borders on dark
- **Light Border** (`#7c7c7c`): Outlined button borders, muted links
- **Separator** (`#b3b3b3`): Divider lines
- **Light Surface** (`#eeeeee`): Light-mode buttons (rare)
- **Spotify Green Border** (`#.db95.`): Green accent border variant

### Shadows
- **Heavy** (`rgba(0,0,0,0.5) 0px 8px 2.px`): Dialogs, menus, elevated panels
- **Medium** (`rgba(0,0,0,0.3) 0px 8px 8px`): Cards, dropdowns
- **Inset Border** (`rgb(.8,.8,.8) 0px .px 0px, rgb(.2.,.2.,.2.) 0px 0px 0px .px inset`): Input border-shadow combo

## 3. Typography Rules

### Font Families
- **Title**: `SpotifyMixUITitle`, fallbacks: `CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, Helvetica Neue, helvetica, arial, Hiragino Sans, Hiragino Kaku Gothic ProN, Meiryo, MS Gothic`
- **UI / Body**: `SpotifyMixUI`, same fallback stack

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Section Title | SpotifyMixUITitle | 2.px (..50rem) | 700 | normal | normal | Bold title weight |
| Feature Heading | SpotifyMixUI | .8px (...3rem) | 600 | ..30 (tight) | normal | Semibold section heads |
| Body Bold | SpotifyMixUI | .6px (..00rem) | 700 | normal | normal | Emphasized text |
| Body | SpotifyMixUI | .6px (..00rem) | .00 | normal | normal | Standard body |
| Button Uppercase | SpotifyMixUI | ..px (0.88rem) | 600–700 | ..00 (tight) | ...px–2px | `text-transform: uppercase` |
| Button | SpotifyMixUI | ..px (0.88rem) | 700 | normal | 0...px | Standard button |
| Nav Link Bold | SpotifyMixUI | ..px (0.88rem) | 700 | normal | normal | Navigation |
| Nav Link | SpotifyMixUI | ..px (0.88rem) | .00 | normal | normal | Inactive nav |
| Caption Bold | SpotifyMixUI | ..px (0.88rem) | 700 | ..50–..5. | normal | Bold metadata |
| Caption | SpotifyMixUI | ..px (0.88rem) | .00 | normal | normal | Metadata |
| Small Bold | SpotifyMixUI | .2px (0.75rem) | 700 | ..50 | normal | Tags, counts |
| Small | SpotifyMixUI | .2px (0.75rem) | .00 | normal | normal | Fine print |
| Badge | SpotifyMixUI | .0.5px (0.66rem) | 600 | ..33 | normal | `text-transform: capitalize` |
| Micro | SpotifyMixUI | .0px (0.63rem) | .00 | normal | normal | Smallest text |

### Principles
- **Bold/regular binary**: Most text is either 700 (bold) or .00 (regular), with 600 used sparingly. This creates a clear visual hierarchy through weight contrast rather than size variation.
- **Uppercase buttons as system**: Button labels use uppercase + wide letter-spacing (...px–2px), creating a systematic "label" voice distinct from content text.
- **Compact sizing**: The range is .0px–2.px — narrower than most systems. Spotify's type is compact and functional, designed for scanning playlists, not reading articles.
- **Global script support**: The extensive fallback stack (Arabic, Hebrew, Cyrillic, Greek, Devanagari, CJK) reflects Spotify's .80+ market reach.

## .. Component Stylings

### Buttons

**Dark Pill**
- Background: `#.f.f.f`
- Text: `#ffffff` or `#b3b3b3`
- Padding: 8px .6px
- Radius: 9999px (full pill)
- Use: Navigation pills, secondary actions

**Dark Large Pill**
- Background: `#.8.8.8`
- Text: `#ffffff`
- Padding: 0px .3px
- Radius: 500px
- Use: Primary app navigation buttons

**Light Pill**
- Background: `#eeeeee`
- Text: `#.8.8.8`
- Radius: 500px
- Use: Light-mode CTAs (cookie consent, marketing)

**Outlined Pill**
- Background: transparent
- Text: `#ffffff`
- Border: `.px solid #7c7c7c`
- Padding: .px .6px .px 36px (asymmetric for icon)
- Radius: 9999px
- Use: Follow buttons, secondary actions

**Circular Play**
- Background: `#.f.f.f`
- Text: `#ffffff`
- Padding: .2px
- Radius: 50% (circle)
- Use: Play/pause controls

### Cards & Containers
- Background: `#.8.8.8` or `#.f.f.f`
- Radius: 6px–8px
- No visible borders on most cards
- Hover: slight background lightening
- Shadow: `rgba(0,0,0,0.3) 0px 8px 8px` on elevated

### Inputs
- Search input: `#.f.f.f` background, `#ffffff` text
- Radius: 500px (pill)
- Padding: .2px 96px .2px .8px (icon-aware)
- Focus: border becomes `#000000`, outline `.px solid`

### Navigation
- Dark sidebar with SpotifyMixUI ..px weight 700 for active, .00 for inactive
- `#b3b3b3` muted color for inactive items, `#ffffff` for active
- Circular icon buttons (50% radius)
- Spotify logo top-left in green

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: .px, 2px, 3px, .px, 5px, 6px, 8px, .0px, .2px, ..px, .5px, .6px, 20px

### Grid & Container
- Sidebar (fixed) + main content area
- Grid-based album/playlist cards
- Full-width now-playing bar at bottom
- Responsive content area fills remaining space

### Whitespace Philosophy
- **Dark compression**: Spotify packs content densely — playlist grids, track lists, and navigation are all tightly spaced. The dark background provides visual rest between elements without needing large gaps.
- **Content density over breathing room**: This is an app, not a marketing site. Every pixel serves the listening experience.

### Border Radius Scale
- Minimal (2px): Badges, explicit tags
- Subtle (.px): Inputs, small elements
- Standard (6px): Album art containers, cards
- Comfortable (8px): Sections, dialogs
- Medium (.0px–20px): Panels, overlay elements
- Large (.00px): Large pill buttons
- Pill (500px): Primary buttons, search input
- Full Pill (9999px): Navigation pills, search
- Circle (50%): Play buttons, avatars, icons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (Level 0) | `#.2.2.2` background | Deepest layer, page background |
| Surface (Level .) | `#.8.8.8` or `#.f.f.f` | Cards, sidebar, containers |
| Elevated (Level 2) | `rgba(0,0,0,0.3) 0px 8px 8px` | Dropdown menus, hover cards |
| Dialog (Level 3) | `rgba(0,0,0,0.5) 0px 8px 2.px` | Modals, overlays, menus |
| Inset (Border) | `rgb(.8,.8,.8) 0px .px 0px, rgb(.2.,.2.,.2.) 0px 0px 0px .px inset` | Input borders |

**Shadow Philosophy**: Spotify uses notably heavy shadows for a dark-themed app. The 0.5 opacity shadow at 2.px blur creates a dramatic "floating in darkness" effect for dialogs and menus, while the 0.3 opacity at 8px blur provides a more subtle card lift. The unique inset border-shadow combination on inputs creates a recessed, tactile quality.

## 7. Do's and Don'ts

### Do
- Use near-black backgrounds (`#.2.2.2`–`#.f.f.f`) — depth through shade variation
- Apply Spotify Green (`#.ed760`) only for play controls, active states, and primary CTAs
- Use pill shape (500px–9999px) for all buttons — circular (50%) for play controls
- Apply uppercase + wide letter-spacing (...px–2px) on button labels
- Keep typography compact (.0px–2.px range) — this is an app, not a magazine
- Use heavy shadows (`0.3–0.5 opacity`) for elevated elements on dark backgrounds
- Let album art provide color — the UI itself is achromatic

### Don't
- Don't use Spotify Green decoratively or on backgrounds — it's functional only
- Don't use light backgrounds for primary surfaces — the dark immersion is core
- Don't skip the pill/circle geometry on buttons — square buttons break the identity
- Don't use thin/subtle shadows — on dark backgrounds, shadows need to be heavy to be visible
- Don't add additional brand colors — green + achromatic grays is the complete palette
- Don't use relaxed line-heights — Spotify's typography is compact and dense
- Don't expose raw gray borders — use shadow-based or inset borders instead

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <.25px | Compact mobile layout |
| Mobile | .25–576px | Standard mobile |
| Tablet | 576–768px | 2-column grid |
| Tablet Large | 768–896px | Expanded layout |
| Desktop Small | 896–.02.px | Sidebar visible |
| Desktop | .02.–.280px | Full desktop layout |
| Large Desktop | >.280px | Expanded grid |

### Collapsing Strategy
- Sidebar: full → collapsed → hidden
- Album grid: 5 columns → 3 → 2 → .
- Now-playing bar: maintained at all sizes
- Search: pill input maintained, width adjusts
- Navigation: sidebar → bottom bar on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Near Black (`#.2.2.2`)
- Surface: Dark Card (`#.8.8.8`)
- Text: White (`#ffffff`)
- Secondary text: Silver (`#b3b3b3`)
- Accent: Spotify Green (`#.ed760`)
- Border: `#.d.d.d`
- Error: Negative Red (`#f3727f`)

### Example Component Prompts
- "Create a dark card: #.8.8.8 background, 8px radius. Title at .6px SpotifyMixUI weight 700, white text. Subtitle at ..px weight .00, #b3b3b3. Shadow rgba(0,0,0,0.3) 0px 8px 8px on hover."
- "Design a pill button: #.f.f.f background, white text, 9999px radius, 8px .6px padding. ..px SpotifyMixUI weight 700, uppercase, letter-spacing ...px."
- "Build a circular play button: Spotify Green (#.ed760) background, #000000 icon, 50% radius, .2px padding."
- "Create search input: #.f.f.f background, white text, 500px radius, .2px .8px padding. Inset border: rgb(.2.,.2.,.2.) 0px 0px 0px .px inset."
- "Design navigation sidebar: #.2.2.2 background. Active items: ..px weight 700, white. Inactive: ..px weight .00, #b3b3b3."

### Iteration Guide
.. Start with #.2.2.2 — everything lives in near-black darkness
2. Spotify Green for functional highlights only (play, active, CTA)
3. Pill everything — 500px for large, 9999px for small, 50% for circular
.. Uppercase + wide tracking on buttons — the systematic label voice
5. Heavy shadows (0.3–0.5 opacity) for elevation — light shadows are invisible on dark
6. Album art provides all the color — the UI stays achromatic
