/**
 * Landing-page FAQ — single source of truth.
 *
 * Rendered visibly by `LandingPageClient` (FAQSection), every answer in the
 * page's HTML, AND mirrored verbatim into the home page's FAQPage JSON-LD
 * (`lib/structured-data.ts`). Editing here updates both, so the structured
 * data can never drift from the visible questions.
 */

import {
  UI_COMPONENTS_COUNT,
  ICON_COUNT_LABEL,
  ICON_PACK_COUNT,
  PAGE_TEMPLATE_COUNT,
} from './pxlkit-counts';

export interface LandingFaqItem {
  q: string;
  a: string;
}

export const LANDING_FAQS: LandingFaqItem[] = [
  {
    q: 'Is Pxlkit a React library?',
    a: 'Yes. Pxlkit is built React-first: @pxlkit/ui-kit is the reference kit, and the demos and templates on this site are React. New in 2.2, the same components ship for Vue 3 (@pxlkit/ui-kit-vue) and Angular (@pxlkit/ui-kit-angular).',
  },
  {
    q: 'Is Pxlkit really free?',
    a: 'Yes. The code packages (the React UI kit and its new Vue and Angular editions, the icon components and the voxel toolkit) are MIT-licensed and free forever. The icon packs are free with a small attribution link. Paid licenses only remove the icon/asset attribution requirement.',
  },
  {
    q: 'What components does the UI kit include?',
    a: `${UI_COMPONENTS_COUNT} production-ready components: buttons, inputs, selects, switches, sliders, cards, modals, data tables, charts, calendars, steppers, sidebars, timelines, toasts, command palettes, and more — in React, and since 2.2 the same components in Vue and Angular. All TypeScript-first, Tailwind-powered, and fully themed.`,
  },
  {
    q: 'What templates are included?',
    a: `Pxlkit ships 8 section categories — hero, header, footer, CTA, pricing, testimonials, FAQ, and features — with 3 design variants each. Plus ${PAGE_TEMPLATE_COUNT} complete page templates: full landing, portfolio, admin dashboards, changelog, docs site, and e-commerce.`,
  },
  {
    q: 'Are the templates available for Vue and Angular?',
    a: `Not yet. The ${PAGE_TEMPLATE_COUNT} page templates and the section snippets are React (Next.js) code; every component they use exists in the Vue and Angular kits too.`,
  },
  {
    q: 'Does Pxlkit work with Next.js?',
    a: "Yes. The React kit works with Next.js — App Router included — Vite, Remix, and any React 18.2+ or 19 setup. In the App Router, wrap the kit's providers in a 'use client' file of your own and keep app/layout.tsx a Server Component; the docs show both files.",
  },
  {
    q: 'Does Pxlkit work with Vue or Angular?',
    a: `Yes, new in 2.2. @pxlkit/ui-kit-vue (Vue 3.5+, with Vite or Nuxt) and @pxlkit/ui-kit-angular (Angular 20–22, standalone components, zoneless or with zone.js) are the same ${UI_COMPONENTS_COUNT}-component kit: the same markup, theme and keyboard behaviour, checked against React by parity tests. @pxlkit/vue and @pxlkit/angular render the icons, and the icon packs are plain data that work in all three.`,
  },
  {
    q: 'Will it bloat my bundle?',
    a: 'No. The UI kit and the icon packs are tree-shakeable ES modules — your bundle carries only the components and icons you import — and icons render as plain SVG, with no icon font and no third-party dependencies.',
  },
  {
    q: 'Can I use Pxlkit in a commercial product?',
    a: 'Absolutely. MIT code packages can be used commercially without attribution. If you ship the icon packs and want to remove attribution there too, grab an Indie ($9.50) or Team ($24.50) asset license.',
  },
  {
    q: 'How many icons are included?',
    a: `${ICON_COUNT_LABEL} hand-crafted 16×16 SVG icons across ${ICON_PACK_COUNT} themed packs.`,
  },
  {
    q: 'How do I create custom icons?',
    a: 'Three ways: use the visual builder on our website, let AI generate them with our prompt templates, or hand-code the simple grid + palette JSON format directly.',
  },
];
