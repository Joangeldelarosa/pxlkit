/**
 * <pxl-navigation-menu> beyond the parity examples: item handlers, a link
 * with a panel, content templates that receive their item, and the landmark.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '../../public-api';

const key = (element: Element, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

describe('PixelNavigationMenu', () => {
  it('runs onSelect on click and on Enter or Space, except Enter on a link, which the browser follows', async () => {
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
    const [button, link] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="menuitem"]'));
    button!.click();
    key(button!, ' ');
    link!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    key(link!, 'Enter');
    expect(onButton).toHaveBeenCalledTimes(2);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('toggles the panel of a link with content, which receives its item, instead of following it', async () => {
    @Component({
      imports: [PixelNavigationMenu],
      template: `
        <pxl-navigation-menu [viewport]="false" [items]="[{ label: 'Docs', href: '#docs', content: panel }]" />
        <ng-template #panel let-item><p>{{ item.label }} guides</p></ng-template>
      `,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    root.querySelector('a')!.dispatchEvent(click);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(root.querySelector('li [role="menu"]')!.textContent!.trim()).toBe('Docs guides');
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
