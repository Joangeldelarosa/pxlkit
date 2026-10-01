/**
 * Every Vue example hydrates its own server-rendered markup without a
 * mismatch: no warnings, and every server-rendered element is kept.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createSSRApp, nextTick } from 'vue';
import { loadKit, vueExamples } from './examples';
import { vueServerHtml } from './vue';

afterEach(() => {
  vi.restoreAllMocks();
});

beforeAll(loadKit, 60_000);

describe('Vue examples hydrate cleanly', () => {
  for (const [key, example] of vueExamples) {
    it(key, async () => {
      const Example = await example.load();
      const html = await vueServerHtml(Example);
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      const serverElements = Array.from(container.querySelectorAll('*'));

      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const app = createSSRApp(Example);
      app.mount(container);
      await nextTick();

      expect(warn.mock.calls.flat().join('\n')).not.toMatch(/hydrat|mismatch/i);
      expect(error).not.toHaveBeenCalled();
      expect(serverElements.every((element) => element.isConnected)).toBe(true);
      app.unmount();
    });
  }
});
