import { Injectable, Type, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Observable, map } from 'rxjs';

import { ModalShellComponent } from '../components/modal-shell/modal-shell.component.js';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../components/confirm-dialog/confirm-dialog.component.js';
import type { ModalConfig, ModalShellData } from '../models/modal-config.model.js';
import type { ModalCloseResult } from '../models/modal-close-result.model.js';

const DEFAULT_WIDTH = 'var(--ngx-modal-width, 33vw)';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);

  /**
   * Opens `component` in a panel docked to `config.side` (default `'right'`): full viewport height, `config.width` (default
   * `var(--ngx-modal-width, 33vw)`) wide, full screen below the CDK's `XSmall` breakpoint. The
   * panel can only be closed via its own close button — Escape and a backdrop click are disabled,
   * so a caller's in-progress work is never lost by accident. Content that implements
   * `ModalContent.hasUnsavedChanges()` gets a confirm prompt before that close button actually
   * closes it.
   *
   * `component` receives `config.data` via a `data` input (`data = input<TData>()`, or
   * `@Input() data?: TData`) and can close itself with a typed result the same way it would if this
   * had opened it directly: `inject(MatDialogRef<MyComponent, MyResult>).close(result)`.
   */
  open<TResult = ModalCloseResult, TData = unknown>(
    component: Type<unknown>,
    config: ModalConfig<TData> = {},
  ): MatDialogRef<unknown, TResult> {
    const width = config.width ?? DEFAULT_WIDTH;
    const side = config.side ?? 'right';
    const backdrop = config.backdrop ?? true;

    // The shell sizes and places itself (docked, full screen below XSmall, or minimized).
    return this.dialog.open<ModalShellComponent, ModalShellData<TData>, TResult>(
      ModalShellComponent,
      {
        position: side === 'left' ? { top: '0', left: '0' } : { top: '0', right: '0' },
        height: '100vh',
        maxHeight: '100vh',
        width,
        maxWidth: '100vw',
        disableClose: true,
        hasBackdrop: backdrop,
        ariaModal: backdrop,
        scrollStrategy: backdrop ? undefined : this.overlay.scrollStrategies.noop(),
        panelClass: backdrop ? 'ngx-modal-pane' : ['ngx-modal-pane', 'is-modeless'],
        ariaLabel: config.ariaLabel ?? config.title,
        injector: config.injector,
        data: {
          contentComponent: component,
          contentData: config.data,
          title: config.title,
          width,
          side,
          minimizable: config.minimizable ?? false,
        },
      },
    );
  }

  /**
   * Swaps what an open panel shows, without closing it: new `data` for its content component and/or
   * a new `title`. Restores it if it was minimized. For a modeless panel (`backdrop: false`) that
   * follows the user's selection, Eg the node they last clicked.
   */
  update<TData>(
    ref: MatDialogRef<unknown, unknown>,
    changes: { data?: TData; title?: string },
  ): void {
    const shell = ref.componentInstance;
    if (shell instanceof ModalShellComponent) shell.update(changes);
  }

  /**
   * The reusable Yes/No prompt `open()`'s own unsaved-changes guard uses internally — also usable
   * directly for anything else that wants the same prompt (e.g. a delete confirmation). Resolves
   * `true` if confirmed, `false` if cancelled (including via Escape — `ConfirmDialogComponent`
   * disables the backdrop/Escape close path, but `afterClosed()` can still emit `undefined` if a
   * consumer force-closes it programmatically, which this treats as "not confirmed").
   */
  confirm(message: string, options?: Omit<ConfirmDialogData, 'message'>): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        disableClose: true,
        data: { message, ...options },
      })
      .afterClosed()
      .pipe(map((confirmed) => confirmed ?? false));
  }
}
