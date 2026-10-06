import type { PxlContent } from '../_internal/outlet';

/** One choice of a select, radio group or segmented control. */
export interface Option {
  value: string;
  label: string;
  /** Leading icon, where the component shows one (`pxl-select`). */
  icon?: PxlContent;
}
