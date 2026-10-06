/**
 * ol[pxlTimeline] beyond the parity examples: a changing active entry and
 * entry list, template inputs, and the native attributes it clears.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelTimeline, PixelTimelineItem } from '../../public-api';

const PARTS = [PixelTimeline, PixelTimelineItem];
const states = (root: HTMLElement) => Array.from(root.querySelectorAll('li'), (li) => li.getAttribute('data-pxl-state'));

describe('PixelTimeline', () => {
  it('follows the active entry and the entry list', async () => {
    @Component({
      imports: PARTS,
      template: `
        <ol pxlTimeline [active]="active()">
          @for (label of labels(); track label) {
            <li pxlTimelineItem [label]="label"></li>
          }
        </ol>
      `,
    })
    class Host {
      readonly active = signal<number | undefined>(undefined);
      readonly labels = signal(['One', 'Two']);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(states(root)).toEqual(['upcoming', 'upcoming']);

    fixture.componentInstance.active.set(1);
    fixture.componentInstance.labels.update((labels) => [...labels, 'Three']);
    await fixture.whenStable();
    expect(states(root)).toEqual(['past', 'active', 'upcoming']);
    const lis = root.querySelectorAll('li');
    expect(lis[1]!.getAttribute('aria-current')).toBe('step');
    expect(lis[1]!.querySelector('[data-pxl-connector]')).not.toBeNull();
    expect(lis[2]!.querySelector('[data-pxl-connector]')).toBeNull();
  });

  it('renders bullet and description templates, and clears the deprecated title from the <li>', async () => {
    @Component({
      imports: PARTS,
      template: `
        <ol pxlTimeline active="0">
          <li pxlTimelineItem title="Shipped" [bullet]="dot" [description]="details"></li>
        </ol>
        <ng-template #dot><i class="dot"></i></ng-template>
        <ng-template #details><a href="/track">Track it</a></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const li = (fixture.nativeElement as HTMLElement).querySelector('li')!;
    expect(li.hasAttribute('title')).toBe(false);
    expect(li.getAttribute('data-pxl-state')).toBe('active');
    expect(li.querySelector('[data-pxl-bullet] .dot')).not.toBeNull();
    expect(li.querySelector('a[href="/track"]')!.parentElement!.className).toContain('text-retro-muted');
    expect(li.textContent).toContain('Shipped');
  });
});
