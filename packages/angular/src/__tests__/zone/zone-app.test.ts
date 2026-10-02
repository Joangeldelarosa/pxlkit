/**
 * zone.js applications — still the default of Angular 20 projects. Playback
 * timers, the parallax animation loop and its page-wide mouse listener run
 * outside the Angular zone: the app stays stable while icons animate and no
 * app-wide change detection runs per frame, yet every frame is rendered.
 * Outputs and the toast timer run inside the zone, so handlers that set plain
 * (non-signal) fields are rendered too.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  ApplicationRef,
  Component,
  NgZone,
  provideZoneChangeDetection,
  type DoCheck,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { firstValueFrom, filter, race, timer, map } from 'rxjs';
import {
  AnimatedPxlKitIcon,
  ParallaxPxlKitIcon,
  PixelToast,
  getAnimationFrame,
  renderIconDataUri,
  type AnimatedPxlKitData,
} from '@pxlkit/angular';
import { installCanvas } from '../harness';
import { testAnimatedIcon, testParallaxIcon } from '../fixtures';

const fastIcon: AnimatedPxlKitData = { ...testAnimatedIcon, name: 'fast', frameDuration: 20 };

@Component({
  selector: 'pxl-zone-app',
  imports: [AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast],
  template: `
    <pxl-animated-icon [icon]="icon" trigger="loop" />
    <pxl-animated-icon id="hover" [icon]="icon" trigger="hover" />
    <pxl-parallax-icon [icon]="parallax" (activate)="active = $event" />
    <output id="active">{{ active }}</output>
    <button id="save" type="button" (click)="toastVisible = true">Save</button>
    <pxl-toast [visible]="toastVisible" title="Saved!" [duration]="duration" (closed)="toastVisible = false" />
    <output id="toast">{{ toastVisible }}</output>
  `,
})
class ZoneApp implements DoCheck {
  readonly icon = fastIcon;
  readonly parallax = testParallaxIcon;
  active = false;
  toastVisible = false;
  duration = 60;
  /** Times the root view was checked — once per app-wide change detection. */
  checks = 0;

  ngDoCheck(): void {
    this.checks++;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function frameShown(img: Element): number {
  const src = img.getAttribute('src');
  return fastIcon.frames.findIndex((_, i) => renderIconDataUri(getAnimationFrame(fastIcon, i)) === src);
}

describe('@pxlkit/angular in a zone.js application', () => {
  let appRef: ApplicationRef | undefined;

  async function bootstrap(): Promise<{ app: ZoneApp; root: HTMLElement; zone: NgZone }> {
    document.body.innerHTML = '<pxl-zone-app></pxl-zone-app>';
    appRef = await bootstrapApplication(ZoneApp, {
      providers: [provideZoneChangeDetection({ eventCoalescing: true })],
    });
    const zone = appRef.injector.get(NgZone);
    expect(zone).toBeInstanceOf(NgZone);
    expect(NgZone.isInAngularZone()).toBe(false);
    return {
      app: appRef.components[0]!.instance as ZoneApp,
      root: document.querySelector('pxl-zone-app') as HTMLElement,
      zone,
    };
  }

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('stays stable while icons animate, painting every frame without change detection', async () => {
    const { app, root } = await bootstrap();
    // Playback timers inside the zone would keep the app unstable for good;
    // the window only bounds the wait, generously for a busy CI runner.
    const stable = await firstValueFrom(
      race(appRef!.isStable.pipe(filter(Boolean)), timer(5000).pipe(map(() => false))),
    );
    expect(stable).toBe(true);

    const img = root.querySelector('pxl-animated-icon img')!;
    const checksBefore = app.checks;
    const seen = new Set<number>();
    for (let i = 0; i < 12; i++) {
      await sleep(10);
      seen.add(frameShown(img));
    }
    expect(seen).toEqual(new Set([0, 1])); // both frames were painted
    expect(app.checks - checksBefore).toBe(0);
  });

  it('starts hover playback outside the zone', async () => {
    const { app, root } = await bootstrap();
    const hover = root.querySelector('#hover') as HTMLElement;
    const checksBefore = app.checks;
    hover.dispatchEvent(new MouseEvent('mouseenter'));
    await sleep(70);
    expect(frameShown(hover.querySelector('img')!)).not.toBe(-1);
    // The listener itself is one zone turn; the playback it starts adds none.
    expect(app.checks - checksBefore).toBe(1);
    hover.dispatchEvent(new MouseEvent('mouseleave'));
    await vi.waitFor(() => expect(frameShown(hover.querySelector('img')!)).toBe(0));
  });

  it('tracks the mouse outside the zone and runs the activate output inside it', async () => {
    const { app, root } = await bootstrap();
    const checksBefore = app.checks;
    for (let i = 0; i < 5; i++) {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10 * i, clientY: 5 * i }));
      await sleep(5);
    }
    expect(app.checks - checksBefore).toBe(0);

    installCanvas(); // jsdom has no canvas for the click's particle burst
    (root.querySelector('pxl-parallax-icon') as HTMLElement).click();
    await sleep(0);
    expect(app.active).toBe(true);
    expect(root.querySelector('#active')!.textContent).toBe('true');
  });

  it('closes the toast inside the zone, so plain state set by the handler is rendered', async () => {
    const { app, root } = await bootstrap();
    (root.querySelector('#save') as HTMLButtonElement).click();
    await sleep(0);
    expect(root.querySelector('pxl-toast')!.textContent).toContain('Saved!');
    // Polled rather than slept for: a loaded machine fires the toast's timer
    // late. The rendered text proves the handler ran inside the zone — outside
    // it, nothing would run change detection and the wait would time out.
    await vi.waitFor(
      () => {
        expect(app.toastVisible).toBe(false);
        expect(root.querySelector('#toast')!.textContent).toBe('false');
      },
      { timeout: app.duration + 2000 },
    );
    expect(root.querySelector('pxl-toast')!.childElementCount).toBe(0);
  });
});
