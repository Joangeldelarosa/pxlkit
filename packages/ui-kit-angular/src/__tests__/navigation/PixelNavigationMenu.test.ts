/**
 * <pxl-navigation-menu> beyond the parity examples: item handlers, an item
 * with both an href and a panel, content templates that receive their item,
 * a tap on a touch screen, and the landmark.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '../../public-api';

const key = (element: Element, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

/**
 * A tap on a touch screen: the touch pointer's events, then the
 * compatibility mouse events and focus, and the click last.
 */
function tap(element: HTMLElement) {
  for (const type of ['pointerover', 'pointerenter', 'pointerdown', 'pointerup', 'pointerout', 'pointerleave']) {
    element.dispatchEvent(new PointerEvent(type, { bubbles: !type.endsWith('enter') && !type.endsWith('leave'), pointerType: 'touch' }));
  }
  for (const type of ['mouseover', 'mouseenter', 'mousemove', 'mousedown']) {
    element.dispatchEvent(new MouseEvent(type, { bubbles: type !== 'mouseenter' }));
  }
  element.focus();
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  element.click();
}

@Component({
  imports: [PixelNavigationMenu],
  template: `
    <pxl-navigation-menu [viewport]="false" [items]="[{ label: 'Docs', href: '#docs', content: panel }]" />
    <ng-template #panel let-item><p>{{ item.label }} guides</p></ng-template>
  `,
})
class DocsMenu {}

describe('PixelNavigationMenu', () => {
  it('runs onSelect on click, and leaves Enter and Space to the browser, which clicks', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    @Component({
      imports: [PixelNavigationMenu],
      template: '<pxl-navigation-menu [items]="items" />',
    })
    class Host {
      readonly items: PixelNavigationMenuItem[] = [
        { label: 'Act', onSelect: onButton },
        { label: 'Go', href: '#go', onSelect: onLink },
      ];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('button')!;
    button.click();
    key(button, 'Enter');
    key(button, ' ');
    root.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onButton).toHaveBeenCalledTimes(1);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('makes an item with an href and content a button that toggles its panel, which receives its item', async () => {
    const fixture = TestBed.createComponent(DocsMenu);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('a')).toBeNull();
    const button = root.querySelector('button')!;
    button.click();
    await fixture.whenStable();
    expect(root.querySelector(`[id="${button.getAttribute('aria-controls')}"]`)!.textContent!.trim()).toBe('Docs guides');
    button.click();
    await fixture.whenStable();
    expect(root.querySelector('li > div')).toBeNull();
  });

  // A tap fires the pointer, mouse and focus events of a hover before its
  // click: only the click may open the panel, or the click closes it again.
  it('opens a panel on a tap, and keeps it open', async () => {
    const fixture = TestBed.createComponent(DocsMenu);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('button')!;
    tap(button);
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('li > div')!.textContent!.trim()).toBe('Docs guides');
    tap(button);
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens nothing for a pen pointing at an item', async () => {
    const fixture = TestBed.createComponent(DocsMenu);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('button')!.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'pen' }));
    await fixture.whenStable();
    expect(root.querySelector('li > div')).toBeNull();
  });

  it('is a navigation landmark named by ariaLabel', async () => {
    @Component({
      imports: [PixelNavigationMenu],
      template: `<pxl-navigation-menu [items]="[{ label: 'Home', href: '/' }]" ariaLabel="Footer" />`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('pxl-navigation-menu')!;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Footer');
  });
});
