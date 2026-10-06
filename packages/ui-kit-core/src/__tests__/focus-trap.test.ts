import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFocusableElements, trapFocus } from '../index';

function mount(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

function tab(shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
  (document.activeElement ?? document.body).dispatchEvent(event);
  return event;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('getFocusableElements', () => {
  it('lists tabbable descendants in document order', () => {
    const root = mount(`
      <button id="a">a</button>
      <a id="b" href="#x">b</a>
      <input id="c" />
      <input type="hidden" />
      <button disabled>disabled</button>
      <div tabindex="-1">skipped</div>
      <div id="d" tabindex="0">d</div>
      <textarea id="e"></textarea>
      <select id="f"></select>
    `);
    expect(getFocusableElements(root).map((el) => el.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('skips hidden and aria-hidden elements', () => {
    const root = mount(`
      <button id="visible">v</button>
      <button hidden>h</button>
      <button aria-hidden="true">ah</button>
      <div aria-hidden="true"><button>nested</button></div>
      <button style="display: none">d</button>
      <button style="visibility: hidden">v</button>
    `);
    expect(getFocusableElements(root).map((el) => el.id)).toEqual(['visible']);
  });
});

describe('trapFocus', () => {
  it('focuses the first focusable element on activation', () => {
    const root = mount('<button id="first">1</button><button id="last">2</button>');
    const release = trapFocus(() => root);
    expect(document.activeElement?.id).toBe('first');
    release();
  });

  it('cycles Tab from the last element to the first and Shift+Tab back', () => {
    const root = mount('<button id="first">1</button><button id="last">2</button>');
    const release = trapFocus(() => root);
    (root.querySelector('#last') as HTMLElement).focus();
    expect(tab().defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('first');
    expect(tab(true).defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('last');
    release();
  });

  it('lets Tab move between inner elements natively', () => {
    const root = mount('<button id="first">1</button><button id="mid">2</button><button id="last">3</button>');
    const release = trapFocus(() => root);
    expect(tab().defaultPrevented).toBe(false);
    (root.querySelector('#mid') as HTMLElement).focus();
    expect(tab(true).defaultPrevented).toBe(false);
    release();
  });

  it('pulls focus back in when it escaped the container', () => {
    const outside = mount('<button id="outside">out</button>');
    const root = mount('<button id="first">1</button><button id="last">2</button>');
    const release = trapFocus(() => root);
    (outside.querySelector('#outside') as HTMLElement).focus();
    tab();
    expect(document.activeElement?.id).toBe('first');
    (outside.querySelector('#outside') as HTMLElement).focus();
    tab(true);
    expect(document.activeElement?.id).toBe('last');
    release();
  });

  it('redirects Tab from a non-tabbable element inside the container', () => {
    const root = mount('<span id="text" tabindex="-1">t</span><button id="first">1</button><button id="last">2</button>');
    const release = trapFocus(() => root);
    (root.querySelector('#text') as HTMLElement).focus();
    tab();
    expect(document.activeElement?.id).toBe('first');
    (root.querySelector('#text') as HTMLElement).focus();
    tab(true);
    expect(document.activeElement?.id).toBe('last');
    release();
  });

  it('focuses a container without focusable content and keeps Tab inside', () => {
    const root = mount('<p>Nothing to focus</p>');
    const release = trapFocus(() => root);
    expect(document.activeElement).toBe(root);
    expect(root.getAttribute('tabindex')).toBe('-1');
    expect(tab().defaultPrevented).toBe(true);
    release();
    expect(root.hasAttribute('tabindex')).toBe(false);
  });

  it('keeps a tabindex the container already had', () => {
    const root = mount('<p>Nothing to focus</p>');
    root.setAttribute('tabindex', '-1');
    const release = trapFocus(() => root);
    release();
    expect(root.getAttribute('tabindex')).toBe('-1');
  });

  it('ignores other keys and a missing container', () => {
    let container: HTMLElement | null = mount('<button id="only">1</button>');
    const release = trapFocus(() => container);
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);
    container = null;
    expect(tab().defaultPrevented).toBe(false);
    release();
  });

  it('restores focus to the previously focused element on release', () => {
    const opener = mount('<button id="opener">open</button>').querySelector('button')!;
    opener.focus();
    const root = mount('<button id="inside">1</button>');
    const release = trapFocus(() => root);
    expect(document.activeElement?.id).toBe('inside');
    release();
    expect(document.activeElement).toBe(opener);
  });

  it('falls back to body when the previous element is gone', () => {
    const opener = mount('<button id="opener">open</button>').querySelector('button')!;
    opener.focus();
    const root = mount('<button id="inside">1</button>');
    const release = trapFocus(() => root);
    opener.remove();
    const focusBody = vi.spyOn(document.body, 'focus');
    release();
    expect(focusBody).toHaveBeenCalledTimes(1);
  });

  it('stops trapping after release, and releasing twice is harmless', () => {
    const root = mount('<button id="first">1</button><button id="last">2</button>');
    const release = trapFocus(() => root);
    release();
    release();
    (root.querySelector('#last') as HTMLElement).focus();
    expect(tab().defaultPrevented).toBe(false);
  });

  it('activates without a container', () => {
    const release = trapFocus(() => null);
    release();
    expect(document.activeElement).toBe(document.body);
  });

  it('does not restore focus to an element that became disabled', () => {
    const opener = mount('<button id="opener">open</button>').querySelector('button')!;
    opener.focus();
    const root = mount('<button id="inside">1</button>');
    const release = trapFocus(() => root);
    opener.disabled = true;
    const focusBody = vi.spyOn(document.body, 'focus');
    release();
    expect(focusBody).toHaveBeenCalledTimes(1);
  });
});
