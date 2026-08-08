#!/usr/bin/env node
/**
 * Renders a pxlkit icon to SVG so its silhouette can actually be looked at.
 *
 * A 16x16 grid of characters is unreadable as design feedback — the whole point of
 * the format is that it becomes a picture. This produces that picture without
 * needing the kit installed, mirroring `gridToSvg` from @pxlkit/core: one `<rect>`
 * per horizontal run of same-coloured pixels, `shape-rendering="crispEdges"` so
 * nothing gets smoothed.
 *
 * Usage:
 *   node render-icon.mjs <icon-file.ts> [--out preview.svg] [--scale 8] [--frame 1]
 *
 * With no --out it writes the SVG to stdout and an ASCII preview to stderr, so the
 * shape is visible in a terminal too.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseIconSource } from './check-icon.mjs';

/**
 * Converts a character grid to SVG, merging horizontal runs of the same colour.
 *
 * Run-merging is not just an optimisation: it is what `pixelsToSvg` in @pxlkit/core
 * does, and matching it keeps previews faithful to what ships.
 */
export function gridToSvg(rows, palette, scale = 1) {
  const size = rows.length;
  const rects = [];

  rows.forEach((row, y) => {
    let runStart = -1;
    let runColor = null;

    const flush = (endExclusive) => {
      if (runStart === -1 || runColor === null) return;
      const width = endExclusive - runStart;
      rects.push(`  <rect x="${runStart}" y="${y}" width="${width}" height="1" fill="${runColor}"/>`);
      runStart = -1;
      runColor = null;
    };

    for (let x = 0; x < row.length; x += 1) {
      const char = row[x];
      const color = char === '.' ? null : palette[char];
      if (color !== runColor) {
        flush(x);
        if (color) {
          runStart = x;
          runColor = color;
        }
      }
    }
    flush(row.length);
  });

  const dimension = size * scale;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${dimension}" height="${dimension}" shape-rendering="crispEdges" fill="none">`,
    ...rects,
    '</svg>',
    '',
  ].join('\n');
}

/** A terminal-readable version of the grid, two columns per pixel so it looks square. */
export function gridToAscii(rows) {
  return rows.map((row) => [...row].map((c) => (c === '.' ? '  ' : '██')).join('')).join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const file = argv.find((a) => !a.startsWith('--'));
  const outIndex = argv.indexOf('--out');
  const out = outIndex >= 0 ? argv[outIndex + 1] : null;
  const scaleIndex = argv.indexOf('--scale');
  const scale = scaleIndex >= 0 ? Number(argv[scaleIndex + 1]) : 8;
  const frameIndex = argv.indexOf('--frame');
  const frame = frameIndex >= 0 ? Number(argv[frameIndex + 1]) : 1;

  if (!file) {
    console.error('usage: node render-icon.mjs <icon-file.ts> [--out preview.svg] [--scale 8] [--frame 1]');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`render-icon: no such file: ${file}`);
    process.exit(2);
  }

  const [icon] = parseIconSource(fs.readFileSync(file, 'utf8'));
  if (!icon) {
    console.error(`render-icon: no icon definition found in ${file}`);
    process.exit(1);
  }

  const frames = icon.frames ?? [{ grid: icon.grid }];
  const chosen = frames[frame - 1];
  if (!chosen?.grid) {
    console.error(`render-icon: frame ${frame} does not exist (icon has ${frames.length}).`);
    process.exit(1);
  }

  const palette = { ...icon.palette, ...(chosen.palette ?? {}) };
  const svg = gridToSvg(chosen.grid, palette, scale);

  if (out) {
    fs.writeFileSync(out, svg, 'utf8');
    console.log(`render-icon: wrote ${out} (${icon.name}, frame ${frame} of ${frames.length}, ${scale}x)`);
    console.log(gridToAscii(chosen.grid));
  } else {
    process.stderr.write(`${gridToAscii(chosen.grid)}\n`);
    process.stdout.write(svg);
  }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href;
if (invokedDirectly) main();
