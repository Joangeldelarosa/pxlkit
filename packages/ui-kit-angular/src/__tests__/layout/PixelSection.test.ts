/**
 * PixelSection beyond the parity examples: the cleared `title` attribute, the
 * locale of the title, and moving the projected content between the centred
 * column and the full width.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelSection, PxlKitLocaleProvider, type ContainerWidth } from '../../public-api';

describe('PixelSection', () => {
  it('heads the section with the title for the nearest locale, without a native tooltip', async () => {
    @Component({
      imports: [PixelSection, PxlKitLocaleProvider],
      template: '<pxl-locale-provider locale="tr"><pxl-section title="istanbul">Body</pxl-section></pxl-locale-provider>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('pxl-section') as HTMLElement;
    expect(section.hasAttribute('title')).toBe(false);
    expect(section.querySelector('h3')?.textContent).toBe('İSTANBUL');
  });

  it('moves its projected content between the centred column and the full width', async () => {
    @Component({
      imports: [PixelSection],
      template: `
        <pxl-section title="Stats" subtitle="This week" horizontalGutter="sm" [container]="container()">
          <p id="body">Body</p>
        </pxl-section>
      `,
    })
    class Host {
      readonly container = signal<ContainerWidth | false>('5xl');
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('pxl-section') as HTMLElement;
    const column = section.firstElementChild as HTMLElement;
    expect(column.classList.contains('mx-auto')).toBe(true);
    expect(column.querySelector('h3 + p')?.textContent).toBe('This week');
    expect(column.querySelector('#body')).not.toBeNull();
    expect(section.classList.contains('px-3')).toBe(false);
    fixture.componentInstance.container.set(false);
    await fixture.whenStable();
    expect(section.classList.contains('px-3')).toBe(true);
    expect(section.querySelector('.mx-auto')).toBeNull();
    expect(Array.from(section.children).map((child) => child.tagName)).toEqual(['DIV', 'P']);
    expect(section.querySelector('#body')?.textContent).toBe('Body');
  });
});
