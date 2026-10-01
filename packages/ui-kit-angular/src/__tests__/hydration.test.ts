/**
 * Every Angular example hydrates its own server-rendered page: Angular adopts
 * the server's DOM node for node — no mismatch, nothing re-created.
 */
import { provideZonelessChangeDetection, type ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { angularExamples, loadKit } from './examples';
import { ROOT_TAG, angularServerPage, rootFor } from './server';

beforeAll(loadKit, 60_000);

describe('Angular examples hydrate cleanly', () => {
  let appRef: ApplicationRef | undefined;

  beforeEach(() => {
    // These tests bootstrap real applications, not TestBed fixtures.
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    vi.restoreAllMocks();
  });

  for (const [key, { load }] of angularExamples) {
    it(key, async () => {
      const Example = await load();
      const html = await angularServerPage(Example, { hydration: true });
      document.open();
      document.write(html);
      document.close();
      const serverNodes = Array.from(document.querySelectorAll(`${ROOT_TAG} *`));

      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      const errors = vi.spyOn(console, 'error');
      const warnings = vi.spyOn(console, 'warn');
      appRef = await bootstrapApplication(rootFor(Example), {
        providers: [provideClientHydration(), provideZonelessChangeDetection()],
      });
      await appRef.whenStable();

      expect(errors).not.toHaveBeenCalled();
      expect(warnings).not.toHaveBeenCalled();
      const summary = log.mock.calls.map((args) => args.join(' ')).find((line) => line.includes('hydrated'));
      expect(summary).toMatch(/hydrated \d+ component\(s\) and \d+ node\(s\), 0 component\(s\) were skipped/);
      expect(serverNodes.filter((node) => !node.isConnected)).toEqual([]);
    });
  }
});
