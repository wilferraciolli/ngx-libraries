import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import type { FieldDef } from '../../interfaces/field-definition';
import { FieldSubscript } from '../../shared/field-subscript/field-subscript';

/** Material checkbox for the checkbox field type: a single yes/no value. */
@Component({
  selector: 'ngx-checkbox-field',
  standalone: true,
  imports: [FormField, MatCheckbox, FieldSubscript],
  templateUrl: './checkbox-field.html',
  styleUrl: './checkbox-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<boolean>>();
}
