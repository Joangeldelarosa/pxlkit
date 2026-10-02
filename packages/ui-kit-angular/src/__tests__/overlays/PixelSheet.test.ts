/**
 * <pxl-sheet>: [(open)], its side, size and drag handle, and its accessible
 * name. Rendering and the shared interactions are covered against React by
 * the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { SheetSide } from '@pxlkit/ui-kit-core';
import { describe, expect, it, vi } from 'vitest';
import { PixelSheet } from '../../public-api';

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const handle = () => document.querySelector<HTMLElement>('[data-testid="pixel-sheet-drag-handle"]');
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

describe('PixelSheet', () => {
  it('closes an [(open)] binding on Escape and on the backdrop', async () => {
    @Component({
      imports: [PixelSheet],
      template: `<pxl-sheet [(open)]="open" title="Actions"><p>body</p></pxl-sheet>`,
    })
    class Host {
      readonly open = signal(true);
    }
    const { fixture, host, settle } = await render(Host);
    escape();
    await settle();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
    host.open.set(true);
    await settle();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(host.open()).toBe(false);
    // `title` names the dialog; it must not also be a tooltip on the host.
    expect((fixture.nativeElement as HTMLElement).querySelector('pxl-sheet')!.hasAttribute('title')).toBe(false);
    fixture.destroy();
  });

  it('reports its side and size and draws the drag handle last on a top sheet', async () => {
    @Component({
      imports: [PixelSheet],
      template: `<pxl-sheet [open]="true" title="Actions" dragHandle [side]="side()" size="lg"><p>body</p></pxl-sheet>`,
    })
    class Host {
      readonly side = signal<SheetSide>('bottom');
    }
    const { fixture, host, settle } = await render(Host);
    expect(dialog()!.dataset).toMatchObject({ side: 'bottom', size: 'lg' });
    expect(dialog()!.firstElementChild).toBe(handle());
    expect(handle()!.classList).not.toContain('order-last');
    host.side.set('top');
    await settle();
    expect(dialog()!.dataset).toMatchObject({ side: 'top' });
    expect(handle()!.classList).toContain('order-last');
    fixture.destroy();
  });

  it('is named by its title, or by ariaLabel, and warns without either', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    @Component({
      imports: [PixelSheet],
      template: `<pxl-sheet [open]="true" [title]="title()" [ariaLabel]="label()" description="Pick one"><p>body</p></pxl-sheet>`,
    })
    class Host {
      readonly title = signal<string | undefined>('Actions');
      readonly label = signal<string | undefined>(undefined);
    }
    const { fixture, host, settle } = await render(Host);
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.tagName).toBe('H4');
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent).toBe('Pick one');
    host.title.set(undefined);
    host.label.set('Top sheet');
    await settle();
    expect(dialog()!.getAttribute('aria-label')).toBe('Top sheet');
    expect(warn).not.toHaveBeenCalled();
    host.label.set(undefined);
    await settle();
    expect(warn).toHaveBeenCalledWith('[PixelSheet] role="dialog" has no accessible name. Pass either `title` or `aria-label`.');
    warn.mockRestore();
    fixture.destroy();
  });
});
