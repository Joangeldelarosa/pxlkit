/**
 * The utilities — the Angular counterparts of the React kit's hooks — and the
 * kit's internal building blocks.
 */
import {
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  afterNextRender,
  inject,
  provideZonelessChangeDetection,
  signal,
  viewChild,
  type Type,
} from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PixelPortal,
  PxlKitLocaleProvider,
  PxlKitSurfaceProvider,
  injectClickOutside,
  injectDarkMode,
  injectEffectiveSurface,
  injectEscape,
  injectEventListener,
  injectFocusTrap,
  injectLocalStorage,
  injectMediaQuery,
  injectPxlKitLocale,
  injectPxlKitSurface,
  injectReducedMotion,
  injectScrollLock,
  providePxlKitSurface,
  type PxlContent,
} from '../public-api';
import { PxlIdGenerator, injectId } from '../lib/_internal/ids';
import { PxlOutlet } from '../lib/_internal/outlet';
import { PixelGlyph } from '../lib/_internal/pixel-glyph';
import { PixelFieldShell } from '../lib/_internal/field-shell';
import { createElement } from 'react';
import { ReactFieldShell } from '../../../../scripts/parity/react-internals';
import { canonicalDom } from '../../../../scripts/parity/canonical';
import { mountReact } from '../../../../scripts/parity/react';
import { angularDomRules } from './dom-rules';
import { installMatchMedia } from './match-media';

async function render<T>(type: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('injectEventListener / injectEscape / injectClickOutside', () => {
  it('listen from the first render until destroyed', async () => {
    const click = vi.fn();
    const escape = vi.fn();
    const outside = vi.fn();

    @Component({ template: '<button id="inside">in</button>' })
    class Host {
      readonly enabled = signal(true);
      constructor() {
        injectEventListener('click', click);
        injectEscape(escape, () => this.enabled());
        injectClickOutside(() => document.getElementById('inside'), outside);
      }
    }

    const fixture = await render(Host);
    window.dispatchEvent(new MouseEvent('click'));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.componentInstance.enabled.set(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.getElementById('inside')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    fixture.destroy();
    window.dispatchEvent(new MouseEvent('click'));
    expect([click.mock.calls.length, escape.mock.calls.length, outside.mock.calls.length]).toEqual([1, 1, 1]);
  });
});

describe('injectFocusTrap / injectScrollLock', () => {
  it('follow their flag', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    @Component({ template: '<div id="panel"><button id="first">1</button></div>' })
    class Host {
      readonly open = signal(false);
      constructor() {
        injectFocusTrap(() => this.open(), () => document.getElementById('panel'));
        injectScrollLock(() => this.open());
      }
    }

    const fixture = await render(Host);
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('first');
    expect(document.body.style.overflow).toBe('hidden');
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
  });
});

describe('injectMediaQuery / injectReducedMotion', () => {
  it('start from matchMedia and follow changes', async () => {
    const lists = installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');

    @Component({ template: '' })
    class Host {
      readonly query = signal('(min-width: 768px)');
      readonly wide = injectMediaQuery(() => this.query());
      readonly reduced = injectReducedMotion();
      readonly fixed = injectMediaQuery('(min-width: 1px)', true);
    }

    const fixture = await render(Host);
    const host = fixture.componentInstance;
    expect(host.reduced()).toBe(true);
    expect(host.wide()).toBe(false);
    // The subscribed list is the latest one created for the query.
    lists.filter((list) => list.media === '(min-width: 768px)').at(-1)!.fire(true);
    expect(host.wide()).toBe(true);
    host.query.set('(min-width: 1024px)');
    await fixture.whenStable();
    expect(host.wide()).toBe(false);
    expect(host.fixed()).toBe(false);
  });
});

describe('injectLocalStorage', () => {
  it('reads after the first render, persists and follows other tabs', async () => {
    window.localStorage.setItem('k', '"stored"');

    @Component({ template: '' })
    class Host {
      readonly storage = injectLocalStorage('k', 'initial');
      readonly isolated = injectLocalStorage('k', 'initial', { syncTabs: false });
    }

    const fixture = await render(Host);
    const { storage, isolated } = fixture.componentInstance;
    expect(storage.value()).toBe('stored');
    storage.set((prev) => `${prev}!`);
    expect(window.localStorage.getItem('k')).toBe('"stored!"');
    window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: '"other tab"' }));
    expect(storage.value()).toBe('other tab');
    expect(isolated.value()).toBe('stored');
    window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: '{bad' }));
    expect(storage.value()).toBe('other tab');
    window.dispatchEvent(new StorageEvent('storage', { key: 'x', newValue: '"no"' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: null }));
    expect(storage.value()).toBe('initial');
    storage.set('again');
    storage.remove();
    expect(storage.value()).toBe('initial');
    expect(window.localStorage.getItem('k')).toBeNull();
  });
});

