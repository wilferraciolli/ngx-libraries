import { Component, computed, input } from '@angular/core';
import type { FieldState, FieldTree, ValidationError } from '@angular/forms/signals';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-error-details',
  standalone: true,
  imports: [MatError],
  templateUrl: './error-details.html',
  styleUrl: './error-details.scss',
})
export class ErrorDetails {
  readonly formField = input.required<FieldTree<unknown>>();

  protected readonly errors = computed<ValidationError.WithFieldTree[]>(() => {
    const fieldTree: FieldTree<unknown> = this.formField();
    const fieldState: FieldState<unknown> = fieldTree();

    if (fieldState.touched() && fieldState.invalid()) {
      return fieldState.errors();
    }

    return [];
  });
}
