/**
 * PixelPopover: v-model:open, the trigger's ARIA and click contract, the
 * teleported content's attributes, and dismissal options. Rendering and the
 * shared interactions are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref, type PropType } from 'vue';
import { PixelPopover, PixelPopoverArrow, PixelPopoverContent, PixelPopoverTrigger } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const panel = () => document.querySelector<HTMLElement>('[data-testid="content"]');

const Harness = defineComponent({
  props: {
    initial: { type: Boolean, default: false },
    popover: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    content: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    trigger: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    const open = ref(props.initial);
    return () =>
      h('div', [
        h(
          PixelPopover,
          { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next), ...props.popover },
          () => [
            h(PixelPopoverTrigger, () => h('button', { type: 'button', 'data-testid': 'trigger', ...props.trigger }, 'open')),
            h(PixelPopoverContent, { 'data-testid': 'content', ...props.content }, () => [
              h('span', 'hello'),
              h(PixelPopoverArrow),
            ]),
          ],
        ),
        h('button', { type: 'button', 'data-testid': 'outside' }, 'outside'),
      ]);
  },
});

const mountHarness = async (props: Record<string, unknown> = {}) => {
  const wrapper = mount(Harness, { props, attachTo: document.body });
  await settle();
  return wrapper;
};

const pointerDown = (target: Element) => target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

// Mounted popovers keep page-wide listeners until they unmount (the shared
// setup clears the page afterwards).
enableAutoUnmount(afterEach);

describe('PixelPopover', () => {
  it('renders no content while closed and teleports it to <body> while open', async () => {
    const wrapper = await mountHarness();
    expect(panel()).toBeNull();
    await wrapper.find('[data-testid="trigger"]').trigger('click');
    await settle();
    const content = panel()!;
    expect(content.parentElement).toBe(document.body);
    expect(wrapper.element.contains(content)).toBe(false);
    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.style.position).toBe('absolute');
    expect(content.style.zIndex).toBe('70');
  });

  it('toggles a v-model:open binding and reflects it on the trigger', async () => {
    const wrapper = await mountHarness();
    const trigger = wrapper.find('[data-testid="trigger"]');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(trigger.attributes('aria-haspopup')).toBe('dialog');
    await trigger.trigger('click');
    await settle();
    expect(trigger.attributes('aria-expanded')).toBe('true');
    await trigger.trigger('click');
    await settle();
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(panel()).toBeNull();
  });

  it('stays as its parent says while bound one-way', async () => {
    const wrapper = mount(PixelPopover, {
      props: { open: false },
      slots: { default: () => h(PixelPopoverTrigger, () => h('button', { type: 'button' }, 'open')) },
      attachTo: document.body,
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('update:open')).toEqual([[true]]);
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
  });

  it('lets a click listener of the trigger element cancel the toggle', async () => {
    const wrapper = await mountHarness({ trigger: { onClick: (event: MouseEvent) => event.preventDefault() } });
    await wrapper.find('[data-testid="trigger"]').trigger('click');
    await settle();
    expect(panel()).toBeNull();
  });

  it("keeps the trigger element's own aria-haspopup", async () => {
    const wrapper = await mountHarness({ trigger: { 'aria-haspopup': 'listbox' }, popover: { haspopup: 'menu' } });
    expect(wrapper.find('[data-testid="trigger"]').attributes('aria-haspopup')).toBe('listbox');
    const other = await mountHarness({ popover: { haspopup: 'menu' } });
    expect(other.find('[data-testid="trigger"]').attributes('aria-haspopup')).toBe('menu');
  });

  it('closes on Escape unless closeOnEscape is false', async () => {
    const wrapper = await mountHarness({ initial: true });
    expect(panel()).not.toBeNull();
    escape();
    await settle();
    expect(panel()).toBeNull();

    const kept = await mountHarness({ initial: true, popover: { closeOnEscape: false } });
    escape();
    await settle();
    expect(panel()).not.toBeNull();
  });

  it('closes on a press outside the trigger and the content, unless closeOnOutsideClick is false', async () => {
    const wrapper = await mountHarness({ initial: true });
    pointerDown(panel()!);
    pointerDown(wrapper.find('[data-testid="trigger"]').element);
    await settle();
    expect(panel()).not.toBeNull();
    pointerDown(wrapper.find('[data-testid="outside"]').element);
    await settle();
    expect(panel()).toBeNull();

    const kept = await mountHarness({ initial: true, popover: { closeOnOutsideClick: false } });
    pointerDown(kept.find('[data-testid="outside"]').element);
    await settle();
    expect(panel()).not.toBeNull();
  });

  it('omits the role for role="none" and lets the content override it', async () => {
    await mountHarness({ initial: true, popover: { role: 'none' } });
    expect(panel()!.hasAttribute('role')).toBe(false);
    await mountHarness({ initial: true, content: { role: 'menu', 'data-testid': 'own' } });
    expect(document.querySelector('[data-testid="own"]')!.getAttribute('role')).toBe('menu');
  });

  it("merges the content's classes and lets its style override the positioning", async () => {
    const wrapper = await mountHarness({ initial: true, content: { class: 'w-64', style: { zIndex: 5, maxWidth: '20rem' } } });
    const content = panel()!;
    expect(content.classList.contains('w-64')).toBe(true);
    expect(content.classList.contains('shadow-xl')).toBe(true);
    expect(content.style.zIndex).toBe('5');
    expect(content.style.maxWidth).toBe('20rem');
    expect(content.style.transform).toMatch(/^translate\(/);
  });

  it('takes the surface of the popover, overridable on the content, and points the arrow at the trigger', async () => {
    await mountHarness({ initial: true, popover: { surface: 'linear', side: 'top' } });
    expect(panel()!.className).toContain('rounded-xl');
    const arrow = panel()!.querySelector('[aria-hidden="true"]')!;
    expect(arrow.className).toContain('bottom-[-5px]');
    await mountHarness({ initial: true, popover: { surface: 'linear' }, content: { surface: 'pixel', 'data-testid': 'override' } });
    expect(document.querySelector('[data-testid="override"]')!.className).toContain('pxl-corner-md');
  });

  it('exposes the content element', async () => {
    const content = ref<{ element: HTMLElement | null } | null>(null);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(PixelPopover, { open: true }, () => [
            h(PixelPopoverTrigger, () => h('button', { type: 'button' }, 'open')),
            h(PixelPopoverContent, { ref: content }, () => 'hello'),
          ]),
      }),
      { attachTo: document.body },
    );
    await settle();
    expect(content.value?.element?.textContent).toBe('hello');
  });

  it('points the trigger at the open content with aria-controls, and only while it is open', async () => {
    const wrapper = await mountHarness();
    const trigger = wrapper.find('[data-testid="trigger"]');
    expect(trigger.attributes('aria-controls')).toBeUndefined();
    await trigger.trigger('click');
    await settle();
    expect(panel()!.id).not.toBe('');
    expect(trigger.attributes('aria-controls')).toBe(panel()!.id);
    await trigger.trigger('click');
    await settle();
    expect(panel()).toBeNull();
    expect(trigger.attributes('aria-controls')).toBeUndefined();
  });

  it("keeps the content's own id and the trigger's own aria-controls", async () => {
    const given = await mountHarness({ initial: true, content: { id: 'details' } });
    expect(panel()!.id).toBe('details');
    expect(given.find('[data-testid="trigger"]').attributes('aria-controls')).toBe('details');
    given.unmount();
    const own = await mountHarness({ initial: true, trigger: { 'aria-controls': 'listbox' } });
    expect(own.find('[data-testid="trigger"]').attributes('aria-controls')).toBe('listbox');
  });

  it('explains when a part is used outside a PixelPopover', () => {
    expect(() => mount(PixelPopoverContent)).toThrow('PixelPopoverContent must be used inside a <PixelPopover> root.');
  });
});
