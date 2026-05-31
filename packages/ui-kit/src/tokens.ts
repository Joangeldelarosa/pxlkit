export const containerWidth = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  '3xl': 'max-w-7xl',
  '4xl': 'max-w-[1400px]',
  '5xl': 'max-w-[1600px]',
  '6xl': 'max-w-[1800px]',
  '7xl': 'max-w-[2000px]',
  prose: 'max-w-prose',
  full: 'max-w-none',
} as const;

export const pageGutter = {
  0: 'px-0',
  sm: 'px-3',
  md: 'px-4 sm:px-6',
  lg: 'px-4 sm:px-6 lg:px-8',
  xl: 'px-6 sm:px-8 lg:px-12',
} as const;

export const sectionRhythm = {
  none: 'py-0',
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-20 lg:py-24',
  xl: 'py-20 sm:py-28 lg:py-32',
} as const;

export const stackGap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
} as const;

export const rhythm = {
  eyebrowToHeadline: 'mt-5',
  headlineToSubline: 'mt-3',
  sublineToCtas: 'mt-7',
  ctasToMeta: 'mt-10',
  metaToInstall: 'mt-5',
} as const;

export const tone = {
  neutral: {
    border: 'border-retro-border',
    bg: 'bg-retro-surface/40',
    soft: 'bg-retro-surface/20',
    glow: 'shadow-[0_0_24px_-12px_rgba(0,0,0,0.4)]',
    ring: 'focus-visible:ring-retro-border',
    text: 'text-retro-text',
    fill: 'bg-retro-muted',
  },
  green: {
    border: 'border-retro-green/30',
    bg: 'bg-retro-green/18',
    soft: 'bg-retro-green/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]',
    ring: 'focus-visible:ring-retro-green/40',
    text: 'text-retro-green',
    fill: 'bg-retro-green',
  },
  cyan: {
    border: 'border-retro-cyan/30',
    bg: 'bg-retro-cyan/18',
    soft: 'bg-retro-cyan/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(14,165,233,0.45)]',
    ring: 'focus-visible:ring-retro-cyan/40',
    text: 'text-retro-cyan',
    fill: 'bg-retro-cyan',
  },
  gold: {
    border: 'border-retro-gold/30',
    bg: 'bg-retro-gold/18',
    soft: 'bg-retro-gold/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(234,179,8,0.45)]',
    ring: 'focus-visible:ring-retro-gold/40',
    text: 'text-retro-gold',
    fill: 'bg-retro-gold',
  },
  red: {
    border: 'border-retro-red/30',
    bg: 'bg-retro-red/18',
    soft: 'bg-retro-red/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(239,68,68,0.45)]',
    ring: 'focus-visible:ring-retro-red/40',
    text: 'text-retro-red',
    fill: 'bg-retro-red',
  },
  purple: {
    border: 'border-retro-purple/30',
    bg: 'bg-retro-purple/18',
    soft: 'bg-retro-purple/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(168,85,247,0.45)]',
    ring: 'focus-visible:ring-retro-purple/40',
    text: 'text-retro-purple',
    fill: 'bg-retro-purple',
  },
  pink: {
    border: 'border-retro-pink/30',
    bg: 'bg-retro-pink/18',
    soft: 'bg-retro-pink/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(236,72,153,0.45)]',
    ring: 'focus-visible:ring-retro-pink/40',
    text: 'text-retro-pink',
    fill: 'bg-retro-pink',
  },
} as const;

export const durations = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',
} as const;

export const easings = {
  standard: 'ease-out',
  bounce: 'ease-[cubic-bezier(.34,1.56,.64,1)]',
  linear: 'ease-linear',
} as const;

export type ContainerWidth = keyof typeof containerWidth;
export type PageGutter = keyof typeof pageGutter;
export type SectionRhythmKey = keyof typeof sectionRhythm;
export type StackGapKey = keyof typeof stackGap;
export type RhythmKey = keyof typeof rhythm;
export type ToneKey = keyof typeof tone;
