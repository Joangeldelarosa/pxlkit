/**
 * pxlParallaxGroup: the classes it adds to the element it is placed on,
 * next to the consumer's own classes, styles and attributes.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelParallaxGroup } from '../../public-api';

describe('PixelParallaxGroup', () => {
  it('positions and clips its layers on the element it is placed on, keeping the consumer classes, styles and attributes', async () => {
    @Component({
      imports: [PixelParallaxGroup],
      template: `
        <div pxlParallaxGroup>Layers</div>
        <section pxlParallaxGroup class="h-64" style="height: 300px" aria-label="Scene">Scene</section>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [div, section] = Array.from((fixture.nativeElement as HTMLElement).children) as HTMLElement[];
    expect(Array.from(div!.classList).sort()).toEqual(['overflow-hidden', 'relative']);
    expect(Array.from(section!.classList).sort()).toEqual(['h-64', 'overflow-hidden', 'relative']);
    expect(section!.style.height).toBe('300px');
    expect(section!.getAttribute('aria-label')).toBe('Scene');
  });
});
