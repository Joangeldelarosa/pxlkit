/**
 * The React kit's parallax components, as the reference for the motion the
 * manifest examples — and so the parity scenarios — cannot drive: the
 * harness has no mouse-move or scroll step. A test renders the same host in
 * both frameworks on a fake layout, replays the same steps on simulated
 * time and compares the DOM after each.
 */
import type { ComponentType } from 'react';
import type { Component } from 'vue';
import { vi } from 'vitest';
import { REDUCED_MOTION_QUERY } from '@pxlkit/ui-kit-core';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { useRealTime, useSimulatedTime } from '../../../../../scripts/parity/clock';
import { perform, type ParityStep } from '../../../../../scripts/parity/interact';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { installMatchMedia, type FakeMediaQueryList } from '../match-media';
import { mountVue } from '../vue';

// Loaded through `import.meta.glob`, so type-checking the tests never pulls
// the React sources into this program.
const [reactKit] = Object.values(
  import.meta.glob<Record<string, ComponentType<Record<string, unknown>>>>('../../../../ui-kit/src/parallax/index.ts', {
    eager: true,
  }),
);

/** A React parallax component, by name. */
export function reactParallax(name: string): ComponentType<Record<string, unknown>> {
  return reactKit![name]!;
}

/**
 * A parity step, the mouse moving to a point of the viewport, the page
 * scrolling to `y`, or the user's reduced-motion preference changing.
 */
export type ParallaxStep =
  | ParityStep
  | { action: 'mousemove'; clientX: number; clientY: number }
  | { action: 'scroll'; y: number }
  | { action: 'reduced-motion'; reduce: boolean };

export interface CompareOptions {
  /** The user's reduced-motion preference as the hosts mount; `matchMedia` is missing without it. */
  reducedMotion?: boolean;
}

/**
 * The box of every element, as jsdom lays nothing out: 400 × 200 px, 100 px
 * down the page — so a layer's centre is 200 px down — moving up as the page
 * scrolls.
 */
export const BOX = { left: 0, top: 100, width: 400, height: 200 };

function fakeLayout() {
  let scrollY = 0;
  const scroll = Object.getOwnPropertyDescriptor(window, 'scrollY')!;
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => {
    const top = BOX.top - scrollY;
    return { ...BOX, top, x: BOX.left, y: top, right: BOX.left + BOX.width, bottom: top + BOX.height } as DOMRect;
  });
  return {
    scrollTo(y: number) {
      scrollY = y;
      window.dispatchEvent(new Event('scroll'));
    },
    restore() {
      rect.mockRestore();
      Object.defineProperty(window, 'scrollY', scroll);
    },
  };
}

async function play(
  step: ParallaxStep,
  page: ReturnType<typeof fakeLayout>,
  lists: FakeMediaQueryList[],
  flush: () => Promise<void>,
): Promise<void> {
  if (step.action === 'mousemove') {
    // A mouse moves the pointer too; both bubble from the element under it.
    const init = { bubbles: true, clientX: step.clientX, clientY: step.clientY };
    const Pointer = (globalThis.PointerEvent ?? MouseEvent) as typeof PointerEvent;
    document.body.dispatchEvent(new Pointer('pointermove', { ...init, pointerType: 'mouse' }));
    document.body.dispatchEvent(new MouseEvent('mousemove', init));
  } else if (step.action === 'scroll') {
    page.scrollTo(step.y);
  } else if (step.action === 'reduced-motion') {
    for (const list of lists) list.fire(step.reduce);
  } else {
    return perform(step, flush);
  }
  await flush();
}

async function record(
  mount: () => Promise<Mounted>,
  steps: ParallaxStep[],
  { reducedMotion }: CompareOptions,
): Promise<string[]> {
  const lists =
    reducedMotion === undefined ? [] : installMatchMedia((query) => query === REDUCED_MOTION_QUERY && reducedMotion);
  const page = fakeLayout();
  // Each rendering runs on its own simulated clock, as in the parity suite:
  // `wait` steps move it, so animation frames run at the same step in both
  // frameworks.
  useSimulatedTime();
  const mounted = await mount();
  try {
    const snapshot = () => canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') });
    const states = [snapshot()];
    for (const step of steps) {
      await play(step, page, lists, mounted.flush);
      states.push(snapshot());
    }
    return states;
  } finally {
    await mounted.unmount();
    useRealTime();
    page.restore();
    if (reducedMotion !== undefined) Reflect.deleteProperty(window, 'matchMedia');
  }
}

/** The DOM after each step, in React and in Vue. */
export async function compareWithReact(
  hosts: { react: ComponentType; vue: Component },
  steps: ParallaxStep[],
  options: CompareOptions = {},
): Promise<{ react: string[]; vue: string[] }> {
  const react = await record(() => mountReact(hosts.react), steps, options);
  const vue = await record(() => mountVue(hosts.vue), steps, options);
  return { react, vue };
}

interface CanonicalElement {
  tag: string;
  attributes: Array<[string, string]>;
  children: CanonicalNode[];
}
type CanonicalNode = CanonicalElement | string;

function find(nodes: CanonicalNode[], match: (element: CanonicalElement) => boolean): CanonicalElement | undefined {
  for (const node of nodes) {
    if (typeof node === 'string') continue;
    const found = match(node) ? node : find(node.children, match);
    if (found) return found;
  }
  return undefined;
}

/** The `transform` of the layer (the `will-change-transform` element) in a recorded state; `''` without one. */
export function transformIn(state: string): string {
  const layer = find((JSON.parse(state) as { content: CanonicalNode[] }).content, (element) =>
    element.attributes.some(([name, value]) => name === 'class' && value.split(' ').includes('will-change-transform')),
  );
  const style = layer?.attributes.find(([name]) => name === 'style')?.[1] ?? '';
  return /(?:^|; )transform: ([^;]+)/.exec(style)?.[1] ?? '';
}
