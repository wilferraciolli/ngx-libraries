# ngx-libraries

Wiltech's shared Angular libraries — small, framework-idiomatic packages
published to npm under the `@wiltech-labs` scope, so downstream Angular
apps install pieces instead of copy-pasting them. First consumer is
`insurly-ui` (sibling `insurly` repo); two more Angular projects are
planned to consume these too.

Note: the npm scope is `@wiltech-labs`, not `@wiltech`.

## Repo layout
```
ngx-libraries/
├── packages/
│   ├── api-client/        # @wiltech-labs/ngx-api-client — see its own CLAUDE.md
│   ├── forms/              # @wiltech-labs/ngx-forms — see its own CLAUDE.md
│   ├── media/              # @wiltech-labs/ngx-media — see its own CLAUDE.md
│   ├── ai-tools/           # @wiltech-labs/ngx-ai-tools — see its own CLAUDE.md
│   ├── graphs/             # @wiltech-labs/ngx-graphs — see its own CLAUDE.md
│   ├── web-sockets/        # @wiltech-labs/ngx-web-sockets — see its own CLAUDE.md
│   ├── translations/       # @wiltech-labs/ngx-translations — see its own CLAUDE.md
│   ├── dates/              # @wiltech-labs/ngx-dates — see its own CLAUDE.md
│   ├── auth/               # @wiltech-labs/ngx-auth — see its own CLAUDE.md
│   ├── region-settings/    # @wiltech-labs/ngx-region-settings — see its own CLAUDE.md
│   ├── modals/             # @wiltech-labs/ngx-modals — see its own CLAUDE.md
│   └── notifications/      # @wiltech-labs/ngx-notifications — see its own CLAUDE.md
├── docs/
│   └── ANGULAR_APP_CONVENTIONS.md  # conventions every consuming Angular app follows — its
│                                   # "Shared libraries" section is the contract these packages meet
├── tsconfig.base.json     # shared compiler options, extended by every package
├── package.json           # npm workspaces root (packages/*)
└── LICENSE                # Apache-2.0, applies to every package
```

