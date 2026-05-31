## 1.2.0 — 2026-05-30 (Ola 4b — Website Overhaul)

### Added
- **6 full-page templates**: /templates/dashboards (admin shell with sidebar/DataTable/StatGroup/Drawer/Command), /templates/changelog (release feed), /templates/docs (docs shell with sidebar+content+TOC), /templates/landing-full (SaaS landing with hero+bento+pricing+testimonials+FAQ), /templates/portfolio (case-study), /templates/ecommerce (product grid + cart sheet).
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
