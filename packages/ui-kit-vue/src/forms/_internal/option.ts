import type { PxlNode } from '../../_internal/render-node.js';

/** One choice of a select, radio group or segmented control. */
export interface Option {
  value: string;
  label: string;
  /** Leading icon, where the component shows one (`PixelSelect`). */
  icon?: PxlNode;
}
