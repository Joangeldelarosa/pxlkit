/**
 * <pxl-testimonial-card> beyond the parity examples: the avatar photo and
 * initials, the star rating, actions as text or a template, and the person's
 * role kept off the host's ARIA role.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelTestimonialCard, type ToneKey } from '../../public-api';

describe('PixelTestimonialCard', () => {
  it('shows the photo, named by the avatar, or the initials hidden from assistive technology', async () => {
    @Component({
      imports: [PixelTestimonialCard],
      template: '<pxl-testimonial-card quote="Q" name="Ada Lovelace" [avatar]="avatar()" />',
    })
    class Host {
      readonly avatar = signal<{ src?: string; name: string; tone?: ToneKey } | undefined>({ src: 'ada.png', name: 'Ada' });
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const avatar = (fixture.nativeElement as HTMLElement).querySelector('[data-pxl-avatar]')!;
    expect(avatar.hasAttribute('aria-hidden')).toBe(false);
    expect([avatar.querySelector('img')!.getAttribute('src'), avatar.querySelector('img')!.getAttribute('alt')]).toEqual([
      'ada.png',
      'Ada',
    ]);
    fixture.componentInstance.avatar.set({ name: 'Grace Hopper', tone: 'pink' });
    await fixture.whenStable();
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.textContent!.trim()).toBe('GH');
    expect(avatar.classList.contains('text-retro-pink')).toBe(true);
    fixture.componentInstance.avatar.set(undefined);
    await fixture.whenStable();
    expect(avatar.textContent!.trim()).toBe('AL');
  });

  it('rates with stars only when there are some, read from an attribute too', async () => {
    @Component({
      imports: [PixelTestimonialCard],
      template: '<pxl-testimonial-card quote="Q" name="Ada" stars="0" verified /><pxl-testimonial-card quote="Q" name="Ada" stars="3" />',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [none, three] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-testimonial-card'));
    expect(none!.querySelector('pxl-star-rating')).toBeNull();
    const badge = none!.querySelector('[data-pxl-verified]')!;
    expect([badge.getAttribute('role'), badge.getAttribute('aria-label')]).toEqual(['img', 'Verified']);
    expect(three!.querySelector('pxl-star-rating')!.getAttribute('aria-label')).toBe('3 out of 5');
  });

  it('renders text or a template as actions, and keeps the person role off the host role', async () => {
    @Component({
      imports: [PixelTestimonialCard],
      template: `
        <pxl-testimonial-card quote="Shipped." name="Ana" role="PM" company="Acme" variant="quote" [actions]="story" />
        <pxl-testimonial-card quote="Q" name="Ana" actions="Reply" />
        <ng-template #story><a href="/story">Story</a></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [linked, text] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('pxl-testimonial-card'));
    expect(linked!.getAttribute('role')).toBe('article');
    expect(linked!.querySelector('blockquote')!.textContent).toBe('“Shipped.”');
    expect(linked!.querySelector('div.pt-1 > a')!.textContent).toBe('Story');
    expect(linked!.querySelector('.truncate.text-xs')!.textContent).toBe('PM · Acme');
    expect(linked!.classList.contains('border-retro-border')).toBe(false);
    expect(text!.querySelector('div.pt-1')!.textContent).toBe('Reply');
  });
});
