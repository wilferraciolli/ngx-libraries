# @wiltech-labs/ngx-modals

A right-docked panel modal on `MatDialog` — full viewport height, a third of the screen wide by
default, full screen below the CDK's `XSmall` breakpoint — with a typed close-reason + data result
and an unsaved-changes guard on its close button. See root `../../CLAUDE.md` for repo-wide
conventions.

Decided 2026-09-30: an existing app's own `DialogService`/`MatConfirmDialogComponent` (a thin
`MatDialog` wrapper plus a close-reason enum and a small Yes/No prompt) was the starting shape —
worth generalizing, not worth copying verbatim (it predates Signals, and the right-panel layout is a
new requirement that prior art never had). See root `NEXT_STEPS.md` for the fuller decision history.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── models/             # ModalCloseAction/ModalCloseResult, ModalContent (+hasUnsavedChanges()),
    │                       # ModalConfig (+ internal ModalShellData)
    ├── components/
    │   ├── modal-shell/       # ModalShellComponent — chrome only, NOT exported (see below)
    │   └── confirm-dialog/    # ConfirmDialogComponent — the reusable Yes/No prompt
    └── services/
        └── modal.service.ts   # ModalService — open()/confirm()
```

## Conventions

- **`ModalService.open()` is the only entry point** — it wraps the caller's content component in
  `ModalShellComponent` (positioning, the close button, the unsaved-changes guard) and opens that
  through `MatDialog`. `ModalShellComponent` is deliberately **not exported** from `public-api.ts`
  — `open()`'s return type (`MatDialogRef<unknown, TResult>`) erases it, so nothing outside this
  package ever needs to name it.
- **How the content component gets its data and closes itself**: `ModalShellComponent` creates the
  caller's component dynamically (`ViewContainerRef.createComponent()`) inside its own view, then
  calls `.setInput('data', config.data)` — the content component declares a matching `data` input
  (`data = input<TData>()`). Because that dynamic creation happens inside a view whose own element
  injector chains up through the dialog's injector (the one `MatDialogRef`/`MAT_DIALOG_DATA` are
  provided in — this is how `MatDialog`/CDK Dialog wires up the component _it_ creates), the content
  component can `inject(MatDialogRef<ItsOwnType, ItsOwnResultType>)` directly and call
  `.close(result)` itself, exactly as if `MatDialog.open()` had opened it directly. Generic type
  parameters on `MatDialogRef` are compile-time only — every component in the tree resolves the
  same runtime singleton for one open dialog, regardless of what each site's own generic argument
  says.
- **The X button's dirty check**: content components report unsaved state by implementing the
  optional `ModalContent.hasUnsavedChanges(): boolean`. The shell checks it (via the
  `hasUnsavedChanges()` helper, which returns `false` for content that doesn't implement it) before
  closing on an X click — dirty content gets `ModalService`'s own `ConfirmDialogComponent` prompt
  first, clean content closes immediately with `{ action: ModalCloseAction.Dismissed, data: undefined }`.
- **`disableClose: true` on the outer dialog** — Escape and a backdrop click do nothing; the shell's
  X button (which runs the dirty check) or the content calling `MatDialogRef.close()` itself
  (e.g. after a successful save) are the only ways out. This is deliberate, not an oversight: it's
  what makes the dirty-check guarantee actually hold — a bypassable Escape/backdrop would defeat it.
- **Positioning and responsiveness are pure `MatDialogConfig`, no shipped global CSS.** `position:
{top:'0', right:'0'}`, `height: '100vh'`, `width: config.width ?? 'var(--ngx-modal-width, 33vw)'`
  are all inline styles CDK applies directly to the overlay pane — no stylesheet needed. Below the
  CDK's `Breakpoints.XSmall`, `ModalService.open()` calls `dialogRef.updateSize('100vw', '100vh')`
  via a `BreakpointObserver.observe()` subscription (unsubscribed on `afterClosed()`), same pattern
  the prior art used for its own responsive resize.
- **Known v1 gap, deliberately deferred**: no slide-in-from-right transition or square-left-corner
  surface shape — Material's default fade/scale transition and rounded corners apply as-is. Fixing
  this means styling `.cdk-overlay-pane`/`.mat-mdc-dialog-container` via `panelClass`, which needs a
  _global_ (non-component-encapsulated) stylesheet — `::ng-deep` from `ModalShellComponent` can't
  reach those elements, they're CDK-created ancestors of its own root element, not descendants. No
  established mechanism in this repo yet for a package to ship loose global CSS an app imports
  (every other package's styling is either component-encapsulated or a `--ngx-*`/`--mat-sys-*`
  custom property, neither of which reaches overlay-pane-level surface shape/animation). Positioning
  and sizing (the actual right-panel-not-centered-dialog requirement) work correctly without it;
  only the cosmetic slide/corner polish is missing. Revisit once (or if) that packaging mechanism
  exists — see this package's entry in root `NEXT_STEPS.md`.
- **`ModalCloseAction`'s six members are a starting vocabulary, not a fixed contract** — both
  `ModalCloseResult` and `ModalService.open<TResult>()` are generic, so a modal whose actions don't
  fit (`Approved`/`Rejected`, say) defines its own `TAction` and passes a `ModalCloseResult<TAction,
TData>` as `open()`'s `TResult`.
- No dependency on `@wiltech-labs/ngx-styles` (doesn't exist yet) for the width token —
  `--ngx-modal-width` is this package's own custom property, following the same "token default, no
  hex fallback needed here since it's a length not a colour" pattern.
- Real Angular constructs (`@Injectable`, `@Component`), Material-based (inherits the app theme
  directly, same as `ngx-forms` — no `--ngx-*` colour indirection needed, per
  `docs/ANGULAR_APP_CONVENTIONS.md`'s "Material-based packages inherit the app theme directly").

## Status

- New package: `ModalService` (`open()`/`confirm()`), `ModalCloseAction`/`ModalCloseResult`,
  `ModalContent`/`hasUnsavedChanges()`, `ModalConfig`, `ConfirmDialogComponent`/`ConfirmDialogData`.
- `tsc --noEmit` and `ng-packagr build` both clean. Wired into `apps/showcase` at `/modals` (a
  holiday-approval demo exercising data-in, the dirty-check guard, and a typed close result) and
  confirmed the app itself builds clean with it — **not yet clicked through in an actual browser**
  (no browser-automation tool available in this session, unlike the Playwright verification other
  demos in this repo got). The dynamic-component/`MatDialogRef` injection mechanism above is sound
  per Angular's documented `ViewContainerRef`/injector-hierarchy behaviour, but flagging this
  explicitly rather than claiming a check that didn't happen — worth an actual browser pass before
  this is considered done.
- Not yet published to npm — under development.
- No consumers yet within this monorepo.
