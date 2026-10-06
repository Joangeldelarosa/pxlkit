/**
 * <pxl-float>: the in-view trigger, with and without IntersectionObserver.
 * The manifest examples are covered against React by the parity suite.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelFloat, type AnimationTrigger } from '../../public-api';

afterEach(() => {
  vi.unstubAllGlobals();
});

@Component({
  imports: [PixelFloat],
  template: `<pxl-float [trigger]="trigger()" [distance]="14">x</pxl-float>`,
})
class Host {
  readonly trigger = signal<AnimationTrigger>('inView');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, float: (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('pxl-float')! };
}

describe('PixelFloat', () => {
  it('floats while in view, and stops observing once it leaves the inView mode', async () => {
    let report: IntersectionObserverCallback = () => {};
    const observer = { observe: vi.fn(), disconnect: vi.fn() };
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        expect(options).toEqual({ threshold: 0.15 });
        report = callback;
        return observer;
      }),
    );
    const intersect = (isIntersecting: boolean) =>
      report([{ isIntersecting } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    const { fixture, float } = await render();
    expect(observer.observe).toHaveBeenCalledWith(float);
    expect(float.style.animation).toBe('');
    intersect(true);
    await fixture.whenStable();
    expect(float.style.getPropertyValue('--pxl-float-distance')).toBe('14px');
    intersect(false);
    await fixture.whenStable();
    expect(float.style.animation).toBe('');
    fixture.componentInstance.trigger.set('mount');
    await fixture.whenStable();
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(float.style.animation).toBe('pxl-float 2200ms ease-in-out 0ms infinite both');
  });

  it('floats at once where IntersectionObserver is missing', async () => {
    expect(typeof IntersectionObserver).toBe('undefined');
    const { float } = await render();
    expect(float.style.animation).toBe('pxl-float 2200ms ease-in-out 0ms infinite both');
  });
});
