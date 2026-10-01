import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import type { CalendarText } from '../../config/calendar-text.token';
import type { CalendarEvent } from '../../models/calendar-event.model';
import { formatDayHeading, formatTimeRange } from '../../utils/calendar-time.utils';
import { eventColors } from '../../utils/event-colors.utils';

/**
 * Every event on one day, as a grouped list. `Calendar` shows it beside the grid on wide screens
 * and below it on narrow ones, where event chips only have room for the time.
 */
@Component({
  selector: 'ngx-calendar-day-events',
  standalone: true,
  imports: [MatIconButton, MatIcon],
  templateUrl: './day-events.html',
  styleUrl: './day-events.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayEvents {
  /** Business date, `'YYYY-MM-DD'`. */
  public readonly date = input.required<string>();
  /** That day's events, earliest first. */
  public readonly events = input.required<readonly CalendarEvent[]>();
  public readonly timeZone = input.required<string>();
  public readonly locale = input.required<string>();
  public readonly text = input.required<CalendarText>();
  /** Shows a close button (the wide-screen side panel can be closed; the narrow-screen list can't). */
  public readonly closable = input(false);

  public readonly eventOpen = output<CalendarEvent>();
  public readonly closed = output<void>();

  protected readonly heading = computed(() => formatDayHeading(this.date(), this.locale()));
  protected readonly rows = computed(() =>
    this.events().map((event) => ({
      event,
      time: formatTimeRange(event.startDateTime, event.endDateTime, this.timeZone(), this.locale()),
      accent: eventColors(event.config).background,
    })),
  );
}
