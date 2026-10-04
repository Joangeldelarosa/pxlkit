/**
 * Every Vue example hydrates its own server-rendered markup without a
 * mismatch: no warnings, and every server-rendered element is kept — also
 * for a reader who prefers reduced motion, which no server knows.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, nextTick } from 'vue';
import { canonicalPage } from '../../../../scripts/parity/canonical';
import { elapse, useRealTime, useRunDate } from '../../../../scripts/parity/clock';
import { resetPage, usePreferences } from '../../../../scripts/parity/page';
import { LOAD_KIT_TIMEOUT, loadKit, vueExamples } from './examples';
import { mountVue, vueServerHtml } from './vue';

// The server render and the client's run on the real clock: they see the
// run's start time (see clock.ts), so a date example shows the same day in
// each.
beforeEach(useRunDate);

afterEach(() => {
  useRealTime();
  vi.restoreAllMocks();
});

beforeAll(loadKit, LOAD_KIT_TIMEOUT);

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

describe('Vue examples hydrate cleanly for a reader who prefers reduced motion', () => {
  const unwrap = (element: Element) => element.hasAttribute('data-parity-root');

  afterEach(resetPage);

  for (const [key, example] of vueExamples) {
    it(key, async () => {
      const Example = await example.load();
      // The server knows nothing of the reader's preferences.
      const html = await vueServerHtml(Example);
      const container = document.createElement('div');
      container.setAttribute('data-parity-root', '');
      container.innerHTML = html;
      document.body.appendChild(container);
      const serverElements = Array.from(container.querySelectorAll('*'));

      usePreferences({ reducedMotion: true });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const app = createSSRApp(Example);
      app.mount(container);
      // Hydration adopts the server's markup as it is…
      expect(serverElements.every((element) => element.isConnected)).toBe(true);
      await nextTick();
      await elapse(0);
      await nextTick();
      expect(warn.mock.calls.flat().join('\n')).not.toMatch(/hydrat|mismatch/i);
      expect(error).not.toHaveBeenCalled();

      // …then shows what a render for this reader shows.
      const hydrated = canonicalPage(document, { unwrap });
      app.unmount();
      container.remove();
      const mounted = await mountVue(Example);
      expect(hydrated).toBe(canonicalPage(document, { unwrap }));
      await mounted.unmount();
    });
  }
});
