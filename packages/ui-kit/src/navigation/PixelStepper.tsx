'use client';

import React, { forwardRef, useCallback, useId, useMemo, useRef } from 'react';
import {
  stepAriaLabel,
  stepClasses,
  stepClickable,
  stepConnectorClasses,
  stepConnectorCompleted,
  stepHiddenText,
  stepIndicator,
  stepSpinner,
  stepState,
  stepperClasses,
  stepperFocusTarget,
  stepperKeyAction,
  stepperSlotClasses,
  type StepperMove,
  type StepperOrientation,
  type StepperSize,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
  CheckIcon,
  CloseIcon,
} from '../common';

interface StepperCtx {
  active: number;
  orientation: StepperOrientation;
  allowNextStepsSelect: boolean;
  onStepClick?: (idx: number) => void;
  size: StepperSize;
  surface: Surface;
  total: number;
  registerStep: (idx: number, el: HTMLDivElement | null) => void;
  /** Focuses the clickable step a key moves to from step `from`, if any. */
  moveFocus: (from: number, move: StepperMove) => void;
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

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={stepSpinner.viewBox}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden
      data-pxl-step-icon="loading"
    >
      {stepSpinner.rects.map(([x, y, width, height, opacity]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} fill="currentColor" opacity={opacity} />
      ))}
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

    const isActive = index === ctx.active;
    const state = stepState(index, ctx.active, { completed, error });
    const clickable = stepClickable(index, ctx.active, {
      handler: !!ctx.onStepClick,
      allowNextStepsSelect: ctx.allowNextStepsSelect,
    });
    const classes = stepClasses(ctx.surface, { orientation: ctx.orientation, size: ctx.size, state, clickable });

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (clickable) ctx.onStepClick?.(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const action = stepperKeyAction(e.key, ctx.orientation);
      if (action === undefined) return;
      if (action === 'select') {
        if (!clickable) return;
        e.preventDefault();
        ctx.onStepClick?.(index);
        return;
      }
      e.preventDefault();
      ctx.moveFocus(index, action);
    };

    const indicatorContent: React.ReactNode = (() => {
      switch (stepIndicator(state, { loading, icon: !!icon })) {
        case 'loading':
          return <Spinner className={classes.spinner} />;
        case 'check':
          return (
            <span data-pxl-step-icon="check" className={classes.icon}>
              <CheckIcon />
            </span>
          );
        case 'error':
          return (
            <span data-pxl-step-icon="error" className={classes.icon}>
              <CloseIcon />
            </span>
          );
        case 'custom':
          return (
            <span data-pxl-step-icon="custom" className={classes.icon} aria-hidden>
              {icon}
            </span>
          );
        default:
          return <span className={classes.number}>{index + 1}</span>;
      }
    })();

    const hidden = stepHiddenText(index, ctx.total, state);
    const descriptionId = useId();

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
        // A clickable step is a button named by its position, label and
        // state; any other step reads them as visually hidden text, since an
        // element without a role cannot take a name.
        role={clickable ? 'button' : undefined}
        aria-current={isActive ? 'step' : undefined}
        aria-label={clickable ? stepAriaLabel(index, ctx.total, label, state) : undefined}
        aria-describedby={clickable && description ? descriptionId : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(classes.root, className)}
        {...rest}
      >
        <span
          aria-hidden
          data-pxl-step-indicator="true"
          className={classes.indicator}
        >
          {indicatorContent}
        </span>
        <div className={classes.body}>
          {!clickable && <span className={classes.hidden}>{hidden.before}</span>}
          <span
            data-pxl-step-label="true"
            className={classes.label}
          >
            {label}
          </span>
          {!clickable && hidden.after && <span className={classes.hidden}>{hidden.after}</span>}
          {description ? (
            <span
              id={clickable ? descriptionId : undefined}
              data-pxl-step-description="true"
              className={classes.description}
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
  orientation?: StepperOrientation;
  allowNextStepsSelect?: boolean;
  size?: StepperSize;
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

  const moveFocus = useCallback(
    (from: number, move: StepperMove) => {
      const isClickable = (idx: number) =>
        stepClickable(idx, active, { handler: !!onStepClick, allowNextStepsSelect });
      const target = stepperFocusTarget(from, move, total, isClickable);
      if (target !== undefined) stepRefs.current.get(target)?.focus();
    },
    [total, onStepClick, allowNextStepsSelect, active],
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
    moveFocus,
  };

  return (
    <StepperContext.Provider value={ctx}>
      <div
        ref={ref}
        data-pxl-stepper="true"
        data-pxl-orientation={orientation}
        role="group"
        aria-label={ariaLabel}
        className={cn(stepperClasses(surface, orientation), className)}
        {...rest}
      >
        {childArray.map((child, i) => {
          const isLast = i === total - 1;
          const connectorClasses = stepConnectorClasses(orientation, size, stepConnectorCompleted(i, active));

          if (orientation === 'vertical') {
            return (
              <div key={i} className={stepperSlotClasses}>
                <StepIndexContext.Provider value={i}>{child}</StepIndexContext.Provider>
                {!isLast ? (
                  <span
                    aria-hidden
                    data-pxl-step-connector="true"
                    data-pxl-step-connector-orientation="vertical"
                    className={connectorClasses}
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
                  className={connectorClasses}
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
