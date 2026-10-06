/**
 * <pxl-tabs>: the keyboard focus of the tabs and the panel, and a scrollable
 * list's single line. Rendering and the keyboard are covered against React
 * by the parity suite.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelTabs, type TabItem } from '../../public-api';

describe('PixelTabs', () => {
  it('rings the focused tab and panel, keeping an outline for forced-colors mode, which drops the ring', async () => {
    @Component({ imports: [PixelTabs], template: '<pxl-tabs defaultValue="a" [items]="items" />' })
    class Host {
      readonly items: TabItem[] = [
        { id: 'a', label: 'Alpha', content: 'Alpha panel' },
        { id: 'b', label: 'Beta', content: 'Beta panel' },
      ];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const elements = [...Array.from(root.querySelectorAll('[role="tab"]')), root.querySelector('[role="tabpanel"]')!];
    expect(elements).toHaveLength(3);
    for (const element of elements) {
      const classes = Array.from(element.classList);
      expect(classes).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
      expect(classes.filter((c) => c.endsWith('outline-none'))).toEqual([]);
    }
  });

  // Regression: the list also took `flex-wrap`, which Tailwind emits after
  // `flex-nowrap`, so its tabs wrapped onto new rows and nothing scrolled.
  it('keeps the tabs of a scrollable list on one line, where a plain list wraps them', async () => {
    @Component({ imports: [PixelTabs], template: '<pxl-tabs scrollable [items]="items" /><pxl-tabs [items]="items" />' })
    class Host {
      readonly items: TabItem[] = [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
      ];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [scrollable, wrapping] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[role="tablist"]'), (list) =>
      Array.from(list.classList),
    );
    expect(scrollable).toContain('flex-nowrap');
    expect(scrollable).not.toContain('flex-wrap');
    expect(wrapping).toContain('flex-wrap');
  });
});
