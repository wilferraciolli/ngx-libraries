# ngx-libraries

Wiltech's shared Angular libraries — small, framework-idiomatic packages
published to npm under the `@wiliamferraciolli` scope, so downstream Angular
apps install pieces instead of copy-pasting them. First consumer is
`insurly-ui` (sibling `insurly` repo); two more Angular projects are
planned to consume these too.

Note: the npm scope is `@wiliamferraciolli`, not `@wiltech` — the `wiltech`
npm organization got into a broken state on npm's side (visible as owned
via `npm org ls wiltech`, but not selectable as a token/package scope
anywhere, and every publish 404'd) with no fix available short of npm
support. `@wiliamferraciolli` is a working org created as the unblock.
Revisit if/when npm support resolves the `wiltech` org.

## Repo layout
```
ngx-libraries/
├── packages/
│   └── api-client/        # @wiliamferraciolli/ngx-api-client — see its own CLAUDE.md
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
| Naming | npm scope `@wiliamferraciolli` (see note above), package names prefixed `ngx-` (e.g. `@wiliamferraciolli/ngx-api-client`). |
| Publishing | Public npm packages (not a private registry) — `publishConfig.access: public` is set per package. Publish from that package's `dist/` (the `ng-packagr` output), never the source folder — the source `package.json` has no entry-point fields. |
| Components | Standalone only, no NgModules — matches every known consumer's convention. |
| License | Apache-2.0 (repo `LICENSE`, inherited by each package's `package.json`). |

## Working in this repo
- One package = one npm-publishable unit. Organize each package's `src/lib/`
  into folders by concern (e.g. `http-client/`, `links/`, `metadata/` in
  `api-client`) rather than a flat file list — see that package's own
  `CLAUDE.md`.
- A package's public surface is exactly what `src/public-api.ts` re-exports
  — nothing else is reachable by consumers.
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
  `@wiliamferraciolli/ngx-api-client` (not a local copy) and every
  `*ApiService` there uses it. A new package here still starts out
  consumer-less until it's published and adopted somewhere — check the
  package's own `CLAUDE.md`/`README.md` "Status"/"Publishing" section for
  where things actually stand before assuming it's live anywhere.
- No tests yet — everything so far is a straight port of already-exercised
  `insurly-ui` code. Add real tests once a package grows logic that isn't
  already covered by that consumer.
