# Next steps

Working notes on what's outstanding across the monorepo. Not published anywhere, just a
scratchpad so we don't lose track between sessions. Update as items land or priorities shift.

## Housekeeping (found while looking, not yet fixed)

- [x] `CLAUDE.md` repo layout now lists every package (`api-client`, `forms`, `media`, `ai-tools`,
      `graphs`, `web-sockets`, `i18n`, `dates`) — kept up to date as each new package landed.
- [x] Confirmed `@wiltech-labs/ngx-*` as the correct, current package scope everywhere it appears:
      both packages' `package.json`, `packages/api-client/README.md` + `CLAUDE.md`, root
      `CLAUDE.md` + `README.md`, and every reference in `apps/showcase` (`package.json`,
      `tsconfig.json` path mapping, `README.md`, and the imports in `main.ts`/`home.component.ts`/
      the api-client and forms demo components). `npm install` regenerated `package-lock.json`,
      and both packages were rebuilt so `dist/` picked up the correct fesm/typings filenames.
- [ ] `apps/showcase`'s own `npm run typecheck` (`tsc -p tsconfig.json --noEmit`) fails with `TS6059
      ... is not under 'rootDir'` for every library consumed via the `paths` mapping (hit this for
      `forms` already on `main`, and now `media` too). `ng build`/`ng serve` are unaffected — only
      the standalone `tsc --noEmit` script trips on it — but worth fixing the showcase `tsconfig.json`
      (likely needs an explicit `rootDir` or a project-references setup) before it's mistaken for a
      broken build.
- Note for next session: killing the showcase's `ng serve` by `lsof -ti:4200 | xargs kill` only
  killed the npm/shell wrapper, not the actual `ng serve (ngx-showcase)` child — it kept running
  and serving a stale build on a later browser check. `kill -9 <pid>` on the actual listening PID
  (from `ss -ltnp | grep 4200`) is what actually frees the port.

## Align libraries with `docs/ANGULAR_APP_CONVENTIONS.md` (2026-09-29)

The conventions doc's "Shared libraries" section is the contract (rules summarised in root
`CLAUDE.md`). Done on `feature/new-libraries`, all packages built, showcase checked in a browser in
light and with a dark M3 token set (no console errors):

- [x] Selectors `app-*` → `ngx-*` everywhere (packages, READMEs, showcase).
- [x] SCSS classes → `.ComponentName-suffix` + `is-*` (no BEM).
- [x] `--ngx-*` variables default to `--mat-sys-*` tokens, hex last. Chat, loaders and AI surfaces now
      follow light/dark from the app theme; chat matches the doc's chat recipe; forms mixins use
      tokens instead of `rgba()` greys; `DynamicForm` lost its own padding/centering/400px cap and has
      right-aligned text Clear + filled Save (`clearLabel`/`submitLabel`).
- [x] graphs: chart recipe as defaults — `GraphThemeService` resolves M3 tokens (+ `--app-chart-1`) and
      redraws on scheme/theme change; validated categorical palette (dataviz validator, light + dark);
      no legend for one entry; bar shape; hidden radial ticks; `GraphFrame` with caption,
      `aria-label` summary and "Show data" table; per-series `color` removed from the API.
- [x] a11y: loaders `aria-hidden`; chat input labelled, `role="log"` list, `role="status"` line,
      labelled send icon button; `AiTextBox` `label`; focus rings on custom buttons; reduced motion
      stops shimmer and AI border.
- [x] AI motion kept as the one sanctioned ambient animation (doc + ai-tools CLAUDE.md).
- [x] web-sockets timestamps via `Temporal` (`temporal-polyfill` added as a dependency).
- [x] `.prettierrc` / `.editorconfig` added (Prettier not yet run over the packages).

Still open:
- [ ] graphs: peak-value label plugin and arrow-key tooltips (the doc says they're not in yet).
- [ ] ai-tools: with a theme whose primary/tertiary/secondary are all one hue (e.g. Material's
      `azure-blue` prebuilt), the AI gradient comes out near-monochrome. Decide whether that's fine or
      whether the gradient should keep fixed AI hues.
- [ ] Possibly `ngx-styles` (shared SCSS: breakpoints, spacing, ui mixins, theme) — see discussion.

## New package `ngx-i18n` — built 2026-09-30

Decided 2026-09-29, revised twice the same day after finding `resource-management-ui`'s existing
`core/i18n/I18nStore` — its product doc (`docs/features/internationalization-i18n.md`) requires
"responsive to language changes without reload." First revision dropped reload for a hand-rolled
instant-switch engine generalizing `I18nStore`; second revision replaced the hand-rolled engine
with Transloco, after confirming it already switches instantly — no reload — via a signal every
`translate()`/`translateObject()` call tracks inside `computed()` (its `activeLang` signal), so
"instant switch" and "own engine" were never actually linked. Built to that final design:

- [x] `provideI18n({ locales, defaultLocale, dictionaries | loader, resolveLocale?, persistLocale? })`
      wraps `provideTransloco()`. `BundledI18nLoader` is the default (reads `dictionaries`, bundled
      at build time — matches `resource-management-ui`'s reasoning for a small, finite locale set);
      pass `loader` instead for many locales or backend-served translations.
- [x] `I18nService` (root-provided): `locale` (`Signal<string>`, resolution order session override →
      `resolveLocale()` → `defaultLocale`), `setLocale()` (instant, no reload; persists via
      `persistLocale()` without awaiting it), `t(key, params)`, `formatDate()`/`formatNumber()` (own
      `Intl` use, not `LOCALE_ID`/`DateAdapter`, which can't react to a runtime switch),
      `supportedLocales()`.
- [x] `TPipe` (`t`) — reimplements Transloco's own pipe mechanism (subscribe to a language-change
      notification, `markForCheck()`) under our own name rather than re-exporting `TranslocoPipe`
      verbatim, so app templates never write Transloco's own pipe name.
- [x] The app never imports `@jsverse/transloco` directly — `TranslocoLoader`/`Translation` types
      (for a custom `loader`) are re-exported from this package's own barrel.
- [x] Two bugs found and fixed while wiring the showcase demo (`apps/showcase`'s `/i18n` route),
      caught by screenshotting both locales rather than just building/typechecking:
      1. `t()`/`TPipe` called `TranslocoService.translate()` directly, but nothing ever called
         `.load()` for a language — that's ordinarily the built-in pipe/directive's job. Every key
         rendered as itself (the missing-key fallback) in *both* locales, not just an untranslated
         one. Fixed: `I18nService` now calls `.load(locale)` before `setActiveLang()`, both in the
         constructor's reactive subscription and in `setLocale()`.
      2. `I18nService.t()` wasn't reactive inside a `computed()` — `TranslocoService.translate()`
         reads its own plain internal state, not a signal, so a `computed()` wrapping `t()` never
         reran on a language switch (translated fine via the `t` pipe, not via logic). Fixed: `t()`
         now passes `this.locale()` explicitly as `translate()`'s `lang` argument, so reading it
         inside a `computed()` sees the dependency. `TPipe` was changed to call `I18nService.t()`
         rather than `TranslocoService.translate()` directly, so both paths agree.
- [x] Wired into `apps/showcase` at `/i18n` (two demo dictionaries, `en-GB`/`el-GR`): a language
      switcher, `t` pipe usage with params, `I18nService.t()` from a `computed()`, and
      `formatDate()`/`formatNumber()`. Verified in a browser in both locales, and that switching
      doesn't reload (a `window` marker set before the switch survives it) — no console errors.
- [x] `docs/ANGULAR_APP_CONVENTIONS.md`'s "Shared libraries" section, table, setup snippet, and
      "Dates and times" updated; root `CLAUDE.md` repo layout updated.
- [ ] Not yet published to npm — under development, no consumers yet.
- [ ] Still open, not done as part of this:
      - Per-library text tokens — see "Per-library text tokens" below, done 2026-09-30.
      - `ngx-api-client` sending `Accept-Language` from the active locale.
      - Migrating `resource-management-ui`'s `I18nStore`/`labels.ts` onto this package — flagged for
        later, on request, not started.
      - Peak/ICU-heavy features (plurals, gendered forms) aren't exercised by the demo yet, only the
        plain-dictionary/interpolation path.
      - `ngx-forms`' `dateTimeConfig.locale` fallback — see "`ngx-forms`: `NGX_FORMS_LOCALE`" below,
        done 2026-09-30, after `ngx-dates`.

## New package `ngx-dates` — built 2026-09-30

Built right after `ngx-i18n`, per this file's own note above ("reading the locale from `ngx-i18n`'s
`I18nService.locale()`"). That note's plan — `ngx-dates` importing `I18nService` directly — turned
out not to build:

- [x] Tried the direct import first. `ng-packagr` failed with `TS2307: Cannot find module
      '@wiltech-labs/ngx-i18n'`, even with a `tsconfig` `paths` mapping (which fixes this for `tsc`
      directly, and is how `apps/showcase` resolves every package — but `ng-packagr` builds each
      package as a fully standalone publishable unit and doesn't honour it the same way). Root
      cause: a workspace sibling's *source* `package.json` has no `main`/`types` field — only the
      `dist/` one `ng-packagr` itself writes does — so there's currently no working way for one
      package here to depend on another's source at build time, only for an app to depend on
      several of them side by side. Documented as a new row in root `CLAUDE.md`'s "Locked-in
      decisions" table ("Inter-package deps: none") so this isn't rediscovered the hard way again.
- [x] Redesigned around `NGX_DATES_LOCALE` (`InjectionToken<() => string>`, defaults to
      `navigator.language`) — the exact pattern `ngx-i18n`'s own `NgxI18nConfig.resolveLocale`
      already uses for app-pluggable resolution, applied one level further out. The app wires the
      two together itself: `{ provide: NGX_DATES_LOCALE, useFactory: () => { const i18n =
      inject(I18nService); return () => i18n.locale(); } }`. `ngx-dates` ends up with zero
      dependency on `ngx-i18n`, or on any i18n setup at all.
- [x] `RelativeTimeService.relativeTime(value, options?)` — `Temporal` + `Intl.RelativeTimeFormat`,
      a shared unit ladder (`pickTier()` in `relative-time.utils.ts`) picking the right unit
      (second/minute/hour/day/week/month/year) from the diff. Accepts a UTC instant string, `Date`,
      or `Temporal.Instant` (`InstantLike`) — the same wire format `ngx-forms`' instant-date-time
      field uses.
- [x] `RelativeTimePipe` (`relativeTime`) — impure for two independent reasons: the text changes as
      real time passes even with nothing else happening, and it must re-render on a locale switch
      when `NGX_DATES_LOCALE` is wired to something reactive. Self-schedules its own `setTimeout`
      refresh (cleared in `ngOnDestroy`) at a delay from the same tier ladder — every second under a
      minute old, hourly once day-or-older — rather than depending on an unrelated binding to
      trigger change detection. Locale changes are picked up via an `effect()` that only calls
      `markForCheck()` (never writes a signal); confirmed that `effect()` still tracks a signal read
      performed *inside* the injected `resolveLocale()` function call, not just ones read directly
      in the effect body.
- [x] Wired into the showcase's existing `/i18n` demo (not a separate route — the point is showing
      both packages react to the same switch together): `main.ts` wires `NGX_DATES_LOCALE` to
      `I18nService.locale()`; the demo adds a "5 minutes ago" / "3 days ago" pair. Verified with
      Playwright in both `en-GB` and `el-GR` — text switches instantly, no console errors.
- [x] `docs/ANGULAR_APP_CONVENTIONS.md` updated: table row, `Setup` snippet, a real `ngx-dates`
      subsection (replacing the old "planned" placeholder), migration checklist bullet, "Dates and
      times" display bullet. Root `CLAUDE.md` repo layout and a new "Inter-package deps" decision row.
- [ ] Not yet published to npm — under development, no consumers yet.

### `ngx-forms`: `NGX_FORMS_LOCALE` — built 2026-09-30

The one loose end `ngx-dates` left (see above): `ngx-forms`' three date/time fields
(`BusinessDateField`/`BusinessTimeField`/`InstantDateTimeField`) each fell back to the hardcoded
`DEFAULT_DATE_TIME_LOCALE` constant when a `FieldDef` didn't set `dateTimeConfig.locale`. Replaced
that fallback with `NGX_FORMS_LOCALE` (`InjectionToken<() => string>`), the same resolver-token
pattern as `NGX_DATES_LOCALE` — an app can wire it to `ngx-i18n`'s `I18nService.locale()` the same
way, with zero import-time dependency between the two packages.

- [x] `NGX_FORMS_LOCALE` added (`config/forms-locale.token.ts`), defaulting to
      `DEFAULT_DATE_TIME_LOCALE` (`'en-GB'`) — **not** the browser's own language the way
      `NGX_DATES_LOCALE` defaults, and deliberately not wired to `ngx-i18n` in the showcase either:
      this locale also decides which typed day/month order `LocaleDateAdapter.parse()` accepts, so
      changing it changes user input behaviour, not just wording. An app opts in on purpose; it
      isn't a default recommendation the way the `ngx-dates` wiring is.
- [x] All three field components updated to inject it and use `this.resolveLocale()` as the
      fallback instead of the constant directly. `dateTimeConfig.locale` set on the field still
      always wins — no change to that precedence.
- [x] Exported from `public-api.ts`. Package rebuilds/typechecks clean; full workspace build
      (all 8 packages + showcase `ng build`) still clean afterward. Showcase's `/forms` demo
      checked in a browser with the token left unwired (today's real-world default) — renders
      correctly, no console errors.
- [x] `packages/forms/README.md` and `CLAUDE.md`, and `docs/ANGULAR_APP_CONVENTIONS.md` (`ngx-forms`
      subsection, Setup section) updated to explain the token and why it isn't in the main Setup
      snippet the way `NGX_DATES_LOCALE` is.
- [ ] Not yet published to npm.

## Per-library text tokens — built 2026-09-30

Surveyed all 5 non-i18n packages (`ngx-forms`, `ngx-graphs`, `ngx-media`, `ngx-web-sockets`,
`ngx-ai-tools`) for hardcoded UI strings before designing anything, rather than assuming all five
needed the same treatment:

- [x] `ngx-forms`' `DynamicForm.submitLabel`/`clearLabel` and `ngx-ai-tools`' `AiTextBox.placeholder`
      are already per-instance `input()`s with defaults — already app-overridable without a token.
      Left alone; adding a token on top would be a redundant second override mechanism for the same
      thing.
- [x] `ngx-media` has no hardcoded UI text at all (loaders are visual only, `YoutubePlayer` takes an
      id). Nothing to do.
- [x] `ngx-graphs`' `GraphFrame` had exactly one genuinely hardcoded, non-overridable string:
      the "Show data" table-toggle text. Added `NGX_GRAPHS_TEXT`
      (`config/graphs-text.token.ts`, `InjectionToken<() => GraphsText>`, `GraphsText { showData:
      string }`), same resolver-token pattern as `NGX_DATES_LOCALE`/`NGX_FORMS_LOCALE`. `GraphFrame`
      reads it via `computed(() => this.resolveText())`, so a resolver wired to `ngx-i18n` stays
      reactive to a language switch. Exported from `public-api.ts`.
- [x] `ngx-web-sockets`' `ChatRoom` had six: connection status ("Connected"/"Connecting…"), the
      messages-region and composer `aria-label`s, the composer placeholder, and the send button's
      `aria-label`/`title` — plus five more in *transient status messages* that were easy to miss on
      a first pass (`showStatus()` calls for "A client connected"/"A client disconnected", the
      per-client "X is typing…", and the two error messages). Added `NGX_CHAT_TEXT`
      (`config/chat-text.token.ts`, `ChatText` — the two parameterized ones, `clientTyping` and
      `error`/`connectionError`, are functions rather than interpolation-placeholder strings, to
      avoid building a template-parsing mini-engine for two call sites). Message *bodies* are
      untouched — still plain app/server data.
- [x] Both packages rebuild/typecheck clean; full workspace build (8 packages + showcase `ng build`)
      still clean. `ngx-graphs`' "Show data" toggle checked live in the showcase's `/graphs` demo
      (all 8 chart types) with Playwright — renders and still toggles correctly, no console errors.
      `ngx-web-sockets` isn't wired into the showcase (no backend to connect to, a pre-existing,
      deliberate gap — see its own `CLAUDE.md`), so `ChatRoom`'s wiring couldn't be checked live;
      typecheck/build are the only verification it got.
- [x] `packages/graphs/README.md`+`CLAUDE.md`, `packages/web-sockets/README.md`+`CLAUDE.md`, and
      `docs/ANGULAR_APP_CONVENTIONS.md` (`ngx-graphs`/`ngx-web-sockets` subsections) updated with the
      new tokens and an `ngx-i18n`-wiring recipe for each.
- [ ] Neither token is wired into the showcase's own `main.ts` (unlike `NGX_DATES_LOCALE`) — left at
      their English defaults there. Wiring one in is a small follow-up if a demo of the translated
      path is ever wanted; not done here to keep this change to the packages themselves.

## More housekeeping
- [ ] Showcase: give it the house M3 theme (it uses light-only `azure-blue` + hardcoded greys), so dark
      mode can be checked for real.
- [ ] Run Prettier over the repo once and commit that separately.
- [ ] api-client: `resource()`/`collectionResource()` now guard with `hasValue()` — bump + publish
      0.1.6, then update consumers. Other packages: first publish once reviewed.

## packages/forms

- [ ] No tests yet. Unlike `api-client` (a straight port of exercised `insurly-ui` code), forms
      has grown real logic that isn't already covered elsewhere: `toSchema()` validation rules,
      date/time parsing (`business-date`/`business-time`/`instant-date-time`), `ZonedDateTimeService`
      DST gap/overlap handling, `FormConfigBuilder`. Worth unit tests before publishing.
- [ ] Not yet published to npm (`version: 0.1.0`, still under development per its own `CLAUDE.md`).
- [ ] No consumers yet — `insurly-ui` is the intended first real consumer but doesn't depend on it
      yet (only on `ngx-api-client` so far).
- [ ] Two more Angular projects are planned to eventually consume these libraries — not started.

## packages/api-client

- [ ] Already published and consumed by `insurly-ui`. No known outstanding work beyond routine
      version bumps as needed.

## packages/i18n

See "New package `ngx-i18n` — built 2026-09-30" above for what's built and what's still open.

## packages/dates

See "New package `ngx-dates` — built 2026-09-30" above for what's built and what's still open.

## packages/media

- [x] Initial component set built natively (no `ngx-skeleton-loader` dependency) on
      `feature/new-libraries` (2026-09-29): `CardLoader` (avatar + title/subtitle header, YouTube
      card-style, composes `ContentLoader` for its body), `ContentLoader` (fills its container with
      N shimmer lines), and `YoutubePlayer` (embeds a video by id via `youtube-nocookie.com`).
      Wired into `apps/showcase` at `/media` and visually verified in a browser (both loading/loaded
      states, no console errors).
- [ ] No tests yet.
- [ ] Not yet published to npm (`version: 0.1.0`).
- [ ] No consumers yet.

## packages/ai-tools

- [x] Initial component set built on `feature/new-libraries` (2026-09-29): `AiSparkleIcon` (4-pointed
      sparkle/diamond glyph, gradient-filled by default, `[monochrome]` for use on a colored
      background), `AiPanel` and `AiTextBox` (animated *rotating* `conic-gradient` border, via
      `@property`-animated angle — not a static gradient fill), and `AiButton` (gradient-filled).
      All colors themeable via `--ngx-ai-gradient-*`/`--ngx-ai-surface` CSS custom properties, no
      Material dependency. Wired into `apps/showcase` at `/ai-tools` and visually verified in a
      browser (icon rendering, panel/textbox border animation, button click driving the demo's
      generate flow, two-way `[(value)]` binding on the text box) — no console errors.
- [ ] Services (an actual AI request layer) intentionally not started yet — component look-and-feel
      only for now.
- [ ] No tests yet.
- [ ] Not yet published to npm (`version: 0.1.0`).
- [ ] No consumers yet.
- [ ] Package name (`ai-tools`) is still provisional — revisit if a better name comes up.

## packages/graphs

- [x] Initial component set built on `feature/new-libraries` (2026-09-29), wrapping `ng2-charts`
      6.0.1 / `chart.js` 4.5.1 rather than building charting from scratch: `graphConfig()` /
      `GraphConfigBuilder` (mirrors `formConfig<T>()` in `packages/forms`) describes a graph's
      `labels`/`series`/`title` once; `toChartData()` is the one place that turns a `GraphDef` into
      chart.js's `ChartData` shape, applying a default color palette when a series doesn't specify
      one (and spreading one color per label when there's a single series, for pie-style charts).
      `BarGraph` and `PieGraph` wrap ng2-charts' `BaseChartDirective` on a `<canvas>`. `ng2-charts`/
      `chart.js` are regular `dependencies` of this package (not peers), listed in
      `ng-package.json`'s `allowedNonPeerDependencies`, same precedent as `forms`' `temporal-polyfill`.
      Wired into `apps/showcase` at `/graphs`, including the required
      `provideCharts(withDefaultRegisterables())` app-level provider in `main.ts`, and visually
      verified in a browser (both graphs render correctly with real data) — no console errors.
- [x] Fixed: `apps/showcase/main.ts` imports `provideCharts`/`withDefaultRegisterables` directly
      from `ng2-charts`, but `ng2-charts` was never added to `apps/showcase/package.json` — it only
      resolved because npm workspaces hoists it up from `packages/graphs`' own dependency. Added
      `"ng2-charts": "^6.0.0"` as an explicit direct dependency of the showcase app so it isn't a
      phantom/hoisting-only dependency. (`chart.js` itself isn't imported directly anywhere in
      `apps/showcase`, only inside `packages/graphs`, so it didn't need the same fix.)
- [x] Expanded to all 8 non-mixed chart.js chart types (2026-09-29), after reviewing the demo
      components at `ng-libraries/wt-libraries/projects/wt-graphs/src/lib/components` (a sibling
      repo's straight copy of the ng2-charts sample gallery — bar/bubble/doughnut/line/pie/
      polarArea/radar/scatter — with hardcoded demo data, no reusable abstraction). Added
      `LineGraph`, `DoughnutGraph`, `PolarAreaGraph`, `RadarGraph` (all reuse the existing `GraphDef`/
      `toChartData()`) plus a new `PointGraphDef`/`pointGraphConfig()`/`toPointChartData()` for
      `BubbleGraph`/`ScatterGraph`, whose `{x, y[, r]}` point data doesn't fit the label/series
      shape. Factored the repeated title-options logic (previously duplicated per component) into
      a shared `withTitle()` helper, and the color palette into `DEFAULT_PALETTE`, used by both
      `toChartData()` and `toPointChartData()`. All 8 wired into `apps/showcase`'s `/graphs` demo
      and visually verified in a browser — no console errors, all render with correct data/colors.
      Deliberately did *not* copy the other repo's per-component hardcoded demo data or its
      doughnut-specific half-doughnut builder — kept everything driven through the one shared
      `GraphDef`/`PointGraphDef` abstraction instead.
- [x] Upgraded `ng2-charts` from `6.0.1` to latest (`11.0.0`, 2026-09-29) — it was 5 majors behind;
      latest now requires Angular `>=22.0.0` (matches us) but also newly peer-depends on
      `@angular/cdk`, added as a peer here and in `apps/showcase` (which already had `cdk` from
      Material). No API changes needed — `BaseChartDirective`/`provideCharts`/
      `withDefaultRegisterables` are unchanged; typecheck, build, and a live re-check of all 8
      chart types in the browser all passed with no differences. `chart.js` (`4.5.1`) and
      `socket.io-client` (`4.8.4`, in `packages/web-sockets`) were already at latest.
- [ ] No tests yet.
- [ ] Not yet published to npm (`version: 0.1.0`).
- [ ] No consumers yet.
- Note for next session: a `page.screenshot({ fullPage: true })` over `<canvas>`-based charts came
  back completely blank (axes/legend/title visible, no bars/slices/points) in headless Chromium,
  even though the chart.js instance's internal layout/pixel data (checked via `getImageData` and
  Angular devtools globals) was correct the whole time. A plain viewport screenshot
  (`fullPage: false`), or scrolling + multiple viewport shots for a long page, rendered every chart
  correctly. Compositing/timing quirk specific to full-page screenshots of `<canvas>` in this
  environment, not an app bug — don't waste time debugging the component if this recurs, just
  screenshot differently.

## packages/web-sockets

- [x] Built on `feature/new-libraries` (2026-09-29), ported and modernized from the prototype at
      `ng-libraries/wt-libraries/projects/wt-websockets`. Kept the shape (config token, provider,
      service, room join/leave, a chat list + chat message component) but not the implementation —
      see `packages/web-sockets/CLAUDE.md`'s "Modernized from the source" section for the full list.
      Highlights: dropped the `ngx-socket-io` wrapper dependency in favor of `socket.io-client`
      directly (also dropped the now-unnecessary `@types/socket.io-client`); connection state is a
      `Signal<boolean>` driven by the socket's real `connect`/`disconnect` events (the original set
      it to `true` immediately after calling `.connect()`, before the handshake succeeded — a real
      bug); one generic `on<T>(event)` replaced five near-identical hand-rolled `Observable`
      wrappers plus two `Subject`s; removed dead code (an unused `SocketConfig` interface marked
      `// TODO what is this interface for??????`, duplicate `joinRoom1`/`leaveRoom1` methods, a
      commented-out old config example); `ChatRoom` takes `roomName`/`clientName` as inputs instead
      of the original's hardcoded "Chat 1/2/3" room switcher and hardcoded `clientName: 'Client Name'`
      baked into the library; real `crypto.randomUUID()` ids and `Date.toISOString()` timestamps
      instead of hardcoded placeholders; no Angular Material dependency (plain CSS, themeable via
      `--ngx-chat-*`, matching `media`/`ai-tools`); manual signal + `(input)` event instead of
      `FormsModule`/`[(ngModel)]` for the composer, matching `ai-tools`' `AiTextBox` pattern. Split
      into a generic `connection/` layer (reusable for any websocket feature) and a `chat/` feature
      built on top, mirroring `media`'s `loading/`/`youtube/` split.
- [x] Signal/RxJS interop pass (2026-09-29): added `WebSocketService.connected$`, a `toObservable()`
      companion to the `connected` signal, for consumers combining it with the `Observable`-returning
      methods in an RxJS pipeline. Replaced `ChatRoom`'s manual `Subscription` container with
      `takeUntilDestroyed()` (`@angular/core/rxjs-interop`) — since the subscriptions are set up in
      `ngOnInit` rather than a constructor/field initializer, it needs an explicit `DestroyRef`
      (`takeUntilDestroyed(this.destroyRef)`), and it has to be called fresh in each `.pipe()` rather
      than hoisted into one shared `const` — hoisting made TypeScript infer it against only the first
      call site's generic type, silently turning every other subscription's payload into `unknown`.
- [ ] Deliberately **not** wired into `apps/showcase` — there's no server for it to connect to yet,
      so a demo page would have nothing real to show. Add one once a NestJS (or other Socket.IO)
      backend exists to point it at.
- [ ] No tests yet.
- [ ] Not yet published to npm (`version: 0.1.0`).
- [ ] No consumers yet.

## Repo-wide

- [ ] No CI configured yet (build/typecheck/publish are all manual, per each package's README).
