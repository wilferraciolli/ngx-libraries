# @wiltech-labs/ngx-calendar

Day, week and month calendar for Angular apps, built on [FullCalendar](https://fullcalendar.io) 7
and styled from the app's Material 3 tokens (light and dark, no palette file).

- **Wide screens (≥ 1200px):** event chips show time and title. Clicking a day (or "+N more")
  opens a side panel listing every event that day; in Day view it follows the visible day.
- **Narrower screens:** the same day panel sits below the calendar.
- **Phones:** chips show only the start time (month view draws colour bars). The selected
  day's events (today until the user picks another) are always listed below the calendar.
- **Event panel:** clicking an event opens it in an [`ngx-modals`](../modals) side panel: date,
  time, zone and description. **Edit** swaps in an [`ngx-forms`](../forms) form; **Save** emits
  `eventSave`. The calendar never changes `events` itself; the owner of the data applies the change.

## Install

```bash
npm install @wiltech-labs/ngx-calendar
```

Add FullCalendar's two stylesheets to the app's `angular.json` `build.options.styles`, before the
app's own styles. The calendar maps the theme's colours to the app's `--mat-sys-*` tokens itself,
so no palette stylesheet is needed:

```json
"styles": [
  "@fullcalendar/angular/skeleton.css",
  "@fullcalendar/angular/themes/monarch/theme.css",
  "src/styles.scss"
]
```

Add `@fullcalendar/angular` as a direct dependency of the app, since `angular.json` references it.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { Calendar, type CalendarEvent, type CalendarView } from '@wiltech-labs/ngx-calendar';

@Component({
  selector: 'app-schedule',
  imports: [Calendar],
  template: `<ngx-calendar [events]="events()" [(view)]="view" (eventSave)="save($event)" />`,
})
export class ScheduleComponent {
  protected readonly view = signal<CalendarView>('week');
  protected readonly events = signal<CalendarEvent[]>([
    {
      id: '1',
      title: 'Design review',
      description: 'Walk through the onboarding flow.',
      startDateTime: '2026-10-01T09:00Z',
      endDateTime: '2026-10-01T10:30Z',
      config: { color: 'tertiary' },
    },
  ]);

  protected save(event: CalendarEvent): void {
    this.events.update((events) => events.map((e) => (e.id === event.id ? event : e)));
  }
}
```

### Inputs and outputs

| Name        | Type                               | Default         | Notes                                                 |
| ----------- | ---------------------------------- | --------------- | ----------------------------------------------------- |
| `events`    | `CalendarEvent[]`                  | `[]`            |                                                       |
| `view`      | `'day' \| 'week' \| 'month'` model | `'month'`       | Two-way: `[(view)]`.                                  |
| `timeZone`  | IANA zone                          | the user's zone | Events are UTC; they're shown in this zone.           |
| `editable`  | `boolean`                          | `true`          | Shows the panel's Edit action.                        |
| `firstDay`  | `0`–`6`                            | the locale's    | 0 = Sunday.                                           |
| `eventSave` | output `CalendarEvent`             |                 | The edited event, start/end as `'YYYY-MM-DDTHH:mmZ'`. |
| `daySelect` | output `string`                    |                 | The day the user picked, `'YYYY-MM-DD'`.              |

### Events

```ts
interface CalendarEvent<TSource = unknown> {
  id: string;
  title: string;
  description: string;
  startDateTime: string; // UTC, 'YYYY-MM-DDTHH:mmZ'
  endDateTime: string; // UTC, 'YYYY-MM-DDTHH:mmZ'
  config?: CalendarEventConfig;
  source?: TSource; // the app's own object, carried through untouched
}

interface CalendarEventConfig {
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral'; // M3 container pair
  backgroundColor?: string; // overrides; prefer a token, Eg 'var(--mat-sys-primary)'
  textColor?: string;
  className?: string;
  editable?: boolean; // false hides Edit for this event
}
```

### Mapping the app's own data

`CalendarEventMapper` turns any list into `CalendarEvent`s and keeps each original on `source`:

```ts
private readonly mapper = inject(CalendarEventMapper);

protected readonly events = computed(() =>
  this.mapper.map(this.store.bookings(), {
    id: (b) => b.id,
    title: (b) => b.customerName,
    description: (b) => b.notes,
    startDateTime: (b) => b.startsAt,
    endDateTime: (b) => b.endsAt,
    config: (b) => ({ color: b.confirmed ? 'primary' : 'tertiary' }),
  }),
);
```

### Locale and text

`NGX_CALENDAR_LOCALE` (dates, weekday names, first day of the week; default: the browser's
language) and `NGX_CALENDAR_TEXT` (every label; default English) are resolver tokens, the same
pattern as `ngx-dates`' `NGX_DATES_LOCALE`. Wire them to `ngx-translations` to follow a language
switch:

```ts
{
  provide: NGX_CALENDAR_LOCALE,
  useFactory: () => { const t = inject(TranslationsService); return () => t.locale(); },
}
```

### Theming

The grid reads FullCalendar's monarch (Material 3) theme variables, which this package points at
`--mat-sys-*` roles. Optional overrides: `--ngx-calendar-background` (grid surface) and
`--ngx-calendar-panel-background` (day panel).

## Status

`0.1.0`, not yet published. Consumed only by `apps/showcase` (`/calendar`).

## Publishing

```bash
cd packages/calendar
npm run build
```

`ngx-forms` and `ngx-modals` are `file:../x/dist` dependencies (see root `CLAUDE.md`'s
"Inter-package deps"); build them first, or use `npm run build:packages` from the repo root.
`npm run build`'s `postbuild` script rewrites them to real version ranges in `dist/package.json`
automatically. Then:

```bash
cd dist
npm publish
```

Bump `version` in the source `package.json` before building.
