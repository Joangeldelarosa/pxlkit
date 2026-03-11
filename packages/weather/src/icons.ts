import type { PxlKitData } from '@pxlkit/core';

type Grid = string[][];

type PaintFn = (ctx: {
  set: (x: number, y: number, char: string) => void;
  line: (x0: number, y0: number, x1: number, y1: number, char: string) => void;
  rect: (x: number, y: number, w: number, h: number, char: string) => void;
  fillRect: (x: number, y: number, w: number, h: number, char: string) => void;
  ring: (cx: number, cy: number, radius: number, char: string, thickness?: number) => void;
  fillCircle: (cx: number, cy: number, radius: number, char: string) => void;
}) => void;

const SIZE = 16;
const CATEGORY = 'weather';

function createGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => '.'));
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

function createIcon(
  name: string,
  palette: Record<string, string>,
  tags: string[],
  paint: PaintFn
): PxlKitData {
  const grid = createGrid();

  function set(x: number, y: number, char: string) {
    if (inBounds(x, y)) grid[y][x] = char;
  }

  function line(x0: number, y0: number, x1: number, y1: number, char: string) {
    let cx = x0;
    let cy = y0;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      set(cx, cy, char);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; cx += sx; }
      if (e2 <= dx) { err += dx; cy += sy; }
    }
  }

  function rect(x: number, y: number, w: number, h: number, char: string) {
    for (let px = x; px < x + w; px++) { set(px, y, char); set(px, y + h - 1, char); }
    for (let py = y; py < y + h; py++) { set(x, py, char); set(x + w - 1, py, char); }
  }

  function fillRect(x: number, y: number, w: number, h: number, char: string) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) { set(px, py, char); }
    }
  }

  function ring(cx: number, cy: number, radius: number, char: string, thickness = 1.25) {
    for (let py = 0; py < SIZE; py++) {
      for (let px = 0; px < SIZE; px++) {
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= radius - thickness && dist <= radius + thickness) set(px, py, char);
      }
    }
  }

  function fillCircle(cx: number, cy: number, radius: number, char: string) {
    for (let py = 0; py < SIZE; py++) {
      for (let px = 0; px < SIZE; px++) {
        const dx = px - cx;
        const dy = py - cy;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) set(px, py, char);
      }
    }
  }

  paint({ set, line, rect, fillRect, ring, fillCircle });

  return {
    name,
    size: 16,
    category: CATEGORY,
    grid: grid.map((row) => row.join('')),
    palette,
    tags,
    author: 'pxlkit',
  };
}

// ─── Icons ────────────────────────────────────

export const Sun = createIcon(
  'sun',
  { Y: '#FBBF24', O: '#F59E0B', W: '#FEF3C7' },
  ['sun', 'sunny', 'day', 'bright', 'weather'],
  ({ fillCircle, ring, set }) => {
    fillCircle(7.5, 7.5, 3.5, 'Y');
    ring(7.5, 7.5, 3.5, 'O', 0.4);
    // rays
    for (const [x, y] of [
      [8, 1], [8, 2], [8, 13], [8, 14],
      [1, 8], [2, 8], [13, 8], [14, 8],
      [3, 3], [4, 4], [12, 3], [11, 4],
      [3, 12], [4, 11], [12, 12], [11, 11],
    ] as [number, number][]) {
      set(x, y, 'O');
    }
    // highlight
    set(6, 6, 'W');
    set(7, 6, 'W');
  }
);

export const Moon = createIcon(
  'moon',
  { B: '#CBD5E1', D: '#94A3B8', Y: '#FEF9C3' },
  ['moon', 'night', 'crescent', 'dark', 'weather'],
  ({ fillCircle, set }) => {
    fillCircle(7, 8, 5.5, 'B');
    // crescent cutout
    fillCircle(10, 6, 4.5, '.');
    // craters
    set(5, 6, 'D');
    set(6, 9, 'D');
    set(4, 10, 'D');
    // stars
    set(12, 4, 'Y');
    set(13, 8, 'Y');
    set(11, 11, 'Y');
  }
);

export const Cloud = createIcon(
  'cloud',
  { C: '#E2E8F0', D: '#CBD5E1' },
  ['cloud', 'cloudy', 'overcast', 'sky', 'weather'],
  ({ fillCircle, fillRect }) => {
    fillCircle(6, 7, 3.5, 'C');
    fillCircle(10, 7, 2.8, 'C');
    fillCircle(8, 5, 2.8, 'C');
    fillRect(4, 7, 9, 4, 'C');
    // shadow
    fillRect(5, 10, 7, 1, 'D');
  }
);

