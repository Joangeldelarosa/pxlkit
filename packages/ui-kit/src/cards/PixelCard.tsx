import React, { forwardRef } from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';
import { PixelRibbon } from './PixelRibbon';

/* ─────────────────────────────────────────────────────────────────────────
   PixelCard — container with title, icon, body, optional footer.
   Pixel surface uses thick border + offset shadow as signature.

   Upgraded (Ola 2) additively: optional tone tint, hover-interactive lift,
   media slot, badge ribbon, description with line-clamp, polymorphic <a>
   render via href, and a padding scale. Existing call sites continue to
   work unchanged.
   ───────────────────────────────────────────────────────────────────────── */

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
  /** Heading rendered inside the auto-generated header. */
  title: string;
  /** Optional leading icon for the auto-generated header. */
  icon?: React.ReactNode;
  /** Card body content. */
  children?: React.ReactNode;
  /** Optional footer slot rendered after the body with a divider. */
  footer?: React.ReactNode;
  /** Visual surface override. Inherits from provider when omitted. */
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
  /** Render with surface-aware border + radius chrome. Defaults to true — a card should look like a card. */
  bordered?: boolean;
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
    bordered = true,
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
    'relative flex flex-col transition-all',
    bordered && 'bg-retro-surface/60',
    bordered && s.border,
    bordered && s.radiusLg,
    bordered && (t ? t.border : 'border-retro-border/40 hover:border-retro-border/60'),
    bordered && (t ? t.soft : null),
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
