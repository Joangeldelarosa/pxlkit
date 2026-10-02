/**
 * PixelGrid beyond the parity examples: the rendered element, attribute and
 * style fall-through, and switching between column classes and the auto-fit
 * template.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelGrid } from '../../index';

describe('PixelGrid', () => {
  it('renders the element it is given and passes attributes and styles through', () => {
    const wrapper = mount(PixelGrid, {
      props: { as: 'ul', cols: { base: 1, xl: 6 }, rows: 2, align: 'end', justify: 'center' },
      attrs: { 'aria-label': 'Gallery', style: 'grid-auto-rows: 8rem' },
    });
    expect(wrapper.element.tagName).toBe('UL');
    expect(wrapper.attributes('aria-label')).toBe('Gallery');
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['grid', 'grid-cols-1', 'xl:grid-cols-6', 'grid-rows-2', 'gap-4', 'items-end', 'justify-items-center']),
    );
    expect((wrapper.element as HTMLElement).style.gridAutoRows).toBe('8rem');
    expect((wrapper.element as HTMLElement).style.gridTemplateColumns).toBe('');
  });

  it('swaps the column classes for an auto-fill template and back', async () => {
    const wrapper = mount(PixelGrid, { props: { cols: 3, autoFill: true, minColWidth: '10rem' } });
    const element = wrapper.element as HTMLElement;
    expect(element.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(min(10rem, 100%), 1fr))');
    expect(wrapper.classes()).not.toContain('grid-cols-3');
    await wrapper.setProps({ autoFill: false });
    expect(element.style.gridTemplateColumns).toBe('');
    expect(wrapper.classes()).toContain('grid-cols-3');
  });

  it('replaces the uniform gap with zero-or-more column and row gaps', () => {
    const wrapper = mount(PixelGrid, { props: { colGap: 0, rowGap: 6 } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['gap-x-0', 'gap-y-6']));
    expect(wrapper.classes()).not.toContain('gap-4');
  });
});
