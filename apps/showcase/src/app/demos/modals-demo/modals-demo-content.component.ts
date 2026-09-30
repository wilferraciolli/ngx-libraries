import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalCloseAction, ModalCloseResult, ModalContent } from '@wiltech-labs/ngx-modals';

export interface ModalsDemoData {
  employeeName: string;
}

export interface ModalsDemoResult {
  employeeName: string;
}

@Component({
  selector: 'app-modals-demo-content',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './modals-demo-content.component.html',
})
export class ModalsDemoContentComponent implements ModalContent {
  data = input<ModalsDemoData>();

  protected readonly note = signal('');
  protected readonly dirty = signal(false);

  private readonly dialogRef = inject(
    MatDialogRef<
      ModalsDemoContentComponent,
      ModalCloseResult<ModalCloseAction, ModalsDemoResult | undefined>
    >,
  );

  protected onNoteChange(value: string): void {
    this.note.set(value);
    this.dirty.set(value.length > 0);
  }

  hasUnsavedChanges(): boolean {
    return this.dirty();
  }

  protected save(): void {
    this.dialogRef.close({
      action: ModalCloseAction.Updated,
      data: { employeeName: this.data()?.employeeName ?? '' },
    });
  }

  protected cancel(): void {
    this.dialogRef.close({ action: ModalCloseAction.Cancelled, data: undefined });
  }
}
