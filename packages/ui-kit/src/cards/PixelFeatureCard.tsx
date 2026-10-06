'use client';

import React, { forwardRef } from 'react';
import {
  featureCardClasses,
  isCardActivationKey,
  type FeatureCardDescriptionLines as DescLines,
  type FeatureCardIconSize as IconSize,
  type FeatureCardOrientation as Orientation,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelFeatureCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Icon in the toned frame. */
  icon?: React.ReactNode;
  /** Width of the icon frame, in px. */
  iconSize?: IconSize;
  /** Badge above the icon: its label and tone (cyan by default). */
  badge?: { label: string; tone?: ToneKey };
  /** The heading, clamped to two lines. */
  title: string;
  /** Muted paragraph rendered under the title. */
  description?: string;
  /** Apply `line-clamp-N` + `min-h-[N lh]` to the description. */
  descriptionLines?: DescLines;
  /** @deprecated Use `description` for consistency with PixelCard / PixelPricingCard. */
  desc?: string;
  /** @deprecated Use `descriptionLines` for consistency with PixelCard / PixelPricingCard. */
  descLines?: DescLines;
  /** Footer under the description. */
  footer?: React.ReactNode;
  /** Tone of the icon frame. */
  tone?: ToneKey;
  /** Hover lift and focus ring; without an `href` the card is a button: give it an `onClick`. */
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
  /** Icon above the text, or beside it. */
  orientation?: Orientation;
  /** Surface override; defaults to the nearest provider. */
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
      onKeyDown,
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
    const isLink = typeof href === 'string';
    const isInteractive = interactive || isLink;
    const isHorizontal = orientation === 'horizontal';
    const resolvedDescription = description ?? desc;
    const classes = featureCardClasses(surface, {
      tone,
      orientation,
      bordered,
      interactive: isInteractive,
      iconSize,
      badge,
      descriptionLines: descriptionLines ?? descLines,
    });

    const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (!interactive || isLink) return;
      if (isCardActivationKey(e.key)) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLElement>);
      }
    };

    const root = cn(classes.root, className);

    const badgeSlot = (
      <div data-pxl-badge-slot className={classes.badgeRow}>
        {badge && <span className={classes.badge}>{badge.label}</span>}
      </div>
    );

    const iconSlot = icon ? (
      <div data-pxl-icon-frame className={classes.icon}>
        {icon}
      </div>
    ) : null;

    const titleSlot = <h3 className={classes.title}>{title}</h3>;

    const descSlot = resolvedDescription ? (
      <p className={classes.description}>{resolvedDescription}</p>
    ) : null;

    const spacer = !isHorizontal ? <div className={classes.spacer} /> : null;

    const footerSlot = footer ? <div className={classes.footer}>{footer}</div> : null;

    const body = isHorizontal ? (
      <>
        {badgeSlot}
        {iconSlot}
        <div className={classes.column}>
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
          onKeyDown={onKeyDown}
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
        onKeyDown={onKeyDown}
        {...rest}
      >
        {body}
        {children}
      </article>
    );
  },
);

PixelFeatureCard.displayName = 'PixelFeatureCard';
