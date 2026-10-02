// @vitest-environment jsdom
/**
 * Client hydration of the server-rendered page: Angular must adopt the
 * server's DOM node for node — no mismatch, nothing re-created — and only
 * then start the browser-only behaviour: playback, the parallax loop and the
 * toast countdown.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { provideZonelessChangeDetection, type ApplicationRef } from '@angular/core';
import { bootstrapApplication, provideClientHydration, type BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { getAnimationFrame, renderIconDataUri } from '@pxlkit/angular';
import { SSR_DOCUMENT, SsrApp, ssrProps } from './app';

describe('@pxlkit/angular client hydration', () => {
  let appRef: ApplicationRef | undefined;

  afterEach(() => {
    appRef?.destroy();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('adopts the server-rendered DOM and starts the browser-only behaviour', async () => {
    const html = await renderApplication(
      (context: BootstrapContext) =>
        bootstrapApplication(
          SsrApp,
          { providers: [provideServerRendering(), provideClientHydration(), provideZonelessChangeDetection()] },
          context,
        ),
      { document: SSR_DOCUMENT, url: 'http://localhost/', allowedHosts: ['localhost'] },
    );
    document.open();
    document.write(html);
    document.close();
    const serverNodes = Array.from(document.querySelectorAll('pxl-ssr-app *'));
    expect(serverNodes.length).toBeGreaterThan(30);

    // Playback's interval on simulated time: it advances a frame when the
    // clock does, however busy the machine is. Angular's own scheduling
    // stays on real time.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errors = vi.spyOn(console, 'error');
    const warnings = vi.spyOn(console, 'warn');
    const timeouts = vi.spyOn(globalThis, 'setTimeout');
    appRef = await bootstrapApplication(SsrApp, {
      providers: [provideClientHydration(), provideZonelessChangeDetection()],
    });
    await appRef.whenStable();

    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
    const summary = log.mock.calls.map((args) => args.join(' ')).find((line) => line.includes('hydrated'));
    expect(summary).toMatch(/hydrated \d+ component\(s\) and \d+ node\(s\), 0 component\(s\) were skipped/);
    // Hydration reuses every server node instead of re-rendering the page.
    expect(serverNodes.filter((node) => !node.isConnected)).toEqual([]);

    // Browser-only behaviour runs on the adopted nodes.
    const layers = Array.from(document.querySelector('#parallax pxl-parallax-icon > div')!.children) as HTMLElement[];
    expect(layers.map((layer) => layer.style.transform)).toEqual(['translateZ(0px)', 'translateZ(0px)', 'translateZ(0px)']);
    expect(timeouts.mock.calls.some(([, delay]) => delay === ssrProps.toast.duration)).toBe(true);

    const img = document.querySelector('#animated img')!;
    const icon = ssrProps.animated.icon;
    expect(img.getAttribute('src')).toBe(renderIconDataUri(getAnimationFrame(icon, 0)));
    vi.advanceTimersByTime(icon.frameDuration);
    await appRef.whenStable();
    expect(img.getAttribute('src')).toBe(renderIconDataUri(getAnimationFrame(icon, 1)));
  });
});
