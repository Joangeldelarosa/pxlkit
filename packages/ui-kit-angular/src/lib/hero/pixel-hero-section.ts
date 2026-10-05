import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  heroAlign,
  heroContainerPadding,
  heroLayout,
  heroParallaxBodyClasses,
  heroParallaxMediaClasses,
  heroSectionClasses,
  heroSplitMediaClasses,
  type HeroDensity,
  type HeroHeadlineEffect,
  type HeroMinHeight,
  type HeroVariant,
  type SectionHeaderLevel,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlitch } from '../animations/pixel-glitch';
import { PixelTypewriter } from '../animations/pixel-typewriter';
import { PixelCluster } from '../layout/pixel-cluster';
import { PixelContainer } from '../layout/pixel-container';
import { PixelTwoColumn } from '../layout/pixel-two-column';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * The opening `<section>` of a page: an eyebrow, the headline (an `<h1>`
 * unless `as` says otherwise), a subline, a row of calls to action, an
 * install snippet and a meta line, with media in a column beside the text
 * (`split`), behind it as a decorative layer (`parallax`) or below it. The
 * calls to action, install, meta and media take text or an `<ng-template>`;
 * an `aria-label` on the section makes it a labelled landmark.
 *
 * @example
 * <section pxlHeroSection eyebrow="Introducing" headline="Pixel-perfect retro UI" variant="split" [primaryCta]="start" [media]="shot"></section>
 * <ng-template #start><button pxlButton>Get started</button></ng-template>
 * <ng-template #shot><img src="/shot.png" alt="" /></ng-template>
 */
