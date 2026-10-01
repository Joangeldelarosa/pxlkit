<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# Setup

Wiring `@pxlkit/ui-kit` v2.1.1 into a real app: one stylesheet import, the
providers, and three framework variants — pick the one that matches your app.

Read the Tailwind section even if the rest looks obvious: a stylesheet Tailwind
never processes is the one setup mistake that fails silently.

## Install

```bash
npm  install @pxlkit/ui-kit@2.1.1
pnpm add     @pxlkit/ui-kit@2.1.1
yarn add     @pxlkit/ui-kit@2.1.1
```

Peer dependencies: `react` and `react-dom` at `^18.2.0 || ^19.0.0`. Tailwind CSS
v4 is required — v3 will not resolve the `@theme` tokens in `styles.css`.

On a TypeScript project, install the React types too:

```bash
npm install -D @types/react @types/react-dom
```

Easy to skip, and the failure is loud but misleading: without them the first
`tsc` run buries every real error under dozens of
`TS7016: Could not find a declaration file for module 'react'` and
`TS7026: JSX element implicitly has type 'any'`.

The kit installs what it needs with it: `@pxlkit/ui-kit-core` (the theme and the
behaviour shared with the Vue and Angular kits), `@pxlkit/core` (the icon
renderer) and the `@pxlkit/ui` and `@pxlkit/gamification` icon packs. The other
packs are installed only when used: `@pxlkit/social`, `@pxlkit/weather`,
`@pxlkit/feedback`, `@pxlkit/effects`, `@pxlkit/parallax`.

## Tailwind CSS v4 — one import

The kit's stylesheet is a Tailwind v4 entry point of its own: it imports
`tailwindcss`, defines the `--retro-*` tokens and the pixel utilities, and
registers the kit's compiled files with `@source` — Tailwind skips
`node_modules` unless told otherwise, and those directives tell it. So it
**takes the place of** `@import "tailwindcss"` in the stylesheet your build
hands to Tailwind:

```css
@import "@pxlkit/ui-kit/styles.css";
```

That one line is the whole integration — with npm, pnpm or Yarn's
`node_modules` linker, in a standalone app or a monorepo: the `@source` paths
resolve from the stylesheet itself, wherever the package manager put it. Two
mistakes to avoid:

- **Importing `tailwindcss` as well.** The kit's stylesheet already does; a
  second import ships Tailwind's base styles twice.
- **Yarn Plug'n'Play.** PnP keeps packages in zip archives that Tailwind's file
  scanner cannot read, so the kit's classes are never generated. Set
  `nodeLinker: node-modules` in `.yarnrc.yml`, or unplug the kit and its
  core: `yarn unplug @pxlkit/ui-kit @pxlkit/ui-kit-core`.

Your own `@source` lines are only for your own files outside Tailwind's
automatic detection — the kit needs none.

### Verifying it worked

Do not eyeball it. Render `<PixelButton tone="green">Test</PixelButton>` and
check that the computed background is a retro green, not transparent — or grep
the built CSS for a utility Tailwind generates only from the kit's files:

```bash
grep -c '\.bg-retro-green' .next/static/css/*.css   # 0: the kit's classes were never generated
```

## The CSS entry file

The kit's stylesheet comes first — it brings Tailwind and defines the
`--retro-*` variables every utility resolves against — and your own rules and
overrides follow it.

```css
/* app/globals.css */
@import "@pxlkit/ui-kit/styles.css";

@layer base {
  :root {
    --grid-line: rgba(0, 0, 0, 0.06);
  }

  .dark {
    --grid-line: rgba(255, 255, 255, 0.04);
  }

  * {
    image-rendering: pixelated;          /* keeps pixel art crisp when scaled */
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background-color: var(--color-retro-bg);
    color: var(--color-retro-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* iOS zooms any input whose font-size is under 16px on focus */
  @media screen and (max-width: 1023px) {
    input, textarea, select { font-size: 16px !important; }
  }
}
```

`image-rendering: pixelated` on `*` is deliberate and load-bearing: without it
every icon and border blurs the moment the browser scales it, and the whole
aesthetic collapses into "slightly wrong flat design".

