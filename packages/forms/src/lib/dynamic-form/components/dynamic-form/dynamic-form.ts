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

  /** Tab inserts two spaces instead of moving focus, matching a code editor's behavior. */
  protected handleCodeKeydown(event: KeyboardEvent, field: FieldTree<unknown>): void {
    if (event.key !== 'Tab') {
      return;
    }

    event.preventDefault();

    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const indented = `${textarea.value.substring(0, start)}  ${textarea.value.substring(end)}`;

    textarea.value = indented;
    textarea.selectionStart = textarea.selectionEnd = start + 2;
    field().value.set(indented);
  }

  /** 0-100 position of `value` between `min` and `max`, for the range track's fill. */
  protected rangePercent(min: number | undefined, max: number | undefined, value: unknown): number {
    const lo = min ?? 0;
    const hi = max ?? 100;
    const numericValue = typeof value === 'number' ? value : lo;

    if (hi <= lo) {
      return 0;
    }

    return Math.max(0, Math.min(100, ((numericValue - lo) / (hi - lo)) * 100));
  }
}
