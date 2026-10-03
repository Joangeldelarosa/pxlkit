import { computed, defineComponent, h, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import {
  heroAlign,
  heroContainerPadding,
  heroLayout,
  heroParallaxBodyClasses,
  heroParallaxMediaClasses,
  heroSectionClasses,
  heroSplitMediaClasses,
  type HeroDensity,
  type HeroHeadlineEffect,
  type HeroMinHeight,
  type HeroVariant,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelGlitch from '../animations/PixelGlitch.vue';
import PixelTypewriter from '../animations/PixelTypewriter.vue';
import PixelCluster from '../layout/PixelCluster.vue';
import PixelContainer from '../layout/PixelContainer.vue';
import PixelTwoColumn from '../layout/PixelTwoColumn.vue';

const heroSectionProps = {
  /** The `<h1>`. */
  headline: { type: String, required: true },
  /** `centered` and `parallax` centre the text; `split` puts the `media` slot in a column beside it. */
  variant: { type: String as PropType<HeroVariant>, default: 'centered' },
  /** Small upper-cased line above the headline, in the tone. */
  eyebrow: { type: String, default: undefined },
  /**
   * Animates the headline: `'typewriter'` types it out once — screen readers
   * get the whole headline from the start — and `'glitch'` plays PixelGlitch
   * over it. Both hold still when the user prefers reduced motion.
   */
  headlineEffect: { type: String as PropType<HeroHeadlineEffect>, default: 'none' },
  /** Paragraph under the headline. */
  subline: { type: String, default: undefined },
  /** Tone of the eyebrow. */
  tone: { type: String as PropType<ToneKey>, default: 'neutral' },
  /** Type sizes and vertical rhythm. */
  density: { type: String as PropType<HeroDensity>, default: 'comfortable' },
  /** Minimum height of the section. */
  minHeight: { type: String as PropType<HeroMinHeight>, default: 'md' },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelHeroSectionProps = ExtractPublicPropTypes<typeof heroSectionProps>;

/**
 * The opening `<section>` of a page: an eyebrow, the `<h1>` headline, a
 * subline, a row of calls to action, an install snippet and a meta line,
 * with media in a column beside the text (`split`), behind it as a
 * decorative layer (`parallax`) or below it. Attributes go to the section;
 * an `aria-label` makes it a labelled landmark.
 *
 * @example
 * <PixelHeroSection eyebrow="Introducing" headline="Pixel-perfect retro UI" variant="split">
 *   <template #primary-cta><PixelButton>Get started</PixelButton></template>
 *   <template #media><img src="/shot.png" alt="" /></template>
 * </PixelHeroSection>
 */
export default defineComponent({
  name: 'PixelHeroSection',
  props: heroSectionProps,
  slots: Object as SlotsType<{
    /** First call to action. */
    'primary-cta'?: () => VNode[];
    /** Second call to action, after the first. */
    'secondary-cta'?: () => VNode[];
    /** Install snippet under the calls to action. */
    install?: () => VNode[];
    /** Meta line at the end of the text. */
    meta?: () => VNode[];
    /** Media, placed by the `variant`. */
    media?: () => VNode[];
  }>,
  setup(props, { slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    const align = computed(() => heroAlign(props.variant));
    const classes = computed(() =>
      heroSectionClasses(surface.value, {
        tone: props.tone,
        density: props.density,
        minHeight: props.minHeight,
        align: align.value,
        hasEyebrow: !!props.eyebrow,
      }),
    );

    return () => {
      const c = classes.value;
      const ctas =
        (slots['primary-cta'] || slots['secondary-cta']) &&
        h(PixelCluster, { gap: 3, align: 'center', justify: align.value, surface: surface.value, class: c.ctas }, () => [
          slots['primary-cta']?.(),
          slots['secondary-cta']?.(),
        ]);
      const headline = h(
        'h1',
        { class: c.headline },
        props.headlineEffect === 'typewriter' ? h(PixelTypewriter, { label: props.headline, tone: 'inherit' }) : props.headline,
      );
      const text = h('div', { class: c.text }, [
        props.eyebrow ? h('span', { class: c.eyebrow }, props.eyebrow) : null,
        props.headlineEffect === 'glitch' ? h(PixelGlitch, null, () => headline) : headline,
        props.subline ? h('p', { class: c.subline }, props.subline) : null,
        ctas,
        slots.install && h('div', { class: c.install }, slots.install()),
        slots.meta && h('div', { class: c.meta }, slots.meta()),
      ]);
      const media = slots.media;
      const layout = heroLayout(props.variant, !!media);
      const body =
        layout === 'split'
          ? h(
              PixelTwoColumn,
              { ratio: '60/40', gap: 8, stackBelow: 'md', align: 'center', surface: surface.value },
              { left: () => text, right: () => h('div', { class: heroSplitMediaClasses }, media?.()) },
            )
          : layout === 'parallax'
            ? h('div', { class: heroParallaxBodyClasses }, [
                media && h('div', { 'aria-hidden': 'true', class: heroParallaxMediaClasses }, media()),
                text,
              ])
            : [text, media && h('div', { class: c.media }, media())];
      return h(
        'section',
        { class: c.root },
        h(
          PixelContainer,
          { as: 'div', maxWidth: 'xl', padding: heroContainerPadding(props.density), surface: surface.value },
          () => body,
        ),
      );
    };
  },
});
