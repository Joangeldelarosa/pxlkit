import { afterEach, describe, expect, it, vi } from 'vitest';
import { preserveFocus, returnFocusOnRemoval } from '../index';

function setup() {
  document.body.innerHTML = `
    <button id="trigger">open</button>
    <div id="content"><input id="field" /></div>
    <button id="elsewhere">elsewhere</button>
  `;
  const byId = (id: string) => document.getElementById(id)!;
  return { trigger: byId('trigger'), content: byId('content'), field: byId('field'), elsewhere: byId('elsewhere') };
}

const settle = () => new Promise<void>((done) => queueMicrotask(done));

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('returnFocusOnRemoval', () => {
  it('moves focus to the trigger once focused content is removed', async () => {
    const { trigger, content, field } = setup();
    field.focus();
    returnFocusOnRemoval(content, () => trigger);
    content.remove();
    expect(document.activeElement).toBe(document.body);
    await settle();
    expect(document.activeElement).toBe(trigger);
  });

  it('leaves focus alone when the content does not hold it', async () => {
    const { trigger, content, elsewhere } = setup();
    elsewhere.focus();
    returnFocusOnRemoval(content, () => trigger);
    content.remove();
    await settle();
    expect(document.activeElement).toBe(elsewhere);
  });

  it('keeps focus in content that stays in the document', async () => {
    const { trigger, content, field } = setup();
    field.focus();
    returnFocusOnRemoval(content, () => trigger);
    await settle();
    expect(document.activeElement).toBe(field);
  });

  it('does not steal focus that moved elsewhere in the meantime', async () => {
    const { trigger, content, field, elsewhere } = setup();
    field.focus();
    returnFocusOnRemoval(content, () => trigger);
    content.remove();
    elsewhere.focus();
    await settle();
    expect(document.activeElement).toBe(elsewhere);
  });

  it('reads the trigger when the content is gone, skipping a detached or missing one', async () => {
    const { trigger, content, field } = setup();
    field.focus();
    let current: HTMLElement | null = trigger;
    returnFocusOnRemoval(content, () => current);
    content.remove();
    trigger.remove();
    await settle();
    expect(document.activeElement).toBe(document.body);

    const second = setup();
    second.field.focus();
    current = null;
    returnFocusOnRemoval(second.content, () => current);
    second.content.remove();
    await settle();
    expect(document.activeElement).toBe(document.body);
  });

  it('ignores missing content and works without a document', () => {
    const { trigger } = setup();
    expect(() => returnFocusOnRemoval(null, () => trigger)).not.toThrow();
    expect(() => returnFocusOnRemoval(undefined, () => trigger)).not.toThrow();
    vi.stubGlobal('document', undefined);
    expect(() => returnFocusOnRemoval({} as Element, () => trigger)).not.toThrow();
  });
});

describe('preserveFocus', () => {
  it('puts focus back on an element a DOM move dropped it from', () => {
    const { content, field } = setup();
    field.focus();
    const restore = preserveFocus();
    document.body.appendChild(content);
    expect(document.activeElement).toBe(document.body);
    restore();
    expect(document.activeElement).toBe(field);
  });

  it('leaves focus that is still in place, or that moved on, alone', () => {
    const { content, field, elsewhere } = setup();
    field.focus();
    const untouched = preserveFocus();
    untouched();
    expect(document.activeElement).toBe(field);

    const restore = preserveFocus();
    document.body.appendChild(content);
    elsewhere.focus();
    restore();
    expect(document.activeElement).toBe(elsewhere);
  });

  it('does nothing when nothing was focused, the element is gone, or there is no document', () => {
    const { content, field } = setup();
    (document.activeElement as HTMLElement | null)?.blur();
    preserveFocus()();
    expect(document.activeElement).toBe(document.body);

    field.focus();
    const restore = preserveFocus();
    content.remove();
    restore();
    expect(document.activeElement).toBe(document.body);

    vi.stubGlobal('document', undefined);
    expect(() => preserveFocus()()).not.toThrow();
  });
});
