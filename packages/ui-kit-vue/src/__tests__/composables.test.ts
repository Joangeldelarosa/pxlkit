/**
 * The composables — the Vue counterparts of the React kit's hooks — behave
 * like the hooks they mirror.
 */
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import {
  PxlKitLocaleProvider,
  PxlKitSurfaceProvider,
  useClickOutside,
  useControllableState,
  useDarkMode,
  useEffectiveSurface,
  useEscape,
  useEventListener,
  useFocusTrap,
  useLocalStorage,
  useMediaQuery,
  usePxlKitLocale,
  usePxlKitSurface,
  useReducedMotion,
  useScrollLock,
} from '../index';
import { installMatchMedia } from './match-media';

/** Mount a component whose setup runs `setup`, returning what it returns. */
function withSetup<T>(setup: () => T, wrap?: (child: ReturnType<typeof defineComponent>) => ReturnType<typeof h>) {
  let result!: T;
  const Child = defineComponent({
    setup() {
      result = setup();
      return () => h('div', { id: 'child' }, [h('button', { id: 'inside' }, 'in')]);
    },
  });
  const wrapper = mount(wrap ? defineComponent({ render: () => wrap(Child) }) : Child, { attachTo: document.body });
  return { result: () => result, wrapper };
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useControllableState', () => {
  it('keeps local state while uncontrolled and reports every change', () => {
    const onChange = vi.fn();
    const { result } = withSetup(() =>
      useControllableState<number>({ value: () => undefined, defaultValue: () => 1, onChange }),
    );
    const [state, setState] = result();
    expect(state.value).toBe(1);
    setState(2);
    setState((prev) => prev + 10);
    expect(state.value).toBe(12);
    expect(onChange.mock.calls).toEqual([[2], [12]]);
  });

  it('shows the controlling value and leaves changes to the parent', () => {
    const controlled = ref<number | undefined>(5);
    const onChange = vi.fn();
    const { result } = withSetup(() =>
      useControllableState<number>({ value: () => controlled.value, defaultValue: () => 1, onChange }),
    );
    const [state, setState] = result();
    setState(6);
    expect(state.value).toBe(5);
    expect(onChange).toHaveBeenCalledWith(6);
    controlled.value = 6;
    expect(state.value).toBe(6);
    controlled.value = undefined;
    expect(state.value).toBe(1);
  });
});

describe('useEventListener', () => {
  it('listens on window by default until unmount', async () => {
    const listener = vi.fn();
    const { wrapper } = withSetup(() => useEventListener('click', listener));
    await nextTick();
    window.dispatchEvent(new MouseEvent('click'));
    wrapper.unmount();
    window.dispatchEvent(new MouseEvent('click'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('follows a changing target and ignores a missing one', async () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    const target = ref<HTMLElement | null>(null);
    const listener = vi.fn();
    withSetup(() => useEventListener('click', listener, target));
    await nextTick();
    target.value = a;
    await nextTick();
    a.dispatchEvent(new MouseEvent('click'));
    target.value = b;
    await nextTick();
    a.dispatchEvent(new MouseEvent('click'));
    b.dispatchEvent(new MouseEvent('click'));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('useMediaQuery / useReducedMotion', () => {
  it('starts from matchMedia, follows changes and stops on unmount', async () => {
    const lists = installMatchMedia((query) => query === '(min-width: 768px)');
    const { result, wrapper } = withSetup(() => useMediaQuery('(min-width: 768px)'));
    await nextTick();
    expect(result().value).toBe(true);
    lists.at(-1)!.fire(false);
    expect(result().value).toBe(false);
    wrapper.unmount();
    expect(lists.at(-1)!.listenerCount()).toBe(0);
  });

  it('re-subscribes when the query changes', async () => {
    installMatchMedia((query) => query === '(min-width: 1024px)');
    const query = ref('(min-width: 768px)');
    const { result } = withSetup(() => useMediaQuery(query));
    await nextTick();
    expect(result().value).toBe(false);
    query.value = '(min-width: 1024px)';
    await nextTick();
    expect(result().value).toBe(true);
  });

  it('falls back to the default without matchMedia', async () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
    const { result } = withSetup(() => useMediaQuery('(min-width: 768px)', true));
    await nextTick();
    expect(result().value).toBe(true);
  });

  it('reads prefers-reduced-motion', async () => {
    installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');
    const { result } = withSetup(() => useReducedMotion());
    await nextTick();
    expect(result().value).toBe(true);
  });
});

describe('useLocalStorage', () => {
  it('reads the stored value once mounted and persists changes', async () => {
    window.localStorage.setItem('k', JSON.stringify('stored'));
    const { result } = withSetup(() => useLocalStorage('k', 'initial'));
    await nextTick();
    const [value, setValue, remove] = result();
    expect(value.value).toBe('stored');
    setValue('next');
    expect(window.localStorage.getItem('k')).toBe('"next"');
    setValue((prev) => `${prev}!`);
    expect(value.value).toBe('next!');
    remove();
    expect(value.value).toBe('initial');
    expect(window.localStorage.getItem('k')).toBeNull();
  });

  it('follows other tabs unless syncTabs is off', async () => {
    const { result } = withSetup(() => useLocalStorage('k', 0));
    const { result: isolated } = withSetup(() => useLocalStorage('k', 0, { syncTabs: false }));
    await nextTick();
    window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: '7' }));
    expect(result()[0].value).toBe(7);
    expect(isolated()[0].value).toBe(0);
    window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: '{bad' }));
    expect(result()[0].value).toBe(7);
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: '9' }));
    expect(result()[0].value).toBe(7);
    window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: null }));
    expect(result()[0].value).toBe(0);
  });

  it('reloads when the key changes and uses custom serializers', async () => {
    window.localStorage.setItem('b', 'n:2');
    const key = ref('a');
    const { result } = withSetup(() =>
      useLocalStorage(key, 0, { serialize: (v) => `n:${v}`, deserialize: (raw) => Number(raw.slice(2)) }),
    );
    await nextTick();
    key.value = 'b';
    await nextTick();
    expect(result()[0].value).toBe(2);
    result()[1](3);
    expect(window.localStorage.getItem('b')).toBe('n:3');
  });
});

