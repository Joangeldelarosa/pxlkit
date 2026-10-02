import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { glitchClasses, glitchStyles, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';

/**
 * Marks the content of a `<pxl-glitch>`, so the glitch can repeat it in its
 * two ghost layers — projected content renders only once.
 *
 * @example
 * <span *pxlGlitchContent class="text-2xl font-bold">SYSTEM ONLINE</span>
 */
@Directive({ selector: '[pxlGlitchContent]' })
export class PixelGlitchContent {
  /** @internal */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * CRT glitch in three layers: the content, sliced and shifted, under two
 * colour-split copies of it (hidden from assistive technology) that flash
 * on other slices. It plays as `trigger` says; when the user prefers
 * reduced motion only the content shows, still. Mark the content with
 * `*pxlGlitchContent`: the copies are made from it. Unmarked content is
 * projected into the content's layer only, and glitches without the
 * copies. The host is the wrapper.
 *
 * @example
 * <pxl-glitch [intensity]="8">
 *   <span *pxlGlitchContent class="text-2xl font-bold">CRITICAL ERROR</span>
 * </pxl-glitch>
 */
@Component({
  selector: 'pxl-glitch',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-glitch { display: block; } }',
  host: { '[class]': 'classes.root' },
  template: `
    @if (ghosts(); as ghosts) {
      <div aria-hidden="true" [class]="classes.ghost" [style]="styles().red">
        <ng-container [ngTemplateOutlet]="ghosts.template" />
      </div>
      <div aria-hidden="true" [class]="classes.ghost" [style]="styles().cyan">
        <ng-container [ngTemplateOutlet]="ghosts.template" />
      </div>
    }
    <div [style]="animation.active() ? styles().main : null" (animationend)="animation.ended($event)">
      @if (content(); as content) {
        <ng-container [ngTemplateOutlet]="content.template" />
      } @else {
        <ng-content />
      }
    </div>
  `,
})
export class PixelGlitch {
  /** Length of one full glitch loop in milliseconds. */
  readonly duration = input(3000, { transform: numberOr(3000) });
  /** Maximum horizontal displacement (pixels) of the layers. */
  readonly intensity = input(4, { transform: numberOr(4) });
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  readonly trigger = input<AnimationTrigger, AnimationTrigger | undefined>('mount', {
    transform: withDefault<AnimationTrigger>('mount'),
  });
  /** After the final iteration of the content's layer. */
  readonly complete = output<void>();

  /** @internal */
  protected readonly content = contentChild(PixelGlitchContent);
  /** @internal */
  protected readonly animation = injectAnimationTrigger(
    () => this.trigger(),
    () => this.complete.emit(),
  );
  /** @internal */
  protected readonly classes = glitchClasses;
  /** @internal */
  protected readonly styles = computed(() => glitchStyles({ duration: this.duration(), intensity: this.intensity() }));
  /** @internal The content the ghost layers repeat, while the glitch plays. */
  protected readonly ghosts = computed(() => (this.animation.active() ? this.content() : undefined));
}
