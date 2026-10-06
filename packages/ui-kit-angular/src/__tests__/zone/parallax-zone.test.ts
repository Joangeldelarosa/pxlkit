/**
 * The parallax layers in a zone.js application. Their frame loops and the
 * mouse parallax's page-wide listener run outside the Angular zone: a loop
 * inside it would leave an animation frame pending at all times, so the
 * application would never be stable, and every frame and mouse move would
 * run change detection over the whole application.
 */
import { ApplicationRef, Component, NgZone, provideZoneChangeDetection, type DoCheck } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelMouseParallax, PixelParallaxGroup, PixelParallaxLayer } from '@pxlkit/ui-kit-angular';

@Component({
  selector: 'pxl-kit-parallax-zone-app',
  imports: [PixelParallaxGroup, PixelParallaxLayer, PixelMouseParallax],
  template: `
    <div pxlParallaxGroup id="group">
      <pxl-parallax-layer id="layer" [speed]="0.5">Background</pxl-parallax-layer>
      <pxl-mouse-parallax id="mouse" [strength]="20">Foreground</pxl-mouse-parallax>
    </div>
    <button type="button" id="count" (click)="count = count + 1">Clicked {{ count }}</button>
  `,
})
class ParallaxZoneApp implements DoCheck {
  count = 0;
  /** Times the root view was checked — once per app-wide change detection. */
  checks = 0;

  ngDoCheck(): void {
    this.checks++;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const $ = (selector: string) => document.querySelector<HTMLElement>(selector)!;

describe('@pxlkit/ui-kit-angular parallax in a zone.js application', () => {
  let appRef: ApplicationRef | undefined;

  /** Whether the application becomes stable within `ms`. */
  async function stableWithin(ms: number): Promise<boolean> {
    return Promise.race([appRef!.whenStable().then(() => true), sleep(ms).then(() => false)]);
  }

  async function bootstrap(): Promise<ParallaxZoneApp> {
    document.body.innerHTML = '<pxl-kit-parallax-zone-app></pxl-kit-parallax-zone-app>';
    appRef = await bootstrapApplication(ParallaxZoneApp, {
      providers: [provideZoneChangeDetection({ eventCoalescing: true })],
    });
    expect(appRef.injector.get(NgZone)).toBeInstanceOf(NgZone);
    return appRef.components[0]!.instance as ParallaxZoneApp;
  }

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('stays stable while the layers animate, and their frames and mouse moves run no change detection', async () => {
    const app = await bootstrap();
    expect(await stableWithin(5000)).toBe(true);
    // jsdom lays nothing out: give the group a box to measure the cursor across.
    vi.spyOn($('#group'), 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect);
    await vi.waitFor(() => expect($('#layer').style.transform).toMatch(/^translate3d\(0, /), { timeout: 5000 });
    const checks = app.checks;

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 100 }));
    await vi.waitFor(() => expect($('#mouse').style.transform).toMatch(/^translate3d\([1-9]/), { timeout: 5000 });
    const moved = $('#mouse').style.transform;
    await vi.waitFor(() => expect($('#mouse').style.transform).not.toBe(moved), { timeout: 5000 });
    expect(app.checks).toBe(checks);
    expect(await stableWithin(5000)).toBe(true);

    // The application's own events still render.
    $('#count').click();
    await appRef!.whenStable();
    expect($('#count').textContent).toContain('Clicked 1');
  });

  it('stops the frame loops when the application is destroyed', async () => {
    await bootstrap();
    const layers = [$('#layer'), $('#mouse')];
    await vi.waitFor(() => expect(layers.map((layer) => layer.style.transform)).not.toContain(''), { timeout: 5000 });
    appRef!.destroy();
    appRef = undefined;
    for (const layer of layers) layer.style.transform = 'none';
    // A running loop requested its next frame before these: it would run first.
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await frame();
    await frame();
    expect(layers.map((layer) => layer.style.transform)).toEqual(['none', 'none']);
  });
});
