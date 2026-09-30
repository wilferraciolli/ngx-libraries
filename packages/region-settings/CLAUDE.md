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
    └── stores/
        ├── current-user.store.ts    # CurrentUserStore<TMe, TProfile> (providedIn: 'root')
        └── region-settings.store.ts # RegionSettingsStore<TSettings, TPayload> (abstract) +
                                      # UserSettingsStore / SystemSettingsStore
```

## Conventions
- **Real npm dependency on `@wiltech-labs/ngx-api-client` and `@wiltech-labs/ngx-auth`** — the
  sanctioned exception to root `CLAUDE.md`'s default "no inter-package deps." `CurrentUserStore`
  gates its `/me` fetch on `AuthStore.isSignedIn()`; both packages are kept strict foundation leaves
  (never depend on anything built on top of them), which is what makes this safe from cycles.
- **How the dependency actually resolves, in this monorepo specifically**: `package.json` points at
  `"@wiltech-labs/ngx-api-client": "file:../api-client/dist"` and
  `"@wiltech-labs/ngx-auth": "file:../auth/dist"` — an explicit `file:` reference to the sibling's
  *built* `dist/` output, not a bare semver range. A bare range (`"^1.0.0"`, `"*"`, ...) resolves to
  npm workspaces' own auto-link-by-name behaviour instead, which points at the sibling's *source*
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
- **This means `dist/package.json` needs a manual fixup before publishing** — `ng-packagr` copies
  `dependencies` verbatim, `file:` paths included, so a published tarball would otherwise ship a
  dependency on a path that doesn't exist outside this monorepo. See this package's README's
  "Publishing" section for the exact step. Not automated (no CI/publish-script exists yet — see root
  `NEXT_STEPS.md`'s "Repo-wide" section); worth a small script if this pattern gets reused by a third
  package.
- **Build-order requirement this creates**: `ngx-api-client` and `ngx-auth` must be built (their
  `dist/` must exist) *before* this package builds — `file:../api-client/dist` is a dangling
  reference otherwise. Root `package.json`'s `build:packages` script happens to satisfy this today
  purely because its `for d in packages/*/` loop runs in alphabetical directory order
  (`api-client`, `auth`, ... , `region-settings`, ...) — if package directory names ever change in a
  way that breaks that ordering, this becomes a real build failure, not just a slow one. Building
  this package on its own (`cd packages/region-settings && npm run build`) after a fresh clone
  requires manually building `../api-client` and `../auth` first for the same reason.
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
  `SystemSettingsStore`, plus the `Identifiable`/`Me`/`UserProfile`/`RegionSettings`/
  `RegionSettingsPayload` types.
- Not yet published to npm — under development.
- No consumers yet within this monorepo.
