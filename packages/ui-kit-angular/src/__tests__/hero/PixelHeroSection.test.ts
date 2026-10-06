/**
 * PixelHeroSection: text and template content in each layout, the parallax
 * media hidden from assistive technology, a split hero without media, the
 * headline effects, and attributes of the consumer's on the section.
 */
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelHeroSection, type HeroHeadlineEffect, type HeroVariant, type SectionHeaderLevel } from '../../public-api';

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

  describe('headlineEffect', () => {
    @Component({
      imports: [PixelHeroSection],
      template: `<section pxlHeroSection [headline]="headline" [headlineEffect]="effect()"></section>`,
    })
    class EffectHost {
      headline = 'Loading';
      readonly effect = signal<HeroHeadlineEffect>('none');
    }

    async function renderEffect(effect: HeroHeadlineEffect, headline = 'Loading') {
      const fixture = TestBed.createComponent(EffectHost);
      fixture.componentInstance.headline = headline;
      fixture.componentInstance.effect.set(effect);
      await settle(fixture);
      return { fixture, section: fixture.nativeElement.querySelector('section') as HTMLElement };
    }

    async function settle(fixture: ComponentFixture<unknown>) {
      await fixture.whenStable();
      await new Promise((done) => setTimeout(done, 0));
      await fixture.whenStable();
    }

    afterEach(() => {
      vi.useRealTimers();
    });

    it('types the headline out, which screen readers get whole from the start', async () => {
      // The typing's intervals are fake; timeouts stay real for the zoneless scheduler.
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      const { fixture, section } = await renderEffect('typewriter');
      const heading = section.querySelector('h1')!;
      expect(heading.querySelector('.sr-only')!.textContent).toBe('Loading');
      const typed = () => heading.querySelector('[aria-hidden="true"]')!.textContent;
      // Nothing typed yet: the caret alone.
      expect(typed()).toBe('▌');
      vi.advanceTimersByTime(60 * 3);
      await settle(fixture);
      expect(typed()).toBe('Loa▌');
      vi.advanceTimersByTime(60 * 10);
      await settle(fixture);
      expect(typed()).toBe('Loading');
      // The headline keeps its own font and colour.
      expect(heading.querySelector('pxl-typewriter')!.className).not.toMatch(/font-mono|text-retro-green/);
      expect(section.querySelectorAll('h1')).toHaveLength(1);
    });

    // Regression: the glitch wrapped the heading and repeated it in its two
    // colour layers, so the page had three <h1>; inside the heading, the
    // layers still put its text in the document three times.
    it('glitches the headline inside its one heading, its text once, the copies drawn by CSS', async () => {
      const { section } = await renderEffect('glitch', 'Signal lost');
      expect(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1);
      const heading = section.querySelector('h1')!;
      expect(heading.textContent).toBe('Signal lost');
      expect(heading.querySelectorAll('[aria-hidden]')).toHaveLength(0);
      const glitch = heading.querySelector('span')!;
      expect(glitch.dataset['text']).toBe('Signal lost');
      expect(glitch.classList.contains('pxl-glitch-copies')).toBe(true);
    });

    it('renders the plain headline by default', async () => {
      const { section } = await renderEffect('none', 'Plain');
      const heading = section.querySelector('h1')!;
      expect(heading.children).toHaveLength(0);
      expect(heading.textContent).toBe('Plain');
    });
  });

  it('sets the headline at the level `as` gives, in the same type, with any effect', async () => {
    @Component({
      imports: [PixelHeroSection],
      template: `
        <section pxlHeroSection headline="Default"></section>
        <section pxlHeroSection as="h2" headline="Plain"></section>
        <section pxlHeroSection as="h3" headline="Typed" headlineEffect="typewriter"></section>
        <section pxlHeroSection [as]="level()" headline="Glitched" headlineEffect="glitch"></section>
      `,
    })
    class LevelHost {
      readonly level = signal<SectionHeaderLevel | undefined>('h6');
    }
    const fixture = TestBed.createComponent(LevelHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const levels = () => Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'), (heading) => heading.tagName);
    expect(levels()).toEqual(['H1', 'H2', 'H3', 'H6']);
    expect(root.querySelector('h2')!.className).toBe(root.querySelector('h1')!.className);
    expect(root.querySelector('h6')!.textContent).toContain('Glitched');
    fixture.componentInstance.level.set(undefined);
    await fixture.whenStable();
    expect(levels()).toEqual(['H1', 'H2', 'H3', 'H1']);
  });
});

