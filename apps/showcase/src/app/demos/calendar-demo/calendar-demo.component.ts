import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  Calendar,
  type CalendarEvent,
  type CalendarHoliday,
  type CalendarRange,
  type CalendarView,
} from '@wiltech-labs/ngx-calendar';
import { Temporal } from 'temporal-polyfill';

const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const today = Temporal.Now.plainDateISO(zone);

/** UTC instant for `days` from today at `time` in the user's zone, `'YYYY-MM-DDTHH:mmZ'`. */
function at(days: number, time: string): string {
  return today
    .add({ days })
    .toZonedDateTime({ timeZone: zone, plainTime: Temporal.PlainTime.from(time) })
    .toInstant()
    .toString({ smallestUnit: 'minute' });
}

/** A business date `days` from today, `'YYYY-MM-DD'`, for all-day events. */
function day(days: number): string {
  return today.add({ days }).toString();
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'leave-1',
    title: 'Priya: annual leave',
    description: 'Back on the Monday after.',
    startDateTime: day(1),
    endDateTime: day(3),
    allDay: true,
    config: { color: 'secondary' },
  },

  {
    id: '1',
    title: 'Team stand-up',
    description: 'Daily sync. Keep it to 15 minutes.',
    startDateTime: at(0, '09:00'),
    endDateTime: at(0, '09:15'),
  },
  {
    id: '2',
    title: 'Design review: onboarding',
    description:
      'Walk through the new onboarding flow with product and engineering.\nBring the latest prototype.',
    startDateTime: at(0, '11:00'),
    endDateTime: at(0, '12:30'),
    config: { color: 'tertiary' },
  },
  {
    id: '3',
    title: 'Lunch with Priya',
    description: '',
    startDateTime: at(0, '13:00'),
    endDateTime: at(0, '14:00'),
    config: { color: 'secondary' },
  },
  {
    id: '4',
    title: 'Quarterly planning',
    description: 'Agree the three outcomes for next quarter.',
    startDateTime: at(1, '10:00'),
    endDateTime: at(1, '12:00'),
  },
  {
    id: '5',
    title: 'Production deploy window',
    description: 'Freeze starts at 16:00. No merges to main after that.',
    startDateTime: at(2, '16:00'),
    endDateTime: at(2, '18:00'),
    config: { color: 'error', editable: false },
  },
  {
    id: '6',
    title: 'Customer call: Northwind',
    description: 'Renewal discussion.',
    startDateTime: at(3, '15:30'),
    endDateTime: at(3, '16:15'),
    config: { color: 'secondary' },
  },
  {
    id: '7',
    title: 'Offsite',
    description: 'Two days at the lake house. Travel on the morning of day one.',
    startDateTime: at(6, '09:00'),
    endDateTime: at(7, '17:00'),
    config: { color: 'tertiary' },
  },
  {
    id: '8',
    title: '1:1 with Sam',
    description: '',
    startDateTime: at(-2, '14:00'),
    endDateTime: at(-2, '14:30'),
  },
  {
    id: '9',
    title: 'Retro',
    description: 'What went well, what to change.',
    startDateTime: at(-1, '16:00'),
    endDateTime: at(-1, '17:00'),
    config: { color: 'neutral' },
  },
  {
    id: '10',
    title: 'Security training',
    description: 'Mandatory annual module.',
    startDateTime: at(9, '10:00'),
    endDateTime: at(9, '11:00'),
    config: { color: 'error' },
  },
  {
    id: '11',
    title: 'Hiring panel',
    description: 'Senior frontend engineer, final round.',
    startDateTime: at(12, '13:30'),
    endDateTime: at(12, '15:00'),
    config: { color: 'secondary' },
  },
];

/** What an API using wiltech-labs-holidays sends, as it sends it. */
const SAMPLE_HOLIDAYS: CalendarHoliday[] = [
  { date: day(1), name: 'Founders Day', category: 'public' },
  { date: day(11), name: 'Office closed', category: 'company' },
];

@Component({
  selector: 'app-calendar-demo',
  standalone: true,
  imports: [Calendar, JsonPipe],
  templateUrl: './calendar-demo.component.html',
  styleUrl: './calendar-demo.component.scss',
})
export class CalendarDemoComponent {
  protected readonly events = signal<CalendarEvent[]>(SAMPLE_EVENTS);
  protected readonly holidays = signal<CalendarHoliday[]>(SAMPLE_HOLIDAYS);
  protected readonly view = signal<CalendarView>('month');
  protected readonly lastSaved = signal<CalendarEvent | null>(null);
  /** What `rangeChange` last reported: the app would load events for it. */
  protected readonly range = signal<CalendarRange | null>(null);

  /** The calendar only emits; the owner of the data applies the change. */
  protected onEventSave(saved: CalendarEvent): void {
    this.events.update((events) => events.map((event) => (event.id === saved.id ? saved : event)));
    this.lastSaved.set(saved);
  }
}
