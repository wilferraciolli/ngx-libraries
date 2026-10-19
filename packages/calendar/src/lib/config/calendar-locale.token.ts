import { InjectionToken } from '@angular/core';

export type CalendarLocaleResolver = () => string;

/**
 * Locale for dates, times, weekday names and the first day of the week. Same resolver pattern as
 * `ngx-dates`' `NGX_DATES_LOCALE`: wire it to `ngx-translations` in the app to follow a language
 * switch. Unset, it follows the browser's language.
 */
export const NGX_CALENDAR_LOCALE = new InjectionToken<CalendarLocaleResolver>(
  'NGX_CALENDAR_LOCALE',
  {
    providedIn: 'root',
    factory: () => () => (typeof navigator !== 'undefined' && navigator.language) || 'en-GB',
  },
);