export const CloudSun = createIcon(
  'cloud-sun',
  { Y: '#FBBF24', C: '#E2E8F0', D: '#CBD5E1' },
  ['cloud', 'sun', 'partly-cloudy', 'daytime', 'weather'],
  ({ fillCircle, fillRect, set }) => {
    // sun peeking out top-right
    fillCircle(11, 4, 2.8, 'Y');
    set(11, 1, 'Y');
    set(14, 4, 'Y');
    set(13, 2, 'Y');
    // cloud in front
    fillCircle(6, 8, 3.2, 'C');
    fillCircle(10, 8, 2.5, 'C');
    fillCircle(8, 6, 2.5, 'C');
    fillRect(4, 8, 9, 4, 'C');
    fillRect(5, 11, 7, 1, 'D');
  }
);

export const Rain = createIcon(
  'rain',
  { C: '#94A3B8', B: '#3B82F6', D: '#64748B' },
  ['rain', 'rainy', 'shower', 'wet', 'weather'],
  ({ fillCircle, fillRect, set }) => {
    // cloud
    fillCircle(6, 5, 3, 'C');
    fillCircle(10, 5, 2.5, 'C');
    fillCircle(8, 3, 2.5, 'C');
    fillRect(4, 5, 9, 3, 'C');
    fillRect(5, 7, 6, 1, 'D');
    // rain drops
    set(5, 9, 'B'); set(5, 10, 'B');
    set(8, 9, 'B'); set(8, 10, 'B'); set(8, 11, 'B');
    set(11, 9, 'B'); set(11, 10, 'B');
    set(6, 12, 'B'); set(6, 13, 'B');
    set(10, 12, 'B'); set(10, 13, 'B');
  }
);

export const Snow = createIcon(
  'snow',
  { C: '#94A3B8', W: '#FFFFFF', D: '#64748B' },
  ['snow', 'snowy', 'winter', 'cold', 'weather'],
  ({ fillCircle, fillRect, set }) => {
    // cloud
    fillCircle(6, 5, 3, 'C');
    fillCircle(10, 5, 2.5, 'C');
    fillCircle(8, 3, 2.5, 'C');
    fillRect(4, 5, 9, 3, 'C');
    fillRect(5, 7, 6, 1, 'D');
    // snowflakes
    set(5, 9, 'W'); set(9, 10, 'W');
    set(12, 9, 'W'); set(6, 11, 'W');
    set(10, 12, 'W'); set(4, 12, 'W');
    set(8, 13, 'W'); set(7, 10, 'W');
    set(11, 11, 'W');
  }
);

export const Thunder = createIcon(
  'thunder',
  { C: '#64748B', Y: '#FBBF24', D: '#475569', O: '#F59E0B' },
  ['thunder', 'lightning', 'storm', 'electric', 'weather'],
  ({ fillCircle, fillRect, line }) => {
    // dark cloud
    fillCircle(6, 4, 3, 'C');
    fillCircle(10, 4, 2.5, 'C');
    fillCircle(8, 2, 2.5, 'C');
    fillRect(4, 4, 9, 3, 'C');
    fillRect(5, 6, 6, 1, 'D');
    // lightning bolt
    line(9, 7, 7, 10, 'Y');
    line(7, 10, 10, 10, 'Y');
    line(10, 10, 7, 14, 'O');
    line(8, 7, 6, 10, 'Y');
    line(9, 10, 6, 14, 'O');
  }
);

export const Wind = createIcon(
  'wind',
  { B: '#93C5FD', D: '#60A5FA', C: '#BFDBFE' },
  ['wind', 'windy', 'breeze', 'air', 'weather'],
  ({ line, set }) => {
    // three curved wind lines
    line(2, 4, 10, 4, 'B');
    line(10, 4, 12, 3, 'B');
    set(12, 2, 'B');

    line(3, 7, 11, 7, 'D');
    line(11, 7, 13, 8, 'D');
    set(13, 9, 'D');

    line(2, 10, 9, 10, 'C');
    line(9, 10, 11, 9, 'C');
    set(11, 8, 'C');

    line(4, 13, 8, 13, 'B');
    line(8, 13, 10, 12, 'B');
  }
);

