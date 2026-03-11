import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';



export function PixelAlert({
  title,
  message,
  tone = 'red',
  icon,
  action,
}: {
  title: string;
  message: string;
  tone?: Tone;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-lg border p-3', toneMap[tone].border, toneMap[tone].soft)} role="alert">
      <div className="flex items-start gap-2.5">
        {icon && <span className={cn('mt-0.5 shrink-0', toneMap[tone].text)}>{icon}</span>}
        <div className="flex-1">
          <p className={cn('font-mono text-xs font-semibold', toneMap[tone].text)}>{title}</p>
          <p className="mt-1 text-sm text-retro-muted">{message}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function PixelProgress({
  value,
  tone = 'green',
  label,
  showValue = true,
}: {
  value: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-mono text-retro-muted">
          {label && <span>{label}</span>}
          {showValue && <span className={toneMap[tone].text}>{safe}%</span>}
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full border border-retro-border bg-retro-surface/80">
        <div className={cn('h-full rounded-full transition-all duration-500', toneMap[tone].bg)} style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export function PixelSkeleton({
  width,
  height = '1rem',
  rounded = false,
  className,
}: {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('animate-pulse bg-retro-surface/80', rounded ? 'rounded-full' : 'rounded-md', className)}
      style={{ width, height }}
    />
  );
}

export function PixelEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-retro-border/60 bg-retro-surface/20 p-8 text-center">
      {icon && <div className="mb-3 flex justify-center text-retro-cyan">{icon}</div>}
      <h4 className="font-mono text-sm font-semibold text-retro-text">{title}</h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-retro-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

