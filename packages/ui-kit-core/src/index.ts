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
export * from './dom/floating';
export * from './dom/focus-return';
export * from './dom/focus-trap';
export * from './dom/media-query';
export * from './dom/scroll-lock';
export * from './dom/storage';

// Per-component code shared by the kits of every framework, by category:
// class recipes and the logic behind the markup
export * from './components/actions/index';
export * from './components/animations/index';
export * from './components/cards/index';
export * from './components/data/index';
export * from './components/feedback/index';
export * from './components/forms/index';
export * from './components/hero/index';
export * from './components/layout/index';
export * from './components/navigation/index';
export * from './components/overlay-foundation/index';
export * from './components/overlays/index';
export * from './components/parallax/index';
