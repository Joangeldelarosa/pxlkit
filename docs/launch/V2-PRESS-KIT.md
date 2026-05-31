# `@pxlkit/ui-kit` v2.0 — Press Kit

> Everything you need to write about, share, or post about the v2.0 release of `@pxlkit/ui-kit`.

---

## 1. One-liner

**Ship a retro-future product without rolling your own design system.**

---

## 2. Short pitch (≤ 280 chars)

> `@pxlkit/ui-kit` v2.0 ships **111 React components** with a switchable retro-pixel ↔ modern-linear aesthetic, **WCAG 2.1 AA** out of the box, **95%+ test coverage**, and **30 audit gates** keeping the system coherent. One install, two aesthetics, zero drift.

---

## 3. Long pitch (~150 words)

`@pxlkit/ui-kit` is a production-grade React component library for teams that want a distinctive **retro pixel-art identity** without giving up the ergonomics of a modern design system. v2.0 is a major coherence milestone: 111 components, 73 test files, ~95% coverage, and a single source-of-truth manifest per component drives docs, examples, Storybook, and 30 automated audit gates in CI.

Every component supports two surfaces — `pixel` (chunky 2px borders, staircase clip-paths, mono typography) or `linear` (soft 1px borders, blurred shadows, sans typography) — switchable per-component or per-subtree via `<PxlKitSurfaceProvider>`. Seven tones, three sizes, full keyboard navigation, focus traps in overlays, locale-safe casing (Turkish included).

Built around design-engineer ergonomics: forwardRef contracts, controlled/uncontrolled state machines, token-driven theming, react-hook-form integration, TanStack Table data primitives, Floating-UI positioning. MIT licensed code.

---

## 4. Headline stats

| Metric | Value |
| --- | --- |
| Components | **111** |
| Test files | **73** |
| Test coverage | **≥ 95 %** |
| Accessibility | **WCAG 2.1 AA** verified per component |
| Audit gates in CI | **30** (theme tokens, prop inheritance, a11y, bundle size, forwardRef, controlled/uncontrolled, related graph, ...) |
| Surfaces | **2** — `pixel` (retro) / `linear` (modern) |
| Tones | **7** — green, cyan, gold, red, purple, pink, neutral |
| Locales | **EN + TR** (Turkish I/i / İ/ı handled correctly) |
| Peer deps | `react ≥ 18` (works on 19) |
| License | **MIT** (code) |

---

## 5. Featured components (10 highlights)

The headline acts for the launch story. Each is a primitive most design systems get wrong and that we got right.

1. **`PixelDataTable`** — TanStack-powered with sort, selection, pagination, column visibility, density, sticky header, loading skeleton, empty state. Full a11y.
2. **`PixelCommand`** — Cmd+K palette with fuzzy filter, grouped items, full keyboard nav. Drop-in replacement for hand-rolled command bars.
3. **`PixelHeroSection`** + **`PixelHeroMedia`** — composed hero with centered / split / parallax variants. Solves the "first 100vh of your landing page" problem.
4. **`PixelPricingCard`** + **`PixelRibbon`** — pricing tier with reserved popular-ribbon slot, equal-height subgrid, strikethrough price. The kit's first-class featured-tier primitive.
5. **`PixelForm`** — react-hook-form wrapper with `Root` / `Field` / `Item` / `Label` / `Control` / `Description` / `Message` slots. Auto-wires `aria-describedby` and `aria-invalid`.
6. **`PixelCombobox`** + **`PixelMultiSelect`** — searchable selects with grouped options, ArrowDown / Up / Home / End / Enter / Space nav, aria-activedescendant. Chip-style multi-value, keyboard-reachable removal.
7. **`PixelModal`** / **`PixelDrawer`** / **`PixelSheet`** / **`PixelAlertDialog`** — portaled, focus-trapped, refcounted scroll-lock (iOS-safe), async-close pending UX. The overlay family that handles every edge case.
8. **`PixelTimeline`** + **`PixelStepper`** — vertical event timeline with connector lines; multi-step indicator with orientation + step click. Process visualisation without ad-hoc CSS.
9. **`PixelSparkline`** / **`PixelBarChart`** / **`PixelAreaChart`** — SVG chart primitives that match the surface system. No D3 lift required.
10. **`PixelBento`** + **`PixelBentoCell`** — bento grid with semantic cells (span + kind). The "landing-page asymmetric feature wall" you keep rebuilding.

