# @wiltech-labs/ngx-region-settings

Shared Angular current-user and region-settings stores: `/me` → its `userProfile` link →
`userSettings`/`systemSettings` links off the profile — the same flow every consuming app repeats,
generalized into ready-to-use signal stores. See root `../../CLAUDE.md` for repo-wide conventions.

Decided 2026-09-30: this exact flow (sign in → `/me` → follow `userProfile` → follow
`userSettings`/`systemSettings`) was already built and exercised in an existing consuming app before
this package existed — genuinely copy-pasted each time, not a from-scratch design. See root
`NEXT_STEPS.md` for the fuller decision history, including why this package (unlike every other one
here) takes a real dependency on two siblings instead of an app-pluggable resolver token.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── models/             # Identifiable (shared generic constraint), Me/UserProfile,
    │                       # RegionSettings/RegionSettingsPayload — all default types, overridable
    │                       # via generics
    ├── stores/
    │   ├── current-user.store.ts    # CurrentUserStore<TMe, TProfile> (providedIn: 'root')
    │   └── region-settings.store.ts # RegionSettingsStore<TSettings, TPayload> (abstract) +
    │                                 # UserSettingsStore / SystemSettingsStore
    └── components/
        └── settings-form.component.ts # RegionSettingsFormComponent — ready-made form UI
```

## Conventions

- **Real npm dependency on `@wiltech-labs/ngx-api-client`, `@wiltech-labs/ngx-auth`, and
  `@wiltech-labs/ngx-forms`** — the sanctioned exception to root `CLAUDE.md`'s default "no
  inter-package deps," extended 2026-09-30 to include `ngx-forms` alongside the original two.
  `CurrentUserStore` gates its `/me` fetch on `AuthStore.isSignedIn()`; `RegionSettingsFormComponent`
  (see below) is built on `ngx-forms`' `SelectField`. All three are kept strict foundation leaves
  (never depend on anything built on top of them), which is what makes this safe from cycles.
- **`RegionSettingsFormComponent` — a ready-made form for editing region settings, added
  2026-09-30.** Extracted from a form that had been independently duplicated per consuming app (the
  exact thing this library exists to prevent) — takes `settings`/`options` inputs and emits `save`,
  rendering the five region fields (`timezone`/`language`/`locale`/`currency`/`theme`) as `ngx-forms`
  `SelectField`s. Dirty-checking (`changed`) compares the edited model against the last-saved
  settings via `linkedSignal`, same "re-seed on reload, stay editable in between" pattern the
  original app-level form used. The component never calls the store itself — it only emits `save`
  with the edited payload, so saving (and anything that follows it, e.g. reloading) stays the app's
  call, not this component's.
  - **`options: RegionSettingsFieldOptions` — `ngx-forms`' own `FieldOption[]` per field, not the
    store's raw `ValueViewValue[]`, rolled back to this 2026-10-01.** An earlier version had this
    component build `FieldDef.options` itself straight from `RegionSettingsStore.options()`
    (`{value, viewValue}` pairs from the API's own metadata), picking which of the two fields to bind
    and show — which quietly meant every label was whatever raw string the API returned, with no way
    for an app to translate it. Asked directly: each consuming app needs its _own_ translation for
    these values (not a single shared one, and explicitly not the browser's own locale/`Intl` — same
    reasoning `ngx-forms`' date/time fields don't default to the browser's locale either, see
    `NGX_FORMS_LOCALE` in that package's `CLAUDE.md`: the app controls presentation explicitly, this
    library never reaches for anything ambient on its own). Rolled back so the component takes
    ready-made `FieldOption[]` and makes no decision about label text or bound value at all — the app
    maps `RegionSettingsStore.options()`'s raw pairs into `FieldOption[]` itself, translating however
    it wants, as part of that mapping. This is also what the very first request for this component
    asked for before the dependency question (`ngx-forms`) pulled the shape toward building `FieldDef`
    internally — see root `NEXT_STEPS.md`'s dated section for the full back-and-forth.
  - **Field labels** ("Timezone", "Language", ...) come from `NGX_REGION_SETTINGS_FORM_TEXT`
    (alongside the pre-existing Save/Saving button text), the same resolver-function pattern as
    `ngx-notifications`' `NGX_NOTIFICATIONS_TEXT` — deliberately not a direct `@jsverse/transloco`
    dependency, consistent with this package's existing "no dependency on `ngx-translations`"
    decision below.
  - Its own SCSS hardcodes the two spacing values and one breakpoint it needs (16px/12px/8px, 600px)
    instead of depending on `@wiltech-labs/ngx-styles`: `ngx-styles` has no consumer yet in this
    monorepo (app or package), so there's no confirmed way to resolve its Sass partials from
    `ng-packagr`'s own build step (as opposed to an app's `stylePreprocessorOptions.includePaths`,
    which only exists at the consuming _app_'s build time) — not worth the risk for two pixel values
    and one breakpoint.
- **How the dependency actually resolves, in this monorepo specifically**: `package.json` points at
  `"@wiltech-labs/ngx-api-client": "file:../api-client/dist"`,
  `"@wiltech-labs/ngx-auth": "file:../auth/dist"`, and `"@wiltech-labs/ngx-forms": "file:../forms/dist"`
  — an explicit `file:` reference to the sibling's
  _built_ `dist/` output, not a bare semver range. A bare range (`"^1.0.0"`, `"*"`, ...) resolves to
  npm workspaces' own auto-link-by-name behaviour instead, which points at the sibling's _source_
  folder — whose `package.json` has no `main`/`types` (only the `dist/` one `ng-packagr` writes
  does), the exact `ng-packagr` `TS2307: Cannot find module` failure hit and documented while
  building `ngx-dates` against `ngx-translations`. An explicit `file:../x/dist` path sidesteps that:
  npm nests a local `node_modules/@wiltech-labs/ngx-x` inside this package pointing at the literal
  path given, rather than the root-hoisted workspace symlink every other package gets. Confirmed
  working end to end (`npm install`, `tsc --noEmit`, `ng-packagr build`) 2026-09-30. A root-level npm
  `overrides` entry was tried first, to keep this package's own `dependencies` as plain semver ranges
  (so the published output would need no manual fixup) — npm refused it outright
  (`EOVERRIDE ... conflicts with direct dependency`), because `ngx-api-client`/`ngx-auth` are already
  workspace members, which npm treats as a direct dependency of the workspace root itself. The
  `file:` reference in this package's own `dependencies` was the only mechanism that actually worked.
- **This means `dist/package.json` needs its `file:` deps rewritten before publishing** — `ng-packagr`
  copies `dependencies` verbatim, `file:` paths included, so a published tarball would otherwise ship
  a dependency on a path that doesn't exist outside this monorepo. This package's own `"postbuild":
