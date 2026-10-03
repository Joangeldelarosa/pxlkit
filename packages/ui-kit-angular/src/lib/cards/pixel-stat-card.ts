import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import {
  statCardClasses,
  type PixelStatCardIconPosition,
  type PixelStatCardSize,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Compact metric card: a label, the value, an optional trend line and an
 * icon (text or an `<ng-template>`) above, beside or in the bottom-left
 * corner, in three sizes. The host is the card.
 *
 * @example
 * <pxl-stat-card label="Revenue" value="$12,480" trend="+8.2% vs last week" tone="green" iconPosition="right" icon="$" />
 */
@Component({
  selector: 'pxl-stat-card',
  imports: [NgTemplateOutlet, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, as the top and
  // bottom-left layouts set no display. In the base layer, so the grid and
  // flex of the others still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-stat-card { display: block; } }',
  host: { '[class]': 'classes().root' },
  template: `
    @switch (iconPosition()) {
      @case ('right') {
        <div [class]="classes().content">
          <p [class]="classes().label">{{ label() }}</p>
          <div [class]="classes().valueRow"><p [class]="classes().value">{{ value() }}</p></div>
          <ng-container [ngTemplateOutlet]="trendLine" />
        </div>
        <ng-container [ngTemplateOutlet]="iconBox" [ngTemplateOutletContext]="{ $implicit: classes().icon }" />
      }
      @case ('left') {
        <ng-container [ngTemplateOutlet]="iconBox" [ngTemplateOutletContext]="{ $implicit: classes().icon }" />
        <div [class]="classes().content">
          <p [class]="classes().label">{{ label() }}</p>
          <div [class]="classes().valueRow"><p [class]="classes().value">{{ value() }}</p></div>
          <ng-container [ngTemplateOutlet]="trendLine" />
        </div>
      }
      @case ('bottom-left') {
        <div [class]="classes().header"><p [class]="classes().label">{{ label() }}</p></div>
        <p [class]="classes().value">{{ value() }}</p>
        <ng-container [ngTemplateOutlet]="trendLine" />
        <ng-container [ngTemplateOutlet]="iconBox" [ngTemplateOutletContext]="{ $implicit: classes().cornerIcon }" />
      }
      @default {
        <div [class]="classes().header">
          <p [class]="classes().label">{{ label() }}</p>
          <ng-container [ngTemplateOutlet]="iconBox" [ngTemplateOutletContext]="{ $implicit: classes().icon }" />
        </div>
        <p [class]="classes().value">{{ value() }}</p>
        <ng-container [ngTemplateOutlet]="trendLine" />
      }
    }
    <ng-template #trendLine>
      @if (trend(); as trend) {
        <p [class]="classes().trend">{{ trend }}</p>
      }
    </ng-template>
    <ng-template #iconBox let-boxClasses>
      @if (icon()) {
        <span [class]="boxClasses"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>
      }
    </ng-template>
  `,
})
export class PixelStatCard {
  /** Caption above the value. */
  readonly label = input.required<string>();
  /** The metric. */
  readonly value = input.required<string>();
  /** The icon, in the tone. */
  readonly icon = input<PxlContent>();
  /** Tone of the border, background and icon. */
  readonly tone = input<Tone, Tone | undefined>('gold', { transform: withDefault<Tone>('gold') });
  /** Trend or delta line under the value. */
  readonly trend = input<string>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Padding and type scale. */
  readonly size = input<PixelStatCardSize, PixelStatCardSize | undefined>('md', {
    transform: withDefault<PixelStatCardSize>('md'),
  });
  /** Where the icon sits: above, beside or in the bottom-left corner. */
  readonly iconPosition = input<PixelStatCardIconPosition, PixelStatCardIconPosition | undefined>('top', {
    transform: withDefault<PixelStatCardIconPosition>('top'),
  });
  /** Colours the value with the tone. */
  readonly valueTone = input(false, { transform: booleanOr(false) });
  /** Alignment of the label, value and trend. */
  readonly align = input<'start' | 'center', 'start' | 'center' | undefined>('start', {
    transform: withDefault<'start' | 'center'>('start'),
  });
  /** Surface border, radius and tone tint. */
  readonly bordered = input(true, { transform: booleanOr(true) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() =>
    statCardClasses(this.effectiveSurface(), {
      tone: this.tone(),
      size: this.size(),
      iconPosition: this.iconPosition(),
      valueTone: this.valueTone(),
      align: this.align(),
      bordered: this.bordered(),
    }),
  );
}