(For the full 111-component index see the [README](../../packages/ui-kit/README.md) or [storybook.pxlkit.xyz](https://storybook.pxlkit.xyz).)

---

## 6. Brand assets

- **Logo & OG image:** `apps/web/public/og-image.png`
- **Wordmark:** `Pxlkit` (capital P, lowercase rest)
- **Package handle:** `@pxlkit/ui-kit`
- **Repo:** [github.com/joangeldelarosa/pxlkit](https://github.com/joangeldelarosa/pxlkit)
- **Site:** [pxlkit.xyz](https://pxlkit.xyz)
- **Storybook:** [storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)
- **npm:** [npmjs.com/package/@pxlkit/ui-kit](https://www.npmjs.com/package/@pxlkit/ui-kit)

**Colour palette (signature):**

- Cyan `#0EA5E9` — primary identity
- Purple `#A855F7` — accent
- Gold `#FFD700` — feature / featured
- Green `#22C55E` — success
- Red — destructive
- Pink — accent
- Neutral — surfaces / text

**Typography:**

- Pixel: **Press Start 2P**
- Linear: **Inter**
- Mono: **JetBrains Mono**

---

## 7. Twitter / X thread template

> 🧵 1/  v2.0 of `@pxlkit/ui-kit` is out.
>
> 111 React components. Switchable retro-pixel ↔ modern-linear aesthetic. WCAG 2.1 AA. 95%+ test coverage. 30 audit gates in CI.
>
> A design system where the docs cannot drift from the code.
>
> [link]

> 2/  The retro pixel art identity isn't a theme — it's a **surface**.
>
> Every component takes `surface="pixel" | "linear"`. Wrap a subtree in `<PxlKitSurfaceProvider>` and the whole thing flips aesthetic. Same API, two visual languages.

> 3/  Highlights:
>
> • PixelDataTable (TanStack, full a11y)
> • PixelCommand (Cmd+K palette)
> • PixelHeroSection + parallax
> • PixelForm (RHF wrapper)
> • PixelCombobox / MultiSelect / DatePicker
> • PixelModal family (portal, focus-trap, iOS-safe scroll-lock)
> • Charts + Bento + Timeline + Stepper

> 4/  Coherence is enforced, not aspirational.
>
> Every PR runs 30 audit gates: theme tokens, prop inheritance, controlled/uncontrolled contract, forwardRef, a11y patterns, bundle size, related-component graph. Drift fails CI.

> 5/  MIT. React ≥ 18 (works on 19).
>
> `npm install @pxlkit/ui-kit@2`
>
> Docs → pxlkit.xyz
> Storybook → storybook.pxlkit.xyz
> Repo → github.com/joangeldelarosa/pxlkit

---

## 8. Hacker News submission template

**Title:**
> Show HN: Pxlkit v2 – 111 React components with switchable retro-pixel/linear aesthetic

**First comment (author):**

> Hi HN — author here.
>
> Pxlkit is a React component library I've been building to scratch a real itch: I wanted a distinctive retro pixel-art aesthetic for product UIs without rolling my own design system from scratch every project.
>
> v2.0 lands 111 components and the thing I'm proudest of is the **surface system**. Every visible component takes `surface="pixel" | "linear"`. `pixel` is the retro identity — chunky 2px borders, staircase clip-paths for the pixel corners, mono typography, offset block shadows. `linear` is the modern aesthetic — soft 1px borders, blurred drop shadows, sans typography. Same props, same accessibility contract, two completely different visual languages. Wrap a subtree in `<PxlKitSurfaceProvider>` and the whole thing flips.
>
> Other things that matter to me:
>
> - **Coherence as code**, not aspiration. There's a manifest per component (single source of truth) that drives docs, examples, related-component graph, and 30 audit gates in CI. Theme-token usage, prop inheritance, controlled/uncontrolled contracts, forwardRef, a11y patterns, bundle size — all checked on every PR. Drift fails the build.
> - **WCAG 2.1 AA** verified per component, including focus traps in overlays, refcounted iOS-safe scroll lock, keyboard navigation patterns from the WAI-ARIA APG.
> - **react-hook-form** native integration via `PixelForm`. Auto-wires `aria-describedby` / `aria-invalid`.
> - **TanStack Table** for `PixelDataTable`. **Floating-UI** for tooltips/popovers/dropdowns.
> - Locale-safe casing (Turkish İ/ı handled).
>
> Stack: React 18+ (works on 19), TypeScript strict, Tailwind tokens, tsup build, vitest tests. MIT licensed code.
>
> Happy to take questions on the surface system, the audit-gate setup, or anything else.
>
> Docs: pxlkit.xyz
> Storybook: storybook.pxlkit.xyz
> Code: github.com/joangeldelarosa/pxlkit

---

## 9. Reddit submission template (`r/reactjs` / `r/webdev` / `r/SideProject`)

**Title:**
> [Showoff Saturday] Pxlkit v2 — 111 React components with switchable retro-pixel / modern-linear aesthetic, WCAG AA, 30 audit gates in CI

**Body:**

> v2.0 of `@pxlkit/ui-kit` just shipped — a React component library for teams that want a distinctive retro pixel-art identity without rolling their own design system.
>
> **What's in v2:**
>
> - 111 components — full coverage from layout primitives → form workhorses → data viz → overlays → animations → parallax
> - **Surface system**: every component takes `surface="pixel" | "linear"`. Wrap with `<PxlKitSurfaceProvider>` to flip a whole subtree. Same API, two aesthetics.
> - 7 tones × 3 sizes × dark mode × 2 locales (EN + TR with Turkish-safe casing)
> - 73 test files, ≥95 % coverage
> - WCAG 2.1 AA verified per component (focus traps, scroll lock, keyboard nav)
> - 30 audit gates in CI enforce coherence — drift fails the build
> - Built on TanStack Table, Floating-UI, react-hook-form, embla-carousel
> - React ≥ 18 (works on 19), MIT, TypeScript strict
>
> Quick install:
>
> ```bash
> npm install @pxlkit/ui-kit
> ```
>
> ```tsx
> import '@pxlkit/ui-kit/styles.css';
> import { PixelCard, PixelButton, PixelInput } from '@pxlkit/ui-kit';
>
> <PixelCard title="Welcome">
>   <PixelInput label="Username" />
>   <PixelButton tone="green">Get Started</PixelButton>
> </PixelCard>
> ```
>
> Docs: https://pxlkit.xyz
> Storybook: https://storybook.pxlkit.xyz
> Repo: https://github.com/joangeldelarosa/pxlkit
>
> Feedback / criticism welcome — especially on the surface system and the audit-gate setup.

---

## 10. Press contact

**Author:** Joangel De La Rosa
**GitHub:** [@joangeldelarosa](https://github.com/joangeldelarosa)
**Project site:** [pxlkit.xyz](https://pxlkit.xyz)
