import { describe, expect, it } from 'vitest';
import {
  addFiles,
  fileMatchesAccept,
  fileRemoveLabel,
  fileUploadClasses,
  fileUploadIcons,
  fileUploadPrompt,
  focusRing,
  formatFileSize,
  isImageFile,
  removeFileAt,
  surfaceClasses,
  toneMap,
  type FileUploadFile,
  type Surface,
} from '../../../index';

const file = (name: string, size = 10, type = 'text/plain'): FileUploadFile => ({ name, size, type });

describe('file upload logic', () => {
  it('reads sizes in B, KB, MB and GB', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1023)).toBe('1023 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatFileSize(3 * 1024 ** 3)).toBe('3.0 GB');
  });

  it('matches MIME types, wildcards and extensions, ignoring case and spaces', () => {
    const png = file('Shot.PNG', 10, 'image/png');
    expect(fileMatchesAccept(png)).toBe(true);
    expect(fileMatchesAccept(png, '')).toBe(true);
    expect(fileMatchesAccept(png, ' , ')).toBe(true);
    expect(fileMatchesAccept(png, 'image/*')).toBe(true);
    expect(fileMatchesAccept(png, 'IMAGE/PNG')).toBe(true);
    expect(fileMatchesAccept(png, '.pdf, .png')).toBe(true);
    expect(fileMatchesAccept(png, 'image/jpeg,.pdf')).toBe(false);
    // A file without a type matches by extension only.
    expect(fileMatchesAccept(file('notes', 1, ''), 'text/*')).toBe(false);
  });

  it('adds accepted files to the current ones, or keeps only the last without multiple', () => {
    const a = file('a.txt');
    const b = file('b.txt');
    const c = file('c.txt');
    expect(addFiles([a], [b, c], { multiple: true })).toEqual({ files: [a, b, c], rejections: [] });
    expect(addFiles([a], [b, c], { multiple: false })).toEqual({ files: [c], rejections: [] });
  });

  it('turns down files of the wrong type or too large, with every reason', () => {
    const pdf = file('doc.pdf', 2000, 'application/pdf');
    const big = file('big.png', 2000, 'image/png');
    const ok = file('ok.png', 100, 'image/png');
    const { files, rejections } = addFiles([], [pdf, big, ok], { accept: 'image/*', maxSize: 1000, multiple: true });
    expect(files).toEqual([ok]);
    expect(rejections).toEqual([
      { file: pdf, reasons: ['accept', 'size'] },
      { file: big, reasons: ['size'] },
    ]);
    // Nothing accepted without multiple: the field empties.
    expect(addFiles([ok], [pdf], { accept: 'image/*', multiple: false }).files).toEqual([]);
  });

  it('turns down the files past maxFiles, after the others', () => {
    const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((name) => file(`${name}.txt`));
    const big = file('big.txt', 99);
    const { files, rejections } = addFiles([a!], [b!, big, c!, d!], { multiple: true, maxSize: 50, maxFiles: 2 });
    expect(files).toEqual([a, b]);
    expect(rejections).toEqual([
      { file: big, reasons: ['size'] },
      { file: c, reasons: ['maxFiles'] },
      { file: d, reasons: ['maxFiles'] },
    ]);
  });

  it('removes a file by position and tells images apart', () => {
    expect(removeFileAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
    expect(isImageFile(file('x.png', 1, 'image/png'))).toBe(true);
    expect(isImageFile(file('x.txt'))).toBe(false);
    expect(fileRemoveLabel(file('report.pdf'))).toBe('Remove report.pdf');
    expect(fileUploadPrompt(false)).toBe('Drop files or click to browse');
    expect(fileUploadPrompt(true)).toBe('Drop to upload');
    expect(fileUploadIcons.upload).toEqual(['M8 11V3', 'M4 7l4-4 4 4', 'M3 13h10']);
    expect(fileUploadIcons.file).toEqual(['M4 2h6l3 3v9H4z', 'M10 2v3h3']);
  });
});

