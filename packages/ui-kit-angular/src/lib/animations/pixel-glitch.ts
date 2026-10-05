import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { cn, glitchClasses, glitchCopiesStyle, glitchMainClasses, glitchStyles, type AnimationTrigger } from '@pxlkit/ui-kit-core';
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
 * copies. The host is the wrapper: `<pxl-glitch>` stands for a `<div>`;
 * `<span pxlGlitch>` puts the glitch inside phrasing content, such as a
 * heading, its layers spans too — wrap the heading around it, as the
 * layers repeat whatever they hold. Given a `label` instead, the glitch
 * holds that text once and the stylesheet draws its copies.
 *
 * @example
 * <pxl-glitch [intensity]="8">
 *   <span *pxlGlitchContent class="text-2xl font-bold">CRITICAL ERROR</span>
 * </pxl-glitch>
 * <h2><span pxlGlitch label="SIGNAL LOST"></span></h2>
 */
@Component({
  selector: 'pxl-glitch, span[pxlGlitch]',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, which transforms apply
  // to. In the base layer, so display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-glitch { display: block; } }',
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-text]': 'label() ?? null',
    '[style]': 'hostStyle()',
  },
  template: `
    <ng-template #projected><ng-content /></ng-template>
    <!-- The text once, in the content's layer; the stylesheet draws the copies from data-text while the glitch plays. -->
    @if (label() !== undefined) {
      @if (inline) {
        <span [class]="mainClasses" [style]="animation.active() ? styles().main : null" (animationend)="animation.ended($event)">{{ label() }}</span>
      } @else {
        <div [style]="animation.active() ? styles().main : null" (animationend)="animation.ended($event)">{{ label() }}</div>
      }
    } @else if (inline) {
      @if (ghosts(); as ghosts) {
        <span aria-hidden="true" [class]="classes.ghost" [style]="styles().red">
          <ng-container [ngTemplateOutlet]="ghosts.template" />
        </span>
        <span aria-hidden="true" [class]="classes.ghost" [style]="styles().cyan">
          <ng-container [ngTemplateOutlet]="ghosts.template" />
        </span>
      }
      <span [class]="mainClasses" [style]="animation.active() ? styles().main : null" (animationend)="animation.ended($event)">
        <ng-container [ngTemplateOutlet]="content()?.template ?? projected" />
      </span>
    } @else {
      @if (ghosts(); as ghosts) {
        <div aria-hidden="true" [class]="classes.ghost" [style]="styles().red">
          <ng-container [ngTemplateOutlet]="ghosts.template" />
        </div>
        <div aria-hidden="true" [class]="classes.ghost" [style]="styles().cyan">
          <ng-container [ngTemplateOutlet]="ghosts.template" />
        </div>
      }
      <div [style]="animation.active() ? styles().main : null" (animationend)="animation.ended($event)">
        <ng-container [ngTemplateOutlet]="content()?.template ?? projected" />
      </div>
    }
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
  /**
   * Text to glitch, in place of the content: it is in the document once —
   * the stylesheet draws its colour copies — so a heading's text reads once
   * to crawlers, copying and text extraction.
   */
  readonly label = input<string>();
  /** After the final iteration of the content's layer. */
  readonly complete = output<void>();

  /** @internal */
  protected readonly content = contentChild(PixelGlitchContent);
  /** @internal On a `<span>`, whose layers are spans too. */
  protected readonly inline = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase() === 'span';
  /** @internal */
  protected readonly mainClasses = glitchMainClasses(this.inline ? 'span' : 'div') ?? null;
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
  /** @internal The drawn copies of the text, while the glitch plays. */
  private readonly copies = computed(() => this.label() !== undefined && this.animation.active());
  /** @internal */
  protected readonly hostClasses = computed(() => cn(this.classes.root, this.copies() && this.classes.copies));
  /** @internal */
  protected readonly hostStyle = computed(() =>
    this.copies() ? glitchCopiesStyle({ duration: this.duration(), intensity: this.intensity() }) : null,
  );
}