describe('useDarkMode', () => {
  it('starts from the system preference and follows it', async () => {
    const lists = installMatchMedia((query) => query.includes('dark'));
    const { result } = withSetup(() => useDarkMode());
    await nextTick();
    expect(result().mode.value).toBe('system');
    expect(result().resolved.value).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    lists.at(-1)!.fire(false);
    expect(result().resolved.value).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('persists the chosen mode and reads it back', async () => {
    installMatchMedia(() => false);
    const { result, wrapper } = withSetup(() => useDarkMode());
    await nextTick();
    result().setMode('dark');
    await nextTick();
    expect(result().resolved.value).toBe('dark');
    expect(window.localStorage.getItem('pxlkit:dark-mode')).toBe('"dark"');
    wrapper.unmount();
    const { result: again } = withSetup(() => useDarkMode());
    await nextTick();
    expect(again().mode.value).toBe('dark');
  });
});

describe('overlay composables', () => {
  it('useEscape fires on Escape only while enabled', async () => {
    const enabled = ref(true);
    const handler = vi.fn();
    withSetup(() => useEscape(handler, enabled));
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    enabled.value = false;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('useClickOutside ignores pointer downs inside the target', async () => {
    const target = ref<HTMLElement | null>(null);
    const handler = vi.fn();
    withSetup(() => useClickOutside(target, handler));
    await nextTick();
    target.value = document.getElementById('child');
    document.getElementById('inside')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('useFocusTrap and useScrollLock follow their flag', async () => {
    const active = ref(false);
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    let container: Ref<HTMLElement | null> | undefined;
    withSetup(() => {
      container = ref(null);
      useFocusTrap(active, container);
      useScrollLock(active);
    });
    await nextTick();
    container!.value = document.getElementById('child');
    active.value = true;
    await nextTick();
    expect(document.activeElement?.id).toBe('inside');
    expect(document.body.style.overflow).toBe('hidden');
    active.value = false;
    await nextTick();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
  });

  it('useFocusTrap of a component that mounts already active traps once its container renders', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const Dialog = defineComponent({
      setup() {
        const panel = ref<HTMLElement | null>(null);
        useFocusTrap(() => true, panel);
        return () => h('div', { ref: panel }, [h('button', { id: 'first' }, 'first')]);
      },
    });
    const wrapper = mount(Dialog, { attachTo: document.body });
    await nextTick();
    expect(document.activeElement?.id).toBe('first');
    wrapper.unmount();
    expect(document.activeElement).toBe(opener);
  });
});

describe('surface and locale', () => {
  it('resolve from the nearest provider, with the prop winning', () => {
    let provided!: ReturnType<typeof usePxlKitSurface>;
    let effective!: ReturnType<typeof useEffectiveSurface>;
    let locale!: ReturnType<typeof usePxlKitLocale>;
    withSetup(
      () => {
        provided = usePxlKitSurface();
        effective = useEffectiveSurface(() => 'pixel');
        locale = usePxlKitLocale();
      },
      (Child) =>
        h(PxlKitSurfaceProvider, { surface: 'linear' }, () =>
          h(PxlKitLocaleProvider, { locale: 'tr' }, () => h(Child)),
        ),
    );
    expect(provided.value).toBe('linear');
    expect(effective.value).toBe('pixel');
    expect(locale.value.locale).toBe('tr');
    expect(locale.value.upper('istanbul')).toBe('İSTANBUL');
  });

  it('default to pixel and English without providers', () => {
    const { result } = withSetup(() => ({ surface: usePxlKitSurface(), locale: usePxlKitLocale() }));
    expect(result().surface.value).toBe('pixel');
    expect(result().locale.value.locale).toBe('en');
  });
});
