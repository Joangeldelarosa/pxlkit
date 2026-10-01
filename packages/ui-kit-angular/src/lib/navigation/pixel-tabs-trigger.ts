import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
} from '@angular/core';
import { cn, focusRing, surfaceClasses } from '@pxlkit/ui-kit-core';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectTabsContext } from './tabs-context';

/** One tab (`role="tab"`) of a compositional `<pxl-tabs>`, on a `<button>`. */
@Component({
  selector: 'button[pxlTabsTrigger]',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    role: 'tab',
    '[attr.id]': 'context.baseId + "-tab-" + value()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-controls]': 'context.baseId + "-panel-" + value()',
    '[attr.tabindex]': 'selected() ? 0 : -1',
    '[attr.data-state]': 'selected() ? "active" : "inactive"',
    // `value` names the tab; as a native button attribute it would submit.
    '[attr.value]': 'null',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
    '(focus)': 'onFocus()',
    '(click)': 'context.select(value())',
  },
  template: `<ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container><ng-content />`,
})
export class PixelTabsTrigger {
  /** Id of the tab — matches a `<pxl-tabs-panel>` value. */
  readonly value = input.required<string>();
  /** Leading icon. */
  readonly icon = input<PxlContent>();

  /** @internal */
  protected readonly context = injectTabsContext('PixelTabsTrigger');
  /** @internal */
  protected readonly selected = computed(() => this.context.active() === this.value());

  /** @internal */
  protected readonly classes = computed(() => {
    const surface = this.context.surface();
    const s = surfaceClasses(surface);
    const vertical = this.context.orientation() === 'vertical';
    const radius =
      surface === 'pixel' ? (vertical ? 'rounded-l-[3px]' : 'rounded-t-[3px]') : vertical ? 'rounded-l-md' : 'rounded-t-md';
    return cn(
      'flex items-center gap-1.5 px-3 py-2 text-xs outline-none transition-colors',
      vertical ? '-mr-px' : '-mb-px',
      s.font,
      radius,
      s.border,
      vertical ? 'border-r-0' : 'border-b-0',
      focusRing,
      this.selected()
        ? 'border-retro-border/40 bg-retro-bg text-retro-green'
        : 'border-transparent text-retro-muted hover:text-retro-text',
    );
  });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // Registered once rendered in the browser, like the React trigger's ref.
    afterNextRender(() => this.context.registerTrigger(this.value(), element));
    inject(DestroyRef).onDestroy(() => this.context.unregisterTrigger(this.value()));
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    const vertical = this.context.orientation() === 'vertical';
    switch (event.key) {
      case vertical ? 'ArrowDown' : 'ArrowRight':
        event.preventDefault();
        this.context.focusByOffset(this.value(), 1);
        break;
      case vertical ? 'ArrowUp' : 'ArrowLeft':
        event.preventDefault();
        this.context.focusByOffset(this.value(), -1);
        break;
      case 'Home':
        event.preventDefault();
        this.context.focusEdge('first');
        break;
      case 'End':
        event.preventDefault();
        this.context.focusEdge('last');
        break;
      case 'Enter':
      case ' ':
        if (this.context.activationMode() === 'manual') {
          event.preventDefault();
          this.context.select(this.value());
        }
        break;
    }
  }

  /** @internal */
  protected onFocus(): void {
    if (this.context.activationMode() === 'automatic') this.context.select(this.value());
  }
}
