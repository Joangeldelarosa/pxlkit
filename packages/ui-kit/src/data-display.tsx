import React, { forwardRef, useState } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface, focusRing,
  ChevronDownIcon, CloseIcon,
} from './common';
import { PixelButton } from './actions';
import { usePxlKitLocale } from './locale';
import { tone as toneTokens, ToneKey } from './tokens';
import { PixelRibbon } from './cards/PixelRibbon';

/* ──────────────────────────────────────────────────────────────────────────
   PixelCard — container with title, icon, body, optional footer.
   Pixel surface uses thick border + offset shadow as signature.

   Upgraded (Ola 2) additively: optional tone tint, hover-interactive lift,
   media slot, badge ribbon, description with line-clamp, polymorphic <a>
   render via href, and a padding scale. Existing call sites continue to
   work unchanged.
   ────────────────────────────────────────────────────────────────────────── */

const paddingMap = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-6',
} as const;

const lineClampMap = {
  2: 'line-clamp-2 min-h-[2em]',
  3: 'line-clamp-3 min-h-[3em]',
  4: 'line-clamp-4 min-h-[4em]',
} as const;

export interface PixelCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  surface?: Surface;
  /** Optional tone tint applied to border + soft background. */
  tone?: ToneKey;
  /**
   * When true, adds a hover lift + focus ring. If no `href` is set, an
   * `onClick` is REQUIRED — the card renders with `role="button"` +
   * `tabIndex={0}` + Enter/Space activation for keyboard parity.
   */
  interactive?: boolean;
  /** Top media slot rendered above the header. Clipped by overflow:hidden. */
  media?: React.ReactNode;
  /** Corner ribbon badge — renders {@link PixelRibbon}. */
  badge?: { label: string; tone?: ToneKey };
  /** Muted paragraph rendered under the title. */
  description?: string;
  /** Apply `line-clamp-N` + `min-h-[N em]` to the description. */
  descriptionLines?: 2 | 3 | 4;
  /**
   * When provided, the root renders as `<a href>` instead of `<article>`.
   *
   * ⚠️ Nesting interactive children (PixelButton, PixelTextLink, etc.) inside
   * `footer` / `media` / `children` is invalid HTML in href mode — screen
   * readers cannot navigate nested interactives inside an anchor. Render
   * those outside the card when you need an actionable area.
   */
  href?: string;
  /** Anchor target — only meaningful when `href` is set. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  /** Anchor rel — only meaningful when `href` is set. */
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  /** Padding scale; default keeps the legacy `p-4` rhythm. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

type CardRoot = HTMLAnchorElement | HTMLElement;

function CardHeader({ children, className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn('mb-3 flex items-center gap-2 border-b border-retro-border/30 pb-3', className)}
      {...rest}
    >
      {children}
    </header>
  );
}
CardHeader.displayName = 'PixelCard.Header';

function CardBody({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1 text-sm text-retro-muted', className)} {...rest}>
      {children}
    </div>
  );
}
CardBody.displayName = 'PixelCard.Body';

function CardFooter({ children, className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn('mt-auto border-t border-retro-border/30 pt-3', className)}
      {...rest}
    >
      {children}
    </footer>
  );
}
CardFooter.displayName = 'PixelCard.Footer';

function childrenContainCardHeader(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (found) return;
    if (React.isValidElement(child)) {
      const c = child.type as { displayName?: string } | string;
      if (typeof c !== 'string' && c?.displayName === 'PixelCard.Header') {
        found = true;
      }
    }
  });
  return found;
}

const PixelCardImpl = forwardRef<CardRoot, PixelCardProps>(function PixelCard(
  {
    title,
    icon,
    children,
    footer,
    surface: surfaceProp,
    tone,
    interactive,
    media,
    badge,
    description,
    descriptionLines,
    href,
    target,
    rel,
    padding,
    onClick,
    onKeyDown,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = tone ? toneTokens[tone] : null;
  const padCls = padding ? paddingMap[padding] : 'p-4';
  const hasMedia = !!media;
  const hasBadge = !!badge;
  const hasExplicitHeader = childrenContainCardHeader(children);

  const rootCls = cn(
    'relative flex flex-col bg-retro-surface/60 transition-all',
    s.border,
    s.radiusLg,
    t ? t.border : 'border-retro-border/40 hover:border-retro-border/60',
    t ? t.soft : null,
    (hasMedia || hasBadge) && 'overflow-hidden',
    interactive && 'cursor-pointer hover:-translate-y-[2px] hover:shadow-lg',
    (interactive || href) && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
    href && 'no-underline text-inherit',
    !hasMedia && padCls,
    className,
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (!interactive || href) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
    }
  };

  const inner = (
    <>
      {hasMedia && <div className="-m-0 overflow-hidden">{media}</div>}
      {hasBadge && (
        <PixelRibbon
          position="top-right"
          tone={badge!.tone ?? 'gold'}
          surface={surface}
        >
          {badge!.label}
        </PixelRibbon>
      )}
      <div className={cn(hasMedia && padCls, 'flex flex-1 flex-col')}>
        {!hasExplicitHeader && (
          <header className={cn('flex items-center gap-2 border-b border-retro-border/30 pb-3', description ? 'mb-2' : 'mb-3')}>
            {icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>}
            <h4 className={cn('text-sm font-semibold text-retro-text', s.font)}>{title}</h4>
          </header>
        )}
        {description && (
          <p
            className={cn(
              'mb-3 text-sm text-retro-muted',
              descriptionLines ? lineClampMap[descriptionLines] : null,
            )}
          >
            {description}
          </p>
        )}
        {children !== undefined && children !== null && (
          <div className="text-sm text-retro-muted">{children}</div>
        )}
        {footer && (
          <footer className="mt-4 border-t border-retro-border/30 pt-3">{footer}</footer>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        className={rootCls}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </a>
    );
  }

  if (interactive) {
    return (
      <article
        ref={ref as React.Ref<HTMLElement>}
        className={rootCls}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {inner}
      </article>
    );
  }

  return (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className={rootCls}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {inner}
    </article>
  );
});

PixelCardImpl.displayName = 'PixelCard';

export const PixelCard = PixelCardImpl as typeof PixelCardImpl & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

PixelCard.Header = CardHeader;
PixelCard.Body = CardBody;
PixelCard.Footer = CardFooter;

/* ──────────────────────────────────────────────────────────────────────────
   PixelStatCard — compact metric card.

   Upgraded (Ola 2) additively: optional `size` (sm/md/lg) scales padding +
   font sizes; optional `iconPosition` (left/right/top/bottom-left) controls
   where the icon renders. Defaults preserve the legacy layout.
   ────────────────────────────────────────────────────────────────────────── */

