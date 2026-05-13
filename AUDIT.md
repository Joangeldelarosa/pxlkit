# Pxlkit — Coherence Audit

Generated: 2026-05-12. Scope: `apps/web/src/app/**`, `packages/ui-kit/src/**`, `packages/*/README.md`, root `README.md`, `apps/web/src/components/{Navbar,Footer,HeroCollage}.tsx`, `apps/web/src/app/layout.tsx`, `templates/**`.

> **Status (2026-05-12, post-fix):** all 7 remediation commits applied + Storybook coverage added. Verified by `turbo build` (11/11 tasks ✓, 16/16 Next.js pages ✓) and `storybook build` (13/13 stories ✓ including the new ui-kit kitchen-sink set). See `## Remediation status` at the bottom of this file.

Severity legend:
- **HIGH** — user-visible factual contradiction or math error.
- **MED** — copy / count drift between static and dynamic sources; documentation references something that exists elsewhere than implied.
- **LOW** — polish, label/route mismatches, redundancy.

---

## 1. Template count math is broken (HIGH × 4)

The codebase mixes two different definitions of "template": **section variants (24)** vs **total templates (24 + 5 pages = 29)**.

**Ground truth (verified from `apps/web/src/app/templates/previews/index.ts` `PREVIEW_MAP` and each `sections-*.ts` file):**
- 8 section categories × **3 variants each = 24 section variants**
- 5 full-page templates
- **Total = 29 templates**

| # | File | Line | Current copy | Problem |
|---|---|---|---|---|
| 1 | `apps/web/src/app/page.tsx` | 1410 | `"29 section templates across 8 categories ... each with 3 design variants. Plus 5 complete page templates"` | Mathematically impossible: 8 × 3 = **24**, not 29 |
| 2 | `apps/web/src/app/page.tsx` | 306 | `"29 ready-to-use section templates across 8 categories, plus 5 complete page layouts."` | Same conflation; 29 already counts pages |
| 3 | `apps/web/src/app/page.tsx` | 249 | `{ value: '29', label: 'Template Sections' }` | Label "Sections" but 29 includes pages |
| 4 | `apps/web/src/app/page.tsx` | 146 | `<PixelCodeInline tone="cyan">8 section types</PixelCodeInline>` | OK (8 is correct) — but adjacent badge `5 page templates` is OK too. |

**Fix:** standardize on **"24 section variants across 8 categories + 5 page templates (29 total)"** everywhere. Update FAQ accordingly. Convert the stat card to a dynamic count derived from `TEMPLATE_SECTIONS` + `FULL_PAGE_TEMPLATES`.

---

## 2. "10 themed packs" claim is wrong — there are 7 (HIGH × 3)

The repo has **10 npm packages** (`core, ui-kit, voxel, gamification, feedback, social, weather, ui, effects, parallax`) but only **7 of them ship icons** (`gamification, feedback, social, weather, ui, effects, parallax`).

| File | Line | Current | Problem |
|---|---|---|---|
| `apps/web/src/app/templates/previews/faq-previews.tsx` | 28 | `"50+ UI components, 226+ handcrafted SVG icons across 10 packages"` | Icons across **7** packs, not 10. Also "50+ components" disagrees with the canonical "40+/54" claims elsewhere |
| `apps/web/src/app/templates/previews/features-previews.tsx` | 29 | `"226+ handcrafted pixel-art icons spanning 10 themed packs"` | Should be **7 themed packs** |
| `apps/web/src/app/templates/previews/features-previews.tsx` | 80 | `"226+ pixel-perfect icons across 10 themed packs..."` | Same |

**Fix:** Replace "10 packages/packs" with "7 themed packs" in all template copy.

---

## 3. "40+ components" vs reality (MED × 8)

`UI_KIT_COMPONENTS.length` is **54** (verified in `packages/ui-kit/src/registry.ts`). The landing page and `/docs` page use the dynamic count (`UI_COMPONENTS_COUNT`) and correctly render "54+". However, eight statically-hardcoded copies of "40+" are out of sync.