"node ../../scripts/fix-dist-file-deps.js ."` script runs the rewrite automatically right after
  `ng-packagr` finishes, as part of plain `npm run build` — **not a separate step**. It started as a
  README-documented manual hand-edit, then (once a real user hit it) a script you had to remember to
  run yourself (`npm run fix-dist-file-deps`) — both failed the same way: `1.0.1`, `1.0.2`, and `1.0.3`
  were all published with the raw, unusable `file:` paths still in `dependencies`, because nothing
  forced the fix to actually run before `npm publish`. `postbuild` is an npm lifecycle hook (fires
  automatically after the `build` script, including under `npm run build --workspace=...` from
  `scripts/build-packages.sh`), so there's no longer a step to forget. The standalone script still
  exists for fixing up an already-built `dist/` on demand — see this package's README's "Publishing"
  section — but the reliable path is just `npm run build`.
- **Build-order requirement this creates**: `ngx-api-client`, `ngx-auth`, and `ngx-forms` must be
  built (their `dist/` must exist) _before_ this package builds — `file:../api-client/dist` is a
  dangling reference otherwise. `npm install` itself never fails on this (it happily symlinks to a
  not-yet-existing path, and the symlink self-heals once that path's target appears — no re-install
  needed), so this only ever surfaces as a _build_ failure, not an install one, and it's easy to
  mistake for "needs another `npm install`." `dist/` is gitignored, so this bites on every fresh
  clone. Root `package.json`'s `build:packages` script used to get this right only by accident
  (alphabetical directory order happened to put `api-client`/`auth` before `region-settings`) — hit
  for real 2026-09-30 on a fresh clone elsewhere; exact trigger command not confirmed, but the
  failure mode was reproduced directly (wipe every package's gitignored `dist/`, fresh `npm install`,
  then build `region-settings` alone — fails with cascading `TS2571`/module-not-found errors from the
  still-empty `ngx-api-client`/`ngx-auth` symlink targets). Fixed by
  `scripts/build-packages.sh`, which builds `api-client`/`auth` explicitly first, then everything
  else — see root `NEXT_STEPS.md` Housekeeping and root `README.md`. Building this package on its own
  (`cd packages/region-settings && npm run build`) after a fresh clone still requires manually
  building `../api-client` and `../auth` first — the script only orders the repo-wide build, not a
  single-package one.
- Both dependencies are regular `dependencies` (not peer) — same precedent as
  `ngx-translations`/`@jsverse/transloco` and `ngx-auth`/`@clerk/clerk-js`: this package controls the
  exact version it's built against. Listed in `ng-package.json`'s `allowedNonPeerDependencies`.
- **Everything else stays generic, deliberately not fixed to one payload shape.** `CurrentUserStore<TMe,
TProfile>` and `RegionSettingsStore<TSettings, TPayload>` are both parameterized, defaulting to
  concrete types (`Me`/`UserProfile`/`RegionSettings`/`RegionSettingsPayload`) that mirror an already
  fully-exercised, real API's actual response shape — not an invented "reasonable-looking" shape.
  The reasoning: an individual app's API payload shape is fixed (owned by that app's backend, not
  negotiable from this package), so the type parameters exist for the rare app whose shape genuinely
  differs, while the defaults mean the common case (an app matching the shape every consuming app is
  expected to converge on) needs zero type arguments — `inject(CurrentUserStore)` just works.
- **No dependency on `ngx-translations`, deliberately.** `RegionSettingsStore.options` returns raw
  `{value, viewValue}` pairs straight from the API's `_metadata` (via `MetadataService`, from
  `ngx-api-client`) with no label-translation step — the reference this was generalized from mapped
  labelled fields through an app's own i18n service, but that's exactly the kind of app-specific
  wiring this package stays out of. An app wanting translated option labels does that mapping itself
  at the call site, the same "app owns presentation" boundary `ngx-notifications`'s design (see
  `NEXT_STEPS.md`) draws for its own callbacks.
- **No `isAdmin`-style helper**, even though the reference this was generalized from has one
  (`roleIds.includes('ADMIN')`). Whether `'ADMIN'` is even the right role name is an app policy
  decision, not an identity-mechanics one — `me()?.roleIds` is exposed raw; an app tests it itself.
- **Errors are exposed raw** (`Signal<unknown>` on both stores, merged via `computed()`), not
  humanized — the reference this was generalized from ran errors through an app-specific i18n
  error-describer. Same boundary as the two points above: this package fetches and exposes state, it
  doesn't own presentation.
- `RegionSettingsStore` is feature-local (not `providedIn: 'root'`) — each page (`UserSettingsStore`,
  `SystemSettingsStore`) provides its own instance, same as the reference. `CurrentUserStore` is
  root-provided — it's app-wide state every route may need, not just settings screens.
- The one hand-built URL in the whole package: `CurrentUserStore`'s `/me` fetch, built from
  `API_ORIGIN` (from `ngx-api-client`) + the literal path `/api/me`. Every other request follows a
  HATEOAS link the API itself handed out — never a URL this package or an app constructs.

## Status

- New package: `CurrentUserStore`, `RegionSettingsStore` (abstract), `UserSettingsStore`,
  `SystemSettingsStore`, `RegionSettingsFormComponent`, `NGX_REGION_SETTINGS_FORM_TEXT`, plus the
  `Identifiable`/`Me`/`UserProfile`/`RegionSettings`/`RegionSettingsPayload` types.
- `RegionSettingsFormComponent` extracted 2026-09-30 from a form independently built and duplicated
  in an external consuming app (`PythonTutorials/showcase`'s `RegionSettingsForm`) — typechecked and
  built clean against the library's own `tsconfig`/`ng-package.json`. Two bugs surfaced once tried
  against that external app's real API and screen, both fixed 2026-09-30:
  - **No gap between fields.** Its SCSS set `column-gap` only, not `gap`/`row-gap` — invisible at the
    two-column breakpoint (≥600px, where fields sit side by side) but every field touches its
    neighbour's border in the default single-column layout, since a single column has no _columns_
    to put a column-gap between. Fixed by using `gap` instead.
  - **Select options bound to the metadata id, not its value.** Each option's `[value]` was
    `ValueViewValue.value` (the metadata row's internal id, from `MetadataService.resolveMetadataIdValues`
    — see `ngx-api-client`'s `CLAUDE.md`), not `.viewValue` (the domain string, e.g. `'EUR'`). Wrong
    for this specific form: `RegionSettingsPayload`'s fields are the domain strings themselves
    (`timezone`/`language`/`locale`/`currency`/`theme: string`), not ids referencing another
    resource — unlike the more typical case elsewhere in this API-client convention where a select
    submits a foreign-key id. Fixed by using `viewValue` for both the option's label and its bound
    value.
  - That external app hasn't yet been switched over to import this component from here instead of
    its own local copy — see the open item below.
- **Exercised in this monorepo's own `apps/showcase` for the first time, 2026-10-01**
  (`demos/region-settings-demo`) — hardcoded `settings`/`options` (no backend in this showcase app,
  same "in-memory fake data" convention as `notifications-demo`), with each option's label distinct
  from its bound value to demonstrate that the component renders whatever it's given, translated or
  not. Required adding `@wiltech-labs/ngx-auth` to the showcase's own `tsconfig.json` `paths` /
  `package.json` for the first time too — not used by the demo directly, but this package's
  `public-api.ts` barrel re-exports `CurrentUserStore`, which imports `AuthStore` from it, so the
  whole module graph needs to resolve even though the demo only ever touches
  `RegionSettingsFormComponent`.
- **`theme` field switched from `SelectField` to `ngx-forms`' `ThemeField`, 2026-10-01** — a fixed
  light/dark icon toggle (sun/moon) instead of a dropdown, since theme only ever has those two
  values. `RegionSettingsFieldOptions` keeps its `theme` key (settled back after a same-day detour
  where `ThemeField` briefly took a separate config/token instead of `fieldDef.options` — see that
  package's `CLAUDE.md` for the full back-and-forth): `ThemeField`'s two values are fixed
  (`'light'`/`'dark'`, each tied to its own icon), so `options.theme` only ever supplies each one's
  label text, same mechanism the other four fields use for both label and value. `themeField` is
  still built through the shared `fieldDef()` helper, just with `FormFieldType.THEME` instead of the
  default `SELECT`.
- **`hints` input added, 2026-10-01** — `RegionSettingsFieldHints`
  (`Partial<Record<keyof RegionSettingsPayload, string>>`), optional, defaults to `{}`. Separate from
  `options` on purpose: `options` is about what a value means (label + sometimes bound value) and
  translation; `hints` is plain explanatory text under a field, same `FieldDef.hint` every
  `ngx-forms` field already supports — came up wanting to explain what changing `locale` actually
  affects (date format) before the user picks one. Considered a dedicated info-banner component
  (`@wiltech-labs/ngx-components`' new `Banner`, built the same day) for this, but settled on `hints`
  for the field-level case since it's zero new surface area — `fieldDef()` already assembles
  everything else per field, this is one more property on the same object. `Banner` is still useful
  for something more prominent than a per-field hint (Eg a page-level notice), just not this case.
- Not yet published to npm — under development.
- First consumer within this monorepo: `apps/showcase`'s demo route (above). Still no consumer
  outside this monorepo using the published package itself.
