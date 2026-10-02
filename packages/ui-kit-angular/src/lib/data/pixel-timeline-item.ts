import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  timelineAsciiConnector,
  timelineItemClasses,
  timelineItemState,
  type PixelTimelineLineVariant,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectTimelineContext } from './timeline-context';

/**
 * One entry of an `ol[pxlTimeline]`, on an `<li>`: its bullet, the rail down
 * to the next entry, the label and time, and the description. The
 * description is an input rather than projected content: its wrapper only
 * renders with one, and projected content cannot be seen before rendering.
 *
 * @example
 * <li pxlTimelineItem label="Packed" time="11:20" description="At the warehouse."></li>
 */
@Component({
  selector: 'li[pxlTimelineItem]',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-pxl-state]': 'state()',
    '[attr.aria-current]': 'state() === "active" ? "step" : null',
    '[class]': 'classes().root',
    // `title` is the deprecated alias of the label; on the <li> it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (!last()) {
      <span data-pxl-connector="true" aria-hidden="true" [class]="classes().connector"></span>
    }
    <span data-pxl-bullet="true" aria-hidden="true" [class]="classes().bullet">
      <ng-container *pxlOutlet="bullet(); let text">{{ text }}</ng-container>
    </span>
    @if (ascii(); as ascii) {
      <span aria-hidden="true" class="sr-only" data-pxl-ascii="true">{{ ascii }}</span>
    }
    <div [class]="classes().body">
      <div [class]="classes().heading">
        <span [class]="classes().label">{{ label() ?? title() ?? '' }}</span>
        @if (time()) {
          <span [class]="classes().time">{{ time() }}</span>
        }
      </div>
      @if (description()) {
        <div [class]="classes().description">
          <ng-container *pxlOutlet="description(); let text">{{ text }}</ng-container>
        </div>
      }
    </div>
  `,
})
export class PixelTimelineItem {
  /** Entry label. */
  readonly label = input<string>();
  /** @deprecated Use `label`. */
  readonly title = input<string>();
  /** Time or date beside the label. */
  readonly time = input<string>();
  /** Line style of the rail down to the next entry. */
  readonly lineVariant = input<PixelTimelineLineVariant, PixelTimelineLineVariant | undefined>('solid', {
    transform: withDefault<PixelTimelineLineVariant>('solid'),
  });
  /** Content of the bullet. */
  readonly bullet = input<PxlContent>();
  /** Description below the label. */
  readonly description = input<PxlContent>();

  private readonly context = injectTimelineContext();
  private readonly index = computed(() => this.context.entries().indexOf(this));
  /** @internal The last entry has no rail below it. */
  protected readonly last = computed(() => this.index() === this.context.entries().length - 1);
  /** @internal */
  protected readonly state = computed(() => timelineItemState(this.index(), this.context.active()));
  /** @internal */
  protected readonly ascii = computed(() => timelineAsciiConnector(this.context.surface()));
  /** @internal */
  protected readonly classes = computed(() =>
    timelineItemClasses(this.context.surface(), {
      state: this.state(),
      align: this.context.align(),
      bulletSize: this.context.bulletSize(),
      lineVariant: this.lineVariant(),
    }),
  );
}
