import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { PixelToast, type PixelToastPosition, type PxlKitData } from '@pxlkit/angular';
import { decodeSvg } from './harness';
import { testIcon } from './fixtures';

@Component({
  imports: [PixelToast],
  template: `<pxl-toast
    [visible]="visible()"
    [title]="title()"
    [message]="message()"
    [icon]="icon()"
    [colorfulIcon]="colorfulIcon()"
    [iconSize]="iconSize()"
    [bgColor]="bgColor()"
    [borderColor]="borderColor()"
    [textColor]="textColor()"
    [accentColor]="accentColor()"
    [position]="position()"
    [duration]="duration()"
    [showClose]="showClose()"
    (closed)="closes = closes + 1"
  />`,
})
class ToastHost {
  readonly visible = signal(true);
  readonly title = signal('Saved!');
  readonly message = signal<string | undefined>(undefined);
  readonly icon = signal<PxlKitData | undefined>(undefined);
  readonly colorfulIcon = signal<boolean | undefined>(undefined);
  readonly iconSize = signal<number | undefined>(undefined);
  readonly bgColor = signal<string | undefined>(undefined);
  readonly borderColor = signal<string | undefined>(undefined);
  readonly textColor = signal<string | undefined>(undefined);
  readonly accentColor = signal<string | undefined>(undefined);
  readonly position = signal<PixelToastPosition | undefined>(undefined);
  readonly duration = signal<number | undefined>(undefined);
  readonly showClose = signal<boolean | undefined>(undefined);
  closes = 0;
}

@Component({
  imports: [PixelToast],
  template: `<pxl-toast visible title="Hi" duration="0" showClose="false" class="mt-12" />`,
})
class AttributeHost {}

interface Rendered {
  fixture: ComponentFixture<ToastHost>;
  host: HTMLElement;
  /** Times the toast asked to be closed. */
  closes(): number;
  sync(): void;
}

/** Class names of `element`, sorted — Angular applies a class string name by name. */
const classesOf = (element: Element) => Array.from(element.classList).sort();
const sorted = (classes: string) => classes.split(' ').sort();

function render(setup: (host: ToastHost) => void = () => {}): Rendered {
  const fixture = TestBed.createComponent(ToastHost);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.nativeElement.querySelector('pxl-toast') as HTMLElement,
    closes: () => fixture.componentInstance.closes,
    sync: () => fixture.detectChanges(),
  };
}

