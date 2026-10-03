/**
 * React ↔ Angular parity on the server: every manifest example renders the
 * same markup with `react-dom/server` and `@angular/platform-server`, so
 * server-rendered pages look the same before hydration.
 */
import { JSDOM } from 'jsdom';
import { beforeAll, describe, expect, it } from 'vitest';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalDom, canonicalHtml } from '../../../../../scripts/parity/canonical';
import { reactServerHtml } from '../../../../../scripts/parity/react';
import { angularDomRules } from '../dom-rules';
import { angularExamples, LOAD_KIT_TIMEOUT, loadKit } from '../examples';
import { ROOT_TAG, angularServerPage } from '../server';

const parser = new JSDOM('').window.document;

beforeAll(loadKit, LOAD_KIT_TIMEOUT);

describe('React ↔ Angular parity — server rendering', () => {
  for (const example of reactExamples()) {
    const angular = angularExamples.get(`${example.component}/${example.exportName}`);
    const title = `${example.component} › ${example.label}`;
    if (!angular) {
      it.todo(title);
      continue;
    }
    it(title, async () => {
      expect(typeof window).toBe('undefined');
      const react = canonicalHtml(reactServerHtml(example.Component), {}, parser);
      const page = new JSDOM(await angularServerPage(await angular.load())).window.document;
      const root = page.querySelector(ROOT_TAG)!;
      // `ng-component` is the example's own host (examples have no selector).
      const ported = canonicalDom(root, { ...angularDomRules, unwrap: (el) => el.tagName.toLowerCase() === 'ng-component' });
      expect(ported).toBe(react);
    });
  }
});
