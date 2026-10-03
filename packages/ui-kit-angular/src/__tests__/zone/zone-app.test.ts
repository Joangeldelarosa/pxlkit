/**
 * zone.js applications — still the default of Angular 20 projects. State set
 * by the kit's events lands in plain (non-signal) fields and is rendered, and
 * the page-wide listeners of the popover and of the components built on it
 * (the combobox, the date picker), of the tooltip and of the dropdown run
 * outside the Angular zone, so they add no app-wide change detection until
 * they actually close or move what they anchor. Moving focus as they open —
 * into the combobox's and the command palette's search field, to the alert
 * dialog's Cancel — adds none either, nor does the frame after which a pasted
 * passcode moves focus on.
 */
import { ApplicationRef, Component, NgZone, provideZoneChangeDetection, type DoCheck } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PixelAlertDialog,
  PixelButton,
  PixelCombobox,
  PixelCommand,
  PixelDatePicker,
  PixelDropdownContent,
  PixelDropdownItem,
  PixelDropdownRoot,
  PixelDropdownTrigger,
  PixelModal,
  PixelOTPInput,
  PixelPopover,
  PixelPopoverContent,
  PixelPopoverTrigger,
  PixelSwitch,
  PixelTabs,
  PixelTabsList,
  PixelTabsPanel,
  PixelTabsTrigger,
  PixelTooltip,
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
    PixelAlertDialog,
    PixelCommand,
    PixelOTPInput,
    PixelCombobox,
    PixelDatePicker,
    PixelTooltip,
    PixelDropdownRoot,
    PixelDropdownTrigger,
    PixelDropdownContent,
    PixelDropdownItem,
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
    <button type="button" id="open-confirm" (click)="confirm = true">Delete</button>
    <pxl-alert-dialog [(open)]="confirm" title="Delete it?" [onAction]="remove" />
    <button type="button" id="open-command" (click)="command = true">Commands</button>
    <pxl-command [(open)]="command" [groups]="commands" />
    <pxl-otp-input />
    <div id="scroller" style="overflow: auto">
      <pxl-combobox id="fruit-picker" label="Fruit" [options]="fruits" [(value)]="fruit" />
      <output id="fruit">{{ fruit }}</output>
      <pxl-combobox id="fruit-list" label="Fruit, listed" [options]="fruits" [searchable]="false" />
      <pxl-date-picker id="due-picker" label="Due" [(ngModel)]="due" />
      <output id="due">{{ due?.toDateString() }}</output>
      <pxl-tooltip label="Tip" trigger="click" [(open)]="tip"><button type="button" id="tip-trigger">Hint</button></pxl-tooltip>
      <output id="tip">{{ tip }}</output>
      <pxl-dropdown-root [(open)]="menu">
        <pxl-dropdown-trigger id="menu-trigger">Menu</pxl-dropdown-trigger>
        <div *pxlDropdownContent><button pxlDropdownItem value="copy">Copy</button></div>
      </pxl-dropdown-root>
      <output id="menu">{{ menu }}</output>
    </div>
  `,
})
class ZoneApp implements DoCheck {
  count = 0;
  notify = false;
  tab = 'one';
  open = false;
  modal = false;
  closedCount = 0;
  readonly fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];
  fruit: string | undefined = undefined;
  due: Date | null = new Date(2026, 5, 15);
  tip = false;
  menu = false;
  confirm = false;
  readonly remove = () => {};
  command = false;
  readonly commands = [{ heading: 'Go to', items: [{ id: 'home', label: 'Home', onSelect: () => {} }] }];
  /** Times the root view was checked — once per app-wide change detection. */
  checks = 0;

  ngDoCheck(): void {
    this.checks++;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T & Element>(selector);
const key = (target: Element, name: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

describe('@pxlkit/ui-kit-angular in a zone.js application', () => {
  let appRef: ApplicationRef | undefined;

  /** Whether the application becomes stable within `ms`. */
  async function stableWithin(ms: number): Promise<boolean> {
    return Promise.race([appRef!.whenStable().then(() => true), sleep(ms).then(() => false)]);
  }

  /**
   * App-wide checks from `act` until the application is stable again, past
   * the next frame and anything it sets off.
   */
  async function checksOf(app: ZoneApp, act: () => void): Promise<number> {
    await appRef!.whenStable();
    const before = app.checks;
    act();
    expect(await stableWithin(5000)).toBe(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await sleep(10);
    await appRef!.whenStable();
    return app.checks - before;
  }

  /** App-wide checks of opening with a click, focus leaving a button without listeners (which costs nothing). */
  function checksToOpen(app: ZoneApp, opener: string): Promise<number> {
    $('#outside')!.focus();
    return checksOf(app, () => $(opener)!.click());
  }

  async function escape(): Promise<void> {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await appRef!.whenStable();
  }

  /** Click and wait for the popover the click opens to be anchored. */
  async function open(trigger: HTMLElement): Promise<void> {
    trigger.click();
    await appRef!.whenStable();
    await sleep(0);
    await appRef!.whenStable();
  }

  /** Events the listeners of an open popover hear, none of which closes it or moves it. */
  function ignoredEvents(panel: Element): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    panel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    // Scrolling and resizing re-anchor the content where it already is. jsdom
    // runs the window's listeners outside any zone (a browser does not), so
    // the trigger's scrolling container is scrolled too.
    $('#scroller')!.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
  }

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
    vi.restoreAllMocks();
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

  it("moves focus to the alert dialog's Cancel at no app-wide check, opening as the modal does", async () => {
    const app = await bootstrap();
    const modal = await checksToOpen(app, '#open-modal');
    await escape();
    expect(await checksToOpen(app, '#open-confirm')).toBe(modal);
    expect(document.activeElement).toBe($('[role="alertdialog"] button'));
    expect(document.activeElement!.textContent!.trim()).toBe('Cancel');
    await escape();
    expect($('[role="alertdialog"]')).toBeNull();
    expect(document.activeElement).toBe($('#outside'));
  });

  it("moves focus into the command palette's search field at no app-wide check, opening as the modal does", async () => {
    const app = await bootstrap();
    const modal = await checksToOpen(app, '#open-modal');
    await escape();
    expect(await checksToOpen(app, '#open-command')).toBe(modal);
    expect(document.activeElement).toBe($('[aria-label="Command palette"] input'));
    await escape();
    expect($('[aria-label="Command palette"]')).toBeNull();
    expect(document.activeElement).toBe($('#outside'));
  });

  it('moves focus on a frame after a passcode is pasted, at no app-wide check of its own', async () => {
    const app = await bootstrap();
    const cells = Array.from(document.querySelectorAll<HTMLInputElement>('[data-pxl-otp-cell]'));
    // jsdom has no ClipboardEvent: a paste built by hand.
    const paste = (cell: HTMLInputElement, text: string) => {
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
      cell.dispatchEvent(event);
    };
    cells[0]!.focus();
    // What moving focus between two cells costs: their own focus and blur listeners.
    const focusing = await checksOf(app, () => cells[5]!.focus());
    // A paste of nothing the cells take renders nothing; one into the last
    // cell leaves focus there: past its frame, it costs no more.
    const rejected = await checksOf(app, () => paste(cells[5]!, 'abc'));
    expect(await checksOf(app, () => paste(cells[5]!, '9'))).toBe(rejected);
    expect(document.activeElement).toBe(cells[5]);

    cells[0]!.focus();
    expect(await checksOf(app, () => paste(cells[0]!, '123456'))).toBe(rejected + focusing);
    expect(cells.map((cell) => cell.value).join('')).toBe('123456');
    expect(document.activeElement).toBe(cells[5]);
  });

  it('opens the combobox, filters it and picks an option, rendering a plain field', async () => {
    const app = await bootstrap();
    const combobox = $('#fruit-picker')!;
    await open(combobox);
    expect(await stableWithin(5000)).toBe(true);
    const panel = $('[role="listbox"]')!.parentElement!;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.transform).toMatch(/^translate\(/);
    const search = $<HTMLInputElement>('[role="searchbox"]')!;
    expect(document.activeElement).toBe(search);

    search.value = 'an';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await appRef!.whenStable();
    expect(Array.from(document.querySelectorAll('[role="option"]'), (option) => option.textContent!.trim())).toEqual([
      'Banana',
    ]);
    key(search, 'Enter');
    await appRef!.whenStable();
    expect(app.fruit).toBe('banana');
    expect($('#fruit')!.textContent).toBe('banana');
    expect($('[role="listbox"]')).toBeNull();
    expect(combobox.textContent).toContain('Banana');
  });

  it('moves focus into the combobox search field at no app-wide check, opening as a combobox without one does', async () => {
    const app = await bootstrap();
    // Anchored once, a popover opens again where it was: the openings
    // compared below render the same but for the search field.
    for (const trigger of ['#fruit-list', '#fruit-picker']) {
      await open($(trigger)!);
      const panel = $('[role="listbox"]')!.parentElement!;
      // jsdom lays nothing out, but the offset and the viewport padding move the panel off 0, 0.
      await vi.waitFor(() => expect(panel.style.transform).not.toBe('translate(0px, 0px)'));
      await escape();
    }
    const withoutSearch = await checksToOpen(app, '#fruit-list');
    await escape();
    expect(await checksToOpen(app, '#fruit-picker')).toBe(withoutSearch);
    expect(document.activeElement).toBe($('[role="searchbox"]'));
  });

  it('opens the date picker, moves through its grid and picks a day, rendering a plain field', async () => {
    const app = await bootstrap();
    const trigger = $('#due-picker')!;
    await open(trigger);
    expect(await stableWithin(5000)).toBe(true);
    const panel = $('[role="grid"]')!.parentElement!;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.transform).toMatch(/^translate\(/);
    expect(document.activeElement).toBe($('[role="gridcell"][aria-label="June 15, 2026"]'));

    key(document.activeElement!, 'ArrowRight');
    await appRef!.whenStable();
    expect(document.activeElement).toBe($('[role="gridcell"][aria-label="June 16, 2026"]'));
    key(document.activeElement!, 'Enter');
    await appRef!.whenStable();
    expect(app.due).toEqual(new Date(2026, 5, 16));
    expect($('#due')!.textContent).toBe(new Date(2026, 5, 16).toDateString());
    expect($('[role="grid"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps the listeners of the combobox and the date picker outside the zone until they close', async () => {
    const app = await bootstrap();
    for (const [trigger, inside] of [
      ['#fruit-picker', '[role="listbox"]'],
      ['#due-picker', '[role="grid"]'],
    ] as const) {
      await open($(trigger)!);
      expect(await stableWithin(5000)).toBe(true);
      const checksBefore = app.checks;
      ignoredEvents($(inside)!);
      await sleep(10);
      expect(app.checks - checksBefore).toBe(0);
      expect($(inside)).not.toBeNull();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await appRef!.whenStable();
      expect($(inside)).toBeNull();
      expect(document.activeElement).toBe($(trigger));
    }
  });

  it('keeps the listeners of the tooltip and the dropdown outside the zone until they move or close what they anchor', async () => {
    const app = await bootstrap();
    const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const pressOutside = () => $('#outside')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    for (const [trigger, inside, anchor, close] of [
      ['#tip-trigger', '[role="tooltip"]', () => $('#tip-trigger')!.parentElement!, escape],
      ['#menu-trigger', '[role="menu"]', () => $('pxl-dropdown-root')!, pressOutside],
    ] as const) {
      await open($(trigger)!);
      expect(await stableWithin(5000)).toBe(true);
      const checksBefore = app.checks;
      ignoredEvents($(inside)!);
      await sleep(10);
      expect(app.checks - checksBefore).toBe(0);

      // The anchor moves: the next scroll re-anchors the content, which renders.
      const placed = $(inside)!.style.transform;
      vi.spyOn(anchor(), 'getBoundingClientRect').mockReturnValue({
        x: 120, y: 80, left: 120, top: 80, right: 180, bottom: 100, width: 60, height: 20,
      } as DOMRect);
      $('#scroller')!.dispatchEvent(new Event('scroll'));
      await sleep(0);
      await appRef!.whenStable();
      expect($(inside)!.style.transform).not.toBe(placed);

      // It closes from its page-wide listener, rendering the plain field.
      close();
      await appRef!.whenStable();
      expect($(inside)).toBeNull();
    }
    expect([app.tip, app.menu]).toEqual([false, false]);
    expect([$('#tip')!.textContent, $('#menu')!.textContent]).toEqual(['false', 'false']);
  });
});
