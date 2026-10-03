import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
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
  type FileUploadRejection,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** What the `item` template of a `<pxl-file-upload>` receives. */
export interface PixelFileUploadItemContext {
  /** The file (`let-file`). */
  $implicit: File;
  /** Takes the file out of the field (`let-remove="remove"`). */
  remove: () => void;
}

/**
 * File field: a dropzone — or, without one, a browse button — over a hidden
 * file input, and the list of chosen files with a preview of each image and
 * a remove button. Files of the wrong type, too large, or past `maxFiles` are
 * turned down and reported with `(reject)`. Bind the files with
 * `[(value)]`, use it as a form control (`ngModel`, `formControlName`), or
 * leave it uncontrolled with `defaultValue`. Read the files from the binding
 * to send them: the file input is emptied after each choice, so the same
 * file can be chosen again, and submits nothing.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-file-upload label="Photos" accept="image/*" multiple [(value)]="photos" />
 */
@Component({
  selector: 'pxl-file-upload',
  imports: [NgTemplateOutlet, PixelFieldShell, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelFileUpload)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the inner file input; as attributes on the host
    // they would duplicate the id or mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.accept]': 'null',
    '[attr.multiple]': 'null',
    '[attr.disabled]': 'null',
  },
  template: `
    <pxl-field-shell
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [surface]="effectiveSurface()"
      [htmlFor]="inputId()"
      [messageId]="messageId()"
    >
      <div [class]="classes().root" [attr.data-pxl-name]="name() || null" (focusout)="form.touched()">
        @if (dropzone()) {
          <div
            data-pxl-dropzone="true"
            role="button"
            [attr.tabindex]="isDisabled() ? -1 : 0"
            [attr.aria-disabled]="isDisabled() || null"
            [attr.aria-describedby]="describedBy() ?? null"
            [class]="classes().dropzone"
            (click)="browse()"
            (keydown)="onKeydown($event)"
            (drop)="onDrop($event)"
            (dragover)="onDragOver($event)"
            (dragenter)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
          >
            <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ $implicit: icons.upload, class: classes().dropzoneIcon }" />
            <div [class]="classes().dropzoneText">
              <span [class]="classes().prompt">{{ prompt() }}</span>
              @if (accept()) {
                <span [class]="classes().accepts">Accepts: {{ accept() }}</span>
              }
            </div>
          </div>
        }
        <input
          #input
          [id]="inputId()"
          type="file"
          [attr.accept]="accept() ?? null"
          [multiple]="multiple()"
          [disabled]="isDisabled()"
          [class]="classes().input"
          [attr.tabindex]="dropzone() ? -1 : 0"
          [attr.aria-hidden]="dropzone() || null"
          [attr.aria-describedby]="dropzone() ? null : (describedBy() ?? null)"
          (change)="onChange($event)"
        />
        @if (!dropzone()) {
          <button type="button" [disabled]="isDisabled()" [class]="classes().button" (click)="browse()">
            <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ $implicit: icons.upload, class: classes().buttonIcon }" />
            <span>Choose file{{ multiple() ? 's' : '' }}</span>
          </button>
        }
        @if (files().length > 0) {
          <ul [class]="classes().list">
            @for (context of items(); track $index) {
              @if (item(); as template) {
                <li data-pxl-file-item="true"><ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="context" /></li>
              } @else {
                <li data-pxl-file-item="true" [class]="classes().item">
                  @if (previews().get(context.$implicit); as url) {
                    <span [class]="classes().preview">
                      <img [src]="url" [alt]="context.$implicit.name" [class]="classes().previewImage" />
                    </span>
                  } @else {
                    <span [class]="classes().previewIcon">
                      <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ $implicit: icons.file, class: classes().previewGlyph }" />
                    </span>
                  }
                  <div [class]="classes().itemText">
                    <p [class]="classes().itemName">{{ context.$implicit.name }}</p>
                    <p [class]="classes().itemSize">{{ fileSize(context.$implicit) }}</p>
                  </div>
                  <button
                    type="button"
                    [attr.aria-label]="removeLabel(context.$implicit)"
                    [disabled]="isDisabled()"
                    [class]="classes().remove"
                    (click)="context.remove()"
                  >
                    <svg pxlGlyph="close"></svg>
                  </button>
                </li>
              }
            }
          </ul>
        }
      </div>
    </pxl-field-shell>

    <ng-template #icon let-paths let-iconClass="class">
      <svg
        viewBox="0 0 16 16"
        [class]="iconClass"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        shape-rendering="crispEdges"
        aria-hidden="true"
      >
        @for (d of paths; track d) {
          <path [attr.d]="d" />
        }
      </svg>
    </ng-template>
  `,
})
export class PixelFileUpload implements ControlValueAccessor {
  /** Files (`[(value)]`); leave unset for an uncontrolled field. */
  readonly value = model<File[] | undefined>(undefined);
  /** Initial files while uncontrolled. */
  readonly defaultValue = input<File[]>();
  /** Types the field takes: MIME types, `type/*` wildcards and `.ext` extensions, comma-separated. */
  readonly accept = input<string>();
  /** Files add up; without it each choice replaces the last. */
  readonly multiple = input(false, { transform: booleanOr(false) });
  /** Largest size of a file, in bytes. */
  readonly maxSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Most files the field holds. */
  readonly maxFiles = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Shows the dropzone; `false` shows a browse button instead. */
  readonly dropzone = input(true, { transform: booleanOr(true) });
  /** Renders a chosen file in place of the default row (`let-file let-remove="remove"`). */
  readonly item = input<TemplateRef<PixelFileUploadItemContext>>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Padding and type size of the dropzone. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Label above the field, pointing at the file input. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; turns the dropzone red. */
  readonly error = input<string>();
  /** Disables choosing, dropping and removing files. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Exposed as `data-pxl-name`; the file input submits nothing (see above). */
  readonly name = input<string>();
  /** `id` of the file input; generated when left out. */
  readonly id = input<string>();
  /** The files turned down by a choice or a drop, with their reasons. */
  readonly reject = output<FileUploadRejection[]>();

