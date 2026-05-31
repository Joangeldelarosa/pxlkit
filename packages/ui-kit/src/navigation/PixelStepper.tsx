'use client';

import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import {
  Surface,
  cn,
  focusRing,
  surfaceClasses,
  toneMap,
  useEffectiveSurface,
  CheckIcon,
  CloseIcon,
} from '../common';

type Size = 'sm' | 'md' | 'lg';
type StepState = 'pending' | 'active' | 'completed' | 'error';

interface StepperCtx {
  active: number;
  orientation: 'horizontal' | 'vertical';
  allowNextStepsSelect: boolean;
  onStepClick?: (idx: number) => void;
  size: Size;
  surface: Surface;
  total: number;
  registerStep: (idx: number, el: HTMLDivElement | null) => void;
  focusByOffset: (currentIdx: number, offset: number) => void;
  focusEdge: (edge: 'first' | 'last') => void;
}

const StepperContext = React.createContext<StepperCtx | null>(null);
const StepIndexContext = React.createContext<number>(-1);

function useStepperCtx(): StepperCtx {
  const ctx = React.useContext(StepperContext);
  if (!ctx) {
    throw new Error('PixelStepper.Step must be used inside <PixelStepper>');
  }
  return ctx;
}

const indicatorSize: Record<Size, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

const labelSize: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
};

const descSize: Record<Size, string> = {
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-xs',
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 16 16"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden
      data-pxl-step-icon="loading"
    >
      <rect x="7" y="1" width="2" height="3" fill="currentColor" opacity="0.9" />
      <rect x="11" y="2" width="2" height="2" fill="currentColor" opacity="0.7" />
      <rect x="12" y="7" width="3" height="2" fill="currentColor" opacity="0.55" />
      <rect x="11" y="12" width="2" height="2" fill="currentColor" opacity="0.4" />
      <rect x="7" y="12" width="2" height="3" fill="currentColor" opacity="0.3" />
      <rect x="3" y="12" width="2" height="2" fill="currentColor" opacity="0.25" />
      <rect x="1" y="7" width="3" height="2" fill="currentColor" opacity="0.2" />
      <rect x="3" y="2" width="2" height="2" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelStepper.Step
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelStepperStepProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  completed?: boolean;
  error?: boolean;
  children?: React.ReactNode;
}

