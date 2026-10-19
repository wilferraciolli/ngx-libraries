import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import type { FieldDef } from '../../interfaces/field-definition';

/** Material select for the select field type: one choice out of `fieldDef.options`, in a dropdown. */
@Component({
  selector: 'ngx-select-field',
  standalone: true,
  imports: [FormField, MatFormFieldModule, MatSelect, MatOption],
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectField {
  public readonly fieldDef = input.required<FieldDef>();
  // `| null` for a select with no default choice — unselected holds null.
  public readonly field = input.required<
    FieldTree<string | number | boolean> | FieldTree<string | number | boolean | null>
  >();

  // [formField]'s typing can't take the union, but it handles a nullable value at runtime.
  protected readonly formField = computed(() => this.field() as FieldTree<string | number | boolean>);
}
