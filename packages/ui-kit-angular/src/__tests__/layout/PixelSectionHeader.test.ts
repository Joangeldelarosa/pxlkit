/**
 * PixelSectionHeader beyond the parity examples: the cleared `title`
 * attribute, the heading level, the eyebrow repeated for screen readers and
 * actions as text or a template.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelSectionHeader, type SectionHeaderLevel } from '../../public-api';

describe('PixelSectionHeader', () => {
  it('heads with the level it is given and repeats the eyebrow for screen readers only', async () => {
    @Component({
      imports: [PixelSectionHeader],
      template: '<pxl-section-header title="Pricing" [eyebrow]="eyebrow()" [as]="level()" class="own" />',
    })
    class Host {
      readonly eyebrow = signal<string | undefined>('Plans');
      readonly level = signal<SectionHeaderLevel | undefined>('h3');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const header = fixture.nativeElement.querySelector('pxl-section-header') as HTMLElement;
    expect(header.hasAttribute('title')).toBe(false);
    expect(Array.from(header.classList)).toEqual(['own', 'w-full']);
    expect(header.querySelector('span[aria-hidden="true"]')?.textContent).toBe('Plans');
    const heading = header.querySelector('h3') as HTMLElement;
    expect(heading.querySelector('.sr-only')?.textContent?.trim()).toBe('Plans:');
    expect(heading.textContent?.replace(/\s+/g, ' ').trim()).toBe('Plans: Pricing');
    fixture.componentInstance.level.set('h4');
    fixture.componentInstance.eyebrow.set(undefined);
    await fixture.whenStable();
    expect(header.querySelector('h4')?.textContent?.trim()).toBe('Pricing');
    expect(header.querySelector('[aria-hidden="true"]')).toBeNull();
    for (const level of ['h5', 'h6'] as const) {
      fixture.componentInstance.level.set(level);
      await fixture.whenStable();
      expect(header.querySelector(level)?.textContent?.trim()).toBe('Pricing');
    }
    fixture.componentInstance.level.set(undefined);
    await fixture.whenStable();
    expect(header.querySelector('h2')?.textContent?.trim()).toBe('Pricing');
  });

  it('renders the actions row for text or a template only', async () => {
    @Component({
      imports: [PixelSectionHeader],
      template: `
        <pxl-section-header id="plain" title="Pricing" />
        <pxl-section-header id="text" title="Pricing" actions="Updated today" />
        <pxl-section-header id="template" title="Pricing" align="center" [actions]="actions" />
        <ng-template #actions><a href="#plans">See plans</a></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const actionsOf = (id: string) => fixture.nativeElement.querySelector(`#${id} .flex-wrap`) as HTMLElement | null;
    expect(actionsOf('plain')).toBeNull();
    expect(actionsOf('text')?.textContent).toBe('Updated today');
    const row = actionsOf('template')!;
    expect(row.querySelector('a')?.textContent).toBe('See plans');
    expect(row.classList.contains('justify-center')).toBe(true);
  });
});
