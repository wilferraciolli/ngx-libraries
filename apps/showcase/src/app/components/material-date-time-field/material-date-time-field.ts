import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, model, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Temporal } from 'temporal-polyfill';
import { ZonedDateTimeService } from '../../services/zoned-date-time.service';
import type { ZonedDisambiguation } from '../../services/zoned-date-time.service';
import { LocaleDateAdapter } from './locale-date-adapter';

const DEFAULT_LOCALE: string = 'en-GB';

export interface MaterialDateTimeConfig {
  timeZone?: string;                      // IANA zone id, Eg 'Europe/London'. Defaults to the user's timezone.
  minUtc?: string;                        // Minimum allowed instant in UTC, Eg '2024-01-01T00:00:00Z'.
  maxUtc?: string;                        // Maximum allowed instant in UTC, Eg '2025-12-31T23:59:00Z'.
  disambiguation?: ZonedDisambiguation;   // Which occurrence to use when a wall-clock time happens twice.
  locale?: string;                        // Display/typing format, Eg 'en-GB' (31/03/2024) or 'en-US'. Defaults to 'en-GB'.
}

/**
 * Date and time field whose form value is a UTC instant (YYYY-MM-DDThh:mm:ssZ), edited through the
 * Angular Material datepicker and timepicker as the wall-clock time of `timeZone`.
 *
 * The display format comes from `locale` rather than the browser, because this component provides
 * its own DateAdapter instance instead of sharing the app-wide one.
 */
@Component({
  selector: 'app-material-date-time-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatTimepickerModule],
  providers: [
    { provide: DateAdapter, useClass: LocaleDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
  ],
  templateUrl: './material-date-time-field.html',
  styleUrl: './material-date-time-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialDateTimeField implements FormValueControl<string | null> {
  public value = model<string | null>(null);

  public label = input<string>('Enter date and time');
  public config = input<MaterialDateTimeConfig | null | undefined>(null);

  /** FormUiControl contract: kept in sync with the bound field's validity by the Field directive. */
  public readonly invalid = input<boolean>(false);

  private readonly zonedDateTime = inject(ZonedDateTimeService);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  /** Explains how a DST gap or overlap was resolved for the last value picked by the user. */
  protected readonly notice: WritableSignal<string | null> = signal(null);

  protected readonly timeZone = computed(() => this.config()?.timeZone || Temporal.Now.timeZoneId());
  protected readonly offset = computed(() => this.zonedDateTime.offset(this.value(), this.timeZone()));
  protected readonly minDate = computed(() => this.zonedDateTime.toDate(this.config()?.minUtc, this.timeZone()));
  protected readonly maxDate = computed(() => this.zonedDateTime.toDate(this.config()?.maxUtc, this.timeZone()));

  // Both pickers follow the bound value, but can hold a half-filled pick until both parts are set.
  protected readonly date = linkedSignal(() => this.zonedDateTime.toDate(this.value(), this.timeZone()));
  protected readonly time = linkedSignal(() => this.zonedDateTime.toDate(this.value(), this.timeZone()));

  constructor() {
    effect(() => this.dateAdapter.setLocale(this.config()?.locale || DEFAULT_LOCALE));
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
