import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { Temporal } from 'temporal-polyfill';
import { UTC_DATE_TIME_FIELD_TYPE, UTC_DATE_TIME_LABEL } from '../../constants/utc-date-time.constants';
import type { UtcDateTimeConfig } from '../../constants/utc-date-time.constants';
import { parseUtcInstant } from '../../utils/utc-date-time.utils';
import type { FormValueControl } from '@angular/forms/signals';

let nextId: number = 0;

/**
 * Date and time field whose form value is always a UTC instant (YYYY-MM-DDThh:mm:ssZ),
 * while the user sees and edits the wall-clock time of the given `timeZone`.
 *
 * Conversions use the Temporal API (via temporal-polyfill until every runtime ships it natively),
 * so daylight-saving gaps and overlaps are resolved explicitly instead of by accident.
 *
 * Validation (required/min/max) is the dynamic form's job — see `toSchema()` — so the errors it
 * produces surface through the same `ErrorDetails` every other field uses, instead of a local copy.
 */
@Component({
  selector: 'app-utc-date-time-field',
  standalone: true,
  templateUrl: './utc-date-time-field.html',
  styleUrl: './utc-date-time-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtcDateTimeField implements FormValueControl<string | null> {
  public value = model<string | null>(null);

  public label = input<string>(UTC_DATE_TIME_LABEL);
  public config = input<UtcDateTimeConfig | null | undefined>(null);

  /** FormUiControl contract: kept in sync with the bound field's validity by the Field directive. */
  public readonly invalid = input<boolean>(false);

  public readonly fieldType: string = UTC_DATE_TIME_FIELD_TYPE;
  public readonly inputId: string = `utc-date-time-field-${nextId++}`;

  /** Explains how a DST gap or overlap was resolved for the last value typed by the user. */
  public readonly notice: WritableSignal<string | null> = signal(null);

  /** Falls back to the user's own timezone when none is configured. */
  public readonly effectiveTimeZone = computed(() => this.config()?.timeZone || Temporal.Now.timeZoneId());
  /** Falls back to 'earlier' when none is configured. */
  public readonly effectiveDisambiguation = computed(() => this.config()?.disambiguation || 'earlier');

  public readonly localValue = computed(() => toLocalDateTime(this.value(), this.effectiveTimeZone()));
  public readonly localMin = computed(() => toLocalDateTime(this.config()?.minUtc, this.effectiveTimeZone()));
  public readonly localMax = computed(() => toLocalDateTime(this.config()?.maxUtc, this.effectiveTimeZone()));
  public readonly offset = computed(() => toOffset(this.value(), this.effectiveTimeZone()));

  public onLocalInput(localDateTime: string): void {
    this.notice.set(null);

    if (!localDateTime) {
      this.value.set(null);
      return;
    }

    const timeZone: string = this.effectiveTimeZone();
    const plainDateTime = Temporal.PlainDateTime.from(localDateTime);
    const earlier = plainDateTime.toZonedDateTime(timeZone, { disambiguation: 'earlier' });
    const later = plainDateTime.toZonedDateTime(timeZone, { disambiguation: 'later' });

    let chosen = earlier;

    if (!earlier.equals(later)) {
      const isGap: boolean = !earlier.toPlainDateTime().equals(plainDateTime);

      if (isGap) {
        // clocks went forward, the wall time never happened: shift it forward by the gap
        chosen = later;
        this.notice.set(
          `${formatLocal(plainDateTime)} does not exist in ${timeZone} (clocks go forward). `
          + `Using ${formatLocal(chosen.toPlainDateTime())} (UTC${chosen.offset}) instead.`);
      } else {
        // clocks went back, the wall time happened twice
        chosen = this.effectiveDisambiguation() === 'later' ? later : earlier;
        this.notice.set(
          `${formatLocal(plainDateTime)} happens twice in ${timeZone} (clocks go back). `
          + `Using the ${chosen === earlier ? 'first' : 'second'} occurrence (UTC${chosen.offset}).`);
      }
    }

    this.value.set(chosen.toInstant().toString());
  }
}

/**
 * Converts a UTC instant into the YYYY-MM-DDThh:mm wall-clock value of a timezone,
 * as expected by a datetime-local input. Returns '' for empty or invalid values.
 */
function toLocalDateTime(value: string | null | undefined, timeZone: string): string {
  const instant = parseUtcInstant(value);

  if (!instant) {
    return '';
  }

  try {
    return formatLocal(instant.toZonedDateTimeISO(timeZone).toPlainDateTime());
  } catch {
    // invalid timezone id
    return '';
  }
}

function toOffset(value: string | null, timeZone: string): string | null {
  const instant = parseUtcInstant(value);

  if (!instant) {
    return null;
  }

  try {
    return instant.toZonedDateTimeISO(timeZone).offset;
  } catch {
    return null;
  }
}

function formatLocal(plainDateTime: Temporal.PlainDateTime): string {
  return plainDateTime.toString({ smallestUnit: 'minute' });
}
