import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { FieldDef } from '../../interfaces/field-definition';

/**
 * Single-line Material text input for the text, password and search field types.
 * `[formField]` sits on the native input, so Signals Forms and MatInput handle the value,
 * touched/disabled state and when the errors show.
 */
@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [FormField, MatFormFieldModule, MatInputModule],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string>>();
}