@Component({
  selector: 'section[pxlHeroSection]',
  imports: [NgTemplateOutlet, PxlOutlet, PixelCluster, PixelContainer, PixelGlitch, PixelTwoColumn, PixelTypewriter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes().root' },
  template: `
    <div pxlContainer maxWidth="xl" [padding]="containerPadding()" [surface]="effectiveSurface()">
      @switch (layout()) {
        @case ('split') {
          <div
            pxlTwoColumn
            ratio="60/40"
            [gap]="8"
            stackBelow="md"
            align="center"
            [left]="column"
            [right]="mediaColumn"
            [surface]="effectiveSurface()"
          ></div>
        }
        @case ('parallax') {
          <div [class]="parallaxBodyClasses">
            @if (media()) {
              <div aria-hidden="true" [class]="parallaxMediaClasses">
                <ng-container *pxlOutlet="media(); let text">{{ text }}</ng-container>
              </div>
            }
            <ng-container [ngTemplateOutlet]="column" />
          </div>
        }
        @default {
          <ng-container [ngTemplateOutlet]="column" />
          @if (media()) {
            <div [class]="classes().media"><ng-container *pxlOutlet="media(); let text">{{ text }}</ng-container></div>
          }
        }
      }
    </div>
    <ng-template #column>
      <div [class]="classes().text">
        @if (eyebrow()) {
          <span [class]="classes().eyebrow">{{ eyebrow() }}</span>
        }
        @switch (level()) {
          @case ('h2') {
            <h2 [class]="classes().headline"><ng-container [ngTemplateOutlet]="headlineText" /></h2>
          }
          @case ('h3') {
            <h3 [class]="classes().headline"><ng-container [ngTemplateOutlet]="headlineText" /></h3>
          }
          @case ('h4') {
            <h4 [class]="classes().headline"><ng-container [ngTemplateOutlet]="headlineText" /></h4>
          }
          @case ('h5') {
            <h5 [class]="classes().headline"><ng-container [ngTemplateOutlet]="headlineText" /></h5>
          }
          @case ('h6') {
            <h6 [class]="classes().headline"><ng-container [ngTemplateOutlet]="headlineText" /></h6>
          }
          @default {
            <h1 [class]="classes().headline"><ng-container [ngTemplateOutlet]="headlineText" /></h1>
          }
        }
        @if (subline()) {
          <p [class]="classes().subline">{{ subline() }}</p>
        }
        @if (primaryCta() || secondaryCta()) {
          <div pxlCluster [gap]="3" align="center" [justify]="align()" [surface]="effectiveSurface()" [class]="classes().ctas">
            <ng-container *pxlOutlet="primaryCta(); let text">{{ text }}</ng-container>
            <ng-container *pxlOutlet="secondaryCta(); let text">{{ text }}</ng-container>
          </div>
        }
        @if (install()) {
          <div [class]="classes().install"><ng-container *pxlOutlet="install(); let text">{{ text }}</ng-container></div>
        }
        @if (meta()) {
          <div [class]="classes().meta"><ng-container *pxlOutlet="meta(); let text">{{ text }}</ng-container></div>
        }
      </div>
    </ng-template>
    <!-- One heading, its text once, whatever the effect: the glitch goes
         inside the heading, as a span, and its copies of the text are drawn
         by CSS. -->
    <ng-template #headlineText>
      @switch (headlineEffect()) {
        @case ('typewriter') {
          <pxl-typewriter [label]="headline()" tone="inherit" />
        }
        @case ('glitch') {
          <span pxlGlitch [label]="headline()"></span>
        }
        @default {
          <ng-container>{{ headline() }}</ng-container>
        }
      }
    </ng-template>
    <ng-template #mediaColumn>
      <div [class]="splitMediaClasses"><ng-container *pxlOutlet="media(); let text">{{ text }}</ng-container></div>
    </ng-template>
  `,
})
export class PixelHeroSection {
  /** The headline: the page's `<h1>`, unless `as` sets another level. */
  readonly headline = input.required<string>();
  /**
   * Element of the headline. A hero embedded under the page's own `<h1>`
   * (a demo, a template) takes a lower level.
   */
  readonly as = input<SectionHeaderLevel, SectionHeaderLevel | undefined>('h1', {
    transform: withDefault<SectionHeaderLevel>('h1'),
  });
  /** `centered` and `parallax` centre the text; `split` puts the `media` in a column beside it. */
  readonly variant = input<HeroVariant, HeroVariant | undefined>('centered', {
    transform: withDefault<HeroVariant>('centered'),
  });
  /** Small upper-cased line above the headline, in the tone. */
  readonly eyebrow = input<string>();
  /**
   * Animates the headline: `'typewriter'` types it out once — screen readers
   * get the whole headline from the start — and `'glitch'` plays the glitch
   * over it. Both hold still when the user prefers reduced motion.
   */
  readonly headlineEffect = input<HeroHeadlineEffect, HeroHeadlineEffect | undefined>('none', {
    transform: withDefault<HeroHeadlineEffect>('none'),
  });
  /** Paragraph under the headline. */
  readonly subline = input<string>();
  /** First call to action. */
  readonly primaryCta = input<PxlContent>();
  /** Second call to action, after the first. */
  readonly secondaryCta = input<PxlContent>();
  /** Install snippet under the calls to action. */
  readonly install = input<PxlContent>();
  /** Meta line at the end of the text. */
  readonly meta = input<PxlContent>();
  /** Media, placed by the `variant`. */
  readonly media = input<PxlContent>();
  /** Tone of the eyebrow. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Type sizes and vertical rhythm. */
  readonly density = input<HeroDensity, HeroDensity | undefined>('comfortable', {
    transform: withDefault<HeroDensity>('comfortable'),
  });
  /** Minimum height of the section. */
  readonly minHeight = input<HeroMinHeight, HeroMinHeight | undefined>('md', {
    transform: withDefault<HeroMinHeight>('md'),
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal The headline's level (`as` is a keyword in templates). */
  protected readonly level = computed(() => this.as());
  /** @internal */
  protected readonly align = computed(() => heroAlign(this.variant()));
  /** @internal */
  protected readonly layout = computed(() => heroLayout(this.variant(), !!this.media()));
  /** @internal */
  protected readonly containerPadding = computed(() => heroContainerPadding(this.density()));
  /** @internal */
  protected readonly classes = computed(() =>
    heroSectionClasses(this.effectiveSurface(), {
      tone: this.tone(),
      density: this.density(),
      minHeight: this.minHeight(),
      align: this.align(),
      hasEyebrow: !!this.eyebrow(),
    }),
  );
  /** @internal */
  protected readonly splitMediaClasses = heroSplitMediaClasses;
  /** @internal */
  protected readonly parallaxBodyClasses = heroParallaxBodyClasses;
  /** @internal */
  protected readonly parallaxMediaClasses = heroParallaxMediaClasses;
}
