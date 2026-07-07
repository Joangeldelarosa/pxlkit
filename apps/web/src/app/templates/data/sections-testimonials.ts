import type { TemplateSection } from '../types';

const INSTALL = 'npm install @pxlkit/core @pxlkit/ui-kit @pxlkit/social @pxlkit/gamification';

const testimonialCards = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import {
  PixelTestimonialCard,
  PixelFadeIn,
  PixelContainer,
  PixelSectionHeader,
  PixelGrid,
} from '@pxlkit/ui-kit';

const TESTIMONIALS = [
  {
    quote: 'Pxlkit completely changed how I build UIs. The pixel-art aesthetic is so unique and the DX is amazing.',
    author: 'Alex Rivera',
    role: 'Frontend Engineer',
    company: 'Indie Studio',
    stars: 5,
  },
  {
    quote: 'Went from zero to shipped in a weekend. The components just work and look incredible out of the box.',
    author: 'Sam Chen',
    role: 'Full-stack Developer',
    company: 'StartupXYZ',
    stars: 5,
  },
  {
    quote: 'Our game landing page got 3× more engagement after switching to Pxlkit. The retro aesthetic resonates.',
    author: 'Morgan Blake',
    role: 'Product Designer',
    company: 'GameDev Co',
    stars: 5,
  },
];

export function TestimonialCards() {
  return (
    <PixelContainer
      as="section"
      maxWidth="3xl"
      padding="lg"
      className="bg-retro-surface/20"
      aria-labelledby="testimonials-title"
    >
      <PixelSectionHeader
        id="testimonials-title"
        align="center"
        size="md"
        title="What developers say"
        description="Join thousands of developers who ship with Pxlkit."
      />

      <div className="mt-10">
        <PixelGrid cols={{ base: 1, md: 3 }} gap={6}>
          {TESTIMONIALS.map((t, i) => (
            <PixelFadeIn key={t.author} delay={i * 100}>
              <PixelTestimonialCard
                className="h-full"
                quote={t.quote}
                name={t.author}
                role={t.role}
                company={t.company}
                stars={t.stars}
                avatar={{ name: t.author }}
              />
            </PixelFadeIn>
          ))}
        </PixelGrid>
      </div>
    </PixelContainer>
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
  PixelContainer,
  PixelStack,
  PixelCluster,
} from '@pxlkit/ui-kit';

export function LargeQuote() {
  return (
    <PixelContainer as="section" maxWidth="md" padding="xl">
      <PixelFadeIn>
        <PixelStack gap={6} align="center" className="text-center">
          {/* Decoration */}
          <PixelCluster gap={2} justify="center">
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
            <AnimatedPxlKitIcon icon={SparkleStar} size={20} colorful />
            <AnimatedPxlKitIcon icon={SparkleStar} size={28} colorful />
          </PixelCluster>

          {/* Stars */}
          <PixelCluster gap={1} justify="center">
            {Array.from({ length: 5 }).map((_, i) => (
              <PxlKitIcon key={i} icon={SocialStar} size={18} colorful />
            ))}
          </PixelCluster>

          {/* Big quote */}
          <blockquote className="font-mono text-base sm:text-xl text-retro-text leading-relaxed">
            "Pxlkit is the best UI kit I&apos;ve used in years. The attention to detail
            in the pixel art, the component APIs, and the TypeScript support is second to none."
          </blockquote>

          {/* Author */}
          <PixelStack gap={3} align="center">
            <PixelAvatar name="Jordan Rivers" size="lg" />
            <div>
              <div className="font-pixel text-xs text-retro-text">Jordan Rivers</div>
              <div className="font-mono text-xs text-retro-muted mt-1">CTO · Pixel Ventures</div>
            </div>
          </PixelStack>
        </PixelStack>
      </PixelFadeIn>
    </PixelContainer>
  );
}
`;

const testimonialSlider = `\
'use client';
import '@pxlkit/ui-kit/styles.css';
import { useState } from 'react';
import {
  PixelTestimonialCard,
  PixelPagination,
  PixelContainer,
  PixelSectionHeader,
} from '@pxlkit/ui-kit';

const ITEMS = [
  {
    quote: 'The pixel-art components are gorgeous and the developer experience is top notch.',
    author: 'Alex R.',
    role: 'Frontend Dev',
  },
  {
    quote: 'Our app looks completely unique thanks to Pxlkit. Users love the retro aesthetic.',
    author: 'Sam C.',
    role: 'Full-stack Dev',
  },
  {
    quote: 'Best investment we made. Saved weeks of design and dev time on our dashboard.',
    author: 'Morgan B.',
    role: 'Product Designer',
  },
];

export function TestimonialSlider() {
  const [page, setPage] = useState(1);
  const item = ITEMS[page - 1];

  return (
    <PixelContainer as="section" maxWidth="sm" padding="lg" aria-labelledby="slider-title">
      <PixelSectionHeader
        id="slider-title"
        align="center"
        size="sm"
        title="Loved by developers"
      />

      <div className="mt-10">
        <PixelTestimonialCard
          quote={item.quote}
          name={item.author}
          role={item.role}
          stars={5}
          avatar={{ name: item.author }}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <PixelPagination
          total={ITEMS.length}
          page={page}
          onChange={setPage}
        />
      </div>
    </PixelContainer>
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
      installCmd: 'npm install @pxlkit/ui-kit',
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
      installCmd: 'npm install @pxlkit/ui-kit',
      code: testimonialSlider,
    },
  ],
};
