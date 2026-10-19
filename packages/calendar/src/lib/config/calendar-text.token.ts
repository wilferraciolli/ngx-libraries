import { InjectionToken } from '@angular/core';

export interface CalendarText {
  today: string;
  previous: string;
  next: string;
  day: string;
  week: string;
  month: string;
  viewLabel: string;
  closeDay: string;
  noEvents: string;
  edit: string;
  save: string;
  cancel: string;
  titleLabel: string;
  descriptionLabel: string;
  startLabel: string;
  endLabel: string;
  noDescription: string;
  endBeforeStart: string;
}

export const DEFAULT_CALENDAR_TEXT: CalendarText = {
  today: 'Today',
  previous: 'Previous',
  next: 'Next',
  day: 'Day',
  week: 'Week',
  month: 'Month',
  viewLabel: 'Calendar view',
  closeDay: 'Close day',
  noEvents: 'Nothing scheduled.',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  titleLabel: 'Title',
  descriptionLabel: 'Description',
  startLabel: 'Starts',
  endLabel: 'Ends',
  noDescription: 'No description.',
  endBeforeStart: 'The end must be after the start.',
};

/**
 * Same resolver pattern as `ngx-region-settings`' `NGX_REGION_SETTINGS_FORM_TEXT`: override it
 * (e.g. wired to `ngx-translations`) to translate the calendar. Unset, it stays English.
 */
export const NGX_CALENDAR_TEXT = new InjectionToken<() => CalendarText>('NGX_CALENDAR_TEXT', {
  providedIn: 'root',
  factory: () => () => DEFAULT_CALENDAR_TEXT,
});
