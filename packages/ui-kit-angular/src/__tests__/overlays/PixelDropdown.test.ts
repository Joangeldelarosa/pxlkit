/**
 * The dropdown parts: [(open)] on the root, the (selected) outputs of items
 * and of the shorthand, attributes and listeners on items, own ids, icon
 * templates, typeahead labels and the Tab default. Rendering and the shared
 * interactions are covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  PixelDropdown,
  PixelDropdownContent,
  PixelDropdownItem,
  PixelDropdownRoot,
  PixelDropdownTrigger,
  type DropdownOption,
} from '../../public-api';

const PARTS = [PixelDropdownRoot, PixelDropdownTrigger, PixelDropdownContent, PixelDropdownItem];

const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!;
const menu = () => document.querySelector<HTMLElement>('[role="menu"]');
const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]'));
const highlighted = () => document.querySelector<HTMLElement>('[data-highlighted="true"]');
const keydown = (key: string) => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
const key = (key: string) => trigger().dispatchEvent(keydown(key));
// A key pressed where focus is: in the open menu.
const press = (key: string) => document.activeElement!.dispatchEvent(keydown(key));

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((done) => setTimeout(done, 0));
    await fixture.whenStable();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, settle };
}

describe('PixelDropdown', () => {
  it('shows what its parent binds: the trigger, Escape, a press outside and an item only ask, and it asks again after a refusal', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root [open]="open()" (openChange)="ask($event)">
          <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent><button pxlDropdownItem value="copy">Copy</button></div>
        </pxl-dropdown-root>
      `,
    })
    class Host {
      readonly open = signal(false);
      readonly requests: boolean[] = [];
      accept = false;
      ask(open: boolean): void {
        this.requests.push(open);
        if (this.accept) this.open.set(open);
      }
    }
    const { fixture, host, settle } = await render(Host);
    trigger().click();
    await settle();
    trigger().click();
    key('ArrowDown');
    await settle();
    expect(host.requests).toEqual([true, true, true]);
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    host.accept = true;
    trigger().click();
    await settle();
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(menu());
    host.accept = false;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    items()[0]!.click();
    await settle();
    expect(host.requests).toEqual([true, true, true, true, false, false, false]);
    expect(menu()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    fixture.destroy();
  });

  it('toggles an [(open)] binding from the trigger, advertising the menu, and opens on the first item from ArrowDown and on the last from ArrowUp', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root [(open)]="open">
          <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent>
            <button pxlDropdownItem value="a" disabled>Alpha</button>
            <button pxlDropdownItem value="b">Bravo</button>
            <button pxlDropdownItem value="c">Charlie</button>
            <button pxlDropdownItem value="d" disabled>Delta</button>
          </div>
        </pxl-dropdown-root>
      `,
    })
    class Host {
      readonly open = signal(false);
    }
    const { fixture, host, settle } = await render(Host);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    trigger().click();
    await settle();
    expect(host.open()).toBe(true);
    expect(trigger().getAttribute('aria-controls')).toBe(menu()!.id);
    trigger().click();
    await settle();
    expect(host.open()).toBe(false);
    expect(menu()).toBeNull();
    key('ArrowDown');
    await settle();
    expect(host.open()).toBe(true);
    expect(highlighted()!.textContent!.trim()).toBe('Bravo');
    expect(document.activeElement).toBe(menu());
    expect(menu()!.getAttribute('aria-activedescendant')).toBe(highlighted()!.id);
    host.open.set(false);
    await settle();
    key('ArrowUp');
    await settle();
    expect(highlighted()!.textContent!.trim()).toBe('Charlie');
    expect(menu()!.getAttribute('aria-activedescendant')).toBe(highlighted()!.id);
    fixture.destroy();
  });

  it('starts open from defaultOpen while uncontrolled and closes on Escape and on a press outside', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root defaultOpen (openChange)="changes.push($event)">
          <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent><button pxlDropdownItem>Copy</button></div>
        </pxl-dropdown-root>
      `,
    })
    class Host {
      readonly changes: Array<boolean | undefined> = [];
    }
    const { fixture, host, settle } = await render(Host);
    expect(menu()).not.toBeNull();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(menu()).toBeNull();
    trigger().click();
    await settle();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(menu()).toBeNull();
    expect(host.changes).toEqual([false, true, false]);
    fixture.destroy();
  });

  it('emits (selected) from a click and from Enter or Space on the highlighted item, never from a disabled one', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root>
          <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent>
            <button pxlDropdownItem value="copy" (selected)="selected.push('copy')">Copy</button>
            <button pxlDropdownItem value="cut" disabled (selected)="selected.push('cut')">Cut</button>
            <button pxlDropdownItem value="paste" (selected)="selected.push('paste')">Paste</button>
          </div>
        </pxl-dropdown-root>
      `,
    })
    class Host {
      readonly selected: string[] = [];
    }
    const { fixture, host, settle } = await render(Host);
    trigger().click();
    await settle();
    items()[1]!.click();
    items()[1]!.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(menu()).not.toBeNull();
    expect(highlighted()).toBeNull();
    items()[0]!.click();
    await settle();
    expect(menu()).toBeNull();
    key('ArrowDown');
    await settle();
    press('ArrowDown');
    await settle();
    press(' ');
    await settle();
    expect(document.activeElement).toBe(trigger());
    key('ArrowDown');
    await settle();
    press('Enter');
    await settle();
    expect(host.selected).toEqual(['copy', 'paste', 'copy']);
    fixture.destroy();
  });

  it("keeps the item buttons' own attributes and listeners, and draws icons and checkbox / radio marks", async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root defaultOpen>
          <pxl-dropdown-trigger [icon]="flag">Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent class="extra-menu">
            <button pxlDropdownItem class="extra" data-testid="item" aria-keyshortcuts="Meta+C" [icon]="flag" (click)="clicks = clicks + 1">
              Copy
            </button>
            <button pxlDropdownCheckboxItem [checked]="true">Grid</button>
            <button pxlDropdownRadioItem [checked]="true">Cozy</button>
            <button pxlDropdownRadioItem>Compact</button>
          </div>
        </pxl-dropdown-root>
        <ng-template #flag><i data-testid="flag"></i></ng-template>
      `,
    })
    class Host {
      clicks = 0;
    }
    const { fixture, host } = await render(Host);
    expect(trigger().querySelector('[data-testid="flag"]')).not.toBeNull();
    expect(trigger().querySelector('svg')).toBeNull();
    expect(menu()!.classList).toContain('extra-menu');
    expect(menu()!.classList).toContain('min-w-44');
    const [item, check, cozy, compact] = items();
    expect(item!.getAttribute('data-testid')).toBe('item');
    expect(item!.getAttribute('aria-keyshortcuts')).toBe('Meta+C');
    expect(item!.classList).toContain('extra');
    expect(item!.classList).toContain('items-center');
    expect(item!.querySelector('[data-testid="flag"]')).not.toBeNull();
    expect([item, check, cozy, compact].map((each) => each!.getAttribute('role'))).toEqual([
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'menuitemradio',
    ]);
    expect([item, check, cozy, compact].map((each) => each!.getAttribute('aria-checked'))).toEqual([null, 'true', 'true', 'false']);
    expect(check!.querySelector('[aria-hidden="true"]')!.textContent).toBe('✓');
    expect(cozy!.querySelector('[aria-hidden="true"]')!.textContent).toBe('●');
    expect(compact!.querySelector('[aria-hidden="true"]')!.textContent).toBe('');
    item!.click();
    expect(host.clicks).toBe(1);
    fixture.destroy();
  });

  it('jumps by typing only to items whose label is text', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root defaultOpen>
          <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent>
            <button pxlDropdownItem value="bold"><b>Bold</b></button>
            <button pxlDropdownItem value="bright">Bright</button>
          </div>
        </pxl-dropdown-root>
      `,
    })
    class Host {}
    const { fixture, settle } = await render(Host);
    press('b');
    await settle();
    expect(highlighted()!.textContent!.trim()).toBe('Bright');
    fixture.destroy();
  });

  it('names the menu by the trigger and points it at the highlighted item, by their own ids when they have them', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root>
          <pxl-dropdown-trigger id="file-menu">File</pxl-dropdown-trigger>
          <div *pxlDropdownContent>
            <button pxlDropdownItem id="file-new">New</button>
            <button pxlDropdownItem>Open</button>
          </div>
        </pxl-dropdown-root>
      `,
    })
    class Host {}
    const { fixture, settle } = await render(Host);
    expect(trigger().id).toBe('file-menu');
    expect(document.querySelector('pxl-dropdown-trigger')!.hasAttribute('id')).toBe(false);
    trigger().click();
    await settle();
    expect(document.activeElement).toBe(menu());
    expect(menu()!.getAttribute('aria-labelledby')).toBe('file-menu');
    expect(menu()!.hasAttribute('aria-activedescendant')).toBe(false);
    press('ArrowDown');
    await settle();
    expect(menu()!.getAttribute('aria-activedescendant')).toBe('file-new');
    press('ArrowDown');
    await settle();
    expect(menu()!.getAttribute('aria-activedescendant')).toBe(items()[1]!.id);
    expect(items()[1]!.id).not.toBe('');
    fixture.destroy();
  });

  it('closes on Tab with focus back on the trigger, leaving the default to the browser', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-dropdown-root>
          <pxl-dropdown-trigger>Menu</pxl-dropdown-trigger>
          <div *pxlDropdownContent><button pxlDropdownItem>Copy</button></div>
        </pxl-dropdown-root>
      `,
    })
    class Host {}
    const { fixture, settle } = await render(Host);
    trigger().click();
    await settle();
    const tab = keydown('Tab');
    menu()!.dispatchEvent(tab);
    await settle();
    expect(tab.defaultPrevented).toBe(false);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    fixture.destroy();
  });

  it('emits the value of a row of the shorthand, and lets projected parts replace the shorthand', async () => {
    @Component({
      imports: [PixelDropdown, ...PARTS],
      template: `
        <pxl-dropdown label="Actions" [items]="items" (selected)="selected.push($event)" />
        <pxl-dropdown label="Unused" [items]="items">
          <pxl-dropdown-trigger>Own</pxl-dropdown-trigger>
        </pxl-dropdown>
      `,
    })
    class Host {
      readonly items: DropdownOption[] = [
        { value: 'edit', label: 'Edit' },
        { value: 'more', label: 'More', kind: 'submenu' },
      ];
      readonly selected: string[] = [];
    }
    const { fixture, host, settle } = await render(Host);
    const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="menu"]'));
    expect(triggers.map((button) => button.textContent!.trim())).toEqual(['Actions', 'Own']);
    triggers[0]!.click();
    await settle();
    expect(items()[1]!.textContent).toContain('▸');
    items()[1]!.click();
    await settle();
    expect(host.selected).toEqual(['more']);
    fixture.destroy();
  });
});