Re-skinning is a variable override, never a component fork — redefine any
`--retro-*` on `:root` (light) and `.dark`, after the kit's import:

```css
:root { --retro-green: #2563eb; }
.dark { --retro-green: #60a5fa; }
```

## Providers

| Provider | Props (real signature) | Notes |
| --- | --- | --- |
| `PxlKitLocaleProvider` | `locale?: 'en' \| 'tr'` (default `'en'`), `children` | Renders a layout-neutral wrapper `<div lang={locale}>` (`display: contents`) and exposes `upper` / `lower` and `fontsUrl` through `usePxlKitLocale()`. Turkish needs it for correct `i → İ` casing. Loads no fonts — see Fonts. |
| `PxlKitToastProvider` | `position?: ToastPosition` (default `'top-right'`), `max?: number` (default `5`), `surface?: 'pixel' \| 'linear'`, `stacked?: boolean` (default `true`), `stackVisible?: number` (default `2`), `children` | `ToastPosition` = `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center' \| 'bottom-center'`. Required before any `useToast()` call. |
| `PxlKitSurfaceProvider` | `surface?: 'pixel' \| 'linear'` (default `'pixel'`), `children` | Sets the default surface for every descendant. Per-component `surface` props still win. |

The props are **not** `defaultPosition` / `maxToasts` — those belong to the
site-local wrapper in `apps/web/src/components/ToastProvider.tsx`, not to the
published package. Use `position` and `max`.

Nesting order that works: locale outermost (it owns `lang`), then surface,
then toasts (its portal should inherit both).

## Framework wire-up

### Next.js — App Router

Every pxlkit provider is a client component (`'use client'` at the top of each
provider source). A Server Component may not render one directly with children
coming from the server tree, so wrap them once in your own client boundary and
keep `layout.tsx` a Server Component — that way pages and children stay server
components and only the provider shell ships to the browser.

```tsx
// app/providers.tsx
'use client';

import {
  PxlKitLocaleProvider,
  PxlKitSurfaceProvider,
  PxlKitToastProvider,
} from '@pxlkit/ui-kit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PxlKitLocaleProvider locale="en">
      <PxlKitSurfaceProvider surface="pixel">
        <PxlKitToastProvider position="top-right" max={6} stacked stackVisible={2}>
          {children}
        </PxlKitToastProvider>
      </PxlKitSurfaceProvider>
    </PxlKitLocaleProvider>
  );
}
```

