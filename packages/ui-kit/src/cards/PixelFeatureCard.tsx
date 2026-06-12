'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

type IconSize = 48 | 56 | 64 | 80;
type DescLines = 2 | 3 | 4;
type Orientation = 'vertical' | 'horizontal';

const iconSizeMap: Record<IconSize, string> = {
  48: 'w-12',
  56: 'w-14',
  64: 'w-16',
  80: 'w-20',
};

const descLinesMap: Record<DescLines, string> = {
  2: 'line-clamp-2 min-h-[2lh]',
  3: 'line-clamp-3 min-h-[3lh]',
  4: 'line-clamp-4 min-h-[4lh]',
};

export interface PixelFeatureCardProps extends React.HTMLAttributes<HTMLElement> {
  icon?: React.ReactNode;
  iconSize?: IconSize;
  badge?: { label: string; tone?: ToneKey };
  title: string;
  /** Muted paragraph rendered under the title. */
  description?: string;
  /** Apply `line-clamp-N` + `min-h-[N lh]` to the description. */
  descriptionLines?: DescLines;
  /** @deprecated Use `description` for consistency with PixelCard / PixelPricingCard. */
  desc?: string;
  /** @deprecated Use `descriptionLines` for consistency with PixelCard / PixelPricingCard. */
  descLines?: DescLines;
  footer?: React.ReactNode;
  tone?: ToneKey;
  interactive?: boolean;
  /**
   * When provided, the card renders as `<a href>` and accepts anchor-specific
   * attributes via the spread. Nesting interactive children inside the card
   * (e.g. PixelButton, PixelTextLink) is invalid HTML in this mode.
   */
  href?: string;
  /** Anchor target — only meaningful when `href` is set. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  /** Anchor rel — only meaningful when `href` is set. */
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  /** Anchor download — only meaningful when `href` is set. */
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>['download'];
  /** When `interactive=true` without `href`, an onClick is REQUIRED for accessibility. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  orientation?: Orientation;
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to true — a feature card needs visible chrome. */
  bordered?: boolean;
}

export const PixelFeatureCard = forwardRef<HTMLElement, PixelFeatureCardProps>(
  function PixelFeatureCard(
    {
      icon,
      iconSize = 56,
      badge,
      title,
      description,
      descriptionLines,
      desc,
      descLines,
      footer,
      tone = 'neutral',
      interactive = false,
      href,
      target,
      rel,
      download,
      onClick,
      orientation = 'vertical',
      surface: surfaceProp,
      bordered = true,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const t = toneTokens[tone];
    const isLink = typeof href === 'string';
    const isInteractive = interactive || isLink;
    const isHorizontal = orientation === 'horizontal';
    const resolvedDescription = description ?? desc;
    const resolvedDescLines: DescLines = descriptionLines ?? descLines ?? 3;

    const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
      if (!interactive || isLink) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
      }
    };

    const root = cn(
      'relative p-5',
      isHorizontal ? 'grid grid-cols-[auto_1fr] gap-4 items-start' : 'flex flex-col',
      bordered && s.border,
      bordered && s.radiusLg,
      s.transition,
      bordered && 'border-retro-border bg-retro-surface/40',
      isInteractive && 'cursor-pointer hover:-translate-y-[2px]',
      isInteractive && s.shadowHover,
      isInteractive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
      className,
    );

    const badgeSlot = (
      <div
        data-pxl-badge-slot
        className={cn(
          'min-h-[28px] flex items-center',
          !badge && 'invisible',
          isHorizontal && 'col-span-2',
        )}
      >
        {badge && (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 text-[11px] leading-none',
              s.border,
              s.radiusFull,
              s.font,
              toneTokens[badge.tone ?? 'cyan'].text,
              toneTokens[badge.tone ?? 'cyan'].border,
              toneTokens[badge.tone ?? 'cyan'].soft,
            )}
          >
            {badge.label}
          </span>
        )}
      </div>
    );

    const iconSlot = icon ? (
      <div
        data-pxl-icon-frame
        className={cn(
          'aspect-square flex items-center justify-center',
          iconSizeMap[iconSize],
          s.border,
          s.radius,
          t.bg,
          t.border,
          t.text,
          isHorizontal ? 'self-start' : 'mb-4',
        )}
      >
        {icon}
      </div>
    ) : null;

    const titleSlot = (
      <h3
        className={cn(
          'text-base font-semibold text-retro-text line-clamp-2 min-h-[2lh]',
          s.fontDisplay,
        )}
      >
        {title}
      </h3>
    );

    const descSlot = resolvedDescription ? (
      <p className={cn('mt-2 text-sm text-retro-muted', s.font, descLinesMap[resolvedDescLines])}>
        {resolvedDescription}
      </p>
    ) : null;

    const spacer = !isHorizontal ? <div className="flex-1" /> : null;

    const footerSlot = footer ? (
      <div className={cn(!isHorizontal && 'mt-4')}>{footer}</div>
    ) : null;

    const body = isHorizontal ? (
      <>
        {badgeSlot}
        {iconSlot}
        <div className="flex flex-col">
          {titleSlot}
          {descSlot}
          {footerSlot}
        </div>
      </>
    ) : (
      <>
        {badgeSlot}
        {iconSlot}
        {titleSlot}
        {descSlot}
        {spacer}
        {footerSlot}
      </>
    );

    if (isLink) {
      const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          download={download}
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
          className={root}
          {...anchorRest}
        >
          {body}
          {children}
        </a>
      );
    }

    if (interactive) {
      // <article> does not permit role="button" (axe: aria-allowed-role), so
      // the interactive variant renders a generic <div> instead.
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={root}
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {body}
          {children}
        </div>
      );
    }

    return (
      <article
        ref={ref as React.Ref<HTMLElement>}
        className={root}
        {...rest}
      >
        {body}
        {children}
      </article>
    );
  },
);

PixelFeatureCard.displayName = 'PixelFeatureCard';