export const Thermometer = createIcon(
  'thermometer',
  { R: '#EF4444', G: '#D1D5DB', D: '#9CA3AF', W: '#FFFFFF' },
  ['thermometer', 'temperature', 'hot', 'cold', 'weather'],
  ({ fillRect, fillCircle, ring, set }) => {
    // tube
    fillRect(7, 2, 2, 9, 'G');
    set(6, 3, 'G');  set(9, 3, 'G');
    // mercury
    fillRect(7, 5, 2, 6, 'R');
    // bulb
    fillCircle(7.5, 12, 2.5, 'R');
    ring(7.5, 12, 2.5, 'D', 0.4);
    // marks
    set(10, 4, 'D');
    set(10, 6, 'D');
    set(10, 8, 'D');
    // highlight
    set(7, 3, 'W');
    set(7, 4, 'W');
  }
);

export const Droplet = createIcon(
  'droplet',
  { B: '#3B82F6', C: '#93C5FD', D: '#2563EB' },
  ['droplet', 'water', 'humidity', 'rain', 'weather'],
  ({ fillCircle, line, set }) => {
    // drop shape
    set(8, 2, 'B');
    line(8, 2, 5, 8, 'B');
    line(8, 2, 11, 8, 'B');
    fillCircle(8, 10, 3.5, 'B');
    // fill the top
    for (let y = 3; y <= 8; y++) {
      const progress = (y - 2) / 6;
      const hw = Math.floor(progress * 3.5);
      for (let x = 8 - hw; x <= 8 + hw; x++) set(x, y, 'B');
    }
    // highlight
    set(6, 8, 'C');
    set(6, 9, 'C');
    set(7, 7, 'C');
    // shadow
    set(10, 10, 'D');
    set(9, 11, 'D');
  }
);

export const Tornado = createIcon(
  'tornado',
  { G: '#6B7280', D: '#374151', C: '#9CA3AF' },
  ['tornado', 'twister', 'storm', 'disaster', 'weather'],
  ({ line }) => {
    line(2, 3, 13, 3, 'G');
    line(2, 4, 13, 4, 'D');
    line(3, 5, 12, 5, 'C');
    line(3, 6, 12, 6, 'G');
    line(4, 7, 11, 7, 'D');
    line(4, 8, 11, 8, 'C');
    line(5, 9, 10, 9, 'G');
    line(5, 10, 10, 10, 'D');
    line(6, 11, 9, 11, 'C');
    line(6, 12, 9, 12, 'G');
    line(7, 13, 8, 13, 'D');
  }
);

export const Fog = createIcon(
  'fog',
  { G: '#9CA3AF', D: '#6B7280', C: '#D1D5DB' },
  ['fog', 'mist', 'haze', 'visibility', 'weather'],
  ({ line }) => {
    line(2, 3, 13, 3, 'C');
    line(3, 5, 12, 5, 'G');
    line(2, 7, 13, 7, 'D');
    line(4, 9, 11, 9, 'C');
    line(3, 11, 12, 11, 'G');
    line(5, 13, 10, 13, 'D');
  }
);

export const Rainbow = createIcon(
  'rainbow',
  { R: '#EF4444', O: '#F97316', Y: '#FBBF24', G: '#22C55E', B: '#3B82F6', P: '#8B5CF6' },
  ['rainbow', 'colorful', 'arc', 'hope', 'weather'],
  ({ ring }) => {
    ring(7.5, 12, 9, 'R', 0.6);
    ring(7.5, 12, 8, 'O', 0.6);
    ring(7.5, 12, 7, 'Y', 0.6);
    ring(7.5, 12, 6, 'G', 0.6);
    ring(7.5, 12, 5, 'B', 0.6);
    ring(7.5, 12, 4, 'P', 0.6);
    // clear the bottom half
  }
);

export const Sunrise = createIcon(
  'sunrise',
  { Y: '#FBBF24', O: '#F97316', H: '#FDE68A', D: '#D97706' },
  ['sunrise', 'dawn', 'morning', 'horizon', 'weather'],
  ({ fillCircle, line, set }) => {
    // sun half above horizon
    fillCircle(8, 10, 3.5, 'Y');
    // clear below horizon
    for (let y = 11; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) set(x, y, '.');
    }
    // horizon line
    line(1, 11, 14, 11, 'D');
    // rays above
    set(8, 4, 'O'); set(8, 5, 'O');
    set(4, 6, 'O'); set(5, 7, 'O');
    set(12, 6, 'O'); set(11, 7, 'O');
    set(3, 9, 'O'); set(13, 9, 'O');
    // arrow up
    line(8, 13, 6, 14, 'H');
    line(8, 13, 10, 14, 'H');
  }
);

