import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { alertClasses, alertLive, type AlertLive, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Inline status banner with a label, a message, a tone and an optional icon
 * and action (text or an `<ng-template>`). It announces itself
 * (`role="alert"`): assertively for critical tones (red, gold) and politely
 * for the others, unless `live` says otherwise. The pixel surface adds a left
 * accent stripe. The host is the banner.
 *
 * @example
 * <pxl-alert tone="red" label="Connection lost" message="Check your network and retry." [action]="retry" />
 * <ng-template #retry><button pxlButton size="sm" tone="red" variant="outline">Retry</button></ng-template>
 */
@Component({
  selector: 'pxl-alert',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-alert { display: block; } }',
  host: {
    role: 'alert',
    '[attr.aria-live]': 'ariaLive()',
    '[class]': 'classes().root',
    // `title` is the deprecated label; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (effectiveSurface() === 'pixel') {
      <span aria-hidden="true" [class]="classes().stripe"></span>
    }
    <div [class]="classes().row">
      @if (icon()) {
        <span [class]="classes().icon"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>
      }
      <div [class]="classes().body">
        <p [class]="classes().label">{{ label() ?? title() ?? '' }}</p>
        <p [class]="classes().message">{{ message() }}</p>
        @if (action()) {
          <div [class]="classes().action"><ng-container *pxlOutlet="action(); let text">{{ text }}</ng-container></div>
        }
      </div>
    </div>
  `,
})
export class PixelAlert {
  /** Short label shown in the tone colour (canonical name for the title). */
  readonly label = input<string>();
  /** @deprecated Use `label` instead. Retained as alias for one minor. */
  readonly title = input<string>();
  /** Body message under the label. */
  readonly message = input.required<string>();
  /** Tone of the border, fill and texts. */
  readonly tone = input<Tone, Tone | undefined>('red', { transform: withDefault<Tone>('red') });
  /** Leading icon, in the tone colour. */
  readonly icon = input<PxlContent>();
  /** Action under the message (Retry, Dismiss, …). */
  readonly action = input<PxlContent>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** `aria-live` override. Status banners ("info") should usually use `"polite"`. */
  readonly live = input<AlertLive>();

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => alertClasses(this.effectiveSurface(), this.tone()));
  /** @internal */
  protected readonly ariaLive = computed(() => alertLive(this.tone(), this.live()));
}
