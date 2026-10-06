'use client';

import React, { forwardRef } from 'react';
import {
  TESTIMONIAL_VERIFIED_LABEL,
  TESTIMONIAL_VERIFIED_TEXT,
  testimonialAttribution,
  testimonialCardClasses,
  testimonialHasStars,
  testimonialInitials,
  type TestimonialQuoteSize as QuoteSize,
  type TestimonialVariant as Variant,
} from '@pxlkit/ui-kit-core';
import {
  cn,
  Surface,
  CheckIcon,
  useEffectiveSurface,
} from '../common';
import { type ToneKey } from '../tokens';
import { PixelStarRating } from './PixelStarRating';

export interface PixelTestimonialCardProps extends React.HTMLAttributes<HTMLElement> {
  /** The quote, set between curly quotation marks. */
  quote: string;
  /** Who said it. */
  name: string;
  /** Their role, before the company. */
  role?: string;
  /** Their company. */
  company?: string;
  /** Photo, or the name and tone of the initials; the initials of `name` without one. */
  avatar?: { src?: string; name: string; tone?: ToneKey };
  /** Star rating out of 5; none for 0 or unset. */
  stars?: number;
  /** Shows the VERIFIED badge. */
  verified?: boolean;
  /** Tone of the initials. */
  tone?: ToneKey;
  /** `card` draws the surface chrome; `quote` and `slider` leave it out. */
  variant?: Variant;
  /** Minimum height of the quote. */
  quoteSize?: QuoteSize;
  /** Actions under the quote (a link to the full story). */
  actions?: React.ReactNode;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
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
    const classes = testimonialCardClasses(surface, { variant, tone, avatarTone: avatar?.tone, quoteSize });

    const Article = 'article' as 'article';

    const roleCompany = testimonialAttribution(role, company);

    return (
      <Article
        ref={ref as React.Ref<HTMLElement>}
        className={cn(classes.root, className)}
        {...rest}
      >
        <div className={classes.header}>
          <div className={classes.stars}>
            {testimonialHasStars(stars) ? (
              <PixelStarRating
                value={stars}
                size="sm"
                tone="gold"
                surface={surface}
              />
            ) : null}
          </div>
          {verified && (
            // A generic <span> cannot carry a name (ARIA 1.2): named, the badge is an image.
            <span
              data-pxl-verified
              role="img"
              className={classes.verified}
              aria-label={TESTIMONIAL_VERIFIED_LABEL}
            >
              <CheckIcon className={classes.verifiedIcon} />
              <span>{TESTIMONIAL_VERIFIED_TEXT}</span>
            </span>
          )}
        </div>

        <div data-pxl-quote-slot className={classes.quoteRow}>
          <blockquote className={classes.quote}>
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>

        <div className={classes.actionsRow}>
          {actions ? <div className={classes.actions}>{actions}</div> : null}
        </div>

        <div className={classes.attribution}>
          <span
            data-pxl-avatar
            className={classes.avatar}
            aria-hidden={avatar?.src ? undefined : true}
          >
            {avatar?.src ? (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img
                src={avatar.src}
                alt={avatar.name}
                className={classes.avatarImage}
              />
            ) : (
              <span>{testimonialInitials(avatar?.name ?? name)}</span>
            )}
          </span>
          <div className={classes.person}>
            <span className={classes.name}>{name}</span>
            {roleCompany && <span className={classes.role}>{roleCompany}</span>}
          </div>
          {/* hint: tone tokens kept reachable so variant="card" highlight extensions can wire glow later */}
          <span className={classes.toneHint} aria-hidden />
        </div>
      </Article>
    );
  },
);

PixelTestimonialCard.displayName = 'PixelTestimonialCard';
