/**
 * PixelCluster beyond the parity examples: any host element, attribute
 * coercion, unset inputs and the cleared legacy `align` attribute.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelCluster, type StackJustify } from '../../public-api';

describe('PixelCluster', () => {
  it('styles its own element and drops the legacy align attribute', async () => {
    @Component({
      imports: [PixelCluster],
      template: '<ul pxlCluster class="own" gap="2" align="baseline"><li>a</li><li>b</li></ul>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('ul') as HTMLElement;
    expect(Array.from(list.classList)).toEqual(
      expect.arrayContaining(['own', 'flex', 'flex-row', 'flex-wrap', 'gap-2', 'items-baseline']),
    );
    expect(list.hasAttribute('align')).toBe(false);
  });

  it('falls back to its defaults for unset inputs and follows the distribution', async () => {
    @Component({
      imports: [PixelCluster],
      template: '<div pxlCluster [gap]="undefined" [align]="undefined" [justify]="justify()"></div>',
    })
    class Host {
      readonly justify = signal<StackJustify | undefined>('evenly');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(Array.from(div.classList)).toEqual(expect.arrayContaining(['gap-4', 'items-center', 'justify-evenly']));
    fixture.componentInstance.justify.set(undefined);
    await fixture.whenStable();
    expect(Array.from(div.classList).some((name) => name.startsWith('justify-'))).toBe(false);
  });
});
