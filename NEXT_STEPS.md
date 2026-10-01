# Next steps

Working notes on what's outstanding across the monorepo. Not published anywhere, just a
scratchpad so we don't lose track between sessions. Update as items land or priorities shift.

## Housekeeping (found while looking, not yet fixed)

- [x] Fresh clone on another machine: `npm install` succeeded, but building failed for
      `ngx-region-settings` (looked like it "needed another npm install"). Root cause: `dist/` is
      gitignored everywhere, and `ngx-region-settings` depends on `ngx-api-client`/`ngx-auth` via
      `"file:../x/dist"` (see root `CLAUDE.md`'s "Inter-package deps") — on a fresh clone neither
      `dist/` exists yet. `npm install` never errors on this (it symlinks to the not-yet-existing
      path, and the symlink self-heals once that path's target appears later — no re-install
      needed), so the failure only ever shows up at _build_ time, cascading `TS2571`/module-not-found
      errors from the still-empty dependency. The root `build:packages` script used to get the
      ordering right only by accident (alphabetical directory order happened to put `api-client`/
      `auth` before `region-settings`). Fixed 2026-09-30: added `scripts/build-packages.sh`, which
      builds `api-client`/`auth` first explicitly, then every other package — root `package.json`'s
      `build`/`build:packages` scripts now call it instead of a plain `for d in packages/*/` loop.
      Reproduced the original failure directly (wiped every package's `dist/`, fresh `npm install`,
      built `region-settings` alone — failed) and confirmed the fix on the same reproduction (`npm
install && npm run build` now succeeds end to end, including the showcase app). See
      `packages/region-settings/CLAUDE.md`'s "Build-order requirement" note for the full detail —
      building a single package on its own (`cd packages/region-settings && npm run build`) still
      needs `../api-client`/`../auth` built manually first, the script only orders the repo-wide
      build.
- [x] `CLAUDE.md` repo layout now lists every package (`api-client`, `forms`, `media`, `ai-tools`,
      `graphs`, `web-sockets`, `translations`, `dates`) — kept up to date as each new package landed.
- [x] `apps/showcase/README.md` and its home page tile list had gone stale as demos were added —
      still said "Bar and pie graphs" (now 8 chart types) and listed only 3 of the 6 wired-in demos
      (missing media/ai-tools/graphs/translations from "Testing the Libraries" and "Project Structure").
      Found while double-checking for anything not yet tracked here, not from a specific task.
      Fixed 2026-09-30; nothing else found stale on the same pass (root `README.md`, every package's
      own README/CLAUDE.md, `docs/ANGULAR_APP_CONVENTIONS.md`).
- [x] Confirmed `@wiltech-labs/ngx-*` as the correct, current package scope everywhere it appears:
      both packages' `package.json`, `packages/api-client/README.md` + `CLAUDE.md`, root
      `CLAUDE.md` + `README.md`, and every reference in `apps/showcase` (`package.json`,
      `tsconfig.json` path mapping, `README.md`, and the imports in `main.ts`/`home.component.ts`/
      the api-client and forms demo components). `npm install` regenerated `package-lock.json`,
      and both packages were rebuilt so `dist/` picked up the correct fesm/typings filenames.
- [x] `apps/showcase`'s own `npm run typecheck` (`tsc -p tsconfig.json --noEmit`) failed with `TS6059
... is not under 'rootDir'` for every library consumed via the `paths` mapping. Root cause: no
      explicit `rootDir` was set alongside the explicit `outDir`, so `tsc` inferred `rootDir` from
      `apps/showcase/src` alone — any `paths`-mapped file outside that (i.e. every `packages/*/src`
      import) then failed the "must be under rootDir" check. Fixed 2026-09-30 by adding
      `"rootDir": "../.."` (the monorepo root) to `apps/showcase/tsconfig.json`, so the whole
      workspace is a legitimate common root. `ng build`/`ng serve` were never affected (they use
      `tsconfig.app.json`'s own build path, not this file's raw `tsc` invocation) and still work
      unchanged after the fix. Verified: root `npm run typecheck` now passes clean across every
      package and the showcase app in one run, and `ng build` still succeeds.
- Note for next session: killing the showcase's `ng serve` by `lsof -ti:4200 | xargs kill` only
  killed the npm/shell wrapper, not the actual `ng serve (ngx-showcase)` child — it kept running
  and serving a stale build on a later browser check. `kill -9 <pid>` on the actual listening PID
  (from `ss -ltnp | grep 4200`) is what actually frees the port.
- [x] `dist/package.json`'s `file:../x/dist` entries (the `ngx-api-client`/`ngx-auth`/`ngx-forms`
      sanctioned-exception mechanism — see root `CLAUDE.md`'s "Inter-package deps") needed rewriting
      to real semver ranges before every publish. Went through three attempts before it actually held,
      each one failing the same way — a step that isn't forced to run eventually doesn't: 1. A README-documented manual hand-edit. `ngx-region-settings` `1.0.1` and `1.0.2` were both
      published with the raw, unusable `file:` paths still in `dependencies` anyway. 2. `scripts/fix-dist-file-deps.js` (`npm run fix-dist-file-deps`) — a script that actually does
      the rewrite correctly (reads each sibling's real current version, doesn't hardcode one), but
      still a separate command you had to remember to run. `1.0.3` was published with the same
      unusable `file:` paths, proving a rememberable script doesn't hold either. 3. **Fix that actually held**: the script is now also this package's own `postbuild` script
      (`"postbuild": "node ../../scripts/fix-dist-file-deps.js ."`) — an npm lifecycle hook that
      fires automatically right after `build`, with no separate step to forget, whether triggered
      directly (`npm run build`) or via `scripts/build-packages.sh`'s `npm run build --workspace=...`.
      Verified both paths rewrite `dist/package.json` correctly without any extra command. - Caught a real bug in the script itself while wiring this up: it resolved an explicit
      package-path argument against the script's own directory (repo root) instead of the caller's
      cwd, so under `postbuild` (cwd = the package being built) it silently resolved to the wrong
      directory and did nothing. Fixed to resolve against `process.cwd()`. - `1.0.1`–`1.0.3` are published on npm with unusable `file:` dependencies and can't be
      overwritten — bumped to `1.0.4` for the next publish with the `postbuild` fix in place. Not
      yet actually republished (that's a `npm publish`, a real externally-visible action — left for
      the user to run).

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

## New package `ngx-translations` — built 2026-09-30

Decided 2026-09-29, revised twice the same day after finding an existing consuming app's own
`I18nStore` — its product requirements needed "responsive to language changes without reload."
First revision dropped reload for a hand-rolled instant-switch engine generalizing that store;
second revision replaced the hand-rolled engine with Transloco, after confirming it already
switches instantly — no reload — via a signal every
`translate()`/`translateObject()` call tracks inside `computed()` (its `activeLang` signal), so
"instant switch" and "own engine" were never actually linked. Built to that final design:

- [x] `provideTranslations({ locales, defaultLocale, dictionaries | loader, resolveLocale?, persistLocale? })`
      wraps `provideTransloco()`. `BundledTranslationsLoader` is the default (reads `dictionaries`, bundled
      at build time — matches an existing consuming app's reasoning for a small, finite locale set);
      pass `loader` instead for many locales or backend-served translations.
- [x] `TranslationsService` (root-provided): `locale` (`Signal<string>`, resolution order session override →
      `resolveLocale()` → `defaultLocale`), `setLocale()` (instant, no reload; persists via
      `persistLocale()` without awaiting it), `t(key, params)`, `formatDate()`/`formatNumber()` (own
      `Intl` use, not `LOCALE_ID`/`DateAdapter`, which can't react to a runtime switch),
      `supportedLocales()`.
- [x] `TPipe` (`t`) — reimplements Transloco's own pipe mechanism (subscribe to a language-change
      notification, `markForCheck()`) under our own name rather than re-exporting `TranslocoPipe`
      verbatim, so app templates never write Transloco's own pipe name.
- [x] The app never imports `@jsverse/transloco` directly — `TranslocoLoader`/`Translation` types
      (for a custom `loader`) are re-exported from this package's own barrel.
- [x] Two bugs found and fixed while wiring the showcase demo (`apps/showcase`'s `/translations` route),
      caught by screenshotting both locales rather than just building/typechecking: 1. `t()`/`TPipe` called `TranslocoService.translate()` directly, but nothing ever called
      `.load()` for a language — that's ordinarily the built-in pipe/directive's job. Every key
      rendered as itself (the missing-key fallback) in _both_ locales, not just an untranslated
      one. Fixed: `TranslationsService` now calls `.load(locale)` before `setActiveLang()`, both in the
      constructor's reactive subscription and in `setLocale()`. 2. `TranslationsService.t()` wasn't reactive inside a `computed()` — `TranslocoService.translate()`
      reads its own plain internal state, not a signal, so a `computed()` wrapping `t()` never
      reran on a language switch (translated fine via the `t` pipe, not via logic). Fixed: `t()`
      now passes `this.locale()` explicitly as `translate()`'s `lang` argument, so reading it
      inside a `computed()` sees the dependency. `TPipe` was changed to call `TranslationsService.t()`
      rather than `TranslocoService.translate()` directly, so both paths agree.
- [x] Wired into `apps/showcase` at `/translations` (two demo dictionaries, `en-GB`/`el-GR`): a language
      switcher, `t` pipe usage with params, `TranslationsService.t()` from a `computed()`, and
      `formatDate()`/`formatNumber()`. Verified in a browser in both locales, and that switching
      doesn't reload (a `window` marker set before the switch survives it) — no console errors.
- [x] `docs/ANGULAR_APP_CONVENTIONS.md`'s "Shared libraries" section, table, setup snippet, and
      "Dates and times" updated; root `CLAUDE.md` repo layout updated.
- [ ] Not yet published to npm — under development, no consumers yet.
- [ ] Still open, not done as part of this: - Per-library text tokens — see "Per-library text tokens" below, done 2026-09-30. - `ngx-api-client` sending `Accept-Language` from the active locale. - Migrating an existing consuming app's own `I18nStore`/`labels.ts` onto this package —
      flagged for later, on request, not started. - Peak/ICU-heavy features (plurals, gendered forms) aren't exercised by the demo yet, only the
      plain-dictionary/interpolation path. - `ngx-forms`' `dateTimeConfig.locale` fallback — see "`ngx-forms`: `NGX_FORMS_LOCALE`" below,
      done 2026-09-30, after `ngx-dates`.

## New package `ngx-dates` — built 2026-09-30

Built right after `ngx-translations`, per this file's own note above ("reading the locale from `ngx-translations`'s
`TranslationsService.locale()`"). That note's plan — `ngx-dates` importing `TranslationsService` directly — turned
out not to build:

- [x] Tried the direct import first. `ng-packagr` failed with `TS2307: Cannot find module
'@wiltech-labs/ngx-translations'`, even with a `tsconfig` `paths` mapping (which fixes this for `tsc`
      directly, and is how `apps/showcase` resolves every package — but `ng-packagr` builds each
      package as a fully standalone publishable unit and doesn't honour it the same way). Root
      cause: a workspace sibling's _source_ `package.json` has no `main`/`types` field — only the
      `dist/` one `ng-packagr` itself writes does — so there's currently no working way for one
      package here to depend on another's source at build time, only for an app to depend on
      several of them side by side. Documented as a new row in root `CLAUDE.md`'s "Locked-in
      decisions" table ("Inter-package deps: none") so this isn't rediscovered the hard way again.
- [x] Redesigned around `NGX_DATES_LOCALE` (`InjectionToken<() => string>`, defaults to
      `navigator.language`) — the exact pattern `ngx-translations`'s own `NgxTranslationsConfig.resolveLocale`
      already uses for app-pluggable resolution, applied one level further out. The app wires the
      two together itself: `{ provide: NGX_DATES_LOCALE, useFactory: () => { const translations =
inject(TranslationsService); return () => translations.locale(); } }`. `ngx-dates` ends up with zero
      dependency on `ngx-translations`, or on any i18n setup at all.
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
      performed _inside_ the injected `resolveLocale()` function call, not just ones read directly
      in the effect body.
- [x] Wired into the showcase's existing `/translations` demo (not a separate route — the point is showing
      both packages react to the same switch together): `main.ts` wires `NGX_DATES_LOCALE` to
      `TranslationsService.locale()`; the demo adds a "5 minutes ago" / "3 days ago" pair. Verified with
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
pattern as `NGX_DATES_LOCALE` — an app can wire it to `ngx-translations`'s `TranslationsService.locale()` the same
way, with zero import-time dependency between the two packages.

- [x] `NGX_FORMS_LOCALE` added (`config/forms-locale.token.ts`), defaulting to
      `DEFAULT_DATE_TIME_LOCALE` (`'en-GB'`) — **not** the browser's own language the way
      `NGX_DATES_LOCALE` defaults, and deliberately not wired to `ngx-translations` in the showcase either:
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

Surveyed all 5 non-translations packages (`ngx-forms`, `ngx-graphs`, `ngx-media`, `ngx-web-sockets`,
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
      reads it via `computed(() => this.resolveText())`, so a resolver wired to `ngx-translations` stays
      reactive to a language switch. Exported from `public-api.ts`.
- [x] `ngx-web-sockets`' `ChatRoom` had six: connection status ("Connected"/"Connecting…"), the
      messages-region and composer `aria-label`s, the composer placeholder, and the send button's
      `aria-label`/`title` — plus five more in _transient status messages_ that were easy to miss on
      a first pass (`showStatus()` calls for "A client connected"/"A client disconnected", the
      per-client "X is typing…", and the two error messages). Added `NGX_CHAT_TEXT`
      (`config/chat-text.token.ts`, `ChatText` — the two parameterized ones, `clientTyping` and
      `error`/`connectionError`, are functions rather than interpolation-placeholder strings, to
      avoid building a template-parsing mini-engine for two call sites). Message _bodies_ are
      untouched — still plain app/server data.
- [x] Both packages rebuild/typecheck clean; full workspace build (8 packages + showcase `ng build`)
      still clean. `ngx-graphs`' "Show data" toggle checked live in the showcase's `/graphs` demo
      (all 8 chart types) with Playwright — renders and still toggles correctly, no console errors.
      `ngx-web-sockets` isn't wired into the showcase (no backend to connect to, a pre-existing,
      deliberate gap — see its own `CLAUDE.md`), so `ChatRoom`'s wiring couldn't be checked live;
      typecheck/build are the only verification it got.
- [x] `packages/graphs/README.md`+`CLAUDE.md`, `packages/web-sockets/README.md`+`CLAUDE.md`, and
      `docs/ANGULAR_APP_CONVENTIONS.md` (`ngx-graphs`/`ngx-web-sockets` subsections) updated with the
      new tokens and an `ngx-translations`-wiring recipe for each.
- [ ] Neither token is wired into the showcase's own `main.ts` (unlike `NGX_DATES_LOCALE`) — left at
      their English defaults there. Wiring one in is a small follow-up if a demo of the translated
      path is ever wanted; not done here to keep this change to the packages themselves.

## More housekeeping

- [ ] Showcase: give it the house M3 theme (it uses light-only `azure-blue` + hardcoded greys), so dark
      mode can be checked for real.
- [x] Run Prettier over the repo once and commit that separately. Done 2026-09-30: added `prettier`
      as a root devDependency (no config existed for it as a package script before — `.prettierrc`
      was already checked in), plus `.prettierignore` (`dist`, `node_modules`, `coverage`,
      `package-lock.json`) and root `format`/`format:check` scripts. Ran `prettier --write .` once,
      144 files reformatted — trailing commas and a few wrapped lines, no semantic changes (spot-checked
      several diffs). Full `npm run build` and `npm run typecheck` both pass clean afterward.
- [ ] api-client: `resource()`/`collectionResource()` now guard with `hasValue()` — bump + publish
      0.1.6, then update consumers. Other packages: first publish once reviewed.
- [x] `ngx-auth` and `ngx-region-settings` were both built without the doc-sync step every earlier
      package got. Fixed 2026-09-30: both now have a "What to use for what" table row and a "Using
      each package" subsection in `docs/ANGULAR_APP_CONVENTIONS.md`, plus a "Setup" entry for
      `provideAuth()`/`authInterceptor` (`ngx-region-settings` needs no app-level provider —
      `CurrentUserStore` is already `providedIn: 'root'`, documented as such rather than added as a
      no-op setup line). `ngx-auth`'s "Using each package" entry points back at this doc's existing
      "Authentication (Clerk)"/"`AuthStore` shape"/"Routing" sections rather than duplicating them,
      since those already describe the exact pattern this package packages up. Still no showcase
      home-page tile for either — both need a signed-in state to demo meaningfully, which
      `apps/showcase` doesn't have wired up yet; that part of the gap stays open (see each package's
      own "not yet wired into apps/showcase" note).

## Showcase M3 theme + modals/notifications browser pass — 2026-09-30

Prompted by feedback after actually looking at the showcase: the app was still on Material's
light-only `azure-blue` prebuilt theme (never switched to the house M3 theme, so dark mode couldn't
be checked for real), the modal's close icon rendered as broken/blank, and the notifications panel
and its item interaction needed a real design pass rather than the placeholder it launched with.

- [x] **Showcase M3 theme.** Replaced `styles.css` + `@import '@angular/material/prebuilt-themes/
azure-blue.css'` with `styles.scss` + `@include mat.theme(...)` using the house palette (seeds
      `#0A7E8C` primary / `#8A6D1C` tertiary — copied verbatim from
      `docs/ANGULAR_APP_CONVENTIONS.md`'s "Design system: Material 3" embed, into a new
      `src/styles/_theme-colors.scss`), `color-scheme: light dark`, Roboto/Roboto Flex. Only the
      theme foundation from that doc's full recipe — not the whole nav-rail/shell/breakpoints/spacing
      system, which is a separate, much larger change nobody asked for here. Known gap: most demo
      pages' own CSS (`modals-demo.component.css`, home page tiles, etc.) still hardcodes hex colours
      from before this pass and doesn't follow dark mode — pre-existing, out of scope of this fix,
      worth a follow-up if the showcase's own demo-page chrome (as opposed to the packages it's
      demoing) needs to look right in dark mode too.
- [x] **Modal close icon was rendering broken/blank.** Root cause: `ModalShellComponent`'s close
      button is a `<mat-icon>close</mat-icon>` ligature (a real Angular Material icon font glyph, not
      a raster image) — the showcase never linked the Material Symbols font or set
      `MAT_ICON_DEFAULT_OPTIONS`, so the ligature name rendered as literal text (or nothing, depending
      on font-loading timing) instead of a glyph. Not a package bug: `docs/ANGULAR_APP_CONVENTIONS.md`
      already documents this exact `<head>` link + provider as part of its "Foundations" setup step;
      the showcase just hadn't done it (no other package's demo used `mat-icon` before `ngx-modals`,
      so the gap was never hit). Fixed in `apps/showcase/src/index.html` (Material Symbols Outlined
      `<link>`) and `main.ts` (`{ provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet:
'material-symbols-outlined' } }`) — see `packages/modals/CLAUDE.md` for the full note.
- [x] **`ngx-modals` header restyled** to `headline-small` (was `title-large`) with more vertical
      padding — page-title scale, not panel-title scale, so it reads as distinct from the
      notifications panel's own header now that both are visually similar right-docked panels.
- [x] **`ngx-notifications` panel repositioned and restyled.** Was a small `cdkConnectedOverlay`
      dropdown anchored under the bell (360px wide, max 480px tall) — changed to the same right-docked
      contract as `ngx-modals` (full height, `--ngx-notifications-width` default `33vw`, full screen
      below `Breakpoints.XSmall`). **Not** done by adding `ngx-modals` as a dependency — that's not
      one of root `CLAUDE.md`'s two sanctioned inter-package-dependency exceptions
      (`ngx-api-client`/`ngx-auth` only) — instead rebuilt natively with CDK's imperative `Overlay`
      API (global position strategy) instead of the `cdkConnectedOverlay` structural directive, which
      only supports origin-relative positioning. Also restyled: a proper header (icon well, title,
      "N unread" subtitle, `title-large` — kept distinct from `ngx-modals`' now-`headline-small`
      header), list items get a hover surface and rounded corners instead of full-bleed hairline rows.
      See `packages/notifications/CLAUDE.md`'s "Panel positioning" note for the full mechanism.
- [x] **Notification item interaction changed.** Was a single big `<button>` wrapping the whole
      projected item template, so clicking anywhere on an item (title, body, a mis-click near dismiss)
      fired `openNotification()` — changed to a plain `<div>` (not clickable) plus one explicit "View"
      action button (`NGX_NOTIFICATIONS_TEXT.action`, new field, default `'View'`) that's the only
      thing triggering the action; the X dismiss button is unchanged. See
      `packages/notifications/CLAUDE.md`'s "item's own content is not a click target" note.
- [x] **Second `ngx-modals` showcase scenario**: a signup form (name/email/agree-to-terms,
      `ReactiveFormsModule`) alongside the existing holiday-approval one — demonstrates getting a
      typed value _back out_ of a modal on close (`MatDialogRef.close({action, data})` from a valid
      submit), not just data passed in. New `signup-modal-content.component.ts`/`.html` in
      `apps/showcase/src/app/demos/modals-demo/`.
- [x] **Verified in a headless browser** (Puppeteer driving system Chrome from a scratchpad script —
      no interactive browser-automation tool was available in this session, so this was a one-off
      check rather than a repeatable suite): both modal scenarios (including form validation and the
      typed close result), the notifications panel's open/View/dismiss/Escape interactions and badge
      count, and light + emulated-dark `prefers-color-scheme` for all of the above. No console errors
      in any of these checks. `npm run typecheck` and `npm run build` (full repo, including the
      showcase app) both pass clean.

## New package `ngx-modals` — built 2026-09-30

Idea captured 2026-09-30, refined the same day with a layout spec and a real prior-art reference,
built the same day too.

### Prior art: an existing app's dialog service

A few years old, in a sibling repo, not part of this monorepo. Worth porting the _shape_ of, not
the code verbatim (it predates Signals, standalone components are inconsistent there, and the
layout requirement below is new):

- `dialog.service.ts` — a thin `DialogService` wrapping `MatDialog`, plus a `DialogClosedActionType`
  enum (`CREATED`/`UPDATED`/`DELETED`/`DISMISSED`) right in the same file. Settles the
  CDK-vs-Material question below: given `ngx-forms` already depends on Angular Material, and this
  prior art already builds on `MatDialog` (not raw `@angular/cdk/dialog`), `ngx-modals` should too —
  `MatDialog` already wraps CDK Dialog and adds the Material surface/animation/theming this needs
  anyway.
- Per-dialog `<X>DialogCloseData` interfaces (e.g. `SurveyInstanceDialogCloseData { actionType: 
DialogClosedActionType; id; surveyInstance }`) — the enum _and_ the payload travel together in one
  object. Exactly the "access to the data as well" shape asked for — `ngx-modals` should generalize
  this into one typed shape (something like `ModalCloseResult<TAction, TData> = { action: TAction;
data: TData }`) instead of every app hand-writing its own close-data interface per dialog.
- Caller pattern: `dialog.open(Component, config).afterClosed().subscribe(data => { if
(data.actionType === DialogClosedActionType.DELETED) { ... } })` — confirms the enum is read by the
  _caller_, after close, not by the modal content itself.
- `MatConfirmDialogComponent` + `DialogService.openConfirmDialog(msg)` — a small reusable Yes/No
  dialog (`disableClose: true`, so the user must pick a button) used today only for delete
  confirmations. `ngx-modals`' own unsaved-changes prompt (see below) is the same idea, generalized.
- Responsive resize already exists there too: `BreakpointObserver.observe(Breakpoints.XSmall)`
  (`@angular/cdk/layout`) subscribed per open dialog, calling `dialogRef.updateSize('100%', '100%')`
  on the small breakpoint and back to a fixed size otherwise. `ngx-modals` should do the same kind of
  reactive resize, just to the layout in the next section instead of a centered dialog.

### Layout: a right-hand panel, not a centered dialog

The actual ask is closer to a **side sheet** than a classic centered `MatDialog`: docked to the
right edge, full viewport height (top to bottom), one third of the screen width — so on a wide
screen the user can still see and act on what's behind it (e.g. approving a colleague's holiday
request in the panel while their team's availability stays visible on the left).

- [x] Angular Material has no ready-made "side sheet" component to lean on (`MatSidenav`/`mat-drawer`
      is a persistent layout element, not an on-demand modal). Built as `MatDialog.open()` with
      `position: { top: '0', right: '0' }`, `height: '100vh'`, a width token (see below) — all pure
      `MatDialogConfig` inline styles, no stylesheet needed for correct positioning/sizing.
      **Descoped for v1**: the `panelClass` override for a slide-in-from-right transition with
      square left-hand corners (Material's default centered fade/scale + rounded corners apply
      as-is instead) — styling `.cdk-overlay-pane`/`.mat-mdc-dialog-container` needs a _global_,
      non-component-encapsulated stylesheet (`::ng-deep` from the shell can't reach them — they're
      CDK-created ancestors of the shell's own root element, not descendants), and this repo has no
      established mechanism yet for a package to ship loose global CSS an app imports. See
      `ngx-modals`' own `CLAUDE.md` for the full reasoning; revisit if/when that packaging question
      gets solved (maybe by `ngx-styles`, maybe some other way).
- [x] Width is an overridable `--ngx-modal-width` custom property, defaulting to `var(--ngx-modal-width,
33vw)` — settable app-wide via the CSS variable, or per-open via `ModalConfig.width`.
- [x] **Correction to the "breakpoints are already in a library" assumption**: confirmed still true
      — no `ngx-styles` yet (see that section below). `ngx-modals` reacts to the CDK's
      `BreakpointObserver.observe(Breakpoints.XSmall)` directly at runtime, subscribed per `open()`
      call and unsubscribed on `afterClosed()`. If `ngx-styles` ever ships breakpoints as tokens,
      revisit this.
- [x] Below the compact/`XSmall` breakpoint: full screen, via `dialogRef.updateSize('100vw', '100vh')`
      on breakpoint match, same `updateSize()`-on-breakpoint-change approach as the prior art.

### Close reason + unsaved-changes guard

- [x] **Resolved**: `ModalCloseAction` enum — `Dismissed`/`Cancelled`/`Done`/`Created`/`Updated`/
      `Deleted` — six members, a starting vocabulary rather than a closed list (see below), paired
      with whatever data the modal wants to hand back via `ModalCloseResult<TAction, TData> = {
action: TAction; data: TData }`.
- [x] **New requirement, not in the prior-art app above — built**: the shell's X button closes
      immediately if the content has no unsaved changes; if it does, `ModalService`'s own
      `ConfirmDialogComponent` prompts first ("You have unsaved changes. Are you sure you want to
      close? It will lose data."), and only closes the panel if confirmed. - Content reports dirty state via the optional `ModalContent.hasUnsavedChanges(): boolean` —
      a component that doesn't implement it is treated as always safe to close (a `hasUnsavedChanges()`
      helper checks `typeof instance?.hasUnsavedChanges === 'function'` before calling it, never throws). - The outer `MatDialog` is opened with `disableClose: true` — Escape and a backdrop click do
      nothing, so they can't bypass the same check the X button goes through. - `ConfirmDialogComponent` is the generalized, reusable version of the prior-art app's
      `MatConfirmDialogComponent`/`openConfirmDialog()` — also exposed directly as
      `ModalService.confirm(message, options?)` for anything else that wants the same prompt (e.g.
      a delete confirmation), not just this package's own internal use of it.
- [x] **The exact typed-wrapper API shape, resolved**: `ModalService.open<TResult, TData>(component,
config)` — root-provided service, not a factory function or a directive. It wraps `component`
      in an internal `ModalShellComponent` (chrome: positioning, the close button, the dirty-check
      guard) and opens _that_ through `MatDialog`, returning `MatDialogRef<unknown, TResult>` (the
      shell's own type is erased from the public signature — nothing outside this package needs it).
      `ModalShellComponent` creates the caller's `component` dynamically
      (`ViewContainerRef.createComponent()`) inside its own view and feeds it `config.data` via
      `.setInput('data', ...)` — the content component declares a matching `data` input. Because
      that dynamic creation happens inside a view whose injector chains up through the dialog's own
      injector, the content component can `inject(MatDialogRef<ItsOwnType, ItsOwnResultType>)`
      directly and call `.close(result)` itself, exactly as if `MatDialog.open()` had opened it
      directly — no shell-mediated close-event bus needed. (Generic parameters on `MatDialogRef` are
      compile-time only; every component in the tree resolves the same runtime singleton for one
      open dialog regardless of what generic argument each site uses.)
- [x] Package scaffolded (`package.json`, `ng-package.json`, `tsconfig.json`, `README.md`,
      `CLAUDE.md`), `tsc --noEmit` and `ng-packagr build` both clean. Root `CLAUDE.md` repo layout
      and `docs/ANGULAR_APP_CONVENTIONS.md` ("What to use for what" table + a new `ngx-modals`
      "Using each package" subsection) updated.
- [x] Wired into `apps/showcase` at `/modals`: a holiday-approval demo (`ModalsDemoContentComponent`)
      exercising `data` in, the dirty-check guard (typing into its note field marks it dirty before
      the X button is clicked), and a typed `ModalCloseResult` read back via `afterClosed()`. Full
      showcase `ng build` (all 11 packages + the app) confirmed clean with it wired in.
      **Not yet clicked through in an actual browser** — no browser-automation tool was available in
      this session (unlike the Playwright verification other demos in this repo got). The
      dynamic-component/`MatDialogRef` mechanism above is sound per Angular's documented
      `ViewContainerRef`/injector-hierarchy behaviour, but this is flagged explicitly rather than
      claiming a check that didn't happen — do an actual browser pass (open the modal, type in the
      note field, click the X button, confirm the prompt appears; also try Approve/Cancel; also
      shrink the viewport below the `XSmall` breakpoint and confirm it goes full screen) before
      trusting this beyond "it builds."
- [ ] No consumer yet. Not a straight port of already-exercised consumer-app code the way most
      packages here started — closer to a redesign of the prior-art app above, adapted to a
      layout that prior art never had.
- [ ] Not yet published to npm.

## New package `ngx-region-settings` — built 2026-09-30

Idea captured 2026-09-30, built the same day. Prior art reviewed in a _different_ reference app than
the one behind `ngx-modals` above (`current-user.store.ts`, `region-settings.store.ts`). That app
isn't a `@wiltech-labs/*` consumer itself (its own personal-scope API-client fork, a hand-rolled
`AuthStore`/`TranslationService`), so — same caveat as every other prior-art reference here — port
the _shape_, not the code.

### What's copy-pasted per app today

Every app repeats the same flow: sign in → call `/me` → follow its `userProfile` link → follow
`userSettings`/`systemSettings` links off the profile, into two screens ("my settings" and an
admin-only "system settings") that are the same shape with different links and different `_data`
roots.

### What the reference already got right (port this shape)

- `RegionSettingsStore` is an **abstract base class** parameterized by only two things: the `_data`
  root key (`'userSettings'`/`'systemSettings'`) and which profile link to follow. Two 5-line
  subclasses (`UserSettingsStore`/`SystemSettingsStore`) supply those. The base owns loading state,
  metadata-driven `options` (never a hardcoded `<select>` list), a `notAvailable` computed (link
  absent from the profile = this caller isn't allowed the screen), `save()`/`reset()` through the
  resource's own `updateSettings`/`resetSettings` links, and an `owner_type: 'SYSTEM' | 'USER'` flag
  so the UI can show "you're on the system default" before the user ever saves their own — a genuine
  own-value-with-a-system-default-fallback pattern, not specific to region/locale.
- `CurrentUserStore` follows `/me` → `userProfile` the same never-hand-built-URL way, gated on
  `AuthStore.isSignedIn()`, and exposes a `link(name)` helper every feature (settings, and — per the
  `ngx-notifications` discussion above — a notifications link too) reads off of.

### Design decisions

- [x] **Resolved 2026-09-30**: this package _does_ own `CurrentUserStore`/`UserSettingsStore`/
      `SystemSettingsStore` as ready-to-use signal stores, built directly on `ApiClientService` from
      `@wiltech-labs/ngx-api-client` — a real npm dependency, not an app-supplied `fetch`/`save`/
      `reset` function. Consuming apps inject the library's own stores and use them as-is, the same
      way `ngx-translations` hands apps a ready-to-use `TranslationsService` built on Transloco,
      rather than asking every app to wire up its own. This is the first case of one
      `@wiltech-labs/ngx-*` package depending on another — see root `CLAUDE.md`'s "Inter-package
      deps" row for the sanctioned-exception rule and why it doesn't reopen the `ngx-dates`/
      `ngx-translations` case (`ngx-api-client` is kept a strict foundation leaf; this package
      depends _downward_ on it, and no cycle is possible as long as `ngx-api-client` never depends on
      anything built on top of it).
- [x] **Not circular**: confirmed with the user — the dependency is one-directional
      (`ngx-region-settings → ngx-api-client`), same shape as `ngx-translations → @jsverse/transloco`.
      A cycle would require `ngx-api-client` to depend back on `ngx-region-settings`, which nothing
      calls for and the foundation-leaf rule above forbids.
- [x] **Resolved 2026-09-30 — generic, defaulting to the reference's real shape**: both
      `RegionSettingsStore<TSettings, TPayload>` and `CurrentUserStore<TMe, TProfile>` are generic,
      settled via an explicit question to the user rather than picked unilaterally. Immediately
      after answering "generic" for both, the user added the actual reasoning: every consuming app's
      API payload shape is fixed (backend-owned, not something this package or an app's UI can
      renegotiate) and "every Angular app will be updated to match the exact payload the API sends"
      — the reference app's shapes (`Me`/`UserProfile`/`RegionSettings`/`RegionSettingsPayload`, five
      settings fields: `timezone`/`language`/`locale`/`currency`/`theme`, plus `owner_type` on the
      user's own settings) are "the latest api convention" every app converges on, not just one
      possible shape among many. So the type parameters default to those exact concrete shapes
      (mirroring the reference field-for-field, including `owner_type`), rather than to something
      invented or left abstract — the common case (now effectively every app) needs zero type
      arguments; the generics exist for the rare app whose payload genuinely still differs.
- [x] Naming follows the reference project's own name for this exact pattern: `packages/
region-settings` / `@wiltech-labs/ngx-region-settings`.
- [x] **Resolved 2026-09-30**: `ngx-region-settings` also takes a real dependency on `ngx-auth`,
      gating `CurrentUserStore`'s `/me` fetch on `AuthStore.isSignedIn()` directly, the same way the
      reference code does. This is the second sanctioned exception to root `CLAUDE.md`'s
      "Inter-package deps" rule — see that row for why it's safe (both `ngx-api-client` and
      `ngx-auth` are kept strict foundation leaves).
- [x] Build order followed as planned: `ngx-auth` first (built earlier the same day), then
      `ngx-region-settings`, which depends on both it and `ngx-api-client`.
- [x] **Solved the real `ng-packagr`/npm-workspaces resolution problem this section's design
      decisions above assumed was solvable**: a bare semver range in `ngx-region-settings`'
      `dependencies` resolves to npm workspaces' own auto-link-by-name behaviour, pointing at the
      sibling's _unpublished source_ folder — the exact `TS2307` dead end hit and documented under
      `ngx-dates` above. Fix: an explicit `"file:../api-client/dist"` / `"file:../auth/dist"`
      reference in `dependencies` instead — npm then nests a local `node_modules/@wiltech-labs/ngx-x`
      inside `packages/region-settings` pointing at the literal path given (the sibling's _built_
      output, which has real `main`/`types`), rather than the root-hoisted source symlink. Confirmed
      working end to end: `npm install`, `tsc --noEmit`, and `ng-packagr build` all succeeded.
      A root-level npm `overrides` entry was tried first (to avoid a `file:` path in `dependencies`
      at all) — npm refused it (`EOVERRIDE ... conflicts with direct dependency`) because
      `ngx-api-client`/`ngx-auth` are workspace members, treated as a direct dependency of the
      workspace root. Two consequences, documented in `ngx-region-settings`'s own `CLAUDE.md`: (1)
      `ngx-api-client`/`ngx-auth` must be _built_ (their `dist/` must exist) before
      `ngx-region-settings` builds — root `CLAUDE.md`'s "Inter-package deps" row now documents this;
      (2) `ng-packagr` copies `dependencies` verbatim into `dist/package.json`, `file:` paths
      included, so publishing needs a manual fixup first (replace the `file:` entries with real
      semver ranges) — documented as an explicit step in the package's README "Publishing" section.
- [x] **Scope boundary decisions made while building, not pre-designed**: no dependency on
      `ngx-translations` (`RegionSettingsStore.options` returns raw `_metadata`-derived
      `{value, viewValue}` pairs, no label-translation step — an app maps labels itself, same
      "app owns presentation" boundary `ngx-notifications` draws for its callbacks below); no
      `isAdmin`-style helper on `CurrentUserStore` (the reference's `roleIds.includes('ADMIN')` bakes
      in a role-name literal that's an app policy choice, not identity mechanics — `me()?.roleIds` is
      exposed raw instead); errors exposed raw as `Signal<unknown>`, not humanized (the reference ran
      them through an app's own i18n error-describer — out of scope here for the same reason).
- [x] Package scaffolded (`package.json`, `ng-package.json`, `tsconfig.json`, `README.md`,
      `CLAUDE.md`), builds and typechecks clean. Root `CLAUDE.md` repo layout and "Inter-package
      deps" row updated with the real resolution mechanism above.
- [ ] Not yet wired into `apps/showcase` — no route in that app actually needs sign-in/settings yet.
- [ ] Not yet published to npm — under development, no consumers yet.

## New package `ngx-notifications` — built 2026-09-30

Idea captured 2026-09-30, built the same day. Not folded into `ngx-media` — that package is
deliberately presentational and stateless (skeleton loaders, a YouTube embed), with no service layer
or data-fetching at all. This needs a bell+badge icon, a panel/list, an unread count, dismiss (a
mutation), and deep-linking (router integration) — state plus UI, closer in shape to
`ngx-web-sockets` (a service + components on top of it) than to `ngx-media`.

- [x] **Stays fully app-pluggable — no dependency on `ngx-api-client`, unlike `ngx-region-settings`.**
      Built as `provideNotifications(configFactory)` + `NotificationsConfig<TNotification>`
      (`fetchNotifications`/`dismissNotification`/`openNotification`), same "app supplies an opaque
      function" pattern as `ngx-translations`' `loader` / `ngx-dates`' `NGX_DATES_LOCALE`. Deliberately
      _not_ extending the `ngx-api-client`/`ngx-region-settings` sanctioned exception — an app can
      still source `fetchNotifications` from `ngx-region-settings`' own
      `CurrentUserStore.link('notifications')` at the call site, which is an app-level composition
      choice, not a package dependency.
- [x] **Real bug caught during build, not in the design sketch above**: the sketch's
      `provideNotifications({ fetchNotifications: () => inject(ApiClientService)... })` — a _plain
      config object_ whose callbacks call `inject()` directly inside themselves — doesn't actually
      work. `NotificationsService.refresh()` calls those callbacks later, on a poll tick or a dismiss
      click, with no Angular injection context at all; a raw `inject()` call in there throws
      `NG0203` the first time a poll tick fires. Fixed: `provideNotifications()` takes a **factory**
      (`() => NotificationsConfig<T>`) registered via `useFactory` — the same fix `ngx-dates`'
      `NGX_DATES_LOCALE` wiring recipe already uses for the identical reason — so `inject()` runs
      once, inside a real injection context, and the returned callbacks close over the result
      instead of injecting anything themselves.
- [x] **Polling, not websockets** — confirmed explicitly, ruled out. Root-provided
      `NotificationsService` (one per app, same "one instance, self-managing" shape as
      `ngx-web-sockets`' `WebSocketService`) fetches once immediately at construction (eagerly, via
      `provideAppInitializer` — same sequencing `ngx-auth`'s `provideAuth()` uses for `AuthStore`),
      then on a `setInterval` (default 5 minutes, `pollIntervalMs` to override). Exposes
      `notifications`/`unreadCount`/`loading`/`error` as signals.
- [x] **Deep-link and dismiss are both app-supplied callbacks, resolved** — `openNotification` is
      called on item click and does its own `Router.navigate()`; this package never imports
      `@angular/router`. `dismiss()` re-fetches afterward (`config.dismissNotification()` then
      `refresh()`) rather than guessing at an optimistic update — same pattern as
      `ngx-region-settings`' `save()`/`reset()` → `resource.reload()`. `select()` (item click) also
      refreshes, so an app whose `openNotification` marks the item read server-side sees the badge
      update immediately rather than waiting for the next poll tick.
- [x] **Open design question, resolved — Material-free**: built on `@angular/cdk/overlay`'s
      `cdkConnectedOverlay`/`cdkOverlayOrigin` directives (panel positioning + backdrop dismiss) and
      `@angular/cdk/a11y`'s `cdkTrapFocus` (focus containment while open) — no `@angular/material`
      dependency, matching `media`/`ai-tools`/`graphs`/`web-sockets`. `--ngx-notifications-*` custom
      properties default to `--mat-sys-*` tokens, hex fallback last, same as that family.
- [x] **`NotificationsWidget<TNotification>` is generic**, and item rendering is content-projected
      (`@ContentChild(TemplateRef)`) — the package has no canonical notification shape to default to
      (unlike `ngx-region-settings`' `Me`/`RegionSettings`, which mirror a real, fixed API
      convention). No projected template falls back to a raw `{{ notification | json }}` dump — a
      debug view, not a real empty state.
- [x] Text (`panelTitle`/`loading`/`empty`/`error`/`dismiss`/`close`/`triggerLabel`) comes from
      `NGX_NOTIFICATIONS_TEXT`, same resolver-function pattern as `NGX_GRAPHS_TEXT`/`NGX_CHAT_TEXT`.
- [x] Package scaffolded (`package.json`, `ng-package.json`, `tsconfig.json`, `README.md`,
      `CLAUDE.md`), `tsc --noEmit` and `ng-packagr build` both clean. Root `CLAUDE.md` repo layout
      and `docs/ANGULAR_APP_CONVENTIONS.md` ("What to use for what" table + a new `ngx-notifications`
      "Using each package" subsection) updated.
- [x] Wired into `apps/showcase` at `/notifications`: an in-memory fake backend (no real API) in
      `main.ts`'s `provideNotifications()` call, demonstrating open-marks-read and dismiss-removes.
      Full showcase `ng build` (all 12 packages + the app) confirmed clean; dev server started and
      `/notifications` returned `200` with no errors in the server log — same caveat as `ngx-modals`
      above: **not clicked through in an actual browser**, no browser-automation tool was available
      this session. Do an actual browser pass (open the bell, confirm the badge shows 2, click a
      notification and confirm the badge drops to 1, dismiss the other and confirm the list empties
      to "No notifications.") before trusting this beyond "it builds and serves."
- [ ] No consumer yet. Design before building, same as every other package here.
- [ ] Not yet published to npm.

## New package `ngx-styles` — built 2026-09-30

Long-standing idea, first flagged in this file's "Align libraries..." section above ("Possibly
`ngx-styles`... see discussion"). **Reference for this one is
`docs/ANGULAR_APP_CONVENTIONS.md`'s own SCSS setup (ported from `insurly-ui`'s `src/styles/*`) —
explicitly not the dialog-service reference app behind `ngx-modals`, which is scoped to that design
only.**

Ships the four partials every app was copy-pasting fresh: `_breakpoints.scss` (the `sm: 600px`/
`md: 840px`/`lg: 1200px` scale + `bp.up()`/`bp.down()` mixins), `_spacing.scss` (4px-unit `space()`
scale + responsive padding steps), `_ui.scss` (mixins like `page-title`, `banner`, `state-layer`,
`focus-ring`, all reading `--mat-sys-*` tokens), and `theme-colors.template.scss` (the house
Material seed palette, as a copy-and-own template, not a shared partial).

- [x] **Naming decided**: `packages/styles` / `@wiltech-labs/ngx-styles` — not `ux-styles`. "UX"
      implies interaction/usability design; this package is Sass tokens and mixins, a styling
      concern, not a UX one, and `styles` matches the plain, single-concern naming every other
      package already uses (`forms`, `graphs`, `dates`, `translations`).
- [x] **Open shape question, resolved**: this is a genuinely different _kind_ of package than
      everything else here — pure Sass partials/mixins, no `@Injectable`/`@Component`/TypeScript at
      all, so `ng-packagr` (Angular Package Format, fundamentally about compiling Angular sources)
      isn't the right build. Went with a plain npm package: no `ng-package.json`, no `tsconfig.json`,
      no `src/public-api.ts`, no `build`/`typecheck` script (root's `--if-present` scripts skip it
      cleanly). `package.json` just lists `"files": ["src"]` and publishes raw `.scss` straight from
      source. Root `CLAUDE.md`'s "New package checklist" doesn't apply here as written — see this
      package's own `CLAUDE.md` for what's different.
- [x] `_breakpoints.scss`/`_spacing.scss`/`_ui.scss` ship as `@use`-able partials — consumers add
      `node_modules/@wiltech-labs/ngx-styles/src` to `angular.json`'s `stylePreprocessorOptions.
includePaths`, then `@use 'breakpoints'`/`'spacing'`/`'ui'` exactly like the local-copy
      convention they replace. `theme-colors.template.scss` ships as a template to copy into the
      app's own `src/styles/_theme-colors.scss` and regenerate via
      `ng generate @angular/material:theme-color` — deliberately **not** underscore-prefixed, so it
      can't accidentally be `@use`d as a shared partial. A brand palette is per-app; the other three
      files are genuinely shared logic. Resolved per the doc's own framing ("keep the house seeds...
      change them only for a genuinely different brand").
- [x] `_ui.scss`'s `state-layer` mixin reads `--app-duration-short`/`--app-ease-standard` — two plain
      CSS custom properties this package doesn't define itself. Decided these stay app-owned (set in
      the consumer's own `styles.scss` `:root`, same as `--app-page-max-width`/`--app-gutter`) rather
      than having `ngx-styles` emit a second copy of them — see this package's `CLAUDE.md` for why
      that would be a worse source-of-truth problem than the coupling itself.
- [x] Verified the partials actually compile: ran the Sass CLI directly against `packages/styles/src`
      with a throwaway stylesheet exercising `bp.up()`, `spacing.space()`, `ui.page-title`,
      `ui.state-layer`, and `ui.danger-button(filled)` — output matched the reference doc's CSS
      exactly. `theme-colors.template.scss` also compiles standalone (against the repo's own
      `@angular/material`, via `--load-path=node_modules`).
- [ ] No showcase demo route — `apps/showcase` uses plain `.css` with no M3 theme foundation
      (`_theme-colors.scss`/`mat.theme()`) set up, so there's nothing for these mixins to plug into
      without first building that foundation into the demo app, which is out of scope for this
      package. Not browser-verified beyond the Sass-compiles-cleanly check above.
- [ ] Once consumed somewhere, `ngx-modals`' `--ngx-modal-width` responsive behaviour and any other
      package's breakpoint-dependent CSS should read from this instead of assuming
      `BreakpointObserver`/`Breakpoints.XSmall` alone — see the `ngx-modals` section above, which
      flagged this exact gap. Not done yet — `ngx-modals` doesn't take a dependency on this package
      (styles partials aren't importable by a TS file the way `ngx-api-client`/`ngx-auth` are).
- [ ] No consumer yet.
- [x] Doc-sync done: `docs/ANGULAR_APP_CONVENTIONS.md` got a "What to use for what" table row and a
      "Using each package" subsection. No showcase home tile — see the no-demo-route note above.

## New package `ngx-auth` — built 2026-09-30

Unlike the other four planned packages, this one had a fully exercised spec to port from —
`docs/ANGULAR_APP_CONVENTIONS.md`'s existing "Authentication (Clerk)" section, plus an already-built
Clerk integration (state shape, the `mountSignIn()` gotcha, guard, interceptor) in existing
consuming apps — genuinely copy-pasted per app before this package existed, not a from-scratch
design. Chosen as the starting point of the five planned packages: no dependencies of its own, and
it unblocks `ngx-region-settings`.

Two different things were bundled under "auth" in the doc, and only one belongs in this package:

- [x] **In scope, built — the Clerk wrapper**: `AuthStore` (root-provided: `user`/`session` Signals
      holding Clerk's own objects directly, `isSignedIn = computed(() => session() != null)`,
      `init()`'s exact sequencing via `provideAppInitializer` — never a component constructor, so
      `authGuard`/`authInterceptor` never race a not-yet-loaded Clerk instance — `getToken()`,
      `signIn()`/`signOut()`), the `mountSignIn()`/`mountUserButton()` gotcha (never call them;
      `AuthStore.signIn()` uses `clerk.redirectToSignIn()` instead), `authGuard` (`CanActivateFn`
      checking `isSignedIn()`, redirecting to `NgxAuthConfig.redirectTo`), and `authInterceptor`
      (`HttpInterceptorFn` attaching the bearer token). `@clerk/clerk-js` (`^6.35.0`, newer than what
      existing apps pinned) is a regular `dependency` of this package, not a peer — same precedent as
      `ngx-translations`/`@jsverse/transloco`.
- [x] **Explicitly out of scope — `CurrentUserStore`**: the app's own backend profile, fetched via a
      HATEOAS link, shape differs per app. That's `ngx-region-settings`' job, not this package's —
      this package only answers "is someone signed in, and what's their token," never "who are they
      in our system."
- [x] **Design deviation from the apps this was generalized from**: those used `@ngrx/signals`'
      `signalStore()`; this package uses plain `@Injectable` + `signal()`/`computed()` instead — the
      same shape `ngx-translations`' `TranslationsService` already uses, so this package doesn't add
      a new third-party dependency (`@ngrx/signals`) nothing else here needs, for state this simple.
- [x] **`NgxAuthConfig.apiOrigin` made required, not defaulted** — the existing apps' interceptors
      hardcoded their own `environment.apiUrl` inline; this package generalizes that into a config
      field, and deliberately does _not_ give it a `''` default the way `ngx-api-client`'s
      `API_ORIGIN` has, because an empty/omitted origin would match every request
      (`'anything'.startsWith('')` is always `true`) and leak the token to third-party calls (Giphy,
      an image host, ...) — a real scenario flagged during design, not hypothetical.
- [x] **`authInterceptor` attaches a token only if one exists; it never blocks a request** — confirmed
      necessary during design: some apps allow guest/anonymous users, so the interceptor can't assume
      every request needs (or will get) a token. Access control stays `authGuard`'s job, applied
      per-route.
- [x] **Resolved 2026-09-30**: `ngx-region-settings` takes a real dependency on `ngx-auth`, gating
      `CurrentUserStore`'s `/me` fetch directly on `AuthStore.isSignedIn()`. This package therefore
      commits to being a foundation leaf itself, same as `ngx-api-client` — see root `CLAUDE.md`'s
      "Inter-package deps" row.
- [x] Package scaffolded (`package.json`, `ng-package.json`, `tsconfig.json`, `README.md`,
      `CLAUDE.md`), builds and typechecks clean. Root `CLAUDE.md` repo layout updated.
- [ ] Playwright/`@clerk/testing` setup (`clerkSetup()`, `clerk.signIn({ page, emailAddress })`)
      stayed out of this package — that's app-level e2e test config, not something a library ships.
      Worth a short recipe in the README if this turns out to trip people up in practice; not added
      yet since it isn't code this package needs to own.
- [ ] Not yet wired into `apps/showcase` — no route in that app actually needs sign-in yet. Add a
      demo once one does, same as every other package's showcase wiring.
- [ ] Not yet published to npm — under development, no consumers yet.

## `ngx-region-settings` gains `RegionSettingsFormComponent` — 2026-09-30

An external consuming app (`PythonTutorials/showcase`, a separate repo not part of this workspace)
had already built its own `RegionSettingsForm` — the exact form-per-app duplication
`ngx-region-settings` exists to prevent, since the store only ever exposed data, never a UI to edit
it.

- [x] Extracted that form into this package as `RegionSettingsFormComponent`
      (`settings`/`options`/`saving` inputs, `save` output), rendering the five region fields
      (timezone/language/locale/currency/theme) as `@wiltech-labs/ngx-forms` `SelectField`s. Ported
      the dirty-check (`linkedSignal` re-seeding from `settings()`, comparing against the edited
      model) and the `@angular/forms/signals` `form()`/`FormRoot` wiring as-is.
- [x] This required extending root `CLAUDE.md`'s "Inter-package deps" sanctioned-exception list to
      include `@wiltech-labs/ngx-forms` alongside the existing `ngx-api-client`/`ngx-auth` two —
      asked first rather than just doing it, since the doc explicitly calls out not extending it
      without revisiting. Same `file:../forms/dist` mechanism, `scripts/build-packages.sh` updated
      to build `ngx-forms` before `ngx-region-settings` too.
- [x] Dropped the direct `@jsverse/transloco` dependency the original app-level form had (its Save/
      Saving button text) — this package already has a standing "no dependency on `ngx-translations`"
      decision, so that text now goes through a new `NGX_REGION_SETTINGS_FORM_TEXT` resolver token
      instead, same pattern as `ngx-notifications`' `NGX_NOTIFICATIONS_TEXT`.
- [x] `SelectField`'s actual contract turned out to be `[fieldDef]`/`[field]` only — no separate
      `[options]` input like the app-level form assumed; options live on `fieldDef.options`. Caught
      by `ng-packagr build` (`tsc --noEmit` alone didn't catch it — it doesn't type-check templates
      the same way). Fixed by merging each field's static definition and its live API options into
      one computed `FieldDef` per field.
- [x] Own SCSS (a two-column responsive grid) deliberately hardcodes its two spacing values and one
      breakpoint instead of depending on `@wiltech-labs/ngx-styles` — that package has no confirmed
      way to resolve its Sass partials from `ng-packagr`'s own build step (only from a consuming
      app's `stylePreprocessorOptions.includePaths`, a different build entirely), and no package here
      has tried yet. Not worth the risk for two pixel values and one breakpoint.
- [x] `tsc --noEmit`, `ng-packagr build`, and a full `scripts/build-packages.sh` run all clean.
- [x] **Two bugs found once actually tried against `PythonTutorials/showcase`'s real screen/API —
      fixed 2026-09-30**: (1) SCSS set `column-gap` only, not `gap`, so fields touched borders in the
      default single-column layout (only visible on the two-column breakpoint's _column_ gap, not the
      more common stacked case); (2) select options bound `[value]` to `ValueViewValue.value` (the
      metadata row's internal id) instead of `.viewValue` (the domain string) — wrong here because
      `RegionSettingsPayload`'s fields (`timezone`/`currency`/etc.) are the domain strings themselves,
      not ids referencing another resource. See `packages/region-settings/CLAUDE.md`'s Status section
      for the full detail.
- [ ] **Not yet switched over in `PythonTutorials/showcase` itself** — that app's own
      `RegionSettingsForm` still exists as a local copy; it hasn't been repointed to import
      `RegionSettingsFormComponent` from `@wiltech-labs/ngx-region-settings` instead. Do this (and
      delete the local copy) once that app is set up to consume this monorepo's packages — see the
      "Housekeeping" section's note on starting that as its own session.
- [x] Exercised in `apps/showcase` here 2026-10-01 — see the dated section below.

- [ ] No tests yet. Unlike `api-client` (a straight port of exercised `insurly-ui` code), forms
      has grown real logic that isn't already covered elsewhere: `toSchema()` validation rules,
      date/time parsing (`business-date`/`business-time`/`instant-date-time`), `ZonedDateTimeService`
      DST gap/overlap handling, `FormConfigBuilder`. Worth unit tests before publishing.
- [ ] Not yet published to npm (`version: 0.1.0`, still under development per its own `CLAUDE.md`).
- [ ] No consumers yet — `insurly-ui` is the intended first real consumer but doesn't depend on it
      yet (only on `ngx-api-client` so far).
- [ ] Two more Angular projects are planned to eventually consume these libraries — not started.

## `ngx-forms` gains a `CHIPS` field type — 2026-09-30

- [x] Added `ChipsField` (`ngx-chips-field`): a Material `mat-chip-grid` for a freeform list of
      tokens (`FieldTree<string[]>`) — type a word, press Enter/comma to add it as a chip, click the
      `x` to remove one. Same public contract as every other field, `[fieldDef]` + `[field]`, so it
      works inside `DynamicForm` or standalone.
- [x] Driven by hand (`state().value.update(...)`), same pattern as the date/time fields — `[formField]`
      targets one control's value, not a token added/removed one at a time, so there's no scalar
      Signals Forms binding for a chip grid the way there is for `matInput`/`mat-select`.
- [x] Needed `LiveAnnouncer` from `@angular/cdk/a11y` (screen-reader announcements on add/remove,
      same as Material's own chips example) — `@angular/cdk` wasn't a declared dependency of this
      package before (only pulled in transitively via `@angular/material`), added as a peer/dev
      dependency alongside it.
- [x] Wired into `FormFieldType.CHIPS`, `DynamicForm`'s `@switch`, `FormConfigBuilder.chips()`, and
      `public-api.ts`.
- [x] Exercised in `apps/showcase`'s "All Fields" forms demo (`keywords` field) to keep that demo's
      "every field type" claim true — pushed the showcase's initial bundle from 1.46MB to 1.54MB,
      over the previous 1.5MB `maximumError` budget (already past the 1.1MB warning threshold before
      this change); bumped `apps/showcase/angular.json`'s `maximumError` to 1.6MB rather than trim
      unrelated bundle weight to make room for one legitimate new Material module.
- [x] `tsc --noEmit`, `ng-packagr build` (catches template-binding errors `tsc` alone misses — same
      lesson as `RegionSettingsFormComponent` above), full-repo `npm run typecheck`, and the showcase
      app's production build all clean.
- [ ] Not covered by the "No tests yet" gap noted below — same boundary, no unit tests added.

## `RegionSettingsFormComponent` options rolled back to caller-supplied `FieldOption[]` — 2026-10-01

Found in real use: the component built `FieldDef.options` itself straight from
`RegionSettingsStore.options()`'s raw `{value, viewValue}` API metadata pairs, so every dropdown
label was whatever string the API returned — no way for an app to translate it. Asked directly:
translation needs to be per-app (not one shared translation, and explicitly not the browser's own
`Intl`/locale — same reasoning `ngx-forms`' date/time fields never default to the browser's locale,
see `NGX_FORMS_LOCALE`), since "I created the region-settings library so users can choose it," not so
the library or the browser would.

- [x] `options` input changed from `Partial<Record<string, ValueViewValue[]>>` to a new exported
      `RegionSettingsFieldOptions` (`Partial<Record<keyof RegionSettingsPayload, FieldOption[]>>` —
      `ngx-forms`' own `{label, value}` type). The component no longer touches `ValueViewValue` at
      all, or decides what an option's label says or which value it binds — purely renders what it's
      handed. This also fully resolves the earlier id-vs-value bug (2026-09-30) architecturally
      rather than by picking the right field: the app now decides the bound value explicitly.
  - This is also closer to the component's very first spec (`@Input() options: Record<string,
FieldOption[]>`, from the original request that started this whole extraction) than the version
    that shipped 2026-09-30 — the `ngx-forms` dependency question pulled the shape toward building
    `FieldDef` internally; this undoes that part while keeping the dependency itself (still needed
    for `SelectField`/`FormFieldType`/`FieldDef` types).
- [x] Field labels ("Timezone", "Language", ...) extended onto the existing
      `NGX_REGION_SETTINGS_FORM_TEXT` resolver token, alongside the pre-existing Save/Saving text —
      previously hardcoded English, now translatable the same way.
- [x] README's "Ready-made settings form" section rewritten with a `computed()` example mapping
      `RegionSettingsStore.options()` into `FieldOption[]` (translating each label), and now states
      explicitly that the component never calls the store itself — only emits `save`.
- [x] `tsc --noEmit`, `ng-packagr build`, and a full `scripts/build-packages.sh` run all clean.
- [ ] Still not switched over in `PythonTutorials/showcase` — only exercised in this repo's own
      `apps/showcase` so far (see the dated section below), not that external app.

## `apps/showcase` gains a `ngx-region-settings` demo route — 2026-10-01

First time this package has been exercised anywhere in this monorepo (it's never had a showcase demo
route, form included, since it was created). `demos/region-settings-demo`, routed at `/region-settings`,
tiled on the home page.

- [x] `settings`/`options` are hardcoded in the demo component (`INITIAL_SETTINGS`/`FIELD_OPTIONS`) —
      this showcase app has no backend, same "in-memory fake data, no backend" convention
      `notifications-demo` already established. Each option's label is deliberately distinct from its
      bound value (e.g. `{ label: 'British Pound (£)', value: 'GBP' }`) to demonstrate that
      `RegionSettingsFormComponent` renders whatever it's handed, translated or not — it was rolled
      back the same day specifically so this would be possible (see the section above).
- [x] `(save)` is wired to a fake 600ms `setTimeout` standing in for a real `RegionSettingsStore.save()`
      round trip; the demo renders the last-saved payload back as JSON once it resolves.
- [x] Needed `@wiltech-labs/ngx-auth` added to the showcase's `tsconfig.json` `paths` and
      `package.json` for the first time, even though the demo never imports anything from it directly
      — `ngx-region-settings`'s `public-api.ts` barrel re-exports `CurrentUserStore`, which imports
      `AuthStore`, so the whole module graph has to resolve for the showcase's TS path-mapped source
      import to type-check, regardless of what the demo itself actually uses.
- [x] `npm install` (to link the two new workspace deps), `tsc --noEmit` (both `apps/showcase` and the
      full-repo `npm run typecheck`), `ng build --configuration production`, and `ng serve` (checked
      the route serves and the component ships in the bundle) all clean. Didn't visually click-test in
      a real browser — no browser tool available in this session; the person following up should
      eyeball `/region-settings` themselves.

## `ngx-forms` gains a `THEME` field type, used by `ngx-region-settings` — 2026-10-01

Theme only ever has two values (`'light'`/`'dark'`), so a dropdown or radio list was the wrong shape
for it — asked for a dedicated field: two icons (sun/moon), click one the same way selecting a value
works everywhere else.

- [x] Added `ThemeField` (`ngx-theme-field`): `mat-button-toggle-group` with two icon-only toggles
      (`light_mode`/`dark_mode`), bound via `[formField]` directly — `MatButtonToggleGroup` is a
      `ControlValueAccessor`, same as `MatRadioGroup`/`MatSelect`, confirmed by `RadioField` already
      doing exactly this on `mat-radio-group`, so no hand-written value sync was needed (unlike
      `ChipsField`/the date fields).
- [x] Each toggle's accessible label (not visible text — the UI is icon-only) comes from
      `fieldDef.options`, same `FieldOption[]` mechanism `RadioField`/`SelectField` already use —
      see the "settled design" bullet below for how this landed here after two more elaborate
      attempts the same day.
- [x] Wired into `FormFieldType.THEME`, `DynamicForm`'s `@switch`, `FormConfigBuilder.theme()`, and
      `public-api.ts`; exercised in `apps/showcase`'s "All Fields" forms demo (`colorScheme` field).
- [x] **Then added to `ngx-region-settings`**, as asked: `RegionSettingsFormComponent`'s `theme`
      field switched from `SelectField` to `ThemeField`.
- [x] `tsc --noEmit`, `ng-packagr build` for both packages, a full `scripts/build-packages.sh` run,
      full-repo `npm run typecheck`, and the showcase app's `ng build --configuration production` +
      `ng serve` (confirmed the toggle group ships in the bundle and the route serves) all clean.
- [x] **Layout bug found right after, 2026-10-01**: `.ThemeField-group` had no `width: 100%`, so the
      toggle pair shrink-wrapped to just the two icons instead of filling its row the way its sibling
      `SelectField`s do — looked like the icons took ~20% of the row with the rest left empty. Fixed
      by giving the group `width: 100%` and each `mat-button-toggle` `flex: 1` (reachable with a
      plain, non-`::ng-deep` selector since `mat-button-toggle` is a direct element in this
      component's own template, not projected content). Confirmed in the compiled production bundle.
- [x] **Asked directly why this was a DI token instead of a component `@Input()`, then why not a
      config interface instead of a token** — both answered, and the second one changed the design:
      a plain `@Input()` would've broken once rendered through `DynamicForm`'s generic `@switch`
      (every field's contract is strictly `[fieldDef]`/`[field]`, nothing else — `DynamicForm` can't
      know `ThemeField` needs a third binding). The config-interface suggestion was the better fit
      though: `FieldDef` already has exactly this shape for `dateTimeConfig`/`NGX_FORMS_LOCALE`, so
      added `FieldDef.themeConfig?: Partial<ThemeFieldText>` the same way — a per-field override that
      wins over `NGX_THEME_FIELD_TEXT`'s app-wide default, merged in `ThemeField` itself. Kept the
      token too rather than replacing it, since the "set once in `app.config.ts`, every field picks
      it up" case is still real and the two aren't mutually exclusive — matches the existing
      `dateTimeConfig.locale`/`NGX_FORMS_LOCALE` hybrid exactly. Verified the override compiles
      through into the production bundle (`apps/showcase`'s "All Fields" demo now passes
      `themeConfig: { light: 'Day', dark: 'Night' }`).
- [x] **Settled design, same day**: asked directly "could [`options`] not be reused" — pointed at
      `FieldDef.options: FieldOption[]`, the exact mechanism `RadioField`/`SelectField` already have.
      It could, and is simpler than the token/`themeConfig` pair above: removed
      `NGX_THEME_FIELD_TEXT`/`ThemeFieldText`/`theme-field-text.token.ts` and `FieldDef.themeConfig`
      entirely. `ThemeField` now reads `fieldDef.options`, matching each option's `value` against the
      fixed `'light'`/`'dark'` strings to find that icon's label (defaulting to English when absent)
      — the values themselves stay fixed (each tied to its own hardcoded icon), only the label text
      comes from `options`. `FormConfigBuilder.theme()` gained a `choices?: FieldOption[]` third
      param, mirroring `radio()`/`select()`'s required `choices` (optional here, since there's a
      sensible English default). This is also more consistent with the rest of the package, not
      just simpler: no other choice-list field here has an "app-wide options translation" token —
      `RadioField`/`SelectField` both just repeat their own `choices` at each call site — so the
      token/config detour had actually been the odd one out.
  - **Full circle in `ngx-region-settings`**: `RegionSettingsFieldOptions` keeps its `theme` key
    again (reusing the same input every other field already uses, just for label text instead of
    label+value) — this is exactly `RegionSettingsFormComponent`'s very first spec from before any
    of this day's detours (`@Input() options: Record<string, FieldOption[]>`, covering every field
    uniformly, theme included). `themeField` goes back through the shared `fieldDef()` helper instead
    of being built separately, just passing `FormFieldType.THEME` instead of the default `SELECT`.
    Updated both showcase demos (`forms-demo`'s `colorScheme`, `region-settings-demo`) to pass
    `choices`/`options.theme` the same way as every other field instead of the removed `themeConfig`.
  - `tsc --noEmit`, `ng-packagr build` for both packages, a full `scripts/build-packages.sh` run,
    full-repo `npm run typecheck`, and the showcase app's `ng build --configuration production` all
    clean; confirmed the new labels (`'Day'`/`'Night'`) compile through into the production bundle
    for both demos.

## New package `ngx-components`, plus `ngx-region-settings` gains `hints` — 2026-10-01

Wanted to explain what changing `locale` actually affects (date format) before the user picks one.
Discussed two approaches before building anything:

- [x] **`FieldDef.hint` already does this, no new code** — pointed out mid-discussion. `ngx-forms`
      fields already render `fieldDef.hint` as always-visible text under the field; the only gap was
      `RegionSettingsFormComponent` itself not exposing a way to set one. Added a `hints` input
      (`RegionSettingsFieldHints`, `Partial<Record<keyof RegionSettingsPayload, string>>`, defaults
      `{}`), merged into `fieldDef()` alongside `options` and `label`. Exercised in
      `apps/showcase`'s region-settings demo: `locale: 'Changes how dates are typed and shown — e.g.
US: MM/DD/YYYY, UK: DD/MM/YYYY.'`.
- [x] **New package `@wiltech-labs/ngx-components`**, built anyway — not for this specific case
      (hint covered it), but because more reusable UI components (panels, cards) are planned for it
      regardless. First component: `Banner` — takes a flat `Message[]` (`{type: 'info' | 'warning' |
'error', text}`) and renders one block per message with an icon for its type. Asked directly
      which shape to build (one component rendering the whole list vs. one component per message
      with the app `@for`-ing over its own array) — picked the whole-list shape, matching how
      `ngx-notifications` owns its own list internally.
  - No Angular Material dependency, deliberately — same reasoning as `ngx-ai-tools`: plain inline
    SVG icons (`currentColor` fill) and CSS-variable colours with hex fallbacks
    (`--ngx-components-banner-<type>-background`, falling back to a matching `--mat-sys-*` role
    where Material actually has one — `info`/`error` do, `warning` doesn't, so that one skips
    straight to a hex default).
  - `role="status"` for info, `role="alert"` for warning/error; icons `aria-hidden`.
  - New package, no inter-package dependencies (`@angular/core`/`@angular/common` peers only) — no
    `file:../x/dist` mechanism needed, picked up automatically by `scripts/build-packages.sh`'s
    "everything else" loop without any script changes.
  - Wired into `apps/showcase` (`demos/components-demo`, route `/components`, home tile) — same
    "hardcoded demo data, no backend" convention as every other showcase demo; shows all three
    message types including the same locale-explanation text as a tie-in example, even though the
    actual region-settings demo uses `hints` for that, not `Banner`.
  - `docs/ANGULAR_APP_CONVENTIONS.md`'s "Shared libraries" table and root `CLAUDE.md`'s repo layout
    both updated with the new package.
- [x] `tsc --noEmit`, `ng-packagr build` for both packages, a full `scripts/build-packages.sh` run,
      full-repo `npm run typecheck`, the showcase app's `ng build --configuration production`, and a
      dev-server smoke test (both `/region-settings` and `/components` serve, both ship in the
      bundle) all clean.
- [x] `ngx-components` gained `Panel` and `Card` the same day — see the next section.

## `ngx-components` gains `Panel` and `Card` — 2026-10-01

Asked for directly, same day as `Banner`: "an expandable mat component" for `Panel`, then "the same
but with a card" for `Card`, both with the same header rules.

- [x] Both share one header layout: `header` (required, the only mandatory input) with an optional
      `icon` on the same line, an optional `subheader` on its own line below both — always visible,
      regardless of expanded state for `Panel`. Neither uses Material's own default title/description
      layout as-is (`mat-expansion-panel-header` puts title+description side by side;
      `mat-card-header`'s avatar sits beside a stacked title/subtitle column) — both build the
      icon+title row / subheader-below structure themselves inside `mat-panel-title`/`mat-card-title`
      instead.
- [x] `Panel` wraps `mat-expansion-panel` — real Angular Material, unlike `Banner`, since this is
      genuinely interactive (the accordion mechanics — animation, keyboard a11y, ripple — are exactly
      what `mat-expansion-panel` already does correctly, not worth rebuilding). Content is projected
      via plain `<ng-content>`, not `<ng-template>`: still gets `mat-expansion-panel`'s
      lazy-render-until-expanded behaviour for free, since content projection re-parents whatever the
      caller passes to wherever `<ng-content>` sits in `Panel`'s template, and `MatExpansionPanel`'s
      own content query sees it as a direct content child either way — no need for the caller to use
      Material's own `<ng-template matExpansionPanelContent>` explicitly.
- [x] `Card` wraps `mat-card` (`appearance="outlined"`) the same way, minus the expand/collapse — a
      card isn't an accordion, its content is always visible.
- [x] This is this package's first real Angular Material dependency — added `@angular/cdk` and
      `@angular/material` as peer/dev deps. Updated `CLAUDE.md`'s "no Material dependency" bullet,
      which had been written as a package-wide rule from `Banner` alone: it's actually a
      per-component decision (`Banner` has none, deliberately; `Panel`/`Card` do, deliberately).
- [x] Both full width (`:host { display: block; width: 100%; }` + `width: 100%` on the Material
      element), matching `ngx-forms` fields' "fills its container" contract.
- [x] Exercised in `apps/showcase`'s components demo: two `Panel`s (one with icon+subheader, one
      with neither to show only `header` is required) and one `Card`.
- [x] Pushed the showcase's production bundle from 1.58MB to 1.61MB, over the 1.6MB budget set
      earlier today — bumped `maximumError` to 1.8MB rather than trim unrelated weight, same call as
      the two times before.
- [x] `tsc --noEmit`, `ng-packagr build`, full-repo `npm run typecheck`, `scripts/build-packages.sh`,
      the showcase's `ng build --configuration production`, and a dev-server smoke test (route
      serves, both components ship in the bundle) all clean.

## `Panel`/`Banner` polish, after trying the showcase demo — 2026-10-01

Three fixes from actually looking at the components demo:

- [x] **`Panel` instances sat flush against each other** — neither the component nor
      `mat-expansion-panel` itself adds spacing between siblings, so two stacked `ngx-panel`
      elements had zero gap. Fixed with a 10px `margin-bottom` on `Panel`'s host — hardcodes
      `ngx-styles`' `spacing.$padding-mobile` (10px, confirmed by checking that package's
      `_spacing.scss`) rather than `@use`-ing it, same reasoning `ngx-region-settings` already
      documents for why its own SCSS can't resolve `ngx-styles`' Sass partials from `ng-packagr`'s
      build step. Deliberately `Panel`-only, not `Card` — only `Panel` was asked for; added a second
      `Card` example to the showcase demo too (for symmetry with `Panel`'s two), so gave that
      section its own app-level spacing in the demo's own stylesheet instead, same as any app would
      need to for a component with no built-in gap.
- [x] **`Banner`'s `info` colour and icon** — was `--mat-sys-tertiary-container` (purple-ish in this
      house theme, not blue) with a plain info-circle icon. Changed to a fixed light blue (`#e3f2fd`
      background / `#0d47a1` text, no `--mat-sys-*` middle tier — same reasoning as `warning`: the
      point is a specific recognizable colour, not whatever the theme's tertiary role happens to be)
      and a lightbulb glyph instead of the circle-i, asked for as "a friendlier icon."
- [x] Confirmed directly: yes, `Card` already wraps real `mat-card` (`MatCardModule`) — it always
      did, since it was built the same way as `Panel` from the start.
- [x] `tsc --noEmit`, `ng-packagr build`, full-repo `npm run typecheck`, `scripts/build-packages.sh`,
      and the showcase's `ng build --configuration production` all clean; confirmed the compiled
      output has the new `margin-bottom:10px` and `#e3f2fd`/`#0d47a1` colours.

## New packages `ngx-calendar` and `ngx-organization` — planned and built 2026-10-01

Both built the same day, designed to Material 3 with the `impeccable` skill's playbooks and
`docs/ANGULAR_APP_CONVENTIONS.md` as the brief. Each has its own README/CLAUDE.md. The scope agreed
before building is kept below for reference, after what was built and what is still open.

**Built:**

- [x] `ngx-modals` 1.1.0: `ModalConfig.side: 'left' | 'right'` (default right). Not yet published.
- [x] `ngx-calendar` 0.1.0 wraps **FullCalendar 7** (`@fullcalendar/angular`). Chosen over building
      our own because it is Temporal-based (matches our date rules), MIT, on Angular 22, and has a
      Material 3 theme ("monarch") whose variables map 1:1 to `--mat-sys-*`. Our own parts: the
      toolbar, day panel (side ≥ 840px, below otherwise), event panel (`ngx-modals`) with an
      `ngx-forms` edit form, `CalendarEventMapper`, locale and text tokens.
- [x] `ngx-organization` 0.1.0 wraps **`ngx-interactive-org-chart` 1.5** (Angular 22, signals, MIT,
      pan/zoom, mini map, collapse; not PrimeNG). Our own parts: per-type M3 cards (department
      merged with its reporting job), zoom controls, left-hand node panel, flat-to-tree builder,
      `OrgChartStore`, text token. Proposed API shape: `_data.orgNodes: OrgItem[]`, flat, with
      `parentId`; occupancies are items of type `OCCUPANCY` under their job.
- [x] Showcase routes `/calendar` and `/organization` (lazy-loaded). Checked in a browser at 1280
      and 390px, light and dark: no console errors. Edit → Save emits `eventSave` and updates the
      grid. Closing with unsaved edits shows the prompt. `editable: false` hides Edit. The org panel
      opens on the left.
- [x] `modals` added to `scripts/build-packages.sh`' foundation list. All packages, workspace
      typecheck and the showcase production build pass (only the two pre-existing budget warnings).

- [x] Polish pass (impeccable `polish`), same day. Calendar: "+N more" opens the day panel instead of
      FullCalendar's unstyled popover; the day panel follows the visible range (it went stale in
      Day view); it sits beside the grid only from 1200px (the 840–1199px split squeezed chips
      unreadable); short events keep time and title on one line; Day view opens at 07:30 so the 8am
      label isn't clipped. Org chart: the node panel is modeless and minimizable (asked for: the
      chart was blocked while it was open, and it could only be opened or closed), reused across
      clicks; the selected card is outlined and slid clear of the panel; hover connectors use the
      outline colour instead of heavy full-width primary lines; phones open at a readable zoom,
      one level expanded, no mini map.
- [x] `ngx-modals` 1.2.0: `backdrop: false` (modeless), `minimizable: true`, `ModalService.update()`.
      The shell now sizes and places itself (it owns the XSmall switch, so a resize can't undo a
      minimize). Not yet published.

**Still open:**

- [ ] A modeless panel still traps Tab inside it (MatDialog's focus trap); mouse and touch users
      can use the chart freely, keyboard users have to close or minimize the panel first.
- [ ] Agree the org chart response shape with the API (`OrgItem`, `_data.orgNodes`) before the first
      real consumer.
- [ ] Org chart CRUD from each item's `links` (version 1 is read-only).
- [ ] Calendar: no create-event flow, no drag-to-move/resize (FullCalendar's `interaction` plugin is
      already loaded for clicks). The end-before-start error path in the edit form was not exercised
      in the browser.
- [ ] Calendar on narrow screens: month view draws events as colour bars (FullCalendar's narrow
      mode has no room for text); times are in the day list below. Revisit if time-in-chip is a
      must there.
- [ ] Publish `ngx-modals` 1.2.0 before publishing either new package (both depend on it).
- [ ] No tests yet, for either package.

**Scope as agreed before building:**

- [x] **Calendar: new package `@wiltech-labs/ngx-calendar`.**
  - **Build or wrap**: wrapped FullCalendar 7 (see "Built" above).
  - **Views**: day, week and month.
  - **Events**: mandatory properties are `id`, `title`, `description`, `startDateTime` and
    `endDateTime`. Both date-times are UTC strings, `YYYY-MM-DDTHH:MMZ`. Each event also takes a
    config object that sets its styles (colours and so on). Style values should still follow the
    conventions doc's token pattern, `var(--ngx-calendar-*, var(--mat-sys-*, #hex))`, with the
    event config overriding them.
  - **Timezones**: events arrive in UTC and are shown in the user's timezone, converted the same way
    `ngx-forms`' date-time field does it (`ZonedDateTimeService`). Follow
    `docs/ANGULAR_APP_CONVENTIONS.md`'s "Dates and times" (`Temporal`, string wire formats).
  - **Big screens**: a day/event shows the event title and times. Clicking a day opens a side
    section that clearly names that day and lists all its events.
  - **Small screens**: a day/event shows only the times. A section below the calendar lists all the
    events for the selected day. This works the same way in every view (day, week and month).
  - **Event detail**: clicking an event opens the whole event, including its description, in a
    modal. The modal follows `ngx-modals`' layout: a right-hand panel, full height, 33% of the
    screen wide (`var(--ngx-modal-width, 33vw)`), full screen below the CDK `XSmall` breakpoint.
  - **Editing**: the event modal lets the user edit the event. For now, saving only emits an output
    with the updated event. The calendar doesn't save anything itself; the consuming app does.
  - **Decided 2026-10-01: depend on `ngx-modals`, don't copy it.** The event-edit panel needs
    what `ngx-modals` already does: the unsaved-changes guard (`ModalContent.hasUnsavedChanges()`
    plus the confirm prompt), the typed close result, and the 33vw / full-screen switch on the CDK
    `XSmall` breakpoint. A copy would drift from the original. `ngx-modals` has no sibling `ngx-*`
    dependency, so it was added to root `CLAUDE.md`'s sanctioned foundation leaves. The edit form
    is built on `ngx-forms`, which was already sanctioned. When building:
    - In `packages/calendar/package.json` `dependencies`, use `"file:../modals/dist"` and
      `"file:../forms/dist"`, not semver ranges.
    - Add `"postbuild": "node ../../scripts/fix-dist-file-deps.js ."` to the same file.
    - Add `packages/modals` to the `foundation` array in `scripts/build-packages.sh`, so it builds
      before the calendar.
  - Locale (week start, day and month names) should come from a token the app supplies, the way
    `ngx-dates` uses `NGX_DATES_LOCALE`, not from a direct dependency on `ngx-dates` or
    `ngx-translations`.
  - Add a showcase demo route at `/calendar` with sample events spread across day, week and month.
- [x] **Organization: new package `@wiltech-labs/ngx-organization`.** An org chart. It loads and
      gates its data the same way `ngx-region-settings` does, but it is its own package and more
      complex. Scope confirmed with the user 2026-10-01.
  - **The API owns the business logic.** The structure rules below are for understanding the data
    and laying out the chart. The library doesn't enforce them: the API decides what is valid, and
    each node carries `links` for whatever CRUD actions are allowed on it (`ngx-api-client`'s
    HATEOAS envelope: `_data`, `_metadata`, `_metaLinks`, `_messages`). The library renders actions
    from whichever links are present and never works out permissions itself.
  - **Version 1 is read-only.** Show the chart and the node panel. CRUD through the node links comes
    later.
  - **Canvas**: the chart sits on a canvas the user can drag to pan, and zoom, because an org chart
    is always bigger than the screen. Use an open-source library if a suitable one exists, but
    **not PrimeNG**. Otherwise build it ourselves (CSS transforms for pan and zoom, SVG connector
    lines, our own tree layout).
  - **API response**: not designed yet. It will be a response of nodes, each with a `type`: `ORG`,
    `ORG_ENTITY`, `DEPARTMENT` or `JOB`. `OCCUPANCY` is also a type in the response, but it is not
    a node on the chart (see Jobs below). Agree the exact shape with the API before building.
  - **Structure rules** (enforced by the API):
    - Exactly one `ORG`, at the very top.
    - Under the org: departments or org entities, mixed.
    - Under a department: other departments, jobs or an org entity, mixed.
    - Under an org entity: departments, or an org entity. Never a job.
    - At most one org entity on any reporting line from the top. An org entity can sit under the
      org or under a department, as long as no org entity is above it.
    - A job is always under a department, never directly under the org or an org entity.
  - **Jobs**:
    - A job is either vacant or has an occupancy.
    - An occupancy is a person occupying a job. People are not nodes; they appear only through the
      job they occupy.
    - A person can hold several jobs. A job holds at most one person.
  - **Departments**: every department has exactly one reporting job (its head, e.g. the CEO job of
    the Board department). On the chart, the reporting job is drawn on top of its department and
    merged with it into one card, so it is clear who manages it. A vacant head shows as vacant.
    Every other job in the department reports straight to the reporting job, one level only.
  - **Example reporting line**: Org → OrgEntity → Board department, merged with its reporting job
    (CEO, held by a named person) → Job A. Further departments can then hang under the Board
    department.
  - **Node panel**: clicking any node opens a panel showing that node. It slides in from the
    **left** (full height, 33% wide, full screen on small screens). `ngx-modals` only opens on the
    right today, so give it a `side: 'left' | 'right'` option (default `'right'`) rather than
    copying it into this package.
  - **Dependencies**: `ngx-api-client`, `ngx-auth` (store gated on `AuthStore.isSignedIn()`, as in
    `ngx-region-settings`) and `ngx-modals`. All three are sanctioned. Add `ngx-forms` when editing
    arrives. Same `"file:../x/dist"` + `postbuild` `fix-dist-file-deps` setup as the calendar.
  - Add a showcase demo route at `/organization`, with sample data deep and wide enough to need
    dragging. Include vacant jobs, a person holding two jobs, and an org entity under a department.

## packages/api-client

- [ ] Already published and consumed by `insurly-ui`. No known outstanding work beyond routine
      version bumps as needed.

## packages/translations

See "New package `ngx-translations` — built 2026-09-30" above for what's built and what's still open.

## packages/dates

See "New package `ngx-dates` — built 2026-09-30" above for what's built and what's still open.

## packages/auth

See "New package `ngx-auth` — built 2026-09-30" above for what's built and what's still open.

## packages/region-settings

See "New package `ngx-region-settings` — built 2026-09-30" and "`ngx-region-settings` gains
`RegionSettingsFormComponent` — 2026-09-30" above for what's built and what's still open.

## packages/modals

See "New package `ngx-modals` — built 2026-09-30" and "Showcase M3 theme + modals/notifications
browser pass — 2026-09-30" above for what's built and what's still open.

## packages/notifications

See "New package `ngx-notifications` — built 2026-09-30" and "Showcase M3 theme + modals/
notifications browser pass — 2026-09-30" above for what's built and what's still open.

## packages/styles

See "New package `ngx-styles` — built 2026-09-30" above for what's built and what's still open —
in particular, no consumer yet and no showcase demo route.

## packages/components

See "New package `ngx-components`, plus `ngx-region-settings` gains `hints` — 2026-10-01" above for
what's built and what's still open — in particular, only `Banner` exists so far; panels and cards are
planned but not started.

## packages/calendar

See "New packages `ngx-calendar` and `ngx-organization`" above.

## packages/organization

See "New packages `ngx-calendar` and `ngx-organization`" above.

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
      background), `AiPanel` and `AiTextBox` (animated _rotating_ `conic-gradient` border, via
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
      Deliberately did _not_ copy the other repo's per-component hardcoded demo data or its
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
