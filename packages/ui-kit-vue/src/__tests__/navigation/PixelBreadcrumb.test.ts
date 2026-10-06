/**
 * PixelBreadcrumb beyond the parity examples: the crumbs' handlers, the
 * landmark's name, and a trail that changes.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { PixelBreadcrumb } from '../../index';

describe('PixelBreadcrumb', () => {
  it("runs a button crumb's handler, which wins over its href", async () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelBreadcrumb, {
      props: { items: [{ label: 'Back', href: '/back', onClick }, { label: 'Here', active: true }] },
    });
    expect(wrapper.find('a').exists()).toBe(false);
    await wrapper.find('button').trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('names the landmark "Breadcrumb" unless told otherwise', async () => {
    const wrapper = mount(PixelBreadcrumb, { props: { items: [{ label: 'Home' }] } });
    expect(wrapper.element.tagName).toBe('NAV');
    expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
    await wrapper.setProps({ ariaLabel: 'Miga de pan' });
    expect(wrapper.attributes('aria-label')).toBe('Miga de pan');
  });

  it('follows a trail that changes', async () => {
    const wrapper = mount(PixelBreadcrumb, { props: { items: [{ label: 'Home', active: true }] } });
    await wrapper.setProps({ items: [{ label: 'Home', href: '/' }, { label: 'Docs', active: true }] });
    expect(wrapper.find('a').attributes('href')).toBe('/');
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Docs');
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(1);
  });
});
