import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  viewChildren,
} from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { DateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Temporal } from 'temporal-polyfill';
import { provideLocaleDateAdapter } from '../../adapters/locale-date-adapter';
import { NGX_FORMS_LOCALE } from '../../config/forms-locale.token';
import type { FieldDef } from '../../interfaces/field-definition';
import { syncMatInputErrorState } from '../../utils/mat-input-error-state';
import { parsePlainTime } from '../../utils/date-time.utils';

/**
 * Time of day with no timezone, Eg "open from 09:00": the form value is a plain 'HH:mm' string
 * and means the same clock time wherever it is read. The display format follows `dateTimeConfig.locale`.
 */
@Component({
  selector: 'ngx-business-time-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTimepickerModule],
  providers: [provideLocaleDateAdapter()],
  templateUrl: './business-time-field.html',
  styleUrl: './business-time-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessTimeField {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly field = input.required<FieldTree<string | null>>();

  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly resolveLocale = inject(NGX_FORMS_LOCALE);

  protected readonly state = computed(() => this.field()());
  protected readonly time = computed(() => toDate(this.state().value()));
  protected readonly minTime = computed(() => toDate(this.fieldDef().dateTimeConfig?.min));
  protected readonly maxTime = computed(() => toDate(this.fieldDef().dateTimeConfig?.max));

  private readonly inputs = viewChildren(MatInput);

  constructor() {
    syncMatInputErrorState(this.inputs, this.state);
    effect(() =>
      this.dateAdapter.setLocale(this.fieldDef().dateTimeConfig?.locale || this.resolveLocale()),
    );
  }

  protected onTimeChange(time: Date | null): void {
    if (!time || isNaN(time.getTime())) {
      this.state().value.set(null);
      return;
    }

    this.state().value.set(
      Temporal.PlainTime.from({ hour: time.getHours(), minute: time.getMinutes() }).toString({
        smallestUnit: 'minute',
      }),
    );
  }
}

// The timepicker only reads the hours/minutes of this Date; 1 Jan is used because no timezone changes clocks on it.
function toDate(value: string | null | undefined): Date | null {
  const plainTime = parsePlainTime(value);
  return plainTime ? new Date(2000, 0, 1, plainTime.hour, plainTime.minute) : null;
}
