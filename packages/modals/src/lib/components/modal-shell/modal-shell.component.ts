import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
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

  protected readonly title = signal(this.data.title);
  protected readonly minimized = signal(false);
  private readonly compact = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.XSmall)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  protected readonly minimizeIcon = computed(() =>
    this.data.side === 'left' ? 'left_panel_close' : 'right_panel_close',
  );
  protected readonly restoreIcon = computed(() =>
    this.data.side === 'left' ? 'left_panel_open' : 'right_panel_open',
  );

  constructor() {
    inject(BreakpointObserver)
      .observe(Breakpoints.XSmall)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.layout());
  }

  /** Called through `ModalService.update()`. */
  public update(changes: { data?: unknown; title?: string }): void {
    if (changes.title !== undefined) this.title.set(changes.title);
    if (changes.data !== undefined) {
      this.contentRef?.setInput('data', changes.data);
      this.contentRef?.changeDetectorRef.markForCheck();
    }
    if (this.minimized()) this.restore();
  }

  protected minimize(): void {
    this.minimized.set(true);
    this.layout();
  }

  protected restore(): void {
    this.minimized.set(false);
    this.layout();
  }

  /** Docked: full height at the configured width (full screen below XSmall). Minimized: a bar at
   *  the bottom of the same edge. */
  private layout(): void {
    const edge = this.data.side === 'left' ? 'left' : 'right';
    if (this.minimized()) {
      this.dialogRef.updateSize('auto', 'auto');
      this.dialogRef.updatePosition({ bottom: '16px', [edge]: '16px' });
      return;
    }
    this.dialogRef.updateSize(this.compact() ? '100vw' : this.data.width, '100vh');
    this.dialogRef.updatePosition({ top: '0', [edge]: '0' });
  }

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
