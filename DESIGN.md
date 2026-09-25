---
version: alpha
name: The Angkor Times
description: |
  A contemporary digital broadsheet design system for The Angkor Times, modeled on the editorial architecture of aiformortals.co and implemented with Nuxt UI v4 utility classes. Rooted in traditional broadsheet craft—multi-column grids, hairline rules, dashed column dividers, Monomakh headline titling, and EB Garamond narrative prose—paired with high-contrast Nuxt UI semantic tokens and an electric chartreuse (#B8EF79) primary action driver on deep forest obsidian (#111410).

colors:
  primary: "#F1EFE8"
  secondary: "#B5BEAD"
  tertiary: "#B8EF79"
  neutral: "#111410"
  surface: "#1B2019"
  surface-light: "#FFFCF6"
  canvas-light: "#FAF7F2"
  ink-dark: "#020817"
  muted-dark: "#686357"
  accent-green: "#1E6025"
  accent-text-dark: "#14200D"
  line-dark: "#47523E"
  line-dashed: "#58644E"
  line-light: "#CBC5B8"
  error: "#FFAAA0"
  error-dark: "#A52C2C"
  retro-blue: "#7BA7D9"
  retro-pink: "#FF6183"
  retro-dark: "#1A1A1A"

typography:
  display-lg:
    fontFamily: Monomakh, serif
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.015em
  display-md:
    fontFamily: Monomakh, serif
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.02em
  section-title:
    fontFamily: Monomakh, serif
    fontSize: 23px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: 0.035em
  headline-card:
    fontFamily: EB Garamond, Georgia, serif
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: -0.01em
  body-lead:
    fontFamily: EB Garamond, Georgia, serif
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
  body-md:
    fontFamily: EB Garamond, Georgia, serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  label-eyebrow:
    fontFamily: Inter, sans-serif
    fontSize: 11px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: 0.055em
  label-meta:
    fontFamily: Inter, sans-serif
    fontSize: 10px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: 0.1em
  ui-button:
    fontFamily: Inter, sans-serif
    fontSize: 12px
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: 0.02em
  code-terminal:
    fontFamily: VT323, monospace
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0em

rounded:
  none: 0px
  xs: 3px
  sm: 4px
  md: 6px
  full: 9999px

spacing:
  2xs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 28px
  container: 1280px

components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.accent-text-dark}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-retro:
    backgroundColor: "{colors.retro-pink}"
    textColor: "{colors.retro-dark}"
    rounded: "{rounded.sm}"
    padding: 12px
  card-lead:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xs}"
    padding: 28px
  card-standard:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xs}"
    padding: 16px
  card-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.xs}"
    padding: 16px
  card-retro:
    backgroundColor: "{colors.retro-blue}"
    textColor: "{colors.retro-dark}"
    rounded: "{rounded.sm}"
    padding: 16px
  badge-category:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-category-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.accent-green}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-meta:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.none}"
    padding: 0px
  badge-meta-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.muted-dark}"
    rounded: "{rounded.none}"
    padding: 0px
  alert-error:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    rounded: "{rounded.sm}"
    padding: 16px
  alert-error-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.error-dark}"
    rounded: "{rounded.sm}"
    padding: 16px
  divider-rule:
    backgroundColor: "{colors.line-dark}"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: 1px
  divider-dashed:
    backgroundColor: "{colors.line-dashed}"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: 1px
  divider-light:
    backgroundColor: "{colors.line-light}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.none}"
    padding: 1px
---

## Overview

The Angkor Times is a digital news publication designed with the authority, deliberate pacing, and typographic gravitas of a classic physical broadsheet. Modeled directly on the editorial visual identity of **aiformortals.co**, the design system marries vintage print journalism with sharp digital accents.

The aesthetic rests on three pillars:

1. **Architectural Broadsheet Grid:** Multi-column layouts, strict 28px gutters, vertical dashed hairline dividers, and heavy 2px section anchor rules.
2. **Dual-Parchment Canvas:** Default dark forest obsidian (`#111410`, Nuxt UI `bg-default`) for evening deep reading, and warm organic parchment (`#FAF7F2`) for archival daytime reading—both completely replacing sterile blacks and whites.
3. **High-Voltage Signal Accents:** The quiet craft of serif prose is punctuated by high-contrast digital moments: electric chartreuse (`#B8EF79`, Nuxt UI `bg-primary` / `text-primary`) action pills and section termination periods (`.dot`).

