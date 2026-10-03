/**
 * PixelFileUpload: two-way binding, Angular forms, dropping and choosing
 * files (which the parity scenarios cannot drive: jsdom has no DataTransfer),
 * rejections, image previews and the item template.
 */
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileUploadRejection } from '@pxlkit/ui-kit-core';
import { reactExamples } from '../../../../../scripts/parity/catalog';
import { canonicalPage } from '../../../../../scripts/parity/canonical';
import { mountReact, type Mounted } from '../../../../../scripts/parity/react';
import { PixelFileUpload } from '../../public-api';
import { mountAngular } from '../angular';
import { angularDomRules } from '../dom-rules';
import { angularExamples } from '../examples';

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

function stubObjectUrls() {
  const create = vi.fn((made: Blob) => `blob:${(made as File).name}`);
  const revoke = vi.fn();
  Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
  return { create, revoke };
}

afterEach(() => {
  Reflect.deleteProperty(URL, 'createObjectURL');
  Reflect.deleteProperty(URL, 'revokeObjectURL');
  vi.restoreAllMocks();
});

describe('PixelFileUpload', () => {
  it('follows two-way bound files, reporting turned-down files before the change', async () => {
    @Component({
      imports: [PixelFileUpload],
      template: `
        <pxl-file-upload multiple accept="image/*" [maxFiles]="2" [(value)]="files" (reject)="rejected.push($event)" />
      `,
    })
    class Host {
      readonly files = signal<File[]>([]);
      readonly rejected: FileUploadRejection[][] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const pdf = file('doc.pdf', 10, 'application/pdf');
    const pictures = [file('a.png', 10, 'image/png'), file('b.png', 2048, 'image/png'), file('c.png', 10, 'image/png')];
    dropzoneOf(root).dispatchEvent(drag('drop', [pdf, ...pictures]));
    await fixture.whenStable();
    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['a.png', 'b.png']);
    expect(fixture.componentInstance.rejected).toEqual([
      [
        { file: pdf, reasons: ['accept'] },
        { file: pictures[2], reasons: ['maxFiles'] },
      ],
    ]);
    expect(namesOf(root)).toEqual(['a.png', 'b.png']);
    expect(root.textContent).toContain('2.0 KB');
    root.querySelector<HTMLButtonElement>('[aria-label="Remove a.png"]')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.files().map((f) => f.name)).toEqual(['b.png']);
    fixture.componentInstance.files.set([]);
    await fixture.whenStable();
    expect(root.querySelector('ul')).toBeNull();
  });

  it('works with a reactive form control, including disabling and touched', async () => {
    @Component({
      imports: [PixelFileUpload, ReactiveFormsModule],
      template: '<pxl-file-upload [dropzone]="false" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl<File[]>([]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const { control } = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector<HTMLInputElement>('input[type="file"]')!;
    choose(input, [file('a.txt', 1), file('b.txt', 1)]);
    await fixture.whenStable();
    // Without multiple, the last file chosen replaces the others.
    expect(control.value!.map((f) => f.name)).toEqual(['b.txt']);
    expect(input.value).toBe('');
    root.querySelector('button')!.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(control.touched).toBe(true);
    control.setValue([file('c.txt', 1)]);
    await fixture.whenStable();
    expect(namesOf(root)).toEqual(['c.txt']);

    control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('[aria-label="Remove c.txt"]')!.disabled).toBe(true);
    choose(input, [file('d.txt', 1)]);
    expect(control.value!.map((f) => f.name)).toEqual(['c.txt']);
  });

  it('opens the picker from the dropzone by a click, Enter or Space, and lights up while files are dragged over', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    @Component({
      imports: [PixelFileUpload],
      template: '<pxl-file-upload [disabled]="disabled()" />',
    })
    class Host {
      readonly disabled = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const dropzone = dropzoneOf(fixture.nativeElement);
    dropzone.click();
    for (const key of ['Enter', ' ', 'a']) dropzone.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    expect(click).toHaveBeenCalledTimes(3);
    const over = drag('dragover');
    dropzone.dispatchEvent(over);
    await fixture.whenStable();
    expect(over.defaultPrevented).toBe(true);
    expect(dropzone.textContent).toContain('Drop to upload');
    dropzone.dispatchEvent(drag('dragleave'));
    await fixture.whenStable();
    expect(dropzone.textContent).toContain('Drop files or click to browse');

    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    dropzone.click();
    dropzone.dispatchEvent(drag('dragenter'));
    await fixture.whenStable();
    expect(click).toHaveBeenCalledTimes(3);
    expect(dropzone.textContent).toContain('Drop files or click to browse');
    expect([dropzone.getAttribute('tabindex'), dropzone.getAttribute('aria-disabled')]).toEqual(['-1', 'true']);
  });

  it('describes the dropzone with the hint or error, and keeps its inputs off the host', async () => {
    @Component({
      imports: [PixelFileUpload],
      template: '<pxl-file-upload id="docs" name="docs" label="Files" [hint]="hint()" [error]="error()" multiple />',
    })
    class Host {
      readonly hint = signal<string | undefined>('PDF only');
      readonly error = signal<string | undefined>(undefined);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const host = root.querySelector('pxl-file-upload')!;
    expect(['id', 'name', 'multiple'].filter((name) => host.hasAttribute(name))).toEqual([]);
    expect(dropzoneOf(root).getAttribute('aria-describedby')).toBe('docs-msg');
    expect(root.querySelector('#docs-msg')!.textContent).toBe('PDF only');
    expect(root.querySelector('label')!.getAttribute('for')).toBe('docs');
    expect(root.querySelector<HTMLElement>('[data-pxl-name]')!.dataset['pxlName']).toBe('docs');
    fixture.componentInstance.error.set('Required');
    await fixture.whenStable();
    expect(root.querySelector('#docs-msg')!.textContent).toBe('Required');
    expect(dropzoneOf(root).classList).toContain('border-retro-red/60');
    fixture.componentInstance.hint.set(undefined);
    fixture.componentInstance.error.set(undefined);
    await fixture.whenStable();
    expect(dropzoneOf(root).hasAttribute('aria-describedby')).toBe(false);
  });

  it('previews images with object URLs it revokes as they go', async () => {
    const { create, revoke } = stubObjectUrls();
    @Component({
      imports: [PixelFileUpload],
      template: '<pxl-file-upload multiple [defaultValue]="files" />',
    })
    class Host {
      readonly files = [file('shot.png', 10, 'image/png'), file('notes.txt', 10)];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const image = root.querySelector('img')!;
    expect([image.getAttribute('src'), image.alt]).toEqual(['blob:shot.png', 'shot.png']);
    expect(create).toHaveBeenCalledTimes(1);
    root.querySelector<HTMLButtonElement>('[aria-label="Remove shot.png"]')!.click();
    await fixture.whenStable();
    expect(revoke).toHaveBeenCalledWith('blob:shot.png');
    expect(root.querySelector('img')).toBeNull();
  });

  it('renders each file through the item template, which can remove it', async () => {
    @Component({
      imports: [PixelFileUpload],
      template: `
        <pxl-file-upload multiple [defaultValue]="files" [item]="row" />
        <ng-template #row let-file let-remove="remove"><button class="mine" (click)="remove()">{{ file.name }}</button></ng-template>
      `,
    })
    class Host {
      readonly files = [file('a.txt', 1), file('b.txt', 1)];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const items = () => Array.from(root.querySelectorAll('[data-pxl-file-item]'));
    expect(items().map((item) => [item.className, item.querySelector('button.mine')!.textContent])).toEqual([
      ['', 'a.txt'],
      ['', 'b.txt'],
    ]);
    items()[0]!.querySelector('button')!.click();
    await fixture.whenStable();
    expect(items().map((item) => item.textContent!.trim())).toEqual(['b.txt']);
  });

  it('renders what React renders as files are dragged in, dropped and removed', async () => {
    stubObjectUrls();
    const reference = reactExamples().find((e) => e.component === 'PixelFileUpload' && e.exportName === 'Default')!;
    const files = [file('shot.png', 2048, 'image/png'), file('notes.pdf', 5 * 1024 * 1024 + 1, 'application/pdf'), file('art.jpg', 10, 'image/jpeg')];
    const steps = async ({ container, flush }: Mounted, rules = {}) => {
      const snapshots: string[] = [];
      const snapshot = async () => {
        await flush();
        snapshots.push(canonicalPage(document, { ...rules, unwrap: (element) => element.hasAttribute('data-parity-root') }));
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
    const angular = await mountAngular(await angularExamples.get('PixelFileUpload/Default')!.load());
    const actual = await steps(angular, angularDomRules);
    await angular.unmount();
    expect(actual).toEqual(expected);
  });
});
