/**
 * PixelHeroMedia: the caption and its extra classes, the frame, the anchor,
 * defaults for unset inputs, and attributes and styles of the consumer's on
 * the figure.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelHeroMedia, type HeroMediaRatio } from '../../public-api';

describe('PixelHeroMedia', () => {
  it('holds its content in the figure at the ratio, with a caption once given one', async () => {
    @Component({
      imports: [PixelHeroMedia],
      template: `
        <figure pxlHeroMedia [ratio]="ratio()" [caption]="caption()" captionClass="italic">
          <img alt="Shot" />
        </figure>
      `,
    })
    class Host {
      readonly ratio = signal<HeroMediaRatio | undefined>(undefined);
      readonly caption = signal<string | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const figure = fixture.nativeElement.querySelector('figure') as HTMLElement;
    expect(figure.style.aspectRatio).toBe('16 / 10');
    expect(figure.querySelector(':scope > div > img')).not.toBeNull();
    expect(figure.querySelector('figcaption')).toBeNull();
    fixture.componentInstance.ratio.set('1/1');
    fixture.componentInstance.caption.set('Hero shot');
    await fixture.whenStable();
    expect(figure.style.aspectRatio).toBe('1 / 1');
    const caption = figure.querySelector('figcaption')!;
    expect(caption.textContent).toBe('Hero shot');
    expect(Array.from(caption.classList)).toEqual(expect.arrayContaining(['mt-3', 'font-mono', 'italic']));
  });

  it('frames the figure in the tone and anchors it at the end of its row', async () => {
    @Component({
      imports: [PixelHeroMedia],
      template: '<figure pxlHeroMedia framed tone="gold" anchor="baseline-headline"></figure>',
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const figure = fixture.nativeElement.querySelector('figure') as HTMLElement;
    expect(Array.from(figure.classList)).toEqual(expect.arrayContaining(['border-2', 'border-retro-gold/30', 'self-end']));
    expect(figure.classList).not.toContain('self-center');
  });

  it('keeps the consumer attributes, classes and styles; an aspect-ratio binding wins over the ratio', async () => {
    @Component({
      imports: [PixelHeroMedia],
      template: `<figure pxlHeroMedia id="media" class="own" style="color: red" [style.aspect-ratio]="'2 / 1'"></figure>`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const figure = fixture.nativeElement.querySelector('figure') as HTMLElement;
    expect(figure.id).toBe('media');
    expect(Array.from(figure.classList)).toEqual(expect.arrayContaining(['own', 'relative']));
    expect(figure.style.aspectRatio).toBe('2 / 1');
    expect(figure.style.color).toBe('red');
  });
});
