/**
 * PixelColorSwatch follows its props.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelColorSwatch } from '../../index';

describe('PixelColorSwatch', () => {
  it('fills the sample from the variable and follows changes to it', async () => {
    const wrapper = mount(PixelColorSwatch, { props: { name: 'Gold', cssVar: '--retro-gold' } });
    const sample = () => wrapper.find('.h-8').element as HTMLElement;
    expect(sample().style.backgroundColor).toBe('var(--retro-gold)');
    await wrapper.setProps({ name: 'Cyan', cssVar: '--retro-cyan' });
    expect(sample().style.backgroundColor).toBe('var(--retro-cyan)');
    expect(wrapper.text()).toBe('Cyan--retro-cyan');
  });
});
