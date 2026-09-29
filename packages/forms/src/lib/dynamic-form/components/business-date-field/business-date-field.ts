import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Temporal } from 'temporal-polyfill';
import { provideLocaleDateAdapter } from '../../adapters/locale-date-adapter';
import { DEFAULT_DATE_TIME_LOCALE } from '../../constants/date-time.constants';
import type { DateTimeConfig } from '../../constants/date-time.constants';
import { parsePlainDate } from '../../utils/date-time.utils';

/**
 * Calendar date with no timezone, Eg Christmas Day: the form value is a plain 'YYYY-MM-DD' string
 * and means the same day wherever it is read. The display format follows `config.locale`.
 */
@Component({
  selector: 'app-business-date-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [provideLocaleDateAdapter()],
  templateUrl: './business-date-field.html',
  styleUrl: './business-date-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessDateField implements FormValueControl<string | null> {
  public value = model<string | null>(null);

  public label = input<string>('Date');
  public config = input<DateTimeConfig | null | undefined>(null);

  /** FormUiControl contract: kept in sync with the bound field's validity by the Field directive. */
  public readonly invalid = input<boolean>(false);

  /** FormUiControl contract: marks the bound field touched, so its errors start showing. */
  public readonly touch = output<void>();

  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  protected readonly date = computed(() => toDate(this.value()));
  protected readonly minDate = computed(() => toDate(this.config()?.min));
  protected readonly maxDate = computed(() => toDate(this.config()?.max));

  constructor() {
    effect(() => this.dateAdapter.setLocale(this.config()?.locale || DEFAULT_DATE_TIME_LOCALE));
  }

  protected onDateChange(date: Date | null): void {
    if (!date || isNaN(date.getTime())) {
      this.value.set(null);
      return;
    }

    this.value.set(
      Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).toString()
    );
  }
}

function toDate(value: string | null | undefined): Date | null {
  const plainDate = parsePlainDate(value);
  return plainDate ? new Date(plainDate.year, plainDate.month - 1, plainDate.day) : null;
}
