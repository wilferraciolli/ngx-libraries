import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal, viewChildren } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Temporal } from 'temporal-polyfill';
import { provideLocaleDateAdapter } from '../../adapters/locale-date-adapter';
import { DEFAULT_DATE_TIME_LOCALE } from '../../constants/date-time.constants';
import type { FieldDef } from '../../interfaces/field-definition';
import { syncMatInputErrorState } from '../../utils/mat-input-error-state';
import { ZonedDateTimeService } from '../../services/zoned-date-time.service';
import { FieldSubscript } from '../../shared/field-subscript/field-subscript';

/**
 * Date and time field whose form value is a UTC instant (YYYY-MM-DDThh:mm:ssZ), edited through the
 * Material datepicker and timepicker as the wall-clock time of `dateTimeConfig.timeZone`.
 * The display format follows `dateTimeConfig.locale`, not the browser's.
 */
@Component({
  selector: 'ngx-instant-date-time-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatTimepickerModule, FieldSubscript],
  providers: [provideLocaleDateAdapter()],
  templateUrl: './instant-date-time-field.html',
  styleUrl: './instant-date-time-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantDateTimeField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string | null>>();

  private readonly zonedDateTime = inject(ZonedDateTimeService);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);

  /** Explains how a DST gap or overlap was resolved for the last value picked by the user. */
  protected readonly notice: WritableSignal<string | null> = signal(null);

  protected readonly state = computed(() => this.field()());
  protected readonly config = computed(() => this.fieldDef().dateTimeConfig);
  protected readonly timeZone = computed(() => this.config()?.timeZone || Temporal.Now.timeZoneId());
  protected readonly offset = computed(() => this.zonedDateTime.offset(this.state().value(), this.timeZone()));
  protected readonly minDate = computed(() => this.zonedDateTime.toDate(this.config()?.min, this.timeZone()));
  protected readonly maxDate = computed(() => this.zonedDateTime.toDate(this.config()?.max, this.timeZone()));

  // Only a change of the actual wall-clock time counts, so '' -> null (still empty) keeps a half-filled pick.
  private readonly wallClock = computed(
    () => this.zonedDateTime.toDate(this.state().value(), this.timeZone()),
    { equal: (a, b) => a?.getTime() === b?.getTime() }
  );

  // Both pickers follow the bound value, but can hold a half-filled pick until both parts are set.
  protected readonly date = linkedSignal(() => this.wallClock());
  protected readonly time = linkedSignal(() => this.wallClock());

  private readonly inputs = viewChildren(MatInput);

  constructor() {
    syncMatInputErrorState(this.inputs, this.state);
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
    const value = this.state().value;

    if (!isValidDate(date) || !isValidDate(time)) {
      if (value() !== null) {
        value.set(null);
      }
      return;
    }

    const result = this.zonedDateTime.toInstant(date, time, this.timeZone(), this.config()?.disambiguation);
    value.set(result?.instant ?? null);
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
