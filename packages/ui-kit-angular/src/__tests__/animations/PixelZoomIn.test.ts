/**
 * <pxl-zoom-in>: its starting scale, and a hover trigger that focus and
 * clicks inside leave alone. The manifest examples are covered against
 * React by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelZoomIn } from '../../public-api';

async function render<T>(Host: new () => T) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  return { fixture, zoom: (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-zoom-in')! };
}

describe('PixelZoomIn', () => {
  it('zooms in from its starting scale', async () => {
    @Component({ imports: [PixelZoomIn], template: `<pxl-zoom-in [startScale]="0.6" [duration]="500">x</pxl-zoom-in>` })
    class Host {}
    const { zoom } = await render(Host);
    expect(zoom.style.animation).toBe('pxl-zoom-in 500ms cubic-bezier(.2,.9,.2,1) 0ms 1 both');
    expect(zoom.style.getPropertyValue('--pxl-zoom-start')).toBe('0.6');
  });

  it('plays while hovered only: focus and clicks inside do not start it', async () => {
    @Component({
      imports: [PixelZoomIn],
      template: `<pxl-zoom-in trigger="hover"><button type="button">Hover me</button></pxl-zoom-in>`,
    })
    class Host {}
    const { fixture, zoom } = await render(Host);
    const button = zoom.querySelector('button')!;
    button.focus();
    button.click();
    await fixture.whenStable();
    expect(zoom.style.animation).toBe('');
    zoom.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(zoom.style.animation).toContain('pxl-zoom-in');
    zoom.dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(zoom.style.animation).toBe('');
  });
});