  /** @internal */
  protected readonly form = new FormBridge<File[]>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly icons = fileUploadIcons;
  private readonly generatedId = injectId();
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** @internal */
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.inputId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.inputId(), { hint: this.hint(), error: this.error() }),
  );
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly files = computed(() => this.value() ?? this.defaultValue() ?? []);
  /** @internal The context of each file's row or `item` template. */
  protected readonly items = computed(() =>
    this.files().map((file, index): PixelFileUploadItemContext => ({ $implicit: file, remove: () => this.removeAt(index) })),
  );
  /** @internal Files are dragged over the dropzone. */
  protected readonly dragActive = signal(false);
  /** @internal */
  protected readonly prompt = computed(() => fileUploadPrompt(this.dragActive()));
  /** @internal */
  protected readonly classes = computed(() =>
    fileUploadClasses(this.effectiveSurface(), {
      size: this.size(),
      invalid: !!this.error(),
      dragActive: this.dragActive(),
      disabled: this.isDisabled(),
    }),
  );
  /** @internal An object URL per image in the list, revoked as its file leaves it. */
  protected readonly previews = signal(new Map<File, string>());

  constructor() {
    // Made once rendered in the browser, as the React kit's previews are.
    afterRenderEffect(() => {
      const files = this.files();
      untracked(() => this.syncPreviews(files));
    });
    inject(DestroyRef).onDestroy(() => {
      for (const url of this.previews().values()) URL.revokeObjectURL(url);
    });
  }

  /** @internal */
  protected fileSize(file: File): string {
    return formatFileSize(file.size);
  }

  /** @internal */
  protected removeLabel(file: File): string {
    return fileRemoveLabel(file);
  }

  /** @internal */
  protected browse(): void {
    if (this.isDisabled()) return;
    this.input().nativeElement.click();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    this.browse();
  }

  /** @internal */
  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    this.ingest(Array.from(target.files));
    // Emptied, so choosing the same file again still reports a change.
    target.value = '';
  }

  /** @internal */
  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
    if (this.isDisabled() || !event.dataTransfer?.files) return;
    this.ingest(Array.from(event.dataTransfer.files));
  }

  /** @internal */
  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDisabled()) this.dragActive.set(true);
  }

  /** @internal */
  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
  }

  private ingest(incoming: File[]): void {
    if (this.isDisabled() || incoming.length === 0) return;
    const { files, rejections } = addFiles(this.files(), incoming, {
      accept: this.accept(),
      multiple: this.multiple(),
      maxSize: this.maxSize(),
      maxFiles: this.maxFiles(),
    });
    if (rejections.length > 0) this.reject.emit(rejections);
    this.setFiles(files);
  }

  private removeAt(index: number): void {
    this.setFiles(removeFileAt(this.files(), index));
  }

  private setFiles(files: File[]): void {
    this.value.set(files);
    this.form.changed(files);
  }

  private syncPreviews(files: readonly File[]): void {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    const current = this.previews();
    const next = new Map<File, string>();
    for (const file of files) {
      if (isImageFile(file)) next.set(file, current.get(file) ?? URL.createObjectURL(file));
    }
    for (const [file, url] of current) if (!next.has(file)) URL.revokeObjectURL(url);
    this.previews.set(next);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(Array.isArray(value) ? value : undefined);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: File[]) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
