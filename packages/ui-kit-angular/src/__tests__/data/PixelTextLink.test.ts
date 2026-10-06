/**
 * a[pxlTextLink] / button[pxlTextLink]: the button type and native events.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelTextLink } from '../../public-api';

describe('PixelTextLink', () => {
  it('defaults a button to a plain button, keeping an own type, and leaves anchors as they are', async () => {
    @Component({
      imports: [PixelTextLink],
      template: `
        <button pxlTextLink>Undo</button>
        <button pxlTextLink type="submit">Save</button>
        <a pxlTextLink href="/docs">Docs</a>
        <a pxlTextLink href="/feed.xml" type="application/rss+xml">Feed</a>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [plain, submit] = Array.from(root.querySelectorAll('button'));
    const [docs, feed] = Array.from(root.querySelectorAll('a'));
    expect(plain!.getAttribute('type')).toBe('button');
    expect(submit!.getAttribute('type')).toBe('submit');
    expect(docs!.hasAttribute('type')).toBe(false);
    expect(feed!.getAttribute('type')).toBe('application/rss+xml');
    expect(docs!.className).toContain('underline');
  });

  it('emits native clicks', async () => {
    const clicked = vi.fn();
    @Component({ imports: [PixelTextLink], template: '<button pxlTextLink tone="gold" (click)="clicked()">Undo</button>' })
    class Host {
      readonly clicked = clicked;
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    button.click();
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(button.className).toContain('hover:opacity-80');
  });
});
