export * from './layout';
export * from './actions';
export * from './data-display';
export * from './inputs';
export * from './feedback';
export * from './navigation';
export * from './overlay';
export * from './animations';
export * from './registry';
export * from './parallax';
export * from './locale';
// Surface system — design aesthetic switch (pixel ↔ linear)
export {
  type Surface,
  type SurfaceClasses,
  surfaceClasses,
  PxlKitSurfaceProvider,
  usePxlKitSurface,
} from './common';
// Public design tokens for consumers who need to compose with the system
export { type Tone, type Size, type Option, type TabItem, type AccordionItem } from './common';