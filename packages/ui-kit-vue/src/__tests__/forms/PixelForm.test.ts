/**
 * PixelForm on VeeValidate: when messages show (submission, then changes,
 * never blur), focus on a failed submission, the submitted values, the
 * field's slot props and the parts' ids — and the submission flow against
 * React's on React Hook Form, which the parity scenarios cannot drive (the
 * example has no submit button, and jsdom no implicit submission).
 */
import { mount, type VueWrapper } from '@vue/test-utils';
import { useForm } from 'vee-validate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, type PropType } from 'vue';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import {
  PixelForm,
  PixelFormControl,
  PixelFormDescription,
  PixelFormField,
  PixelFormItem,
  PixelFormLabel,
  PixelFormMessage,
  PixelInput,
  type PixelFormFieldState,
} from '../../index';
import { vueExamples } from '../examples';
import { mountVue } from '../vue';

/** Lets VeeValidate's asynchronous validation finish and render. */
async function settle() {
  for (let round = 0; round < 4; round++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();
  }
}

/** Types into an input as a user does: through the native setter, which React's value tracking sees. */
function type(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const required = (message: string) => (value: unknown) => !!value || message;

/** A one-field login form, recording what the field's slot receives. */
function login(options: { onSubmit?: (values: unknown) => void; message?: () => unknown } = {}) {
  const states: PixelFormFieldState[] = [];
  const Login = defineComponent({
    setup() {
      const form = useForm({ initialValues: { email: '' } });
      return () =>
        h(PixelForm, { form, onSubmit: options.onSubmit }, () => [
          h(PixelFormField, { name: 'email', rules: [required('Email is required')] }, {
            default: ({ field, fieldState }: { field: Record<string, unknown>; fieldState: PixelFormFieldState }) => {
              states.push(fieldState);
              return h(PixelFormItem, () => [
                h(PixelFormLabel, () => 'Email'),
                h(PixelFormControl, () => h(PixelInput, field)),
                h(PixelFormDescription, () => 'We never spam.'),
                h(PixelFormMessage, null, options.message ? { default: options.message } : undefined),
              ]);
            },
          }),
          h('button', { type: 'submit' }, 'Go'),
        ]);
    },
  });
  const wrapper = mount(Login, { attachTo: document.body });
  return { wrapper, states, input: wrapper.get<HTMLInputElement>('input').element, form: wrapper.get<HTMLFormElement>('form').element };
}

let mounted: VueWrapper | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
});

