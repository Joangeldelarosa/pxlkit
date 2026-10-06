/**
 * PixelChip's listeners: a click listener makes it a button, a delete (or
 * legacy remove) listener shows the delete button, which never clicks the chip.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { PixelChip } from '../../index';

const deleteButton = 'button[aria-label="Remove React"]';

describe('PixelChip', () => {
  it('is a span without a click listener and a button with one', async () => {
    expect(mount(PixelChip, { props: { label: 'React' } }).element.tagName).toBe('SPAN');
    const onClick = vi.fn();
    const wrapper = mount(PixelChip, { props: { label: 'React', onClick } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('deletes from its delete button without clicking the chip', async () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const wrapper = mount(PixelChip, { props: { label: 'React', onClick, onDelete } });
    await wrapper.find(deleteButton).trigger('click');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  // Regression: the delete glyph took the chip's `h-2 w-2` after its own
  // `h-3 w-3`, which Tailwind emits later, so it kept the larger size.
  it('draws the delete glyph at the chip size, without the glyph default', () => {
    const glyph = mount(PixelChip, { props: { label: 'React', onDelete: vi.fn() } }).find(`${deleteButton} svg`);
    expect(glyph.classes()).toEqual(expect.arrayContaining(['h-2', 'w-2']));
    expect(glyph.classes()).not.toContain('h-3');
    expect(glyph.classes()).not.toContain('w-3');
  });

  it('takes the legacy remove listener, prefers delete, and hides the button when not deletable', async () => {
    const onRemove = vi.fn();
    const onDelete = vi.fn();
    const legacy = mount(PixelChip, { props: { label: 'React', onRemove } });
    await legacy.find(deleteButton).trigger('click');
    expect(onRemove).toHaveBeenCalledTimes(1);

    const both = mount(PixelChip, { props: { label: 'React', onRemove, onDelete } });
    await both.find(deleteButton).trigger('click');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);

    expect(mount(PixelChip, { props: { label: 'React', onDelete, deletable: false } }).find(deleteButton).exists()).toBe(false);
    expect(mount(PixelChip, { props: { label: 'React', deletable: true } }).find(deleteButton).exists()).toBe(false);
  });

  it('splits into sibling label and delete buttons in a frame when both listeners are set', async () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const wrapper = mount(PixelChip, {
      props: { label: 'React', onClick, onDelete },
      attrs: { class: 'extra', 'aria-pressed': 'true', type: 'submit' },
    });
    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.classes()).toContain('extra');
    expect(wrapper.find('button button').exists()).toBe(false);
    const action = wrapper.find('[data-chip-action]');
    expect(action.attributes()).toMatchObject({ 'aria-pressed': 'true', type: 'submit' });
    expect(action.classes()).not.toContain('extra');
    await action.trigger('click');
    await wrapper.find(deleteButton).trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('keeps its group value out of the DOM and passes attributes to the root', () => {
    const wrapper = mount(PixelChip, { props: { label: 'React', value: 'react' }, attrs: { 'data-testid': 'chip' } });
    expect(wrapper.attributes('value')).toBeUndefined();
    expect(wrapper.attributes('data-testid')).toBe('chip');
  });

  it("shows the label button's keyboard focus on the frame: inside its cut corners on the pixel surface, a ring in the tone on the linear one", () => {
    const frame = (surface: 'pixel' | 'linear') =>
      mount(PixelChip, { props: { label: 'React', tone: 'pink', surface, onClick: () => {}, onDelete: () => {} } }).classes();
    expect(frame('pixel')).toEqual(expect.arrayContaining(['pxl-corner-sm', 'has-[[data-chip-action]:focus-visible]:pxl-focus-inset']));
    expect(frame('pixel').filter((c) => c.includes('ring'))).toEqual([]);
    expect(frame('linear')).toEqual(
      expect.arrayContaining(['has-[[data-chip-action]:focus-visible]:ring-2', 'has-[[data-chip-action]:focus-visible]:ring-retro-pink/40']),
    );
  });
});
