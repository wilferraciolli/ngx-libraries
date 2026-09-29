import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { FieldDef } from '../../interfaces/field-definition';

/**
 * Single-line Material input for the text, email, password, search and number field types.
 * `[formField]` sits on the native input, so Signals Forms and MatInput handle the value,
 * required marker, touched/disabled state and when the errors show.
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
  public readonly field = input.required<FieldTree<string> | FieldTree<number>>();

  // [formField]'s typing can't take the union, but it handles both text and number inputs at runtime.
  protected readonly formField = computed(() => this.field() as FieldTree<string>);
}
