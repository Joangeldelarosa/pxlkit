/**
 * <pxl-popover>: [(open)], the trigger's ARIA and click contract, the content
 * panel's attributes, and dismissal options. Rendering and the shared
 * interactions are covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelPopover, PixelPopoverArrow, PixelPopoverContent, PixelPopoverTrigger } from '../../public-api';

const PARTS = [PixelPopover, PixelPopoverTrigger, PixelPopoverContent, PixelPopoverArrow];

const panel = () => document.querySelector<HTMLElement>('[data-testid="content"]');
const trigger = () => document.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!;
const pointerDown = (target: Element) => target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
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

afterEach(() => {
  document.body.innerHTML = '';
});

describe('PixelPopover', () => {
  it('renders no content while closed and renders it into <body> while open', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [(open)]="open">
          <button type="button" pxlPopoverTrigger data-testid="trigger">open</button>
          <div *pxlPopoverContent data-testid="content">hello</div>
        </pxl-popover>
      `,
    })
    class Host {
      readonly open = signal(false);
    }
    const { fixture, host, settle } = await render(Host);
    expect(panel()).toBeNull();
    trigger().click();
    await settle();
    expect(host.open()).toBe(true);
    const content = panel()!;
    expect(content.parentElement).toBe(document.body);
    expect((fixture.nativeElement as HTMLElement).contains(content)).toBe(false);
    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.style.position).toBe('absolute');
    expect(content.style.zIndex).toBe('70');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    trigger().click();
    await settle();
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('lets a (click) listener of the trigger cancel the toggle', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [(open)]="open">
          <button type="button" pxlPopoverTrigger data-testid="trigger" (click)="$event.preventDefault()">open</button>
          <div *pxlPopoverContent data-testid="content">hello</div>
        </pxl-popover>
      `,
    })
    class Host {
      readonly open = signal(false);
    }
    const { host, settle } = await render(Host);
    trigger().click();
    await settle();
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it("keeps the trigger's own aria-haspopup", async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [open]="false" haspopup="menu">
          <button type="button" pxlPopoverTrigger data-testid="trigger" aria-haspopup="listbox">open</button>
        </pxl-popover>
        <pxl-popover [open]="false" haspopup="menu">
          <button type="button" pxlPopoverTrigger data-testid="other">open</button>
        </pxl-popover>
      `,
    })
    class Host {}
    await render(Host);
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(document.querySelector('[data-testid="other"]')!.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('closes on Escape unless closeOnEscape is false', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [(open)]="open" [closeOnEscape]="closeOnEscape()">
          <button type="button" pxlPopoverTrigger data-testid="trigger">open</button>
          <div *pxlPopoverContent data-testid="content">hello</div>
        </pxl-popover>
      `,
    })
    class Host {
      readonly open = signal(true);
      readonly closeOnEscape = signal(false);
    }
    const { host, settle } = await render(Host);
    expect(panel()).not.toBeNull();
    escape();
    await settle();
    expect(panel()).not.toBeNull();
    host.closeOnEscape.set(true);
    await settle();
    escape();
    await settle();
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('closes on a press outside the trigger and the content, unless closeOnOutsideClick is false', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [(open)]="open" [closeOnOutsideClick]="closeOnOutside()">
          <button type="button" pxlPopoverTrigger data-testid="trigger">open</button>
          <div *pxlPopoverContent data-testid="content">hello</div>
        </pxl-popover>
        <button type="button" data-testid="outside">outside</button>
      `,
    })
    class Host {
      readonly open = signal(true);
      readonly closeOnOutside = signal(false);
    }
    const { host, settle } = await render(Host);
    const outside = document.querySelector('[data-testid="outside"]')!;
    pointerDown(outside);
    await settle();
    expect(panel()).not.toBeNull();
    host.closeOnOutside.set(true);
    await settle();
    pointerDown(panel()!);
    pointerDown(trigger());
    await settle();
    expect(panel()).not.toBeNull();
    pointerDown(outside);
    await settle();
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('omits the role for role="none", keeps an own role and clears it from the host', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [open]="true" role="none" data-testid="root">
          <button type="button" pxlPopoverTrigger>open</button>
          <div *pxlPopoverContent data-testid="content">hello</div>
        </pxl-popover>
        <pxl-popover [open]="true">
          <button type="button" pxlPopoverTrigger>open</button>
          <div *pxlPopoverContent role="menu" data-testid="own">hello</div>
        </pxl-popover>
      `,
    })
    class Host {}
    await render(Host);
    expect(panel()!.hasAttribute('role')).toBe(false);
    expect(document.querySelector('[data-testid="root"]')!.hasAttribute('role')).toBe(false);
    expect(document.querySelector('[data-testid="own"]')!.getAttribute('role')).toBe('menu');
  });

  it("merges the panel's classes and lets its own style override the positioning", async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [open]="true">
          <button type="button" pxlPopoverTrigger>open</button>
          <div *pxlPopoverContent data-testid="content" class="w-64" style="z-index: 5; max-width: 20rem">hello</div>
        </pxl-popover>
      `,
    })
    class Host {}
    await render(Host);
    const content = panel()!;
    expect(content.classList.contains('w-64')).toBe(true);
    expect(content.classList.contains('shadow-xl')).toBe(true);
    expect(content.style.zIndex).toBe('5');
    expect(content.style.maxWidth).toBe('20rem');
    expect(content.style.transform).toMatch(/^translate\(/);
  });

  it('takes the surface of the popover, overridable on the panel, and points the arrow at the trigger', async () => {
    @Component({
      imports: PARTS,
      template: `
        <pxl-popover [open]="true" surface="linear" side="top">
          <button type="button" pxlPopoverTrigger>open</button>
          <div *pxlPopoverContent data-testid="content">hello <pxl-popover-arrow /></div>
        </pxl-popover>
        <pxl-popover [open]="true" surface="linear">
          <button type="button" pxlPopoverTrigger>open</button>
          <div *pxlPopoverContent="'pixel'" data-testid="override">hello</div>
        </pxl-popover>
      `,
    })
    class Host {}
    await render(Host);
    expect(panel()!.className).toContain('rounded-xl');
    const arrow = panel()!.querySelector('pxl-popover-arrow')!;
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.className).toContain('bottom-[-5px]');
    expect(document.querySelector('[data-testid="override"]')!.className).toContain('pxl-corner-md');
  });

  it('removes the panel and its listeners with the popover', async () => {
    @Component({
      imports: PARTS,
      template: `
        @if (shown()) {
          <pxl-popover [(open)]="open">
            <button type="button" pxlPopoverTrigger data-testid="trigger">open</button>
            <div *pxlPopoverContent data-testid="content">hello</div>
          </pxl-popover>
        }
      `,
    })
    class Host {
      readonly shown = signal(true);
      readonly open = signal(true);
    }
    const { host, settle } = await render(Host);
    expect(panel()).not.toBeNull();
    host.shown.set(false);
    await settle();
    expect(panel()).toBeNull();
    escape();
    await settle();
    expect(host.open()).toBe(true);
  });

  it('explains when a part is used outside a <pxl-popover>', () => {
    @Component({ imports: PARTS, template: '<button type="button" pxlPopoverTrigger>open</button>' })
    class Host {}
    expect(() => TestBed.createComponent(Host)).toThrow('PixelPopoverTrigger must be used inside a <pxl-popover> root.');
  });
});
