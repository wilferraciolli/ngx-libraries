import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import type { InputSignal } from '@angular/core';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { TextField } from '../text-field/text-field';
import { TextareaField } from '../textarea-field/textarea-field';
import { CheckboxField } from '../checkbox-field/checkbox-field';
import { RadioField } from '../radio-field/radio-field';
import { SelectField } from '../select-field/select-field';
import { ChipsField } from '../chips-field/chips-field';
import { SliderField } from '../slider-field/slider-field';
import { BusinessDateField } from '../business-date-field/business-date-field';
import { BusinessTimeField } from '../business-time-field/business-time-field';
import { InstantDateTimeField } from '../instant-date-time-field/instant-date-time-field';
import type { FieldDef } from '../../interfaces/field-definition';
import type { BaseSchema } from '../../interfaces/base.schema';

/**
 * Renders one Material field component per FieldDef, then right-aligned actions: a text
 * secondary action ("Clear" by default — label it "Cancel" when it leaves the form) and the filled
 * primary one ("Save"). Name both after what they do.
 */
@Component({
  selector: 'ngx-dynamic-form',
  standalone: true,
  imports: [
    MatButton,
    TextField,
    TextareaField,
    CheckboxField,
    RadioField,
    SelectField,
    ChipsField,
    SliderField,
    BusinessDateField,
    BusinessTimeField,
    InstantDateTimeField,
  ],
  templateUrl: './dynamic-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-form.scss',
})
export class DynamicForm<T extends BaseSchema = BaseSchema> {
  public metaInfo: InputSignal<FieldDef[]> = input.required<FieldDef[]>();
  public dynamicForm: InputSignal<FieldTree<T>> = input.required<FieldTree<T>>();

  /** Filled primary action. */
  public readonly submitLabel = input('Save');
  /** Text secondary action; emits `onFormClear`. */
  public readonly clearLabel = input('Clear');

  public onFormSubmit = output<void>();
  public onFormClear = output<void>();

  protected handleSubmit(): void {
    const fieldTree: FieldTree<unknown> = this.dynamicForm();
    const fieldState: FieldState<unknown> = fieldTree();

    if (fieldState.valid()) {
      this.onFormSubmit.emit();
    }
  }

  protected clearForm(): void {
    this.onFormClear.emit();
  }
}
