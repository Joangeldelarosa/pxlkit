<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# Setup

Wiring `@pxlkit/ui-kit` v2.1.1 into a real app. Three framework variants and
three package-manager variants for the Tailwind directive — pick one of each.

Read the Tailwind `@source` section even if the rest looks obvious: it is the
one step that fails silently, and it fails differently per package manager.

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

Icon packs are separate packages, installed only when used:
`@pxlkit/ui`, `@pxlkit/gamification`, `@pxlkit/social`, `@pxlkit/weather`,
`@pxlkit/feedback`, `@pxlkit/effects`, `@pxlkit/parallax`. `@pxlkit/core` (the
icon renderer) ships as a dependency of the kit already.

## Tailwind v4 — the `@source` directive (the #1 failure)

Tailwind v4 discovers utility classes by scanning source files, and it **ignores
`node_modules` by default**. The pxlkit components carry their classes in their
own compiled source, so without an explicit `@source` line Tailwind emits none
of them: the components render, the markup is right, and everything is
unstyled — with no warning anywhere.

`@source` paths are resolved **relative to the CSS file that declares them**.
All examples below assume the CSS lives at `src/app/globals.css` (adjust the
`../` depth to your own layout).

### npm, or Yarn 1 / Yarn with `nodeLinker: node-modules`

Flat `node_modules`, so the real directory is the plain package path:

```css
@source "../../../node_modules/@pxlkit/ui-kit";
```

### pnpm

pnpm keeps the package in its content-addressable store and symlinks it, so the
plain path is a symlink Tailwind's scanner will not follow. Point at the real
`.pnpm` directory and glob the version so a bump does not silently break it:

```css
@source "../../../node_modules/.pnpm/@pxlkit+ui-kit@*/node_modules/@pxlkit/ui-kit";
```

The `@` scope becomes `+` in `.pnpm` directory names (`@pxlkit/ui-kit` →
`@pxlkit+ui-kit`). If styles are still missing, `ls node_modules/.pnpm | grep ui-kit`
prints the actual directory name to match.

### Yarn Plug'n'Play

PnP has no `node_modules` at all — packages stay inside zip archives that a file
scanner cannot walk. Two options, in order of preference:

1. Opt this project out of PnP, then use the npm path above:
   ```yaml
   # .yarnrc.yml
   nodeLinker: node-modules
   ```
2. Keep PnP and unplug just this package so it exists on disk:
   ```bash
   yarn unplug @pxlkit/ui-kit
   ```
   ```css
   @source "../../../.yarn/unplugged/@pxlkit-ui-kit-npm-*/node_modules/@pxlkit/ui-kit";
   ```

### Monorepo / workspace

When the kit is a workspace sibling rather than an installed dependency, point
straight at the package directory — this is the line `apps/web` really uses:

```css
@source "../../../../packages/ui-kit";
```

### Verifying it worked

Do not eyeball it. Render `<PixelButton tone="green">Test</PixelButton>` and
check that the computed background is a retro green, not transparent — or grep
the built CSS for a class only pxlkit uses:

```bash
grep -c "retro-green" .next/static/css/*.css   # 0 means @source is wrong
```

## The CSS entry file

Order matters: `tailwindcss` first, the kit's tokens second (they define the
`--retro-*` variables every utility resolves against), your `@source` lines
next, your own overrides last.

```css
/* app/globals.css — the shape apps/web actually ships */
@import "tailwindcss";
@import "@pxlkit/ui-kit/styles.css";

/* Tailwind must be told to scan the package — see the section above */
@source "../../../node_modules/@pxlkit/ui-kit";

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
| `PxlKitLocaleProvider` | `locale?: 'en' \| 'tr'` (default `'en'`), `children` | Renders a wrapper `<div lang={locale}>` and injects the Google Fonts `<link>`. Turkish needs it for correct `i → İ` casing. |
| `PxlKitToastProvider` | `position?: ToastPosition` (default `'top-right'`), `max?: number` (default `5`), `surface?: 'pixel' \| 'linear'`, `stacked?: boolean` (default `true`), `stackVisible?: number` (default `2`), `children` | `ToastPosition` = `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center' \| 'bottom-center'`. Required before any `useToast()` call. |
| `PxlKitSurfaceProvider` | `surface?: 'pixel' \| 'linear'` (default `'pixel'`), `children` | Sets the default surface for every descendant. Per-component `surface` props still win. |

The props are **not** `defaultPosition` / `maxToasts` — those belong to the
site-local wrapper in `apps/web/src/components/ToastProvider.tsx`, not to the
published package. Use `position` and `max`.

Nesting order that works: locale outermost (it owns `lang` and fonts), then
surface, then toasts (its portal should inherit both).

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

Three families: `Press Start 2P` (pixel display), `Inter` (body), `JetBrains Mono`
(mono). `PxlKitLocaleProvider` injects the `<link>` for you at runtime, which
costs a round trip after hydration. For a server-rendered app, emit the tag in
the initial HTML and let the provider's injection dedupe against it.

`buildGoogleFontsUrl(locale)` is exported from `@pxlkit/ui-kit` and is the SSoT
for that URL — it picks the subsets per locale (`en` → `latin`, `tr` →
`latin,latin-ext`, because Turkish `ğ ı İ ş` live outside basic latin):

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
| Components render unstyled, no errors | Tailwind never scanned the package | Add the right `@source` line for your package manager |
| Colors are wrong / `--retro-*` undefined | `@pxlkit/ui-kit/styles.css` missing or imported before `tailwindcss` | Import `tailwindcss` first, then the kit's stylesheet |
| Theme flashes light then dark on load | Anti-FOUC script deferred or in `useEffect` | Inline synchronous `<script>` in `<head>` |
| `useToast` throws / toasts never appear | No `PxlKitToastProvider` above the caller | Mount it in the provider shell |
| Turkish text uppercases `i` as `I` | Locale provider missing or `lang` unset | Wrap in `PxlKitLocaleProvider locale="tr"` and set `lang` on `<html>` |
| `useState`/context error from a pxlkit import | Client component rendered inside a Server Component boundary | Move the providers into a `'use client'` shell |
| Icons look blurry when scaled | `image-rendering: pixelated` missing | Add the `*` base rule shown above |