All components are authored using **Nuxt UI v4** primitives and semantic utility classes (`text-highlighted`, `text-toned`, `text-muted`, `bg-default`, `bg-elevated`, `border-default`), ensuring seamless implementation across the Vue application.

## Colors

The palette centers on high-contrast editorial neutrals, subtle olive framing rules, and a single high-voltage accent green.

- **Primary (`#F1EFE8`):** Warm bone and aged ivory. The primary text color on dark canvas. Mapped to Nuxt UI class `text-highlighted`. Contrast ratio: 14.5:1 against `#111410` (exceeds WCAG AAA).
- **Secondary (`#B5BEAD`):** Pale sage slate used for utilitarian secondary text, metadata timestamps, and subtitles on dark canvas. Mapped to Nuxt UI class `text-muted`. Contrast ratio: 8.8:1.
- **Tertiary (`#B8EF79`):** The primary interaction driver. Electric chartreuse (acid lime) used exclusively for primary action buttons (`UButton color="primary"`), active pills, focus rings, and signature section terminal dots (`.dot`). Mapped to Nuxt UI class `text-primary` / `bg-primary`.
- **Neutral (`#111410`):** Deep forest obsidian used as the default backdrop for evening reading sessions. Mapped to Nuxt UI class `bg-default`.
- **Surface (`#1B2019`):** Elevated dark moss container surface for featured cards, newsletter rails, and guide callouts. Mapped to Nuxt UI class `bg-elevated`.
- **Surface Light (`#FFFCF6`):** Warm ivory surface for card containment in light mode.
- **Canvas Light (`#FAF7F2`):** Warm organic parchment providing a softer, non-glare surface than sterile white.
- **Ink Dark (`#020817`):** Deep print ink for headings and text on light parchment (18.5:1 contrast ratio).
- **Muted Dark (`#686357`):** Weathered slate for utilitarian metadata on light parchment (5.1:1 contrast ratio, passes WCAG AA).
- **Accent Green (`#1E6025`):** Deep emerald foliage tone for daytime category tags and active filter pills on light parchment (5.8:1 contrast ratio).
- **Accent Text Dark (`#14200D`):** Deep forest moss black formulated specifically for maximum contrast (13.5:1) on electric lime buttons.
- **Line Dark (`#47523E`):** Subtle olive hairline border for story separation and thumbnail frames. Mapped to Nuxt UI class `border-default`.
- **Line Dashed (`#58644E`):** 1px dashed rule used to separate vertical broadsheet columns. Mapped to utility `border-dashed border-default`.
- **Line Light (`#CBC5B8`):** Subtle dividing rules on light parchment.
- **Error (`#FFAAA0`):** Soft coral error text and alert borders on dark canvas. Mapped to Nuxt UI `color="error"` / `text-error`.
- **Error Dark (`#A52C2C`):** Crimson alert text on light parchment.
- **Retro Blue (`#7BA7D9`):** Nostalgic Windows 95 bliss blue for experimental benchmark cards and playground modules.
- **Retro Pink (`#FF6183`):** Punchy retro CTA button background for sandbox tools.
- **Retro Dark (`#1A1A1A`):** Charcoal border and text for retro benchmark window frames (6.2:1 contrast ratio on retro pink).

## Typography

The typographical strategy employs four distinct font families, each fulfilling a clear semantic role:

- **Display & Section Titles:** Set in **Monomakh** (with serif fallback). Uppercase, tracked out (`0.035em`), evoking historical broadsheet mastheads with architectural authority.
- **Body & Longform:** Set in **EB Garamond** (with Georgia fallback). Elegant, humanistic serif optimized for sustained reading at 16px–19px with generous line height (1.4–1.6).
- **UI, Metadata, & Controls:** Set in **Inter** (sans-serif). Crisp, geometric, strictly rendered in uppercase for eyebrow badges and metadata with tracking (`0.055em`–`0.1em`).
- **Technical & Retro Accents:** Set in **VT323** (monospace) for telemetry figures, timestamps, and terminal window headers.

### Hierarchy & Scale

