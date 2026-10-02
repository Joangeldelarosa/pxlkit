/**
 * <pxl-alert-dialog>: [(open)], the [onAction] and [onError] callbacks (sync,
 * async, thrown, rejected), the pending state and the linear layout.
 * Rendering and the shared interactions are covered against React by the
 * parity suite.
 */
import { Component, ErrorHandler, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelAlertDialog } from '../../public-api';

const dialog = () => document.querySelector<HTMLElement>('[role="alertdialog"]');
const buttons = () => Array.from(dialog()!.querySelectorAll<HTMLButtonElement>(':scope button'));
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

describe('PixelAlertDialog', () => {
  it('closes an [(open)] binding from Cancel, Escape and the backdrop, with focus starting on Cancel', async () => {
    @Component({
      imports: [PixelAlertDialog],
      template: `<pxl-alert-dialog [(open)]="open" title="Delete file?" cancelLabel="Keep" [onAction]="action" />`,
    })
    class Host {
      readonly open = signal(true);
      readonly action = () => {};
    }
    const { fixture, host, settle } = await render(Host);
    expect(document.activeElement).toBe(buttons()[0]);
    expect(buttons()[0]!.textContent!.trim()).toBe('Keep');
    buttons()[0]!.click();
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
    // `title` names the dialog; it must not also be a tooltip on the host.
    expect((fixture.nativeElement as HTMLElement).querySelector('pxl-alert-dialog')!.hasAttribute('title')).toBe(false);
    fixture.destroy();
  });

  it('closes after a synchronous action and stays busy until an async one resolves', async () => {
    let finish!: () => void;
    @Component({
      imports: [PixelAlertDialog],
      template: `<pxl-alert-dialog [(open)]="open" title="Confirm" [onAction]="action()" />`,
    })
    class Host {
      readonly open = signal(true);
      calls = 0;
      readonly action = signal<() => void | Promise<void>>(() => {
        this.calls++;
      });
    }
    const { fixture, host, settle } = await render(Host);
    buttons()[1]!.click();
    await settle();
    expect(host.calls).toBe(1);
    expect(host.open()).toBe(false);

    host.action.set(() => {
      host.calls++;
      return new Promise<void>((resolve) => (finish = resolve));
    });
    host.open.set(true);
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(buttons().every((button) => button.disabled)).toBe(true);
    expect(buttons()[1]!.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    escape();
    backdrop().click();
    buttons()[1]!.click();
    await settle();
    expect(host.calls).toBe(2);
    expect(host.open()).toBe(true);
    finish();
    await settle();
    expect(host.open()).toBe(false);
    fixture.destroy();
  });

  it('hands a thrown or rejected error to [onError] and stays open', async () => {
    const failure = new Error('nope');
    @Component({
      imports: [PixelAlertDialog],
      template: `<pxl-alert-dialog [(open)]="open" title="Confirm" [onAction]="action()" [onError]="failed" />`,
    })
    class Host {
      readonly open = signal(true);
      readonly errors: unknown[] = [];
      readonly action = signal<() => void | Promise<void>>(() => {
        throw failure;
      });
      readonly failed = (error: unknown) => this.errors.push(error);
    }
    const { fixture, host, settle } = await render(Host);
    buttons()[1]!.click();
    await settle();
    expect(host.errors).toEqual([failure]);
    expect(host.open()).toBe(true);
    host.action.set(() => Promise.reject(failure));
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(host.errors).toEqual([failure, failure]);
    expect(host.open()).toBe(true);
    expect(buttons()[1]!.disabled).toBe(false);
    fixture.destroy();
  });

  it('without [onError], lets a thrown error propagate and logs a rejection', async () => {
    const failure = new Error('nope');
    const handleError = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useValue: { handleError } }],
      // Report the error to the handler only, as an application does.
      rethrowApplicationErrors: false,
    });
    @Component({
      imports: [PixelAlertDialog],
      template: `<pxl-alert-dialog [open]="true" title="Confirm" [onAction]="action()" />`,
    })
    class Host {
      readonly action = signal<() => void | Promise<void>>(() => {
        throw failure;
      });
    }
    const { fixture, host, settle } = await render(Host);
    buttons()[1]!.click();
    await settle();
    expect(handleError).toHaveBeenCalledWith(failure);
    expect(dialog()).not.toBeNull();

    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    host.action.set(() => Promise.reject(failure));
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(log).toHaveBeenCalledWith('[PixelAlertDialog] onAction rejected:', failure);
    log.mockRestore();
    fixture.destroy();
  });

  it('names and describes the dialog, and sets the texts beside the accent on the linear surface', async () => {
    @Component({
      imports: [PixelAlertDialog],
      template: `
        <pxl-alert-dialog [open]="true" title="Delete file?" description="This cannot be undone." surface="linear" [onAction]="action" />
      `,
    })
    class Host {
      readonly action = () => {};
    }
    const { fixture } = await render(Host);
    const current = dialog()!;
    expect(document.getElementById(current.getAttribute('aria-labelledby')!)!.textContent).toBe('Delete file?');
    expect(document.getElementById(current.getAttribute('aria-describedby')!)!.textContent).toBe('This cannot be undone.');
    const [header, actions] = Array.from(current.children) as HTMLElement[];
    expect(current.children).toHaveLength(2);
    expect(header!.querySelector('h2')!.parentElement!.className).toBe('flex-1');
    expect(header!.querySelector('p')!.textContent).toBe('This cannot be undone.');
    expect(actions!.querySelectorAll('button')).toHaveLength(2);
    fixture.destroy();
  });
});
