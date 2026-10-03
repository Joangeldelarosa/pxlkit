'use client';

import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import {
  addFiles,
  fieldDescribedBy,
  fieldMessageId,
  fileRemoveLabel,
  fileUploadClasses,
  fileUploadIcons,
  fileUploadPrompt,
  formatFileSize,
  isImageFile,
  removeFileAt,
  type FileUploadClasses,
} from '@pxlkit/ui-kit-core';
import {
  Size, Surface, cn,
  useEffectiveSurface,
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
    const { files: next, rejections } = addFiles(files ?? [], incoming, { accept, multiple, maxSize, maxFiles });
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
    setFiles(removeFileAt(files ?? [], idx));
  }, [files, setFiles]);

  const c = fileUploadClasses(surface, { size, invalid: !!error, dragActive, disabled: !!disabled });

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId} messageId={fieldMessageId(inputId)}>
      <div ref={ref} className={cn(c.root, className)} data-pxl-name={name || undefined}>
        {dropzone && (
          <div
            data-pxl-dropzone="true"
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            aria-describedby={fieldDescribedBy(inputId, { hint, error })}
            onClick={handleBrowse}
            onKeyDown={handleKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            className={c.dropzone}
          >
            <OutlineIcon paths={fileUploadIcons.upload} className={c.dropzoneIcon} />
            <div className={c.dropzoneText}>
              <span className={c.prompt}>
                {fileUploadPrompt(dragActive)}
              </span>
              {accept && <span className={c.accepts}>Accepts: {accept}</span>}
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
          className={c.input}
          tabIndex={dropzone ? -1 : 0}
          aria-hidden={dropzone || undefined}
          aria-describedby={dropzone ? undefined : fieldDescribedBy(inputId, { hint, error })}
        />

        {/*
          The browse button is a second label of the file input, which stays
          the one control: one tab stop, named by both labels, described by
          the hint or error, and opened by a click on either label.
        */}
        {!dropzone && (
          <label htmlFor={inputId} className={c.button}>
            <OutlineIcon paths={fileUploadIcons.upload} className={c.buttonIcon} />
            <span>Choose file{multiple ? 's' : ''}</span>
          </label>
        )}

        {files && files.length > 0 && (
          <ul className={c.list}>
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
                  className={c.item}
                >
                  <FilePreview file={f} classes={c} />
                  <div className={c.itemText}>
                    <p className={c.itemName}>{f.name}</p>
                    <p className={c.itemSize}>{formatFileSize(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={fileRemoveLabel(f)}
                    onClick={remove}
                    disabled={disabled}
                    className={c.remove}
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

function FilePreview({ file, classes: c }: { file: File; classes: FileUploadClasses }) {
  const isImage = isImageFile(file);
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
      <span className={c.preview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={file.name} className={c.previewImage} />
      </span>
    );
  }

  return (
    <span className={c.previewIcon}>
      <OutlineIcon paths={fileUploadIcons.file} className={c.previewGlyph} />
    </span>
  );
}

function OutlineIcon({ paths, className }: { paths: readonly string[]; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2" shapeRendering="crispEdges" aria-hidden>
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
