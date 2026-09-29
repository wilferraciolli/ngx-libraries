import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Temporal } from 'temporal-polyfill';
import { provideLocaleDateAdapter } from '../../adapters/locale-date-adapter';
import { DEFAULT_DATE_TIME_LOCALE } from '../../constants/date-time.constants';
import type { DateTimeConfig } from '../../constants/date-time.constants';
import { ZonedDateTimeService } from '../../services/zoned-date-time.service';

/**
 * Date and time field whose form value is a UTC instant (YYYY-MM-DDThh:mm:ssZ), edited through the
 * Material datepicker and timepicker as the wall-clock time of `config.timeZone`.
 * The display format follows `config.locale`, not the browser's.
 */
@Component({
  selector: 'app-instant-date-time-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatTimepickerModule],
  providers: [provideLocaleDateAdapter()],
  templateUrl: './instant-date-time-field.html',
  styleUrl: './instant-date-time-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantDateTimeField implements FormValueControl<string | null> {
  public value = model<string | null>(null);

  public label = input<string>('Date and time');
  public config = input<DateTimeConfig | null | undefined>(null);

  /** FormUiControl contract: kept in sync with the bound field's validity by the Field directive. */
  public readonly invalid = input<boolean>(false);

  /** FormUiControl contract: marks the bound field touched, so its errors start showing. */
  public readonly touch = output<void>();

  private readonly zonedDateTime = inject(ZonedDateTimeService);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  /** Explains how a DST gap or overlap was resolved for the last value picked by the user. */
  protected readonly notice: WritableSignal<string | null> = signal(null);

  protected readonly timeZone = computed(() => this.config()?.timeZone || Temporal.Now.timeZoneId());
  protected readonly offset = computed(() => this.zonedDateTime.offset(this.value(), this.timeZone()));
  protected readonly minDate = computed(() => this.zonedDateTime.toDate(this.config()?.min, this.timeZone()));
  protected readonly maxDate = computed(() => this.zonedDateTime.toDate(this.config()?.max, this.timeZone()));

  // Only a change of the actual wall-clock time counts, so '' -> null (still empty) keeps a half-filled pick.
  private readonly wallClock = computed(
    () => this.zonedDateTime.toDate(this.value(), this.timeZone()),
    { equal: (a, b) => a?.getTime() === b?.getTime() }
  );

  // Both pickers follow the bound value, but can hold a half-filled pick until both parts are set.
  protected readonly date = linkedSignal(() => this.wallClock());
  protected readonly time = linkedSignal(() => this.wallClock());

  constructor() {
    effect(() => this.dateAdapter.setLocale(this.config()?.locale || DEFAULT_DATE_TIME_LOCALE));
  }

  protected onDateChange(date: Date | null): void {
    if (sameParts(date, this.date(), d => [d.getFullYear(), d.getMonth(), d.getDate()])) {
      return;
    }

    this.date.set(date);
    this.commit();
  }

  // The timepicker re-emits values we set on it (Eg on blur); ignoring those keeps a DST notice visible.
  protected onTimeChange(time: Date | null): void {
    if (sameParts(time, this.time(), t => [t.getHours(), t.getMinutes()])) {
      return;
    }

    this.time.set(time);
    this.commit();
  }

  private commit(): void {
    this.notice.set(null);

    const date = this.date();
    const time = this.time();

    if (!isValidDate(date) || !isValidDate(time)) {
      if (this.value() !== null) {
        this.value.set(null);
      }
      return;
    }

    const result = this.zonedDateTime.toInstant(date, time, this.timeZone(), this.config()?.disambiguation);
    this.value.set(result?.instant ?? null);
    this.notice.set(result?.notice ?? null);
  }
}

function isValidDate(value: Date | null): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

function sameParts(a: Date | null, b: Date | null, parts: (date: Date) => number[]): boolean {
  if (!isValidDate(a) || !isValidDate(b)) {
    return a === b;
  }

  const bParts = parts(b);
  return parts(a).every((part, index) => part === bParts[index]);
}
