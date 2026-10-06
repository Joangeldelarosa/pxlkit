/**
 * PixelHeroMedia: the caption and its extra classes, the frame, the anchor,
 * and attributes and styles of the consumer's on the figure.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelHeroMedia } from '../../index';

describe('PixelHeroMedia', () => {
  it('holds the media in a figure at the ratio, without a caption until given one', async () => {
    const wrapper = mount(PixelHeroMedia, { slots: { default: () => h('img', { alt: 'Shot' }) } });
    expect(wrapper.element.tagName).toBe('FIGURE');
    expect((wrapper.element as HTMLElement).style.aspectRatio).toBe('16 / 10');
    expect(wrapper.find('figure > div > img').exists()).toBe(true);
    expect(wrapper.find('figcaption').exists()).toBe(false);
    await wrapper.setProps({ ratio: '4/5', caption: 'Hero shot', captionClass: 'italic' });
    expect((wrapper.element as HTMLElement).style.aspectRatio).toBe('4 / 5');
    expect(wrapper.find('figcaption').text()).toBe('Hero shot');
    expect(wrapper.find('figcaption').classes()).toEqual(expect.arrayContaining(['mt-3', 'font-mono', 'italic']));
  });

  it('frames the figure in the tone and anchors it at the end of its row', () => {
    const wrapper = mount(PixelHeroMedia, { props: { framed: true, tone: 'gold', anchor: 'baseline-headline' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['border-2', 'border-retro-gold/30', 'self-end']));
    expect(wrapper.classes()).not.toContain('self-center');
  });

  it('takes the consumer attributes, classes and styles, which can override the ratio', () => {
    const wrapper = mount(PixelHeroMedia, {
      attrs: { id: 'media', class: 'own', style: { aspectRatio: '2 / 1', color: 'red' } },
    });
    const figure = wrapper.element as HTMLElement;
    expect(figure.id).toBe('media');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'relative']));
    expect(figure.style.aspectRatio).toBe('2 / 1');
    expect(figure.style.color).toBe('red');
  });
});
