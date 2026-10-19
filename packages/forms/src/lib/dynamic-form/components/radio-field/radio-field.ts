import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import type { FieldDef } from '../../interfaces/field-definition';
import { FieldSubscript } from '../../shared/field-subscript/field-subscript';

let nextId: number = 0;

/** Material radio group for the radio field type: one choice out of `fieldDef.options`, all visible. */
@Component({
  selector: 'ngx-radio-field',
  standalone: true,
  imports: [FormField, MatRadioGroup, MatRadioButton, FieldSubscript],
  templateUrl: './radio-field.html',
  styleUrl: './radio-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string | number | boolean>>();

  protected readonly labelId: string = `radio-field-label-${nextId++}`;
}
