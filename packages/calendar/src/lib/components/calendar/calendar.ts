import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import {
  FullCalendarComponent,
  FullCalendarModule,
  type CalendarOptions,
  type EventInput,
} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import monarchTheme from '@fullcalendar/angular/themes/monarch';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import { ModalCloseAction, ModalService } from '@wiltech-labs/ngx-modals';
import { map } from 'rxjs';
import { Temporal } from 'temporal-polyfill';

import { NGX_CALENDAR_LOCALE } from '../../config/calendar-locale.token';
import { NGX_CALENDAR_TEXT } from '../../config/calendar-text.token';
import type { CalendarEvent, CalendarView } from '../../models/calendar-event.model';
import { eventsOnDay, todayIn, userTimeZone } from '../../utils/calendar-time.utils';
import { eventColors } from '../../utils/event-colors.utils';
import { DayEvents } from '../day-events/day-events';
import {
  EventDetail,
  type EventDetailData,
  type EventDetailResult,
} from '../event-detail/event-detail';

const FULL_CALENDAR_VIEWS: Record<CalendarView, string> = {
  day: 'timeGridDay',
  week: 'timeGridWeek',
  month: 'dayGridMonth',
};

/** A day cell's `Date` is that day's midnight in the calendar's zone; back to `'YYYY-MM-DD'`. */
function cellDate(date: Date, timeZone: string): string {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO(timeZone)
    .toPlainDate()
    .toString();
}

/**
 * Day, week and month views over FullCalendar, styled from the app's Material 3 tokens.
 *
 * - Wide screens: event chips show time and title. Clicking a day opens a side panel listing all
 *   of that day's events.
 * - Narrow screens: chips show only the time, and the selected day's events (today until the user
 *   picks another day) are listed below the calendar.
 * - Clicking an event opens it in an `ngx-modals` side panel. When `editable`, the panel's Edit
 *   form saves through `eventSave`; the calendar never changes `events` itself.
 */
