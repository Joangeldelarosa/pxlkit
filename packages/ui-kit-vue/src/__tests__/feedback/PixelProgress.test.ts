/**
 * PixelProgress: the progressbar's value, name and busy state across prop
 * changes. Rendering is covered against React by the parity suite.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelProgress } from '../../index';

describe('PixelProgress', () => {
  it('reports the clamped value and follows prop changes', async () => {
    const wrapper = mount(PixelProgress, { props: { value: 150 } });
    const bar = () => wrapper.find('[role="progressbar"]');
    expect(bar().attributes()).toMatchObject({ 'aria-valuenow': '100', 'aria-valuemin': '0', 'aria-valuemax': '100' });
    await wrapper.setProps({ value: -20 });
    expect(bar().attributes('aria-valuenow')).toBe('0');
    await wrapper.setProps({ value: 42, surface: 'linear' });
    expect(bar().attributes('aria-valuenow')).toBe('42');
    expect(bar().find('div').attributes('style')).toBe('width: 42%;');
  });

  it('is named by its label, or "Progress"', () => {
    expect(mount(PixelProgress, { props: { value: 1 } }).find('[role="progressbar"]').attributes('aria-label')).toBe('Progress');
    expect(mount(PixelProgress, { props: { value: 1, label: 'HP' } }).find('[role="progressbar"]').attributes('aria-label')).toBe('HP');
  });

  it('drops the value and turns busy while indeterminate', async () => {
    const wrapper = mount(PixelProgress, { props: { value: 50, label: 'XP' } });
    expect(wrapper.text()).toContain('50%');
    await wrapper.setProps({ indeterminate: true });
    const bar = wrapper.find('[role="progressbar"]');
    expect(bar.attributes('aria-valuenow')).toBeUndefined();
    expect(bar.attributes('aria-busy')).toBe('true');
    expect(wrapper.text()).not.toContain('50%');
  });

  it('hides the percentage with showValue false and the header without a label too', () => {
    const wrapper = mount(PixelProgress, { props: { value: 75, label: 'XP', showValue: false } });
    expect(wrapper.text()).toBe('XP');
    expect(mount(PixelProgress, { props: { value: 75, showValue: false } }).element.children).toHaveLength(1);
  });
});

describe('PixelProgress — indeterminate, reduced motion', () => {
  it('pulses only for a reader who allows motion: the linear fill holds still at 70 %, the pixel blocks at theirs', () => {
    const fill = mount(PixelProgress, { props: { value: 10, surface: 'linear', indeterminate: true } }).get('[role="progressbar"] > div').classes();
    expect(fill).toEqual(expect.arrayContaining(['motion-safe:animate-pulse', 'motion-reduce:opacity-70']));
    expect(fill).not.toContain('animate-pulse');
    const blocks = mount(PixelProgress, { props: { value: 10, indeterminate: true } }).findAll('[role="progressbar"] > div');
    for (const block of blocks) {
      expect(block.classes()).toEqual(expect.arrayContaining(['opacity-70', 'motion-safe:animate-pulse']));
      expect(block.classes()).not.toContain('animate-pulse');
    }
  });
});
