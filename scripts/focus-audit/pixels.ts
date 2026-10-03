/**
 * The focus audit's measure: decoding Chromium's screenshots and counting the
 * pixels keyboard focus changed.
 */
import { inflateSync } from 'node:zlib';
import type { Box } from './probe';

/** An image as rows of 8-bit RGBA pixels. */
export interface Image {
  width: number;
  height: number;
  data: Uint8Array;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function paeth(left: number, up: number, upLeft: number): number {
  const estimate = left + up - upLeft;
  const [toLeft, toUp, toUpLeft] = [Math.abs(estimate - left), Math.abs(estimate - up), Math.abs(estimate - upLeft)];
  if (toLeft <= toUp && toLeft <= toUpLeft) return left;
  return toUp <= toUpLeft ? up : upLeft;
}

/** Decodes a PNG as Chromium writes its screenshots: 8-bit truecolour, with or without alpha, not interlaced. */
export function decodePng(png: Buffer): Image {
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('not a PNG');
  let [width, height, channels] = [0, 0, 0];
  const compressed: Buffer[] = [];
  for (let at = 8; at < png.length; ) {
    const length = png.readUInt32BE(at);
    const type = png.toString('latin1', at + 4, at + 8);
    const body = png.subarray(at + 8, at + 8 + length);
    if (type === 'IHDR') {
      [width, height] = [body.readUInt32BE(0), body.readUInt32BE(4)];
      const [depth, colour, , , interlace] = body.subarray(8, 13);
      if (depth !== 8 || (colour !== 2 && colour !== 6) || interlace !== 0) {
        throw new Error(`unsupported PNG: bit depth ${depth}, colour type ${colour}, interlace ${interlace}`);
      }
      channels = colour === 6 ? 4 : 3;
    } else if (type === 'IDAT') compressed.push(body);
    else if (type === 'IEND') break;
    at += length + 12;
  }
  // Each row is a filter type, then the row's bytes as that filter left them.
  const raw = inflateSync(Buffer.concat(compressed));
  const stride = width * channels;
  const rows = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = y * (stride + 1) + 1;
    const row = y * stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? rows[row + i - channels] : 0;
      const up = y > 0 ? rows[row - stride + i] : 0;
      const upLeft = y > 0 && i >= channels ? rows[row - stride + i - channels] : 0;
      const predicted = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][filter];
      if (predicted === undefined) throw new Error(`unknown PNG filter ${filter}`);
      rows[row + i] = (raw[line + i] + predicted) & 0xff;
    }
  }
  if (channels === 4) return { width, height, data: rows };
  const data = new Uint8Array(width * height * 4).fill(255);
  for (let p = 0, q = 0; p < rows.length; p += 3, q += 4) data.set(rows.subarray(p, p + 3), q);
  return { width, height, data };
}

/** The part of `image` inside `box`, which lies within it. */
export function crop(image: Image, box: Box): Image {
  const data = new Uint8Array(box.w * box.h * 4);
  for (let y = 0; y < box.h; y++) {
    const from = ((box.y + y) * image.width + box.x) * 4;
    data.set(image.data.subarray(from, from + box.w * 4), y * box.w * 4);
  }
  return { width: box.w, height: box.h, data };
}

const LINEAR = Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});
const labs = new Map<number, readonly [number, number, number]>();

/** CIE L*a*b* (D65) of an sRGB colour. */
function lab(r: number, g: number, b: number): readonly [number, number, number] {
  const key = (r << 16) | (g << 8) | b;
  let value = labs.get(key);
  if (!value) {
    const [R, G, B] = [LINEAR[r], LINEAR[g], LINEAR[b]];
    const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
    const fx = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047);
    const fy = f(0.2126 * R + 0.7152 * G + 0.0722 * B);
    const fz = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
    value = [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
    labs.set(key, value);
  }
  return value;
}

/** CIE76 colour difference between the pixels at byte offset `i` of two images. */
function difference(a: Image, b: Image, i: number): number {
  const [l1, a1, b1] = lab(a.data[i], a.data[i + 1], a.data[i + 2]);
  const [l2, a2, b2] = lab(b.data[i], b.data[i + 1], b.data[i + 2]);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** A colour difference anyone sees at a glance. */
const VISIBLE_DIFFERENCE = 10;

/**
 * How many pixels of `region` keyboard focus changed visibly: those of the
 * focused render that differ from both unfocused ones — after the blur, and
 * before any focus — by a CIE76 ΔE of 10 or more. Taking the smaller of the
 * two differences keeps state that focus set and the blur kept (a tab
 * selected by focus) from passing for an indicator. Pixels within 1 px of a
 * clip-path's border box are left out: where its edge falls between device
 * pixels, anti-aliasing lets a sliver of a clipped ring through.
 */
export function changedPixels(focused: Image, blurred: Image, before: Image, region: Box, clipEdges: readonly Box[]): number {
  const near = (value: number, edge: number) => Math.abs(value - edge) < 1;
  const onClipEdge = (x: number, y: number) =>
    clipEdges.some(
      (edge) =>
        ((near(x, edge.x) || near(x, edge.x + edge.w)) && y > edge.y - 1 && y < edge.y + edge.h + 1) ||
        ((near(y, edge.y) || near(y, edge.y + edge.h)) && x > edge.x - 1 && x < edge.x + edge.w + 1),
    );
  let changed = 0;
  for (let i = 0, p = 0; i < focused.data.length; i += 4, p++) {
    if (Math.min(difference(focused, blurred, i), difference(focused, before, i)) < VISIBLE_DIFFERENCE) continue;
    if (!onClipEdge(region.x + (p % region.w) + 0.5, region.y + Math.floor(p / region.w) + 0.5)) changed++;
  }
  return changed;
}

/**
 * How many pixels focus has to change for an element of `box`: a quarter of
 * a 1 px line around it, or its shorter side when that is less (an underline
 * under a short link), and never fewer than 12.
 */
export function pixelsNeeded(box: Box): number {
  const quarterPerimeter = Math.ceil((2 * (box.w + box.h) - 4) / 4);
  return Math.max(12, Math.min(quarterPerimeter, Math.ceil(Math.min(box.w, box.h))));
}
