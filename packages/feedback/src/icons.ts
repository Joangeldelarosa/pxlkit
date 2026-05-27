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
const CATEGORY = 'feedback';

function createGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => '.'));
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

export function createIcon(
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
    let currentX = x0;
    let currentY = y0;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      set(currentX, currentY, char);
      if (currentX === x1 && currentY === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        currentX += sx;
      }
      if (e2 <= dx) {
        err += dx;
        currentY += sy;
      }
    }
  }

  function rect(x: number, y: number, w: number, h: number, char: string) {
    for (let px = x; px < x + w; px += 1) {
      set(px, y, char);
      set(px, y + h - 1, char);
    }
    for (let py = y; py < y + h; py += 1) {
      set(x, py, char);
      set(x + w - 1, py, char);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, char: string) {
    for (let py = y; py < y + h; py += 1) {
      for (let px = x; px < x + w; px += 1) {
        set(px, py, char);
      }
    }
  }

  function ring(cx: number, cy: number, radius: number, char: string, thickness = 1.25) {
    for (let py = 0; py < SIZE; py += 1) {
      for (let px = 0; px < SIZE; px += 1) {
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= radius - thickness && dist <= radius + thickness) {
          set(px, py, char);
        }
      }
    }
  }

  function fillCircle(cx: number, cy: number, radius: number, char: string) {
    for (let py = 0; py < SIZE; py += 1) {
      for (let px = 0; px < SIZE; px += 1) {
        const dx = px - cx;
        const dy = py - cy;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          set(px, py, char);
        }
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

// ─── Shared shield silhouette (unifies the shield-* family) ───
const SHIELD_ROWS = [
  '................',
  '................',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '....SSSSSSSS....',
  '....SSSSSSSS....',
  '.....SSSSSS.....',
  '......SSSS......',
  '.......SS.......',
  '................',
  '................',
];

const SHIELD_RIM: ReadonlyArray<readonly [number, number]> = [
  [4, 9], [11, 9], [4, 10], [11, 10], [5, 11], [10, 11], [6, 12], [9, 12], [7, 13], [8, 13],
];

/**
 * Stamp the shared filled-shield silhouette (`fill`) with a darker beveled
 * lower rim (`rim`). Every shield-* icon uses this so the family is coherent.
 */
export function paintShield(
  set: (x: number, y: number, char: string) => void,
  fill: string,
  rim: string
) {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (SHIELD_ROWS[y][x] === 'S') set(x, y, fill);
    }
  }
  for (const [x, y] of SHIELD_RIM) set(x, y, rim);
}

export const CheckCircle = createIcon(
  'check-circle',
  { O: '#00CC66', C: '#FFFFFF' },
  ['check', 'success', 'done', 'confirm', 'toast', 'status'],
  ({ ring, line }) => {
    ring(7.5, 7.5, 6, 'O');
    line(4, 8, 7, 11, 'C');
    line(7, 11, 12, 5, 'C');
  }
);

export const XCircle = createIcon(
  'x-circle',
  { O: '#FF4D4D', C: '#FFFFFF' },
  ['close', 'error', 'cancel', 'dismiss', 'toast', 'status'],
  ({ ring, line }) => {
    ring(7.5, 7.5, 6, 'O');
    line(5, 5, 11, 11, 'C');
    line(11, 5, 5, 11, 'C');
  }
);

export const InfoCircle = createIcon(
  'info-circle',
  { O: '#29ADFF', C: '#FFFFFF' },
  ['info', 'help', 'about', 'details', 'toast', 'status'],
  ({ ring, fillRect, set }) => {
    ring(7.5, 7.5, 6, 'O');
    set(8, 4, 'C');
    fillRect(7, 6, 2, 5, 'C');
  }
);

const TRIANGLE_SPAN: Record<number, [number, number]> = {
  2: [7, 8], 3: [6, 9], 4: [6, 9], 5: [5, 10], 6: [5, 10], 7: [4, 11],
  8: [4, 11], 9: [3, 12], 10: [3, 12], 11: [2, 13], 12: [2, 13], 13: [1, 14],
};

export const WarningTriangle = createIcon(
  'warning-triangle',
  { Y: '#FFB020', D: '#8A5A00', C: '#FFFFFF' },
  ['warning', 'alert', 'caution', 'risk', 'toast', 'status'],
  ({ set, fillRect }) => {
    // filled, centered, symmetric triangle with a dark border
    for (let y = 2; y <= 13; y += 1) {
      const [l, r] = TRIANGLE_SPAN[y];
      for (let x = l; x <= r; x += 1) {
        set(x, y, x === l || x === r || y === 13 ? 'D' : 'Y');
      }
    }
    // white "!" knockout
    fillRect(7, 6, 2, 4, 'C');
    fillRect(7, 11, 2, 1, 'C');
  }
);

