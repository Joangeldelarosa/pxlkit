/**
 * PixelFileUpload — a dropzone (or a button) over a hidden file input, and
 * the list of chosen files: which files a field takes and why it turns the
 * others down, how their sizes read, and the classes of every part.
 */
import { cn, focusRing, surfaceClasses, toneMap, type Size, type Surface } from '../../common';

/** What a file upload needs to know of a file. */
export interface FileUploadFile {
  name: string;
  size: number;
  type: string;
}

/** Why a file was turned down: its type (`accept`), its `size`, or one file too many (`maxFiles`). */
export type FileUploadRejectReason = 'accept' | 'size' | 'maxFiles';

/** A file turned down, with every reason it was. */
export interface FileUploadRejection<F extends FileUploadFile = File> {
  file: F;
  reasons: FileUploadRejectReason[];
}

export interface FileUploadRules {
  /** The `accept` filter: MIME types, `type/*` wildcards and `.ext` extensions, comma-separated. */
  accept?: string;
  /** Files add up; without it each choice replaces the last. */
  multiple: boolean;
  /** Largest size of a file, in bytes. */
  maxSize?: number;
  /** Most files the field holds. */
  maxFiles?: number;
}

/** `bytes` in the largest unit that keeps it at or above 1, with one decimal past bytes. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

/** Whether `file` passes an `accept` filter (none, or an empty one, takes every file). */
export function fileMatchesAccept(file: FileUploadFile, accept?: string): boolean {
  if (!accept) return true;
  const parts = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) return true;
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  return parts.some((part) => {
    if (part.startsWith('.')) return name.endsWith(part);
    if (part.endsWith('/*')) return mime.startsWith(part.slice(0, -1));
    return mime === part;
  });
}

/**
 * The files a field holds once `incoming` are chosen, and those turned down.
 * Files of the wrong type or too large are turned down; the rest join the
 * current ones (`multiple`) or replace them with the last one chosen. Past
 * `maxFiles`, the last files are turned down too.
 */
export function addFiles<F extends FileUploadFile>(
  current: readonly F[],
  incoming: readonly F[],
  { accept, multiple, maxSize, maxFiles }: FileUploadRules,
): { files: F[]; rejections: FileUploadRejection<F>[] } {
  const rejections: FileUploadRejection<F>[] = [];
  const accepted: F[] = [];
  for (const file of incoming) {
    const reasons: FileUploadRejectReason[] = [];
    if (!fileMatchesAccept(file, accept)) reasons.push('accept');
    if (typeof maxSize === 'number' && file.size > maxSize) reasons.push('size');
    if (reasons.length > 0) rejections.push({ file, reasons });
    else accepted.push(file);
  }
  let files = multiple ? [...current, ...accepted] : accepted.slice(-1);
  if (typeof maxFiles === 'number' && files.length > maxFiles) {
    for (const file of files.slice(maxFiles)) rejections.push({ file, reasons: ['maxFiles'] });
    files = files.slice(0, maxFiles);
  }
  return { files, rejections };
}

/** The files without the one at `index`. */
export function removeFileAt<F>(files: readonly F[], index: number): F[] {
  return files.filter((_, i) => i !== index);
}

/** Whether a file gets an image preview. */
export function isImageFile(file: FileUploadFile): boolean {
  return file.type.startsWith('image/');
}

/** The dropzone's call to action, which changes while files are dragged over it. */
export function fileUploadPrompt(dragActive: boolean): string {
  return dragActive ? 'Drop to upload' : 'Drop files or click to browse';
}

/** Accessible name of a file's remove button. */
export function fileRemoveLabel(file: FileUploadFile): string {
  return `Remove ${file.name}`;
}

/** Paths of the icons, drawn on a 16×16 grid with a 2px stroke. */
export const fileUploadIcons = {
  /** An arrow up onto a line. */
  upload: ['M8 11V3', 'M4 7l4-4 4 4', 'M3 13h10'],
  /** A page with a folded corner. */
  file: ['M4 2h6l3 3v9H4z', 'M10 2v3h3'],
} as const;

