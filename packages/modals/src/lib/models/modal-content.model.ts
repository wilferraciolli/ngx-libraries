/**
 * Optional contract a modal's content component implements so the shell's close button knows
 * whether to prompt before closing. Omit it entirely on a content component whose state is never
 * dirty (a read-only view, a wizard with nothing to lose) — the shell treats a component that
 * doesn't implement this as always safe to close immediately.
 */
export interface ModalContent {
  hasUnsavedChanges(): boolean;
}

function implementsModalContent(instance: unknown): instance is ModalContent {
  return typeof (instance as Partial<ModalContent> | null)?.hasUnsavedChanges === 'function';
}

/** Used by the shell's close button — never throws on content that doesn't implement `ModalContent`. */
export function hasUnsavedChanges(instance: unknown): boolean {
  return implementsModalContent(instance) && instance.hasUnsavedChanges();
}
