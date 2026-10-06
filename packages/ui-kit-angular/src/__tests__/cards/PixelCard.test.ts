/**
 * PixelCard beyond the parity examples: the article, link and button roots,
 * keyboard activation, the body wrapper, templates and the composed header.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelCard, PixelCardHeader, PxlKitSurfaceProvider, type ToneKey } from '../../public-api';

const key = (name: string) => new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });

async function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('PixelCard', () => {
  it('is an article, a link on an <a>, and a button when interactive', async () => {
    @Component({
      imports: [PixelCard],
      template: `
        <pxl-card title="Article">Body</pxl-card>
        <a pxlCard title="Link" href="/docs" target="_blank" rel="noopener" interactive></a>
        <div pxlCard title="Button" interactive>Body</div>
        <pxl-card interactive>Body</pxl-card>
      `,
    })
    class Host {}
    const { root } = await render(Host);
    const [article, link, button, custom] = Array.from(root.querySelectorAll('pxl-card, [pxlcard]')) as HTMLElement[];
    expect(article!.getAttribute('role')).toBe('article');
    expect(article!.hasAttribute('tabindex')).toBe(false);
    expect(article!.hasAttribute('title')).toBe(false);
    expect(link!.hasAttribute('role')).toBe(false);
    expect(link!.hasAttribute('tabindex')).toBe(false);
    expect([link!.getAttribute('href'), link!.getAttribute('target'), link!.getAttribute('rel')]).toEqual(['/docs', '_blank', 'noopener']);
    expect(link!.classList.contains('hover:-translate-y-[2px]')).toBe(true);
    expect(link!.querySelector('h4')!.textContent).toBe('Link');
    for (const card of [button!, custom!]) {
      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('tabindex')).toBe('0');
    }
  });

  it('clicks a button card on Enter and Space, unless its own keydown listener says no', async () => {
    @Component({
      imports: [PixelCard],
      template: `
        <div pxlCard interactive (click)="clicks.push($event.type)">Open</div>
        <div pxlCard interactive (click)="clicks.push('cancelled')" (keydown)="$event.preventDefault()">Kept</div>
        <pxl-card (click)="clicks.push('article')">Plain</pxl-card>
      `,
    })
    class Host {
      readonly clicks: string[] = [];
    }
    const { fixture, root } = await render(Host);
    const [button, cancelled, article] = Array.from(root.querySelectorAll('pxl-card, [pxlcard]')) as HTMLElement[];
    const enter = key('Enter');
    button!.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    button!.dispatchEvent(key(' '));
    button!.dispatchEvent(key('a'));
    cancelled!.dispatchEvent(key('Enter'));
    article!.dispatchEvent(key('Enter'));
    expect(fixture.componentInstance.clicks).toEqual(['click', 'click']);
  });

  it('keeps a role and a tabindex of its own', async () => {
    @Component({
      imports: [PixelCard],
      template: '<div pxlCard interactive role="link" tabindex="-1"></div><pxl-card role="listitem"></pxl-card>',
    })
    class Host {}
    const { root } = await render(Host);
    const [button, article] = Array.from(root.querySelectorAll('pxl-card, [pxlcard]')) as HTMLElement[];
    expect([button!.getAttribute('role'), button!.getAttribute('tabindex')]).toEqual(['link', '-1']);
    expect(article!.getAttribute('role')).toBe('listitem');
  });

  it('wraps projected content in the body, and renders no body without any', async () => {
    @Component({
      imports: [PixelCard],
      template: `
        <pxl-card title="Text">Plain text</pxl-card>
        <pxl-card title="Empty"></pxl-card>
        <pxl-card title="Conditional">@if (shown()) { <p>Shown</p> }</pxl-card>
      `,
    })
    class Host {
      readonly shown = signal(false);
    }
    const { fixture, root } = await render(Host);
    const bodies = () =>
      (Array.from(root.querySelectorAll('pxl-card')) as HTMLElement[]).map(
        (card) => card.querySelector(':scope > div > div.text-sm')?.textContent?.trim() ?? null,
      );
    expect(bodies()).toEqual(['Plain text', null, '']);
    fixture.componentInstance.shown.set(true);
    await fixture.whenStable();
    expect(bodies()).toEqual(['Plain text', null, 'Shown']);
  });

  it('renders text and templates for the icon, media and footer, and follows its inputs', async () => {
    @Component({
      imports: [PixelCard],
      template: `
        <pxl-card title="Card" icon="★" [media]="cover" footer="Due soon" [badge]="badge()" [description]="description()">
          Body
        </pxl-card>
        <ng-template #cover><img alt="" /></ng-template>
      `,
    })
    class Host {
      readonly badge = signal<{ label: string; tone?: ToneKey } | undefined>(undefined);
      readonly description = signal<string | undefined>(undefined);
    }
    const { fixture, root } = await render(Host);
    const card = root.querySelector('pxl-card') as HTMLElement;
    expect(card.querySelector('header span')!.textContent).toBe('★');
    expect(card.querySelector(':scope > div.overflow-hidden > img')).not.toBeNull();
    expect(card.querySelector('footer')!.textContent).toBe('Due soon');
    expect(card.querySelector('header')!.classList.contains('mb-3')).toBe(true);
    expect(card.querySelector('pxl-ribbon')).toBeNull();

    fixture.componentInstance.badge.set({ label: 'HOT', tone: 'red' });
    fixture.componentInstance.description.set('Details');
    await fixture.whenStable();
    const ribbon = card.querySelector('pxl-ribbon') as HTMLElement;
    expect(ribbon.textContent).toBe('HOT');
    expect(ribbon.classList.contains('bg-retro-red')).toBe(true);
    expect(card.querySelector('p')!.textContent).toBe('Details');
    expect(card.querySelector('header')!.classList.contains('mb-2')).toBe(true);
  });

  it('replaces its title header with a <pxl-card-header> projected directly into it', async () => {
    @Component({
      imports: [PixelCard, PixelCardHeader],
      template: `
        <pxl-card title="Implicit"><pxl-card-header>Own</pxl-card-header></pxl-card>
        <pxl-card title="Implicit"><div><pxl-card-header>Nested</pxl-card-header></div></pxl-card>
      `,
    })
    class Host {}
    const { root } = await render(Host);
    const [composed, nested] = Array.from(root.querySelectorAll('pxl-card')) as HTMLElement[];
    expect(composed!.querySelector('header')).toBeNull();
    expect(composed!.querySelector('pxl-card-header')!.textContent).toBe('Own');
    expect(nested!.querySelector('header h4')!.textContent).toBe('Implicit');
  });

  it('draws its chrome and ribbon on the surface of the nearest provider', async () => {
    @Component({
      imports: [PixelCard, PxlKitSurfaceProvider],
      template: `<ng-container pxlKitSurface="linear"><pxl-card [badge]="{ label: 'NEW' }" descriptionLines="3" description="D"></pxl-card></ng-container>`,
    })
    class Host {}
    const { root } = await render(Host);
    const card = root.querySelector('pxl-card') as HTMLElement;
    expect(Array.from(card.classList)).toEqual(expect.arrayContaining(['border', 'rounded-xl', 'overflow-hidden']));
    expect(card.querySelector('pxl-ribbon')!.classList.contains('rounded-md')).toBe(true);
    expect(card.querySelector('p')!.classList.contains('line-clamp-3')).toBe(true);
  });
});
