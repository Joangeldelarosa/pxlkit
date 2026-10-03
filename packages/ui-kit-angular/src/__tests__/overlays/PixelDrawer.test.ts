/**
 * <pxl-drawer>: [(open)], the dismissal and focus options, its accessible
 * name, the container and its header / body / footer parts. Rendering and
 * the shared interactions are covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelDrawer, PixelDrawerBody, PixelDrawerFooter, PixelDrawerHeader, PxlKitSurfaceProvider } from '../../public-api';

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const backdrop = () => document.querySelector<HTMLElement>('[data-pxl-drawer-overlay]');
const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

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

describe('PixelDrawer', () => {
  it('shows what its parent binds: a refused close keeps it open and locking the page, until the parent closes it', async () => {
    @Component({
      imports: [PixelDrawer],
      template: `
        <pxl-drawer [open]="open()" title="Settings" (openChange)="requests.push($event)">
          <button type="button">inside</button>
        </pxl-drawer>
      `,
    })
    class Host {
      readonly open = signal(true);
      readonly requests: boolean[] = [];
    }
    const { fixture, host, settle } = await render(Host);
    escape();
    backdrop()!.click();
    await settle();
    expect(host.requests).toEqual([false, false]);
    expect(dialog()).not.toBeNull();
    expect(dialog()!.contains(document.activeElement)).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    host.open.set(false);
    await settle();
    expect(dialog()).toBeNull();
    host.open.set(true);
    await settle();
    expect(dialog()).not.toBeNull();
    fixture.destroy();
  });

  it('closes an [(open)] binding on Escape and on the backdrop, unless dismissOnOverlay is off', async () => {
    @Component({
      imports: [PixelDrawer],
      template: `
        <pxl-drawer [(open)]="open" title="Settings" [dismissOnOverlay]="dismiss()">
          <button type="button">inside</button>
        </pxl-drawer>
      `,
    })
    class Host {
      readonly open = signal(true);
      readonly dismiss = signal(false);
    }
    const { fixture, host, settle } = await render(Host);
    backdrop()!.click();
    await settle();
    expect(host.open()).toBe(true);
    host.dismiss.set(true);
    await settle();
    backdrop()!.click();
    await settle();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
    host.open.set(true);
    await settle();
    escape();
    await settle();
    expect(host.open()).toBe(false);
    // `title` names the dialog; it must not also be a tooltip on the host.
    expect((fixture.nativeElement as HTMLElement).querySelector('pxl-drawer')!.hasAttribute('title')).toBe(false);
    fixture.destroy();
  });

  it('drops the backdrop with overlay off and leaves focus alone with trapFocus off', async () => {
    const outside = document.body.appendChild(document.createElement('button'));
    outside.focus();
    @Component({
      imports: [PixelDrawer],
      template: `
        <pxl-drawer [open]="true" title="Settings" [overlay]="false" [trapFocus]="false">
          <button type="button">inside</button>
        </pxl-drawer>
      `,
    })
    class Host {}
    const { fixture } = await render(Host);
    expect(dialog()).not.toBeNull();
    expect(backdrop()).toBeNull();
    expect(document.activeElement).toBe(outside);
    fixture.destroy();
    outside.remove();
  });

  it('is named by its title and description, or by ariaLabel, and warns without either', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    @Component({
      imports: [PixelDrawer],
      template: `
        <pxl-drawer [open]="true" [title]="title()" [ariaLabel]="label()" description="Pick one">
          <button type="button">inside</button>
        </pxl-drawer>
      `,
    })
    class Host {
      readonly title = signal<string | undefined>('Settings');
      readonly label = signal<string | undefined>(undefined);
    }
    const { fixture, host, settle } = await render(Host);
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent).toBe('Settings');
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent).toBe('Pick one');
    expect(warn).not.toHaveBeenCalled();
    host.title.set(undefined);
    host.label.set('Navigation');
    await settle();
    expect(dialog()!.getAttribute('aria-label')).toBe('Navigation');
    expect(dialog()!.hasAttribute('aria-labelledby')).toBe(false);
    host.label.set(undefined);
    await settle();
    expect(warn).toHaveBeenCalledWith('[PixelDrawer] role="dialog" has no accessible name. Pass either `title` or `aria-label`.');
    warn.mockRestore();
    fixture.destroy();
  });

  it('renders into a given container, and draws its parts for their own surface with merged classes', async () => {
    const container = document.body.appendChild(document.createElement('section'));
    @Component({
      imports: [PixelDrawer, PixelDrawerHeader, PixelDrawerBody, PixelDrawerFooter, PxlKitSurfaceProvider],
      template: `
        <ng-container pxlKitSurface="linear">
          <pxl-drawer [open]="true" title="Settings" surface="pixel" [container]="container">
            <pxl-drawer-header class="extra">Header</pxl-drawer-header>
            <pxl-drawer-body data-testid="body">Body</pxl-drawer-body>
            <pxl-drawer-footer surface="pixel">Footer</pxl-drawer-footer>
          </pxl-drawer>
        </ng-container>
      `,
    })
    class Host {
      readonly container = container;
    }
    const { fixture } = await render(Host);
    expect(container.contains(dialog())).toBe(true);
    const header = dialog()!.querySelector('pxl-drawer-header')!;
    // The parts read the provider's surface (or their own), not the drawer's.
    expect(header.className).toContain('border-b border-retro-border');
    expect(header.className).not.toContain('border-b-2');
    expect(header.classList).toContain('extra');
    expect(dialog()!.querySelector('pxl-drawer-body')!.getAttribute('data-testid')).toBe('body');
    expect(dialog()!.querySelector('pxl-drawer-footer')!.className).toContain('border-t-2');
    fixture.destroy();
    container.remove();
  });
});
