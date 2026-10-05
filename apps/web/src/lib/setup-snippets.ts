/**
 * Setup steps the docs show in more than one place (/docs and /ui-kit), so
 * they stay the same in both. Each kit's stylesheet is a Tailwind CSS v4
 * entry point (`@import "tailwindcss"`, `@theme`, `@source`): Tailwind's Vite
 * or PostCSS plugin has to run on it, or the components render unstyled.
 */

export const TAILWIND_SETUP = {
  react: `# Next.js — create-next-app --tailwind sets this up. Otherwise:
npm install -D tailwindcss @tailwindcss/postcss postcss

// postcss.config.mjs
export default { plugins: { '@tailwindcss/postcss': {} } };

# Vite
npm install -D tailwindcss @tailwindcss/vite

// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
// …
plugins: [react(), tailwindcss()],`,
  vue: `# Vite
npm install -D tailwindcss @tailwindcss/vite

// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
// …
plugins: [vue(), tailwindcss()],

// Nuxt — nuxt.config.ts (no Nuxt module or build.transpile entry needed)
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
});`,
  angular: `# Angular CLI 21 and later
ng new my-app --style=tailwind

# Angular 20, or an existing app
npm install -D tailwindcss @tailwindcss/postcss postcss

// .postcssrc.json, at the workspace root
{ "plugins": { "@tailwindcss/postcss": {} } }`,
};

const bodyStyles = (stylesheet: string) => `@import "${stylesheet}";

/* The kit styles the components, not the page: theme <body> yourself */
@layer base {
  body {
    background-color: var(--color-retro-bg);
    color: var(--color-retro-text);
    font-family: var(--font-sans);
  }
}`;

/** The global stylesheet: the kit's, in place of `@import "tailwindcss"`, and the page's own base styles. */
export const STYLESHEET_SETUP = {
  react: `/* app/globals.css (Next.js) or src/index.css (Vite) */
${bodyStyles('@pxlkit/ui-kit/styles.css')}`,
  vue: `/* src/style.css (Vite) or app/assets/css/main.css (Nuxt) */
${bodyStyles('@pxlkit/ui-kit-vue/styles.css')}`,
  angular: `/* src/styles.css */
${bodyStyles('@pxlkit/ui-kit-angular/styles.css')}`,
};
