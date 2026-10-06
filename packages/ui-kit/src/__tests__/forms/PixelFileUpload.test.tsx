import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { getFocusableElements } from '@pxlkit/ui-kit-core';
import { PixelFileUpload } from '../../forms/PixelFileUpload';

/* ──────────────────────────────────────────────────────────────────────────
   Helpers — File polyfill in jsdom is fine; we just need stable size.
   ────────────────────────────────────────────────────────────────────────── */

function mkFile(name: string, size: number, type = 'text/plain'): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

function getInput(container: HTMLElement): HTMLInputElement {
  // The visually-hidden file input mirror.
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

function getDropzone(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-pxl-dropzone="true"]') as HTMLElement;
}

function fireFilesOnInput(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
  fireEvent.change(input);
}

function fireDrop(zone: HTMLElement, files: File[]) {
  const dataTransfer = { files, items: files.map((f) => ({ kind: 'file', getAsFile: () => f })), types: ['Files'] };
  fireEvent.drop(zone, { dataTransfer });
}

describe('PixelFileUpload', () => {
  it('renders dropzone with hint', () => {
    const { container, getByText } = render(
      <PixelFileUpload hint="Up to 5MB" />,
    );
    expect(getDropzone(container)).toBeTruthy();
    expect(getByText('Up to 5MB')).toBeTruthy();
  });

  it('clicking dropzone triggers file input', () => {
    const { container } = render(<PixelFileUpload />);
    const input = getInput(container);
    const clickSpy = vi.spyOn(input, 'click');
    const zone = getDropzone(container);
    act(() => { fireEvent.click(zone); });
    expect(clickSpy).toHaveBeenCalled();
  });

  it('dropped files appear in list', () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <PixelFileUpload onChange={onChange} multiple />,
    );
    const zone = getDropzone(container);
    const files = [mkFile('a.txt', 100), mkFile('b.txt', 200)];
    act(() => { fireDrop(zone, files); });
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toHaveLength(2);
    expect(getByText('a.txt')).toBeTruthy();
    expect(getByText('b.txt')).toBeTruthy();
  });

  it('oversized file goes to onReject', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <PixelFileUpload onChange={onChange} onReject={onReject} maxSize={500} multiple />,
    );
    const input = getInput(container);
    const big = mkFile('big.txt', 1000);
    const ok = mkFile('ok.txt', 100);
    act(() => { fireFilesOnInput(input, [ok, big]); });
    expect(onReject).toHaveBeenCalled();
    const rejections = onReject.mock.calls[0][0];
    expect(rejections).toHaveLength(1);
    expect(rejections[0].file.name).toBe('big.txt');
    expect(rejections[0].reasons).toContain('size');
    // onChange got only the OK file
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.map((f: File) => f.name)).toEqual(['ok.txt']);
  });

  it('maxFiles cap drops extras to onReject', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <PixelFileUpload onChange={onChange} onReject={onReject} maxFiles={2} multiple />,
    );
    const input = getInput(container);
    const files = [mkFile('a.txt', 10), mkFile('b.txt', 10), mkFile('c.txt', 10)];
    act(() => { fireFilesOnInput(input, files); });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toHaveLength(2);
    expect(onReject).toHaveBeenCalled();
    const rejections = onReject.mock.calls[0][0];
    expect(rejections).toHaveLength(1);
    expect(rejections[0].file.name).toBe('c.txt');
    expect(rejections[0].reasons).toContain('maxFiles');
  });

  it('remove button on item removes from value', () => {
    const onChange = vi.fn();
    const a = mkFile('a.txt', 10);
    const b = mkFile('b.txt', 20);
    const { container, getAllByLabelText } = render(
      <PixelFileUpload value={[a, b]} onChange={onChange} multiple />,
    );
    // value is controlled; should render 2 items
    expect(container.querySelectorAll('[data-pxl-file-item="true"]')).toHaveLength(2);
    const removeButtons = getAllByLabelText(/remove/i);
    act(() => { fireEvent.click(removeButtons[0]); });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toHaveLength(1);
    expect(last[0].name).toBe('b.txt');
  });

  it('multiple=false replaces value with single file', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelFileUpload onChange={onChange} multiple={false} />,
    );
    const input = getInput(container);
    const a = mkFile('a.txt', 10);
    const b = mkFile('b.txt', 20);
    act(() => { fireFilesOnInput(input, [a]); });
    let last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toHaveLength(1);
    expect(last[0].name).toBe('a.txt');
    // Selecting another single file replaces, doesn't append.
    act(() => { fireFilesOnInput(input, [b]); });
    last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toHaveLength(1);
    expect(last[0].name).toBe('b.txt');
  });
});

