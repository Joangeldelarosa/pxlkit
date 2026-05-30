import React, { forwardRef, useState } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
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
   ────────────────────────────────────────────────────────────────────────── */

export function PixelTable({
  columns,
  data,
  striped = true,
  surface: surfaceProp,
}: {
  columns: Array<{ key: string; header: string; className?: string }>;
  data: Array<Record<string, React.ReactNode>>;
  striped?: boolean;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className={cn('overflow-x-auto', s.border, s.radius, 'border-retro-border')}>
      <table className={cn('w-full text-left text-sm', s.font)}>
        <thead>
          <tr className={cn('bg-retro-surface/60', surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border')}>
            {columns.map((col) => (
              <th key={col.key} className={cn('whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-retro-muted', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={cn(
                'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30',
                striped && idx % 2 === 1 && 'bg-retro-surface/15',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-2.5 text-retro-text', col.className)}>
                  {row[col.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelAvatar — initials/image with bordered square (pixel) or circle (linear).
   ────────────────────────────────────────────────────────────────────────── */

export function PixelAvatar({
  name,
  src,
  size = 'md',
  tone = 'green',
  surface: surfaceProp,
}: {
  name: string;
  src?: string;
  size?: Size;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const dim = size === 'sm' ? 'h-8 w-8 text-[9px]' : size === 'lg' ? 'h-12 w-12 text-xs' : 'h-10 w-10 text-[10px]';
  const initials = upper(name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2));
  const radius = surface === 'pixel' ? 'rounded-[3px]' : 'rounded-lg';
  const fontFamily = surface === 'pixel' ? 'font-pixel' : 'font-semibold';
  return (
    <div
      className={cn('inline-flex items-center justify-center overflow-hidden', s.border, radius, dim, toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text, fontFamily)}
      title={name}
    >
      {src ? <img src={src} alt={name} className={cn('h-full w-full object-cover', radius)} /> : initials}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelBadge — read-only status badge. Pixel surface = chamfered, linear = pill.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelBadge({
  children,
  tone = 'green',
  surface: surfaceProp,
}: {
  children: React.ReactNode;
  tone?: Tone;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 text-[11px] leading-none', s.border, s.radiusFull, s.font, toneMap[tone].text, toneMap[tone].border, toneMap[tone].soft)}>
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelChip — removable label tag.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelChip({
  label,
  tone = 'cyan',
  onRemove,
  surface: surfaceProp,
}: {
  label: string;
  tone?: Tone;
  onRemove?: () => void;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs', s.border, s.radius, s.font, toneMap[tone].text, toneMap[tone].border, toneMap[tone].soft)}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={cn('p-0.5 transition-colors hover:bg-retro-bg/50', s.radius)}
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          <CloseIcon className="h-2 w-2" />
        </button>
      )}
    </span>
  );
}

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
