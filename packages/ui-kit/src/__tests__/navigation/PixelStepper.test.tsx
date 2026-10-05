import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelStepper } from '../../navigation/PixelStepper';

function getSteps(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-pxl-step="true"]'));
}

describe('PixelStepper', () => {
  // A step shows its label, description and icon, as in Vue and Angular: it
  // has no content of its own (its type took children it never rendered).
  it('takes no children in a step', () => {
    const { container } = render(
      <PixelStepper active={0}>
        {/* @ts-expect-error — a step has no content of its own */}
        <PixelStepper.Step label="Account">Ignored</PixelStepper.Step>
      </PixelStepper>,
    );
    expect(getSteps(container)[0]).toHaveTextContent('Account');
    expect(container).not.toHaveTextContent('Ignored');
  });

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

  it('makes clickable steps buttons named by position, label and state, described by their description', () => {
    const { container } = render(
      <PixelStepper active={1} onStepClick={() => {}}>
        <PixelStepper.Step label="Account" completed />
        <PixelStepper.Step label="Shipping" description="Where it goes" />
        <PixelStepper.Step label="Payment" />
      </PixelStepper>,
    );
    const [account, shipping] = getSteps(container);
    expect(account.getAttribute('role')).toBe('button');
    expect(account.getAttribute('aria-label')).toBe('Step 1 of 3: Account (completed)');
    expect(shipping.getAttribute('aria-label')).toBe('Step 2 of 3: Shipping (current)');
    expect(document.getElementById(shipping.getAttribute('aria-describedby')!)).toHaveTextContent('Where it goes');
    expect(account.hasAttribute('aria-describedby')).toBe(false);
    expect(shipping.tabIndex).toBe(0);
    expect(shipping.querySelector('.sr-only')).toBeNull();
  });

  it('reads a step that is not clickable through visually hidden text, as ARIA forbids naming it', () => {
    const { container } = render(
      <PixelStepper active={1} onStepClick={() => {}}>
        <PixelStepper.Step label="Account" />
        <PixelStepper.Step label="Shipping" />
        <PixelStepper.Step label="Payment" description="Card or transfer" />
      </PixelStepper>,
    );
    const payment = getSteps(container)[2];
    for (const name of ['role', 'aria-label', 'aria-describedby', 'tabindex']) {
      expect(payment.hasAttribute(name)).toBe(false);
    }
    expect(Array.from(payment.querySelectorAll('.sr-only'), (node) => node.textContent)).toEqual(['Step 3 of 3: ']);

    const { container: plain } = render(
      <PixelStepper active={1}>
        <PixelStepper.Step label="Account" />
        <PixelStepper.Step label="Shipping" />
      </PixelStepper>,
    );
    const shipping = getSteps(plain)[1];
    expect(shipping.getAttribute('aria-current')).toBe('step');
    expect(Array.from(shipping.querySelectorAll('.sr-only'), (node) => node.textContent)).toEqual([
      'Step 2 of 2: ',
      ' (current)',
    ]);
  });
});

describe('PixelStepper — loading step', () => {
  it('turns the spinner of a loading step only for a reader who allows motion', () => {
    const { container } = render(
      <PixelStepper active={0}>
        <PixelStepper.Step label="Upload" loading />
        <PixelStepper.Step label="Done" />
      </PixelStepper>,
    );
    const spinner = container.querySelector('[data-pxl-step-icon="loading"]')!;
    const classes = spinner.getAttribute('class')!.split(' ');
    expect(classes).toContain('motion-safe:animate-spin');
    expect(classes).not.toContain('animate-spin');
  });
});
