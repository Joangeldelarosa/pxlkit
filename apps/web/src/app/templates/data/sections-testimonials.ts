import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social @pxlkit/gamification';

const testimonialCards = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon } from '@pxlkit/core';
import { SocialStar } from '@pxlkit/social';
import {
  PixelCard,
  PixelAvatar,
  PixelFadeIn,
  PixelSection,
} from '@pxlkit/ui-kit';

const TESTIMONIALS = [
  {
    quote: 'Pxlkit completely changed how I build UIs. The pixel-art aesthetic is so unique and the DX is amazing.',
    author: 'Alex Rivera',
    role: 'Frontend Engineer',
    company: 'Indie Studio',
    initials: 'AR',
    stars: 5,
  },
  {
    quote: 'Went from zero to shipped in a weekend. The components just work and look incredible out of the box.',
    author: 'Sam Chen',
    role: 'Full-stack Developer',
    company: 'StartupXYZ',
    initials: 'SC',
    stars: 5,
  },
  {
    quote: 'Our game landing page got 3× more engagement after switching to Pxlkit. The retro aesthetic resonates.',
    author: 'Morgan Blake',
    role: 'Product Designer',
    company: 'GameDev Co',
    initials: 'MB',
    stars: 5,
  },
];

export function TestimonialCards() {
  return (
    <PixelSection className="py-16 sm:py-24 bg-retro-surface/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl sm:text-2xl text-retro-text leading-loose mb-3">
            What developers say
          </h2>
          <p className="text-retro-muted font-mono text-sm">
            Join thousands of developers who ship with Pxlkit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <PixelFadeIn key={t.author} delay={i * 100}>
              <PixelCard className="p-6 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <PxlKitIcon key={j} icon={SocialStar} size={14} colorful />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-retro-text font-mono text-xs leading-relaxed flex-1 mb-4">
                  "{t.quote}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-retro-border/50">
                  <PixelAvatar initials={t.initials} size="sm" />
                  <div>
                    <div className="font-mono text-xs text-retro-text font-semibold">{t.author}</div>
                    <div className="font-mono text-[10px] text-retro-muted">{t.role} · {t.company}</div>
                  </div>
                </div>
              </PixelCard>
            </PixelFadeIn>
          ))}
        </div>
      </div>
    </PixelSection>
  );
}
`;

const largeQuote = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { SocialStar } from '@pxlkit/social';
import { SparkleStar } from '@pxlkit/gamification';
import {
  PixelAvatar,
  PixelFadeIn,
  PixelSection,
} from '@pxlkit/ui-kit';

export function LargeQuote() {
  return (
    <PixelSection className="py-16 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <PixelFadeIn>
          {/* Decoration */}
          <div className="flex justify-center gap-2 mb-8">
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
            <AnimatedPxlKitIcon icon={SparkleStar} size={20} colorful />
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <PxlKitIcon key={i} icon={SocialStar} size={18} colorful />
            ))}
          </div>

          {/* Big quote */}
          <blockquote className="font-mono text-base sm:text-xl text-retro-text leading-relaxed mb-8">
            "Pxlkit is the best UI kit I&apos;ve used in years. The attention to detail
            in the pixel art, the component APIs, and the TypeScript support is second to none."
          </blockquote>

          {/* Author */}
          <div className="flex flex-col items-center gap-3">
            <PixelAvatar initials="JR" size="lg" />
            <div>
              <div className="font-pixel text-xs text-retro-text">Jordan Rivers</div>
              <div className="font-mono text-xs text-retro-muted mt-1">CTO · Pixel Ventures</div>
            </div>
          </div>
        </PixelFadeIn>
      </div>
    </PixelSection>
  );
}
`;

const testimonialSlider = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { ArrowRight } from '@pxlkit/ui';
import { SocialStar } from '@pxlkit/social';
import {
  PixelCard,
  PixelAvatar,
  PixelButton,
  PixelPagination,
  PixelSection,
} from '@pxlkit/ui-kit';

const ITEMS = [
  {
    quote: 'The pixel-art components are gorgeous and the developer experience is top notch.',
    author: 'Alex R.',
    role: 'Frontend Dev',
    initials: 'AR',
  },
  {
    quote: 'Our app looks completely unique thanks to Pxlkit. Users love the retro aesthetic.',
    author: 'Sam C.',
    role: 'Full-stack Dev',
    initials: 'SC',
  },
  {
    quote: 'Best investment we made. Saved weeks of design and dev time on our dashboard.',
    author: 'Morgan B.',
    role: 'Product Designer',
    initials: 'MB',
  },
];

export function TestimonialSlider() {
  const [page, setPage] = useState(1);
  const item = ITEMS[page - 1];

  return (
    <PixelSection className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-pixel text-xl text-retro-text leading-loose mb-10">
          Loved by developers
        </h2>

        <PixelCard className="p-8 mb-6">
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <PxlKitIcon key={i} icon={SocialStar} size={14} colorful />
            ))}
          </div>
          <p className="font-mono text-sm text-retro-text leading-relaxed mb-6">
            "{item.quote}"
          </p>
          <div className="flex items-center justify-center gap-3">
            <PixelAvatar initials={item.initials} size="sm" />
            <div className="text-left">
              <div className="font-mono text-xs text-retro-text font-semibold">{item.author}</div>
              <div className="font-mono text-[10px] text-retro-muted">{item.role}</div>
            </div>
          </div>
        </PixelCard>

        <div className="flex justify-center">
          <PixelPagination
            total={ITEMS.length}
            page={page}
            perPage={1}
            onChange={setPage}
          />
        </div>
      </div>
    </PixelSection>
  );
}
`;

export const testimonialsSection: TemplateSection = {
  id: 'testimonials',
  name: 'Testimonials',
  description: 'Social proof sections — grid cards, large featured quote, and paginated slider.',
  icon: '💬',
  variants: [
    {
      id: 'testimonials-cards',
      name: 'Testimonial Cards',
      description: '3-column grid of testimonial cards with star ratings and author info.',
      installCmd: INSTALL,
      code: testimonialCards,
    },
    {
      id: 'testimonials-large',
      name: 'Large Quote',
      description: 'Single full-width featured testimonial with large text and avatar.',
      installCmd: INSTALL,
      code: largeQuote,
    },
    {
      id: 'testimonials-slider',
      name: 'Slider with Pagination',
      description: 'Paginated testimonial carousel using PixelPagination.',
      installCmd: 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social',
      code: testimonialSlider,
    },
  ],
};
