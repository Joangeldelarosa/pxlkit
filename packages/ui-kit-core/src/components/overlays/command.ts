/**
 * PixelCommand — the command palette: a search field over grouped commands,
 * opened and closed by a global keyboard shortcut. The shortcut, the search
 * and the list of rows the palette renders are shared by every kit, next to
 * its class recipes.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** A parsed keyboard shortcut such as `mod+k` or `mod+shift+p`. */
export interface CommandShortcut {
  /** The key, lower-cased. */
  key: string;
  /** Cmd or Ctrl — either one matches, so `mod+k` works on every platform. */
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

/**
 * Parse a shortcut written as `+`-separated parts, in any case: `mod`, `cmd`,
 * `ctrl` or `meta`; `shift`; `alt`, `opt` or `option`; and the key itself.
 */
export function parseCommandShortcut(shortcut: string): CommandShortcut {
  const parsed: CommandShortcut = { key: '', mod: false, shift: false, alt: false };
  for (const part of shortcut.toLowerCase().split('+').map((p) => p.trim())) {
    if (part === 'mod' || part === 'cmd' || part === 'ctrl' || part === 'meta') parsed.mod = true;
    else if (part === 'shift') parsed.shift = true;
    else if (part === 'alt' || part === 'opt' || part === 'option') parsed.alt = true;
    else parsed.key = part;
  }
  return parsed;
}

/** The key and modifier state of a key press — what a `KeyboardEvent` carries. */
export interface CommandKeyPress {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** Whether a key press is the shortcut: its key, with exactly its modifiers. */
export function matchesCommandShortcut(press: CommandKeyPress, shortcut: CommandShortcut): boolean {
  return (
    press.key.toLowerCase() === shortcut.key &&
    (press.metaKey || press.ctrlKey) === shortcut.mod &&
    press.shiftKey === shortcut.shift &&
    press.altKey === shortcut.alt
  );
}

/** What the search reads of a command. */
export interface CommandSearchable {
  id: string;
  label: string;
  keywords?: readonly string[];
}

/** Whether a command matches the query: its label or one of its keywords contains it, in any case. */
export function commandMatches(item: CommandSearchable, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  return item.keywords?.some((keyword) => keyword.toLowerCase().includes(q)) ?? false;
}

/** A group of commands under a heading. */
export interface CommandGroupOf<I> {
  heading: string;
  items: readonly I[];
}

/**
 * A row of the palette's list: a group heading, or a command with its
 * position among the listed commands (the keyboard highlight's index).
 */
export type CommandRow<I> =
  | { kind: 'heading'; heading: string; key: string }
  | { kind: 'item'; item: I; index: number; key: string };

/**
 * The palette's list for a query: the matching commands under their group's
 * heading — groups without a match are left out — and the matching commands
 * alone, in order.
 */
export function commandRows<I extends CommandSearchable>(
  groups: readonly CommandGroupOf<I>[],
  query: string,
): { rows: CommandRow<I>[]; items: I[] } {
  const rows: CommandRow<I>[] = [];
  const items: I[] = [];
  for (const group of groups) {
    const visible = group.items.filter((item) => commandMatches(item, query));
    if (visible.length === 0) continue;
    rows.push({ kind: 'heading', heading: group.heading, key: `h-${group.heading}` });
    for (const item of visible) {
      rows.push({ kind: 'item', item, index: items.length, key: `i-${item.id}` });
      items.push(item);
    }
  }
  return { rows, items };
}

/** Id of a command's option inside the listbox. */
export function commandOptionId(listboxId: string, itemId: string): string {
  return `${listboxId}-opt-${itemId}`;
}

/** The layer that places the palette near the top of the viewport, over the backdrop. */
export const commandLayerClasses = 'fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[10vh]';

export interface CommandClasses {
  panel: string;
  /** The row of prompt and search field. */
  search: string;
  /** The `>` prompt before the field. */
  prompt: string;
  input: string;
  /** The message shown when nothing matches. */
  empty: string;
  listbox: string;
  /** A group heading in the list. */
  heading: string;
  /** A command's icon. */
  icon: string;
  /** A command's label. */
  label: string;
  /** A command's keyboard hint. */
  shortcut: string;
}

/** Classes of every part of the palette for a surface. */
export function commandClasses(surface: Surface): CommandClasses {
  const s = surfaceClasses(surface);
  return {
    panel: cn(
      'relative w-full max-w-lg bg-retro-bg shadow-2xl outline-none',
      s.border,
      s.radiusLg,
      'border-retro-border',
      'flex flex-col overflow-hidden',
    ),
    search: cn('flex items-center gap-2 px-3 py-2', surface === 'linear' ? 'border-b' : 'border-b-2', 'border-retro-border'),
    prompt: cn('text-retro-muted', s.font, 'text-xs'),
    input: cn('flex-1 bg-transparent text-sm text-retro-text outline-none placeholder:text-retro-muted', s.font),
    empty: cn('px-4 py-6 text-center text-xs text-retro-muted', s.font),
    listbox: 'max-h-[60vh] overflow-y-auto p-1',
    heading: cn('px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-retro-muted', s.font),
    icon: 'inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted',
    label: 'flex-1 truncate',
    shortcut: cn(
      'ml-2 inline-flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] text-retro-muted',
      s.border,
      s.radius,
      'border-retro-border',
      s.font,
    ),
  };
}

/** A command's option, highlighted or not. */
export function commandOptionClasses(surface: Surface, active: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-retro-text',
    s.font,
    s.radius,
    active && 'bg-retro-surface/80 text-retro-text',
    !active && 'hover:bg-retro-surface/40',
  );
}
