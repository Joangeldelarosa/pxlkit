'use client';

import React, { forwardRef } from 'react';
import {
  PRICING_PREVIOUS_PRICE_LABEL,
  pricingCardClasses,
  pricingFeature,
  pricingPopularLabel,
} from '@pxlkit/ui-kit-core';
import {
  cn,
  Surface,
  CheckIcon,
  CloseIcon,
  useEffectiveSurface,
} from '../common';
import { type ToneKey } from '../tokens';

export interface PixelPricingCardProps extends React.HTMLAttributes<HTMLElement> {
  tone?: ToneKey;
  icon?: React.ReactNode;
  name: string;
  description?: string;
  /** Clamp the description to N lines. Defaults to 2; use 'none' to let long copy flow. */
  descriptionLines?: 2 | 3 | 'none';
  price: { amount: string | number; period?: string; strikethrough?: string | number };
  /** Promo badge rendered beside the price (e.g. a discount PixelBadge). */
  priceBadge?: React.ReactNode;
  popular?: { label?: string; tone?: ToneKey };
  features?: { label: string; tooltip?: string; included?: boolean; highlight?: boolean }[];
  cta?: React.ReactNode;
  highlight?: boolean;
  footer?: React.ReactNode;
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to true — a pricing card needs visible chrome. */
  bordered?: boolean;
}

export const PixelPricingCard = forwardRef<HTMLElement, PixelPricingCardProps>(
  function PixelPricingCard(
    {
      tone = 'neutral',
      icon,
      name,
      description,
      descriptionLines = 2,
      price,
      priceBadge,
      popular,
      features,
      cta,
      highlight = false,
      footer,
      surface: surfaceProp,
      bordered = true,
      className,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const classes = pricingCardClasses(surface, {
      tone,
      highlight,
      bordered,
      descriptionLines,
      popularTone: popular?.tone,
    });

    const Article = 'article' as 'article';

    return (
      <Article
        ref={ref as React.Ref<HTMLElement>}
        className={cn(classes.root, className)}
        {...rest}
      >
        <div data-pxl-ribbon-slot className={classes.ribbonRow}>
          {popular && <span className={classes.popular}>{pricingPopularLabel(popular)}</span>}
        </div>

        <div className={classes.head}>
          {icon && (
            <span className={classes.icon} aria-hidden>
              {icon}
            </span>
          )}
          <h3 className={classes.name}>{name}</h3>
          <p data-pxl-description-slot className={classes.description}>
            {description ?? ''}
          </p>
        </div>

        <div className={classes.priceRow}>
          {price.strikethrough !== undefined && (
            <s className={classes.previousPrice}>
              <span className="sr-only">{PRICING_PREVIOUS_PRICE_LABEL}</span>
              {price.strikethrough}
            </s>
          )}
          <span className={classes.amount}>{price.amount}</span>
          {price.period && <span className={classes.period}>{price.period}</span>}
          {priceBadge && (
            <span data-pxl-price-badge-slot className={classes.priceBadge}>
              {priceBadge}
            </span>
          )}
        </div>

        {features && features.length > 0 && (
          <ul className={classes.features}>
            {features.map((f, i) => {
              const feature = pricingFeature(f, tone);
              return (
                <li key={i} className={classes.feature}>
                  <span className={feature.markClasses} aria-hidden>
                    {feature.included ? <CheckIcon /> : <CloseIcon />}
                  </span>
                  <span title={f.tooltip} className={feature.labelClasses}>
                    <span className="sr-only">{feature.srLabel}</span>
                    {f.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className={classes.spacer} aria-hidden />

        {cta && <div className={classes.cta}>{cta}</div>}
        {footer && <div className={classes.footer}>{footer}</div>}
      </Article>
    );
  },
);

PixelPricingCard.displayName = 'PixelPricingCard';
