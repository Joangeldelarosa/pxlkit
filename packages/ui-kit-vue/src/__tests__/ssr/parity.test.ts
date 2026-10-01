// @vitest-environment node
/**
 * React ↔ Vue parity on the server: every manifest example renders the same
 * markup with `react-dom/server` and `vue/server-renderer`, so server-rendered
 * pages look the same before hydration.
 */
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalHtml } from '../../../../../scripts/parity/canonical';
import { reactServerHtml } from '../../../../../scripts/parity/react';
import { vueExamples } from '../examples';
import { vueServerHtml } from '../vue';

const { document } = new JSDOM('').window;

describe('React ↔ Vue parity — server rendering', () => {
  for (const example of reactExamples()) {
    const vue = vueExamples.get(`${example.component}/${example.exportName}`);
    const title = `${example.component} › ${example.label}`;
    if (!vue) {
      it.todo(title);
      continue;
    }
    it(title, async () => {
      const react = canonicalHtml(reactServerHtml(example.Component), {}, document);
      const ported = canonicalHtml(await vueServerHtml(await vue.load()), {}, document);
      expect(ported).toBe(react);
    });
  }
});
