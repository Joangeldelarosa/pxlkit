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

export const WarningTriangle = createIcon(
  'warning-triangle',
  { Y: '#FFB020', D: '#8A5A00', C: '#FFFFFF' },
  ['warning', 'alert', 'caution', 'risk', 'toast', 'status'],
  ({ line, fillRect, set }) => {
    line(8, 2, 2, 13, 'Y');
    line(8, 2, 13, 13, 'Y');
    line(2, 13, 13, 13, 'D');
    fillRect(7, 6, 2, 4, 'C');
    set(8, 11, 'C');
  }
);

export const ErrorOctagon = createIcon(
  'error-octagon',
  { R: '#E03131', C: '#FFFFFF' },
  ['error', 'stop', 'danger', 'critical', 'toast', 'status'],
  ({ line, fillRect }) => {
    line(5, 2, 10, 2, 'R');
    line(3, 4, 3, 11, 'R');
    line(12, 4, 12, 11, 'R');
    line(5, 13, 10, 13, 'R');
    line(4, 3, 3, 4, 'R');
    line(11, 3, 12, 4, 'R');
    line(3, 11, 4, 12, 'R');
    line(12, 11, 11, 12, 'R');
    fillRect(7, 5, 2, 5, 'C');
    fillRect(7, 11, 2, 2, 'C');
  }
);

export const Bell = createIcon(
  'bell',
  { O: '#FFD700', D: '#B8860B', C: '#FFFFFF' },
  ['bell', 'notification', 'alert', 'ring', 'toast', 'status'],
  ({ rect, fillRect, ring, set }) => {
    ring(7.5, 7, 4.5, 'O', 1.1);
    fillRect(4, 6, 8, 5, 'O');
    rect(4, 6, 8, 5, 'D');
    fillRect(6, 12, 4, 1, 'D');
    set(7, 13, 'C');
    set(8, 13, 'C');
  }
);

export const NotificationDot = createIcon(
  'notification-dot',
  { B: '#29ADFF', R: '#FF3B30', C: '#FFFFFF' },
  ['notification', 'badge', 'dot', 'unread', 'indicator', 'toast'],
  ({ rect, fillCircle }) => {
    rect(2, 3, 12, 10, 'B');
    fillCircle(11, 4, 2, 'R');
    fillCircle(11, 4, 1, 'C');
  }
);

export const MessageSquare = createIcon(
  'message-square',
  { B: '#29ADFF', C: '#FFFFFF' },
  ['message', 'chat', 'comment', 'support', 'toast', 'ui'],
  ({ rect, line }) => {
    rect(2, 3, 12, 9, 'B');
    line(6, 11, 4, 14, 'B');
    line(6, 11, 8, 14, 'B');
    line(4, 6, 11, 6, 'C');
    line(4, 8, 10, 8, 'C');
  }
);

export const ChatDots = createIcon(
  'chat-dots',
  { P: '#8B5CF6', C: '#FFFFFF' },
  ['chat', 'typing', 'conversation', 'message', 'toast', 'ui'],
  ({ rect, set }) => {
    rect(2, 4, 12, 8, 'P');
    set(5, 8, 'C');
    set(8, 8, 'C');
    set(11, 8, 'C');
    set(4, 12, 'P');
    set(3, 13, 'P');
  }
);

export const Mail = createIcon(
  'mail',
  { B: '#4ECDC4', C: '#FFFFFF', D: '#2C7A7B' },
  ['mail', 'email', 'inbox', 'message', 'toast', 'ui'],
  ({ rect, line, fillRect }) => {
    rect(2, 4, 12, 8, 'B');
    line(2, 4, 8, 9, 'D');
    line(13, 4, 8, 9, 'D');
    line(2, 11, 7, 7, 'C');
    line(13, 11, 8, 7, 'C');
    fillRect(7, 7, 2, 2, 'C');
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
  { B: '#4ECDC4', D: '#2B6B67', C: '#FFFFFF' },
  ['shield', 'check', 'safe', 'trusted', 'toast', 'security'],
  ({ line }) => {
    line(4, 3, 11, 3, 'B');
    line(4, 3, 4, 10, 'B');
    line(11, 3, 11, 10, 'B');
    line(4, 10, 8, 13, 'D');
    line(11, 10, 8, 13, 'D');
    line(6, 8, 8, 10, 'C');
    line(8, 10, 10, 6, 'C');
  }
);

export const ShieldAlert = createIcon(
  'shield-alert',
  { B: '#FFB020', D: '#8A5A00', C: '#FFFFFF' },
  ['shield', 'alert', 'warning', 'security', 'toast', 'risk'],
  ({ line, fillRect, set }) => {
    line(4, 3, 11, 3, 'B');
    line(4, 3, 4, 10, 'B');
    line(11, 3, 11, 10, 'B');
    line(4, 10, 8, 13, 'D');
    line(11, 10, 8, 13, 'D');
    fillRect(7, 6, 2, 4, 'C');
    set(8, 11, 'C');
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
  ({ line, set }) => {
    line(8, 2, 8, 6, 'Y');
    line(6, 4, 10, 4, 'Y');
    line(8, 10, 8, 14, 'Y');
    line(6, 12, 10, 12, 'Y');
    set(3, 6, 'C');
    set(12, 7, 'C');
    set(4, 11, 'C');
    set(13, 3, 'C');
  }
);

export const Megaphone = createIcon(
  'megaphone',
  { R: '#FF6B6B', D: '#B23A3A', C: '#FFFFFF' },
  ['megaphone', 'announce', 'broadcast', 'notice', 'toast', 'ui'],
  ({ line, fillRect, set }) => {
    line(4, 8, 11, 5, 'R');
    line(4, 9, 11, 11, 'R');
    line(11, 5, 13, 5, 'D');
    line(11, 11, 13, 11, 'D');
    line(13, 5, 13, 11, 'D');
    fillRect(3, 8, 2, 2, 'R');
    line(5, 10, 6, 13, 'D');
    line(7, 9, 8, 13, 'C');
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
