import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { FieldTree, ValidationError } from '@angular/forms/signals';
import { MatError } from '@angular/material/form-field';

/**
 * The hint/error line under a control that has no mat-form-field around it (checkbox, radio,
 * slider, instant date-time). Matches mat-form-field: errors replace the hint once touched.
 */
@Component({
  selector: 'ngx-field-subscript',
  standalone: true,
  imports: [MatError],
  templateUrl: './field-subscript.html',
  styleUrl: './field-subscript.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldSubscript {
  public readonly field = input.required<FieldTree<unknown>>();
  public readonly hint = input<string | undefined>(undefined);

  // Controls like mat-checkbox add their own message-less validator (Eg `required`) next to the
  // schema's, so keep one error per kind and prefer the one with a message.
  protected readonly errors = computed(() => {
    const byKind = new Map<string, ValidationError.WithFieldTree>();

    for (const error of this.field()().errors()) {
      const existing = byKind.get(error.kind);
      if (!existing || (!existing.message && error.message)) {
        byKind.set(error.kind, error);
      }
    }

    return [...byKind.values()];
  });
}
