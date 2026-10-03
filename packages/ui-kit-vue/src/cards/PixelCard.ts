import { defineComponent, h, mergeProps, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import {
  cardClasses,
  isCardActivationKey,
  type CardBadge,
  type CardDescriptionLines,
  type CardPadding,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { slotNodes } from '../_internal/Slot.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelCardHeader from './PixelCardHeader.vue';
import PixelRibbon from './PixelRibbon.vue';

const cardProps = {
  /** Heading of the title header; leave it out for a plain container. */
  title: { type: String, default: undefined },
  /** Muted paragraph under the title. */
  description: { type: String, default: undefined },
  /** Clamps the description to 2, 3 or 4 lines, keeping their height. */
  descriptionLines: { type: Number as PropType<CardDescriptionLines>, default: undefined },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
  /** Tone tint of the border and background. */
  tone: { type: String as PropType<ToneKey>, default: undefined },
  /**
   * Hover lift and focus ring. Without an `href` the card is a button in the
   * tab order, which Enter and Space activate: give it a `click` listener.
   */
  interactive: { type: Boolean, default: false },
  /** Corner ribbon (`PixelRibbon`): its label and tone. */
  badge: { type: Object as PropType<CardBadge>, default: undefined },
  /** Makes the card a link. A link cannot hold buttons or links: keep them out of the card. */
  href: { type: String, default: undefined },
  /** Link target, with `href`. */
  target: { type: String, default: undefined },
  /** Link relationship, with `href`. */
  rel: { type: String, default: undefined },
  /** Padding scale; `p-4` when unset. */
  padding: { type: String as PropType<CardPadding>, default: undefined },
  /** Surface border, radius and background. */
  bordered: { type: Boolean, default: true },
  /**
   * Click handler (`@click`). Declared as a prop because an interactive card
   * calls it on Enter and Space too, with the keyboard event.
   */
  onClick: { type: Function as PropType<(event: MouseEvent | KeyboardEvent) => void>, default: undefined },
} as const;

export type PixelCardProps = ExtractPublicPropTypes<typeof cardProps>;

/**
 * Container card: a title header with an optional icon, a description, a
 * media strip, a corner ribbon, the body and a footer. It is an `<article>`;
 * with an `href` an `<a>`, and `interactive` without one a
 * `<div role="button">` (an article cannot be a button) in the tab order,
 * which Enter and Space activate. Compose a card of your own with
 * `PixelCardHeader`, `PixelCardBody` and `PixelCardFooter`: a
 * `PixelCardHeader` among the card's direct children replaces the title
 * header. Attributes and listeners go to the card, and a `keydown` listener
 * that calls `preventDefault()` keeps Enter or Space from activating it.
 *
 * @example
 * <PixelCard title="Invoice #1042" tone="cyan" :badge="{ label: 'NEW' }">
 *   <p>Total: $1,250.00</p>
 *   <template #footer><span>Due in 7 days</span></template>
 * </PixelCard>
 * <PixelCard title="Open" interactive @click="open">…</PixelCard>
 */
export default defineComponent({
  name: 'PixelCard',
  inheritAttrs: false,
  props: cardProps,
  slots: Object as SlotsType<{
    /** The body; a `PixelCardHeader` among its direct children replaces the title header. */
    default?: () => VNode[];
    /** Leading icon of the title header. */
    icon?: () => VNode[];
    /** Media strip above the header, clipped and outside the padding. */
    media?: () => VNode[];
    /** Footer under a divider. */
    footer?: () => VNode[];
  }>,
  setup(props, { attrs, slots }) {
    const surface = useEffectiveSurface(() => props.surface);

    function activate(event: KeyboardEvent) {
      if (event.defaultPrevented || !props.interactive || props.href || !isCardActivationKey(event.key)) return;
      event.preventDefault();
      props.onClick?.(event);
    }

    return () => {
      const body = slots.default?.();
      const classes = cardClasses(surface.value, {
        tone: props.tone,
        padding: props.padding,
        bordered: props.bordered,
        interactive: props.interactive,
        link: !!props.href,
        media: !!slots.media,
        badge: !!props.badge,
        description: !!props.description,
        descriptionLines: props.descriptionLines,
      });
      const [tag, own] = props.href
        ? ['a', { href: props.href, target: props.target, rel: props.rel }]
        : props.interactive
          ? ['div', { role: 'button', tabindex: 0 }]
          : ['article', {}];
      // Like React's look at its direct children.
      const ownHeader = slotNodes(body).some((node) => node.type === PixelCardHeader);
      return h(
        tag,
        // The consumer's attributes win over the card's own, and its keydown
        // listener runs first, so it can keep the card from activating.
        mergeProps({ ...own, class: classes.root }, attrs, { onClick: props.onClick, onKeydown: activate }),
        [
          slots.media && h('div', { class: classes.media }, slots.media()),
          props.badge &&
            h(PixelRibbon, { position: 'top-right', tone: props.badge.tone ?? 'gold', surface: surface.value }, () =>
              props.badge?.label,
            ),
          h('div', { class: classes.content }, [
            props.title !== undefined &&
              !ownHeader &&
              h('header', { class: classes.header }, [
                slots.icon && h('span', { class: classes.icon }, slots.icon()),
                h('h4', { class: classes.title }, props.title),
              ]),
            props.description && h('p', { class: classes.description }, props.description),
            body && h('div', { class: classes.body }, body),
            slots.footer && h('footer', { class: classes.footer }, slots.footer()),
          ]),
        ],
      );
    };
  },
});
