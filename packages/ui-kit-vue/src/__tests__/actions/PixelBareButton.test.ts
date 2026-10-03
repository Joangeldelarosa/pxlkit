/**
 * PixelBareButton: the `type` default and override, and attributes,
 * listeners and content passed straight to the button.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { PixelBareButton } from '../../index';

describe('PixelBareButton', () => {
  it('is a plain button that never submits by accident', () => {
    const wrapper = mount(PixelBareButton, { slots: { default: () => 'Go' } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.attributes('class')).toBeUndefined();
    expect(wrapper.text()).toBe('Go');
  });

  it('takes another type', () => {
    expect(mount(PixelBareButton, { props: { type: 'submit' } }).attributes('type')).toBe('submit');
    expect(mount(PixelBareButton, { props: { type: 'reset' } }).attributes('type')).toBe('reset');
  });

  it('passes attributes and listeners through to the button', async () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelBareButton, {
      attrs: { class: 'own', 'aria-label': 'Close', 'data-testid': 'bare', onClick },
    });
    expect(wrapper.classes()).toEqual(['own']);
    expect(wrapper.attributes('aria-label')).toBe('Close');
    expect(wrapper.attributes('data-testid')).toBe('bare');
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled by the native attribute', () => {
    const wrapper = mount(PixelBareButton, { attrs: { disabled: true } });
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true);
  });
});