- **Display Large (`display-lg`):** Monomakh, 48px / line-height 1.05 / letter-spacing -0.015em / weight 600. Class: `font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-highlighted`.
- **Display Medium (`display-md`):** Monomakh, 32px / line-height 1.12 / letter-spacing -0.02em / weight 600. Class: `font-serif text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight text-highlighted`.
- **Section Title (`section-title`):** Monomakh, 23px / line-height 1.15 / letter-spacing 0.035em / weight 500 / uppercase. Class: `font-serif text-xl sm:text-2xl uppercase tracking-wider text-highlighted`.
- **Headline Card (`headline-card`):** EB Garamond, 21px / line-height 1.16 / letter-spacing -0.01em / weight 600. Class: `font-serif text-lg sm:text-xl font-semibold leading-snug text-highlighted group-hover:underline`.
- **Body Lead (`body-lead`):** EB Garamond, 19px / line-height 1.4 / weight 400. Class: `font-serif text-lg leading-relaxed text-toned`.
- **Body Medium (`body-md`):** EB Garamond, 16px / line-height 1.6 / weight 400. Class: `font-serif text-base leading-relaxed text-toned`.
- **Label Eyebrow (`label-eyebrow`):** Inter, 11px / line-height 1.2 / letter-spacing 0.055em / weight 650 / uppercase. Class: `font-sans text-[11px] font-semibold uppercase tracking-widest text-primary`.
- **Label Meta (`label-meta`):** Inter, 10px / line-height 1.2 / letter-spacing 0.1em / weight 650 / uppercase. Class: `font-sans text-[10px] font-semibold uppercase tracking-widest text-muted`.
- **UI Button (`ui-button`):** Inter, 12px / line-height 1.2 / letter-spacing 0.02em / weight 650. Class: `font-sans text-xs font-semibold uppercase tracking-wider`.
- **Code Terminal (`code-terminal`):** VT323, 18px / line-height 1.3 / weight 400. Class: `font-mono text-lg text-toned`.

## Layout

The layout uses a **Multi-Column Broadsheet Model** contained within a maximum width of `1280px` (`UContainer class="max-w-7xl px-4 sm:px-6 lg:px-8"`).

### Grid Architecture

- **Hero 3-Up Grid:** The signature broadsheet hero layout utilizes `grid grid-cols-1 lg:grid-cols-[1fr_1.6fr_1fr] gap-7 items-start`.
  - **Lead Column (`lead`):** Positioned centrally with a 1.6fr flex width, featuring the primary editorial lead story with a 16:10 aspect ratio image, prominent headline, and extended excerpt. Flanked on both sides by vertical 1px dashed rules (`lg:border-x lg:border-dashed lg:border-default lg:px-7`).
  - **Support Column (`support`):** Left-aligned column displaying secondary headline cards with 16:9 thumbnails and compact serif titles (`flex flex-col gap-6`).
  - **Recent Stories Rail (`recent`):** Right-aligned column listing chronological stories with 68x68 square thumbnails, horizontal 1px dashed row dividers (`divide-y divide-dashed divide-default`), and an integrated newsletter subscription block (`bg-elevated p-5 rounded-sm`).
