/**
 * skill-refs/setup
 *
 * Renders the install + wire-up reference consumed by the pxlkit Claude Code
 * skills. Everything here is transcribed from code that actually runs: the
 * kit's `styles.css`, its dark-mode storage (`packages/ui-kit-core/src/dom/
 * dark-mode.ts`: the key, its JSON encoding, the `'system'` default), and the
 * real provider signatures in `packages/ui-kit/src`.
 *
 * Setup is where a UI kit silently fails — a stylesheet Tailwind never
 * processes yields unstyled components with zero error output, and a theme
 * class set after first paint flashes the wrong palette. Hence the dedicated
 * Tailwind and dark-mode sections.
 *
 * Consumed by `generate-skill-refs.ts` (Task A6).
 */

// ---------------------------------------------------------------------------
// Provider signatures — kept in sync by hand with packages/ui-kit/src.
// ---------------------------------------------------------------------------

/**
 * Real props, read from source:
 * - `PxlKitLocaleProvider`  — overlay-foundation/PxlKitLocaleProvider.tsx
 * - `PxlKitToastProvider`   — feedback/PxlKitToastProvider.tsx
 * - `PxlKitSurfaceProvider` — overlay-foundation/PxlKitSurfaceProvider.tsx
 */
const PROVIDER_SIGNATURES = `\
| Provider | Props (real signature) | Notes |
| --- | --- | --- |
| \`PxlKitLocaleProvider\` | \`locale?: 'en' \\| 'tr'\` (default \`'en'\`), \`children\` | Renders a layout-neutral wrapper \`<div lang={locale}>\` (\`display: contents\`) and exposes \`upper\` / \`lower\` and \`fontsUrl\` through \`usePxlKitLocale()\`. Turkish needs it for correct \`i → İ\` casing. Loads no fonts — see Fonts. |
| \`PxlKitToastProvider\` | \`position?: ToastPosition\` (default \`'top-right'\`), \`max?: number\` (default \`5\`), \`duration?: number\` (default \`4500\`; \`0\` keeps toasts until dismissed), \`hotkey?: string \\| false\` (default \`'F8'\`), \`surface?: 'pixel' \\| 'linear'\`, \`stacked?: boolean\` (default \`true\`), \`stackVisible?: number\` (default \`2\`), \`children\` | \`ToastPosition\` = \`'top-right' \\| 'top-left' \\| 'bottom-right' \\| 'bottom-left' \\| 'top-center' \\| 'bottom-center'\`. Required before any \`useToast()\` call. |
| \`PxlKitSurfaceProvider\` | \`surface?: 'pixel' \\| 'linear'\` (default \`'pixel'\`), \`children\` | Sets the default surface for every descendant. Per-component \`surface\` props still win. |

The props are **not** \`defaultPosition\` / \`maxToasts\` — those belong to the
site-local wrapper in \`apps/web/src/components/ToastProvider.tsx\`, not to the
published package. Use \`position\` and \`max\`.

Nesting order that works: locale outermost (it owns \`lang\`), then surface,
then toasts (its portal should inherit both).`;

/**
 * The anti-flash script: the key, JSON encoding and `'system'` default of
 * `useDarkMode()` (`DARK_MODE_STORAGE_KEY` and `readStoredMode` in
 * `packages/ui-kit-core/src/dom/dark-mode.ts`).
 */
const THEME_INIT_SCRIPT = `\
(function () {
  try {
    var raw = localStorage.getItem('pxlkit:dark-mode');
    var mode = raw;
    try { mode = JSON.parse(raw); } catch (e) {}
    var dark = mode === 'dark' || (mode !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
  } catch (e) {}
})();`;

/** The same script on one line, for the layouts' template strings and `index.html`. */
const THEME_INIT_SCRIPT_INLINE = THEME_INIT_SCRIPT.replace(/\n\s*/g, ' ');

const ANTI_FOUC = `\
Dark mode is a \`.dark\` class on \`<html>\`, not a media query, so the class must
be on the element **before first paint** or the page flashes the wrong theme.
\`useDarkMode()\` stores the reader's choice in \`localStorage\` under
\`pxlkit:dark-mode\`, JSON-encoded (\`"light"\`, \`"dark"\` or \`"system"\`), and
\`'system'\` — the default — follows \`prefers-color-scheme\`. The hook reads the
stored choice only after mounting, so this script sets the class first. It
reads the same key and default as the kit's \`useDarkMode()\`:

\`\`\`js
${THEME_INIT_SCRIPT}
\`\`\`

It must run **synchronously in \`<head>\`, before any stylesheet-dependent
paint** — a \`<script defer>\`, a \`useEffect\`, or a Next \`<Script>\` with the
default \`afterInteractive\` strategy all run too late and reintroduce the flash.
In the App Router, put \`suppressHydrationWarning\` on \`<html>\` and leave its
\`className\` unset: the script changes the class before React hydrates.

A theme toggle calls the hook — \`setMode()\` stores the choice and sets the class:

\`\`\`tsx
'use client';
import { PixelButton, useDarkMode } from '@pxlkit/ui-kit';

export function ThemeToggle() {
  const { resolved, setMode } = useDarkMode();
  return (
    <PixelButton onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}>
      {resolved === 'dark' ? 'Light theme' : 'Dark theme'}
    </PixelButton>
  );
}
\`\`\``;

