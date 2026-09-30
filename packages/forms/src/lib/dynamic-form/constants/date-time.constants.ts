export const DEFAULT_DATE_TIME_LOCALE: string = 'en-GB';

export const INSTANT_DATE_TIME_INVALID_ERROR_LABEL: string = 'Not a valid date and time.';
export const BUSINESS_DATE_INVALID_ERROR_LABEL: string = 'Not a valid date.';
export const BUSINESS_TIME_INVALID_ERROR_LABEL: string = 'Not a valid time.';

/** Which instant to pick when a wall-clock time happens twice (clocks going back). */
export type DateTimeDisambiguation = 'earlier' | 'later';

/**
 * Config for the business-date, business-time and instant-date-time fields.
 * `min`/`max` use the field's own value format: '2024-12-25', '09:00' or '2024-01-01T00:00:00Z'.
 */
export interface DateTimeConfig {
  locale?: string; // Display and typing format, Eg 'en-GB' (31/03/2024) or 'en-US'. Defaults to 'en-GB'.
  min?: string; // Earliest allowed value, in the field's value format.
  max?: string; // Latest allowed value, in the field's value format.
  timeZone?: string; // instant-date-time only: IANA zone the user edits in. Defaults to the user's timezone.
  disambiguation?: DateTimeDisambiguation; // instant-date-time only: which occurrence when a wall-clock time happens twice.
}
