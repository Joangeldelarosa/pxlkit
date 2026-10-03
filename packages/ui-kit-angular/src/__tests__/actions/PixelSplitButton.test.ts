/**
 * PixelSplitButton: the (primary) and (selected) outputs, one-way options
 * and disabled state, synthetic clicks on disabled buttons and the typeahead
 * timer. Rendering, the keyboard and focus are covered against React by the
 * parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelSplitButton, type Option } from '../../public-api';

const OPTIONS: Option[] = [
  { value: 'csv', label: 'Export CSV' },
  { value: 'json', label: 'Export JSON' },
];

const chevron = () => document.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
const menu = () => document.querySelector<HTMLElement>('[role="menu"]');
const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
const keydown = (key: string) => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

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

@Component({
  imports: [PixelSplitButton],
  template: `
    <pxl-split-button
      label="Export"
      [options]="options()"
      [disabled]="disabled()"
      (primary)="events.push('primary')"
      (selected)="events.push($event)"
    />
  `,
})
class Host {
  readonly options = signal(OPTIONS);
  readonly disabled = signal(false);
  readonly events: string[] = [];
}

describe('PixelSplitButton', () => {
  it('emits (primary) from the primary button and (selected) with the value of the chosen option', async () => {
    const { host, settle } = await render(Host);
    (document.querySelector('pxl-split-button button') as HTMLButtonElement).click();
    await settle();
    expect(host.events).toEqual(['primary']);
    expect(menu()).toBeNull();

    chevron().click();
    await settle();
    expect(document.activeElement).toBe(menu());
    items()[1]!.click();
    await settle();
    expect(host.events).toEqual(['primary', 'json']);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(chevron());

    chevron().dispatchEvent(keydown('ArrowUp'));
    await settle();
    menu()!.dispatchEvent(keydown('Enter'));
    await settle();
    expect(host.events).toEqual(['primary', 'json', 'json']);
  });

  it('renders the options it is given and keeps its host free of the disabled attribute', async () => {
    const { host, settle } = await render(Host);
    chevron().click();
    await settle();
    host.options.set([...OPTIONS, { value: 'xml', label: 'Export XML' }]);
    await settle();
    expect(items().map((item) => item.textContent!.trim())).toEqual(['Export CSV', 'Export JSON', 'Export XML']);
    host.disabled.set(true);
    await settle();
    expect(document.querySelector('pxl-split-button')!.hasAttribute('disabled')).toBe(false);
  });

  it('ignores synthetic clicks while disabled, then works once enabled', async () => {
    const { host, settle } = await render(Host);
    host.disabled.set(true);
    await settle();
    const [primary, toggle] = Array.from(document.querySelectorAll<HTMLButtonElement>('pxl-split-button button'));
    expect(primary!.disabled).toBe(true);
    expect(toggle!.disabled).toBe(true);
    primary!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    toggle!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    expect(host.events).toEqual([]);
    expect(menu()).toBeNull();

    host.disabled.set(false);
    await settle();
    chevron().click();
    await settle();
    expect(menu()).not.toBeNull();
  });

  it('stops its typeahead timer when it is destroyed', async () => {
    const { fixture, settle } = await render(Host);
    chevron().click();
    await settle();
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    const set = vi.spyOn(globalThis, 'setTimeout');
    menu()!.dispatchEvent(keydown('j'));
    await settle();
    expect(items()[1]!.getAttribute('data-highlighted')).toBe('true');
    const timer = set.mock.results.find((result, index) => set.mock.calls[index]![1] === 600)?.value;
    expect(timer).toBeDefined();
    fixture.destroy();
    expect(clear).toHaveBeenCalledWith(timer);
    clear.mockRestore();
    set.mockRestore();
  });
});
