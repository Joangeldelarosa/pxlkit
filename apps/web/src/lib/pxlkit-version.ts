/**
 * Single source of truth for the @pxlkit/ui-kit version + release date
 * surfaced across the web app (hero badge, WhatsNewStrip, JSON-LD softwareVersion,
 * dashboard template ribbon, real-site Footer, ui-kit body copy).
 *
 * SoT: packages/ui-kit/package.json#version + packages/ui-kit/version-meta.json#date.
 * Bump both together at release time.
 */

import pkg from '../../../../packages/ui-kit/package.json';
import meta from '../../../../packages/ui-kit/version-meta.json';

export const UI_KIT_VERSION: string = pkg.version;
export const UI_KIT_VERSION_LABEL = `v${pkg.version}`;
export const UI_KIT_LATEST_DATE: string = meta.date;
