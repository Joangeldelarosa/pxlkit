/**
 * zone.js applications — still the default of Angular 20 projects. State set
 * by the kit's events lands in plain (non-signal) fields and is rendered, and
 * the popover's page-wide dismissal listeners run outside the Angular zone, so
 * they add no app-wide change detection until they actually close it.
 */
import { ApplicationRef, Component, NgZone, provideZoneChangeDetection, type DoCheck } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';
import {
  PixelButton,
  PixelModal,
  PixelPopover,
  PixelPopoverContent,
  PixelPopoverTrigger,
  PixelSwitch,
  PixelTabs,
  PixelTabsList,
  PixelTabsPanel,
  PixelTabsTrigger,
} from '@pxlkit/ui-kit-angular';

@Component({
  selector: 'pxl-kit-zone-app',
  imports: [
    FormsModule,
    PixelButton,
    PixelSwitch,
    PixelTabs,
    PixelTabsList,
    PixelTabsTrigger,
    PixelTabsPanel,
    PixelPopover,
    PixelPopoverTrigger,
    PixelPopoverContent,
    PixelModal,
  ],
  template: `
    <button pxlButton id="count" (click)="count = count + 1">Clicked {{ count }}</button>
    <pxl-switch label="Notify" [(ngModel)]="notify" />
    <output id="notify">{{ notify }}</output>
    <pxl-tabs [(value)]="tab">
      <pxl-tabs-list ariaLabel="Sections">
        <button pxlTabsTrigger value="one">One</button>
        <button pxlTabsTrigger value="two">Two</button>
      </pxl-tabs-list>
      <pxl-tabs-panel value="one">First</pxl-tabs-panel>
      <pxl-tabs-panel value="two">Second</pxl-tabs-panel>
    </pxl-tabs>
    <output id="tab">{{ tab }}</output>
    <pxl-popover [(open)]="open">
      <button type="button" pxlPopoverTrigger id="trigger">Details</button>
      <div *pxlPopoverContent id="panel"><input id="field" aria-label="Field" /></div>
    </pxl-popover>
    <output id="open">{{ open }}</output>
    <button type="button" id="outside">Outside</button>
    <button type="button" id="open-modal" (click)="modal = true">Open modal</button>
    <pxl-modal [(open)]="modal" title="Zone" (closed)="closedCount = closedCount + 1"><p>Modal body</p></pxl-modal>
    <output id="modal">{{ modal }} {{ closedCount }}</output>
  `,
})
class ZoneApp implements DoCheck {
  count = 0;
  notify = false;
  tab = 'one';
  open = false;
  modal = false;
  closedCount = 0;
  /** Times the root view was checked — once per app-wide change detection. */
  checks = 0;

  ngDoCheck(): void {
    this.checks++;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T & Element>(selector);

describe('@pxlkit/ui-kit-angular in a zone.js application', () => {
  let appRef: ApplicationRef | undefined;

  async function bootstrap(): Promise<ZoneApp> {
    document.body.innerHTML = '<pxl-kit-zone-app></pxl-kit-zone-app>';
    appRef = await bootstrapApplication(ZoneApp, {
      providers: [provideZoneChangeDetection({ eventCoalescing: true })],
    });
    expect(appRef.injector.get(NgZone)).toBeInstanceOf(NgZone);
    await appRef.whenStable();
    return appRef.components[0]!.instance as ZoneApp;
  }

  afterEach(() => {
    appRef?.destroy();
    appRef = undefined;
    document.body.innerHTML = '';
  });

  it('renders plain fields set by button, switch (ngModel) and tabs events', async () => {
    const app = await bootstrap();
    $('#count')!.click();
    $('[role="switch"]')!.click();
    $<HTMLElement>('[role="tab"]:nth-of-type(2)')!.click();
    await appRef!.whenStable();
    expect(app.count).toBe(1);
    expect($('#count')!.textContent).toContain('Clicked 1');
    expect($('#notify')!.textContent).toBe('true');
    expect($('#tab')!.textContent).toBe('two');
    expect($('[role="tabpanel"]')!.textContent).toContain('Second');
  });

  it('opens, anchors and dismisses the popover, rendering a plain open field', async () => {
    const app = await bootstrap();
    $('#trigger')!.click();
    await appRef!.whenStable();
    await sleep(0);
    await appRef!.whenStable();
    const panel = $('#panel')!;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.transform).toMatch(/^translate\(/);
    expect($('#open')!.textContent).toBe('true');

    $<HTMLInputElement>('#field')!.focus();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await appRef!.whenStable();
    await sleep(0);
    expect(app.open).toBe(false);
    expect($('#panel')).toBeNull();
    expect($('#open')!.textContent).toBe('false');
    expect(document.activeElement).toBe($('#trigger'));

    $('#trigger')!.click();
    await appRef!.whenStable();
    $('#outside')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await appRef!.whenStable();
    expect($('#panel')).toBeNull();
    expect($('#open')!.textContent).toBe('false');
  });

  it('keeps the dismissal listeners outside the zone until they close the popover', async () => {
    const app = await bootstrap();
    $('#trigger')!.click();
    await appRef!.whenStable();
    await sleep(0);
    await appRef!.whenStable();
    const checksBefore = app.checks;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    $('#panel')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await sleep(10);
    expect(app.checks - checksBefore).toBe(0);
    expect($('#panel')).not.toBeNull();
  });

  it('opens the modal with focus inside and closes it on Escape, rendering plain fields', async () => {
    const app = await bootstrap();
    const opener = $('#open-modal')!;
    opener.focus();
    opener.click();
    await appRef!.whenStable();
    await sleep(0);
    await appRef!.whenStable();
    const dialog = $('[role="dialog"]')!;
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await appRef!.whenStable();
    expect(app.modal).toBe(false);
    expect($('[role="dialog"]')).toBeNull();
    expect($('#modal')!.textContent).toBe('false 1');
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
  });
});
