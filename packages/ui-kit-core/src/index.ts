/**
 * @pxlkit/ui-kit-core — the framework-neutral core of the Pxlkit UI kit.
 *
 * Design tokens, the surface system, class recipes, pixel glyph data, locale
 * data and DOM behaviour shared by the React (`@pxlkit/ui-kit`), Vue
 * (`@pxlkit/ui-kit-vue`) and Angular (`@pxlkit/ui-kit-angular`) components,
 * so all three render the same markup and behave the same way.
 */

export * from './tokens';
export * from './common';
export * from './glyphs';
export * from './locale';
export * from './dom/dark-mode';
export * from './dom/focus-trap';
export * from './dom/media-query';
export * from './dom/scroll-lock';
export * from './dom/storage';

// Class recipes shared by the components of every framework
export * from './recipes/badge';