// ---------------------------------------------------------------------------
// Framework variants
// ---------------------------------------------------------------------------

const NEXT_APP_ROUTER = `\
### Next.js — App Router

The kit's components hold state, effects and context, so they run as Client
Components. Wrap the providers once in a \`'use client'\` file of your own and keep
\`layout.tsx\` a Server Component — pages and children stay Server Components and
only the provider shell ships to the browser.

\`\`\`tsx
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
\`\`\`

\`\`\`tsx
// app/layout.tsx — stays a Server Component (no 'use client')
import './globals.css';
import { Providers } from './providers';

// Same key and default as useDarkMode() — see "Dark mode without the flash"
const THEME_INIT_SCRIPT = \`${THEME_INIT_SCRIPT_INLINE}\`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
\`\`\`

Put \`'use client'\` at the top of every file of your own that imports from
\`@pxlkit/ui-kit\` — to render a component or to call a hook (\`useToast\`,
\`usePxlKitLocale\`, \`usePxlKitSurface\`, \`useDarkMode\`): that works with every
version of the kit. A Server Component imports the server-safe helpers
(\`buildGoogleFontsUrl\`, \`toLocaleUpper\`, \`cn\`, the tokens) from
\`@pxlkit/ui-kit-core\` — with pnpm's strict layout, add it to the dependencies to
import it. From \`@pxlkit/core\`, \`PxlKitIcon\` renders in a Server Component;
\`AnimatedPxlKitIcon\`, \`ParallaxPxlKitIcon\` and \`PixelToast\` need a Client
Component.`;

const NEXT_PAGES_ROUTER = `\
### Next.js — Pages Router

No \`'use client'\` exists here; every component is already a client component.
The global CSS import must live in \`pages/_app.tsx\` (Next rejects global CSS
imported from anywhere else), and the anti-FOUC script goes in
\`pages/_document.tsx\` so it is present in the initial HTML.

\`\`\`tsx
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
\`\`\`

\`\`\`tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

// Same key and default as useDarkMode() — see "Dark mode without the flash"
const THEME_INIT_SCRIPT = \`${THEME_INIT_SCRIPT_INLINE}\`;

export default function Document() {
  return (
    <Html lang="en">
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
\`\`\``;

const VITE_CRA = `\
### Vite / CRA (plain React SPA)

No server rendering, so the only real constraint is that the theme class is set
before React mounts. Put the script inline in \`index.html\` \`<head>\` — above the
module script tag, which is deferred by definition.

\`\`\`html
<!-- index.html -->
<html lang="en">
  <head>
    <!-- Same key and default as useDarkMode() — see "Dark mode without the flash" -->
    <script>
      ${THEME_INIT_SCRIPT_INLINE}
    </script>
  </head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
\`\`\`

\`\`\`tsx
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
\`\`\`

Vite needs the Tailwind v4 plugin (\`@tailwindcss/vite\`) in \`vite.config.ts\`.
CRA has no Tailwind v4 integration path — run the \`@tailwindcss/cli\` watcher
against your entry CSS and import the compiled output instead.`;

// ---------------------------------------------------------------------------
// Tailwind v4 — the kit's stylesheet is the entry point
// ---------------------------------------------------------------------------

