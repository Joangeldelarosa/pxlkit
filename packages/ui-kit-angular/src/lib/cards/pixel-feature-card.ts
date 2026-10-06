import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  Renderer2,
  ViewEncapsulation,
  computed,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import {
  featureCardClasses,
  isCardActivationKey,
  type CardBadge,
  type FeatureCardDescriptionLines,
  type FeatureCardIconSize,
  type FeatureCardOrientation,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { numericOption } from './_internal/numeric';

/**
 * Feature highlight card: a badge row, a toned icon frame, a title clamped to
 * two lines, a clamped description and a footer (text or an
 * `<ng-template>`), stacked or with the icon beside the text; projected
 * content follows them. The badge row keeps its height without a badge and
 * the clamps reserve their lines, so cards in a grid line up.
 * `<pxl-feature-card>` is an article; on an `<a>` (`a[pxlFeatureCard]`, with
 * its `href`) the whole card is a link — keep buttons and links out of it —
 * and `interactive` makes any other card a button in the tab order
 * (`role="button"`), which Enter and Space click: put it on a `<div>`
 * (`div[pxlFeatureCard]`), the element the React and Vue kits render. A
 * `(keydown)` listener of the card that calls `preventDefault()` keeps Enter
 * or Space from clicking it.
 *
 * @example
 * <pxl-feature-card title="Realtime sync" description="Push every keystroke to peers." tone="cyan" [icon]="sync" />
 * <a pxlFeatureCard title="Read the docs" href="/docs"></a>
 * <div pxlFeatureCard title="Try it" interactive (click)="start()"></div>
 */
@Component({
  selector: 'pxl-feature-card, a[pxlFeatureCard], div[pxlFeatureCard]',
  imports: [NgTemplateOutlet, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <article>: a block box. In the base layer, so
  // the flex column or grid of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-feature-card { display: block; } }',
  host: {
    '[class]': 'classes().root',
    '[attr.role]': 'role()',
    '[attr.tabindex]': 'tabindex()',
    // `title` heads the card; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    <div data-pxl-badge-slot="true" [class]="classes().badgeRow">
      @if (badge(); as badge) {
        <span [class]="classes().badge">{{ badge.label }}</span>
      }
    </div>
    @if (icon()) {
      <div data-pxl-icon-frame="true" [class]="classes().icon">
        <ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container>
      </div>
    }
    @if (orientation() === 'horizontal') {
      <div [class]="classes().column">
        <ng-container [ngTemplateOutlet]="text" />
        <ng-container [ngTemplateOutlet]="end" />
      </div>
    } @else {
      <ng-container [ngTemplateOutlet]="text" />
      <div [class]="classes().spacer"></div>
      <ng-container [ngTemplateOutlet]="end" />
    }
    <ng-content />
    <ng-template #text>
      <h3 [class]="classes().title">{{ title() }}</h3>
      @if (description() ?? desc(); as description) {
        <p [class]="classes().description">{{ description }}</p>
      }
    </ng-template>
    <ng-template #end>
      @if (footer()) {
        <div [class]="classes().footer"><ng-container *pxlOutlet="footer(); let text">{{ text }}</ng-container></div>
      }
    </ng-template>
  `,
})
export class PixelFeatureCard implements OnInit {
  /** The heading, clamped to two lines. */
  readonly title = input.required<string>();
  /** Muted paragraph under the title. */
  readonly description = input<string>();
  /** Lines the description is clamped to; 3 when unset. */
  readonly descriptionLines = input<
    FeatureCardDescriptionLines | undefined,
    FeatureCardDescriptionLines | `${FeatureCardDescriptionLines}` | undefined
  >(undefined, { transform: numericOption });
  /** @deprecated Use `description`. */
  readonly desc = input<string>();
  /** @deprecated Use `descriptionLines`. */
  readonly descLines = input<
    FeatureCardDescriptionLines | undefined,
    FeatureCardDescriptionLines | `${FeatureCardDescriptionLines}` | undefined
  >(undefined, { transform: numericOption });
  /** Icon in the toned frame. */
  readonly icon = input<PxlContent>();
  /** Width of the icon frame, in px. */
  readonly iconSize = input<FeatureCardIconSize, FeatureCardIconSize | `${FeatureCardIconSize}` | undefined>(56, {
    transform: (value) => numericOption(value) ?? 56,
  });
  /** Badge above the icon: its label and tone (cyan by default). */
  readonly badge = input<CardBadge>();
  /** Footer under the description. */
  readonly footer = input<PxlContent>();
  /** Tone of the icon frame. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Hover lift and focus ring; a card that is not a link becomes a button. */
  readonly interactive = input(false, { transform: booleanOr(false) });
  /** Icon above the text, or beside it. */
  readonly orientation = input<FeatureCardOrientation, FeatureCardOrientation | undefined>('vertical', {
    transform: withDefault<FeatureCardOrientation>('vertical'),
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border, radius and background. */
  readonly bordered = input(true, { transform: booleanOr(true) });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly link = this.element.tagName.toLowerCase() === 'a';
  private readonly ownRole = inject(new HostAttributeToken('role'), { optional: true });
  private readonly ownTabindex = inject(new HostAttributeToken('tabindex'), { optional: true });
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly button = computed(() => this.interactive() && !this.link);

  /** @internal An own `role` wins. */
  protected readonly role = computed(() => this.ownRole ?? (this.link ? null : this.button() ? 'button' : 'article'));
  /** @internal An own `tabindex` wins. */
  protected readonly tabindex = computed(() => this.ownTabindex ?? (this.button() ? '0' : null));
  /** @internal */
  protected readonly classes = computed(() =>
    featureCardClasses(this.effectiveSurface(), {
      tone: this.tone(),
      orientation: this.orientation(),
      bordered: this.bordered(),
      interactive: this.interactive() || this.link,
      iconSize: this.iconSize(),
      badge: this.badge(),
      descriptionLines: this.descriptionLines() ?? this.descLines(),
    }),
  );

  ngOnInit(): void {
    // Listening from ngOnInit registers this listener after the element's own
    // (keydown) bindings, so they run first and can keep the card from clicking.
    const unlisten = this.renderer.listen(this.element, 'keydown', (event: KeyboardEvent) => {
      if (event.defaultPrevented || !this.button() || !isCardActivationKey(event.key)) return;
      event.preventDefault();
      this.element.click();
    });
    this.destroyRef.onDestroy(unlisten);
  }
}
