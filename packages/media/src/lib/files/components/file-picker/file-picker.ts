import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { acceptsFile, formatFileSize, type FileRejection, type PickedFile } from '../../file-read';

/**
 * Pick one file by button or by dropping it on the zone. It checks `accept` and `maxBytes` before
 * anything is read, and reports the file (`picked`) or why it was turned away (`rejected`); the
 * consumer reads it (`readAsBase64`) and uploads it. All text comes from inputs: the package has
 * no UI strings of its own.
 */
@Component({
  selector: 'ngx-file-picker',
  standalone: true,
  imports: [],
  templateUrl: './file-picker.html',
  styleUrl: './file-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePicker {
  /** As `<input type="file" accept>`: MIME types, `image/*`, `.docx`. */
  public readonly accept = input('');
  /** The largest file accepted, in bytes; 0: any size. */
  public readonly maxBytes = input(0);
  public readonly disabled = input(false);
  /** The button's label, e.g. "Choose a file". */
  public readonly label = input.required<string>();
  /** Under the button, e.g. "or drop it here · PDF or photo, up to 10 MB". */
  public readonly hint = input('');
  /** Read to screen readers and shown once a file is picked; `{name}` and `{size}` are filled in. */
  public readonly pickedText = input('{name} · {size}');

  public readonly picked = output<PickedFile>();
  public readonly rejected = output<FileRejection>();

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly dragging = signal(false);
  protected readonly current = signal<PickedFile | null>(null);
  protected readonly currentText = computed(() => {
    const file = this.current();
    return file
      ? this.pickedText().replace('{name}', file.name).replace('{size}', formatFileSize(file.size))
      : '';
  });

  protected open(): void {
    if (!this.disabled()) {
      this.inputRef().nativeElement.click();
    }
  }

  protected chosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // picking the same file again still reports it
    if (file) {
      this.take(file);
    }
  }

  protected dragOver(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragging.set(true);
  }

  protected dropped(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && !this.disabled()) {
      this.take(file);
    }
  }

  /** Forget the file shown (after an upload, say). */
  public clear(): void {
    this.current.set(null);
  }

  private take(file: File): void {
    if (!acceptsFile(file, this.accept())) {
      this.rejected.emit({ file, reason: 'type' });
      return;
    }
    if (this.maxBytes() > 0 && file.size > this.maxBytes()) {
      this.rejected.emit({ file, reason: 'size' });
      return;
    }
    const pickedFile: PickedFile = { file, name: file.name, type: file.type, size: file.size };
    this.current.set(pickedFile);
    this.picked.emit(pickedFile);
  }
}
