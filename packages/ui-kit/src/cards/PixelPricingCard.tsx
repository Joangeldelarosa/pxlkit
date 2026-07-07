'use client';

import React, { forwardRef } from 'react';
import {
  cn,
  Surface,
  CheckIcon,
  CloseIcon,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { tone as toneTokens, type ToneKey } from '../tokens';

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
    const s = surfaceClasses(surface);
    const t = toneTokens[tone];
    const ribbonTone = toneTokens[popular?.tone ?? 'gold'];

    const Article = 'article' as 'article';

    return (
      <Article
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          'relative flex flex-col p-5',
          bordered && s.border,
          bordered && s.radiusLg,
          bordered && (highlight ? t.border : 'border-retro-border'),
          bordered && (highlight ? t.soft : 'bg-retro-surface/40'),
          highlight && t.glow,
          className,
        )}
        {...rest}
      >
        <div data-pxl-ribbon-slot className="relative h-7">
          {popular && (
            <span
              className={cn(
                'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
                'px-2 py-0.5 text-[10px] font-semibold',
                s.border,
                s.radius,
                s.fontDisplay,
                ribbonTone.border,
                ribbonTone.bg,
                ribbonTone.text,
              )}
            >
              {popular.label ?? 'POPULAR'}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {icon && (
            <span
              className={cn('mb-2 inline-flex h-6 w-6 items-center justify-center', t.text)}
              aria-hidden
            >
              {icon}
            </span>
          )}
          <h3 className={cn('text-base font-semibold text-retro-text', s.font)}>{name}</h3>
          <p
            data-pxl-description-slot
            className={cn(
              'mt-1 text-sm text-retro-muted',
              descriptionLines === 2 && 'line-clamp-2 min-h-[2.5em]',
              descriptionLines === 3 && 'line-clamp-3 min-h-[3.75em]',
              s.font,
            )}
          >
            {description ?? ''}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          {price.strikethrough !== undefined && (
            <s className={cn('line-through text-sm text-retro-muted', s.font)}>
              <span className="sr-only">Previous price </span>
              {price.strikethrough}
            </s>
          )}
          <span className={cn('text-3xl sm:text-4xl font-bold', t.text, s.fontDisplay)}>
            {price.amount}
          </span>
          {price.period && (
            <span className={cn('text-sm text-retro-muted', s.font)}>{price.period}</span>
          )}
          {priceBadge && (
            <span data-pxl-price-badge-slot className="self-center">
              {priceBadge}
            </span>
          )}
        </div>

        {features && features.length > 0 && (
          <ul className={cn('mt-4 space-y-2', s.font)}>
            {features.map((f, i) => {
              const included = f.included !== false;
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0',
                      included ? t.text : 'text-retro-muted',
                    )}
                    aria-hidden
                  >
                    {included ? <CheckIcon /> : <CloseIcon />}
                  </span>
                  <span
                    title={f.tooltip}
                    className={cn(
                      included
                        ? f.highlight
                          ? cn(t.text, 'font-medium')
                          : 'text-retro-text'
                        : 'text-retro-muted line-through',
                    )}
                  >
                    <span className="sr-only">{included ? 'Included: ' : 'Not included: '}</span>
                    {f.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex-1" aria-hidden />

        {cta && <div className="mt-5">{cta}</div>}
        {footer && (
          <div className={cn('mt-3 text-xs text-retro-muted', s.font)}>{footer}</div>
        )}
      </Article>
    );
  },
);

PixelPricingCard.displayName = 'PixelPricingCard';
