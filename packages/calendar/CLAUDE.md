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