export type PixelStatCardSize = 'sm' | 'md' | 'lg';
export type PixelStatCardIconPosition = 'left' | 'right' | 'top' | 'bottom-left';

export interface PixelStatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: Tone;
  trend?: string;
  surface?: Surface;
  size?: PixelStatCardSize;
  iconPosition?: PixelStatCardIconPosition;
}

export function PixelStatCard({
  label,
  value,
  icon,
  tone = 'gold',
  trend,
  surface: surfaceProp,
  size = 'md',
  iconPosition = 'top',
}: PixelStatCardProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const padding = size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4';
  const labelSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
  const valueSize =
    surface === 'pixel'
      ? (size === 'sm' ? 'text-xs font-pixel' : size === 'lg' ? 'text-lg font-pixel' : 'text-sm font-pixel')
      : (size === 'sm' ? 'text-sm font-semibold' : size === 'lg' ? 'text-2xl font-semibold' : 'text-base font-semibold');
  const trendSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
  const iconBoxSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
  const valueGap = size === 'sm' ? 'mt-1.5' : size === 'lg' ? 'mt-3' : 'mt-2';
  const trendGap = size === 'sm' ? 'mt-1.5' : size === 'lg' ? 'mt-3' : 'mt-2';

  const labelEl = <p className={cn(labelSize, 'text-retro-muted', s.font)}>{label}</p>;
  const valueEl = <p className={cn('text-retro-text', valueSize)}>{value}</p>;
  const iconEl = icon ? (
    <span className={cn('inline-flex items-center justify-center shrink-0', iconBoxSize, toneMap[tone].text)}>{icon}</span>
  ) : null;
  const trendEl = trend ? <p className={cn(trendGap, trendSize, 'text-retro-muted', s.font)}>{trend}</p> : null;

  const baseClass = cn(padding, s.border, s.radiusLg, toneMap[tone].border, toneMap[tone].soft);

  if (iconPosition === 'right') {
    return (
      <div className={cn(baseClass, 'grid grid-cols-[1fr_auto] items-center gap-3')}>
        <div>
          {labelEl}
          <div className={valueGap}>{valueEl}</div>
          {trendEl}
        </div>
        {iconEl}
      </div>
    );
  }

  if (iconPosition === 'left') {
    return (
      <div className={cn(baseClass, 'flex items-center gap-3')}>
        {iconEl}
        <div className="flex-1">
          {labelEl}
          <div className={valueGap}>{valueEl}</div>
          {trendEl}
        </div>
      </div>
    );
  }

  if (iconPosition === 'bottom-left') {
    return (
      <div className={cn(baseClass, 'relative')}>
        <div className="mb-3 flex items-center justify-between">{labelEl}</div>
        {valueEl}
        {trendEl}
        {iconEl && (
          <span className={cn('absolute bottom-0 left-0 inline-flex items-center justify-center', padding, iconBoxSize, toneMap[tone].text)}>
            {icon}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={baseClass}>
      <div className="mb-3 flex items-center justify-between">
        {labelEl}
        {iconEl}
      </div>
      {valueEl}
      {trendEl}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelTable — data table with striped rows + hover highlight.

   Upgraded (Ola 4a) additively: optional column.sortable/align/render/width,
   controlled sort with header-button + aria-sort, single/multi selection
   with checkbox column, sticky header, sticky first column, skeleton
   loading rows, empty state, row click handler, density scale. Legacy API
   (columns:{key,header,className?} + data:Record<string,ReactNode>) keeps
   rendering exactly as before.
   ────────────────────────────────────────────────────────────────────────── */

export type PixelTableDensity = 'compact' | 'normal' | 'comfortable';
export type PixelTableSortDir = 'asc' | 'desc';
export type PixelTableAlign = 'left' | 'center' | 'right';
export type PixelTableSelection = 'single' | 'multi';

export interface PixelTableColumn<Row = Record<string, React.ReactNode>> {
  key: string;
  header: React.ReactNode;
  className?: string;
  sortable?: boolean;
  align?: PixelTableAlign;
  width?: number | string;
  render?: (row: Row, idx: number) => React.ReactNode;
}

export interface PixelTableSortState {
  key: string;
  dir: PixelTableSortDir;
}

export interface PixelTableProps<Row = Record<string, React.ReactNode>> {
  columns: Array<PixelTableColumn<Row>>;
  data: Row[];
  striped?: boolean;
  surface?: Surface;
  sort?: PixelTableSortState;
  onSortChange?: (next: PixelTableSortState) => void;
  selection?: PixelTableSelection;
  selectedIds?: string[];
  onSelectionChange?: (next: string[]) => void;
  getRowId?: (row: Row, idx: number) => string;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: Row, idx: number) => void;
  density?: PixelTableDensity;
}

const tableCellPad: Record<PixelTableDensity, string> = {
  compact: 'px-3 py-1',
  normal: 'px-4 py-2.5',
  comfortable: 'px-4 py-4',
};

const alignClass: Record<PixelTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function PixelTableSortIcons({ dir }: { dir: PixelTableSortDir | null }) {
  return (
    <span aria-hidden className="inline-flex flex-col leading-none ml-1">
      <svg viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className={cn('h-2 w-2', dir === 'asc' ? 'text-retro-text' : 'text-retro-muted/50')}>
        <rect x="3" y="2" width="2" height="1" />
        <rect x="2" y="3" width="1" height="1" />
        <rect x="5" y="3" width="1" height="1" />
        <rect x="1" y="4" width="1" height="1" />
        <rect x="6" y="4" width="1" height="1" />
      </svg>
      <svg viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className={cn('h-2 w-2 -mt-0.5', dir === 'desc' ? 'text-retro-text' : 'text-retro-muted/50')}>
        <rect x="1" y="2" width="1" height="1" />
        <rect x="6" y="2" width="1" height="1" />
        <rect x="2" y="3" width="1" height="1" />
        <rect x="5" y="3" width="1" height="1" />
        <rect x="3" y="4" width="2" height="1" />
      </svg>
    </span>
  );
}

export function PixelTable<Row = Record<string, React.ReactNode>>({
  columns,
  data,
  striped = true,
  surface: surfaceProp,
  sort,
  onSortChange,
  selection,
  selectedIds,
  onSelectionChange,
  getRowId,
  stickyHeader,
  stickyFirstColumn,
  loading,
  emptyState,
  onRowClick,
  density = 'normal',
}: PixelTableProps<Row>) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const padCls = tableCellPad[density];
  const hasSelection = selection !== undefined;
  const selectedSet = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

  const resolveRowId = React.useCallback(
    (row: Row, idx: number): string => {
      if (getRowId) return getRowId(row, idx);
      const r = row as unknown as Record<string, unknown>;
      if (r && typeof r === 'object' && r.id != null) return String(r.id);
      return String(idx);
    },
    [getRowId],
  );

  const totalColCount = columns.length + (hasSelection ? 1 : 0);

  const allRowIds = React.useMemo(
    () => data.map((row, idx) => resolveRowId(row, idx)),
    [data, resolveRowId],
  );
  const allSelected = hasSelection && allRowIds.length > 0 && allRowIds.every((id) => selectedSet.has(id));
  const someSelected = hasSelection && !allSelected && allRowIds.some((id) => selectedSet.has(id));

  const headerCheckboxRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (!hasSelection || selection !== 'multi') return;
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(allRowIds);
    }
  };

  const toggleOne = (id: string) => {
    if (!hasSelection) return;
    if (selection === 'single') {
      const next = selectedSet.has(id) ? [] : [id];
      onSelectionChange?.(next);
      return;
    }
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(Array.from(next));
  };

  const handleSortClick = (col: PixelTableColumn<Row>) => {
    if (!col.sortable || !onSortChange) return;
    const isActive = sort?.key === col.key;
    const nextDir: PixelTableSortDir = isActive && sort?.dir === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: col.key, dir: nextDir });
  };

  const stickyFirstHeadCls = stickyFirstColumn ? 'sticky left-0 z-20 bg-retro-surface/80 backdrop-blur-sm' : '';
  const stickyFirstBodyCls = stickyFirstColumn ? 'sticky left-0 z-10 bg-retro-bg' : '';

  const renderCellContent = (col: PixelTableColumn<Row>, row: Row, idx: number): React.ReactNode => {
    if (col.render) return col.render(row, idx);
    const r = row as unknown as Record<string, React.ReactNode>;
    return r?.[col.key] ?? '';
  };

  return (
    <div className={cn('overflow-x-auto', s.border, s.radius, 'border-retro-border')}>
      <table className={cn('w-full text-left text-sm', s.font)}>
        <thead
          className={cn(
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <tr className={cn('bg-retro-surface/60', surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border')}>
            {hasSelection && (
              <th
                scope="col"
                className={cn('whitespace-nowrap text-xs font-semibold text-retro-muted w-10', padCls, stickyFirstColumn && stickyFirstHeadCls)}
              >
                {selection === 'multi' ? (
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    onChange={toggleAll}
                    className={cn('h-4 w-4', focusRing)}
                  />
                ) : (
                  <span className="sr-only">Select</span>
                )}
              </th>
            )}
            {columns.map((col, colIdx) => {
              const isSorted = sort?.key === col.key;
              const ariaSort: React.AriaAttributes['aria-sort'] = col.sortable
                ? (isSorted ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none')
                : undefined;
              const headerStyle: React.CSSProperties | undefined = col.width != null
                ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                : undefined;
              const headerStickyCls = stickyFirstColumn && !hasSelection && colIdx === 0 ? stickyFirstHeadCls : '';
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  style={headerStyle}
                  className={cn(
                    'whitespace-nowrap text-xs font-semibold text-retro-muted',
                    padCls,
                    col.align && alignClass[col.align],
                    headerStickyCls,
                    col.className,
                  )}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSortClick(col)}
                      aria-label={`Sort by ${typeof col.header === 'string' ? col.header : col.key}`}
                      className={cn(
                        'inline-flex items-center text-retro-muted hover:text-retro-text outline-none',
                        focusRing,
                      )}
                    >
                      <span>{col.header}</span>
                      <PixelTableSortIcons dir={isSorted ? sort!.dir : null} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody aria-busy={loading || undefined}>
          {loading && (
            <tr aria-hidden className="sr-only">
              <td colSpan={totalColCount}>
                <span role="status" aria-live="polite">Loading data…</span>
              </td>
            </tr>
          )}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-retro-border/20">
                {Array.from({ length: totalColCount }).map((_, j) => (
                  <td key={`sk-${i}-${j}`} className={padCls}>
                    <div
                      data-skeleton
                      aria-hidden
                      className={cn(
                        'h-3 w-full motion-safe:animate-pulse bg-retro-surface/60',
                        surface === 'pixel' ? 'rounded-none' : 'rounded',
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={totalColCount} className={cn('text-center text-retro-muted', padCls)}>
                {emptyState ?? <span>No data.</span>}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const rowId = resolveRowId(row, idx);
              const isSelected = hasSelection && selectedSet.has(rowId);
              return (
                <tr
                  key={rowId}
                  data-row-id={rowId}
                  data-selected={isSelected || undefined}
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                  className={cn(
                    'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30',
                    striped && idx % 2 === 1 && 'bg-retro-surface/15',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-retro-surface/40',
                  )}
                >
                  {hasSelection && (
                    <td
                      className={cn('text-retro-text w-10', padCls, stickyFirstColumn && stickyFirstBodyCls)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select row ${rowId}`}
                        checked={isSelected}
                        onChange={() => toggleOne(rowId)}
                        className={cn('h-4 w-4', focusRing)}
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => {
                    const cellStickyCls = stickyFirstColumn && !hasSelection && colIdx === 0 ? stickyFirstBodyCls : '';
                    const cellStyle: React.CSSProperties | undefined = col.width != null
                      ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                      : undefined;
                    return (
                      <td
                        key={col.key}
                        style={cellStyle}
                        className={cn(
                          'text-retro-text',
                          padCls,
                          col.align && alignClass[col.align],
                          cellStickyCls,
                          col.className,
                        )}
                      >
                        {renderCellContent(col, row, idx)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelAvatar — initials/image with bordered square (pixel) or circle (linear).

   Upgraded (Ola 4) additively: `status` dot (online/away/busy/offline) in
   corner, sizes `xs` and `xl` added to the existing sm/md/lg axis, `shape`
   (square/circle/rounded, default circle), `colorSeed` deterministic tinted
   fallback background via hash modulo tones, and lazy/async image loading.
   Existing call sites continue to work — tone still wins when provided.
   ────────────────────────────────────────────────────────────────────────── */

export type PixelAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PixelAvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export type PixelAvatarShape = 'square' | 'circle' | 'rounded';

const AVATAR_COLOR_SEED_TONES: ReadonlyArray<Tone> = ['green', 'cyan', 'gold', 'red', 'purple', 'pink'];

/**
 * djb2-style hash → tone index. Deterministic across renders and locales:
 * the same `colorSeed` always maps to the same tone bucket.
 */
function hashColorSeedToTone(seed: string): Tone {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATAR_COLOR_SEED_TONES.length;
  return AVATAR_COLOR_SEED_TONES[idx];
}

export interface PixelAvatarProps {
  name: string;
  src?: string;
  size?: PixelAvatarSize;
  tone?: Tone;
  surface?: Surface;
  /** Status dot rendered in the bottom-right corner. */
  status?: PixelAvatarStatus;
  /** Shape of the avatar frame. Defaults to `'circle'`. */
  shape?: PixelAvatarShape;
  /**
   * Deterministic tone fallback derived from the seed via hash modulo a fixed
   * tone palette. Overridden by an explicit `tone` prop.
   */
  colorSeed?: string;
}

const AVATAR_DIM: Record<PixelAvatarSize, string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
  xl: 'h-16 w-16 text-sm',
};

const AVATAR_STATUS_DIM: Record<PixelAvatarSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
};

const AVATAR_STATUS_FILL: Record<PixelAvatarStatus, string> = {
  online: 'bg-retro-green',
  away: 'bg-retro-gold',
  busy: 'bg-retro-red',
  offline: 'bg-retro-muted',
};

const AVATAR_STATUS_LABEL: Record<PixelAvatarStatus, string> = {
  online: 'online',
  away: 'away',
  busy: 'busy',
  offline: 'offline',
};

export const PixelAvatar = forwardRef<HTMLDivElement, PixelAvatarProps>(function PixelAvatar(
  {
    name,
    src,
    size = 'md',
    tone: toneProp,
    surface: surfaceProp,
    status,
    shape,
    colorSeed,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const dim = AVATAR_DIM[size];
  const initials = upper(name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2));

  const effectiveShape: PixelAvatarShape = shape ?? 'circle';
  const radius =
    effectiveShape === 'square'
      ? (surface === 'pixel' ? 'rounded-none' : 'rounded-none')
      : effectiveShape === 'rounded'
        ? (surface === 'pixel' ? 'rounded-[3px]' : 'rounded-lg')
        : (surface === 'pixel' ? 'rounded-[3px]' : 'rounded-full');

  const effectiveTone: Tone = toneProp ?? (colorSeed ? hashColorSeedToTone(colorSeed) : 'green');
  const fontFamily = surface === 'pixel' ? 'font-pixel' : 'font-semibold';

  const statusDot = status ? (
    <span
      aria-hidden
      data-status={status}
      className={cn(
        'absolute -bottom-0.5 -right-0.5 inline-block rounded-full',
        'ring-2 ring-retro-bg',
        AVATAR_STATUS_DIM[size],
        AVATAR_STATUS_FILL[status],
      )}
    />
  ) : null;

  // Compose status into the avatar's accessible name (no live region — presence
  // dots are not transient status messages and 10 avatars on a page should not
  // each fire a polite announcement on mount).
  const accessibleName = status ? `${name} (${AVATAR_STATUS_LABEL[status]})` : name;

  return (
    <div ref={ref} className={cn('relative inline-block', status && 'pr-0.5')}>
      <div
        className={cn(
          'inline-flex items-center justify-center overflow-hidden',
          s.border, radius, dim,
          toneMap[effectiveTone].border, toneMap[effectiveTone].soft, toneMap[effectiveTone].text,
          fontFamily,
        )}
        title={accessibleName}
        aria-label={status ? accessibleName : undefined}
        data-color-seed={colorSeed || undefined}
        data-shape={effectiveShape}
      >
        {src
          ? <img src={src} alt={accessibleName} loading="lazy" decoding="async" className={cn('h-full w-full object-cover', radius)} />
          : initials}
      </div>
      {statusDot}
    </div>
  );
});

PixelAvatar.displayName = 'PixelAvatar';

/* ──────────────────────────────────────────────────────────────────────────
   PixelBadge — status badge. Pixel surface = chamfered, linear = pill.

   Upgraded additively: `variant` (soft default | solid | outline | ghost),
   `size` (sm | md | lg), `iconLeft`, and `onClick`. When `onClick` is
   provided, the root renders as a `<button>` for native keyboard semantics.
   ────────────────────────────────────────────────────────────────────────── */

export type PixelBadgeVariant = 'soft' | 'solid' | 'outline' | 'ghost';

const badgeSizeCls: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-[11px] gap-1.5',
  lg: 'px-3 py-1.5 text-xs gap-1.5',
};

const chipSizeCls: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

function variantClasses(variant: PixelBadgeVariant, tone: Tone) {
  const t = toneMap[tone];
  switch (variant) {
    case 'solid':
      return cn(t.bg, t.border, tone === 'neutral' ? 'text-retro-text' : 'text-retro-bg');
    case 'outline':
      return cn('bg-transparent', t.border, t.text);
    case 'ghost':
      return cn('bg-transparent border-transparent', t.text);
    case 'soft':
    default:
      return cn(t.soft, t.border, t.text);
  }
}

export interface PixelBadgeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  children: React.ReactNode;
  tone?: Tone;
  surface?: Surface;
  variant?: PixelBadgeVariant;
  size?: Size;
  iconLeft?: React.ReactNode;
  /** When provided the root renders as a `<button>` for keyboard / SR parity. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const PixelBadge = forwardRef<HTMLElement, PixelBadgeProps>(function PixelBadge(
  {
    children,
    tone = 'green',
    surface: surfaceProp,
    variant = 'soft',
    size = 'md',
    iconLeft,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const cls = cn(
    'inline-flex items-center leading-none',
    s.border,
    s.radiusFull,
    s.font,
    badgeSizeCls[size],
    variantClasses(variant, tone),
    onClick && cn(
      'cursor-pointer transition-colors',
      toneMap[tone].hover,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
      toneMap[tone].ring,
    ),
    className,
  );
  const content = (
    <>
      {iconLeft && <span className="inline-flex items-center shrink-0">{iconLeft}</span>}
      {children}
    </>
  );
  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cls}
      {...rest}
    >
      {content}
    </span>
  );
});
PixelBadge.displayName = 'PixelBadge';

/* ──────────────────────────────────────────────────────────────────────────
   PixelChip — label tag, optionally removable / clickable.

   Upgraded additively: `variant`, `size`, `iconLeft`, `onClick` (chip becomes
   button), and `deletable` + `onDelete` (X button on the right). `onRemove`
   stays as the legacy delete handler alias.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  label: string;
  tone?: Tone;
  surface?: Surface;
  variant?: PixelBadgeVariant;
  size?: Size;
  iconLeft?: React.ReactNode;
  /** Legacy alias for `onDelete`. */
  onRemove?: () => void;
  /** When true (or when onDelete is provided), renders an X button on the right. */
  deletable?: boolean;
  /** Called when the X button is activated. */
  onDelete?: () => void;
  /** When provided the root renders as a `<button>`. The delete X stays a nested button. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const PixelChip = forwardRef<HTMLElement, PixelChipProps>(function PixelChip(
  {
    label,
    tone = 'cyan',
    surface: surfaceProp,
    variant = 'soft',
    size = 'md',
    iconLeft,
    onRemove,
    deletable,
    onDelete,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const removeHandler = onDelete ?? onRemove;
  const showDelete = !!removeHandler && (deletable !== false);

  const cls = cn(
    'inline-flex items-center',
    s.border,
    s.radius,
    s.font,
    chipSizeCls[size],
    variantClasses(variant, tone),
    onClick && cn(
      'cursor-pointer transition-colors',
      toneMap[tone].hover,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
      toneMap[tone].ring,
    ),
    className,
  );

  const inner = (
    <>
      {iconLeft && <span className="inline-flex items-center shrink-0">{iconLeft}</span>}
      <span>{label}</span>
      {showDelete && (
        <button
          type="button"
          className={cn('p-0.5 transition-colors hover:bg-retro-bg/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-retro-bg', toneMap[tone].ring, s.radius)}
          onClick={(e) => {
            e.stopPropagation();
            removeHandler!();
          }}
          aria-label={`Remove ${label}`}
        >
          <CloseIcon className="h-2 w-2" />
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {inner}
      </button>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cls}
      {...rest}
    >
      {inner}
    </span>
  );
});
PixelChip.displayName = 'PixelChip';

/* ──────────────────────────────────────────────────────────────────────────
   PixelTextLink — anchor or button styled as a tone-coloured underline.
   ────────────────────────────────────────────────────────────────────────── */

type PixelTextLinkCommon = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  surface?: Surface;
};

type PixelTextLinkAnchorProps = PixelTextLinkCommon
  & { href: string }
  & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

type PixelTextLinkButtonProps = PixelTextLinkCommon
  & { href?: undefined }
  & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

type PixelTextLinkProps = PixelTextLinkAnchorProps | PixelTextLinkButtonProps;

export function PixelTextLink({
  children,
  tone = 'cyan',
  className,
  href,
  surface: surfaceProp,
  ...props
}: PixelTextLinkProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const cls = cn(
    'underline underline-offset-2 decoration-current/40 transition-colors cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
    toneMap[tone].ring,
    s.font,
    toneMap[tone].text,
    tone === 'cyan' && 'hover:text-retro-green',
    tone !== 'cyan' && 'hover:opacity-80',
    className,
  );

  if (href) {
    const anchorProps = props as PixelTextLinkAnchorProps;
    const { href: _href, ...anchorRest } = anchorProps;
    return <a href={href} className={cls} {...anchorRest}>{children}</a>;
  }

  const buttonProps = props as PixelTextLinkButtonProps;
  return <button type="button" className={cls} {...buttonProps}>{children}</button>;
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelCollapsible — toggleable details block with a chevron header.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelCollapsible({
  label,
  children,
  defaultOpen = false,
  tone = 'neutral',
  surface: surfaceProp,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <PixelButton
        type="button"
        size="sm"
        tone={tone}
        surface={surface}
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        iconRight={<ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
        className="h-auto px-1.5 py-0.5 text-xs"
      >
        {label}
      </PixelButton>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelCodeInline — inline <code> with tone tinting.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelCodeInline({
  children,
  tone = 'cyan',
  surface: surfaceProp,
}: {
  children: React.ReactNode;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <code className={cn('px-1.5 py-0.5 text-xs', s.border, s.radius, s.font, toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text)}>
      {children}
    </code>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelKbd — styled keyboard shortcut indicator.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelKbd({
  children,
  surface: surfaceProp,
}: {
  children: React.ReactNode;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] text-retro-muted',
        s.border, s.radius, s.font,
        'border-retro-border bg-retro-surface',
        surface === 'pixel'
          ? 'shadow-[0_2px_0_0_rgba(0,0,0,0.25)]'
          : 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]',
      )}
    >
      {children}
    </kbd>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelColorSwatch — design token preview with CSS var label.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelColorSwatch({
  name,
  cssVar,
  surface: surfaceProp,
}: {
  name: string;
  cssVar: string;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn('h-8 w-8', s.border, s.radius, 'border-retro-border/50')}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className={cn('text-xs text-retro-text', s.font)}>{name}</p>
        <p className={cn('text-[10px] text-retro-muted', s.font)}>{cssVar}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Bare primitives — unstyled passthroughs used for escape-hatch composition.
   ────────────────────────────────────────────────────────────────────────── */

export const PixelBareButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ type = 'button', ...props }, ref) => <button ref={ref} type={type} {...props} />,
);
PixelBareButton.displayName = 'PixelBareButton';

export const PixelBareInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />,
);
PixelBareInput.displayName = 'PixelBareInput';

export const PixelBareTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => <textarea ref={ref} {...props} />,
);
PixelBareTextarea.displayName = 'PixelBareTextarea';