export const PixelStepperStep = forwardRef<HTMLDivElement, PixelStepperStepProps>(
  function PixelStepperStep(
    {
      label,
      description,
      icon,
      loading = false,
      completed = false,
      error = false,
      children: _children,
      className,
      onClick,
      ...rest
    },
    ref,
  ) {
    const ctx = useStepperCtx();
    const index = React.useContext(StepIndexContext);
    const s = surfaceClasses(ctx.surface);

    const isActive = index === ctx.active;
    const state: StepState = error
      ? 'error'
      : completed
        ? 'completed'
        : isActive
          ? 'active'
          : 'pending';

    const clickable = !!ctx.onStepClick && (ctx.allowNextStepsSelect || index <= ctx.active);

    const tone =
      state === 'error' ? 'red' : state === 'completed' ? 'green' : state === 'active' ? 'cyan' : 'neutral';
    const t = toneMap[tone];

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (clickable) ctx.onStepClick?.(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isVertical = ctx.orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      switch (e.key) {
        case nextKey:
          e.preventDefault();
          ctx.focusByOffset(index, 1);
          return;
        case prevKey:
          e.preventDefault();
          ctx.focusByOffset(index, -1);
          return;
        case 'Home':
          e.preventDefault();
          ctx.focusEdge('first');
          return;
        case 'End':
          e.preventDefault();
          ctx.focusEdge('last');
          return;
        case 'Enter':
        case ' ':
          if (!clickable) return;
          e.preventDefault();
          ctx.onStepClick?.(index);
          return;
        default:
          return;
      }
    };

    const indicatorContent: React.ReactNode = (() => {
      if (loading) {
        return <Spinner className={cn('h-3.5 w-3.5', t.text)} />;
      }
      if (state === 'completed') {
        return (
          <span data-pxl-step-icon="check" className={cn('inline-flex', t.text)}>
            <CheckIcon />
          </span>
        );
      }
      if (state === 'error') {
        return (
          <span data-pxl-step-icon="error" className={cn('inline-flex', t.text)}>
            <CloseIcon />
          </span>
        );
      }
      if (icon) {
        return (
          <span data-pxl-step-icon="custom" className={cn('inline-flex', t.text)} aria-hidden>
            {icon}
          </span>
        );
      }
      return <span className={cn('font-semibold', s.font, t.text)}>{index + 1}</span>;
    })();

    const ariaLabel = `Step ${index + 1} of ${ctx.total}: ${label}${
      state === 'completed' ? ' (completed)' : state === 'error' ? ' (error)' : state === 'active' ? ' (current)' : ''
    }`;

    const isVertical = ctx.orientation === 'vertical';

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        ctx.registerStep(index, node);
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ctx, index, ref],
    );

    return (
      <div
        ref={setRefs}
        data-pxl-step="true"
        data-pxl-step-index={index}
        data-pxl-step-state={state}
        aria-current={isActive ? 'step' : undefined}
        aria-label={ariaLabel}
        tabIndex={clickable ? 0 : -1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative flex',
          isVertical ? 'flex-row items-start gap-3' : 'flex-1 flex-col items-center text-center gap-1.5',
          clickable && cn('cursor-pointer outline-none', focusRing, t.ring, 'rounded-[2px]'),
          !clickable && 'cursor-default',
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          data-pxl-step-indicator="true"
          className={cn(
            'inline-flex items-center justify-center shrink-0',
            indicatorSize[ctx.size],
            s.border,
            s.radius,
            s.transition,
            t.border,
            state === 'pending' ? 'bg-retro-surface/40' : t.bg,
            state === 'active' && 'ring-2 ring-offset-1 ring-offset-retro-bg',
            state === 'active' && t.ring.replace('focus-visible:', ''),
          )}
        >
          {indicatorContent}
        </span>
        <div
          className={cn(
            'flex flex-col',
            isVertical ? 'items-start pt-0.5' : 'items-center',
          )}
        >
          <span
            data-pxl-step-label="true"
            className={cn(
              labelSize[ctx.size],
              s.font,
              'font-semibold leading-tight',
              state === 'pending' ? 'text-retro-muted' : t.text,
            )}
          >
            {label}
          </span>
          {description ? (
            <span
              data-pxl-step-description="true"
              className={cn(descSize[ctx.size], s.font, 'mt-0.5 text-retro-muted leading-snug')}
            >
              {description}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);
PixelStepperStep.displayName = 'PixelStepper.Step';

/* ──────────────────────────────────────────────────────────────────────────
   PixelStepper (root)
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelStepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  active: number;
  onStepClick?: (idx: number) => void;
  orientation?: 'horizontal' | 'vertical';
  allowNextStepsSelect?: boolean;
  size?: Size;
  surface?: Surface;
  /** Accessible name for the steps landmark. Defaults to "Progress steps". */
  ariaLabel?: string;
  children: React.ReactNode;
}

const PixelStepperRoot = forwardRef<HTMLDivElement, PixelStepperProps>(function PixelStepperRoot(
  {
    active,
    onStepClick,
    orientation = 'horizontal',
    allowNextStepsSelect = false,
    size = 'md',
    surface: surfaceProp,
    ariaLabel = 'Progress steps',
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const childArray = useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement),
    [children],
  );
  const total = childArray.length;

  const stepRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const registerStep = useCallback((idx: number, el: HTMLDivElement | null) => {
    if (el) stepRefs.current.set(idx, el);
    else stepRefs.current.delete(idx);
  }, []);

  const isClickableIdx = useCallback(
    (idx: number) => !!onStepClick && (allowNextStepsSelect || idx <= active),
    [onStepClick, allowNextStepsSelect, active],
  );

  const focusByOffset = useCallback(
    (currentIdx: number, offset: number) => {
      if (total === 0) return;
      const direction = offset > 0 ? 1 : -1;
      // Find next clickable in the requested direction, skipping non-focusables.
      let next = currentIdx + direction;
      while (next >= 0 && next < total) {
        if (isClickableIdx(next)) {
          stepRefs.current.get(next)?.focus();
          return;
        }
        next += direction;
      }
    },
    [total, isClickableIdx],
  );

  const focusEdge = useCallback(
    (edge: 'first' | 'last') => {
      if (total === 0) return;
      const range = edge === 'first'
        ? Array.from({ length: total }, (_, i) => i)
        : Array.from({ length: total }, (_, i) => total - 1 - i);
      for (const idx of range) {
        if (isClickableIdx(idx)) {
          stepRefs.current.get(idx)?.focus();
          return;
        }
      }
    },
    [total, isClickableIdx],
  );

  const ctx: StepperCtx = {
    active,
    orientation,
    allowNextStepsSelect,
    onStepClick,
    size,
    surface,
    total,
    registerStep,
    focusByOffset,
    focusEdge,
  };

  const isVertical = orientation === 'vertical';

  return (
    <StepperContext.Provider value={ctx}>
      <div
        ref={ref}
        data-pxl-stepper="true"
        data-pxl-orientation={orientation}
        role="group"
        aria-label={ariaLabel}
        className={cn(
          'w-full',
          isVertical ? 'flex flex-col gap-0' : 'flex items-start gap-0',
          s.font,
          className,
        )}
        {...rest}
      >
        {childArray.map((child, i) => {
          const isLast = i === total - 1;
          const nextState: StepState = i < active ? 'completed' : i === active ? 'active' : 'pending';
          const connectorTone = nextState === 'completed' ? 'green' : 'neutral';
          const ct = toneMap[connectorTone];

          if (isVertical) {
            return (
              <div key={i} className="flex flex-col">
                <StepIndexContext.Provider value={i}>{child}</StepIndexContext.Provider>
                {!isLast ? (
                  <span
                    aria-hidden
                    data-pxl-step-connector="true"
                    data-pxl-step-connector-orientation="vertical"
                    className={cn(
                      'mx-auto my-1 block w-0.5 self-start',
                      // Align with center of indicator on the left
                      size === 'sm' ? 'ml-3' : size === 'md' ? 'ml-4' : 'ml-5',
                      'h-6',
                      nextState === 'completed' ? ct.fill : 'bg-retro-border/40',
                    )}
                  />
                ) : null}
              </div>
            );
          }

          return (
            <React.Fragment key={i}>
              <StepIndexContext.Provider value={i}>{child}</StepIndexContext.Provider>
              {!isLast ? (
                <hr
                  aria-hidden
                  data-pxl-step-connector="true"
                  data-pxl-step-connector-orientation="horizontal"
                  className={cn(
                    'flex-1 border-0 h-0.5 self-start',
                    size === 'sm' ? 'mt-3' : size === 'md' ? 'mt-4' : 'mt-5',
                    'mx-1',
                    nextState === 'completed' ? ct.fill : 'bg-retro-border/40',
                  )}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </StepperContext.Provider>
  );
});
PixelStepperRoot.displayName = 'PixelStepper';

/* ── Namespace export — dot-notation compound component ──────────────── */

type PixelStepperNamespace = typeof PixelStepperRoot & {
  Step: typeof PixelStepperStep;
};

const PixelStepperBase = PixelStepperRoot as PixelStepperNamespace;
PixelStepperBase.Step = PixelStepperStep;

export const PixelStepper = PixelStepperBase;
