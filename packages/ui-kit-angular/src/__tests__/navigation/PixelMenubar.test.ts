/**
 * <pxl-menubar> beyond the parity examples: item handlers from the pointer
 * and the keyboard, icon templates that receive their item, and the host as
 * the menubar.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelMenubar, type PixelMenubarMenu } from '../../public-api';

const key = (name: string) =>
  document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

describe('PixelMenubar', () => {
  it('runs onSelect for an item chosen with the pointer or the keyboard', async () => {
    const onSave = vi.fn();
    const onPdf = vi.fn();
    @Component({
      imports: [PixelMenubar],
      template: '<pxl-menubar [menus]="menus" />',
    })
    class Host {
      readonly menus: PixelMenubarMenu[] = [
        {
          label: 'File',
          items: [
            { value: 'save', label: 'Save', onSelect: onSave },
            { value: 'export', label: 'Export', submenu: [{ value: 'pdf', label: 'PDF', onSelect: onPdf }] },
          ],
        },
      ];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector('button')!;
    trigger.click();
    await fixture.whenStable();
    root.querySelector<HTMLElement>('[role="menu"] [role="menuitem"]')!.click();
    expect(onSave).toHaveBeenCalledTimes(1);
    trigger.click();
    await fixture.whenStable();
    key('ArrowDown');
    key('Enter');
    await fixture.whenStable();
    key('Enter');
    await fixture.whenStable();
    expect(onPdf).toHaveBeenCalledTimes(1);
    expect(root.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('gives an icon template its item, and the host is the menubar', async () => {
    @Component({
      imports: [PixelMenubar],
      template: `
        <pxl-menubar
          class="w-full"
          aria-label="Editor"
          [menus]="[{ label: 'File', items: [{ value: 'save', label: 'Save', icon: icon }] }]"
        />
        <ng-template #icon let-item><i>{{ item.label[0] }}</i></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-menubar')!;
    expect(host.getAttribute('role')).toBe('menubar');
    expect(host.getAttribute('aria-orientation')).toBe('horizontal');
    expect(host.getAttribute('aria-label')).toBe('Editor');
    expect(host.classList).toContain('w-full');
    host.querySelector('button')!.click();
    await fixture.whenStable();
    expect(host.querySelector('[role="menuitem"] i')!.textContent).toBe('S');
  });
});