const TAILWIND = `\
## Tailwind CSS v4 — one import

The kit's stylesheet is a Tailwind v4 entry point of its own: it imports
\`tailwindcss\`, defines the \`--retro-*\` tokens and the pixel utilities, and
registers the kit's compiled files with \`@source\` — Tailwind skips
\`node_modules\` unless told otherwise, and those directives tell it. So it
**takes the place of** \`@import "tailwindcss"\` in the stylesheet your build
hands to Tailwind:

\`\`\`css
@import "@pxlkit/ui-kit/styles.css";
\`\`\`

Tailwind itself has to run in the build — the kit's stylesheet is its input.
\`create-next-app --tailwind\` sets that up; otherwise:

- **Next.js** — \`npm install -D tailwindcss @tailwindcss/postcss postcss\`, and
  \`export default { plugins: { '@tailwindcss/postcss': {} } };\` in
  \`postcss.config.mjs\`.
- **Vite** — \`npm install -D tailwindcss @tailwindcss/vite\`, and
  \`plugins: [react(), tailwindcss()]\` in \`vite.config.ts\`.

Without it the build still succeeds, but the CSS keeps \`@theme\`, \`@source\` and
\`@apply\` as written and the components render unstyled.

With Tailwind in the build, that one import is the whole integration — with npm,
pnpm or Yarn's \`node_modules\` linker, in a standalone app or a monorepo: the
\`@source\` paths resolve from the stylesheet itself, wherever the package manager
put it. Two mistakes to avoid:

- **Importing \`tailwindcss\` as well.** The kit's stylesheet already does; a
  second import ships Tailwind's base styles twice.
- **Yarn Plug'n'Play.** PnP keeps packages in zip archives that Tailwind's file
  scanner cannot read, so the kit's classes are never generated. Set
  \`nodeLinker: node-modules\` in \`.yarnrc.yml\`, or unplug the kit and its
  core: \`yarn unplug @pxlkit/ui-kit @pxlkit/ui-kit-core\`.

Your own \`@source\` lines are only for your own files outside Tailwind's
automatic detection — the kit needs none.

### Verifying it worked

Do not eyeball it. Render \`<PixelButton tone="green">Test</PixelButton>\` and
check that the computed background is a retro green, not transparent — or grep
the built CSS for a utility Tailwind generates only from the kit's files:

\`\`\`bash
grep -l '\\.bg-retro-green' .next/static/chunks/*.css .next/static/css/*.css 2>/dev/null   # no file listed: the kit's classes were never generated
\`\`\`

(Next.js 16 writes the CSS to \`.next/static/chunks\`, earlier versions to
\`.next/static/css\`; with Vite, grep \`dist/assets/*.css\`.)`;

// ---------------------------------------------------------------------------
// CSS entry — transcribed from apps/web/src/app/globals.css
// ---------------------------------------------------------------------------

const CSS_ENTRY = `\
## The CSS entry file

The kit's stylesheet comes first — it brings Tailwind and defines the
\`--retro-*\` variables every utility resolves against — and your own rules and
overrides follow it.

\`\`\`css
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
\`\`\`

The kit styles the components, not the page: the \`body\` rule above is yours to
keep. Remove a starter template's own theme rules — create-next-app's
\`globals.css\` sets a white \`body\` background, \`font-family: Arial\` and an
\`@theme inline\` that remaps \`--font-sans\` / \`--font-mono\` to Geist, all of which
override the kit's.

\`image-rendering: pixelated\` on \`*\` is deliberate and load-bearing: without it
every icon and border blurs the moment the browser scales it, and the whole
aesthetic collapses into "slightly wrong flat design".

Re-skinning is a variable override, never a component fork — redefine any
\`--retro-*\` on \`:root\` (light) and \`.dark\`, after the kit's import:

\`\`\`css
:root { --retro-green: #2563eb; }
.dark { --retro-green: #60a5fa; }
\`\`\``;

const FONTS = `\
## Fonts

Three families: \`Press Start 2P\` (pixel display, \`font-pixel\`), \`Inter\` (body,
\`font-sans\`), \`JetBrains Mono\` (mono, \`font-mono\`). The theme names them but
the kit loads no font files: add the Google Fonts stylesheet to the document
\`<head>\` — in the initial HTML of a server-rendered app — or self-host the three
families.

\`buildGoogleFontsUrl(locale)\` is exported from \`@pxlkit/ui-kit\` and \`@pxlkit/ui-kit-core\` — import it from the core in a Server Component — and is the SSoT
for that URL — it picks the subsets per locale (\`en\` → \`latin\`, \`tr\` →
\`latin,latin-ext\`, because Turkish \`ğ ı İ ş\` live outside basic latin). Under a
\`PxlKitLocaleProvider\`, \`usePxlKitLocale().fontsUrl\` is the same URL for the
current locale:

\`\`\`ts
import { buildGoogleFontsUrl } from '@pxlkit/ui-kit-core';

buildGoogleFontsUrl('en');
// https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700
//   &family=JetBrains+Mono:wght@400;500;600;700&subset=latin&display=swap
\`\`\`

\`\`\`tsx
// Next App Router — app/layout.tsx <head> (a Server Component: the helper comes from the core)
import { buildGoogleFontsUrl } from '@pxlkit/ui-kit-core';

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="stylesheet" href={buildGoogleFontsUrl('en')} />
\`\`\`

Hardcoding the URL is the failure mode to avoid: it drifts from \`PXLKIT_FONTS\`
the moment a weight is added, and the mismatch shows up as a silently wrong
font weight. Call the builder.`;

