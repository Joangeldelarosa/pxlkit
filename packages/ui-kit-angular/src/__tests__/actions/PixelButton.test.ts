/**
 * PixelButton behaviour beyond the parity examples: the loading width pin,
 * anchors, attribute coercion and events.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelButton } from '../../public-api';

describe('PixelButton', () => {
  it('pins its width while loading and releases it afterwards', async () => {
    @Component({ imports: [PixelButton], template: '<button pxlButton [loading]="loading()">Save</button>' })
    class Host {
      readonly loading = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ width: 96 } as DOMRect);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(button.style.minWidth).toBe('96px');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.querySelector('[data-testid="pxl-button-spinner"]')).not.toBeNull();
    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();
    expect(button.style.minWidth).toBe('');
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('keeps an anchor content as is and never disables it', async () => {
    @Component({ imports: [PixelButton], template: '<a pxlButton href="/docs" loading>Docs</a>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(anchor.innerHTML.replace(/<!--[^>]*-->/g, '')).toBe('Docs');
    expect(anchor.hasAttribute('disabled')).toBe(false);
  });

  it('falls back to its defaults for unset inputs and emits native clicks', async () => {
    const clicked = vi.fn();
    @Component({
      imports: [PixelButton],
      template: '<button pxlButton [tone]="undefined" [size]="undefined" [variant]="undefined" (click)="clicked()">Go</button>',
    })
    class Host {
      readonly clicked = clicked;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('text-retro-green');
    expect(button.className).toContain('h-10');
    button.click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('drops shadows and press feedback when disabled', async () => {
    @Component({ imports: [PixelButton], template: '<button pxlButton variant="soft" disabled>Off</button>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('pxl-shadow')).toBe(false);
    expect(button.classList.contains('pxl-shadow-active')).toBe(false);
    expect(button.disabled).toBe(true);
  });

  it('rings keyboard focus, keeping an outline for forced-colors mode, which drops the ring', async () => {
    @Component({ imports: [PixelButton], template: '<button pxlButton surface="linear">Go</button>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const classes = Array.from((fixture.nativeElement as HTMLElement).querySelector('button')!.classList);
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes.filter((c) => c.endsWith('outline-none'))).toEqual([]);
  });
});
