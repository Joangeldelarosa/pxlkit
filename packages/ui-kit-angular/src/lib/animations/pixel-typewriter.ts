import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TYPEWRITER_CARET, typeText, typewriterClasses, type AnimationTrigger, type TypewriterTone } from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { injectAnimationTrigger } from './_internal/animation-trigger';

/**
 * Types a text out one character at a time, with a blinking caret while it
 * writes. Assistive technology reads the whole text from the first render
 * (a visually hidden copy); the typing itself is hidden from it. When the
 * user prefers reduced motion the text shows at once. The host is the
 * wrapping text.
 *
 * @example
 * <pxl-typewriter label="Types when scrolled into view." trigger="inView" tone="purple" (complete)="next()" />
 */
@Component({
  selector: 'pxl-typewriter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes().root' },
  template: `
    <span class="sr-only">{{ fullText() }}</span>
    <span aria-hidden="true">{{ typed() }}@if (typing()) {<span [class]="classes().caret">{{ caret }}</span>}</span>
  `,
})
export class PixelTypewriter {
  /** Label (text) to type out. Canonical input. */
  readonly label = input<string>();
  /** @deprecated Use `label` instead. Retained as alias for one minor. */
  readonly text = input<string>();
  /** Milliseconds between each character. */
  readonly speed = input(60, { transform: numberOr(60) });
  /** Delay before typing starts, in milliseconds. */
  readonly delay = input(0, { transform: numberOr(0) });
  /** Show a blinking caret while writing. */
  readonly cursor = input(true, { transform: booleanOr(true) });
  /**
   * Tone token applied to the text color, in monospace; `'inherit'` keeps the
   * font and colour of the text around it.
   */
  readonly tone = input<TypewriterTone, TypewriterTone | undefined>('green', {
    transform: withDefault<TypewriterTone>('green'),
  });
  /**
   * When the typing plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  readonly trigger = input<AnimationTrigger, AnimationTrigger | undefined>('mount', {
    transform: withDefault<AnimationTrigger>('mount'),
  });
  /** Once the full string is rendered (at once under reduced motion, then only once). */
  readonly complete = output<void>();

  /** @internal */
  protected readonly animation = injectAnimationTrigger(
    () => this.trigger(),
    () => this.complete.emit(),
  );
  /** @internal */
  protected readonly fullText = computed(() => this.label() ?? this.text() ?? '');
  /** @internal */
  protected readonly classes = computed(() => typewriterClasses(this.tone()));
  /** @internal */
  protected readonly caret = TYPEWRITER_CARET;
  /** @internal */
  protected readonly typed = signal('');
  /** @internal */
  protected readonly done = signal(false);
  /** @internal The caret shows while the text is being typed. */
  protected readonly typing = computed(() => this.cursor() && !this.done() && this.animation.active());

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    // The typing runs outside the zone, so a zone.js application stays
    // stable meanwhile; the end of the run is handled inside it.
    const zone = inject(NgZone);
    let completedStill = false;
    // Starts over whenever the text, its pace or the trigger changes.
    effect((onCleanup) => {
      const text = this.fullText();
      const speed = this.speed();
      const delay = this.delay();
      this.trigger();
      if (this.animation.reducedMotion()) {
        // Reduced motion shows the whole text at once: the full string is
        // there, so (complete) fires — once.
        this.typed.set(text);
        this.done.set(true);
        if (!completedStill) {
          completedStill = true;
          untracked(() => this.animation.end());
        }
        return;
      }
      this.typed.set('');
      this.done.set(false);
      if (!this.animation.active()) return;
      const stop = zone.runOutsideAngular(() =>
        typeText(
          text,
          { speed, delay },
          (next) => this.typed.set(next),
          () =>
            zone.run(() => {
              this.done.set(true);
              this.animation.end();
            }),
        ),
      );
      onCleanup(stop);
    });
  }
}
