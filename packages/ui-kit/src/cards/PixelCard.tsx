import React, { forwardRef } from 'react';
import {
  cardBodyClasses,
  cardClasses,
  cardFooterClasses,
  cardHeaderClasses,
  isCardActivationKey,
} from '@pxlkit/ui-kit-core';
import { Surface, cn, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import { PixelRibbon } from './PixelRibbon';

/* ─────────────────────────────────────────────────────────────────────────
   PixelCard — container with title, icon, body, optional footer.
   Pixel surface uses thick border + offset shadow as signature.

   Upgraded (Ola 2) additively: optional tone tint, hover-interactive lift,
   media slot, badge ribbon, description with line-clamp, polymorphic <a>
   render via href, and a padding scale. Existing call sites continue to
   work unchanged.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Heading rendered inside the auto-generated header. Omit for a headerless container/well card. */
  title?: string;
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
    <header className={cn(cardHeaderClasses, className)} {...rest}>
      {children}
    </header>
  );
}
CardHeader.displayName = 'PixelCard.Header';

function CardBody({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(cardBodyClasses, className)} {...rest}>
      {children}
    </div>
  );
}
CardBody.displayName = 'PixelCard.Body';

function CardFooter({ children, className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(cardFooterClasses, className)} {...rest}>
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
  const hasMedia = !!media;
  const hasBadge = !!badge;
  const hasExplicitHeader = childrenContainCardHeader(children);
  const classes = cardClasses(surface, {
    tone,
    padding,
    bordered,
    interactive: !!interactive,
    link: !!href,
    media: hasMedia,
    badge: hasBadge,
    description: !!description,
    descriptionLines,
  });
  const rootCls = cn(classes.root, className);

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (!interactive || href) return;
    if (isCardActivationKey(e.key)) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
    }
  };

  const inner = (
    <>
      {hasMedia && <div className={classes.media}>{media}</div>}
      {hasBadge && (
        <PixelRibbon
          position="top-right"
          tone={badge!.tone ?? 'gold'}
          surface={surface}
        >
          {badge!.label}
        </PixelRibbon>
      )}
      <div className={classes.content}>
        {!hasExplicitHeader && title !== undefined && (
          <header className={classes.header}>
            {icon && <span className={classes.icon}>{icon}</span>}
            <h4 className={classes.title}>{title}</h4>
          </header>
        )}
        {description && <p className={classes.description}>{description}</p>}
        {children !== undefined && children !== null && (
          <div className={classes.body}>{children}</div>
        )}
        {footer && <footer className={classes.footer}>{footer}</footer>}
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
        onKeyDown={onKeyDown}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </a>
    );
  }

  if (interactive) {
    // <article> does not permit role="button" (axe: aria-allowed-role), so the
    // interactive variant renders a generic <div> instead.
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={rootCls}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {inner}
      </div>
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