| File | Line | Current |
|---|---|---|
| `apps/web/src/app/layout.tsx` | 13 | SITE_DESCRIPTION: `"40+ retro pixel-art React components"` |
| `apps/web/src/app/layout.tsx` | 263 | JSON-LD softwareapp: `"with 40+ pixel-art components"` |
| `apps/web/src/app/layout.tsx` | 294 | feature bullet: `"40+ retro pixel-art UI components"` |
| `apps/web/src/app/layout.tsx` | 334 | JSON-LD list item: `"40+ retro pixel-art React UI components"` |
| `apps/web/src/app/layout.tsx` | 418 | FAQPage answer: `"40+ retro pixel-art React components"` |
| `apps/web/src/app/opengraph-image.tsx` | 96 | OG image chip: `"40+ Components"` |
| `packages/ui-kit/README.md` | 9, 15, 23 | `"40+ styled React components"` / badge `components-40%2B` / `"40+ retro pixel art styled components"` |
| `apps/web/src/app/templates/previews/faq-previews.tsx` | 28 | `"50+ UI components"` (the only place that overshoots) |

**Fix:** Either treat "40+" as a marketing floor (safe but understates) **or** bump to **"54 components"** / **"40+ components, 54 today"** / **"50+ components"** consistently. Best: replace all hard numbers with the dynamic `UI_KIT_COMPONENTS.length` where possible (already done in `layout.tsx`-adjacent places like landing/docs), and update the README badges to **`components-54-`**. Pick a single SoT and update OG image regenerator too.

---

## 4. `TOTAL_ICON_COUNT` excludes ParallaxPack (MED)

`apps/web/src/components/HeroCollage.tsx:13-23` builds `ALL_ICONS` from 6 packs only (no parallax). `TOTAL_ICON_COUNT = ALL_ICONS.length` is then re-used by the landing page (`page.tsx:24`).

Per the root README + every per-pack README badge:
- gamification 51 + feedback 33 + social 43 + weather 36 + ui 41 + effects 12 = **216**
- + parallax 10 = **226**

So **the landing page's dynamic icon stats show 216, while every static SEO claim says 226.** The two pricing tiers, FAQ answers in JSON-LD, sitemap, opengraph image, layout.tsx, icons/layout.tsx, pricing/page.tsx, templates/data/* — all say `226+`.

**Fix:** Add `import { ParallaxPack } from '@pxlkit/parallax'` and append `...ParallaxPack.icons` to `ALL_ICONS` in `HeroCollage.tsx`. (Note: ParallaxPack icons are `ParallaxPxlKitData`, not `AnyIcon`; the type union may need widening or a separate slot in the floating render.) After the fix `TOTAL_ICON_COUNT === 226` and all references converge.

---

## 5. Registry-claimed components vs implementation (PASS, with note)

All **54 names** in `packages/ui-kit/src/registry.ts` resolve to real exports in `packages/ui-kit/src/*.tsx`. The Bare* trio (`PixelBareButton`, `PixelBareInput`, `PixelBareTextarea`) is implemented as `forwardRef` consts in `data-display.tsx:268-281`. ✅