/** Padding and type size of the dropzone per field size. */
const dropzonePadding: Record<Size, string> = {
  sm: 'p-4 text-xs',
  md: 'p-6 text-sm',
  lg: 'p-8 text-sm',
};

export interface FileUploadClassOptions {
  size: Size;
  /** The field shows an error: red instead of cyan. */
  invalid: boolean;
  /** Files are dragged over the dropzone. */
  dragActive: boolean;
  disabled: boolean;
}

export interface FileUploadClasses {
  /** Holds the dropzone or button, the file input and the list. */
  root: string;
  dropzone: string;
  dropzoneIcon: string;
  /** The column of the prompt and the accepted types. */
  dropzoneText: string;
  prompt: string;
  accepts: string;
  /** The visually hidden file input. */
  input: string;
  /** The browse button that stands in for the dropzone. */
  button: string;
  buttonIcon: string;
  list: string;
  item: string;
  /** The column of a file's name and size. */
  itemText: string;
  itemName: string;
  itemSize: string;
  remove: string;
  /** The frame of an image preview. */
  preview: string;
  previewImage: string;
  /** The frame of the icon standing in for a preview. */
  previewIcon: string;
  previewGlyph: string;
}

/** Classes of every part of a PixelFileUpload. */
export function fileUploadClasses(surface: Surface, { size, invalid, dragActive, disabled }: FileUploadClassOptions): FileUploadClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[invalid ? 'red' : 'cyan'];
  return {
    root: 'space-y-3',
    dropzone: cn(
      'flex flex-col items-center justify-center gap-2 text-center outline-none cursor-pointer',
      'border-dashed bg-retro-surface/20 text-retro-muted',
      s.border,
      s.radiusLg,
      s.font,
      s.transition,
      dropzonePadding[size],
      focusRing,
      t.ring,
      dragActive ? cn(t.border, t.soft, t.text) : 'border-retro-border/60',
      invalid && 'border-retro-red/60',
      disabled && 'opacity-50 cursor-not-allowed',
    ),
    dropzoneIcon: cn('h-5 w-5', dragActive && t.text),
    dropzoneText: 'flex flex-col',
    prompt: cn('font-medium', dragActive ? t.text : 'text-retro-text'),
    accepts: 'text-[10px] text-retro-muted break-all max-w-full',
    input: 'sr-only',
    button: cn(
      'inline-flex items-center gap-2 px-3 h-10 text-sm font-medium',
      s.border,
      s.radius,
      s.transition,
      s.font,
      t.text,
      t.border,
      t.bg,
      t.hover,
      focusRing,
      t.ring,
      disabled && 'opacity-50 cursor-not-allowed',
    ),
    buttonIcon: 'h-4 w-4',
    list: 'space-y-2',
    item: cn('flex items-center gap-3 p-2 pr-3', s.border, s.radius, s.font, 'border-retro-border/60 bg-retro-surface/40'),
    itemText: 'flex-1 min-w-0',
    itemName: 'truncate text-xs text-retro-text',
    itemSize: 'text-[10px] text-retro-muted',
    remove: cn(
      'inline-flex items-center justify-center h-7 w-7 shrink-0',
      s.border,
      s.radius,
      s.transition,
      'text-retro-muted border-retro-border/60 hover:text-retro-red hover:border-retro-red/60',
      focusRing,
      disabled && 'opacity-50 cursor-not-allowed',
    ),
    preview: cn('inline-block h-10 w-10 overflow-hidden shrink-0', s.border, s.radius, 'border-retro-border/60'),
    previewImage: 'h-full w-full object-cover',
    previewIcon: cn(
      'inline-flex h-10 w-10 items-center justify-center shrink-0 bg-retro-bg/60 text-retro-muted',
      s.border,
      s.radius,
      'border-retro-border/60',
    ),
    previewGlyph: 'h-4 w-4',
  };
}