const INSTALL = (version: string) => `\
## Install

\`\`\`bash
npm  install @pxlkit/ui-kit@${version}
pnpm add     @pxlkit/ui-kit@${version}
yarn add     @pxlkit/ui-kit@${version}
\`\`\`

Peer dependencies: \`react\` and \`react-dom\` at \`^18.2.0 || ^19.0.0\`. Tailwind CSS
v4 is required — v3 will not resolve the \`@theme\` tokens in \`styles.css\`.

On a TypeScript project, install the React types too:

\`\`\`bash
npm install -D @types/react @types/react-dom
\`\`\`

Easy to skip, and the failure is loud but misleading: without them the first
\`tsc\` run buries every real error under dozens of
\`TS7016: Could not find a declaration file for module 'react'\` and
\`TS7026: JSX element implicitly has type 'any'\`.

The kit installs what it needs with it: \`@pxlkit/ui-kit-core\` (the theme and the
behaviour shared with the Vue and Angular kits), \`@pxlkit/core\` (the icon
renderer) and the \`@pxlkit/ui\` and \`@pxlkit/gamification\` icon packs. The other
packs are installed only when used: \`@pxlkit/social\`, \`@pxlkit/weather\`,
\`@pxlkit/feedback\`, \`@pxlkit/effects\`, \`@pxlkit/parallax\`.`;

const TROUBLESHOOTING = `\
## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Components render unstyled, no errors | The kit's stylesheet never reached Tailwind, or Yarn PnP hides the package from its scanner | \`@import "@pxlkit/ui-kit/styles.css"\` in the CSS Tailwind processes; with PnP, unplug the kit and its core |
| Colors are wrong / \`--retro-*\` undefined | \`@pxlkit/ui-kit/styles.css\` not imported | Import it at the top of your entry CSS |
| Tailwind's base styles appear twice in the built CSS | \`tailwindcss\` imported next to the kit's stylesheet | Drop \`@import "tailwindcss"\` — the kit's stylesheet includes it |
| Text renders in system fonts, not the pixel, Inter and JetBrains Mono families | The fonts are not loaded — the kit names them but loads none | Add the \`buildGoogleFontsUrl()\` stylesheet to \`<head>\`, or self-host the families |
| Theme flashes light then dark on load | Anti-FOUC script deferred, in \`useEffect\`, or reading another key than \`useDarkMode()\` | Inline synchronous \`<script>\` in \`<head>\` reading \`pxlkit:dark-mode\` |
| \`useToast\` throws / toasts never appear | No \`PxlKitToastProvider\` above the caller | Mount it in the provider shell |
| Turkish text uppercases \`i\` as \`I\` | Locale provider missing or \`lang\` unset | Wrap in \`PxlKitLocaleProvider locale="tr"\` and set \`lang\` on \`<html>\` |
| \`useState\`/context error from a pxlkit import | Client component rendered inside a Server Component boundary | Move the providers into a \`'use client'\` shell |
| Build error \`Export Controller doesn't exist in target module\` / \`'FormProvider' is not exported from 'react-hook-form'\`, or \`useRef is not a function\` at prerender | \`@pxlkit/ui-kit\` imported in a Server Component from a kit version whose bundle has no \`'use client'\`, or an animated or parallax icon from \`@pxlkit/core\` rendered in one | Add \`'use client'\` to that file; keep the providers in a \`'use client'\` shell; import server helpers from \`@pxlkit/ui-kit-core\` |
| Icons look blurry when scaled | \`image-rendering: pixelated\` missing | Add the \`*\` base rule shown above |`;

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Render the setup reference as markdown.
 *
 * @param version The `@pxlkit/ui-kit` version stamped in the header and the
 *                install commands.
 */
export function renderSetupReference(version: string): string {
  const header = `<!-- GENERATED from @pxlkit/ui-kit v${version} — do not edit; run npm run docs:build -->`;

  const intro = [
    '# Setup',
    '',
    `Wiring \`@pxlkit/ui-kit\` v${version} into a real app: one stylesheet import, the`,
    'providers, and three framework variants — pick the one that matches your app.',
    '',
    'Read the Tailwind section even if the rest looks obvious: a stylesheet Tailwind',
    'never processes is the one setup mistake that fails silently.',
  ].join('\n');

  const providers = `## Providers\n\n${PROVIDER_SIGNATURES}`;
  const frameworks = `## Framework wire-up\n\n${NEXT_APP_ROUTER}\n\n${NEXT_PAGES_ROUTER}\n\n${VITE_CRA}`;
  const darkMode = `## Dark mode without the flash\n\n${ANTI_FOUC}`;

  return [
    header,
    intro,
    INSTALL(version),
    TAILWIND,
    CSS_ENTRY,
    providers,
    frameworks,
    darkMode,
    FONTS,
    TROUBLESHOOTING,
  ].join('\n\n') + '\n';
}

export default renderSetupReference;
