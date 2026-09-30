# @wiltech-labs/ngx-modals

A right-docked panel modal, built on Angular Material's `MatDialog`: full viewport height, a third
of the screen wide by default, full screen on small screens. Give it any component and it comes back
with a typed close reason plus whatever data that component wants to hand over — and if that
component has unsaved changes, the panel's close button asks before losing them.

## Installation

```bash
npm install @wiltech-labs/ngx-modals
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/cdk`, `@angular/material`, `rxjs`
(all matching the Angular version already in your app). Needs `provideAnimationsAsync()` (or
`provideAnimations()`) at the app level, same as any other `MatDialog` use — nothing extra to
provide for this package itself, `ModalService` is root-provided.

## Usage

### The content component

```ts
import { Component, inject, input, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalCloseAction, ModalCloseResult, ModalContent } from '@wiltech-labs/ngx-modals';

interface ApprovalData {
  employeeName: string;
}
interface ApprovalResult {
  approved: boolean;
}

@Component({ selector: 'app-holiday-approval' /* ... */ })
export class HolidayApprovalModal implements ModalContent {
  data = input<ApprovalData>();

  private readonly note = signal('');
  private readonly dialogRef = inject(
    MatDialogRef<HolidayApprovalModal, ModalCloseResult<ModalCloseAction, ApprovalResult>>,
  );

  // Reported to the shell's close button — return true while there's something to lose.
  hasUnsavedChanges(): boolean {
    return this.note().length > 0;
  }

  protected approve(): void {
    this.dialogRef.close({ action: ModalCloseAction.Updated, data: { approved: true } });
  }

  protected cancel(): void {
    this.dialogRef.close({ action: ModalCloseAction.Cancelled, data: { approved: false } });
  }
}
```

A content component is a completely ordinary component — no base class to extend, no special
module. `data` (an `input()`, or `@Input() data?: TData`) is how it receives `ModalConfig.data`;
`ModalContent.hasUnsavedChanges()` is the only optional hook this package looks for, and only if you
declare it; injecting `MatDialogRef` and calling `.close(result)` is exactly how you'd close it if
you'd opened it with `MatDialog` directly — this package doesn't change that part at all.

### Opening it

```ts
import { Component, inject } from '@angular/core';
import { ModalCloseAction, ModalCloseResult, ModalService } from '@wiltech-labs/ngx-modals';

@Component({ selector: 'app-team-calendar' /* ... */ })
export class TeamCalendar {
  private readonly modals = inject(ModalService);

  protected approveRequest(employeeName: string): void {
    this.modals
      .open<ModalCloseResult<ModalCloseAction, { approved: boolean }>, ApprovalData>(
        HolidayApprovalModal,
        {
          title: 'Approve holiday request',
          data: { employeeName },
        },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result?.action === ModalCloseAction.Updated && result.data.approved) {
          this.refreshTeamCalendar();
        }
      });
  }
}
```

The panel docks to the right edge, full height, `33vw` wide by default — override the width per-open
(`{ width: '480px' }`) or app-wide via the `--ngx-modal-width` CSS custom property. Below the CDK's
`XSmall` breakpoint it's always full screen, regardless of the configured width. It can only be
closed via its own close button (or the content closing itself) — Escape and a backdrop click are
disabled, so the unsaved-changes guard can't be bypassed.

### A different close-reason vocabulary

`ModalCloseAction` (`Dismissed`/`Cancelled`/`Done`/`Created`/`Updated`/`Deleted`) is a starting
point, not a closed list. Both `ModalCloseResult` and `open()` are generic — define your own action
enum when a modal's outcomes don't fit:

```ts
enum ApprovalAction {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

this.modals.open<ModalCloseResult<ApprovalAction, ApprovalResult>>(HolidayApprovalModal, { data });
```

### A standalone confirm prompt

The same Yes/No prompt the unsaved-changes guard uses is available directly, for anything else that
wants it (a delete confirmation, say):

```ts
this.modals
  .confirm("Delete this provider? This can't be undone.", { confirmLabel: 'Delete' })
  .subscribe((confirmed) => {
    if (confirmed) this.delete();
  });
```

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── models/             # ModalCloseAction/ModalCloseResult, ModalContent, ModalConfig
    ├── components/
    │   ├── modal-shell/       # internal chrome — not part of the public API
    │   └── confirm-dialog/    # ConfirmDialogComponent
    └── services/modal.service.ts  # ModalService
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/modals
npm run build
cd dist
npm publish
```

Ensure `version` in the source `package.json` is updated before building, per semver conventions.
