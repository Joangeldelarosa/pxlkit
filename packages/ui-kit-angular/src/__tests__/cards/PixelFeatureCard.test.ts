/**
 * PixelFeatureCard beyond the parity examples: the article, link and button
 * roots, keyboard activation, attribute inputs, the deprecated aliases and
 * projected content.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelFeatureCard } from '../../public-api';

const key = (name: string) => new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('PixelFeatureCard', () => {
  it('is an article, a link on an <a>, and a button when interactive', async () => {
    @Component({
      imports: [PixelFeatureCard],
      template: `
        <pxl-feature-card title="Article" />
        <a pxlFeatureCard title="Link" href="/docs" download="guide.pdf" interactive></a>
        <div pxlFeatureCard title="Button" interactive></div>
      `,
    })
    class Host {}
    const { root } = await render(Host);
    const [article, link, button] = Array.from(root.querySelectorAll('pxl-feature-card, [pxlfeaturecard]')) as HTMLElement[];
    expect(article!.getAttribute('role')).toBe('article');
    expect(article!.hasAttribute('title')).toBe(false);
    expect(link!.hasAttribute('role')).toBe(false);
    expect(link!.getAttribute('download')).toBe('guide.pdf');
    expect(link!.classList.contains('focus-visible:ring-2')).toBe(true);
    expect(link!.querySelector('h3')!.textContent).toBe('Link');
    expect([button!.getAttribute('role'), button!.getAttribute('tabindex')]).toEqual(['button', '0']);
  });

  it('clicks a button card on Enter and Space, unless its own keydown listener says no', async () => {
    @Component({
      imports: [PixelFeatureCard],
      template: `
        <div pxlFeatureCard title="Open" interactive (click)="clicks.push('open')"></div>
        <div pxlFeatureCard title="Kept" interactive (click)="clicks.push('kept')" (keydown)="$event.preventDefault()"></div>
      `,
    })
    class Host {
      readonly clicks: string[] = [];
    }
    const { fixture, root } = await render(Host);
    const [open, kept] = Array.from(root.querySelectorAll('[pxlfeaturecard]')) as HTMLElement[];
    const space = key(' ');
    open!.dispatchEvent(key('Enter'));
    open!.dispatchEvent(space);
    open!.dispatchEvent(key('x'));
    kept!.dispatchEvent(key('Enter'));
    expect(space.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.clicks).toEqual(['open', 'open']);
  });

  it('reads attribute values and the deprecated aliases, which the new inputs win over', async () => {
    @Component({
      imports: [PixelFeatureCard],
      template: `
        <pxl-feature-card title="T" icon="★" iconSize="80" desc="Legacy" descLines="2" [description]="description()" [descriptionLines]="lines()" />
      `,
    })
    class Host {
      readonly description = signal<string | undefined>(undefined);
      readonly lines = signal<4 | undefined>(undefined);
    }
    const { fixture, root } = await render(Host);
    const frame = root.querySelector('[data-pxl-icon-frame]') as HTMLElement;
    expect(frame.textContent!.trim()).toBe('★');
    expect(frame.classList.contains('w-20')).toBe(true);
    const paragraph = () => root.querySelector('p') as HTMLElement;
    expect([paragraph().textContent, paragraph().classList.contains('line-clamp-2')]).toEqual(['Legacy', true]);
    fixture.componentInstance.description.set('Current');
    fixture.componentInstance.lines.set(4);
    await fixture.whenStable();
    expect([paragraph().textContent, paragraph().classList.contains('line-clamp-4')]).toEqual(['Current', true]);
  });

  it('puts projected content after its own, and the footer in the column of a horizontal card', async () => {
    @Component({
      imports: [PixelFeatureCard],
      template: `
        <pxl-feature-card title="T" orientation="horizontal" [badge]="{ label: 'NEW' }" [footer]="more"><em>extra</em></pxl-feature-card>
        <ng-template #more><span>More</span></ng-template>
      `,
    })
    class Host {}
    const { root } = await render(Host);
    const card = root.querySelector('pxl-feature-card') as HTMLElement;
    expect(card.lastElementChild!.tagName).toBe('EM');
    expect(card.querySelector('.min-w-0 > div > span')!.textContent).toBe('More');
    expect(card.querySelector('[data-pxl-badge-slot] span')!.textContent).toBe('NEW');
    expect(card.querySelector('[data-pxl-badge-slot]')!.classList.contains('col-span-2')).toBe(true);
  });
});
