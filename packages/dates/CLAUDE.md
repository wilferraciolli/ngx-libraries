# @wiltech-labs/ngx-dates

Shared Angular date/time display helpers — a `relativeTime` pipe and `RelativeTimeService`, on
`Temporal` + `Intl.RelativeTimeFormat`. Locale-pluggable, not locale-hardcoded: see
`NGX_DATES_LOCALE` below. See root `../../CLAUDE.md` for repo-wide conventions, and
`docs/ANGULAR_APP_CONVENTIONS.md`'s "Shared libraries" and "Dates and times" sections for this
package's place in the app conventions.

## Layout
```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── config/             # NGX_DATES_LOCALE token, DatesLocaleResolver type
    ├── services/           # RelativeTimeService — relativeTime(), refreshDelayMs()
    ├── pipes/              # RelativeTimePipe ('relativeTime')
    └── utils/              # toInstant(), pickTier() — the "time ago" unit ladder
```

## Conventions

- Real Angular constructs (`@Injectable`, `@Pipe`) — not framework-agnostic functions. Every known
  consumer is Angular, so idiomatic DI beats a generic-TS compromise.
- **No dependency on `@wiltech-labs/ngx-i18n`, or on any other package here — deliberately.** The
  original design (`NEXT_STEPS.md`'s 2026-09-29 planning note) had this package import
  `I18nService` directly. Building it surfaced a real constraint: `ng-packagr` builds every package
  as a fully independent, standalone publishable unit, and a workspace sibling's *source* package.json
  has no `main`/`types` fields (only the built `dist/` one does, written by `ng-packagr` itself) — so
  there is currently no working way for one package here to import another at build time, only for
  an *app* to depend on several of them. Given that, `NGX_DATES_LOCALE` (an `InjectionToken<() =>
  string>`, defaulting to the browser's own `navigator.language`) replaced the direct import — the
  exact same pattern `ngx-i18n`'s own `NgxI18nConfig.resolveLocale` already uses for its own
  app-pluggable resolution, applied one level further out. An app using `ngx-i18n` wires the two
  together itself:
  ```ts
  { provide: NGX_DATES_LOCALE, useFactory: () => { const i18n = inject(I18nService); return () => i18n.locale(); } }
  ```
  If a real need for actual shared code between two of these packages ever comes up, solving *that*
  (e.g. publishing intermediate builds before the dependents build) is a separate decision — don't
  reach for another inter-package import without revisiting this constraint first.
- `temporal-polyfill` is a regular `dependency` (same precedent as `ngx-forms`), listed in
  `ng-package.json`'s `allowedNonPeerDependencies`.
- Accepts a UTC instant string (`'2024-03-31T01:30:00Z'`), a `Date`, or a `Temporal.Instant`
  directly (`InstantLike`) — the same wire format `ngx-forms`' instant-date-time field uses, so a
  value read from that field or from an API response needs no conversion before this package's
  entry points.
- **`RelativeTimePipe` is impure for two independent reasons**, not one: the displayed text changes
  as real time passes even when nothing else does ("moments ago" -> "5 minutes ago"), and — only if
  `NGX_DATES_LOCALE` is wired to something reactive — it must re-render on a locale switch. It
  self-schedules its own refresh via `setTimeout`/`clearTimeout` (cleaned up in `ngOnDestroy`)
  rather than depending on some unrelated binding to trigger change detection at the right moment —
  see `relative-time.utils.ts`'s tier ladder for how the refresh delay is picked (every second while
  under a minute old, hourly once it's day-or-older, etc. — cheap for old values, responsive for
  fresh ones). Locale changes are picked up separately via an `effect()` that only calls
  `markForCheck()`, never writes a signal, so it isn't a write-inside-an-effect concern — and it
  still tracks a signal read inside `resolveLocale()` even though that resolver is "just a function"
  from this package's point of view (Angular's `effect()` tracks any signal read during its
  synchronous execution, however many calls deep).
- `pickTier()`/`toInstant()` are shared by both the service and the pipe so the two never
  disagree on which unit ("hour" vs "day") a given diff renders as.

## Status

- New package, built 2026-09-30 — `RelativeTimeService`, `RelativeTimePipe`, `NGX_DATES_LOCALE`.
- Not yet published to npm — under development.
- No consumers yet. Not yet wired into `apps/showcase` — do that alongside its `/i18n` demo the
  next time that demo is touched, wiring `NGX_DATES_LOCALE` to `I18nService.locale()` so a language
  switch can be seen updating both `t()` output and relative-time text together.
