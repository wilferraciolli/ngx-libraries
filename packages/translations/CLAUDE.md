# @wiltech-labs/ngx-translations

Shared Angular translations — instant (no-reload) language switching, a `t()` service method and a
`t` pipe, locale-aware date/number formatting. See root `../../CLAUDE.md` for repo-wide
conventions, and `docs/ANGULAR_APP_CONVENTIONS.md`'s "Shared libraries" section for this package's
place in the app conventions.

Decided 2026-09-29 after finding `resource-management-ui`'s existing `core/i18n/I18nStore` — its
product doc (`docs/features/internationalization-i18n.md`, in that sibling repo) requires
"responsive to language changes without reload." This package generalizes that store's design
(instant switch, pluggable locale resolution, own `Intl`-based formatting) onto
[Transloco](https://jsverse.gitbook.io/transloco) as the engine, rather than hand-rolling one: real
plural/ICU support, lazy-loading per scope, missing-key tooling, and an actively maintained project
for the team not to have to own itself. See `NEXT_STEPS.md` (root) for the full decision history.

## Layout
```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── config/            # NgxTranslationsConfig, LocaleResolver, NGX_TRANSLATIONS_CONFIG token
    ├── providers/         # provideTranslations() — wraps provideTransloco()
    │                       # BundledTranslationsLoader — the default loader, reads NgxTranslationsConfig.dictionaries
    ├── services/          # TranslationsService — locale, setLocale(), t(), formatDate()/formatNumber()
    └── pipes/             # TPipe ('t')
```

## Conventions
- Real Angular constructs (`@Injectable`, `@Pipe`) — not framework-agnostic functions. Every known
  consumer is Angular, so idiomatic DI beats a generic-TS compromise.
- `@jsverse/transloco` is a regular `dependency` of this package (not a peer) — same reasoning as
  `forms`' `temporal-polyfill` and `graphs`' `ng2-charts`/`chart.js`: this package controls the
  exact version it's built against. Listed in `ng-package.json`'s `allowedNonPeerDependencies`.
- **The app never imports from `@jsverse/transloco` directly.** Everything it needs — the service,
  the pipe, the `TranslocoLoader`/`Translation` types for a custom `loader` — is re-exported from
  this package's own `public-api.ts`. That's the point of the wrapper: the engine underneath can
  change without every consuming app's imports changing with it.
- **Instant switch, never a reload.** `TranslationsService.locale` is a `Signal<string>`; `setLocale()`
  updates it (and Transloco's own active language) synchronously, then fires `persistLocale()`
  without awaiting it. Nothing in this package's own code calls `location.reload()` or anything
  equivalent — don't add any.
- **Locale resolution is app-pluggable, not assumed.** `resolveLocale` is a plain function the app
  supplies, read inside a `computed()` so it tracks whatever signals it closes over (e.g. a
  `CurrentUserStore.profile()`). This package has no built-in concept of "organization" or "user
  profile" — `resource-management-ui`'s three-tier order (session → user → organization → fallback)
  is one instance of that resolver, not something this package bakes in.
- **`TranslationsService.locale` is pushed into Transloco via `toObservable(...).pipe(takeUntilDestroyed())`
  in the constructor, not an `effect()`.** `TranslocoService.setActiveLang()` writes Transloco's own
  internal signal; calling it from inside our `effect()` would be a write-inside-an-effect the way
  Angular's effects are meant to avoid. A plain RxJS subscription side-effects into another
  service's state without that concern — see root `CLAUDE.md`'s RxJS-interop guidance.
- **`TPipe` doesn't use Transloco's own `TranslocoPipe`, even though it exists** — that pipe is
  itself already correct (subscribes to `langChanges$`, calls `markForCheck()`), but re-exporting
  it verbatim would mean every template writes `| transloco`, which leaks the engine's name into
  every app that uses this package. `TPipe` reimplements the same small, documented mechanism under
  our own `t` name instead.
- Missing key falls back to rendering the key itself (`missingHandler: { logMissingKey: true,
  useFallbackTranslation: true, allowEmpty: false }` in `provideTranslations()`) — visible and debuggable,
  never a blank string.
- Bundled dictionaries (`NgxTranslationsConfig.dictionaries`) are the default path, for a small, finite
  locale set — matches `resource-management-ui`'s own reasoning (no network round trip, no
  asset-path complexity). `BundledTranslationsLoader` is what wires them into Transloco's loader contract.
  An app with many locales, or translations served by its backend, passes its own `loader` instead.
- Date/number formatting is this package's own, via `Intl` read against `locale()` directly — not
  `LOCALE_ID`/Material's `DateAdapter`, which are fixed at bootstrap and can't react to a runtime
  switch. `ngx-forms`' `dateTimeConfig.locale` and a future `ngx-dates`' `relativeTime` pipe should
  take the current locale the same reactive way (i.e. from `TranslationsService.locale()`), not `LOCALE_ID`.

## Status
- New package: `provideTranslations()`, `TranslationsService`, `TPipe`.
- Not yet published to npm — under development.
- No consumers yet. `resource-management-ui`'s `I18nStore`/`labels.ts` are candidates to migrate
  onto this package once it's published — not done as part of building it, flagged in root
  `NEXT_STEPS.md` for later, on request.
