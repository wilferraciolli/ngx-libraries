import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import type { InputSignal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import { ErrorDetails } from '../../shared/error-details/error-details';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButton } from '@angular/material/button';
import { UtcDateTimeField } from '../utc-date-time-field/utc-date-time-field';
import { UtcDateTimeCustomField } from '../utc-date-time-custom-field/utc-date-time-custom-field';
import type { FieldDef } from '../../interfaces/field-definition';
import type { BaseSchema } from '../../interfaces/base.schema';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ErrorDetails,
    MatTabsModule,
    FormField,
    MatButton,
    UtcDateTimeField,
    UtcDateTimeCustomField
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
