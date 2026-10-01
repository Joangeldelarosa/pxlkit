/**
 * <pxl-modal>: [(open)] and (closed), async close, description and footer
 * content, and the page effects. Rendering and the shared interactions are
 * covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelModal } from '../../public-api';

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const closeButton = () => dialog()!.querySelector<HTMLButtonElement>('button[aria-label]')!;
const backdrop = () => document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!;
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

describe('PixelModal', () => {
  it('closes an [(open)] binding and emits (closed) from the button, Escape and the backdrop', async () => {
    @Component({
      imports: [PixelModal],
      template: `<pxl-modal [(open)]="open" title="Title" (closed)="closed = closed + 1"><p>body</p></pxl-modal>`,
    })
    class Host {
      readonly open = signal(true);
      closed = 0;
    }
    const { fixture, host, settle } = await render(Host);
    closeButton().click();
    await settle();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
    host.open.set(true);
    await settle();
    escape();
    await settle();
    expect(host.open()).toBe(false);
    host.open.set(true);
    await settle();
    backdrop().click();
    await settle();
    expect(host.open()).toBe(false);
    expect(host.closed).toBe(3);
    fixture.destroy();
  });

  it('awaits asyncClose with a busy close button, ignoring Escape and the backdrop meanwhile', async () => {
    let finish!: () => void;
    let calls = 0;
    @Component({
      imports: [PixelModal],
      template: `<pxl-modal [(open)]="open" title="Title" [asyncClose]="asyncClose"><p>body</p></pxl-modal>`,
    })
    class Host {
      readonly open = signal(true);
      readonly asyncClose = () => {
        calls++;
        return new Promise<void>((resolve) => (finish = resolve));
      };
    }
    const { fixture, host, settle } = await render(Host);
    closeButton().click();
    await settle();
    expect(closeButton().disabled).toBe(true);
    expect(closeButton().getAttribute('aria-busy')).toBe('true');
    escape();
    backdrop().click();
    await settle();
    expect(calls).toBe(1);
    expect(host.open()).toBe(true);
    finish();
    await settle();
    expect(host.open()).toBe(false);
    fixture.destroy();
  });

  it('describes the dialog with its description, renders the footer template and names it with the title', async () => {
    @Component({
      imports: [PixelModal],
      template: `
        <pxl-modal [open]="true" title="Save changes?" description="Details" [footer]="actions"><p>body</p></pxl-modal>
        <ng-template #actions><button type="button">Save</button></ng-template>
      `,
    })
    class Host {}
    const { fixture } = await render(Host);
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent!.trim()).toBe('Details');
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent).toBe('SAVE CHANGES?');
    expect(dialog()!.textContent).toContain('Save');
    // `title` names the dialog; it must not also be a tooltip on the host.
    expect((fixture.nativeElement as HTMLElement).querySelector('pxl-modal')!.hasAttribute('title')).toBe(false);
    fixture.destroy();
  });

  it('locks page scrolling while open, renders into a given container and cleans up when destroyed', async () => {
    const container = document.createElement('section');
    document.body.appendChild(container);
    @Component({
      imports: [PixelModal],
      template: `<pxl-modal [(open)]="open" title="Title" [container]="container"><p>body</p></pxl-modal>`,
    })
    class Host {
      readonly open = signal(true);
      readonly container = container;
    }
    const { fixture, host, settle } = await render(Host);
    expect(container.contains(dialog())).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    host.open.set(false);
    await settle();
    expect(document.body.style.overflow).toBe('');
    host.open.set(true);
    await settle();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).toBe('');
    escape();
    expect(host.open()).toBe(true);
  });
});
