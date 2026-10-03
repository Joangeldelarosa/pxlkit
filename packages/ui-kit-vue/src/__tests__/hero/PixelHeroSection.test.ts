/**
 * PixelHeroSection: each slot in each layout, the parallax media hidden from
 * assistive technology, a split hero without media, the reserved
 * headlineEffect and attributes of the consumer's on the section.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelHeroSection } from '../../index';

const slots = {
  'primary-cta': () => h('button', { type: 'button' }, 'Start'),
  'secondary-cta': () => h('button', { type: 'button' }, 'Docs'),
  install: () => h('code', 'npm i @pxlkit/ui-kit-vue'),
  meta: () => h('small', 'MIT'),
  media: () => h('img', { alt: 'Shot' }),
};

describe('PixelHeroSection', () => {
  it('lays out the text, the calls to action in a cluster, the install and meta lines, and the media below', () => {
    const wrapper = mount(PixelHeroSection, { props: { headline: 'Hello', eyebrow: 'New', subline: 'Sub' }, slots });
    const text = wrapper.find('h1').element.parentElement!;
    expect(Array.from(text.children, (child) => child.tagName)).toEqual(['SPAN', 'H1', 'P', 'DIV', 'DIV', 'DIV']);
    const [ctas, install, meta] = Array.from(text.children).slice(3);
    expect(Array.from(ctas!.children, (child) => child.textContent)).toEqual(['Start', 'Docs']);
    expect(ctas!.className).toContain('justify-center');
    expect(install!.querySelector('code')).not.toBeNull();
    expect(meta!.querySelector('small')).not.toBeNull();
    // The media follows the text column.
    expect(text.nextElementSibling!.querySelector('img')).not.toBeNull();
    expect(text.nextElementSibling!.className).toContain('mt-10');
  });

  it('renders a cluster for a single call to action, and none without one', () => {
    const one = mount(PixelHeroSection, { props: { headline: 'Hello' }, slots: { 'secondary-cta': slots['secondary-cta'] } });
    expect(one.findAll('h1 ~ div button').map((button) => button.text())).toEqual(['Docs']);
    const none = mount(PixelHeroSection, { props: { headline: 'Hello' } });
    expect(none.find('h1').element.parentElement!.children).toHaveLength(1);
  });

  it('puts the media in a column beside the text when split, start-aligned', () => {
    const wrapper = mount(PixelHeroSection, { props: { headline: 'Hello', variant: 'split' }, slots });
    const grid = wrapper.find('.grid');
    expect(grid.classes()).toEqual(expect.arrayContaining(['md:grid-cols-[3fr_2fr]', 'gap-8', 'items-center']));
    expect(grid.element.children[0]!.querySelector('h1')).not.toBeNull();
    expect(grid.element.children[1]!.querySelector('.w-full > img')).not.toBeNull();
    expect(wrapper.find('h1 ~ div').classes()).toContain('justify-start');
  });

  it('stacks a split hero without media', () => {
    const wrapper = mount(PixelHeroSection, { props: { headline: 'Hello', variant: 'split' } });
    expect(wrapper.find('.grid').exists()).toBe(false);
    expect(wrapper.find('h1').element.parentElement!.className).toBe('flex flex-col');
  });

  it('lays the parallax media behind the text, hidden from assistive technology', () => {
    const wrapper = mount(PixelHeroSection, { props: { headline: 'Hello', variant: 'parallax' }, slots });
    const layer = wrapper.find('[aria-hidden="true"]');
    expect(layer.classes()).toEqual(expect.arrayContaining(['absolute', '-z-10', 'pointer-events-none']));
    expect(layer.find('img').exists()).toBe(true);
    expect(layer.element.nextElementSibling!.querySelector('h1')).not.toBeNull();
  });

  it('takes the consumer attributes on the section and keeps headlineEffect off it', () => {
    const wrapper = mount(PixelHeroSection, {
      props: { headline: 'Hello', headlineEffect: 'glitch', minHeight: 'lg' },
      attrs: { 'aria-label': 'Welcome', class: 'own' },
    });
    expect(wrapper.element.tagName).toBe('SECTION');
    expect(wrapper.attributes('aria-label')).toBe('Welcome');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'min-h-[640px]']));
    expect(wrapper.attributes()).not.toHaveProperty('headlineeffect');
    expect(wrapper.attributes()).not.toHaveProperty('headline-effect');
  });
});
