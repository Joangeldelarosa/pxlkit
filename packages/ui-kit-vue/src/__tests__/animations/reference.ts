/**
 * The React kit's animation components, as the reference for what the
 * manifest examples — and so the parity scenarios — do not reach: click and
 * focus triggers, controlled triggers, completion and reduced motion. A test
 * renders the same host in both frameworks and replays the same steps; the
 * DOM must match after each.
 */
import type { ComponentType } from 'react';
import type { Component } from 'vue';
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
  import.meta.glob<Record<string, ComponentType<Record<string, unknown>>>>('../../../../ui-kit/src/animations/index.ts', {
    eager: true,
  }),
);

/** A React animation component, by name. */
export function reactAnimation(name: string): ComponentType<Record<string, unknown>> {
  return reactKit![name]!;
}

/**
 * A parity step, the end of a CSS animation on an element (`animationend`
 * bubbles), or the user's reduced-motion preference changing.
 */
export type AnimationStep =
  | ParityStep
  | { action: 'animationend'; target: string }
  | { action: 'reduced-motion'; reduce: boolean };

export interface CompareOptions {
  /** The user's reduced-motion preference as the hosts mount; `matchMedia` is missing without it. */
  reducedMotion?: boolean;
}

async function play(step: AnimationStep, lists: FakeMediaQueryList[], flush: () => Promise<void>): Promise<void> {
  if (step.action === 'reduced-motion') {
    for (const list of lists) list.fire(step.reduce);
  } else if (step.action === 'animationend') {
    const element = document.querySelector(step.target);
    if (!element) throw new Error(`No element matches ${step.target}`);
    // jsdom runs no CSS animations: React listens to the prefixed event there,
    // the other kits to the standard one, so each sees exactly one.
    element.dispatchEvent(new Event('animationend', { bubbles: true }));
    element.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
  } else {
    return perform(step, flush);
  }
  await flush();
}

async function record(
  mount: () => Promise<Mounted>,
  steps: AnimationStep[],
  { reducedMotion }: CompareOptions,
): Promise<string[]> {
  const lists =
    reducedMotion === undefined ? [] : installMatchMedia((query) => query === REDUCED_MOTION_QUERY && reducedMotion);
  // Each rendering runs on its own simulated clock, as in the parity suite:
  // `wait` steps move it, so timers fire at the same step in both frameworks.
  useSimulatedTime();
  const mounted = await mount();
  try {
    const snapshot = () => canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') });
    const states = [snapshot()];
    for (const step of steps) {
      await play(step, lists, mounted.flush);
      states.push(snapshot());
    }
    return states;
  } finally {
    await mounted.unmount();
    useRealTime();
    if (reducedMotion !== undefined) Reflect.deleteProperty(window, 'matchMedia');
  }
}

/** The DOM after each step, in React and in Vue. */
export async function compareWithReact(
  hosts: { react: ComponentType; vue: Component },
  steps: AnimationStep[],
  options: CompareOptions = {},
): Promise<{ react: string[]; vue: string[] }> {
  const react = await record(() => mountReact(hosts.react), steps, options);
  const vue = await record(() => mountVue(hosts.vue), steps, options);
  return { react, vue };
}

/** The animated wrapper: the first element of the host. */
export const WRAPPER = '[data-parity-root] > :first-child';

interface CanonicalElement {
  tag: string;
  attributes: Array<[string, string]>;
  children: CanonicalNode[];
}
type CanonicalNode = CanonicalElement | string;

const textOf = (node: CanonicalNode): string => (typeof node === 'string' ? node : node.children.map(textOf).join(''));

function find(nodes: CanonicalNode[], match: (element: CanonicalElement) => boolean): CanonicalElement | undefined {
  for (const node of nodes) {
    if (typeof node === 'string') continue;
    const found = match(node) ? node : find(node.children, match);
    if (found) return found;
  }
  return undefined;
}

/** The text of the first element of a recorded state that `match` accepts (`''` without one). */
export function textIn(state: string, match: (element: CanonicalElement) => boolean): string {
  const element = find((JSON.parse(state) as { content: CanonicalNode[] }).content, match);
  return element ? textOf(element) : '';
}

/** The text of the host's `<output>` in a recorded state — what the host counts. */
export const outputOf = (state: string): string => textIn(state, (element) => element.tag === 'output');
