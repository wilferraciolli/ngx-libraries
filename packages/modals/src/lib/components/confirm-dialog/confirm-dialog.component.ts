import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * A small, reusable Yes/No prompt — `ModalService.open()`'s unsaved-changes guard uses it
 * internally, and `ModalService.confirm()` opens it directly for anything else that wants the same
 * prompt (e.g. a delete confirmation). `disableClose: true`: the user must pick a button, Escape
 * and a backdrop click don't count as either answer.
 */
@Component({
  selector: 'ngx-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  protected confirm(): void {
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
