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
const CATEGORY = 'social';

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

export const Heart = createIcon(
  'heart',
  { R: '#FF4D6A', D: '#CC2244' },
  ['heart', 'love', 'like', 'favorite', 'social'],
  ({ fillCircle, line, set }) => {
    fillCircle(5, 6, 3.2, 'R');
    fillCircle(10, 6, 3.2, 'R');
    line(2, 7, 8, 13, 'R');
    line(13, 7, 8, 13, 'R');
    // fill lower triangle
    for (let y = 8; y <= 13; y++) {
      const halfW = Math.max(0, 13 - y);
      for (let x = 8 - halfW; x <= 8 + halfW; x++) set(x, y, 'R');
    }
    set(5, 5, 'D');
    set(10, 5, 'D');
  }
);

export const HeartBroken = createIcon(
  'heart-broken',
  { R: '#FF4D6A', D: '#CC2244', C: '#1A1A2E' },
  ['heart', 'broken', 'sad', 'breakup', 'social'],
  ({ fillCircle, line, set }) => {
    fillCircle(5, 6, 3.2, 'R');
    fillCircle(10, 6, 3.2, 'R');
    line(2, 7, 8, 13, 'R');
    line(13, 7, 8, 13, 'R');
    for (let y = 8; y <= 13; y++) {
      const halfW = Math.max(0, 13 - y);
      for (let x = 8 - halfW; x <= 8 + halfW; x++) set(x, y, 'R');
    }
    // crack
    line(8, 4, 7, 6, 'C');
    line(7, 6, 9, 8, 'C');
    line(9, 8, 7, 10, 'C');
    line(7, 10, 8, 12, 'C');
  }
);

export const ThumbsUp = createIcon(
  'thumbs-up',
  { S: '#FBBF24', D: '#D69E2E', B: '#F97316' },
  ['thumbs-up', 'like', 'approve', 'positive', 'social'],
  ({ fillRect, rect, line, set }) => {
    // thumb
    fillRect(5, 3, 3, 5, 'S');
    line(6, 2, 9, 2, 'S');
    set(10, 3, 'S');
    // hand
    fillRect(3, 8, 9, 5, 'S');
    rect(3, 8, 9, 5, 'D');
    // finger lines
    line(4, 10, 10, 10, 'D');
    line(4, 12, 10, 12, 'D');
    // cuff
    fillRect(3, 13, 3, 2, 'B');
  }
);

export const ThumbsDown = createIcon(
  'thumbs-down',
  { S: '#FBBF24', D: '#D69E2E', B: '#F97316' },
  ['thumbs-down', 'dislike', 'reject', 'negative', 'social'],
  ({ fillRect, rect, line, set }) => {
    // inverted hand
    fillRect(4, 3, 9, 5, 'S');
    rect(4, 3, 9, 5, 'D');
    line(5, 5, 11, 5, 'D');
    line(5, 7, 11, 7, 'D');
    // thumb going down
    fillRect(8, 8, 3, 5, 'S');
    line(7, 13, 10, 13, 'S');
    set(6, 12, 'S');
    // cuff
    fillRect(10, 1, 3, 2, 'B');
  }
);

export const User = createIcon(
  'user',
  { H: '#A78BFA', B: '#7C3AED', S: '#DDD6FE' },
  ['user', 'person', 'profile', 'account', 'social'],
  ({ fillCircle, fillRect, ring }) => {
    // head
    fillCircle(7.5, 5, 3, 'H');
    ring(7.5, 5, 3, 'B', 0.5);
    // body
    fillRect(4, 10, 8, 4, 'B');
    fillRect(5, 10, 6, 2, 'S');
  }
);

export const UserGroup = createIcon(
  'user-group',
  { H: '#A78BFA', B: '#7C3AED', S: '#DDD6FE', D: '#6D28D9' },
  ['users', 'group', 'team', 'community', 'social'],
  ({ fillCircle, fillRect, ring }) => {
    // back person
    fillCircle(11, 5, 2.3, 'S');
    fillRect(9, 9, 5, 3, 'S');
    // front person
    fillCircle(6, 5, 2.8, 'H');
    ring(6, 5, 2.8, 'B', 0.5);
    fillRect(3, 10, 7, 4, 'B');
    fillRect(4, 10, 5, 2, 'D');
  }
);

