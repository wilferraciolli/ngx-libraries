export const UTC_DATE_TIME_FIELD_TYPE: string = 'datetime-local';
export const UTC_DATE_TIME_LABEL: string = 'Enter date and time';

export const UTC_DATE_TIME_REQUIRED_ERROR_LABEL: string = 'This field is required.';
export const UTC_DATE_TIME_INVALID_ERROR_LABEL: string = 'The value is not a valid UTC date and time.';
export const UTC_DATE_TIME_MIN_ERROR_LABEL: string = 'Date Time cannot be before ';
export const UTC_DATE_TIME_MAX_ERROR_LABEL: string = 'Date Time cannot be after ';

/** Which instant to pick when a wall-clock time happens twice (clocks going back). */
export type UtcDateTimeDisambiguation = 'earlier' | 'later';

/** Config for a UtcDateTimeField / UtcDateTimeCustomField. */
export interface UtcDateTimeConfig {
  timeZone?: string;                             // IANA zone id, Eg 'Europe/London'. Defaults to the user's timezone.
  minUtc?: string;                               // Minimum allowed instant in UTC, Eg '2024-01-01T00:00:00Z'.
  maxUtc?: string;                               // Maximum allowed instant in UTC, Eg '2025-12-31T23:59:00Z'.
  disambiguation?: UtcDateTimeDisambiguation;    // Which occurrence to use when a wall-clock time happens twice.
}