- **Standard Category Grid (`grid4`):** 4-column card grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`).
- **Lead Row Section (`leadrow`):** Asymmetrical 2-column split with a large 1.6fr feature card on the left and a stacked 1fr link list on the right (`grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8`).
- **Numbered Story List (`picture-list`):** Monospaced two-digit ordinal markers (`01`, `02`, `03`, `04`) paired with story metadata and headline (`flex items-start gap-4 py-3 border-b border-dashed border-default`).

### Boundary Rules & Dividers

- **Major Section Boundary (`secwrap`):** Heavy `2px solid` border in primary ink (`border-b-2 border-default pb-8 mb-8`).
- **Category Header (`cathd`):** Flex container with `1px solid` bottom border (`flex items-center justify-between gap-4 pb-3 mb-6 border-b border-default`), uppercase section name on the left with a colored terminal dot, and a right-aligned "Browse section →" link (`UButton variant="link" color="neutral"`).
- **Column Separator:** Vertical `1px dashed` rule separating columns in multi-column hero layouts (`border-r border-dashed border-default`).

### Responsive Breakpoints

- **Desktop (>= 1100px / `lg`):** Full 3-column broadsheet hero (`grid-cols-[1fr_1.6fr_1fr]`).
- **Tablet (< 1100px / `md`):** Reflows to a 2-column grid (`grid-cols-[1.5fr_1fr]` on row 1, recent rail spanning full width below).
- **Mobile (< 640px / `sm`):** Single vertical stream (`grid-cols-1`). Images maintain full width; touch targets preserve a 44px minimum height.

## Elevation & Depth

Visual hierarchy is communicated strictly through **Tonal Layering** and **Hairline Rules**, never blurry drop shadows.

- **Flat Foundation:** Cards and containers sit directly on the parchment canvas (`bg-default`) or on an elevated surface (`bg-elevated`).
- **Border Hierarchy:** Depth is created with border weights:
  - `border-b-2 border-default` for major section dividers (`secwrap`).
  - `border border-default` for category headers and image borders.
  - `border-dashed border-default` for interior column boundaries and list item dividers.
- **Shadowless Clarity:** No elevation shadows (`shadow-none`) are applied to cards or buttons, maintaining the authentic tactile feel of physical newsprint.

## Shapes

The shape vocabulary balances **Micro-Radii Sharpness** with **Pill Controls**:

- **Content & Imagery (`rounded-xs` / `rounded-[3px]`):** Articles, cards, and editorial photos employ a minimal `3px` corner radius, softening raw digital rectangles without appearing bubbly or rounded.
- **Interactive Controls (`rounded-sm` / `rounded-[4px]`):** Primary buttons, search inputs, and container windows use a clean `4px` radius (`rounded-sm`).
- **Badges & Pills (`rounded-full`):** Category tags, status pills, and filter indicators utilize full pill rounding (`rounded-full`).
- **Media Overlays (`rounded-md` / `rounded-[6px]`):** Video play button badges use a `6px` radius (`rounded-md`).

## Components

Style guidance for core component patterns using Nuxt UI v4:

### Primary Button (`button-primary`)

- **Component:** `<UButton color="primary" variant="solid" />`
- **Utility Classes:** `bg-primary text-[var(--color-accent-text-dark,#14200D)] font-sans text-xs font-semibold uppercase tracking-wider rounded-sm px-4 py-2.5 min-h-[44px] hover:brightness-105 active:brightness-95 transition-all`
- **Role:** High-priority conversion actions (Subscribe, Sign In, Primary Action).
- **Touch Target:** Minimum 44px height for accessible interactions.
- **States:** Hover introduces subtle brightness shift; focus displays a 2px outline in electric lime (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).

### Secondary Button & Links (`button-secondary`)

- **Component:** `<UButton color="neutral" variant="outline" />` or `<UButton color="neutral" variant="ghost" />`
- **Utility Classes:** `bg-elevated text-highlighted border border-default font-sans text-xs font-semibold uppercase tracking-wider rounded-sm px-4 py-2.5 min-h-[44px] hover:bg-muted/50 transition-colors`
- **Text Links (`read-story`, `all`):** Inline flex with trailing arrow `→`, `<UButton variant="link" color="neutral" class="font-sans text-xs font-semibold text-muted hover:text-primary hover:underline underline-offset-4 gap-2" />`.

### Category Badge (`badge-category`)

- **Component:** `<UBadge color="primary" variant="subtle" />`
- **Utility Classes:** `rounded-full px-2.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-widest bg-elevated text-primary border border-default`
- **Light Variant:** `bg-surface-light text-accent-green border border-default`

### Metadata Timestamp (`badge-meta`)

- **Markup:** `<span class="font-sans text-[10px] font-semibold uppercase tracking-widest text-muted">`
- **Middle Dot Divider:** `<span class="text-dimmed px-1.5" aria-hidden="true">&middot;</span>`

### Masthead & Navigation

- **Grid:** `<header class="border-b border-default bg-default font-mono">`
- **Masthead Bar:** 3-column header (`grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5 px-4 sm:px-8 max-w-7xl mx-auto`) aligning date/edition on the left (`text-[11px] uppercase tracking-widest text-muted`), uppercase Monomakh wordmark in the center (`font-serif text-3xl sm:text-4xl text-highlighted tracking-tight uppercase`), and `<UButton>` action on the right.
- **Section Bar:** Centered row of category links (`flex items-center justify-center gap-7 py-2 border-t border-default text-xs uppercase tracking-wider text-muted hover:text-highlighted`).

### Editorial Card (`card-lead` / `card-standard`)

- **Component:** `<UCard>` or native `<article>` wrapper
- **Container Classes:** `bg-default rounded-[3px] border border-default p-4 flex flex-col gap-3 group transition-colors hover:border-muted`
- **Aspect Ratio:** `aspect-16/10` for lead hero image, `aspect-video` (16:9) for standard grid cards (`rounded-[3px] border border-default object-cover w-full`).
- **Title Interaction:** `font-serif text-lg sm:text-xl font-semibold leading-snug text-highlighted group-hover:underline underline-offset-4`.

### Category Section Header (`cathd`)

- **Container Classes:** `flex items-center justify-between gap-4 pb-3 mb-6 border-b border-default`
- **Title:** `font-serif text-2xl uppercase tracking-wider text-highlighted` followed by `<span class="text-primary">.</span>` (`.dot`).
- **Archive Link:** `<NuxtLink class="font-sans text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors flex items-center gap-2">Browse section &rarr;</NuxtLink>`.

### Newsletter Rail & Banner (`railsub` / `subband`)

- **Container Classes:** `bg-elevated text-highlighted rounded-sm border border-default p-6 space-y-4`
- **Lead Text:** `font-serif italic text-lg leading-snug text-toned`
- **Form:** `<UForm class="flex flex-col sm:flex-row gap-2">` with `<UInput class="flex-1 font-mono rounded-sm" placeholder="your-email@example.com" />` and `<UButton color="primary" variant="solid" label="Subscribe" class="rounded-sm" />`.

### Retro Benchmark Window (`card-retro` / `button-retro`)

- **Container Classes:** `relative overflow-hidden rounded-sm border border-default bg-[var(--color-retro-blue,#7BA7D9)] p-4 sm:p-6`
- **Window Frame (`sbwin`):** `bg-white dark:bg-neutral-900 border-2 border-[var(--color-retro-dark,#1A1A1A)] rounded-sm shadow-none`
- **Title Bar (`bar`):** `flex items-center gap-3 px-3 py-2 border-b-2 border-[var(--color-retro-dark,#1A1A1A)] bg-neutral-100 font-mono text-sm`
- **Retro CTA Button:** `<button class="bg-[var(--color-retro-pink,#FF6183)] text-[var(--color-retro-dark,#1A1A1A)] font-sans text-xs font-semibold px-4 py-2 rounded-sm border-2 border-outset border-[#ff9db4] hover:brightness-105 active:border-inset">`.

## Do's and Don'ts

- **Do** use the electric lime accent (`#B8EF79`, `text-primary`, `bg-primary`) sparingly for primary actions, period markers, and active states.
- **Do** author components with Nuxt UI semantic tokens (`text-highlighted`, `text-toned`, `text-muted`, `bg-default`, `bg-elevated`, `border-default`).
- **Do** separate broadsheet columns with vertical 1px dashed rules (`border-dashed border-default`) rather than wide empty gutters.
- **Do** maintain WCAG AA contrast (minimum 4.5:1) for all text against its immediate background.
- **Do** format editorial metadata (category, date, read time) in uppercase Inter (`font-sans text-[10px] font-semibold tracking-widest`).
- **Do** append the signature colored terminal dot (`<span class="text-primary">.</span>`) to all section titles and brand wordmarks.
- **Don't** apply heavy blurred drop shadows (`shadow-lg`); depth is strictly achieved through surface tone and ruled borders (`shadow-none`).
- **Don't** use non-serif fonts for long-form narrative headlines, lead excerpts, or article bodies (`font-serif` / EB Garamond).
- **Don't** mix rounded bubbly corners (e.g. `rounded-xl` or `rounded-2xl`) with the sharp broadsheet aesthetic (micro-radii `rounded-[3px]` / `rounded-sm`).
- **Don't** use sterile pure white (`#FFFFFF`) or pure black (`#000000`) for extensive page backgrounds; use organic parchment (`bg-default` / `#111410` dark, `#FAF7F2` light).
- **Don't** use low-contrast gray text on tinted backgrounds that fails the 4.5:1 contrast requirement.