export const ErrorOctagon = createIcon(
  'error-octagon',
  { R: '#E03131', C: '#FFFFFF' },
  ['error', 'stop', 'danger', 'critical', 'toast', 'status'],
  ({ set, fillRect }) => {
    // filled octagon (stop sign) — chamfered square, symmetric
    const span: Record<number, [number, number]> = {
      2: [5, 10], 3: [4, 11], 4: [3, 12], 5: [2, 13], 6: [2, 13], 7: [2, 13],
      8: [2, 13], 9: [2, 13], 10: [2, 13], 11: [3, 12], 12: [4, 11], 13: [5, 10],
    };
    for (let y = 2; y <= 13; y += 1) {
      const [l, r] = span[y];
      for (let x = l; x <= r; x += 1) set(x, y, 'R');
    }
    // white "!" knockout
    fillRect(7, 5, 2, 4, 'C');
    fillRect(7, 10, 2, 1, 'C');
  }
);

export const Bell = createIcon(
  'bell',
  { O: '#FFD700', D: '#B8860B' },
  ['bell', 'notification', 'alert', 'ring', 'toast', 'status'],
  ({ set }) => {
    // rounded dome with a top knob, near-vertical sides, flared rim + clapper
    const dome: Record<number, [number, number]> = {
      2: [7, 8], 3: [6, 9], 4: [5, 10], 5: [5, 10], 6: [4, 11], 7: [4, 11], 8: [4, 11], 9: [4, 11], 10: [3, 12],
    };
    for (let y = 2; y <= 10; y += 1) {
      const [l, r] = dome[y];
      for (let x = l; x <= r; x += 1) set(x, y, 'O');
    }
    for (let x = 2; x <= 13; x += 1) set(x, 11, 'O'); // flared rim
    for (let x = 3; x <= 12; x += 1) set(x, 12, 'D'); // rim shadow
    set(7, 13, 'D');
    set(8, 13, 'D'); // clapper
  }
);

export const NotificationDot = createIcon(
  'notification-dot',
  { B: '#29ADFF', D: '#1C6FA8', R: '#FF3B30', C: '#FFFFFF' },
  ['notification', 'badge', 'dot', 'unread', 'indicator', 'toast'],
  ({ fillRect, rect, fillCircle }) => {
    // app tile (filled, rounded-ish) with a darker rim
    fillRect(2, 5, 9, 9, 'B');
    rect(2, 5, 9, 9, 'D');
    // unread badge: white-bordered red dot, top-right corner
    fillCircle(12, 4, 3, 'C');
    fillCircle(12, 4, 2, 'R');
  }
);

export const MessageSquare = createIcon(
  'message-square',
  { B: '#29ADFF', C: '#FFFFFF' },
  ['message', 'chat', 'comment', 'support', 'toast', 'ui'],
  ({ fillRect, set }) => {
    // filled bubble + tail + two white text lines
    fillRect(2, 3, 12, 8, 'B');
    set(4, 11, 'B');
    set(5, 11, 'B');
    set(4, 12, 'B');
    fillRect(4, 5, 8, 1, 'C');
    fillRect(4, 7, 6, 1, 'C');
  }
);

export const ChatDots = createIcon(
  'chat-dots',
  { P: '#8B5CF6', C: '#FFFFFF' },
  ['chat', 'typing', 'conversation', 'message', 'toast', 'ui'],
  ({ fillRect, set }) => {
    // filled bubble + tail + three centered dots
    fillRect(2, 3, 12, 8, 'P');
    set(4, 11, 'P');
    set(5, 11, 'P');
    set(4, 12, 'P');
    fillRect(4, 6, 2, 2, 'C');
    fillRect(7, 6, 2, 2, 'C');
    fillRect(10, 6, 2, 2, 'C');
  }
);

export const Mail = createIcon(
  'mail',
  { B: '#4ECDC4', C: '#FFFFFF', D: '#2C7A7B' },
  ['mail', 'email', 'inbox', 'message', 'toast', 'ui'],
  ({ fillRect, rect, line }) => {
    // filled envelope + dark border + white flap V
    fillRect(2, 4, 12, 9, 'B');
    rect(2, 4, 12, 9, 'D');
    line(3, 5, 8, 9, 'C');
    line(12, 5, 8, 9, 'C');
  }
);

export const Send = createIcon(
  'send',
  { B: '#29ADFF', C: '#FFFFFF' },
  ['send', 'paper-plane', 'message', 'forward', 'toast', 'ui'],
  ({ line, fillRect, set }) => {
    line(2, 8, 13, 2, 'B');
    line(2, 8, 13, 13, 'B');
    line(13, 2, 10, 8, 'B');
    line(13, 13, 10, 8, 'B');
    fillRect(6, 7, 5, 2, 'C');
    set(11, 8, 'B');
  }
);

export const Link = createIcon(
  'link',
  { C: '#00D1B2', D: '#008F7A' },
  ['link', 'chain', 'url', 'attach', 'toast', 'ui'],
  ({ ring, line }) => {
    ring(5.5, 8, 3.2, 'C', 0.9);
    ring(10.5, 8, 3.2, 'C', 0.9);
    line(6, 8, 10, 8, 'D');
    line(6, 9, 10, 9, 'D');
  }
);

