/**
 * <pxl-sidebar> beyond the parity examples: `[(collapsed)]` in both
 * directions, the uncontrolled default (read once) and its output, item
 * handlers, text header and footer, and the landmark.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelSidebar, type PixelSidebarSectionProps } from '../../public-api';

const SECTIONS: PixelSidebarSectionProps[] = [{ label: 'Main', items: [{ id: 'home', label: 'Home' }] }];

describe('PixelSidebar', () => {
  it('binds the collapsed state with [(collapsed)] in both directions', async () => {
    @Component({
      imports: [PixelSidebar],
      template: '<pxl-sidebar collapsible [(collapsed)]="collapsed" [sections]="sections" />',
    })
    class Host {
      readonly sections = SECTIONS;
      readonly collapsed = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const toggle = root.querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(toggle.getAttribute('aria-label')).toBe('Expand sidebar');
    fixture.componentInstance.collapsed.set(false);
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('h3')!.textContent).toBe('Main');
  });

  it('reads defaultCollapsed once while uncontrolled, and emits each toggle', async () => {
    @Component({
      imports: [PixelSidebar],
      template: `
        <pxl-sidebar collapsible [defaultCollapsed]="initial()" [sections]="sections" (collapsedChange)="changes.push($event)" />
      `,
    })
    class Host {
      readonly sections = SECTIONS;
      readonly initial = signal(true);
      readonly changes: Array<boolean | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-sidebar')!;
    expect(host.classList).toContain('w-14');
    expect(host.querySelector('li button')!.getAttribute('aria-label')).toBe('Home');
    fixture.componentInstance.initial.set(false);
    await fixture.whenStable();
    expect(host.classList).toContain('w-14');
    host.querySelector<HTMLButtonElement>('button[aria-expanded]')!.click();
    await fixture.whenStable();
    expect(host.classList).toContain('w-56');
    expect(fixture.componentInstance.changes).toEqual([false]);
  });

  it('runs onSelect for button items, not for links', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    @Component({
      imports: [PixelSidebar],
      template: '<pxl-sidebar [sections]="sections" />',
    })
    class Host {
      readonly sections: PixelSidebarSectionProps[] = [
        {
          items: [
            { id: 'button', label: 'Button', onSelect: onButton },
            { id: 'link', label: 'Link', href: '#link', onSelect: onLink },
          ],
        },
      ];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('li button')!.click();
    root.querySelector<HTMLAnchorElement>('li a')!.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(onButton).toHaveBeenCalledTimes(1);
    expect(onLink).not.toHaveBeenCalled();
  });

  it('is a navigation landmark, renamed by an aria-label, with a text header and footer', async () => {
    @Component({
      imports: [PixelSidebar],
      template: '<pxl-sidebar aria-label="Docs" [sections]="sections" header="pxlkit" footer="v2" />',
    })
    class Host {
      readonly sections = SECTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-sidebar')!;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Docs');
    expect(host.firstElementChild!.textContent!.trim()).toBe('pxlkit');
    expect(host.lastElementChild!.textContent!.trim()).toBe('v2');
  });
});

describe('PixelSidebar — section titles', () => {
  it('spaces a section title wide on linear too, where the display face is tight', async () => {
    const tracking = (element: Element) => Array.from(element.classList).filter((name) => name.startsWith('tracking-'));
    @Component({ imports: [PixelSidebar], template: '<pxl-sidebar surface="linear" [sections]="sections" />' })
    class Host {
      readonly sections = SECTIONS;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(tracking(fixture.nativeElement.querySelector('h3'))).toEqual(['tracking-wider']);
  });
});
