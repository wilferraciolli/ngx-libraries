import { effect } from '@angular/core';
import type { Signal } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';
import type { MatInput } from '@angular/material/input';

/**
 * MatInput only works out its error state (red outline, visible mat-error) from an Angular forms
 * control bound to it. Picker inputs driven by hand have none, so this pushes the field's
 * touched && invalid state into them instead. Call from a constructor (needs an injection context).
 */
export function syncMatInputErrorState(
  inputs: Signal<readonly MatInput[]>,
  state: Signal<FieldState<unknown>>,
): void {
  effect(() => {
    const hasError = state().touched() && state().invalid();

    for (const input of inputs()) {
      if (input.errorState !== hasError) {
        input.errorState = hasError;
        input.stateChanges.next();
      }
    }
  });
}
