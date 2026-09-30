import { Temporal } from 'temporal-polyfill';
import type { ValidationError } from '@angular/forms/signals';
import { FormFieldType } from '../constants/form-field.constant';
import {
  BUSINESS_DATE_INVALID_ERROR_LABEL,
  BUSINESS_TIME_INVALID_ERROR_LABEL,
  INSTANT_DATE_TIME_INVALID_ERROR_LABEL,
} from '../constants/date-time.constants';
import type { FieldDef } from '../interfaces/field-definition';

/** Parses a UTC instant, Eg '2024-03-31T01:30:00Z'. Null instead of throwing for empty/invalid input. */
export function parseInstant(value: string | null | undefined): Temporal.Instant | null {
  return tryParse(value, (v) => Temporal.Instant.from(v));
}

/** Parses a calendar date, Eg '2024-12-25'. Null instead of throwing for empty/invalid input. */
export function parsePlainDate(value: string | null | undefined): Temporal.PlainDate | null {
  return tryParse(value, (v) => Temporal.PlainDate.from(v));
}

/** Parses a time of day, Eg '09:00'. Null instead of throwing for empty/invalid input. */
export function parsePlainTime(value: string | null | undefined): Temporal.PlainTime | null {
  return tryParse(value, (v) => Temporal.PlainTime.from(v));
}

interface DateTimeRule<T> {
  parse: (value: string | null | undefined) => T | null;
  compare: (a: T, b: T) => number;
  invalidMessage: string;
}

const DATE_TIME_RULES: Partial<Record<FormFieldType, DateTimeRule<any>>> = {
  [FormFieldType.INSTANT_DATE_TIME]: {
    parse: parseInstant,
    compare: Temporal.Instant.compare,
    invalidMessage: INSTANT_DATE_TIME_INVALID_ERROR_LABEL,
  },
  [FormFieldType.BUSINESS_DATE]: {
    parse: parsePlainDate,
    compare: Temporal.PlainDate.compare,
    invalidMessage: BUSINESS_DATE_INVALID_ERROR_LABEL,
  },
  [FormFieldType.BUSINESS_TIME]: {
    parse: parsePlainTime,
    compare: Temporal.PlainTime.compare,
    invalidMessage: BUSINESS_TIME_INVALID_ERROR_LABEL,
  },
};

export function isDateTimeField(type: FormFieldType): boolean {
  return type in DATE_TIME_RULES;
}

/** Format and dateTimeConfig min/max check for the date/time field types; null when valid or empty. */
export function dateTimeError(value: string | null, fieldDef: FieldDef): ValidationError | null {
  const rule = DATE_TIME_RULES[fieldDef.type];
  if (!rule || !value) {
    return null;
  }

  const parsed = rule.parse(value);
  if (!parsed) {
    return { kind: 'invalidDateTime', message: rule.invalidMessage };
  }

  const min = fieldDef.dateTimeConfig?.min;
  const parsedMin = rule.parse(min);
  if (parsedMin && rule.compare(parsed, parsedMin) < 0) {
    return { kind: 'minDateTime', message: `${fieldDef.label} cannot be before ${min}` };
  }

  const max = fieldDef.dateTimeConfig?.max;
  const parsedMax = rule.parse(max);
  if (parsedMax && rule.compare(parsed, parsedMax) > 0) {
    return { kind: 'maxDateTime', message: `${fieldDef.label} cannot be after ${max}` };
  }

  return null;
}

function tryParse<T>(value: string | null | undefined, parse: (value: string) => T): T | null {
  if (!value) {
    return null;
  }

  try {
    return parse(value);
  } catch {
    return null;
  }
}
