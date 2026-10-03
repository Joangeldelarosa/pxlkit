/**
 * <pxl-pricing-card> beyond the parity examples: text and templates for its
 * content inputs, attribute inputs, the feature list and the popular ribbon.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelPricingCard, type ToneKey } from '../../public-api';

describe('PixelPricingCard', () => {
  it('renders text and templates for its icon, price badge, call to action and footer', async () => {
    @Component({
      imports: [PixelPricingCard],
      template: `
        <pxl-pricing-card name="Pro" [price]="{ amount: 29 }" icon="★" priceBadge="NEW" [cta]="buy" footer="Billed yearly" />
        <ng-template #buy><button type="button">Buy</button></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const card = (fixture.nativeElement as HTMLElement).querySelector('pxl-pricing-card')!;
    expect(card.getAttribute('role')).toBe('article');
    expect(card.querySelector('span[aria-hidden="true"]')!.textContent).toBe('★');
    expect(card.querySelector('[data-pxl-price-badge-slot]')!.textContent!.trim()).toBe('NEW');
    expect(card.querySelector('div.mt-5 > button')!.textContent).toBe('Buy');
    expect(card.querySelector('div.mt-3')!.textContent).toBe('Billed yearly');
  });

  it('reads the description clamp from an attribute, keeps the old price when 0, and lists its features', async () => {
    @Component({
      imports: [PixelPricingCard],
      template: `
        <pxl-pricing-card
          name="Free"
          descriptionLines="3"
          tone="cyan"
          [price]="{ amount: '$0', strikethrough: 0 }"
          [features]="[{ label: 'SSO', tooltip: 'Single sign-on', highlight: true }, { label: 'Audit log', included: false }]"
        />
        <pxl-pricing-card name="Flow" descriptionLines="none" [price]="{ amount: 1 }" />
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [free, flow] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-pricing-card'));
    expect(free!.querySelector('[data-pxl-description-slot]')!.classList.contains('line-clamp-3')).toBe(true);
    expect(flow!.querySelector('[data-pxl-description-slot]')!.className).not.toContain('line-clamp');
    expect(free!.querySelector('s')!.textContent).toBe('Previous price 0');
    const [sso, audit] = Array.from(free!.querySelectorAll('li'));
    const label = (item: Element) => item.querySelectorAll('span')[1]!;
    expect(label(sso!).getAttribute('title')).toBe('Single sign-on');
    expect(Array.from(label(sso!).classList).sort()).toEqual(['font-medium', 'text-retro-cyan']);
    expect(sso!.textContent).toBe('Included: SSO');
    expect(label(audit!).hasAttribute('title')).toBe(false);
    expect(audit!.textContent).toBe('Not included: Audit log');
    expect(flow!.querySelector('ul')).toBeNull();
  });

  it('labels the popular ribbon POPULAR unless told otherwise, in its own tone', async () => {
    @Component({
      imports: [PixelPricingCard],
      template: '<pxl-pricing-card name="Pro" [price]="{ amount: 29 }" [popular]="popular()" />',
    })
    class Host {
      readonly popular = signal<{ label?: string; tone?: ToneKey } | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const slot = (fixture.nativeElement as HTMLElement).querySelector('[data-pxl-ribbon-slot]')!;
    expect(slot.textContent).toBe('');
    fixture.componentInstance.popular.set({});
    await fixture.whenStable();
    expect(slot.textContent).toBe('POPULAR');
    fixture.componentInstance.popular.set({ label: 'BEST VALUE', tone: 'red' });
    await fixture.whenStable();
    expect(slot.querySelector('span')!.textContent).toBe('BEST VALUE');
    expect(slot.querySelector('span')!.classList.contains('bg-retro-red/18')).toBe(true);
  });
});
