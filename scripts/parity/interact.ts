/**
 * Scripted interactions, performed identically on every framework's
 * rendering. Events are dispatched the way a browser does for a real user,
 * so React's delegated listeners, Vue's and Angular's element listeners all
 * see them.
 */

import { elapse } from './clock';
import { setPageVisibility } from './page';

export type ParityStep =
  | { action: 'click' | 'pointerdown' | 'hover' | 'unhover' | 'focus' | 'blur'; target: string; nth?: number }
  /** A failed resource load, as an `<img>` whose source cannot be fetched reports it. */
  | { action: 'error'; target: string; nth?: number }
  | {
      action: 'keydown';
      key: string;
      /** Defaults to the focused element. */
      target?: string;
      nth?: number;
      shiftKey?: boolean;
      ctrlKey?: boolean;
      metaKey?: boolean;
      altKey?: boolean;
    }
  | { action: 'input'; target: string; value: string; nth?: number }
  | { action: 'select'; target: string; value: string; nth?: number }
  /**
   * Lets `ms` of simulated time pass (see `clock.ts`), for components driven
   * by timers: every timeout, interval and animation frame due by then runs,
   * in each framework at the same step. To see a timer fire, wait at least
   * its delay; no margin is needed.
   */
  | { action: 'wait'; ms: number }
  /** The page hidden or shown again, as switching tabs does (see `page.ts`). */
  | { action: 'visibility'; state: 'hidden' | 'visible' }
  /** The window losing focus to another application, or getting it back: `blur` / `focus` on `window`. */
  | { action: 'window'; event: 'blur' | 'focus' };

export interface ParityScenario {
  /** Component name, as in its manifest. */
  component: string;
  /** Export name of the example the scenario starts from. */
  example: string;
  /** What the scenario checks. */
  name: string;
  /** Renders for a reader who prefers reduced motion (see `page.ts`). */
  reducedMotion?: boolean;
  steps: ParityStep[];
}

function resolve(target: string, nth = 0): HTMLElement {
  const found = document.querySelectorAll<HTMLElement>(target)[nth];
  if (!found) throw new Error(`Parity step target not found: ${target}${nth ? ` [${nth}]` : ''}`);
  return found;
}

// The steps act for a mouse, as `hover` implies: pointer events say so.
function pointer(type: string, init: PointerEventInit = {}): MouseEvent {
  const Ctor = (globalThis.PointerEvent ?? MouseEvent) as typeof PointerEvent;
  return new Ctor(type, { bubbles: true, cancelable: true, composed: true, button: 0, pointerType: 'mouse', ...init });
}

function mouse(type: string, init: MouseEventInit = {}): MouseEvent {
  return new MouseEvent(type, { bubbles: true, cancelable: true, composed: true, button: 0, ...init });
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  const proto = Object.getPrototypeOf(element) as object;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(element, value);
  else element.value = value;
}

/** Perform one step, then let the framework settle. */
export async function perform(step: ParityStep, flush: () => Promise<void>): Promise<void> {
  // A reader acts a moment after the page settled. Vue ignores an event as
  // old as its listener (one attached while the event was propagating), and
  // on a clock that never moved every event would look that old.
  await elapse(1);
  switch (step.action) {
    case 'click': {
      const el = resolve(step.target, step.nth);
      el.dispatchEvent(pointer('pointerdown'));
      el.dispatchEvent(mouse('mousedown'));
      if (typeof el.focus === 'function') el.focus();
      el.dispatchEvent(pointer('pointerup'));
      el.dispatchEvent(mouse('mouseup'));
      el.dispatchEvent(mouse('click', { detail: 1 }));
      break;
    }
    case 'pointerdown': {
      const el = resolve(step.target, step.nth);
      el.dispatchEvent(pointer('pointerdown'));
      el.dispatchEvent(mouse('mousedown'));
      break;
    }
    case 'hover': {
      const el = resolve(step.target, step.nth);
      el.dispatchEvent(pointer('pointerover'));
      el.dispatchEvent(pointer('pointerenter', { bubbles: false }));
      el.dispatchEvent(mouse('mouseover'));
      el.dispatchEvent(mouse('mouseenter', { bubbles: false }));
      break;
    }
    case 'unhover': {
      const el = resolve(step.target, step.nth);
      el.dispatchEvent(pointer('pointerout'));
      el.dispatchEvent(pointer('pointerleave', { bubbles: false }));
      el.dispatchEvent(mouse('mouseout'));
      el.dispatchEvent(mouse('mouseleave', { bubbles: false }));
      break;
    }
    case 'focus':
      resolve(step.target, step.nth).focus();
      break;
    case 'blur':
      resolve(step.target, step.nth).blur();
      break;
    case 'error':
      // Like the browser's, this `error` does not bubble.
      resolve(step.target, step.nth).dispatchEvent(new Event('error'));
      break;
    case 'keydown': {
      const el = step.target ? resolve(step.target, step.nth) : ((document.activeElement as HTMLElement | null) ?? document.body);
      const init: KeyboardEventInit = {
        key: step.key,
        bubbles: true,
        cancelable: true,
        composed: true,
        shiftKey: step.shiftKey,
        ctrlKey: step.ctrlKey,
        metaKey: step.metaKey,
        altKey: step.altKey,
      };
      el.dispatchEvent(new KeyboardEvent('keydown', init));
      el.dispatchEvent(new KeyboardEvent('keyup', init));
      break;
    }
    case 'input': {
      const el = resolve(step.target, step.nth) as HTMLInputElement | HTMLTextAreaElement;
      setNativeValue(el, step.value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      break;
    }
    case 'select': {
      const el = resolve(step.target, step.nth) as HTMLSelectElement;
      setNativeValue(el, step.value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      break;
    }
    case 'wait':
      await elapse(step.ms);
      break;
    case 'visibility':
      setPageVisibility(step.state);
      break;
    case 'window':
      window.dispatchEvent(new FocusEvent(step.event));
      break;
  }
  await flush();
}
