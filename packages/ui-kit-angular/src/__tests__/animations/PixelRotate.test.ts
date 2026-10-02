/**
 * <pxl-rotate>: its direction, set after the shorthand, and the user turning
 * reduced motion on while it plays. The manifest examples are covered
 * against React by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { PixelRotate } from '../../public-api';
import { installMatchMedia } from '../match-media';

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('PixelRotate', () => {
  it('turns in its direction until the user asks for reduced motion', async () => {
    const lists = installMatchMedia(() => false);
    @Component({ imports: [PixelRotate], template: `<pxl-rotate direction="alternate" [duration]="900">x</pxl-rotate>` })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const style = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-rotate')!.style;
    expect(style.animation).toBe('pxl-rotate 900ms linear 0ms infinite both');
    expect(style.animationDirection).toBe('alternate');
    for (const list of lists) list.fire(true);
    await fixture.whenStable();
    expect(style.animation).toBe('');
    expect(style.animationDirection).toBe('');
  });
});