export const Sunset = createIcon(
  'sunset',
  { O: '#F97316', R: '#EF4444', Y: '#FBBF24', D: '#D97706' },
  ['sunset', 'dusk', 'evening', 'horizon', 'weather'],
  ({ fillCircle, line, set }) => {
    fillCircle(8, 10, 3.5, 'O');
    // clear below horizon
    for (let y = 11; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) set(x, y, '.');
    }
    // horizon
    line(1, 11, 14, 11, 'D');
    // rays
    set(8, 4, 'R'); set(8, 5, 'R');
    set(4, 6, 'R'); set(12, 6, 'R');
    set(3, 9, 'Y'); set(13, 9, 'Y');
    // arrow down
    line(8, 14, 6, 13, 'Y');
    line(8, 14, 10, 13, 'Y');
  }
);

export const Umbrella = createIcon(
  'umbrella',
  { R: '#EF4444', D: '#B91C1C', B: '#7C3AED', W: '#FECACA' },
  ['umbrella', 'rain', 'protection', 'shelter', 'weather'],
  ({ fillCircle, fillRect, line, set }) => {
    // canopy (half circle top)
    fillCircle(8, 7, 5.5, 'R');
    // clear bottom half of canopy by resetting to transparent
    for (let y = 8; y <= 14; y++) {
      for (let x = 2; x <= 14; x++) {
        set(x, y, '.');
      }
    }
    // scallops
    set(3, 7, 'D'); set(6, 7, 'D'); set(9, 7, 'D'); set(12, 7, 'D');
    // handle
    fillRect(8, 7, 1, 6, 'B');
    // hook at bottom
    set(7, 13, 'B');
    set(6, 13, 'B');
    set(6, 12, 'B');
    // highlight
    set(6, 4, 'W');
    set(7, 3, 'W');
  }
);

export const Snowflake = createIcon(
  'snowflake',
  { B: '#93C5FD', C: '#DBEAFE' },
  ['snowflake', 'ice', 'frozen', 'crystal', 'weather'],
  ({ line, set }) => {
    // main cross
    line(8, 2, 8, 14, 'B');
    line(2, 8, 14, 8, 'B');
    // diagonals
    line(4, 4, 12, 12, 'C');
    line(12, 4, 4, 12, 'C');
    // branches
    set(6, 3, 'B'); set(10, 3, 'B');
    set(6, 13, 'B'); set(10, 13, 'B');
    set(3, 6, 'B'); set(3, 10, 'B');
    set(13, 6, 'B'); set(13, 10, 'B');
    // center
    set(8, 8, 'C');
  }
);

export const Hail = createIcon(
  'hail',
  { C: '#64748B', W: '#E2E8F0', D: '#475569', I: '#BFDBFE' },
  ['hail', 'ice', 'storm', 'pellets', 'weather'],
  ({ fillCircle, fillRect, set }) => {
    // cloud
    fillCircle(6, 4, 3, 'C');
    fillCircle(10, 4, 2.5, 'C');
    fillCircle(8, 2, 2.5, 'C');
    fillRect(4, 4, 9, 3, 'C');
    fillRect(5, 6, 6, 1, 'D');
    // hailstones (circles)
    fillCircle(5, 9, 1, 'I');
    fillCircle(8, 10, 1, 'W');
    fillCircle(11, 9, 1, 'I');
    fillCircle(6, 12, 1, 'W');
    fillCircle(10, 13, 1, 'I');
  }
);

export const Compass = createIcon(
  'compass',
  { B: '#6B7280', R: '#EF4444', W: '#FFFFFF', D: '#374151', G: '#22C55E' },
  ['compass', 'direction', 'navigation', 'north', 'weather'],
  ({ ring, fillCircle, line, set }) => {
    ring(7.5, 7.5, 6, 'B');
    ring(7.5, 7.5, 6.5, 'D', 0.4);
    fillCircle(7.5, 7.5, 1, 'D');
    // north pointer (red)
    line(8, 2, 8, 7, 'R');
    line(7, 3, 8, 2, 'R');
    line(9, 3, 8, 2, 'R');
    // south pointer (white)
    line(8, 8, 8, 13, 'W');
    // east/west marks
    set(2, 8, 'G');
    set(13, 8, 'G');
    // cardinal dots
    set(8, 1, 'R');
  }
);

export const WeatherIcons: PxlKitData[] = [
  Sun,
  Moon,
  Cloud,
  CloudSun,
  Rain,
  Snow,
  Thunder,
  Wind,
  Thermometer,
  Droplet,
  Tornado,
  Fog,
  Rainbow,
  Sunrise,
  Sunset,
  Umbrella,
  Snowflake,
  Hail,
  Compass,
];
