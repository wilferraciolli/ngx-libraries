import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Temporal } from 'temporal-polyfill';
import { provideLocaleDateAdapter } from '../../adapters/locale-date-adapter';
import { DEFAULT_DATE_TIME_LOCALE } from '../../constants/date-time.constants';
import type { DateTimeConfig } from '../../constants/date-time.constants';
import { parsePlainTime } from '../../utils/date-time.utils';

/**
 * Time of day with no timezone, Eg "open from 09:00": the form value is a plain 'HH:mm' string
 * and means the same clock time wherever it is read. The display format follows `config.locale`.
 */
@Component({
  selector: 'app-business-time-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTimepickerModule],
  providers: [provideLocaleDateAdapter()],
  templateUrl: './business-time-field.html',
  styleUrl: './business-time-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessTimeField implements FormValueControl<string | null> {
  public value = model<string | null>(null);

  public label = input<string>('Time');
  public config = input<DateTimeConfig | null | undefined>(null);

  /** FormUiControl contract: kept in sync with the bound field's validity by the Field directive. */
  public readonly invalid = input<boolean>(false);

  /** FormUiControl contract: marks the bound field touched, so its errors start showing. */
  public readonly touch = output<void>();

  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  protected readonly time = computed(() => toDate(this.value()));
  protected readonly minTime = computed(() => toDate(this.config()?.min));
  protected readonly maxTime = computed(() => toDate(this.config()?.max));

  constructor() {
    effect(() => this.dateAdapter.setLocale(this.config()?.locale || DEFAULT_DATE_TIME_LOCALE));
  }

  protected onTimeChange(time: Date | null): void {
    if (!time || isNaN(time.getTime())) {
      this.value.set(null);
      return;
    }

    this.value.set(
      Temporal.PlainTime.from({ hour: time.getHours(), minute: time.getMinutes() }).toString({ smallestUnit: 'minute' })
    );
  }
}

// The timepicker only reads the hours/minutes of this Date; 1 Jan is used because no timezone changes clocks on it.
function toDate(value: string | null | undefined): Date | null {
  const plainTime = parsePlainTime(value);
  return plainTime ? new Date(2000, 0, 1, plainTime.hour, plainTime.minute) : null;
}