describe('file upload recipes', () => {
  const SURFACES: Surface[] = ['pixel', 'linear'];
  const idle = { size: 'md' as const, invalid: false, dragActive: false, disabled: false };

  it('draws a dashed cyan dropzone, padded per size', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = fileUploadClasses(surface, idle);
      expect(c.dropzone).toBe(
        [
          'flex flex-col items-center justify-center gap-2 text-center focus-visible:outline-hidden',
          'border-dashed',
          s.border,
          s.radiusLg,
          s.font,
          s.transition,
          'p-6 text-sm',
          focusRing,
          toneMap.cyan.ring,
          'border-retro-border/60 bg-retro-surface/20 text-retro-muted',
          'cursor-pointer',
        ].join(' '),
      );
      expect(c.item).toBe(`flex items-center gap-3 p-2 pr-3 ${s.border} ${s.radius} ${s.font} border-retro-border/60 bg-retro-surface/40`);
      expect(c.preview).toContain(`${s.border} ${s.radius} border-retro-border/60`);
      expect(c.previewIcon).toContain(`${s.border} ${s.radius} border-retro-border/60`);
    }
    expect(fileUploadClasses('pixel', { ...idle, size: 'sm' }).dropzone).toContain('p-4 text-xs');
    expect(fileUploadClasses('pixel', { ...idle, size: 'lg' }).dropzone).toContain('p-8 text-sm');
  });

  // Regression: while a file was dragged over it, the dropzone kept its
  // resting `bg-retro-surface/20` and `text-retro-muted`, which Tailwind emits
  // after the tone's tint and the cyan text, so it did not light up.
  it('lights up in the tone while files are dragged over', () => {
    const t = toneMap.cyan;
    const c = fileUploadClasses('pixel', { ...idle, dragActive: true });
    expect(c.dropzone).toContain(`${t.border} ${t.soft} ${t.text}`);
    expect(c.dropzone).not.toContain('border-retro-border/60');
    expect(c.dropzone.split(' ')).not.toContain('bg-retro-surface/20');
    expect(c.dropzone.split(' ')).not.toContain('text-retro-muted');
    expect(c.dropzoneIcon).toBe(`h-5 w-5 ${t.text}`);
    expect(c.prompt).toBe(`font-medium ${t.text}`);
    expect(fileUploadClasses('pixel', idle).prompt).toBe('font-medium text-retro-text');
    expect(fileUploadClasses('pixel', idle).dropzoneIcon).toBe('h-5 w-5');
  });

  // Regression: a disabled dropzone kept `cursor-pointer`, which Tailwind
  // emits after `cursor-not-allowed`.
  it('turns red with an error and fades while disabled', () => {
    const t = toneMap.red;
    const c = fileUploadClasses('linear', { ...idle, invalid: true, disabled: true });
    expect(c.dropzone).toContain(t.ring);
    expect(c.dropzone).toContain('border-retro-red/60 opacity-50 cursor-not-allowed');
    expect(c.dropzone.split(' ')).not.toContain('cursor-pointer');
    expect(c.button).toContain(`${t.text} ${t.border} ${t.bg} ${t.hover}`);
    expect(c.button).toMatch(/opacity-50 cursor-not-allowed$/);
    expect(c.remove).toMatch(/opacity-50 cursor-not-allowed$/);
    expect(fileUploadClasses('linear', idle).remove).toMatch(new RegExp(`${focusRing}$`));
  });

  it("draws the file input's keyboard focus on the browse button that labels it", () => {
    for (const surface of SURFACES) expect(fileUploadClasses(surface, idle).input).toBe('peer sr-only');
    expect(fileUploadClasses('linear', idle).button.split(' ')).toEqual(
      expect.arrayContaining([
        'peer-focus-visible:outline-hidden',
        'peer-focus-visible:ring-2',
        'peer-focus-visible:ring-offset-2',
        'peer-focus-visible:ring-offset-retro-bg',
        'peer-focus-visible:ring-retro-cyan/40',
      ]),
    );
    expect(fileUploadClasses('linear', { ...idle, invalid: true }).button).toContain('peer-focus-visible:ring-retro-red/40');
    const pixel = fileUploadClasses('pixel', idle).button.split(' ');
    expect(pixel).toEqual(expect.arrayContaining(['pxl-corner-sm', 'peer-focus-visible:pxl-focus-inset']));
    expect(pixel.filter((c) => c.includes('ring'))).toEqual([]);
  });
});
