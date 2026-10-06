/**
 * The kit's internal building blocks: glyphs, the field shell, the asChild
 * slot and the portal.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Comment, Fragment, createTextVNode, defineComponent, h, nextTick, onMounted, ref } from 'vue';
import { PIXEL_GLYPHS } from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { Slot, singleElementChild, slotNodes } from '../_internal/Slot';
import { PixelPortal } from '../index';
import { createElement } from 'react';
import { ReactFieldShell } from '../../../../scripts/parity/react-internals';
import { canonicalDom } from '../../../../scripts/parity/canonical';
import { mountReact } from '../../../../scripts/parity/react';

describe('PixelGlyph', () => {
  it('draws the glyph with its size classes and the caller classes', () => {
    const wrapper = mount(PixelGlyph, { props: { name: 'check' }, attrs: { class: 'text-retro-green' } });
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 8 8');
    expect(svg.classes()).toEqual(['h-3', 'w-3', 'shrink-0', 'text-retro-green']);
    expect(wrapper.findAll('rect')).toHaveLength(PIXEL_GLYPHS.check.rects.length);
    expect(svg.attributes('style')).toContain('vertical-align: middle');
  });

  // Regression: a caller's smaller size followed the glyph's own, and
  // Tailwind emits `h-3` after `h-2`, so the glyph kept its own size.
  it("replaces its size with the caller's, and passes other attributes on", () => {
    const svg = mount(PixelGlyph, { props: { name: 'close' }, attrs: { class: 'h-2 w-2', 'aria-hidden': 'true' } }).find('svg');
    expect(svg.classes()).toEqual(['shrink-0', 'h-2', 'w-2']);
    expect(svg.attributes('aria-hidden')).toBe('true');
  });
});

describe('FieldShell', () => {
  it('renders the DOM of the React kit\'s FieldShell', async () => {
    const cases: Array<{
      label?: string;
      hint?: string;
      error?: string;
      htmlFor?: string;
      messageId?: string;
      surface?: 'linear';
    }> = [
      { label: 'Email', hint: 'We never share it', htmlFor: 'email' },
      { label: 'Name', hint: 'hint', error: 'Required', surface: 'linear' },
      { hint: 'Only a hint' },
      { label: 'Email', hint: 'We never share it', htmlFor: 'email', messageId: 'email-msg' },
      { label: 'Email', hint: 'hint', error: 'Required', htmlFor: 'email', messageId: 'email-msg' },
      { label: 'Email', htmlFor: 'email', messageId: 'email-msg' },
    ];
    for (const props of cases) {
      const react = await mountReact(() => createElement(ReactFieldShell, props, createElement('input', { id: 'email' })));
      const expected = canonicalDom(react.container);
      await react.unmount();
      const wrapper = mount(FieldShell, { props, slots: { default: () => h('input', { id: 'email' }) }, attachTo: document.body });
      expect(canonicalDom(wrapper.element.parentElement!)).toBe(expected);
      wrapper.unmount();
    }
  });

  it('labels the control with for= when given an id, and shows the hint', () => {
    const wrapper = mount(FieldShell, {
      props: { label: 'Email', hint: 'We never share it', htmlFor: 'email' },
      slots: { default: () => h('input', { id: 'email' }) },
    });
    expect(wrapper.find('label').attributes('for')).toBe('email');
    expect(wrapper.text()).toContain('We never share it');
  });

  it('gives the hint, or the error replacing it, the message id', async () => {
    const wrapper = mount(FieldShell, { props: { hint: 'We never share it', messageId: 'email-msg' } });
    expect(wrapper.find('#email-msg').text()).toBe('We never share it');
    await wrapper.setProps({ error: 'Required' });
    expect(wrapper.find('#email-msg').text()).toBe('Required');
    await wrapper.setProps({ hint: undefined, error: undefined });
    expect(wrapper.find('#email-msg').exists()).toBe(false);
    await wrapper.setProps({ hint: 'We never share it', messageId: undefined });
    expect(wrapper.find('span').attributes()).not.toHaveProperty('id');
  });

  it('falls back to a span label and lets the error replace the hint', () => {
    const wrapper = mount(FieldShell, { props: { label: 'Name', hint: 'hint', error: 'Required', surface: 'linear' } });
    expect(wrapper.find('label').exists()).toBe(false);
    expect(wrapper.find('span').text()).toBe('Name');
    expect(wrapper.text()).toContain('Required');
    expect(wrapper.text()).not.toContain('hint');
    expect(wrapper.find('span').classes()).toContain('font-sans');
  });
});

describe('Slot', () => {
  it('flattens fragments and drops comments when reading slot content', () => {
    const a = h('a');
    expect(slotNodes([h(Comment, 'x'), h(Fragment, [a])])).toEqual([a]);
    expect(singleElementChild([h(Comment, 'x'), a])).toBe(a);
    expect(singleElementChild([a, h('b')])).toBeNull();
    expect(singleElementChild([createTextVNode('text')])).toBeNull();
    expect(singleElementChild(undefined)).toBeNull();
  });

  it('renders its single element child with the merged attributes, or nothing', () => {
    const one = mount(Slot, { attrs: { class: 'kit', id: 'merged' }, slots: { default: () => h('a', { class: 'own' }) } });
    expect(one.html()).toBe('<a class="own kit" id="merged"></a>');
    const many = mount(Slot, { slots: { default: () => [h('a'), h('b')] } });
    expect(many.html()).toBe('');
  });
});

describe('PixelPortal', () => {
  it('moves its content into a given container once mounted', async () => {
    const target = document.createElement('section');
    document.body.appendChild(target);
    mount(PixelPortal, { props: { container: target }, slots: { default: () => h('p', 'moved') }, attachTo: document.body });
    await nextTick();
    expect(target.innerHTML).toContain('<p>moved</p>');
  });

  it('keeps focus on an element focused inside it before the move', async () => {
    // Focused while still in place — as a modal's focus trap does on open.
    const Focuser = defineComponent({
      setup() {
        const button = ref<HTMLButtonElement | null>(null);
        onMounted(() => button.value!.focus());
        return () => h('button', { ref: button, type: 'button' }, 'inside');
      },
    });
    const wrapper = mount(PixelPortal, { slots: { default: () => h(Focuser) }, attachTo: document.body });
    await nextTick();
    const button = document.body.querySelector('button')!;
    expect(button.parentElement).toBe(document.body);
    expect(document.activeElement).toBe(button);
    wrapper.unmount();
  });
});
