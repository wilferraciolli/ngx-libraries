# ngx-libraries

Wiltech's shared Angular libraries — small, framework-idiomatic packages
published to npm under the `@wiltech` scope, so downstream Angular apps
install pieces instead of copy-pasting them. First consumer is `insurly-ui`
(sibling `insurly` repo); two more Angular projects are planned to consume
these too.

## Repo layout
```
ngx-libraries/
├── packages/
│   └── api-client/        # @wiltech/ngx-api-client — see its own CLAUDE.md
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
| Naming | npm scope `@wiltech`, package names prefixed `ngx-` (e.g. `@wiltech/ngx-api-client`). |
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
- These packages exist **ahead of their consumers** right now —
  `insurly-ui` (in the sibling `insurly` repo) is the source everything so
  far was ported from, but nothing has been wired back into it yet; it
  still runs its own local copies until each package is published and
  swapped in. Don't assume code here is "live" anywhere.
- No tests yet — everything so far is a straight port of already-exercised
  `insurly-ui` code. Add real tests once a package grows logic that isn't
  already covered by that consumer.
