import { Injectable } from '@angular/core';

import type { CalendarEvent, CalendarEventConfig } from '../models/calendar-event.model';

/** How to read each calendar field off one of the app's own objects. */
export interface CalendarEventMapping<TSource> {
  id: (item: TSource) => string;
  title: (item: TSource) => string;
  description?: (item: TSource) => string | null | undefined;
  /** UTC instant, `'YYYY-MM-DDTHH:mmZ'`. */
  startDateTime: (item: TSource) => string;
  /** UTC instant, `'YYYY-MM-DDTHH:mmZ'`. */
  endDateTime: (item: TSource) => string;
  config?: (item: TSource) => CalendarEventConfig | undefined;
}

/**
 * Turns the app's own objects (bookings, shifts, holidays...) into `CalendarEvent`s, keeping each
 * original on `source` so a saved event can be matched back to it.
 *
 * @example
 * events = computed(() =>
 *   this.mapper.map(this.store.bookings(), {
 *     id: (b) => b.id,
 *     title: (b) => b.customerName,
 *     description: (b) => b.notes,
 *     startDateTime: (b) => b.startsAt,
 *     endDateTime: (b) => b.endsAt,
 *     config: (b) => ({ color: b.confirmed ? 'primary' : 'tertiary' }),
 *   }),
 * );
 */
@Injectable({ providedIn: 'root' })
export class CalendarEventMapper {
  public map<TSource>(
    items: readonly TSource[],
    mapping: CalendarEventMapping<TSource>,
  ): CalendarEvent<TSource>[] {
    return items.map((item) => ({
      id: mapping.id(item),
      title: mapping.title(item),
      description: mapping.description?.(item) ?? '',
      startDateTime: mapping.startDateTime(item),
      endDateTime: mapping.endDateTime(item),
      config: mapping.config?.(item),
      source: item,
    }));
  }
}
