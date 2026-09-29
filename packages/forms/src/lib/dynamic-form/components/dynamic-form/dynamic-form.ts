import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import type { InputSignal } from '@angular/core';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { TextField } from '../text-field/text-field';
import { TextareaField } from '../textarea-field/textarea-field';
import { CheckboxField } from '../checkbox-field/checkbox-field';
import { RadioField } from '../radio-field/radio-field';
import { SelectField } from '../select-field/select-field';
import { SliderField } from '../slider-field/slider-field';
import { BusinessDateField } from '../business-date-field/business-date-field';
import { BusinessTimeField } from '../business-time-field/business-time-field';
import { InstantDateTimeField } from '../instant-date-time-field/instant-date-time-field';
import type { FieldDef } from '../../interfaces/field-definition';
import type { BaseSchema } from '../../interfaces/base.schema';

/** Renders one Material field component per FieldDef, plus Save and Clear buttons. */
@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    MatButton,
    TextField,
    TextareaField,
    CheckboxField,
    RadioField,
    SelectField,
    SliderField,
    BusinessDateField,
    BusinessTimeField,
    InstantDateTimeField
  ],
  templateUrl: './dynamic-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-form.scss',
})
export class DynamicForm<T extends BaseSchema = BaseSchema> {
  public metaInfo: InputSignal<FieldDef[]> = input.required<FieldDef[]>();
  public dynamicForm: InputSignal<FieldTree<T>> = input.required<FieldTree<T>>();

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
