/**
 * React ↔ Angular parity: every manifest example renders the same DOM in both
 * frameworks once mounted, and every interaction scenario leaves the same DOM
 * after each step. React is the reference implementation.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { reactExamples } from '../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../scripts/parity/canonical';
import { perform, waitedMs, type ParityStep } from '../../../../scripts/parity/interact';
import { mountReact, type Mounted } from '../../../../scripts/parity/react';
import { scenarios } from '../../../../scripts/parity/scenarios';
import { mountAngular } from './angular';
import { angularExamples, loadKit } from './examples';
import { angularDomRules } from './dom-rules';

const unwrap = (element: Element) => element.hasAttribute('data-parity-root');
const snapshot = () => canonicalPage(document, { ...angularDomRules, unwrap });

async function record(mount: () => Promise<Mounted>, steps: ParityStep[] = []): Promise<string[]> {
  const mounted = await mount();
  try {
    const states = [snapshot()];
    for (const step of steps) {
      await perform(step, mounted.flush);
      states.push(snapshot());
    }
    return states;
  } finally {
    await mounted.unmount();
  }
}

const examples = reactExamples();

beforeAll(loadKit, 60_000);

describe('React ↔ Angular parity — mounted examples', () => {
  for (const example of examples) {
    const angular = angularExamples.get(`${example.component}/${example.exportName}`);
    const title = `${example.component} › ${example.label}`;
    if (!angular) {
      it.todo(title);
      continue;
    }
    it(title, async () => {
      const [react] = await record(() => mountReact(example.Component));
      const Example = await angular.load();
      const [ported] = await record(() => mountAngular(Example));
      expect(ported).toBe(react);
    });
  }
});

describe('React ↔ Angular parity — interactions', () => {
  if (scenarios.length === 0) it.todo('interaction scenarios');
  for (const scenario of scenarios) {
    const reference = examples.find((e) => e.component === scenario.component && e.exportName === scenario.example);
    const angular = angularExamples.get(`${scenario.component}/${scenario.example}`);
    const title = `${scenario.component} › ${scenario.name}`;
    if (!reference) throw new Error(`Scenario "${title}" starts from an unknown example ${scenario.example}`);
    if (!angular) {
      it.todo(title);
      continue;
    }
    // The scenario runs once per framework, so its waits count twice, on
    // top of the suite's default limit for the steps themselves.
    it(title, { timeout: 15_000 + 2 * waitedMs(scenario.steps) }, async () => {
      const react = await record(() => mountReact(reference.Component), scenario.steps);
      const Example = await angular.load();
      const ported = await record(() => mountAngular(Example), scenario.steps);
      expect(ported).toEqual(react);
    });
  }
});
