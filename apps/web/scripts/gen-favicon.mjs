#!/usr/bin/env node
/**
 * Generate the static favicon.svg from the same pixel data as
 * apps/web/src/components/Logo.tsx (BrandIcon). Run via:
 *   node scripts/gen-favicon.mjs > public/favicon.svg
 *
 * The favicon is hand-loaded by browsers (no React), so we precompute the
 * SVG once and commit it.
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Keep in sync with apps/web/src/components/Logo.tsx */
const P_PIXELS = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [0, 1], [1, 1], [4, 1], [5, 1],
  [0, 2], [1, 2], [4, 2], [5, 2],
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
  [0, 4], [1, 4],
  [0, 5], [1, 5],
  [0, 6], [1, 6],
  [0, 7], [1, 7],
];

const HIGHLIGHT_PIXELS = [
  [0, 0], [4, 0], [0, 4],
];

const PARTICLES = [
  { col: 7, row: 0, color: '#FFD700' }, // gold
  { col: 8, row: 2, color: '#4ECDC4' }, // cyan
  { col: 8, row: 4, color: '#FFD700' }, // gold
  { col: 3, row: 5, color: '#B968FF' }, // purple
  { col: 4, row: 7, color: '#4ECDC4' }, // cyan
  { col: 3, row: 8, color: '#FF4D6A' }, // pink
];

const CELL = 4;
const MARGIN = 4;
const VIEW = 48;

const BOWL_HOLES = new Set(['2,1', '3,1', '2,2', '3,2']);
const P_SET = new Set(P_PIXELS.map(([c, r]) => `${c},${r}`));

const SHADOW_LAYERS = [
  { dx: 3, dy: 3, fill: '#0a0a0f' },
  { dx: 2, dy: 2, fill: '#2a8f5f' },
  { dx: 1, dy: 1, fill: '#2a8f5f' },
];

const MAIN_FILL = '#00FF88';
const HIGHLIGHT_COLOR = '#B5FFD6';

const rects = [];
// Shadow layers — skip cells inside the P silhouette or in the bowl interior.
for (const L of SHADOW_LAYERS) {
  for (const [col, row] of P_PIXELS) {
    const c = col + L.dx;
    const r = row + L.dy;
    const key = `${c},${r}`;
    if (P_SET.has(key) || BOWL_HOLES.has(key)) continue;
    rects.push(
      `  <rect x="${MARGIN + c * CELL}" y="${MARGIN + r * CELL}" width="${CELL}" height="${CELL}" fill="${L.fill}"/>`,
    );
  }
}
// Main P fill
for (const [col, row] of P_PIXELS) {
  rects.push(
    `  <rect x="${MARGIN + col * CELL}" y="${MARGIN + row * CELL}" width="${CELL}" height="${CELL}" fill="${MAIN_FILL}"/>`,
  );
}
for (const [col, row] of HIGHLIGHT_PIXELS) {
  rects.push(
    `  <rect x="${MARGIN + col * CELL}" y="${MARGIN + row * CELL}" width="${CELL}" height="${CELL}" fill="${HIGHLIGHT_COLOR}"/>`,
  );
}
for (const p of PARTICLES) {
  rects.push(
    `  <rect x="${MARGIN + p.col * CELL}" y="${MARGIN + p.row * CELL}" width="${CELL}" height="${CELL}" fill="${p.color}"/>`,
  );
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" shape-rendering="crispEdges">
${rects.join('\n')}
</svg>
`;

const outPath = resolve(__dirname, '..', 'public', 'favicon.svg');
writeFileSync(outPath, svg);
console.log(`✓ favicon.svg → ${outPath} (${rects.length} rects)`);
