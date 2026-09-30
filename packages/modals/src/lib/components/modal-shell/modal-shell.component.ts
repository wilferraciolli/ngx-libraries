import { AfterViewInit, ChangeDetectionStrategy, Component, ComponentRef, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ModalCloseAction, ModalCloseResult } from '../../models/modal-close-result.model.js';
import type { ModalShellData } from '../../models/modal-config.model.js';
import { hasUnsavedChanges } from '../../models/modal-content.model.js';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component.js';

/**
 * Chrome `ModalService.open()` wraps every modal's content in: the header (optional title + close
 * button) and the content host, where the caller's own component is created dynamically so it gets
 * the real `MatDialogRef` from the same injector this shell was created under — a content
 * component closes itself (`inject(MatDialogRef).close(result)`) exactly like it would if `open()`
 * had opened it directly, it just also gets this shell's chrome and close-button guard for free.
 *
 * Not exported from `public-api.ts` — `ModalService.open()`'s return type erases it to `unknown`,
 * so a caller never needs to reference this class.
 */
@Component({
  selector: 'ngx-modal-shell',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalShellComponent implements AfterViewInit {
  @ViewChild('contentHost', { read: ViewContainerRef, static: true })
  private readonly contentHost!: ViewContainerRef;

  protected readonly data = inject<ModalShellData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ModalShellComponent, ModalCloseResult>);
  private readonly dialog = inject(MatDialog);

  private contentRef?: ComponentRef<unknown>;

  ngAfterViewInit(): void {
    this.contentRef = this.contentHost.createComponent(this.data.contentComponent);
    if (this.data.contentData !== undefined) {
      this.contentRef.setInput('data', this.data.contentData);
    }
    this.contentRef.changeDetectorRef.markForCheck();
  }

  protected requestClose(): void {
    if (!hasUnsavedChanges(this.contentRef?.instance)) {
      this.close();
      return;
    }
    this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        data: {
          message: 'You have unsaved changes. Are you sure you want to close? It will lose data.',
          confirmLabel: 'Discard changes',
          cancelLabel: 'Keep editing',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.close();
      });
  }

  private close(): void {
    this.dialogRef.close({ action: ModalCloseAction.Dismissed, data: undefined });
  }
}
