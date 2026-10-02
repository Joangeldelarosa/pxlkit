import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  sectionClasses,
  type ContainerWidth,
  type PageGutter,
  type SectionRhythmKey,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectPxlKitLocale } from '../overlay-foundation/pxl-kit-locale-provider';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelCenter } from './pixel-center';

/**
 * Page section with an optional uppercase title row and subtitle; its
 * content sits in a centred column (`pxlCenter`) or across the full width.
 * The host is the `<section>`.
 *
 * @example
 * <pxl-section title="Overview" subtitle="Key metrics for this period.">…</pxl-section>
 * <pxl-section [container]="false" horizontalGutter="md">…</pxl-section>
 */
@Component({
  selector: 'pxl-section',
  imports: [NgTemplateOutlet, PixelCenter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes().section',
    // `title` heads the section; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (container(); as container) {
      <div pxlCenter [maxWidth]="container" [gutter]="horizontalGutter()" [surface]="effectiveSurface()">
        <ng-container *ngTemplateOutlet="content" />
      </div>
    } @else {
      <ng-container *ngTemplateOutlet="content" />
    }
    <ng-template #content>
      @if (title(); as title) {
        <div class="mb-4">
          <h3 [class]="classes().title">{{ locale().upper(title) }}</h3>
          @if (subtitle(); as subtitle) {
            <p [class]="classes().subtitle">{{ subtitle }}</p>
          }
        </div>
      }
      <ng-content />
    </ng-template>
  `,
})
export class PixelSection {
  /** Heading row at the top of the section, upper-cased for the locale. */
  readonly title = input<string>();
  /** Line under the title. */
  readonly subtitle = input<string>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Width of the centred column (`containerWidth`), or `false` for the full width. */
  readonly container = input<ContainerWidth | false, ContainerWidth | false | undefined>('5xl', {
    transform: withDefault<ContainerWidth | false>('5xl'),
  });
  /** Vertical padding (`sectionRhythm`). */
  readonly verticalPadding = input<SectionRhythmKey, SectionRhythmKey | undefined>('xl', {
    transform: withDefault<SectionRhythmKey>('xl'),
  });
  /** Horizontal padding (`pageGutter`) of the column, or of the section without one. */
  readonly horizontalGutter = input<PageGutter, PageGutter | undefined>('lg', {
    transform: withDefault<PageGutter>('lg'),
  });
  /** Surface border, radius and card tint. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly locale = injectPxlKitLocale();

  /** @internal */
  protected readonly classes = computed(() =>
    sectionClasses(this.effectiveSurface(), {
      bordered: this.bordered(),
      verticalPadding: this.verticalPadding(),
      container: this.container(),
      horizontalGutter: this.horizontalGutter(),
    }),
  );
}