export const Share = createIcon(
  'share',
  { B: '#3B82F6', C: '#93C5FD' },
  ['share', 'forward', 'send', 'repost', 'social'],
  ({ fillCircle, line }) => {
    fillCircle(11, 3, 2.2, 'B');
    fillCircle(3, 8, 2.2, 'B');
    fillCircle(11, 13, 2.2, 'B');
    line(5, 7, 9, 4, 'C');
    line(5, 9, 9, 12, 'C');
  }
);

export const Bookmark = createIcon(
  'bookmark',
  { B: '#F59E0B', D: '#D97706' },
  ['bookmark', 'save', 'read-later', 'flag', 'social'],
  ({ fillRect, line }) => {
    fillRect(4, 2, 8, 12, 'B');
    line(4, 2, 4, 13, 'D');
    line(11, 2, 11, 13, 'D');
    line(4, 2, 11, 2, 'D');
    // notch at bottom
    line(4, 13, 8, 10, 'D');
    line(11, 13, 8, 10, 'D');
  }
);

export const Camera = createIcon(
  'camera',
  { G: '#6B7280', D: '#374151', L: '#93C5FD', C: '#DBEAFE' },
  ['camera', 'photo', 'snapshot', 'image', 'social'],
  ({ rect, fillRect, fillCircle, ring }) => {
    // body
    fillRect(2, 5, 12, 8, 'G');
    rect(2, 5, 12, 8, 'D');
    // top bump
    fillRect(6, 3, 4, 2, 'D');
    // lens
    fillCircle(8, 9, 2.5, 'L');
    ring(8, 9, 2.5, 'D', 0.5);
    // flash
    fillRect(3, 6, 2, 1, 'C');
  }
);

export const Eye = createIcon(
  'eye',
  { W: '#E5E7EB', B: '#3B82F6', D: '#1E3A5F', P: '#1E293B' },
  ['eye', 'view', 'watch', 'visible', 'social'],
  ({ fillCircle, ring, line, set }) => {
    // eye shape
    line(1, 8, 7, 4, 'W');
    line(14, 8, 8, 4, 'W');
    line(1, 8, 7, 12, 'W');
    line(14, 8, 8, 12, 'W');
    // fill eye
    for (let y = 5; y <= 11; y++) {
      const dy = Math.abs(y - 8);
      const hw = Math.max(0, Math.floor(7 - dy * 1.2));
      for (let x = 8 - hw; x <= 7 + hw; x++) set(x, y, 'W');
    }
    // iris
    fillCircle(7.5, 8, 2.5, 'B');
    // pupil
    fillCircle(7.5, 8, 1.2, 'P');
    set(7, 7, 'D');
  }
);

export const EyeOff = createIcon(
  'eye-off',
  { W: '#9CA3AF', B: '#6B7280', R: '#EF4444' },
  ['eye-off', 'hidden', 'invisible', 'private', 'social'],
  ({ line, ring, set }) => {
    // simplified closed eye
    line(2, 8, 7, 5, 'W');
    line(13, 8, 8, 5, 'W');
    line(2, 8, 7, 11, 'W');
    line(13, 8, 8, 11, 'W');
    ring(7.5, 8, 2.4, 'B', 0.8);
    // strike-through
    line(3, 3, 12, 13, 'R');
    line(4, 3, 13, 13, 'R');
  }
);

export const AtSign = createIcon(
  'at-sign',
  { B: '#06B6D4', D: '#0891B2' },
  ['at', 'email', 'mention', 'address', 'social'],
  ({ ring, fillCircle, line }) => {
    ring(7.5, 7.5, 6, 'B');
    ring(7.5, 7.5, 3, 'D', 0.8);
    fillCircle(7.5, 7.5, 1.5, 'B');
    line(10, 6, 10, 10, 'D');
    line(10, 10, 12, 10, 'D');
  }
);

