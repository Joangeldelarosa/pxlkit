'use client';

import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import {
  Size, Surface, cn,
  toneMap, focusRing, surfaceClasses, useEffectiveSurface,
  CloseIcon, FieldShell,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

/* ──────────────────────────────────────────────────────────────────────────
   PixelFileUpload — dropzone + click-to-browse uploader with validation,
   preview thumbnails for images, and per-item remove. Hidden file input
   mirror enables native form serialization.
   ────────────────────────────────────────────────────────────────────────── */

export type PixelFileRejection = { file: File; reasons: string[] };

/** Public prop bag for {@link PixelFileUpload}. */
export interface PixelFileUploadProps {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Bytes per file. */
  maxSize?: number;
  maxFiles?: number;
  dropzone?: boolean;
  renderItem?: (file: File, remove: () => void) => React.ReactNode;
  onReject?: (rejections: PixelFileRejection[]) => void;
  surface?: Surface;
  size?: Size;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /**
   * Deprecated form-serialization hint. Files are not serializable through
   * a hidden mirror once `e.target.value` is reset, so this prop no longer
   * wires to a native input. Read selected files from `onChange` and POST
   * them manually (e.g. `FormData.append(name, file)` per file).
   *
   * Kept in the prop bag so consumers using it don't break — the `id` of
   * the file input still uses it via the `id` prop fallback path.
   */
  name?: string;
  id?: string;
  className?: string;
}

const SIZE_PAD: Record<Size, string> = {
  sm: 'p-4 text-xs',
  md: 'p-6 text-sm',
  lg: 'p-8 text-sm',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

/** True if `mime` matches the `accept` filter (RFC2616 + ".ext" + "image/*"). */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const parts = accept.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0) return true;
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  return parts.some((p) => {
    if (p.startsWith('.')) return name.endsWith(p);
    if (p.endsWith('/*')) return mime.startsWith(p.slice(0, -1));
    return mime === p;
  });
}

