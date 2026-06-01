## 1.2.1 — 2026-06-01 (Ola 5a — Templates coherence pass)

### Changed
- **/templates redesigned**: removed the top fake-skeleton "featured pages" strip, promoted Full-Page Templates to the primary surface, added a `TemplateCategoryNav` chip filter (marketing / portfolio / product / app / content / shop). Added the `docs` and `ecommerce` full-page entries so every existing /templates/<slug> route is discoverable.
- **Canonical changelog moved to `/changelog`** with a permanent 308 redirect from `/templates/changelog`. WhatsNewStrip default href + sitemap + footer template + LandingPageClient updated.
- **Dynamic version SoT**: `apps/web/src/lib/pxlkit-version.ts` reads `packages/ui-kit/package.json#version` + `packages/ui-kit/version-meta.json#date`. Hero badge, WhatsNewStrip, JSON-LD softwareVersion, dashboard template ribbon, and real Footer now derive from one source.
- **PixelChipGroup** chip wrapper button now resets UA defaults (was leaking light-grey UA background + black border). Solid PixelBadge / PixelChip / PixelRibbon variants now paint `t.fill` (opaque tone) with tone-aware text — WCAG AA on every tone, fixes the LATEST gold ribbon contrast.
- **Templates third-party scrub**: `landing-full-template.tsx` brand renamed `Codex` → `Pixelpad` (fictional placeholder). All Discord / Slack / VS Code / GitHub / GitLab / Bitbucket mentions replaced with neutral terms. `portfolio-template.tsx` Framer Motion / Stripe / Figma skills relabeled; Pxlkit anecdote degenericized.

### Removed
- "View PR #N on GitHub" links from every changelog entry (org `pxlkit` was 404).
- "Subscribe → All releases on GitHub" sidebar block on the changelog template.
- `/templates/changelog` route (consolidated to `/changelog`).
- Top fake-skeleton featured grid (6 cards) on `/templates`.

## 1.2.0 — 2026-05-30 (Ola 4b — Website Overhaul)

### Added
- **6 full-page templates**: /templates/dashboards (admin shell with sidebar/DataTable/StatGroup/Drawer/Command), /changelog (release feed), /templates/docs (docs shell with sidebar+content+TOC), /templates/landing-full (SaaS landing with hero+bento+pricing+testimonials+FAQ), /templates/portfolio (case-study), /templates/ecommerce (product grid + cart sheet).
- **Live /changelog route** with hardcoded v1.6 → v1.9 releases (will become CHANGELOG.md-pulled later).
- **What's New strip** on /ui-kit + / showing v1.9.0 components with PixelRibbon highlight.
- **/templates index page**: featured Full-page templates section linking to the 6 new templates.

### Changed
- **Landing /**: rewrite to benefit-led using PixelHeroSection split + bento + PixelEqualHeightGrid + PixelStatGroup + CTA section.
- **/ui-kit intro**: 3-pillar framing (Surface system / a11y-first / batteries-included).
- **/docs intro**: copy-pastable quick-start.
- **/pricing**: "perfect for" tier framing.
- **Copy across pages**: benefit-led instead of inventory-listing.

### SEO
- Metadata: title/description/openGraph/twitter/canonical on every public route.
- Dynamic sitemap at /sitemap.xml.
- Robots at /robots.txt.
- JSON-LD SoftwareApplication on /ui-kit, WebSite on /.

### Performance
- Dynamic imports for heavy demo blocks on /ui-kit.
- next/image for raster images in templates.
- Viewport + themeColor + colorScheme metadata.
