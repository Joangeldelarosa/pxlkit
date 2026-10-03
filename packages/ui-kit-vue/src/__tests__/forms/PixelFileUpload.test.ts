/**
 * PixelFileUpload: v-model, dropping and choosing files (which the parity
 * scenarios cannot drive: jsdom has no DataTransfer), rejections, image
 * previews, the item slot and what the dropzone is described by.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { PixelFileUpload } from '../../index';
import { vueExamples } from '../examples';
import { mountVue } from '../vue';

function file(name: string, size: number, type = 'text/plain'): File {
  const made = new File(['x'], name, { type });
  Object.defineProperty(made, 'size', { value: size });
  return made;
}

/** A drag event built by hand: jsdom has neither DragEvent nor DataTransfer. */
function drag(type: string, files: File[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files, types: ['Files'] } });
  return event;
}

/** Files chosen in the native picker. */
function choose(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

const dropzoneOf = (root: ParentNode) => root.querySelector<HTMLElement>('[data-pxl-dropzone]')!;
const namesOf = (root: ParentNode) =>
  Array.from(root.querySelectorAll('[data-pxl-file-item] p:first-child'), (name) => name.textContent);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelFileUpload', () => {
  it('binds the files with v-model, both ways', async () => {
    const files = ref<File[]>([]);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelFileUpload, { multiple: true, modelValue: files.value, 'onUpdate:modelValue': (next: File[]) => (files.value = next) }),
      }),
    );
    dropzoneOf(wrapper.element.parentNode!).dispatchEvent(drag('drop', [file('a.txt', 100), file('b.txt', 2048)]));
    await nextTick();
    expect(files.value.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
    expect(namesOf(wrapper.element.parentNode!)).toEqual(['a.txt', 'b.txt']);
    expect(wrapper.text()).toContain('2.0 KB');
    await wrapper.get('[aria-label="Remove a.txt"]').trigger('click');
    expect(files.value.map((f) => f.name)).toEqual(['b.txt']);
    files.value = [];
    await nextTick();
    expect(wrapper.find('ul').exists()).toBe(false);
  });

  it('keeps the last file chosen without multiple, and empties the input after each choice', async () => {
    const wrapper = mount(PixelFileUpload, { props: { defaultValue: [file('old.txt', 1)] } });
    const input = wrapper.get<HTMLInputElement>('input[type="file"]').element;
    choose(input, [file('a.txt', 1), file('b.txt', 2)]);
    await nextTick();
    expect(namesOf(wrapper.element.parentNode!)).toEqual(['b.txt']);
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    expect(input.value).toBe('');
  });

  it('turns down files by type, size and count, reporting them before the change', async () => {
    const events: string[] = [];
    const wrapper = mount(PixelFileUpload, {
      props: {
        multiple: true,
        accept: 'image/*',
        maxSize: 1000,
        maxFiles: 2,
        'onUpdate:modelValue': () => events.push('change'),
        onReject: () => events.push('reject'),
      },
    });
    const pdf = file('doc.pdf', 10, 'application/pdf');
    const big = file('big.png', 5000, 'image/png');
    const pictures = [file('a.png', 10, 'image/png'), file('b.png', 10, 'image/png'), file('c.png', 10, 'image/png')];
    dropzoneOf(wrapper.element.parentNode!).dispatchEvent(drag('drop', [pdf, big, ...pictures]));
    await nextTick();
    expect(events).toEqual(['reject', 'change']);
    expect(wrapper.emitted('reject')![0]).toEqual([
      [
        { file: pdf, reasons: ['accept'] },
        { file: big, reasons: ['size'] },
        { file: pictures[2], reasons: ['maxFiles'] },
      ],
    ]);
    expect(namesOf(wrapper.element.parentNode!)).toEqual(['a.png', 'b.png']);
  });

  it('opens the picker from the dropzone by a click, Enter or Space, and not while disabled', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const wrapper = mount(PixelFileUpload);
    const dropzone = wrapper.get('[data-pxl-dropzone]');
    await dropzone.trigger('click');
    await dropzone.trigger('keydown', { key: 'Enter' });
    await dropzone.trigger('keydown', { key: ' ' });
    await dropzone.trigger('keydown', { key: 'a' });
    expect(click).toHaveBeenCalledTimes(3);
    await wrapper.setProps({ disabled: true });
    await dropzone.trigger('click');
    await dropzone.trigger('keydown', { key: 'Enter' });
    expect(click).toHaveBeenCalledTimes(3);
    expect(dropzone.attributes()).toMatchObject({ tabindex: '-1', 'aria-disabled': 'true' });
  });

  it('lights up while files are dragged over, and takes no drop while disabled', async () => {
    const wrapper = mount(PixelFileUpload, { props: { disabled: false } });
    const dropzone = dropzoneOf(wrapper.element.parentNode!);
    const over = drag('dragover');
    dropzone.dispatchEvent(over);
    await nextTick();
    expect(over.defaultPrevented).toBe(true);
    expect(dropzone.textContent).toContain('Drop to upload');
    expect(dropzone.classList).toContain('bg-retro-cyan/8');
    dropzone.dispatchEvent(drag('dragleave'));
    await nextTick();
    expect(dropzone.textContent).toContain('Drop files or click to browse');
    await wrapper.setProps({ disabled: true });
    dropzone.dispatchEvent(drag('dragenter'));
    dropzone.dispatchEvent(drag('drop', [file('a.txt', 1)]));
    await nextTick();
    expect(dropzone.textContent).toContain('Drop files or click to browse');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('describes the dropzone with the hint or error, or the input itself without a dropzone', async () => {
    const wrapper = mount(PixelFileUpload, { props: { label: 'Files', hint: 'PDF only', id: 'docs' } });
    expect(wrapper.get('[data-pxl-dropzone]').attributes('aria-describedby')).toBe('docs-msg');
    expect(wrapper.get('#docs-msg').text()).toBe('PDF only');
    expect(wrapper.get('label').attributes('for')).toBe('docs');
    const input = wrapper.get('input[type="file"]');
    expect(input.attributes()).toMatchObject({ tabindex: '-1', 'aria-hidden': 'true' });
    expect(input.attributes('aria-describedby')).toBeUndefined();
    await wrapper.setProps({ dropzone: false, hint: undefined });
    expect(input.attributes('aria-describedby')).toBeUndefined();
    await wrapper.setProps({ error: 'Required' });
    expect(input.attributes()).toMatchObject({ tabindex: '0', 'aria-describedby': 'docs-msg' });
    expect(wrapper.get('button').text()).toBe('Choose file');
    await wrapper.setProps({ multiple: true });
    expect(wrapper.get('button').text()).toBe('Choose files');
  });

  it('previews images with object URLs it revokes as they go', async () => {
    const create = vi.fn((made: Blob) => `blob:${(made as File).name}`);
    const revoke = vi.fn();
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));
    const shot = file('shot.png', 10, 'image/png');
    const notes = file('notes.txt', 10);
    const wrapper = mount(PixelFileUpload, { props: { multiple: true, defaultValue: [shot, notes] } });
    await nextTick();
    expect(wrapper.get('img').attributes()).toMatchObject({ src: 'blob:shot.png', alt: 'shot.png' });
    expect(create).toHaveBeenCalledTimes(1);
    await wrapper.get('[aria-label="Remove shot.png"]').trigger('click');
    await nextTick();
    expect(revoke).toHaveBeenCalledWith('blob:shot.png');
    expect(wrapper.find('img').exists()).toBe(false);
    wrapper.unmount();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  });

  it('renders each file through the item slot, which can remove it', async () => {
    const wrapper = mount(PixelFileUpload, {
      props: { multiple: true, defaultValue: [file('a.txt', 1), file('b.txt', 1)] },
      slots: {
        item: ({ file: item, remove }: { file: File; remove: () => void }) => h('button', { class: 'mine', onClick: remove }, item.name),
      },
    });
    const items = wrapper.findAll('[data-pxl-file-item]');
    expect(items.map((item) => item.html())).toEqual([
      '<li data-pxl-file-item="true"><button class="mine">a.txt</button></li>',
      '<li data-pxl-file-item="true"><button class="mine">b.txt</button></li>',
    ]);
    await items[0]!.get('button').trigger('click');
    expect(wrapper.findAll('[data-pxl-file-item]').map((item) => item.text())).toEqual(['b.txt']);
  });

  it('passes attributes to the element around the dropzone and the list, which it exposes', () => {
    const wrapper = mount(PixelFileUpload, { props: { name: 'attachments' }, attrs: { class: 'mine', 'data-testid': 'upload' } });
    const element = (wrapper.vm as unknown as { element: HTMLDivElement }).element;
    expect(element).toBe(wrapper.get('[data-testid="upload"]').element);
    expect(element.className).toBe('space-y-3 mine');
    expect(element.dataset.pxlName).toBe('attachments');
    expect(wrapper.get('input[type="file"]').attributes('name')).toBeUndefined();
  });

  it('renders what React renders as files are dragged in, dropped and removed', async () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: (made: Blob) => `blob:${(made as File).name}`, revokeObjectURL: () => {} }));
    const reference = reactExamples().find((e) => e.component === 'PixelFileUpload' && e.exportName === 'Default')!;
    const files = [file('shot.png', 2048, 'image/png'), file('notes.pdf', 5 * 1024 * 1024 + 1, 'application/pdf'), file('art.jpg', 10, 'image/jpeg')];
    const steps = async ({ container, flush }: Mounted) => {
      const snapshots: string[] = [];
      const snapshot = async () => {
        await flush();
        snapshots.push(canonicalPage(document, { unwrap: (element) => element.hasAttribute('data-parity-root') }));
      };
      dropzoneOf(container).dispatchEvent(drag('dragenter'));
      await snapshot();
      dropzoneOf(container).dispatchEvent(drag('drop', files));
      await snapshot();
      container.querySelector<HTMLButtonElement>('[aria-label="Remove shot.png"]')!.click();
      await snapshot();
      return snapshots;
    };
    const react = await mountReact(reference.Component);
    const expected = await steps(react);
    await react.unmount();
    const vue = await mountVue(await vueExamples.get('PixelFileUpload/Default')!.load());
    const actual = await steps(vue);
    await vue.unmount();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
    expect(actual).toEqual(expected);
  });
});
