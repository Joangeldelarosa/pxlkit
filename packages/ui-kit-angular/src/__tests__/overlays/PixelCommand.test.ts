/**
 * <pxl-command>: [(open)] and its shortcut, commands run by keyboard and
 * pointer, icon templates and a changing list of groups. Rendering and the
 * shared interactions are covered against React by the parity suite.
 */
import { Component, TemplateRef, signal, viewChild, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelCommand, type PixelCommandGroup } from '../../public-api';

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const field = () => document.querySelector<HTMLInputElement>('[role="combobox"]')!;
const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const key = (key: string, init: KeyboardEventInit = {}, target: EventTarget = window) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

function groupsOf(onSelect: (id: string) => void, ids = ['alpha', 'beta', 'gamma']): PixelCommandGroup[] {
  return [{ heading: 'Commands', items: ids.map((id) => ({ id, label: id, onSelect: () => onSelect(id) })) }];
}

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((done) => setTimeout(done, 0));
    await fixture.whenStable();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, settle };
}

describe('PixelCommand', () => {
  it('shows what its parent binds: its shortcut, Escape and the backdrop only ask, and it asks again after a refusal', async () => {
    @Component({
      imports: [PixelCommand],
      template: `<pxl-command [open]="open()" [groups]="groups" (openChange)="ask($event)" />`,
    })
    class Host {
      readonly open = signal(false);
      readonly groups = groupsOf(() => {});
      readonly requests: boolean[] = [];
      accept = false;
      ask(open: boolean): void {
        this.requests.push(open);
        if (this.accept) this.open.set(open);
      }
    }
    const { fixture, host, settle } = await render(Host);
    key('k', { ctrlKey: true });
    await settle();
    key('k', { ctrlKey: true });
    await settle();
    expect(host.requests).toEqual([true, true]);
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).toBe('');
    host.accept = true;
    key('k', { ctrlKey: true });
    await settle();
    expect(dialog()).not.toBeNull();
    expect(document.activeElement).toBe(field());
    host.accept = false;
    key('Escape');
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(host.requests).toEqual([true, true, true, false, false]);
    expect(dialog()).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
  });

  it('toggles an [(open)] binding with its shortcut, focusing the search field, and closes on Escape and the backdrop', async () => {
    @Component({
      imports: [PixelCommand],
      template: `<pxl-command [(open)]="open" [groups]="groups" />`,
    })
    class Host {
      readonly open = signal(false);
      readonly groups = groupsOf(() => {});
    }
    const { fixture, host, settle } = await render(Host);
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(event);
    await settle();
    expect(event.defaultPrevented).toBe(true);
    expect(host.open()).toBe(true);
    expect(document.activeElement).toBe(field());
    key('K', { metaKey: true });
    await settle();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
    host.open.set(true);
    await settle();
    key('Escape');
    await settle();
    expect(host.open()).toBe(false);
    host.open.set(true);
    await settle();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(host.open()).toBe(false);
    fixture.destroy();
  });

  it('listens to its own shortcut, and to none when it is empty', async () => {
    @Component({
      imports: [PixelCommand],
      template: `<pxl-command [(open)]="open" [shortcut]="shortcut()" [groups]="groups" />`,
    })
    class Host {
      readonly open = signal(false);
      readonly shortcut = signal('alt+/');
      readonly groups = groupsOf(() => {});
    }
    const { fixture, host, settle } = await render(Host);
    key('k', { ctrlKey: true });
    await settle();
    expect(host.open()).toBe(false);
    key('/', { altKey: true });
    await settle();
    expect(host.open()).toBe(true);
    host.open.set(false);
    host.shortcut.set('');
    await settle();
    key('k', { ctrlKey: true });
    await settle();
    expect(host.open()).toBe(false);
    fixture.destroy();
  });

  it('runs the highlighted command on Enter and a clicked one, without closing by itself', async () => {
    @Component({
      imports: [PixelCommand],
      template: `<pxl-command [(open)]="open" [groups]="groups" />`,
    })
    class Host {
      readonly open = signal(true);
      readonly selected: string[] = [];
      readonly groups = groupsOf((id) => this.selected.push(id));
    }
    const { fixture, host, settle } = await render(Host);
    key('ArrowDown', {}, field());
    key('Enter', {}, field());
    await settle();
    options()[2]!.click();
    await settle();
    expect(host.selected).toEqual(['beta', 'gamma']);
    expect(host.open()).toBe(true);
    fixture.destroy();
  });

  it('keeps the highlight on a listed command when the groups shrink', async () => {
    @Component({
      imports: [PixelCommand],
      template: `<pxl-command [open]="true" [groups]="groups()" />`,
    })
    class Host {
      readonly groups = signal(groupsOf(() => {}));
    }
    const { fixture, host, settle } = await render(Host);
    key('End', {}, field());
    await settle();
    expect(options()[2]!.getAttribute('aria-selected')).toBe('true');
    host.groups.set(groupsOf(() => {}, ['alpha', 'beta']));
    await settle();
    expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
    expect(field().getAttribute('aria-activedescendant')).toBe(options()[1]!.id);
    host.groups.set([]);
    await settle();
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(field().hasAttribute('aria-activedescendant')).toBe(false);
    fixture.destroy();
  });

  it('renders command icons from text or a template that receives the command', async () => {
    @Component({
      imports: [PixelCommand],
      template: `
        <pxl-command [open]="true" [groups]="groups()" />
        <ng-template #icon let-item><b>{{ item.label }}</b></ng-template>
      `,
    })
    class Host {
      readonly icon = viewChild.required<TemplateRef<unknown>>('icon');
      readonly groups = signal<PixelCommandGroup[]>([]);
    }
    const { fixture, host, settle } = await render(Host);
    host.groups.set([
      {
        heading: 'Icons',
        items: [
          { id: 'text', label: 'Text', icon: '★', onSelect: () => {} },
          { id: 'template', label: 'Template', icon: host.icon(), onSelect: () => {} },
          { id: 'none', label: 'None', onSelect: () => {} },
        ],
      },
    ]);
    await settle();
    const icons = options().map((option) => option.querySelector('span.shrink-0'));
    expect(icons[0]!.textContent!.trim()).toBe('★');
    expect(icons[1]!.querySelector('b')!.textContent).toBe('Template');
    expect(icons[2]).toBeNull();
    fixture.destroy();
  });
});