describe('PixelFileUpload — single file-dialog activation (FieldShell label regression)', () => {
  it('one click on the dropzone triggers the hidden input exactly once', () => {
    // FieldShell used to wrap the whole field in a <label>; native label
    // activation forwarded the click to the contained file input ON TOP of
    // the dropzone's programmatic inputRef.click() — the OS file dialog
    // opened twice and the first selection was lost.
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    try {
      const { container } = render(<PixelFileUpload label="Attachments" />);
      const dropzone = container.querySelector('[data-pxl-dropzone="true"]') as HTMLElement;
      expect(dropzone).not.toBeNull();
      fireEvent.click(dropzone);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      clickSpy.mockRestore();
    }
  });

  it('the file input is not nested inside any <label> (structural pin)', () => {
    const { container } = render(<PixelFileUpload label="Attachments" />);
    const input = container.querySelector('input[type="file"]') as HTMLElement;
    expect(input).not.toBeNull();
    expect(input.closest('label')).toBeNull();
  });
});

describe('PixelFileUpload — hint / error description (regression)', () => {
  // The dropzone always pointed aria-describedby at `<id>-msg`, an id no
  // element had.
  it('describes the dropzone with the hint, then with the error, only while one shows', () => {
    const { container, rerender } = render(<PixelFileUpload label="Attachments" hint="PDF, up to 5 MB" />);
    const dropzone = getDropzone(container);
    expect(dropzone).toHaveAccessibleDescription('PDF, up to 5 MB');
    expect(getInput(container)).not.toHaveAttribute('aria-describedby');
    rerender(<PixelFileUpload label="Attachments" hint="PDF, up to 5 MB" error="File too large" />);
    expect(dropzone).toHaveAccessibleDescription('File too large');
    rerender(<PixelFileUpload label="Attachments" />);
    expect(dropzone).not.toHaveAttribute('aria-describedby');
  });

  it('describes the file input itself when there is no dropzone', () => {
    const { container } = render(<PixelFileUpload label="Attachments" hint="PDF, up to 5 MB" dropzone={false} />);
    expect(getInput(container)).toHaveAccessibleDescription('PDF, up to 5 MB');
  });
});

// Regression: without a dropzone, the browse button was a tab stop of its
// own, after the file input, which took focus unseen (it is visually
// hidden). The button is now a second label of the input.
describe('PixelFileUpload — browse button', () => {
  it('keeps the file input the one tab stop, named by both its labels', () => {
    const { container } = render(<PixelFileUpload label="Attachments" hint="PDF, up to 5 MB" dropzone={false} />);
    const input = getInput(container);
    expect(container.querySelector('button')).toBeNull();
    expect(getFocusableElements(container)).toEqual([input]);
    expect(input).toHaveAccessibleName('Attachments Choose file');
    expect(input).toHaveAccessibleDescription('PDF, up to 5 MB');
    const browse = input.nextElementSibling as HTMLLabelElement;
    expect(browse.tagName).toBe('LABEL');
    expect(browse.htmlFor).toBe(input.id);
  });

  it('opens the file picker from a click on the browse button', () => {
    const { container } = render(<PixelFileUpload label="Attachments" dropzone={false} />);
    const input = getInput(container);
    const opened = vi.fn((event: Event) => event.preventDefault());
    input.addEventListener('click', opened);
    fireEvent.click(input.nextElementSibling!);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it("shows the file input's keyboard focus on the browse button, on both surfaces", () => {
    const { container } = render(
      <>
        <PixelFileUpload label="Pixel" dropzone={false} surface="pixel" />
        <PixelFileUpload label="Linear" dropzone={false} surface="linear" />
      </>,
    );
    const [pixel, linear] = Array.from(container.querySelectorAll('input[type="file"]')).map((input) => {
      expect(input.className.split(' ')).toContain('peer');
      return input.nextElementSibling!.className.split(' ');
    });
    expect(pixel).toEqual(expect.arrayContaining(['pxl-corner-sm', 'peer-focus-visible:pxl-focus-inset']));
    expect(linear).toEqual(expect.arrayContaining(['peer-focus-visible:ring-2', 'peer-focus-visible:outline-hidden']));
  });
});
