# Deploying Storybook to Vercel

The repo ships an end-to-end Storybook at the root (`.storybook/`) that aggregates stories from `@pxlkit/core` and `@pxlkit/ui-kit`. Build output goes to `./storybook-static/`. This guide shows how to host it on Vercel under a subdomain (e.g. `storybook.pxlkit.xyz`) so the **Storybook** entry in the site navbar resolves to a live build.

## Why a separate Vercel project

The main `pxlkit.xyz` deploy already targets `apps/web`. Vercel projects have a single output directory, so Storybook needs its own project pointing to the **same repo** with different build settings.

## One-time setup

1. **Create a new Vercel project** from the `pxlkit` repo.
2. **Project Name**: `pxlkit-storybook` (or similar).
3. **Framework Preset**: `Other`.
4. **Root Directory**: leave at `/` (repo root — Storybook config lives there).
5. **Build & Output Settings** (override the defaults):
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build-storybook`
   - **Output Directory**: `storybook-static`
6. **Environment Variables**: none required for the Storybook build.
7. **Production Branch**: `main` (same as main site).
8. Hit **Deploy**.

After the first deploy succeeds, Vercel gives you a URL like `pxlkit-storybook.vercel.app`. Test it in the browser to confirm stories render.

## Custom domain

To serve at `storybook.pxlkit.xyz`:

1. In the Vercel project → **Settings → Domains** → **Add** → enter `storybook.pxlkit.xyz`.
2. Vercel shows a DNS record to add. In your DNS provider for `pxlkit.xyz`:
   - **CNAME** record: `storybook` → `cname.vercel-dns.com.`
3. Wait for DNS propagation (usually <5 min). Vercel auto-provisions an HTTPS cert.
4. The Storybook link in `apps/web/src/components/Navbar.tsx` (`/* Storybook */` nav item) already points to this URL — no code change needed.

## How redeploys trigger

- Every push to `main` triggers both the `pxlkit.xyz` (apps/web) and `pxlkit-storybook` builds in parallel.
- PRs get preview deploys from both projects (e.g. `pxlkit-storybook-git-feat-xxx.vercel.app`).
- Storybook chunks are large (~880 KB main bundle). Build time ≈ 25-40 s on Vercel cold cache, much faster on warm cache.

## Build performance tips

- Vercel respects the `turbo.json` cache. If `@pxlkit/core` and `@pxlkit/ui-kit` haven't changed, their builds are skipped → Storybook bundles ~10× faster.
- For aggressive caching, enable Vercel's **Remote Caching** (Settings → Caching).

## Local verification

```bash
# Dev with HMR on http://localhost:6006
npm run storybook

# Production-equivalent build
npm run build-storybook
npx http-server ./storybook-static -p 6006
```

If the local prod build looks right, the Vercel build will match.

## Updating the navbar URL

If you choose a domain other than `storybook.pxlkit.xyz`, edit `apps/web/src/components/Navbar.tsx`:

```ts
const NAV_ITEMS: { href: string; label: string; badge?: string; external?: boolean }[] = [
  // …
  { href: 'https://your-custom-domain', label: 'Storybook', external: true },
];
```
