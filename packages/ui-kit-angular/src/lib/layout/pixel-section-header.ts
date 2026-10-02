import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import {
  sectionHeaderClasses,
  type SectionHeaderAlign,
  type SectionHeaderLevel,
  type SectionHeaderSize,
  type SectionHeaderSpacing,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Header above a section: an eyebrow, the heading, a description and
 * actions (text or an `<ng-template>`). The eyebrow is decorative
 * (`aria-hidden`) and repeated for screen readers inside the heading. The
 * host is the `<header>`.
 *
 * @example
 * <pxl-section-header eyebrow="Dashboard" title="Recent activity" [actions]="actions" />
 * <ng-template #actions><button pxlButton>Refresh</button></ng-template>
 */
@Component({
  selector: 'pxl-section-header',
  imports: [NgTemplateOutlet, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <header>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-section-header { display: block; } }',
  host: {
    '[class]': 'classes().header',
    // `title` is the heading; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    <div [class]="classes().stack">
      @if (eyebrow(); as eyebrow) {
        <span aria-hidden="true" [class]="classes().eyebrow">{{ eyebrow }}</span>
      }
      @switch (level()) {
        @case ('h1') {
          <h1 [class]="classes().title"><ng-container *ngTemplateOutlet="heading" /></h1>
        }
        @case ('h3') {
          <h3 [class]="classes().title"><ng-container *ngTemplateOutlet="heading" /></h3>
        }
        @case ('h4') {
          <h4 [class]="classes().title"><ng-container *ngTemplateOutlet="heading" /></h4>
        }
        @default {
          <h2 [class]="classes().title"><ng-container *ngTemplateOutlet="heading" /></h2>
        }
      }
      @if (description(); as description) {
        <p [class]="classes().description">{{ description }}</p>
      }
      @if (actions()) {
        <div [class]="classes().actions"><ng-container *pxlOutlet="actions(); let text">{{ text }}</ng-container></div>
      }
    </div>
    <ng-template #heading>
      @if (eyebrow(); as eyebrow) {
        <span class="sr-only">{{ eyebrow }}: </span>
      }
      {{ title() }}
    </ng-template>
  `,
})
export class PixelSectionHeader {
  /** The heading. */
  readonly title = input.required<string>();
  /** Small uppercase line above the title. */
  readonly eyebrow = input<string>();
  /** Tone of the title and eyebrow. */
  readonly titleTone = input<ToneKey>();
  /** Paragraph under the title. */
  readonly description = input<string>();
  /** Buttons or links under the description. */
  readonly actions = input<PxlContent>();
  /** Start-aligned, or centred with a capped width. */
  readonly align = input<SectionHeaderAlign, SectionHeaderAlign | undefined>('start', {
    transform: withDefault<SectionHeaderAlign>('start'),
  });
  /** Type scale. */
  readonly size = input<SectionHeaderSize, SectionHeaderSize | undefined>('md', {
    transform: withDefault<SectionHeaderSize>('md'),
  });
  /** Gaps between the blocks. */
  readonly spacing = input<SectionHeaderSpacing, SectionHeaderSpacing | undefined>('normal', {
    transform: withDefault<SectionHeaderSpacing>('normal'),
  });
  /** Heading level of the title. */
  readonly as = input<SectionHeaderLevel, SectionHeaderLevel | undefined>('h2', {
    transform: withDefault<SectionHeaderLevel>('h2'),
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal The heading level (`as` is a keyword in templates). */
  protected readonly level = computed(() => this.as());

  /** @internal */
  protected readonly classes = computed(() =>
    sectionHeaderClasses(this.effectiveSurface(), {
      titleTone: this.titleTone(),
      align: this.align(),
      size: this.size(),
      spacing: this.spacing(),
      eyebrow: Boolean(this.eyebrow()),
    }),
  );
}