**Note for `/ui-kit` page:** the page documents `id: 'pixel-toast'` and renders a PixelToast demo, but **PixelToast ships from `@pxlkit/core`**, not `@pxlkit/ui-kit`. The page itself doesn't claim it's a ui-kit component, but a casual reader might assume `import { PixelToast } from '@pxlkit/ui-kit'` works (it doesn't). Solution: the demo's code-snippet should explicitly import from `'@pxlkit/core'`, and a small "Lives in `@pxlkit/core`" badge next to the section header would remove all ambiguity.

---

## 6. Navbar/route labels (LOW)

| File | Line | Issue |
|---|---|---|
| `apps/web/src/components/Navbar.tsx` | NAV_ITEMS | Label `"Worlds"` (with 🚧 badge) routes to `/explore`. Page title is "Explore" / `/explore`. Pick one canonical name. |
| `apps/web/src/components/Footer.tsx` | links list | Footer does **not** link to `/explore` even though Navbar does. Either add it (with 🚧 badge style) or drop the Navbar entry until ready. |
| `apps/web/src/app/toast/page.tsx` | redirect | `/toast` redirects to `/ui-kit`. The redirect is silent (no anchor `#pixel-toast`). A consumer hitting `/toast` would land at the top of `/ui-kit` — give it `redirect('/ui-kit#pixel-toast')` instead. |
| `apps/web/src/app/explore/page.tsx` | useEffect | Footer is hidden via DOM querying (`document.querySelector('footer').style.display='none'`) instead of via `ConditionalShell`. The shell currently treats only `/templates/preview` as isolated. Move `/explore` into the same isolated set for consistency, or keep DOM trick but add a comment explaining why. |

---

## 7. Voxel README ↔ landing copy ↔ explore page (MED)

`README.md` (root) describes `@pxlkit/voxel` with extensive features ("9+ Biomes", "20+ building types", "Day/Night Cycle", etc.). The npm package `@pxlkit/voxel` v0.1.3 only **exports** `pxlToVoxels`, `upscaleGrid`, types, and `VoxelBomb` — not the city engine. The city engine lives in `apps/web/src/components/procedural-terrain/` and is consumed only by `/explore`.

| Claim | Where it appears | Reality |
|---|---|---|
| "MIT-Licensed 3D Voxel Game Engine 🎮" | `README.md` | Functions claimed (biomes, day/night, fly camera, etc.) are NOT in `@pxlkit/voxel` package — they're in `apps/web/src/components/procedural-terrain/`. The published package today exposes 2 utility functions + 1 sample icon. |
| "Live Demo: pxlkit.xyz/explore" | README & landing | OK — that demo *does* run the engine. But the engine is not yet packaged. |

**Fix options:**
- (A) Move the procedural-terrain modules into `packages/voxel/src/` and re-export. Then the README matches package reality.
- (B) Rephrase the README as: "*Engine lives in the showcase app today; package exports are utility primitives — full engine ships in v1.*"

This is a marketing-vs-package-truth gap that may bite anyone who runs `npm install @pxlkit/voxel` expecting biomes. Pick (A) or (B) deliberately.

---

## 8. Footer / Navbar / docs sidebar duplicate "components count" with different intents (LOW)

`/docs/page.tsx:78` shows `{sections.length} sections · {TOTAL_ICONS} icons · {ALL_PACKS.length} packs` — here `TOTAL_ICONS` is **dynamic across 6 packs (matches HeroCollage)** = 216 if our hypothesis is right. **`/docs` says one number, the docs *body* says "226+".** Same root cause as finding #4 — fixing HeroCollage fixes this.

`/docs/page.tsx:214`: `{UI_COMPONENTS_COUNT} components · PixelToast guide · {TOTAL_ICONS} icons across {ALL_PACKS.length} packs · 3D Parallax` — `ALL_PACKS` is the 6-pack list, but the body talks about Parallax (7th pack) separately. Either include parallax in the docs `ALL_PACKS` (it has an `IconPack` shape via `ParallaxPack`), or say "6 standard packs + 3D parallax".

---

## 9. ui-kit README badges (LOW)

`packages/ui-kit/README.md:15`: `components-40%2B`. Other badges across the repo show `icons-51`, `icons-33`, etc. — exact numbers. The 40+ badge floor is inconsistent with this style. Either show `components-54` (and bump it as you add) or update sibling icon badges to the same "+" style.

---

## 10. Misc copy / labels (LOW)

| File | Line | Note |
|---|---|---|
| `apps/web/src/app/page.tsx` | 197 | "Sample icons from 7 themed packs" — only 6 packs are actually iterated by `ALL_ICONS`. Should either iterate 7 (after #4 fix) or say "6 standard packs". |
| `apps/web/src/app/page.tsx` | 223 | "{TOTAL_ICON_COUNT}+ icons · 7 packs · tree-shakeable SVG" — same issue. |
| `apps/web/src/app/page.tsx` | 701 | `{TOTAL_ICON_COUNT}+ HAND-CRAFTED PIXEL ART SVG ICONS` — see #4. |
| `apps/web/src/app/page.tsx` | 1430 | FAQ "How many icons" — uses dynamic `TOTAL_ICON_COUNT` → reads 216, but every static SEO claim says 226. |
| `packages/ui-kit/README.md` description | "40+ styled React components" → "54+ retro pixel art React components". |
| `apps/web/src/app/docs/layout.tsx` | description metadata | "226+ icons" — leave consistent with SEO once HeroCollage is fixed. |
| `apps/web/src/app/templates/layout.tsx` description | "5 full page layouts" ✅ (matches). |
| `apps/web/src/app/layout.tsx:387-390` JSON-LD parallax entry | "10 multi-layer 3D parallax pixel icons" ✅ matches `ParallaxPack.length`. |

---

## 11. Code-sample drift (LOW)

Spot-checks confirm the snippets in `/ui-kit` and `/docs` use real APIs (PixelButton `tone`/`size`/`variant`, PixelSelect controlled+uncontrolled, PixelModal `open/title/children/onClose/size`). One advisory:

- `/ui-kit` PixelToast snippet imports `PixelToast` — should annotate `from '@pxlkit/core'` (see #5).
- `usePxlKitLocale` hook is used inside `PixelModal`, `PixelAvatar`, etc. (verified in `overlay.tsx`, `data-display.tsx`). If a consumer imports those components **outside** `PxlKitLocaleProvider`, the hook returns defaults. The `/ui-kit` "Locale Support" section should call out that **no provider is required for default English** — only Turkish needs the provider wrap.

---

## Proposed remediation plan (atomic commits)

1. **fix(landing): correct template variant math** — page.tsx (lines 146, 249, 306, 1410), templates/layout.tsx description.
2. **fix(templates/previews): "10 packs" → "7 packs"** — features-previews.tsx (lines 29, 80), faq-previews.tsx line 28 (also drop "50+" → align with `UI_KIT_COMPONENTS.length`).
3. **fix(seo): normalize "40+" to dynamic / current count** — layout.tsx, opengraph-image.tsx, ui-kit/README.md badges + description.
4. **fix(landing): include ParallaxPack in HeroCollage** — TOTAL_ICON_COUNT becomes 226; landing matches every SEO claim.
5. **fix(navbar/footer/routes): align /explore label, link Footer, smarter /toast redirect, move /explore into ConditionalShell**.
6. **docs(voxel): clarify package vs showcase split** — root README @pxlkit/voxel section + packages/voxel/README.md.
7. **fix(ui-kit page): annotate PixelToast as @pxlkit/core import; add locale-no-provider-needed note**.

Each is independently safe to commit.

---

## Remediation status — 2026-05-12

| # | Fix | Files touched | Status |
|---|---|---|--------|
| 1 | Template math (24 variants + 5 pages = 29 total) | `apps/web/src/app/page.tsx` (lines 249, 306, 1410), `apps/web/src/app/templates/layout.tsx` | ✅ applied |
| 2 | "10 packs" → "7 packs" + "50+" → "54" | `apps/web/src/app/templates/previews/faq-previews.tsx:28`, `features-previews.tsx:29/54/80` | ✅ applied |
| 3 | "40+" → "54" everywhere | `apps/web/src/app/layout.tsx` (5 sites), `opengraph-image.tsx`, `packages/ui-kit/README.md` (3 sites incl. shields.io badge) | ✅ applied |
| 4 | Parallax in TOTAL_ICON_COUNT (216 → 226) | `apps/web/src/components/HeroCollage.tsx`, `apps/web/src/app/docs/page.tsx` (introduced `TOTAL_PACKS = 7`) | ✅ applied |
| 5 | Nav/Footer/Routes coherence | `apps/web/src/components/Navbar.tsx` (Worlds→Explore), `Footer.tsx` (added /explore link), `apps/web/src/app/toast/page.tsx` (anchor redirect), `apps/web/src/components/ConditionalShell.tsx` (NO_FOOTER_ROUTES), `apps/web/src/app/explore/page.tsx` (removed footer-DOM hack) | ✅ applied |
| 6 | Voxel package-vs-showcase clarity | `README.md` (root voxel section rewritten), `apps/web/src/app/layout.tsx` (JSON-LD SoftwareSourceCode description) | ✅ applied |
| 7 | PixelToast core-vs-ui-kit annotation | `apps/web/src/app/ui-kit/page.tsx:1691` | ✅ applied |

### Build verification

```
turbo build  →  11/11 tasks successful   ✓ (2m 11s)
next build   →  16/16 static pages generated ✓
storybook build → 13/13 stories compiled ✓ (3 core + 10 new ui-kit)
```

Pre-existing build blockers fixed during verification:
- `apps/web/tsconfig.json` was missing `@pxlkit/parallax` AND `@pxlkit/ui-kit` from the `paths` map → added both (lined up with the alphabetical order of `transpilePackages` in `next.config.ts`).
- Workspace symlinks for `parallax` and `voxel` were missing from `node_modules/@pxlkit/` → re-ran `npm install` at root and confirmed both are now linked. Pre-built `dist/` folders for these two packages were generated by `turbo build` as a fallback so non-paths consumers also resolve.

---

## Storybook coverage addendum

Before this audit, only **3 stories** existed (all in `@pxlkit/core`: PxlKitIcon, AnimatedPxlKitIcon, PixelToast). Zero coverage for the 54 ui-kit components.

Now added (in `packages/ui-kit/src/*.stories.tsx`):

| Category file | Story title | Components shown |
|---|---|---:|
| `actions.stories.tsx` | UI Kit / Actions | 3 |
| `inputs.stories.tsx` | UI Kit / Inputs | 9 |
| `feedback.stories.tsx` | UI Kit / Feedback | 4 |
| `overlay.stories.tsx` | UI Kit / Overlay | 3 |
| `layout.stories.tsx` | UI Kit / Layout | 2 |
| `navigation.stories.tsx` | UI Kit / Navigation | 4 |
| `animations.stories.tsx` | UI Kit / Animations | 11 |
| `parallax.stories.tsx` | UI Kit / Parallax | 3 |
| `data-display.stories.tsx` | UI Kit / Data Display | 14 |
| `locale.stories.tsx` | UI Kit / Locale | 1 (provider, en vs tr demo) |
| **Total** | | **54 ✓** |

Infrastructure changes:
- `.storybook/main.ts` — added `@tailwindcss/vite` plugin via `viteFinal` hook so utility classes (`text-retro-*`, `border-retro-*`) compile.
- `.storybook/preview.ts` — imports `packages/ui-kit/styles.css`, adds `.dark` class to `<html>` so the retro design-token variables activate, picks `padded` layout.
- `.storybook/preview.css` — new file; loads Press Start 2P / JetBrains Mono / Inter from Google Fonts and applies `image-rendering: pixelated` globally so stories match site fidelity.
- `package.json` — added `@tailwindcss/vite` as a devDependency at the root.

Run locally:
```
npm run storybook            # dev at port 6006
npm run build-storybook      # static build → storybook-static/
```

**Every one of the 54 ui-kit components is individually discoverable** in the Storybook sidebar at `UI Kit / <Category> / <Component>`. Each category file also exports an `AllX` kitchen-sink overview at `UI Kit / <Category> / All <Category>`. Verified by `index.json` from `storybook build`: 96 total stories (32 core + 10 ui-kit overviews + 54 ui-kit individuals).

---

## Ground-truth count verification (final pass)

Runtime check via Node import of every published pack — single source of truth:

```
ui-kit components: 54   (UI_KIT_COMPONENTS.length)

gamification   51
feedback       33   ← previously read 28 — see "Feedback orphan icons" below
social         43
weather        36
ui             41
effects        12
parallax       10
─────────────────────
TOTAL icons:   226
```

### Feedback orphan-icons finding (added during validation pass)

`packages/feedback/src/index.ts` exported `Link`, `Unlink`, `Lock`, `Unlock`, `Clock` from `./icons` but the `FeedbackPack.icons` array only listed 28 of the 33 icons (5 missing). Any consumer iterating `FeedbackPack.icons` to render the pack was silently dropping 5 icons.

**Fix applied:** added the 5 missing entries to the `FeedbackPack.icons` array (`packages/feedback/src/index.ts`). `FeedbackPack.icons.length` now correctly returns **33**, matching the README badge `icons-33` and the per-pack README hero copy "33 icons (30 static + 3 animated)".

**Net effect on totals:** the dynamic `TOTAL_ICON_COUNT` (HeroCollage + parallax) and `TOTAL_ICONS` (/docs reducer + parallax) now both resolve to **226 exactly**, matching every static "226+" SEO claim across the repo.

### Coherence table — components

| Source | Value | Mechanism |
|---|---:|---|
| `UI_KIT_COMPONENTS.length` (runtime) | 54 | registry array length |
| Landing `/` stat card + hero text + FAQ + footer band | 54 | `${UI_COMPONENTS_COUNT}+` (dynamic) |
| `/docs` sidebar footer + body + index | 54 | dynamic |
| `/ui-kit` page nav badge + stat card + count chip | 54 | dynamic |
| `/ui-kit` layout `<head>` SEO + OG + Twitter | 54 | static copy |
| `apps/web/src/app/layout.tsx` SITE_DESCRIPTION, JSON-LD softwareapp, FAQPage answer, ItemList | 54 | static copy |
| `apps/web/src/app/opengraph-image.tsx` chip "54 Components" | 54 | static |
| `packages/ui-kit/README.md` hero copy + badge + overview | 54 | static |
| `packages/core/README.md` related-packages table | 54 | static |
| `packages/ui/README.md` related-packages table | 54 | static |
| Root `README.md` hero + badge + overview + tree + packages table | 54 | static |
| `templates/previews/hero-previews.tsx` tooltip + counter | 54 | static |
| `templates/previews/faq-previews.tsx` body | 54 | static |
| **Storybook coverage** | 54 | 10 kitchen-sink stories × all category files |

### Coherence table — icons

| Source | Value | Mechanism |
|---|---:|---|
| Sum of `Pack.icons.length` across 7 packs (runtime) | 226 | actual arrays |
| Landing `/` hero stat + browse CTA + FAQ + icons section | 226+ | `${TOTAL_ICON_COUNT}+` (dynamic, computed from `ALL_ICONS.length + ParallaxPack.length`) |
| `/docs` sidebar footer + body | 226+ | `${TOTAL_ICONS}` (dynamic reducer + parallax) |
| `/icons/layout.tsx` SEO title + descriptions ×3 | 226+ | static |
| `apps/web/src/app/layout.tsx` SITE_TAGLINE + SITE_DESCRIPTION + JSON-LD ×3 | 226+ | static |
| `apps/web/src/app/docs/layout.tsx` description | 226+ | static |
| `apps/web/src/app/opengraph-image.tsx` `alt` + chip | 226+ | static |
| `apps/web/src/app/pricing/page.tsx` ICON_COUNT_LABEL | 226+ | constant |
| `templates/data/{pages,sections-features,sections-header,sections-hero}.ts` | 226+ | static |
| `templates/previews/{cta,features,faq,hero,pricing}-previews.tsx` | 226+ | static |
| Root `README.md` hero + overview + badge + per-pack table sum | 51+33+43+36+41+12+10 = 226 | static + arithmetic |

### Stale numbers eliminated (post-fix scan returns zero)

```
grep "40+ component | 40+ React | 40+ retro | 40+ pixel | 40+ hand | components-40 | 40+ styled"  → 0 hits
grep "50+ UI | 50+ comp"                                                                          → 0 hits
grep "10 themed packs | 10 packages | across 10"                                                  → 0 hits
grep "250+"                                                                                       → 0 hits
```

(AUDIT.md itself still quotes the historical strings inside the report tables; that is intentional.)

### Final build verification

```
turbo build  →  11/11 tasks ✓ (1m 56s — no cache)
next build   →  16/16 static pages ✓
storybook build → 13/13 stories ✓
```

Counts confirmed coherent across every surface: source code, dynamic UI counters, static SEO metadata, JSON-LD graph, OG image, sitemap, READMEs, template/section copy, Storybook stories.
