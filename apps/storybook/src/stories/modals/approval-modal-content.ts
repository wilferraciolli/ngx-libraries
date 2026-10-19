import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalCloseAction, ModalCloseResult, ModalContent } from '@wiltech-labs/ngx-modals';

export interface ApprovalData {
  employeeName: string;
}

export type ApprovalResult = ModalCloseResult<ModalCloseAction, { note: string } | undefined>;

/**
 * Receives `data` via `ModalConfig.data`, closes itself with a typed result via
 * `MatDialogRef.close()` — the same mechanism as opening a `MatDialog` directly. Implements
 * `ModalContent` so the shell's close (X) button prompts before discarding a typed note.
 */
@Component({
  selector: 'sb-approval-modal-content',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack" style="padding: 16px">
      <p>
        Approve <strong>{{ data()?.employeeName }}</strong
        >'s holiday request for next week?
      </p>
      <mat-form-field>
        <mat-label>Note (optional)</mat-label>
        <input matInput [ngModel]="note()" (ngModelChange)="onNoteChange($event)" />
      </mat-form-field>
      <div class="Story-row">
        <button mat-raised-button color="primary" (click)="approve()">Approve</button>
        <button mat-button (click)="cancel()">Cancel</button>
      </div>
    </div>
  `,
})
export class ApprovalModalContent implements ModalContent {
  public readonly data = input<ApprovalData>();

  protected readonly note = signal('');
  private readonly dirty = signal(false);
  private readonly dialogRef = inject(MatDialogRef<ApprovalModalContent, ApprovalResult>);

  protected onNoteChange(value: string): void {
    this.note.set(value);
    this.dirty.set(value.length > 0);
  }

  public hasUnsavedChanges(): boolean {
    return this.dirty();
  }

  protected approve(): void {
    this.dialogRef.close({ action: ModalCloseAction.Updated, data: { note: this.note() } });
  }

  protected cancel(): void {
    this.dialogRef.close({ action: ModalCloseAction.Cancelled, data: undefined });
  }
}