describe('injectDarkMode', () => {
  it('starts from the system preference, persists choices and follows the system', async () => {
    const lists = installMatchMedia((query) => query.includes('dark'));

    @Component({ template: '' })
    class Host {
      readonly dark = injectDarkMode();
    }

    const fixture = await render(Host);
    const { dark } = fixture.componentInstance;
    expect(dark.mode()).toBe('system');
    expect(dark.resolved()).toBe('dark');
    lists.at(-1)!.fire(false);
    expect(dark.resolved()).toBe('light');
    dark.setMode('dark');
    await fixture.whenStable();
    expect(dark.resolved()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('pxlkit:dark-mode')).toBe('"dark"');
  });
});

describe('surface and locale', () => {
  it('resolve from the nearest provider, with the input winning', async () => {
    let surface!: () => string;
    let effective!: () => string;
    let locale!: ReturnType<typeof injectPxlKitLocale>;

    @Component({ selector: 'probe', template: '' })
    class Probe {
      constructor() {
        surface = injectPxlKitSurface();
        effective = injectEffectiveSurface(() => 'pixel');
        locale = injectPxlKitLocale();
      }
    }

    @Component({
      imports: [Probe, PxlKitSurfaceProvider, PxlKitLocaleProvider],
      template: '<ng-container pxlKitSurface="linear"><pxl-locale-provider locale="tr"><probe /></pxl-locale-provider></ng-container>',
    })
    class Host {}

    await render(Host);
    expect(surface()).toBe('linear');
    expect(effective()).toBe('pixel');
    expect(locale().upper('istanbul')).toBe('İSTANBUL');
  });

  it('take an application-wide surface and fall back to pixel / English', async () => {
    let surface!: () => string;
    let locale!: ReturnType<typeof injectPxlKitLocale>;

    @Component({ template: '' })
    class Host {
      constructor() {
        surface = injectPxlKitSurface();
        locale = injectPxlKitLocale();
      }
    }

    await render(Host);
    expect(surface()).toBe('pixel');
    expect(locale().locale).toBe('en');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), providePxlKitSurface('linear')] });
    await render(Host);
    expect(surface()).toBe('linear');
  });

  it('treats a bare pxlKitSurface attribute as the default', async () => {
    let surface!: () => string;

    @Component({ selector: 'probe', template: '' })
    class Probe {
      constructor() {
        surface = injectPxlKitSurface();
      }
    }

    @Component({ imports: [Probe, PxlKitSurfaceProvider], template: '<div pxlKitSurface><probe /></div>' })
    class Host {}

    await render(Host);
    expect(surface()).toBe('pixel');
  });
});

describe('PxlOutlet', () => {
  it('renders text, templates with context, and nothing', async () => {
    @Component({
      imports: [PxlOutlet],
      template: `
        <p id="out"><ng-container *pxlOutlet="content(); context: context(); let text">{{ text }}</ng-container></p>
        <ng-template #tpl let-name="name"><b>{{ name }}</b></ng-template>
      `,
    })
    class Host {
      readonly tpl = viewChild.required<TemplateRef<{ name: string }>>('tpl');
      readonly content = signal<PxlContent<{ name: string }> | null>('plain');
      readonly context = signal<{ name: string } | undefined>(undefined);
    }

    const fixture = await render(Host);
    const out = () => (document.getElementById('out') as HTMLElement).innerHTML.replace(/<!--[^>]*-->/g, '');
    expect(out()).toBe('plain');
    fixture.componentInstance.content.set('changed');
    await fixture.whenStable();
    expect(out()).toBe('changed');
    fixture.componentInstance.context.set({ name: 'Ada' });
    fixture.componentInstance.content.set(fixture.componentInstance.tpl());
    await fixture.whenStable();
    expect(out()).toBe('<b>Ada</b>');
    fixture.componentInstance.context.set({ name: 'Lin' });
    await fixture.whenStable();
    expect(out()).toBe('<b>Lin</b>');
    fixture.componentInstance.content.set('back to text');
    await fixture.whenStable();
    expect(out()).toBe('back to text');
    fixture.componentInstance.content.set(null);
    await fixture.whenStable();
    expect(out()).toBe('');
  });
});

