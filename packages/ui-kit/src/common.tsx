'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';



export type Tone = 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'neutral';
export type Size = 'sm' | 'md' | 'lg';
export type Option = { value: string; label: string; icon?: React.ReactNode };
export type TabItem = { id: string; label: string; icon?: React.ReactNode; content: React.ReactNode };
export type AccordionItem = { id: string; title: string; content: React.ReactNode };



export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}



export const toneMap: Record<Tone, { ring: string; text: string; border: string; bg: string; soft: string; hover: string; fill: string }> = {
  green: {
    ring: 'focus-visible:ring-retro-green/40',
    text: 'text-retro-green',
    border: 'border-retro-green/40',
    bg: 'bg-retro-green/10',
    soft: 'bg-retro-green/5',
    hover: 'hover:bg-retro-green/15',
    fill: 'bg-retro-green',
  },
  cyan: {
    ring: 'focus-visible:ring-retro-cyan/40',
    text: 'text-retro-cyan',
    border: 'border-retro-cyan/40',
    bg: 'bg-retro-cyan/10',
    soft: 'bg-retro-cyan/5',
    hover: 'hover:bg-retro-cyan/15',
    fill: 'bg-retro-cyan',
  },
  gold: {
    ring: 'focus-visible:ring-retro-gold/40',
    text: 'text-retro-gold',
    border: 'border-retro-gold/40',
    bg: 'bg-retro-gold/10',
    soft: 'bg-retro-gold/5',
    hover: 'hover:bg-retro-gold/15',
    fill: 'bg-retro-gold',
  },
  red: {
    ring: 'focus-visible:ring-retro-red/40',
    text: 'text-retro-red',
    border: 'border-retro-red/40',
    bg: 'bg-retro-red/10',
    soft: 'bg-retro-red/5',
    hover: 'hover:bg-retro-red/15',
    fill: 'bg-retro-red',
  },
  purple: {
    ring: 'focus-visible:ring-retro-purple/40',
    text: 'text-retro-purple',
    border: 'border-retro-purple/40',
    bg: 'bg-retro-purple/10',
    soft: 'bg-retro-purple/5',
    hover: 'hover:bg-retro-purple/15',
    fill: 'bg-retro-purple',
  },
  neutral: {
    ring: 'focus-visible:ring-retro-border/60',
    text: 'text-retro-text',
    border: 'border-retro-border',
    bg: 'bg-retro-surface',
    soft: 'bg-retro-surface/50',
    hover: 'hover:bg-retro-surface/80',
    fill: 'bg-retro-text',
  },
};

export const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

export const focusRing = 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg';

export const inputBase =
  'w-full rounded-md border bg-retro-bg/70 text-retro-text font-mono transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed';



export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-2.5 w-2.5 shrink-0', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="2" width="1" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="3" y="4" width="2" height="1" />
      <rect x="5" y="3" width="1" height="1" />
      <rect x="6" y="2" width="1" height="1" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-3 w-3', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="6" y="1" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="4" y="3" width="1" height="1" />
      <rect x="3" y="4" width="1" height="1" />
      <rect x="2" y="4" width="1" height="1" />
      <rect x="1" y="3" width="1" height="1" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-3 w-3', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}



export function FieldShell({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-xs font-mono text-retro-muted">{label}</span>}
      {children}
      {error ? (
        <span className="text-xs font-mono text-retro-red">{error}</span>
      ) : hint ? (
        <span className="text-xs font-mono text-retro-muted">{hint}</span>
      ) : null}
    </label>
  );
}