describe('PixelForm', () => {
  it('links the label, control, description and message with ids of the item', async () => {
    const { wrapper, input, form } = login();
    mounted = wrapper;
    const label = wrapper.get('label');
    const description = wrapper.get('p');
    expect(label.attributes('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(description.attributes('id'));
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(form.noValidate).toBe(true);
    form.requestSubmit();
    await settle();
    const message = wrapper.get('[role="alert"]');
    expect(message.text()).toBe('Email is required');
    expect(input.getAttribute('aria-describedby')).toBe(`${description.attributes('id')} ${message.attributes('id')}`);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('validates on submission and, after it, as the value changes, never on blur', async () => {
    const { wrapper, input, form } = login();
    mounted = wrapper;
    type(input, 'x');
    type(input, '');
    input.dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    form.requestSubmit();
    await settle();
    expect(wrapper.get('[role="alert"]').text()).toBe('Email is required');
    type(input, 'me@pxlkit.xyz');
    await settle();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    type(input, '');
    await settle();
    expect(wrapper.get('[role="alert"]').text()).toBe('Email is required');
  });

  it('focuses the first field with an error, and submits the values once there is none', async () => {
    const submitted = vi.fn();
    const { wrapper, input, form } = login({ onSubmit: submitted });
    mounted = wrapper;
    wrapper.get('button').element.focus();
    form.requestSubmit();
    await settle();
    expect(document.activeElement).toBe(input);
    expect(submitted).not.toHaveBeenCalled();
    type(input, 'me@pxlkit.xyz');
    form.requestSubmit();
    await settle();
    expect(submitted).toHaveBeenCalledWith({ email: 'me@pxlkit.xyz' });
  });

  it('gives the slot the field binding and its state', async () => {
    const { wrapper, input, form, states } = login();
    mounted = wrapper;
    expect(states.at(-1)).toEqual({ invalid: false, isTouched: false, isDirty: false, isValidating: false, error: undefined });
    type(input, 'me@pxlkit.xyz');
    input.dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(states.at(-1)).toMatchObject({ isTouched: true, isDirty: true, invalid: false });
    expect(input.name).toBe('email');
    type(input, '');
    form.requestSubmit();
    await settle();
    expect(states.at(-1)).toMatchObject({ invalid: true, error: { message: 'Email is required' } });
  });

  it('shows the message slot in place of the error, and the error when the slot renders nothing', async () => {
    const custom = login({ message: () => 'Check your inbox' });
    mounted = custom.wrapper;
    // A message without an error is no alert.
    expect(custom.wrapper.get('p:last-of-type').attributes()).toMatchObject({ class: expect.stringContaining('text-retro-muted') });
    expect(custom.wrapper.text()).toContain('Check your inbox');
    expect(custom.wrapper.find('[role="alert"]').exists()).toBe(false);
    custom.form.requestSubmit();
    await settle();
    expect(custom.wrapper.get('[role="alert"]').text()).toBe('Check your inbox');
    custom.wrapper.unmount();

    const empty = login({ message: () => undefined });
    mounted = empty.wrapper;
    expect(empty.wrapper.findAll('p')).toHaveLength(1);
    empty.form.requestSubmit();
    await settle();
    expect(empty.wrapper.get('[role="alert"]').text()).toBe('Email is required');
  });

  it('keeps an unmounted field value unless asked to drop it, and starts from defaultValue', async () => {
    const shown = ref(true);
    let values: Record<string, unknown> = {};
    const Form = defineComponent({
      props: { shouldUnregister: { type: Boolean as PropType<boolean>, default: false } },
      setup(props) {
        const form = useForm<Record<string, unknown>>();
        values = form.values;
        return () =>
          h(PixelForm, { form }, () =>
            shown.value
              ? [
                  h(PixelFormField, { name: 'nick', defaultValue: 'pxl', shouldUnregister: props.shouldUnregister }, {
                    default: ({ field }: { field: Record<string, unknown> }) => h(PixelInput, field),
                  }),
                ]
              : [],
          );
      },
    });
    const kept = mount(Form);
    expect(kept.get('input').element.value).toBe('pxl');
    shown.value = false;
    await settle();
    expect(values).toEqual({ nick: 'pxl' });
    kept.unmount();

    shown.value = true;
    const dropped = mount(Form, { props: { shouldUnregister: true } });
    shown.value = false;
    await settle();
    expect(values).toEqual({});
    dropped.unmount();
  });

  it('puts the ids and ARIA on a native control too, and needs an item around its parts', () => {
    const Native = defineComponent({
      setup() {
        const form = useForm({ initialValues: { code: '' } });
        return () =>
          h(PixelForm, { form, surface: 'linear', class: 'mine' }, () =>
            h(PixelFormField, { name: 'code' }, {
              default: () => h(PixelFormItem, { class: 'item' }, () => [h(PixelFormControl, () => h('input', { 'data-testid': 'code' }))]),
            }),
          );
      },
    });
    const wrapper = mount(Native);
    const input = wrapper.get('[data-testid="code"]');
    expect(input.attributes('id')).toMatch(/-control$/);
    expect(input.attributes('aria-describedby')).toMatch(/-description$/);
    expect(wrapper.get('form').classes()).toEqual(['space-y-4', 'font-sans', 'mine']);
    expect(wrapper.get('.item').classes()).toEqual(['space-y-1.5', 'item']);
    expect(() => mount(PixelFormLabel)).toThrow('PixelFormLabel must be used inside a PixelFormItem.');
  });

  it('renders what React renders through a submission, a fix and a valid submission', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const reference = reactExamples().find((e) => e.component === 'PixelForm' && e.exportName === 'Default')!;
    const flow = async ({ container, flush }: Mounted) => {
      const snapshots: string[] = [];
      const step = async (act: () => void) => {
        act();
        for (let round = 0; round < 4; round++) await flush();
        snapshots.push(canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') }));
      };
      const form = container.querySelector('form')!;
      const [username, email] = Array.from(container.querySelectorAll('input'));
      await step(() => form.requestSubmit());
      await step(() => type(username!, 'pxl'));
      await step(() => username!.blur());
      await step(() => type(email!, 'hero@'));
      await step(() => form.requestSubmit());
      await step(() => type(email!, 'hero@pxlkit.xyz'));
      await step(() => form.requestSubmit());
      return snapshots;
    };
    const react = await mountReact(reference.Component);
    const expected = await flow(react);
    await react.unmount();
    const vue = await mountVue(await vueExamples.get('PixelForm/Default')!.load());
    const actual = await flow(vue);
    await vue.unmount();
    expect(actual).toEqual(expected);
    expect(log.mock.calls).toEqual([
      ['submit', { username: 'pxl', email: 'hero@pxlkit.xyz' }],
      ['submit', { username: 'pxl', email: 'hero@pxlkit.xyz' }],
    ]);
  });
});