describe('PixelGlyph', () => {
  // Regression: a caller's smaller size followed the glyph's own, and
  // Tailwind emits `h-3` after `h-2`, so the glyph kept its own size.
  it("replaces its size with the element's, from a class attribute or a binding", async () => {
    @Component({
      imports: [PixelGlyph],
      template: `
        <svg id="fixed" pxlGlyph="close" class="h-2 w-2"></svg>
        <svg id="bound" pxlGlyph="check" [class]="classes()"></svg>
      `,
    })
    class Host {
      readonly classes = signal('h-2 w-2');
    }
    const fixture = await render(Host);
    const classesOf = (id: string) => Array.from(document.getElementById(id)!.classList).sort();
    expect(classesOf('fixed')).toEqual(['h-2', 'shrink-0', 'w-2']);
    expect(classesOf('bound')).toEqual(['h-2', 'shrink-0', 'w-2']);
    fixture.componentInstance.classes.set('text-retro-green');
    await fixture.whenStable();
    expect(classesOf('bound')).toEqual(['h-3', 'shrink-0', 'text-retro-green', 'w-3']);
  });
});

describe('PixelFieldShell', () => {
  it("renders the DOM of the React kit's FieldShell", async () => {
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
    @Component({
      imports: [PixelFieldShell],
      template: `
        <pxl-field-shell
          [label]="field().label"
          [hint]="field().hint"
          [error]="field().error"
          [htmlFor]="field().htmlFor"
          [messageId]="field().messageId"
          [surface]="field().surface"
        >
          <input id="email" />
        </pxl-field-shell>
      `,
    })
    class Host {
      readonly field = signal(cases[0]!);
    }
    const fixture = await render(Host);
    for (const props of cases) {
      const react = await mountReact(() => createElement(ReactFieldShell, props, createElement('input', { id: 'email' })));
      const expected = canonicalDom(react.container);
      await react.unmount();
      fixture.componentInstance.field.set(props);
      await fixture.whenStable();
      expect(canonicalDom(fixture.nativeElement as HTMLElement, angularDomRules)).toBe(expected);
    }
  });

  it('gives the hint, or the error replacing it, the message id', async () => {
    @Component({
      imports: [PixelFieldShell],
      template: `<pxl-field-shell [hint]="hint()" [error]="error()" [messageId]="messageId()" />`,
    })
    class Host {
      readonly hint = signal<string | undefined>('We never share it');
      readonly error = signal<string | undefined>(undefined);
      readonly messageId = signal<string | undefined>('email-msg');
    }
    const fixture = await render(Host);
    const root = fixture.nativeElement as HTMLElement;
    const message = () => root.querySelector('#email-msg')?.textContent;
    expect(message()).toBe('We never share it');
    fixture.componentInstance.error.set('Required');
    await fixture.whenStable();
    expect(message()).toBe('Required');
    fixture.componentInstance.hint.set(undefined);
    fixture.componentInstance.error.set(undefined);
    await fixture.whenStable();
    expect(message()).toBeUndefined();
    fixture.componentInstance.hint.set('We never share it');
    fixture.componentInstance.messageId.set(undefined);
    await fixture.whenStable();
    expect(root.querySelector('pxl-field-shell span')!.hasAttribute('id')).toBe(false);
  });
});

describe('PixelPortal', () => {
  it('moves its content into a container once rendered, and back when disabled', async () => {
    const target = document.createElement('section');
    document.body.appendChild(target);

    @Component({
      imports: [PixelPortal],
      template: `<p id="anchor"><ng-template pxlPortal [pxlPortalContainer]="target" [pxlPortalDisabled]="inline()"><b>moved</b></ng-template></p>`,
    })
    class Host {
      readonly target = target;
      readonly inline = signal(false);
    }

    const fixture = await render(Host);
    expect(target.innerHTML).toBe('<b>moved</b>');
    fixture.componentInstance.inline.set(true);
    await fixture.whenStable();
    expect(target.innerHTML).toBe('');
    expect(document.getElementById('anchor')!.innerHTML).toContain('<b>moved</b>');
    fixture.destroy();
    expect(document.body.innerHTML).not.toContain('moved');
  });

  it('keeps focus on an element focused inside it before the move', async () => {
    // Focused while still in place — as a modal's focus trap does on open.
    @Directive({ selector: '[focusOnInit]' })
    class FocusOnInit {
      constructor() {
        const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        afterNextRender(() => element.focus());
      }
    }

    @Component({
      imports: [PixelPortal, FocusOnInit],
      template: `<div *pxlPortal><button type="button" focusOnInit>inside</button></div>`,
    })
    class Host {}

    const fixture = await render(Host);
    const button = document.body.querySelector('button')!;
    expect(button.parentElement!.parentElement).toBe(document.body);
    expect(document.activeElement).toBe(button);
    fixture.destroy();
  });
});

describe('ids', () => {
  it('are unique per application and carry its id', () => {
    const generator = TestBed.inject(PxlIdGenerator);
    const [a, b] = [generator.id(), generator.id()];
    expect(a).not.toBe(b);
    expect(a).toMatch(/^pxl-.+-\d+$/);
    expect(TestBed.runInInjectionContext(() => injectId())).toMatch(/^pxl-/);
  });
});
