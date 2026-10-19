/**
 * Default close-reason vocabulary. Pass your own `TAction` to `ModalService.open()` /
 * `ModalCloseResult` if a modal's actions don't fit this set — it's a starting point, not a
 * closed list.
 */
export enum ModalCloseAction {
  /** Closed via the shell's X button with no unsaved changes, or after the unsaved-changes prompt
   *  was confirmed. No further meaning attached — check `data` only if the modal happens to set it. */
  Dismissed = 'DISMISSED',
  /** The modal's own content offered an explicit Cancel action and the user took it. */
  Cancelled = 'CANCELLED',
  /** A generic non-CRUD action completed (e.g. "approved", "sent") — use this when
   *  Created/Updated/Deleted don't fit. */
  Done = 'DONE',
  Created = 'CREATED',
  Updated = 'UPDATED',
  Deleted = 'DELETED',
}

/**
 * What a modal hands back to its caller on close — the action *and* the data travel together in
 * one object, so the caller only reads `data` when `action` says there is one to read:
 *
 * ```ts
 * modalService.open(HolidayApprovalModal, { data: request }).afterClosed().subscribe((result) => {
 *   if (result?.action === ModalCloseAction.Updated) refreshTeamCalendar(result.data);
 * });
 * ```
 */
export interface ModalCloseResult<TAction = ModalCloseAction, TData = unknown> {
  action: TAction;
  data: TData;
}
