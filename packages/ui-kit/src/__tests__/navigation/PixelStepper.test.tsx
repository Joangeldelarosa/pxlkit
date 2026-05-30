import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelStepper } from '../../navigation/PixelStepper';

function getSteps(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-pxl-step="true"]'));
}

describe('PixelStepper', () => {
  it('renders N steps', () => {
    const { container } = render(
      <PixelStepper active={0}>
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
        <PixelStepper.Step label="Three" />
      </PixelStepper>,
    );
    const steps = getSteps(container);
    expect(steps.length).toBe(3);
    expect(steps[0]).toHaveTextContent('One');
    expect(steps[1]).toHaveTextContent('Two');
    expect(steps[2]).toHaveTextContent('Three');
  });

  it('active=1 highlights second step', () => {
    const { container } = render(
      <PixelStepper active={1}>
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
        <PixelStepper.Step label="Three" />
      </PixelStepper>,
    );
    const steps = getSteps(container);
    expect(steps[1].getAttribute('data-pxl-step-state')).toBe('active');
    expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(steps[0].getAttribute('data-pxl-step-state')).not.toBe('active');
    expect(steps[2].getAttribute('data-pxl-step-state')).not.toBe('active');
  });

  it('completed step shows check', () => {
    const { container } = render(
      <PixelStepper active={2}>
        <PixelStepper.Step label="One" completed />
        <PixelStepper.Step label="Two" completed />
        <PixelStepper.Step label="Three" />
      </PixelStepper>,
    );
    const steps = getSteps(container);
    expect(steps[0].querySelector('[data-pxl-step-icon="check"]')).toBeTruthy();
    expect(steps[1].querySelector('[data-pxl-step-icon="check"]')).toBeTruthy();
    expect(steps[2].querySelector('[data-pxl-step-icon="check"]')).toBeFalsy();
  });

  it('error step shows red x', () => {
    const { container } = render(
      <PixelStepper active={1}>
        <PixelStepper.Step label="One" completed />
        <PixelStepper.Step label="Two" error />
        <PixelStepper.Step label="Three" />
      </PixelStepper>,
    );
    const steps = getSteps(container);
    const errorIcon = steps[1].querySelector('[data-pxl-step-icon="error"]');
    expect(errorIcon).toBeTruthy();
    expect(steps[1].getAttribute('data-pxl-step-state')).toBe('error');
  });

  it('orientation=vertical renders vertical layout', () => {
    const { container } = render(
      <PixelStepper active={0} orientation="vertical">
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
      </PixelStepper>,
    );
    const root = container.querySelector('[data-pxl-stepper="true"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('data-pxl-orientation')).toBe('vertical');
    // role=group + accessible name (default "Progress steps"); no aria-orientation
    // (not valid on role=group per WAI-ARIA).
    expect(root.getAttribute('role')).toBe('group');
    expect(root.getAttribute('aria-label')).toBe('Progress steps');
  });

  it('onStepClick fires for past steps but not future', () => {
    const onStepClick = vi.fn();
    const { container } = render(
      <PixelStepper active={2} onStepClick={onStepClick}>
        <PixelStepper.Step label="One" completed />
        <PixelStepper.Step label="Two" completed />
        <PixelStepper.Step label="Three" />
        <PixelStepper.Step label="Four" />
      </PixelStepper>,
    );
    const steps = getSteps(container);
    // Past step click should fire
    fireEvent.click(steps[0]);
    expect(onStepClick).toHaveBeenLastCalledWith(0);
    fireEvent.click(steps[1]);
    expect(onStepClick).toHaveBeenLastCalledWith(1);
    // Active step click is allowed (idx <= active)
    fireEvent.click(steps[2]);
    expect(onStepClick).toHaveBeenLastCalledWith(2);
    // Future step should NOT fire
    onStepClick.mockClear();
    fireEvent.click(steps[3]);
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('allowNextStepsSelect=true permits clicking future steps', () => {
    const onStepClick = vi.fn();
    const { container } = render(
      <PixelStepper active={0} allowNextStepsSelect onStepClick={onStepClick}>
        <PixelStepper.Step label="One" />
        <PixelStepper.Step label="Two" />
        <PixelStepper.Step label="Three" />
      </PixelStepper>,
    );
    const steps = getSteps(container);
    fireEvent.click(steps[2]);
    expect(onStepClick).toHaveBeenCalledWith(2);
  });
});
