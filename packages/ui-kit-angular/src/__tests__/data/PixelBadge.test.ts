/**
 * <pxl-badge> / button[pxlBadge]: the keyboard focus of a clickable badge.
 * Rendering is covered against React by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelBadge } from '../../public-api';

describe('PixelBadge', () => {
  it('keeps an outline for forced-colors mode on a clickable badge, as that mode drops the focus ring', async () => {
    @Component({ imports: [PixelBadge], template: '<button pxlBadge>New</button>' })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const classes = Array.from((fixture.nativeElement as HTMLElement).querySelector('button')!.classList);
    expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(classes).not.toContain('focus-visible:outline-none');
  });
});