export const Hashtag = createIcon(
  'hashtag',
  { B: '#8B5CF6', C: '#C4B5FD' },
  ['hashtag', 'tag', 'trending', 'topic', 'social'],
  ({ line }) => {
    // vertical bars
    line(5, 2, 4, 13, 'B');
    line(10, 2, 9, 13, 'B');
    // horizontal bars
    line(2, 5, 13, 5, 'C');
    line(2, 10, 13, 10, 'C');
  }
);

export const Globe = createIcon(
  'globe',
  { B: '#3B82F6', C: '#93C5FD', G: '#22C55E' },
  ['globe', 'world', 'web', 'international', 'social'],
  ({ ring, line, fillCircle }) => {
    ring(7.5, 7.5, 6, 'B');
    // meridians
    line(8, 2, 8, 14, 'C');
    // equator
    line(2, 8, 14, 8, 'C');
    // curve left
    line(5, 3, 4, 8, 'C');
    line(4, 8, 5, 13, 'C');
    // curve right
    line(11, 3, 12, 8, 'C');
    line(12, 8, 11, 13, 'C');
    // continents hint
    fillCircle(6, 6, 1.2, 'G');
    fillCircle(10, 9, 1.5, 'G');
  }
);

export const Pin = createIcon(
  'pin',
  { R: '#EF4444', D: '#B91C1C', C: '#FECACA' },
  ['pin', 'location', 'map', 'place', 'social'],
  ({ fillCircle, ring, line, set }) => {
    fillCircle(8, 6, 3.5, 'R');
    ring(8, 6, 3.5, 'D', 0.5);
    fillCircle(8, 6, 1.5, 'C');
    // point
    line(5, 9, 8, 14, 'R');
    line(11, 9, 8, 14, 'R');
    for (let y = 10; y <= 13; y++) {
      const hw = Math.max(0, 13 - y);
      for (let x = 8 - hw; x <= 8 + hw; x++) set(x, y, 'R');
    }
    set(8, 14, 'D');
  }
);

