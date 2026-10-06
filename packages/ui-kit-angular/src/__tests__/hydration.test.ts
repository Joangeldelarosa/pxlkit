/**
 * Every Angular example hydrates its own server-rendered page: Angular adopts
 * the server's DOM node for node — no mismatch, nothing re-created — also for
 * a reader who prefers reduced motion, which no server knows.
 */
import {
  provideZonelessChangeDetection,
  ɵreadHydrationInfo as readHydrationInfo,
  type ApplicationRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { canonicalPage } from '../../../../scripts/parity/canonical';
import { useRealTime, useRunDate } from '../../../../scripts/parity/clock';
import { resetPage, usePreferences } from '../../../../scripts/parity/page';
import { mountAngular } from './angular';
import { angularDomRules } from './dom-rules';
import { angularExamples, LOAD_KIT_TIMEOUT, loadKit } from './examples';
import { ROOT_TAG, angularServerPage, rootFor } from './server';

beforeAll(loadKit, LOAD_KIT_TIMEOUT);

describe('Angular examples hydrate cleanly', () => {
  let appRef: ApplicationRef | undefined;

  beforeEach(() => {
    // These tests bootstrap real applications, not TestBed fixtures.
    TestBed.resetTestingModule();
    // The server render and the client's run on the real clock: they see
    // the run's start time (see clock.ts), so a date example shows the same
    // day in each.
    useRunDate();
  });

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    useRealTime();
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

describe('Angular examples hydrate cleanly for a reader who prefers reduced motion', () => {
  let appRef: ApplicationRef | undefined;
  const unwrap = (element: Element) =>
    element.hasAttribute('data-parity-root') || element.localName === ROOT_TAG || element.localName === 'ng-component';
  const snapshot = () => canonicalPage(document, { ...angularDomRules, unwrap });

  beforeEach(() => {
    TestBed.resetTestingModule();
    useRunDate();
  });

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    resetPage();
    useRealTime();
    vi.restoreAllMocks();
  });

  for (const [key, { load }] of angularExamples) {
    it(key, async () => {
      const Example = await load();
      // The server knows nothing of the reader's preferences.
      const html = await angularServerPage(Example, { hydration: true });
      document.open();
      document.write(html);
      document.close();
      const serverNodes = Array.from(document.querySelectorAll(`${ROOT_TAG} *`));

      usePreferences({ reducedMotion: true });
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
      // Hydration adopted every element the server rendered…
      expect(serverNodes.filter((node) => readHydrationInfo(node)?.status !== 'hydrated')).toEqual([]);

      // …then the page shows what a render for this reader shows (the
      // transfer state the server sent along is read by now).
      document.getElementById('ng-state')?.remove();
      const hydrated = snapshot();
      appRef.destroy();
      appRef = undefined;
      document.body.innerHTML = '';
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
      const mounted = await mountAngular(Example);
      expect(hydrated).toBe(snapshot());
      await mounted.unmount();
    });
  }
});
