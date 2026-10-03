/**
 * PixelHeroSection: text and template content in each layout, the parallax
 * media hidden from assistive technology, a split hero without media, and
 * attributes of the consumer's on the section.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelHeroSection, type HeroVariant } from '../../public-api';

@Component({
  imports: [PixelHeroSection],
  template: `
    <section
      pxlHeroSection
      headline="Hello"
      eyebrow="New"
      subline="Sub"
      [variant]="variant()"
      [primaryCta]="start"
      secondaryCta="Read the docs"
      [install]="install"
      meta="MIT"
      [media]="withMedia() ? media : undefined"
      aria-label="Welcome"
      class="own"
    ></section>
    <ng-template #start><button type="button">Start</button></ng-template>
    <ng-template #install><code>npm i &#64;pxlkit/ui-kit-angular</code></ng-template>
    <ng-template #media><img alt="Shot" /></ng-template>
  `,
})
class Host {
  readonly variant = signal<HeroVariant | undefined>(undefined);
  readonly withMedia = signal(true);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const section = fixture.nativeElement.querySelector('section') as HTMLElement;
  return { fixture, host: fixture.componentInstance, section };
}

describe('PixelHeroSection', () => {
  it('lays out the text, the calls to action in a cluster, the install and meta lines, and the media below', async () => {
    const { section } = await render();
    const text = section.querySelector('h1')!.parentElement!;
    expect(Array.from(text.children, (child) => child.tagName)).toEqual(['SPAN', 'H1', 'P', 'DIV', 'DIV', 'DIV']);
    const [ctas, install, meta] = Array.from(text.children).slice(3);
    expect(ctas!.querySelector('button')!.textContent).toBe('Start');
    expect(ctas!.textContent!.trim().endsWith('Read the docs')).toBe(true);
    expect(ctas!.className).toContain('justify-center');
    expect(install!.querySelector('code')!.textContent).toBe('npm i @pxlkit/ui-kit-angular');
    expect(meta!.textContent).toBe('MIT');
    expect(text.nextElementSibling!.querySelector('img')).not.toBeNull();
    expect(text.nextElementSibling!.className).toContain('mt-10');
  });

  it('puts the media in a column beside the text when split, and stacks without media', async () => {
    const { fixture, host, section } = await render();
    host.variant.set('split');
    await fixture.whenStable();
    const grid = section.querySelector('.grid')!;
    expect(Array.from(grid.classList)).toEqual(expect.arrayContaining(['md:grid-cols-[3fr_2fr]', 'gap-8', 'items-center']));
    expect(grid.children[0]!.querySelector('h1')).not.toBeNull();
    expect(grid.children[1]!.querySelector('.w-full > img')).not.toBeNull();
    expect(section.querySelector('h1 ~ div')!.className).toContain('justify-start');

    host.withMedia.set(false);
    await fixture.whenStable();
    expect(section.querySelector('.grid')).toBeNull();
    expect(section.querySelector('h1')!.parentElement!.className).toBe('flex flex-col');
  });

  it('lays the parallax media behind the text, hidden from assistive technology', async () => {
    const { fixture, host, section } = await render();
    host.variant.set('parallax');
    await fixture.whenStable();
    const layer = section.querySelector('[aria-hidden="true"]')!;
    expect(Array.from(layer.classList)).toEqual(expect.arrayContaining(['absolute', '-z-10', 'pointer-events-none']));
    expect(layer.querySelector('img')).not.toBeNull();
    expect(layer.nextElementSibling!.querySelector('h1')).not.toBeNull();
  });

  it('keeps the consumer attributes and classes on the section', async () => {
    const { section } = await render();
    expect(section.getAttribute('aria-label')).toBe('Welcome');
    expect(Array.from(section.classList)).toEqual(expect.arrayContaining(['own', 'min-h-[480px]']));
  });
});
