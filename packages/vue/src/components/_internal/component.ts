import type { ComponentOptionsMixin, DefineComponent, EmitsOptions } from 'vue';

/**
 * Public type of a pxlkit component, spelled with only the `DefineComponent`
 * type parameters every supported Vue version (≥ 3.3) shares — the props
 * options and the emits. Typing the exports with it keeps the published
 * declarations independent of the Vue version the package is built with:
 * the type `defineComponent` infers names type parameters and helpers (such
 * as `PublicProps`) that older supported versions do not have.
 */
export type PxlComponent<PropsOptions, Emits extends EmitsOptions = {}> = DefineComponent<
  PropsOptions,
  {},
  {},
  {},
  {},
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  Emits
>;