export const PixelFileUpload = forwardRef<HTMLDivElement, PixelFileUploadProps>(function PixelFileUpload(
  {
    value,
    defaultValue,
    onChange,
    accept,
    multiple = false,
    maxSize,
    maxFiles,
    dropzone = true,
    renderItem,
    onReject,
    surface: surfaceProp,
    size = 'md',
    label,
    hint,
    error,
    disabled,
    name,
    id,
    className,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const reactId = useId();
  const inputId = id ?? `pxl-file-${reactId}`;

  const [files, setFiles] = useControllableState<File[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Run validation + cap + merge, then push results out. */
  const ingest = useCallback((incoming: File[]) => {
    if (disabled || incoming.length === 0) return;

    const rejections: PixelFileRejection[] = [];
    const accepted: File[] = [];

    for (const f of incoming) {
      const reasons: string[] = [];
      if (!matchesAccept(f, accept)) reasons.push('accept');
      if (typeof maxSize === 'number' && f.size > maxSize) reasons.push('size');
      if (reasons.length > 0) {
        rejections.push({ file: f, reasons });
      } else {
        accepted.push(f);
      }
    }

    // Compose next value depending on multiple + maxFiles cap.
    const current = multiple ? (files ?? []) : [];
    let next = multiple ? [...current, ...accepted] : accepted.slice(-1);

    if (typeof maxFiles === 'number' && next.length > maxFiles) {
      const extras = next.slice(maxFiles);
      next = next.slice(0, maxFiles);
      for (const f of extras) rejections.push({ file: f, reasons: ['maxFiles'] });
    }

    if (rejections.length > 0) onReject?.(rejections);
    setFiles(next);
  }, [accept, disabled, files, maxFiles, maxSize, multiple, onReject, setFiles]);

  const handleBrowse = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    ingest(Array.from(list));
    // Reset so picking the same file again still fires onChange.
    e.target.value = '';
  }, [ingest]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    const list = e.dataTransfer?.files;
    if (!list) return;
    ingest(Array.from(list));
  }, [disabled, ingest]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrowse();
    }
  }, [disabled, handleBrowse]);

  const removeAt = useCallback((idx: number) => {
    const current = files ?? [];
    const next = current.filter((_, i) => i !== idx);
    setFiles(next);
  }, [files, setFiles]);

  const tone = error ? 'red' : 'cyan';
  const t = toneMap[tone];

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId}>
      <div ref={ref} className={cn('space-y-3', className)} data-pxl-name={name || undefined}>
        {dropzone && (
          <div
            data-pxl-dropzone="true"
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            aria-describedby={`${inputId}-msg`}
            onClick={handleBrowse}
            onKeyDown={handleKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'flex flex-col items-center justify-center gap-2 text-center outline-none cursor-pointer',
              'border-dashed bg-retro-surface/20 text-retro-muted',
              s.border, s.radiusLg, s.font, s.transition,
              SIZE_PAD[size],
              focusRing, t.ring,
              dragActive ? cn(t.border, t.soft, t.text) : 'border-retro-border/60',
              error && 'border-retro-red/60',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <UploadIcon className={cn('h-5 w-5', dragActive && t.text)} />
            <div className="flex flex-col">
              <span className={cn('font-medium', dragActive ? t.text : 'text-retro-text')}>
                {dragActive ? 'Drop to upload' : 'Drop files or click to browse'}
              </span>
              {accept && <span className="text-[10px] text-retro-muted break-all max-w-full">Accepts: {accept}</span>}
            </div>
          </div>
        )}

        {/*
          NB: `name` is intentionally NOT wired to this input. We reset
          `e.target.value` after every change so users can re-pick the same
          file, which leaves the DOM input empty even when JS state holds
          the FileList. Form submission via native `<form>` would silently
          drop all files; consumers must POST the files manually from the
          onChange-derived state.
        */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={dropzone ? -1 : 0}
          aria-hidden={dropzone || undefined}
        />

        {!dropzone && (
          <button
            type="button"
            onClick={handleBrowse}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-2 px-3 h-10 text-sm font-medium',
              s.border, s.radius, s.transition, s.font,
              t.text, t.border, t.bg, t.hover,
              focusRing, t.ring,
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <UploadIcon className="h-4 w-4" />
            <span>Choose file{multiple ? 's' : ''}</span>
          </button>
        )}

        {files && files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, idx) => {
              const key = `${f.name}-${f.size}-${idx}`;
              const remove = () => removeAt(idx);
              if (renderItem) {
                return (
                  <li key={key} data-pxl-file-item="true">
                    {renderItem(f, remove)}
                  </li>
                );
              }
              return (
                <li
                  key={key}
                  data-pxl-file-item="true"
                  className={cn(
                    'flex items-center gap-3 p-2 pr-3',
                    s.border, s.radius, s.font,
                    'border-retro-border/60 bg-retro-surface/40',
                  )}
                >
                  <FilePreview file={f} surface={surface} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-retro-text">{f.name}</p>
                    <p className="text-[10px] text-retro-muted">{formatBytes(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    onClick={remove}
                    disabled={disabled}
                    className={cn(
                      'inline-flex items-center justify-center h-7 w-7 shrink-0',
                      s.border, s.radius, s.transition,
                      'text-retro-muted border-retro-border/60 hover:text-retro-red hover:border-retro-red/60',
                      focusRing,
                      disabled && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <CloseIcon />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FieldShell>
  );
});

PixelFileUpload.displayName = 'PixelFileUpload';

/* ──────────────────────────────────────────────────────────────────────────
   Internals.
   ────────────────────────────────────────────────────────────────────────── */

function FilePreview({ file, surface }: { file: File; surface: Surface }) {
  const s = surfaceClasses(surface);
  const isImage = file.type.startsWith('image/');
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isImage) return;
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, isImage]);

  if (isImage && url) {
    return (
      <span className={cn('inline-block h-10 w-10 overflow-hidden shrink-0', s.border, s.radius, 'border-retro-border/60')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={file.name} className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex h-10 w-10 items-center justify-center shrink-0 bg-retro-bg/60 text-retro-muted', s.border, s.radius, 'border-retro-border/60')}>
      <FileIcon className="h-4 w-4" />
    </span>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" shapeRendering="crispEdges" aria-hidden>
      <path d="M8 11V3" />
      <path d="M4 7l4-4 4 4" />
      <path d="M3 13h10" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" shapeRendering="crispEdges" aria-hidden>
      <path d="M4 2h6l3 3v9H4z" />
      <path d="M10 2v3h3" />
    </svg>
  );
}