export const SocialStar = createIcon(
  'social-star',
  { Y: '#FBBF24', D: '#D97706' },
  ['star', 'rating', 'favorite', 'featured', 'social'],
  ({ set }) => {
    // 5-pointed star drawn pixel by pixel
    const rows: [number, number[]][] = [
      [2, [7, 8]],
      [3, [7, 8]],
      [4, [6, 7, 8, 9]],
      [5, [5, 6, 7, 8, 9, 10]],
      [6, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
      [7, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
      [8, [4, 5, 6, 7, 8, 9, 10, 11]],
      [9, [4, 5, 6, 7, 8, 9, 10, 11]],
      [10, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
      [11, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
      [12, [2, 3, 4, 5, 10, 11, 12, 13]],
      [13, [2, 3, 12, 13]],
    ];
    for (const [y, xs] of rows) {
      for (const x of xs) set(x, y, 'Y');
    }
    // edges
    set(7, 2, 'D'); set(8, 2, 'D');
    set(2, 6, 'D'); set(13, 6, 'D');
    set(2, 12, 'D'); set(3, 13, 'D');
    set(13, 12, 'D'); set(12, 13, 'D');
  }
);

export const SocialFire = createIcon(
  'social-fire',
  { R: '#EF4444', O: '#F97316', Y: '#FBBF24' },
  ['fire', 'hot', 'trending', 'popular', 'social'],
  ({ set }) => {
    const rows: [number, [number, string][]][] = [
      [2, [[8, 'R']]],
      [3, [[7, 'R'], [8, 'R']]],
      [4, [[7, 'R'], [8, 'O'], [9, 'R']]],
      [5, [[6, 'R'], [7, 'O'], [8, 'O'], [9, 'R']]],
      [6, [[5, 'R'], [6, 'O'], [7, 'O'], [8, 'Y'], [9, 'O'], [10, 'R']]],
      [7, [[5, 'R'], [6, 'O'], [7, 'Y'], [8, 'Y'], [9, 'O'], [10, 'R']]],
      [8, [[4, 'R'], [5, 'O'], [6, 'Y'], [7, 'Y'], [8, 'Y'], [9, 'O'], [10, 'O'], [11, 'R']]],
      [9, [[4, 'R'], [5, 'O'], [6, 'Y'], [7, 'Y'], [8, 'Y'], [9, 'Y'], [10, 'O'], [11, 'R']]],
      [10, [[4, 'R'], [5, 'O'], [6, 'O'], [7, 'Y'], [8, 'Y'], [9, 'O'], [10, 'O'], [11, 'R']]],
      [11, [[5, 'R'], [6, 'O'], [7, 'O'], [8, 'O'], [9, 'O'], [10, 'R']]],
      [12, [[5, 'R'], [6, 'R'], [7, 'O'], [8, 'O'], [9, 'R'], [10, 'R']]],
      [13, [[6, 'R'], [7, 'R'], [8, 'R'], [9, 'R']]],
    ];
    for (const [y, pixels] of rows) {
      for (const [x, c] of pixels) set(x, y, c);
    }
  }
);

export const Verified = createIcon(
  'verified',
  { B: '#3B82F6', C: '#FFFFFF' },
  ['verified', 'check', 'badge', 'authentic', 'social'],
  ({ fillCircle, ring, line }) => {
    fillCircle(7.5, 7.5, 5.5, 'B');
    ring(7.5, 7.5, 6.5, 'B', 0.8);
    // spikes
    for (const [x, y] of [[8, 1], [8, 14], [1, 8], [14, 8], [3, 3], [12, 3], [3, 12], [12, 12]] as [number, number][]) {
      fillCircle(x, y, 1.2, 'B');
    }
    // check
    line(5, 8, 7, 10, 'C');
    line(7, 10, 11, 5, 'C');
    line(5, 7, 7, 9, 'C');
  }
);

export const Comment = createIcon(
  'comment',
  { B: '#6366F1', C: '#C7D2FE' },
  ['comment', 'reply', 'discussion', 'feedback', 'social'],
  ({ rect, fillRect, line }) => {
    fillRect(2, 3, 12, 8, 'B');
    rect(2, 3, 12, 8, 'B');
    // tail
    line(4, 11, 3, 13, 'B');
    line(4, 11, 7, 13, 'B');
    fillRect(3, 11, 5, 1, 'B');
    // text lines
    line(4, 5, 11, 5, 'C');
    line(4, 7, 9, 7, 'C');
    line(4, 9, 7, 9, 'C');
  }
);

export const Repost = createIcon(
  'repost',
  { G: '#22C55E', D: '#16A34A' },
  ['repost', 'retweet', 'recycle', 'repeat', 'social'],
  ({ line, set }) => {
    // top arrow going right
    line(3, 4, 12, 4, 'G');
    line(12, 4, 10, 2, 'G');
    line(12, 4, 10, 6, 'G');
    // right side down
    line(12, 4, 12, 8, 'G');
    // bottom arrow going left
    line(13, 11, 4, 11, 'D');
    line(4, 11, 6, 9, 'D');
    line(4, 11, 6, 13, 'D');
    // left side up
    line(4, 11, 4, 7, 'D');
  }
);

export const Notification = createIcon(
  'notification',
  { R: '#EF4444', C: '#FFFFFF' },
  ['notification', 'alert', 'badge', 'count', 'social'],
  ({ fillCircle, ring, set }) => {
    fillCircle(7.5, 7.5, 5.5, 'R');
    ring(7.5, 7.5, 6.2, 'R', 0.6);
    // exclamation mark
    set(8, 4, 'C');
    set(8, 5, 'C');
    set(8, 6, 'C');
    set(8, 7, 'C');
    set(8, 8, 'C');
    set(8, 10, 'C');
    set(8, 11, 'C');
  }
);

export const SocialIcons: PxlKitData[] = [
  Heart,
  HeartBroken,
  ThumbsUp,
  ThumbsDown,
  User,
  UserGroup,
  Share,
  Bookmark,
  Camera,
  Eye,
  EyeOff,
  AtSign,
  Hashtag,
  Globe,
  Pin,
  SocialStar,
  SocialFire,
  Verified,
  Comment,
  Repost,
  Notification,
];
