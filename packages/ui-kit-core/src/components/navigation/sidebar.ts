/**
 * PixelSidebar — a vertical navigation rail in a `<nav>` landmark: an
 * optional header row with a collapse toggle, titled sections of items (links
 * or buttons, nested up to two levels, with an optional badge) and an
 * optional footer. Collapsed, the rail narrows to the icons: labels become
 * visually hidden and name the items through `aria-label` and `title`.
 */
import { cn, focusRing, surfaceClasses, type Surface } from '../../common';
import { tone, type ToneKey } from '../../tokens';

/** The `<nav>`, narrow while collapsed. */
export function sidebarClasses(surface: Surface, collapsed: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex h-full flex-col bg-retro-bg/40',
    s.border,
    'border-retro-border/40',
    collapsed ? 'w-14' : 'w-56',
    s.transition,
  );
}

/** The header row, holding the header content and the collapse toggle. */
export function sidebarHeaderClasses(collapsed: boolean): string {
  return cn('flex items-center gap-2 border-b border-retro-border/30 px-2 py-2', collapsed && 'justify-center');
}

/** The header content, hidden while collapsed. */
export const sidebarHeaderContentClasses = 'min-w-0 flex-1';

/** The collapse toggle. */
export function sidebarToggleClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'inline-flex h-7 w-7 items-center justify-center text-retro-muted hover:text-retro-text',
    s.border,
    s.radius,
    s.font,
    focusRing,
    'focus-visible:ring-retro-cyan/40',
    'border-retro-border/40',
  );
}

/** What the collapse toggle does, as its accessible name. */
export function sidebarToggleLabel(collapsed: boolean): string {
  return collapsed ? 'Expand sidebar' : 'Collapse sidebar';
}

/** The arrow drawn in the collapse toggle, pointing the way the rail will move. */
export function sidebarToggleArrow(collapsed: boolean): string {
  return collapsed ? '>' : '<';
}

/** The arrow in the collapse toggle, hidden from assistive technology. */
export const sidebarToggleArrowClasses = 'text-[10px]';

/** The scrolling area that holds the sections. */
export const sidebarBodyClasses = 'flex-1 overflow-y-auto py-2';

/** The label of a section; `title` is its deprecated alias. */
export function sidebarSectionLabel(section: { label?: string; title?: string }): string | undefined {
  return section.label ?? section.title;
}

/** A section, spaced from the one before it. */
export function sidebarSectionClasses(index: number): string {
  return cn(index > 0 && 'mt-3');
}

/** The heading of a section, hidden while collapsed. */
export function sidebarSectionTitleClasses(surface: Surface): string {
  return cn('px-3 pb-1 text-[10px] uppercase tracking-wider text-retro-muted', surfaceClasses(surface).fontDisplay);
}

/** The items of a section. */
export const sidebarListClasses = 'space-y-0.5 px-1';

/** The items nested under an item, hidden while collapsed. */
export const sidebarNestedListClasses = 'mt-1 space-y-0.5';

/** Left padding of an item per nesting depth. */
export const sidebarDepthClasses = ['pl-2', 'pl-6', 'pl-10'] as const;

export interface SidebarItemState {
  /** 0 for the items of a section, 1 and 2 for nested ones. */
  depth: number;
  active: boolean;
  collapsed: boolean;
}

/** The link or button of an item; the active one is cyan. */
export function sidebarItemClasses(surface: Surface, { depth, active, collapsed }: SidebarItemState): string {
  const s = surfaceClasses(surface);
  return cn(
    'group relative flex w-full items-center gap-2 pr-2 py-2 text-xs focus-visible:outline-hidden',
    sidebarDepthClasses[Math.min(depth, 2)],
    s.font,
    s.radius,
    s.transition,
    focusRing,
    'focus-visible:ring-retro-cyan/40',
    active ? cn('bg-retro-cyan/15 text-retro-cyan', tone.cyan.border) : 'text-retro-text hover:bg-retro-surface/60',
    'border border-transparent',
    collapsed && 'justify-center pr-0 pl-0',
  );
}

/** The icon of an item, hidden from assistive technology. */
export const sidebarItemIconClasses = 'inline-flex h-4 w-4 shrink-0 items-center justify-center';

/** The label of an item, visually hidden while collapsed. */
export function sidebarItemLabelClasses(collapsed: boolean): string {
  return cn('truncate', collapsed && 'sr-only');
}

/** The badge at the end of an item, in its tone (neutral by default); hidden while collapsed. */
export function sidebarBadgeClasses(surface: Surface, badgeTone: ToneKey = 'neutral'): string {
  const s = surfaceClasses(surface);
  const t = tone[badgeTone];
  return cn(
    'ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold',
    s.border,
    s.radiusFull,
    s.font,
    t.bg,
    t.border,
    t.text,
  );
}

/** The footer row. */
export function sidebarFooterClasses(collapsed: boolean): string {
  return cn('border-t border-retro-border/30 px-2 py-2', collapsed && 'flex justify-center');
}