describe('PixelToast (Angular)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing while hidden', () => {
    const { host } = render((h) => h.visible.set(false));
    expect(host.childElementCount).toBe(0);
    expect(classesOf(host)).toEqual([]);
    expect(host.style.display).toBe('none');
  });

  it('renders the title and optional message', () => {
    const toast = render((h) => h.message.set('This is a message'));
    expect(toast.host.textContent).toContain('Saved!');
    expect(toast.host.textContent).toContain('This is a message');
    expect(render().host.querySelectorAll('p')).toHaveLength(1);
  });

  it('shows the icon, or an accent dot without one', () => {
    expect(render((h) => h.icon.set(testIcon)).host.querySelector('img')).not.toBeNull();
    const dotted = render((h) => h.accentColor.set('#123456'));
    expect(dotted.host.querySelector('img')).toBeNull();
    const dot = dotted.host.querySelector('.rounded-full') as HTMLElement;
    expect(dot.style.boxShadow).toBe('0 0 8px #123456');
  });

  it('renders the icon flat in the accent colour when colorfulIcon is false', () => {
    const img = render((h) => {
      h.icon.set(testIcon);
      h.colorfulIcon.set(false);
      h.accentColor.set('#FF00FF');
      h.iconSize.set(40);
    }).host.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('40');
    expect(img.getAttribute('alt')).toBe('test-icon');
    const svg = decodeSvg(img);
    expect(svg).toContain('fill="#FF00FF"');
    expect(svg).not.toContain('fill="#FF0000"');
  });

  it('pins every corner and keeps consumer classes on the host', () => {
    for (const [position, expected] of [
      ['top-left', 'top-4 left-4'],
      ['top-right', 'top-4 right-4'],
      ['bottom-left', 'bottom-4 left-4'],
      ['bottom-right', 'bottom-4 right-4'],
    ] as const) {
      expect(classesOf(render((h) => h.position.set(position)).host)).toEqual(sorted(`fixed z-[80] ${expected}`));
    }
    const fixture = TestBed.createComponent(AttributeHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('pxl-toast') as HTMLElement;
    expect(classesOf(host)).toEqual(sorted('fixed z-[80] top-4 right-4 mt-12'));
  });

  it('colours the box from its inputs', () => {
    const box = render((h) => {
      h.bgColor.set('#000000');
      h.borderColor.set('#111111');
      h.textColor.set('#222222');
    }).host.firstElementChild as HTMLElement;
    expect(box.style.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(box.style.color).toBe('rgb(34, 34, 34)');
    expect(box.style.boxShadow).toContain('#11111155');
  });

  it('has an accessible close button that emits closed', () => {
    const toast = render();
    const button = toast.host.querySelector('button[aria-label="Close toast"]') as HTMLButtonElement;
    expect(button.getAttribute('type')).toBe('button');
    button.click();
    expect(toast.closes()).toBe(1);
    expect(render((h) => h.showClose.set(false)).host.querySelector('button')).toBeNull();
  });

  it('accepts attribute values', () => {
    const fixture = TestBed.createComponent(AttributeHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('pxl-toast') as HTMLElement;
    expect(host.textContent).toContain('Hi');
    expect(host.hasAttribute('title')).toBe(false); // no native tooltip on the toast
    expect(host.querySelector('button')).toBeNull();
    vi.advanceTimersByTime(60_000);
    expect(vi.getTimerCount()).toBe(0); // duration="0": never auto-closes
  });

  it('asks to close itself after duration ms', () => {
    const toast = render((h) => h.duration.set(3000));
    vi.advanceTimersByTime(2999);
    expect(toast.closes()).toBe(0);
    vi.advanceTimersByTime(1);
    expect(toast.closes()).toBe(1);
  });

  it('uses the default 2200 ms duration and never auto-closes with duration 0', () => {
    const byDefault = render();
    vi.advanceTimersByTime(2200);
    expect(byDefault.closes()).toBe(1);
    const sticky = render((h) => h.duration.set(0));
    vi.advanceTimersByTime(10_000);
    expect(sticky.closes()).toBe(0);
  });

  it('re-arms the timer when it becomes visible again, and cancels it when destroyed', () => {
    const toast = render((h) => {
      h.visible.set(false);
      h.duration.set(1000);
    });
    vi.advanceTimersByTime(5000);
    expect(toast.closes()).toBe(0);

    toast.fixture.componentInstance.visible.set(true);
    toast.sync();
    vi.advanceTimersByTime(999);
    expect(toast.closes()).toBe(0);
    vi.advanceTimersByTime(1);
    expect(toast.closes()).toBe(1);

    toast.fixture.componentInstance.visible.set(false);
    toast.sync();
    toast.fixture.componentInstance.visible.set(true);
    toast.sync();
    toast.fixture.destroy();
    vi.advanceTimersByTime(5000);
    expect(toast.closes()).toBe(1);
  });

  it('restarts the countdown when the duration changes', () => {
    const toast = render((h) => h.duration.set(1000));
    vi.advanceTimersByTime(800);
    toast.fixture.componentInstance.duration.set(500);
    toast.sync();
    vi.advanceTimersByTime(499);
    expect(toast.closes()).toBe(0);
    vi.advanceTimersByTime(1);
    expect(toast.closes()).toBe(1);
  });

  it('falls back to the defaults for inputs bound to undefined', () => {
    const toast = render((h) => {
      h.position.set('bottom-left');
      h.showClose.set(false);
      h.bgColor.set('#000000');
    });
    toast.fixture.componentInstance.position.set(undefined);
    toast.fixture.componentInstance.showClose.set(undefined);
    toast.fixture.componentInstance.bgColor.set(undefined);
    toast.sync();
    expect(classesOf(toast.host)).toEqual(sorted('fixed z-[80] top-4 right-4'));
    expect(toast.host.querySelector('button')).not.toBeNull();
    expect((toast.host.firstElementChild as HTMLElement).style.backgroundColor).toBe('rgb(18, 18, 26)');
  });
});
