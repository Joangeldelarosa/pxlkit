'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { PixelStatCard } from '@pxlkit/ui-kit';
import { useCountUp } from './useCountUp';

type Tone = 'gold' | 'green' | 'purple';

const STATS: { label: string; to: number; tone: Tone; suffix: string }[] = [
  { label: 'Components', to: 54, tone: 'gold', suffix: '+' },
  { label: 'Icons', to: 226, tone: 'green', suffix: '+' },
  { label: 'Themed packs', to: 7, tone: 'purple', suffix: '' },
];

function StatCardCountUp({
  to,
  label,
  tone,
  suffix,
  inView,
}: {
  to: number;
  label: string;
  tone: Tone;
  suffix: string;
  inView: boolean;
}) {
  const value = useCountUp({ to, duration: 700, start: inView });
  return <PixelStatCard label={label} value={`${value}${suffix}`} tone={tone} />;
}

/**
 * Strip of 3 PixelStatCards that count up the moment they enter the viewport.
 * Replaces the static TrustBar visually with the same role: social proof.
 */
export function StatCardStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <section
      ref={ref}
      data-testid="stat-card-strip"
      className="relative py-12 sm:py-16 px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {STATS.map((s) => (
          <StatCardCountUp key={s.label} {...s} inView={inView} />
        ))}
      </div>
    </section>
  );
}
