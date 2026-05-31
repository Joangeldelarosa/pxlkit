'use client';

import React, { forwardRef } from 'react';
import {
  cn,
  Surface,
  CheckIcon,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { tone as toneTokens, type ToneKey } from '../tokens';
import { PixelStarRating } from './PixelStarRating';

type QuoteSize = 'compact' | 'normal' | 'long';
type Variant = 'card' | 'quote' | 'slider';

const quoteSizeMap: Record<QuoteSize, string> = {
  compact: 'min-h-[5em]',
  normal: 'min-h-[7em]',
  long: 'min-h-[9em]',
};

export interface PixelTestimonialCardProps extends React.HTMLAttributes<HTMLElement> {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: { src?: string; name: string; tone?: ToneKey };
  stars?: number;
  verified?: boolean;
  tone?: ToneKey;
  variant?: Variant;
  quoteSize?: QuoteSize;
  actions?: React.ReactNode;
  surface?: Surface;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const PixelTestimonialCard = forwardRef<HTMLElement, PixelTestimonialCardProps>(
  function PixelTestimonialCard(
    {
      quote,
      name,
      role,
      company,
      avatar,
      stars,
      verified = false,
      tone = 'neutral',
      variant = 'card',
      quoteSize = 'normal',
      actions,
      surface: surfaceProp,
      className,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const t = toneTokens[tone];
    const avatarTone = toneTokens[avatar?.tone ?? tone];

    const isCard = variant === 'card';

    const Article = 'article' as 'article';

    const roleCompany = [role, company].filter(Boolean).join(' · ');

    return (
      <Article
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          'relative grid grid-rows-[auto_1fr_auto_auto] gap-3 p-5',
          isCard && s.border,
          isCard && s.radiusLg,
          isCard && 'border-retro-border bg-retro-surface/40',
          s.font,
          className,
        )}
        {...rest}
      >
        <div className="flex items-center justify-between gap-2 min-h-[1.25rem]">
          <div className="flex items-center">
            {typeof stars === 'number' && stars > 0 ? (
              <PixelStarRating
                value={stars}
                size="sm"
                tone="gold"
                surface={surface}
              />
            ) : null}
          </div>
          {verified && (
            <span
              data-pxl-verified
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold',
                s.border,
                s.radius,
                s.fontDisplay,
                toneTokens.green.border,
                toneTokens.green.bg,
                toneTokens.green.text,
              )}
              aria-label="Verified"
            >
              <CheckIcon className="h-2.5 w-2.5" />
              <span>VERIFIED</span>
            </span>
          )}
        </div>

        <div
          data-pxl-quote-slot
          className={cn('flex items-start', quoteSizeMap[quoteSize])}
        >
          <blockquote
            className={cn('text-sm leading-relaxed text-retro-text', s.font)}
          >
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>

        <div className="min-h-0">
          {actions ? <div className="pt-1">{actions}</div> : null}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span
            data-pxl-avatar
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-xs font-semibold',
              s.border,
              s.radiusFull,
              avatarTone.border,
              avatarTone.bg,
              avatarTone.text,
              s.fontDisplay,
            )}
            aria-hidden={avatar?.src ? undefined : true}
          >
            {avatar?.src ? (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img
                src={avatar.src}
                alt={avatar.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initialsFor(avatar?.name ?? name)}</span>
            )}
          </span>
          <div className="flex min-w-0 flex-col">
            <span
              className={cn('truncate text-sm font-semibold text-retro-text', s.font)}
            >
              {name}
            </span>
            {roleCompany && (
              <span
                className={cn('truncate text-xs text-retro-muted', s.font)}
              >
                {roleCompany}
              </span>
            )}
          </div>
          {/* hint: tone tokens kept reachable so variant="card" highlight extensions can wire glow later */}
          <span className={cn('hidden', t.text)} aria-hidden />
        </div>
      </Article>
    );
  },
);

PixelTestimonialCard.displayName = 'PixelTestimonialCard';