```tsx
// app/layout.tsx — stays a Server Component (no 'use client')
import './globals.css';
import { Providers } from './providers';

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('pxlkit-theme');
if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}
else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Any page or component of your own that calls a pxlkit hook (`useToast`,
`usePxlKitLocale`, `usePxlKitSurface`) or passes an event handler to a pxlkit component needs its
own `'use client'`. Rendering a pxlkit component with only static props from a
Server Component is fine — the `'use client'` inside the package marks the
boundary for you.

### Next.js — Pages Router

No `'use client'` exists here; every component is already a client component.
The global CSS import must live in `pages/_app.tsx` (Next rejects global CSS
imported from anywhere else), and the anti-FOUC script goes in
`pages/_document.tsx` so it is present in the initial HTML.

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import {
  PxlKitLocaleProvider,
  PxlKitSurfaceProvider,
  PxlKitToastProvider,
} from '@pxlkit/ui-kit';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PxlKitLocaleProvider locale="en">
      <PxlKitSurfaceProvider surface="pixel">
        <PxlKitToastProvider position="top-right" max={6}>
          <Component {...pageProps} />
        </PxlKitToastProvider>
      </PxlKitSurfaceProvider>
    </PxlKitLocaleProvider>
  );
}
```

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('pxlkit-theme');
if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}
else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();`;

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### Vite / CRA (plain React SPA)

No server rendering, so the only real constraint is that the theme class is set
before React mounts. Put the script inline in `index.html` `<head>` — above the
module script tag, which is deferred by definition.

```html
<!-- index.html -->
<html lang="en" class="dark">
  <head>
    <script>
      (function(){try{var t=localStorage.getItem('pxlkit-theme');
      if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}
      else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();
    </script>
  </head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
```

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import {
  PxlKitLocaleProvider,
  PxlKitSurfaceProvider,
  PxlKitToastProvider,
} from '@pxlkit/ui-kit';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PxlKitLocaleProvider locale="en">
      <PxlKitSurfaceProvider surface="pixel">
        <PxlKitToastProvider position="top-right" max={6}>
          <App />
        </PxlKitToastProvider>
      </PxlKitSurfaceProvider>
    </PxlKitLocaleProvider>
  </StrictMode>,
);
```

Vite needs the Tailwind v4 plugin (`@tailwindcss/vite`) in `vite.config.ts`.
CRA has no Tailwind v4 integration path — run the `@tailwindcss/cli` watcher
against your entry CSS and import the compiled output instead.

## Dark mode without the flash

Dark mode is a `.dark` class on `<html>`, not a media query, so the class must
be on the element **before first paint** or the page flashes the wrong theme.
This is the exact script `apps/web` ships:

```js
(function(){
  try {
    var t = localStorage.getItem('pxlkit-theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  } catch(e){}
})();
```

It must run **synchronously in `<head>`, before any stylesheet-dependent
paint** — a `<script defer>`, a `useEffect`, or a Next `<Script>` with the
default `afterInteractive` strategy all run too late and reintroduce the flash.
Pair it with `className="dark"` + `suppressHydrationWarning` on `<html>` so the
server markup matches the default branch and React does not warn when the
script has already flipped the class.

## Fonts

Three families: `Press Start 2P` (pixel display, `font-pixel`), `Inter` (body,
`font-sans`), `JetBrains Mono` (mono, `font-mono`). The theme names them but
the kit loads no font files: add the Google Fonts stylesheet to the document
`<head>` — in the initial HTML of a server-rendered app — or self-host the three
families.

`buildGoogleFontsUrl(locale)` is exported from `@pxlkit/ui-kit` and is the SSoT
for that URL — it picks the subsets per locale (`en` → `latin`, `tr` →
`latin,latin-ext`, because Turkish `ğ ı İ ş` live outside basic latin). Under a
`PxlKitLocaleProvider`, `usePxlKitLocale().fontsUrl` is the same URL for the
current locale:

```ts
import { buildGoogleFontsUrl } from '@pxlkit/ui-kit';

buildGoogleFontsUrl('en');
// https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700
//   &family=JetBrains+Mono:wght@400;500;600;700&subset=latin&display=swap
```

```tsx
// Next App Router — app/layout.tsx <head>
import { buildGoogleFontsUrl } from '@pxlkit/ui-kit';

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="stylesheet" href={buildGoogleFontsUrl('en')} />
```

Hardcoding the URL is the failure mode to avoid: it drifts from `PXLKIT_FONTS`
the moment a weight is added, and the mismatch shows up as a silently wrong
font weight. Call the builder.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Components render unstyled, no errors | The kit's stylesheet never reached Tailwind, or Yarn PnP hides the package from its scanner | `@import "@pxlkit/ui-kit/styles.css"` in the CSS Tailwind processes; with PnP, unplug the kit and its core |
| Colors are wrong / `--retro-*` undefined | `@pxlkit/ui-kit/styles.css` not imported | Import it at the top of your entry CSS |
| Tailwind's base styles appear twice in the built CSS | `tailwindcss` imported next to the kit's stylesheet | Drop `@import "tailwindcss"` — the kit's stylesheet includes it |
| Text renders in system fonts, not the pixel, Inter and JetBrains Mono families | The fonts are not loaded — the kit names them but loads none | Add the `buildGoogleFontsUrl()` stylesheet to `<head>`, or self-host the families |
| Theme flashes light then dark on load | Anti-FOUC script deferred or in `useEffect` | Inline synchronous `<script>` in `<head>` |
| `useToast` throws / toasts never appear | No `PxlKitToastProvider` above the caller | Mount it in the provider shell |
| Turkish text uppercases `i` as `I` | Locale provider missing or `lang` unset | Wrap in `PxlKitLocaleProvider locale="tr"` and set `lang` on `<html>` |
| `useState`/context error from a pxlkit import | Client component rendered inside a Server Component boundary | Move the providers into a `'use client'` shell |
| Icons look blurry when scaled | `image-rendering: pixelated` missing | Add the `*` base rule shown above |