@Component({
  selector: 'ngx-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatButtonToggleGroup,
    MatButtonToggle,
    DayEvents,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {
  public readonly events = input<readonly CalendarEvent[]>([]);
  public readonly view = model<CalendarView>('month');
  /** IANA zone the calendar is drawn in. Default: the user's own zone. */
  public readonly timeZone = input<string>(userTimeZone());
  /** Shows the Edit action in the event panel. A single event can opt out with `config.editable`. */
  public readonly editable = input(true);
  /** 0 = Sunday … 6 = Saturday. Default: the locale's own first day. */
  public readonly firstDay = input<number>();

  /** The edited event, after the user saves it in the event panel. */
  public readonly eventSave = output<CalendarEvent>();
  /** A day the user picked, `'YYYY-MM-DD'`. */
  public readonly daySelect = output<string>();

  private readonly modals = inject(ModalService);
  private readonly resolveLocale = inject(NGX_CALENDAR_LOCALE);
  private readonly resolveText = inject(NGX_CALENDAR_TEXT);
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly locale = computed(() => this.resolveLocale());
  protected readonly text = computed(() => this.resolveText());

  /** Below 600px: chips show only the time. */
  protected readonly compact = toSignal(
    this.breakpoints.observe('(max-width: 599.98px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );
  /** From 1200px: the day panel sits beside the grid instead of below it (narrower, the grid
   *  would be squeezed until chips can't show a title). */
  protected readonly expanded = toSignal(
    this.breakpoints.observe('(min-width: 1200px)').pipe(map((state) => state.matches)),
    { initialValue: true },
  );

  private readonly fullCalendar = viewChild.required(FullCalendarComponent);

  protected readonly title = signal('');
  protected readonly selectedDate = signal<string | null>(null);

  /** The day the panel lists: the picked day, or today on narrow screens until one is picked. */
  protected readonly panelDate = computed(
    () => this.selectedDate() ?? (this.expanded() ? null : todayIn(this.timeZone())),
  );
  protected readonly panelEvents = computed(() => {
    const date = this.panelDate();
    return date ? eventsOnDay(this.events(), date, this.timeZone()) : [];
  });

  protected readonly calendarEvents = computed<EventInput[]>(() =>
    this.events().map((event) => {
      const colors = eventColors(event.config);
      return {
        id: event.id,
        title: event.title,
        start: event.startDateTime,
        end: event.endDateTime,
        color: colors.background,
        contrastColor: colors.text,
        className: event.config?.className,
      };
    }),
  );

  protected readonly options = computed<CalendarOptions>(() => {
    const selected = this.selectedDate();
    const timeZone = this.timeZone();
    return {
      plugins: [monarchTheme, dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: FULL_CALENDAR_VIEWS[untracked(this.view)],
      headerToolbar: false,
      timeZone,
      locale: this.locale(),
      firstDay: this.firstDay(),
      height: '100%',
      nowIndicator: true,
      allDaySlot: false,
      dayMaxEvents: true,
      eventDisplay: 'block',
      scrollTime: '07:30:00',
      eventTimeFormat: { hour: 'numeric', minute: '2-digit' },
      dayCellClass: (info) =>
        cellDate(info.date, timeZone) === selected ? 'Calendar-selected-day' : '',
      datesSet: (info) => {
        this.title.set(info.view.title);
        this.syncSelection(
          info.view.type,
          cellDate(info.view.currentStart, timeZone),
          cellDate(info.view.currentEnd, timeZone),
        );
      },
      dateClick: (info) => this.selectDate(info.dateStr.slice(0, 10)),
      // "+N more" opens the day panel, which already lists the whole day, instead of a popover.
      // Returning the current view stops FullCalendar opening its own popover.
      moreLinkClick: (info) => {
        this.selectDate(cellDate(info.date, timeZone));
        return info.view.type;
      },
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        this.openEvent(info.event.id);
      },
    };
  });

  constructor() {
    // Keeps FullCalendar's own view in step with the `view` model, whichever side changed it.
    // `getApi()` is null until FullCalendar has rendered; the first view comes from `initialView`.
    effect(() => {
      const view = FULL_CALENDAR_VIEWS[this.view()];
      const api = this.fullCalendar().getApi() as ReturnType<
        FullCalendarComponent['getApi']
      > | null;
      if (api && api.view.type !== view) api.changeView(view);
    });
  }

  /** Chip time: the full range, or only the start where a narrow column can't fit a range. */
  protected chipTime(timeText: string, start: Date | null): string {
    if (!this.compact() || !start) return timeText;
    return Temporal.Instant.fromEpochMilliseconds(start.getTime())
      .toZonedDateTimeISO(this.timeZone())
      .toLocaleString(this.locale(), { hour: 'numeric', minute: '2-digit' });
  }

  protected setView(view: CalendarView): void {
    this.view.set(view);
  }

  protected previous(): void {
    this.fullCalendar().getApi().prev();
  }

  protected next(): void {
    this.fullCalendar().getApi().next();
  }

  protected goToToday(): void {
    this.fullCalendar().getApi().today();
  }

  protected selectDate(date: string): void {
    this.selectedDate.set(date);
    this.daySelect.emit(date);
  }

  /**
   * Keeps the day panel on a day that's on screen: Day view always shows the visible day; other
   * views drop a selection that has scrolled out of range (narrow screens, which always show a
   * day, fall back to the first visible day when today isn't in range either).
   */
  private syncSelection(viewType: string, start: string, end: string): void {
    if (viewType === FULL_CALENDAR_VIEWS.day) {
      this.selectedDate.set(start);
      return;
    }
    const inRange = (date: string | null) => !!date && date >= start && date < end;
    if (inRange(this.selectedDate())) return;
    const today = todayIn(this.timeZone());
    this.selectedDate.set(this.expanded() || inRange(today) ? null : start);
  }

  protected closeDay(): void {
    this.selectedDate.set(null);
  }

  protected openEvent(id: string): void {
    const event = this.events().find((candidate) => candidate.id === id);
    if (!event) return;

    this.modals
      .open<EventDetailResult, EventDetailData>(EventDetail, {
        title: event.title,
        data: {
          event,
          timeZone: this.timeZone(),
          locale: this.locale(),
          editable: this.editable(),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.action === ModalCloseAction.Updated && result.data) {
          this.eventSave.emit(result.data);
        }
      });
  }
}
