import { ChangeDetectionStrategy, Component, computed, effect, inject, input, viewChildren } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { Temporal } from 'temporal-polyfill';
import { provideLocaleDateAdapter } from '../../adapters/locale-date-adapter';
import { NGX_FORMS_LOCALE } from '../../config/forms-locale.token';
import type { FieldDef } from '../../interfaces/field-definition';
import { syncMatInputErrorState } from '../../utils/mat-input-error-state';
import { parsePlainDate } from '../../utils/date-time.utils';

/**
 * Calendar date with no timezone, Eg Christmas Day: the form value is a plain 'YYYY-MM-DD' string
 * and means the same day wherever it is read. The display format follows `dateTimeConfig.locale`.
 */
@Component({
  selector: 'ngx-business-date-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [provideLocaleDateAdapter()],
  templateUrl: './business-date-field.html',
  styleUrl: './business-date-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessDateField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string | null>>();

  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly resolveLocale = inject(NGX_FORMS_LOCALE);

  protected readonly state = computed(() => this.field()());
  protected readonly date = computed(() => toDate(this.state().value()));
  protected readonly minDate = computed(() => toDate(this.fieldDef().dateTimeConfig?.min));
  protected readonly maxDate = computed(() => toDate(this.fieldDef().dateTimeConfig?.max));

  private readonly inputs = viewChildren(MatInput);

  constructor() {
    syncMatInputErrorState(this.inputs, this.state);
    effect(() => this.dateAdapter.setLocale(this.fieldDef().dateTimeConfig?.locale || this.resolveLocale()));
  }

  protected onDateChange(date: Date | null): void {
    if (!date || isNaN(date.getTime())) {
      this.state().value.set(null);
      return;
    }

    this.state().value.set(
      Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).toString()
    );
  }
}

function toDate(value: string | null | undefined): Date | null {
  const plainDate = parsePlainDate(value);
  return plainDate ? new Date(plainDate.year, plainDate.month - 1, plainDate.day) : null;
}
