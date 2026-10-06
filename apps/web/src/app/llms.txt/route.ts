import { ICON_COUNT_LABEL, ICON_PACK_COUNT, PAGE_TEMPLATE_COUNT, UI_COMPONENTS_COUNT } from '@/lib/pxlkit-counts';
import { UI_KIT_LATEST_DATE, UI_KIT_VERSION } from '@/lib/pxlkit-version';
import { REPOSITORY_URL, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

const npm = (name: string) => `https://www.npmjs.com/package/${name}`;

/**
 * /llms.txt — the site in plain Markdown, following the llms.txt convention:
 * what Pxlkit is, how to install it in each framework, and where the docs
 * are. Built from the same counts and version as the pages, so it says what
 * they say. The skills plugin has its own summary at /skills/llms.txt.
 */
export function GET(): Response {
  const body = `# Pxlkit

> Retro pixel-art UI kit for React: ${UI_COMPONENTS_COUNT} components, ${ICON_COUNT_LABEL} pixel-art SVG icons in ${ICON_PACK_COUNT} packs and ${PAGE_TEMPLATE_COUNT} page templates. New in 2.2: the same kit for Vue 3 and Angular. TypeScript, Tailwind CSS v4. The code is MIT; the icon packs are free with attribution.

Pxlkit is a React library first: @pxlkit/ui-kit is the reference kit, and the demos and templates on the site are React. Since 2.2 (released ${UI_KIT_LATEST_DATE}), @pxlkit/ui-kit-vue and @pxlkit/ui-kit-angular render the same components with the same markup, theme and behaviour, checked against React by parity tests, on a framework-neutral core (@pxlkit/ui-kit-core). The components switch between a pixel and a flat "linear" surface with one prop. Current version: ${UI_KIT_VERSION}.

## Install

- React 18.2+ or 19: \`npm install @pxlkit/ui-kit\`
- Vue 3.5+: \`npm install @pxlkit/ui-kit-vue @pxlkit/vue\`
- Angular 20–22: \`npm install @pxlkit/ui-kit-angular @pxlkit/angular\`
- Icons only: \`npm install @pxlkit/core @pxlkit/gamification\` — the React icon components and one of the ${ICON_PACK_COUNT} packs; \`@pxlkit/vue\` or \`@pxlkit/angular\` in place of \`@pxlkit/core\` for Vue or Angular

Each kit's stylesheet is a Tailwind CSS v4 entry point: add Tailwind's Vite plugin (\`@tailwindcss/vite\`) or PostCSS plugin (\`@tailwindcss/postcss\`) to the build — \`ng new --style=tailwind\` on Angular 21+ — then import the kit's stylesheet in place of \`@import "tailwindcss"\`: \`@import "@pxlkit/ui-kit/styles.css";\` (or \`@pxlkit/ui-kit-vue/styles.css\`, \`@pxlkit/ui-kit-angular/styles.css\`). Without Tailwind in the build, the components render unstyled.

In the Next.js App Router, put the kit's providers in a \`'use client'\` file and keep \`app/layout.tsx\` a Server Component; Server Components import helpers such as \`buildGoogleFontsUrl\` from \`@pxlkit/ui-kit-core\`.

## Docs

- [UI kit](${SITE_URL}/ui-kit): the components with live demos, code in React, Vue and Angular, props tables and the design tokens
- [Vue setup](${SITE_URL}/ui-kit#vue): Vite and Nuxt, \`v-model\`, slots and events
- [Angular setup](${SITE_URL}/ui-kit#angular): standalone, signal-based components, \`ngModel\` and reactive forms, \`@angular/ssr\`
- [Documentation](${SITE_URL}/docs): installation, the icon components, animated and parallax icons, toasts and the component reference
- [Icons](${SITE_URL}/icons): the ${ICON_COUNT_LABEL} icons, with code and SVG for each
- [Templates](${SITE_URL}/templates): ${PAGE_TEMPLATE_COUNT} full pages and section variants, as React (Next.js) code
- [Changelog](${SITE_URL}/changelog): every release

## Packages

- [@pxlkit/ui-kit](${npm('@pxlkit/ui-kit')}): the React UI kit, ${UI_COMPONENTS_COUNT} components
- [@pxlkit/ui-kit-vue](${npm('@pxlkit/ui-kit-vue')}): the same kit for Vue 3 — new in 2.2
- [@pxlkit/ui-kit-angular](${npm('@pxlkit/ui-kit-angular')}): the same kit for Angular — new in 2.2
- [@pxlkit/ui-kit-core](${npm('@pxlkit/ui-kit-core')}): the tokens, Tailwind CSS v4 theme, class recipes and behaviour the three kits share
- [@pxlkit/core](${npm('@pxlkit/core')}): the icon engine and the React icon components
- [@pxlkit/vue](${npm('@pxlkit/vue')}) and [@pxlkit/angular](${npm('@pxlkit/angular')}): the icon components for Vue and Angular — new in 2.2
- Icon packs: @pxlkit/gamification, @pxlkit/feedback, @pxlkit/social, @pxlkit/weather, @pxlkit/ui, @pxlkit/effects, @pxlkit/parallax

## License

- [Licensing and pricing](${SITE_URL}/pricing): the code — the kits, the icon components and the engine — is MIT. The icon packs are free with a visible attribution link; a one-time Indie ($9.50, one project) or Team ($24.50, unlimited projects) license removes it.
- [Source](${REPOSITORY_URL})

## Optional

- [Skills plugin](${SITE_URL}/skills): skills that set up and build React projects with the kit; summary at ${SITE_URL}/skills/llms.txt
- [Icon builder](${SITE_URL}/builder): draw pixel-art icons and export SVG, PNG or PxlKitData code
- [Voxel demo](${SITE_URL}/explore): @pxlkit/voxel, a 3D voxel toolkit for React — early preview, not yet on npm
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