## Locked-in decisions (don't relitigate without asking)
| Area | Decision |
|---|---|
| Consumers | Angular only — every package here is a real Angular library (uses `@Injectable`/`@Pipe`/DI), not framework-agnostic plain TS. Was framework-agnostic originally; changed once it was confirmed every consumer is and will be Angular. |
| Build | `ng-packagr` (Angular Package Format) per package — plain `tsc` isn't enough once a package exports `@Injectable`/`@Pipe`, Ivy needs partial compilation to be consumable by another Angular app's build. |
| Monorepo | npm workspaces (`packages/*`) — one `package.json` + `ng-package.json` + `tsconfig.json` per package. |
| Naming | npm scope `@wiltech-labs` (see note above), package names prefixed `ngx-` (e.g. `@wiltech-labs/ngx-api-client`). |
| Publishing | Public npm packages (not a private registry) — `publishConfig.access: public` is set per package. Publish from that package's `dist/` (the `ng-packagr` output), never the source folder — the source `package.json` has no entry-point fields. |
| Components | Standalone only, no NgModules — matches every known consumer's convention. |
| License | Apache-2.0 (repo `LICENSE`, inherited by each package's `package.json`). |
| Inter-package deps | Default is still none. `ng-packagr` needs a real, resolvable module for each import, and a workspace sibling's *unpublished source* `package.json` has no `main`/`types` (only its built `dist/` one does — see Publishing above), so one package here can't import another's source the way an app can via a `tsconfig` path mapping — use an app-pluggable resolver token instead (see `ngx-translations`' `NgxTranslationsConfig.resolveLocale` / `ngx-dates`' `NGX_DATES_LOCALE`) and let the *consuming app* wire the two together. **Two sanctioned exceptions, decided 2026-09-30**: a package may take a real npm dependency on `@wiltech-labs/ngx-api-client` and/or `@wiltech-labs/ngx-auth` specifically, the same way `ngx-translations` depends on `@jsverse/transloco` — `ngx-region-settings` (built) does this, building `CurrentUserStore`/`RegionSettingsStore` directly on `ApiClientService`, gated on `AuthStore.isSignedIn()` from `ngx-auth`, rather than every consumer wiring app-supplied fetch/save/reset/sign-in functions by hand. This is safe from cycles only because both are kept strict *foundation leaves*: neither may ever depend on another `@wiltech-labs/ngx-*` package, published or not — a package built on top of one (or both) can depend downward on it, but a foundation leaf can never depend upward on anything built on it, or a cycle becomes possible. Don't extend this exception to any other sibling package (e.g. `ngx-translations`, `ngx-dates`) without revisiting this decision first — they aren't guaranteed to stay leaves the way `ngx-api-client`/`ngx-auth` are designed to. **How it actually resolves**: the dependent package's own `dependencies` point at `"file:../api-client/dist"` / `"file:../auth/dist"` (the sibling's *built* output), not a bare semver range — a bare range resolves to npm workspaces' own auto-link-by-name behaviour instead, which points at the sibling's unpublished *source* folder (no `main`/`types`), the exact failure this section's opening sentence describes. This means the two depended-on packages must be built before the dependent one, and `dist/package.json`'s `file:` entries need a manual fixup to a real semver range before publishing (`ng-packagr` copies `dependencies` verbatim) — see `ngx-region-settings`'s own `CLAUDE.md`/README for the full mechanism and exact publish step. |

## Working in this repo
- One package = one npm-publishable unit. Organize each package's `src/lib/`
  into folders by concern (e.g. `http-client/`, `links/`, `metadata/` in
  `api-client`) rather than a flat file list — see that package's own
  `CLAUDE.md`.
- A package's public surface is exactly what `src/public-api.ts` re-exports
  — nothing else is reachable by consumers.
- **Every package meets `docs/ANGULAR_APP_CONVENTIONS.md`** — its "Shared
  libraries" section is the contract. In particular:
  - component selectors are `ngx-` (never `app-`, which is the consuming apps' prefix);
  - SCSS classes follow the doc's "Component SCSS class naming" (`.ComponentName-suffix`,
    `is-*` state classes, max two `&` levels) — no BEM;
  - colours, type and shape come from `--mat-sys-*` tokens, via `--ngx-<package>-*` overrides
    with a hex fallback last: `var(--ngx-x, var(--mat-sys-y, #hex))` (a hex fallback keeps
    Material-free packages usable in an unthemed app);
  - motion stops under `prefers-reduced-motion`; custom interactive elements get a visible focus
    ring; decorative pieces are `aria-hidden`;
  - dates follow the doc's "Dates and times" (`Temporal`, string wire formats).
  Change the doc and the package together when a rule needs to move.
- **New package checklist**: `packages/<name>/` containing
  - `package.json` — peer deps pinned to the Angular versions actually in
    use, `publishConfig.access: public`
  - `ng-package.json` — `{ "dest": "dist", "lib": { "entryFile": "src/public-api.ts" } }`
  - `tsconfig.json` — extends `../../tsconfig.base.json`, adds
    `experimentalDecorators: true` and `useDefineForClassFields: false`
    (both required for Angular decorator metadata)
  - its own `README.md` — usage examples + a **Publishing** section (see
    `packages/api-client/README.md` as the template)
- `insurly-ui` (sibling `insurly` repo) is both the source `api-client` was
  ported from and its first live consumer — it depends on the published
  `@wiltech-labs/ngx-api-client` (not a local copy) and every
  `*ApiService` there uses it. A new package here still starts out
  consumer-less until it's published and adopted somewhere — check the
  package's own `CLAUDE.md`/`README.md` "Status"/"Publishing" section for
  where things actually stand before assuming it's live anywhere.
- No tests yet — everything so far is a straight port of already-exercised
  `insurly-ui` code. Add real tests once a package grows logic that isn't
  already covered by that consumer.
