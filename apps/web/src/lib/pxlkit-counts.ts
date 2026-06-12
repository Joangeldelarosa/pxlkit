/**
 * Single source of truth for the marketing counts surfaced across the web app
 * (landing stats, JSON-LD, metadata descriptions, pricing copy).
 *
 * Component count derives from the ui-kit registry — it can never go stale.
 * This module is server-safe (no 'use client' anywhere in its import chain),
 * so both RSC metadata/JSON-LD and client sections can import it.
 */

import { UI_KIT_COMPONENTS } from '@pxlkit/ui-kit/registry';

/** Exact number of components shipped in @pxlkit/ui-kit (registry SSOT). */
export const UI_COMPONENTS_COUNT: number = UI_KIT_COMPONENTS.length;

/** Marketed icon total across all packs. */
export const ICON_COUNT_LABEL = '226+';

/** Number of themed icon packs. */
export const ICON_PACK_COUNT = 7;

/** Number of complete page templates. */
export const PAGE_TEMPLATE_COUNT = 6;

/** Accessibility baseline claimed across the site. */
export const A11Y_BASELINE = 'WCAG 2.1 AA';
