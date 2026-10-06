/**
 * <pxl-alert>: the label and its deprecated `title` alias, the `live`
 * override and the icon / action inputs (text or template). Rendering is
 * covered against React by the parity suite.
 */
import { Component, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelAlert } from '../../public-api';

function render<T>(Host: Type<T>): HTMLElement {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('PixelAlert', () => {
  it('shows the label, falling back to the deprecated title, which stays off the host', () => {
    @Component({
      imports: [PixelAlert],
      template: `
        <pxl-alert id="both" label="Canonical" title="Old" message="m" />
        <pxl-alert id="legacy" title="Legacy" message="m" />
      `,
    })
    class Host {}
    const root = render(Host);
    const both = root.querySelector('#both')!;
    expect(both.textContent).toContain('Canonical');
    expect(both.textContent).not.toContain('Old');
    expect(root.querySelector('#legacy')!.textContent).toContain('Legacy');
    expect(both.hasAttribute('title')).toBe(false);
  });

  it('interrupts for critical tones, waits for the others, and follows live', () => {
    @Component({
      imports: [PixelAlert],
      template: `
        <pxl-alert message="m" />
        <pxl-alert message="m" tone="cyan" />
        <pxl-alert message="m" tone="red" live="off" />
      `,
    })
    class Host {}
    const alerts = Array.from(render(Host).querySelectorAll('pxl-alert'));
    expect(alerts.map((alert) => alert.getAttribute('aria-live'))).toEqual(['assertive', 'polite', 'off']);
    expect(alerts.every((alert) => alert.getAttribute('role') === 'alert')).toBe(true);
  });

  it('renders the icon and action as text or templates, only when given', () => {
    @Component({
      imports: [PixelAlert],
      template: `
        <pxl-alert id="bare" message="m" />
        <pxl-alert id="text" message="m" icon="!" action="Retry later" />
        <pxl-alert id="templates" message="m" [icon]="icon" [action]="retry" />
        <ng-template #icon><svg data-testid="icon"></svg></ng-template>
        <ng-template #retry><button type="button">Retry</button></ng-template>
      `,
    })
    class Host {}
    const root = render(Host);
    expect(root.querySelector('#bare .mt-3')).toBeNull();
    expect(root.querySelector('#text .mt-3')!.textContent).toBe('Retry later');
    expect(root.querySelector('#text span.shrink-0')!.textContent).toBe('!');
    expect(root.querySelector('#templates [data-testid="icon"]')).not.toBeNull();
    expect(root.querySelector('#templates .mt-3 button')!.textContent).toBe('Retry');
  });

  it('draws the accent stripe on the pixel surface only', () => {
    @Component({
      imports: [PixelAlert],
      template: `<pxl-alert id="pixel" message="m" /><pxl-alert id="linear" message="m" surface="linear" />`,
    })
    class Host {}
    const root = render(Host);
    expect(root.querySelector('#pixel span[aria-hidden="true"].w-1')).not.toBeNull();
    expect(root.querySelector('#linear .w-1')).toBeNull();
  });
});
