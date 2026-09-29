import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string | number | boolean>>();
}
