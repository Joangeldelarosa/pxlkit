/**
 * React ↔ Vue parity: every manifest example renders the same DOM in both
 * frameworks once mounted, and every interaction scenario leaves the same DOM
 * after each step. React is the reference implementation.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { reactExamples } from '../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../scripts/parity/canonical';
import { useRealTime, useSimulatedTime } from '../../../../scripts/parity/clock';
import { perform, type ParityScenario } from '../../../../scripts/parity/interact';
import { resetPage, usePreferences } from '../../../../scripts/parity/page';
import { mountReact, type Mounted } from '../../../../scripts/parity/react';
import { scenarios } from '../../../../scripts/parity/scenarios';
import { LOAD_KIT_TIMEOUT, loadKit, vueExamples } from './examples';
import { mountVue } from './vue';

const unwrap = (element: Element) => element.hasAttribute('data-parity-root');
const snapshot = () => canonicalPage(document, { unwrap });

async function record(
  mount: () => Promise<Mounted>,
  { steps = [], reducedMotion }: Partial<Pick<ParityScenario, 'steps' | 'reducedMotion'>> = {},
): Promise<string[]> {
  // Each rendering runs on its own simulated clock (see clock.ts), on a page
  // with the scenario's preferences (see page.ts).
  useSimulatedTime();
  usePreferences({ reducedMotion });
  let mounted: Mounted | undefined;
  try {
    mounted = await mount();
    const states = [snapshot()];
    for (const step of steps) {
      await perform(step, mounted.flush);
      states.push(snapshot());
    }
    return states;
  } finally {
    await mounted?.unmount();
    resetPage();
    useRealTime();
  }
}

const examples = reactExamples();

beforeAll(loadKit, LOAD_KIT_TIMEOUT);

describe('React ↔ Vue parity — mounted examples', () => {
  for (const example of examples) {
    const vue = vueExamples.get(`${example.component}/${example.exportName}`);
    const title = `${example.component} › ${example.label}`;
    if (!vue) {
      it.todo(title);
      continue;
    }
    it(title, async () => {
      const [react] = await record(() => mountReact(example.Component));
      const Example = await vue.load();
      const [ported] = await record(() => mountVue(Example));
      expect(ported).toBe(react);
    });
  }
});

describe('React ↔ Vue parity — interactions', () => {
  if (scenarios.length === 0) it.todo('interaction scenarios');
  for (const scenario of scenarios) {
    const reference = examples.find((e) => e.component === scenario.component && e.exportName === scenario.example);
    const vue = vueExamples.get(`${scenario.component}/${scenario.example}`);
    const title = `${scenario.component} › ${scenario.name}`;
    if (!reference) throw new Error(`Scenario "${title}" starts from an unknown example ${scenario.example}`);
    if (!vue) {
      it.todo(title);
      continue;
    }
    it(title, async () => {
      const react = await record(() => mountReact(reference.Component), scenario);
      const Example = await vue.load();
      const ported = await record(() => mountVue(Example), scenario);
      expect(ported).toEqual(react);
    });
  }
});
