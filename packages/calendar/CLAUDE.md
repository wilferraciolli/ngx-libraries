# @wiltech-labs/ngx-calendar

Day/week/month calendar. Wraps FullCalendar 7 (`@fullcalendar/angular` + `fullcalendar`) rather
than building the grid: week/day overlap layout, the now line and keyboard handling are a lot of
mechanics to own, and FullCalendar 7 is Temporal-based (same as our date rules), MIT and on
Angular 22. Built 2026-10-01. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/lib/
├── models/          # CalendarEvent, CalendarEventConfig, CalendarView
├── config/          # NGX_CALENDAR_LOCALE, NGX_CALENDAR_TEXT
├── utils/           # Temporal helpers (zone formatting, events on a day), event colours
├── services/        # CalendarEventMapper
└── components/
    ├── calendar/       # Calendar — toolbar, FullCalendar, day panel placement, opens the modal
    ├── day-events/     # DayEvents — one day's events as a grouped list (internal)
    └── event-detail/   # EventDetail — modal content: view + ngx-forms edit form (internal)
```

## Decisions

- **Depends on `ngx-modals` and `ngx-forms`** (sanctioned in root `CLAUDE.md`, `ngx-modals` added
  for this package) via `file:../x/dist` + `postbuild` `fix-dist-file-deps`.
- **Our own toolbar**, FullCalendar's `headerToolbar: false`: Material buttons and a segmented
  `mat-button-toggle-group`, title from FullCalendar's `datesSet`.
- **Theme**: FullCalendar's monarch (M3) theme, its `--fc-monarch-*` variables mapped to
  `--mat-sys-*` on `:host` in `calendar.scss`. The app adds `skeleton.css` + `monarch/theme.css` to
  `angular.json`; no palette file. Keep `calendar.scss` under the 4 kB component style budget (the
  `--_p`/`--_on` shorthands exist for that).
- **Day panel**: beside the grid from 1200px (below that the grid would squeeze chips to nothing),
  below it otherwise. It follows the visible range: Day view always shows the visible day, and a
  selection that scrolls out of range is dropped. "+N more" opens it instead of FullCalendar's
  popover (`moreLinkClick` returns the current view, which suppresses the popover).
- **Saving only emits** `eventSave` (instants normalised to minute precision); the app owns the data.
- **All-day events, 1.0.1 (2026-10-23).** Asked for by Crewly's leave calendar. `allDay?: boolean`
  on `CalendarEvent`, with `startDateTime`/`endDateTime` then holding inclusive business dates,
  instead of a discriminated union with `startDate`/`endDate`: the union would have broken every
  consumer that reads `event.startDateTime` (a breaking change for what is meant to be a patch),
  and FullCalendar itself reads date-or-datetime strings plus an `allDay` flag. Mapped to
  FullCalendar with an exclusive `end` (`dayAfter`). The all-day row (`allDaySlot`) shows only when
  an all-day event is passed, so timed-only calendars look as before. `CalendarText.allDay` is
  optional (`allDayLabel()` falls back to the default) so existing text overrides still compile;
  it also sets FullCalendar's `allDayText`. All-day events open read-only: the edit form is built on
  instants. Compact chips keep the title for all-day events, which have no time to show. Checked in
  `apps/showcase` with headless Chrome: month (spanning a week break), week (all-day row) and phone
  width.
- **`rangeChange`, 1.0.2 (2026-10-23).** Crewly's leave calendar loads absences per visible range
  from an API that caps the window, and nothing told the app what was on screen. Emitted from
  FullCalendar's `datesSet` (first render, prev/next/today, view change) with the *active* range
  (a month view's leading and trailing days included) and an inclusive end.
- **`holidays`, 1.0.3 (2026-10-23).** Asked for so a public holiday is unmistakable in Crewly's
  leave calendar. Its own input, not a flag on `CalendarEvent`: a holiday isn't something a person
  does, can't be opened or edited, and its shape is `wiltech-labs-holidays`' item (`date`, `name`,
  `category`) so apps pass the API's list straight in. Each holiday is two FullCalendar events of
  ours (ids prefixed `holiday:`): a `display: 'background'` one that shades the day, or the whole
  column in the time grid, and an all-day chip titled "Public holiday · <name>" ("Holiday · <name>"
  for other categories) that `eventOrder` (`holidayOrder` first) puts ahead of the day's events.
  Colours go through the events' own `color` / `contrastColor` (tertiary container; the shading at
  70% of it) rather than new CSS, because `calendar.scss` is at its style budget. Clicking a chip
  selects the day instead of opening a panel; the day panel lists the day's holidays first, in a
  tinted block. Built with `forEach`, not `flatMap`: ng-packagr's `lib` setting lacks it. Checked
  in `apps/showcase` with headless Chrome (month, week, phone).
- **Gotchas found while building**:
  - `FullCalendarComponent.getApi()` is null until FullCalendar's own view init; the view-sync
    effect skips until then (the first view comes from `initialView`).
  - A day cell's `info.date` is a real `Date` for that day's midnight in the calendar zone, not a
    UTC-field marker: convert with Temporal in the zone, never `toISOString().slice(0, 10)` (that
    slips a day east of UTC).
  - `.Calendar-grid` needs `flex: 1 1 auto`, not `flex: 1`: a 0% basis collapses it in the
    narrow (column) layout.
  - FullCalendar's narrow month view renders events as thin bars with no time text; the day list
    below the grid carries the detail there.
