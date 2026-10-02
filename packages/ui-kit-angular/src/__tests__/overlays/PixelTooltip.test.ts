/**
 * <pxl-tooltip>: [(open)] and the uncontrolled default, the delays of each
 * trigger, dismissal, the element it describes and content templates.
 * Rendering and the shared interactions are covered against React by the
 * parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { TooltipDelay, TooltipTrigger } from '@pxlkit/ui-kit-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { elapse, useRealTime, useSimulatedTime } from '../../../../../scripts/parity/clock';
import { PixelTooltip } from '../../public-api';

const tooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]');
const wrapper = () => document.querySelector<HTMLElement>('span.relative')!;
const button = () => wrapper().querySelector('button')!;
/** Moves the simulated clock: the delays fire exactly when they are due. */
const wait = elapse;

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  // On simulated time, the change detection Angular schedules on a timer
  // runs only as the clock moves, and a zero-delay timer set while the clock
  // moves is due a millisecond later: step it a millisecond at a time until
  // nothing is pending, a few milliseconds against the delays under test.
  const stable = async () => {
    for (let round = 0; round < 20 && !fixture.isStable(); round++) await wait(1);
    await fixture.whenStable();
  };
  const settle = async () => {
    await stable();
    await wait(0);
    await stable();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, settle };
}

@Component({
  imports: [PixelTooltip],
  template: `
    <pxl-tooltip [(open)]="open" label="Tip" [trigger]="trigger()" [delay]="delay()">
      <button type="button">trigger</button>
    </pxl-tooltip>
  `,
})
class Bound {
  readonly open = signal(false);
  readonly trigger = signal<TooltipTrigger>('hover');
  readonly delay = signal<TooltipDelay | undefined>({ open: 40, close: 40 });
}

beforeEach(() => {
  useSimulatedTime();
});

afterEach(() => {
  useRealTime();
  document.body.innerHTML = '';
});

describe('PixelTooltip', () => {
  it('opens an [(open)] binding after the hover delay and closes it after the leave delay', async () => {
    const { fixture, host, settle } = await render(Bound);
    wrapper().dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(host.open()).toBe(false);
    await wait(60);
    await settle();
    expect(host.open()).toBe(true);
    expect(tooltip()!.textContent!.trim()).toBe('Tip');
    expect(button().getAttribute('aria-describedby')).toBe(tooltip()!.id);
    expect(wrapper().hasAttribute('aria-describedby')).toBe(false);
    wrapper().dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(host.open()).toBe(true);
    await wait(60);
    await settle();
    expect(host.open()).toBe(false);
    expect(tooltip()).toBeNull();
    expect(button().hasAttribute('aria-describedby')).toBe(false);
    fixture.destroy();
  });

  it('opens on focus only for the focus trigger, and drops a pending open when destroyed', async () => {
    const { fixture, host, settle } = await render(Bound);
    host.trigger.set('focus');
    host.delay.set(0);
    await settle();
    wrapper().dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(host.open()).toBe(false);
    button().focus();
    await settle();
    expect(host.open()).toBe(true);
    button().blur();
    await wait(120);
    await settle();
    expect(host.open()).toBe(false);

    // A timer left running would set the model of the destroyed component,
    // which Angular reports.
    const warn = vi.spyOn(console, 'warn');
    host.delay.set({ open: 40 });
    await settle();
    button().focus();
    fixture.destroy();
    await wait(60);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('toggles a click tooltip and closes it on Escape and on a press outside, not inside', async () => {
    const { fixture, host, settle } = await render(Bound);
    host.trigger.set('click');
    await settle();
    button().click();
    await settle();
    expect(host.open()).toBe(true);
    tooltip()!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(host.open()).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(host.open()).toBe(false);
    button().click();
    await settle();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(host.open()).toBe(false);

    // A hover tooltip ignores a press outside, and stays closed after Escape
    // until the pointer leaves and comes back.
    host.trigger.set('hover');
    host.delay.set(0);
    await settle();
    wrapper().dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(host.open()).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(host.open()).toBe(false);
    wrapper().dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(host.open()).toBe(false);
    wrapper().dispatchEvent(new MouseEvent('mouseleave'));
    wrapper().dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(host.open()).toBe(true);
    fixture.destroy();
  });

  it('drops a pending open on Escape, reporting no change, and ignores Escape while closed', async () => {
    @Component({
      imports: [PixelTooltip],
      template: `
        <pxl-tooltip label="Tip" [delay]="{ open: 40 }" (openChange)="changes.push($event)">
          <button type="button">trigger</button>
        </pxl-tooltip>
      `,
    })
    class Host {
      readonly changes: Array<boolean | undefined> = [];
    }
    const { fixture, host, settle } = await render(Host);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    wrapper().dispatchEvent(new MouseEvent('mouseenter'));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wait(60);
    await settle();
    expect(tooltip()).toBeNull();
    expect(host.changes).toEqual([]);
    fixture.destroy();
  });

  it('describes the trigger along with its own references, or the wrapper when nothing inside takes focus', async () => {
    @Component({
      imports: [PixelTooltip],
      template: `
        <pxl-tooltip [open]="open()" label="Tip"><button type="button" aria-describedby="hint">a</button></pxl-tooltip>
        <pxl-tooltip [open]="open()" label="Plain"><span>text</span></pxl-tooltip>
      `,
    })
    class Host {
      readonly open = signal(true);
    }
    const { fixture, host, settle } = await render(Host);
    const [tip, plainTip] = Array.from(document.querySelectorAll('[role="tooltip"]'));
    const [buttonWrapper, textWrapper] = Array.from(document.querySelectorAll<HTMLElement>('span.relative'));
    const described = buttonWrapper!.querySelector('button')!;
    expect(described.getAttribute('aria-describedby')).toBe(`hint ${tip!.id}`);
    expect(buttonWrapper!.hasAttribute('aria-describedby')).toBe(false);
    expect(textWrapper!.getAttribute('aria-describedby')).toBe(plainTip!.id);
    host.open.set(false);
    await settle();
    expect(described.getAttribute('aria-describedby')).toBe('hint');
    expect(textWrapper!.hasAttribute('aria-describedby')).toBe(false);
    fixture.destroy();
  });

  it('starts from defaultOpen while uncontrolled and reports every change', async () => {
    @Component({
      imports: [PixelTooltip],
      template: `
        <pxl-tooltip defaultOpen trigger="click" label="Tip" (openChange)="changes.push($event)">
          <button type="button">trigger</button>
        </pxl-tooltip>
      `,
    })
    class Host {
      readonly changes: Array<boolean | undefined> = [];
    }
    const { fixture, host, settle } = await render(Host);
    expect(tooltip()).not.toBeNull();
    button().click();
    await settle();
    expect(tooltip()).toBeNull();
    expect(host.changes).toEqual([false]);
    fixture.destroy();
  });

  it('renders a content template in place of the label, and nothing without either', async () => {
    @Component({
      imports: [PixelTooltip],
      template: `
        <pxl-tooltip [open]="true" label="Tip" [content]="rich"><button type="button">a</button></pxl-tooltip>
        <pxl-tooltip [open]="true"><button type="button">b</button></pxl-tooltip>
        <ng-template #rich><b>rich</b></ng-template>
      `,
    })
    class Host {}
    const { fixture } = await render(Host);
    expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
    expect(tooltip()!.querySelector('b')!.textContent).toBe('rich');
    fixture.destroy();
  });
});