export const Unlink = createIcon(
  'unlink',
  { C: '#00D1B2', R: '#FF4D4D' },
  ['unlink', 'broken-link', 'detach', 'remove', 'toast', 'ui'],
  ({ ring, line }) => {
    ring(5.5, 8, 3.2, 'C', 0.9);
    ring(10.5, 8, 3.2, 'C', 0.9);
    line(4, 12, 12, 4, 'R');
    line(4, 11, 11, 4, 'R');
  }
);

export const Lock = createIcon(
  'lock',
  { Y: '#FFD700', D: '#B8860B', C: '#FFFFFF' },
  ['lock', 'secure', 'private', 'auth', 'toast', 'ui'],
  ({ rect, ring, fillRect, set }) => {
    ring(7.5, 5, 3.2, 'D', 1.1);
    fillRect(4, 7, 8, 6, 'Y');
    rect(4, 7, 8, 6, 'D');
    set(8, 9, 'C');
    fillRect(7, 10, 2, 2, 'C');
  }
);

export const Unlock = createIcon(
  'unlock',
  { Y: '#FFD700', D: '#B8860B', C: '#FFFFFF' },
  ['unlock', 'open', 'access', 'auth', 'toast', 'ui'],
  ({ rect, line, fillRect, set }) => {
    line(4, 6, 4, 3, 'D');
    line(4, 3, 8, 3, 'D');
    line(8, 3, 9, 5, 'D');
    fillRect(4, 7, 8, 6, 'Y');
    rect(4, 7, 8, 6, 'D');
    set(8, 9, 'C');
    fillRect(7, 10, 2, 2, 'C');
  }
);

export const ShieldCheck = createIcon(
  'shield-check',
  { S: '#00CC66', D: '#008844', C: '#FFFFFF' },
  ['shield', 'check', 'safe', 'trusted', 'toast', 'security'],
  ({ set, line }) => {
    paintShield(set, 'S', 'D');
    line(5, 8, 7, 10, 'C');
    line(7, 10, 11, 5, 'C');
  }
);

export const ShieldAlert = createIcon(
  'shield-alert',
  { S: '#FFB020', D: '#8A5A00', C: '#FFFFFF' },
  ['shield', 'alert', 'warning', 'security', 'toast', 'risk'],
  ({ set, fillRect }) => {
    paintShield(set, 'S', 'D');
    fillRect(7, 5, 2, 4, 'C');
    fillRect(7, 10, 2, 1, 'C');
  }
);

export const Clock = createIcon(
  'clock',
  { B: '#29ADFF', C: '#FFFFFF', D: '#1C5E99' },
  ['clock', 'time', 'timer', 'schedule', 'toast', 'ui'],
  ({ ring, line, set }) => {
    ring(7.5, 7.5, 6, 'B');
    line(8, 8, 8, 4, 'C');
    line(8, 8, 11, 9, 'C');
    set(8, 8, 'D');
  }
);

export const Sparkles = createIcon(
  'sparkles',
  { Y: '#FFE066', C: '#FFFFFF' },
  ['sparkles', 'shine', 'magic', 'highlight', 'toast', 'ui'],
  ({ set, fillRect }) => {
    // one big diamond sparkle (centered) + two small accent sparkles
    const diamond: Record<number, [number, number]> = {
      3: [7, 8], 4: [6, 9], 5: [5, 10], 6: [4, 11], 7: [5, 10], 8: [6, 9], 9: [7, 8],
    };
    for (let y = 3; y <= 9; y += 1) {
      const [l, r] = diamond[y];
      for (let x = l; x <= r; x += 1) set(x, y, 'Y');
    }
    fillRect(12, 3, 2, 2, 'C');
    fillRect(3, 11, 2, 2, 'C');
  }
);

export const Megaphone = createIcon(
  'megaphone',
  { R: '#FF6B6B', D: '#B23A3A', C: '#FFFFFF' },
  ['megaphone', 'announce', 'broadcast', 'notice', 'toast', 'ui'],
  ({ set }) => {
    // symmetric horn opening to the right, mouthpiece nub at the left tip,
    // dark mouth rim, white sound waves off the opening
    const cone: Record<number, [number, number]> = {
      4: [8, 12], 5: [6, 12], 6: [4, 12], 7: [3, 12], 8: [3, 12], 9: [4, 12], 10: [6, 12], 11: [8, 12],
    };
    for (let y = 4; y <= 11; y += 1) {
      const [l, r] = cone[y];
      for (let x = l; x <= r; x += 1) set(x, y, 'R');
      set(r, y, 'D'); // mouth rim
    }
    set(2, 7, 'D');
    set(2, 8, 'D'); // mouthpiece
    set(14, 6, 'C');
    set(15, 5, 'C');
    set(14, 9, 'C');
    set(15, 10, 'C'); // sound waves
  }
);

export const FeedbackIcons: PxlKitData[] = [
  CheckCircle,
  XCircle,
  InfoCircle,
  WarningTriangle,
  ErrorOctagon,
  Bell,
  NotificationDot,
  MessageSquare,
  ChatDots,
  Mail,
  Send,
  Link,
  Unlink,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Megaphone,
];
