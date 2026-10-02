/**
 * PixelEmptyState: the title heading and the icon / action slots. Rendering
 * is covered against React by the parity suite.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelEmptyState } from '../../index';

describe('PixelEmptyState', () => {
  it('titles the placeholder with a heading and keeps title off the root', () => {
    const wrapper = mount(PixelEmptyState, { props: { title: 'No results', description: 'Try another search.' } });
    expect(wrapper.find('h4').text()).toBe('No results');
    expect(wrapper.find('p').text()).toBe('Try another search.');
    expect(wrapper.attributes('title')).toBeUndefined();
  });

  it('hides the icon from assistive tech and renders the action', () => {
    const wrapper = mount(PixelEmptyState, {
      props: { title: 't', description: 'd' },
      slots: { icon: () => h('svg', { 'data-testid': 'icon' }), action: () => h('button', 'Create') },
    });
    expect(wrapper.find('[aria-hidden="true"] [data-testid="icon"]').exists()).toBe(true);
    expect(wrapper.find('.mt-5 button').text()).toBe('Create');
    expect(mount(PixelEmptyState, { props: { title: 't', description: 'd' } }).find('.mt-5').exists()).toBe(false);
  });
});
