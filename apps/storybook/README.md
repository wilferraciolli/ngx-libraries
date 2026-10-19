# NGX Libraries Storybook

A component catalogue for every `@wiltech-labs/ngx-*` package in this monorepo — one sidebar group
per package, one story per use case, rendered straight from each package's source. See
[`docs/Storybook.md`](../../docs/Storybook.md) at the repo root for how it's put together (theme,
locale toolbar, Compodoc, deployment) and the full package-by-package plan.

## Getting started

From the monorepo root:

```bash
npm install
npm run storybook          # http://localhost:6006
```

Or from this directory:

```bash
npm run storybook
```

Stories render library source via `tsconfig.json` path mappings — no `npm run build:packages`
needed first, and no `dist/` required. Editing a component in `packages/*` reloads its story
immediately.

### Building

```bash
npm run build-storybook   # from this directory, or `npm run build-storybook` at the repo root
```

Static output goes to `storybook-static/`. Not yet deployed anywhere — see `docs/Storybook.md`
"Deployment" for the planned Cloudflare Pages setup.

### Toolbar

- **Theme** — light / dark / system. Every colour comes from Material 3 `--mat-sys-*` tokens, so
  the whole catalogue follows it.
- **Locale** — English (UK) / Greek. Switches translations, relative dates, and date/time fields
  that read `NGX_FORMS_LOCALE`/`NGX_CALENDAR_LOCALE`/`NGX_DATES_LOCALE` live.

## Project structure

```
.storybook/
├── main.ts            # framework config, the stories glob, addons
├── preview.ts          # global providers (one per app, shared across every story) + toolbar globals
├── preview-head.html   # fonts (same ones the showcase app loads)
└── tsconfig.json        # includes src/**/*.ts, extends ../tsconfig.json
src/
├── stories/
│   ├── Introduction.mdx          # landing page
│   ├── <package>/                # one folder per package with UI — sample data, host wrappers
│   └── <package>.stories.ts      # or *.stories.ts directly under stories/ for a single-component package
├── support/locale-sync.ts         # pushes the locale toolbar global into TranslationsService
├── translations/                  # en-GB/el-GR dictionaries used across every story
└── styles.scss                    # Material 3 theme — reuses apps/showcase's palette, see docs/Storybook.md
angular.json             # storybook / build-storybook targets, plus an unused `build` target
                          # (required by @storybook/angular's builders — see docs/Storybook.md)
```

## Adding a story

1. A package with components gets a `src/stories/<package>/` folder (or a single
   `<package>.stories.ts` file for a one-component package) and at least a `Default` story per
   exported component.
2. A package with no UI (`ngx-api-client`, `ngx-auth`, `ngx-styles`) gets an MDX usage page
   instead.
3. Title each story file `'<package>/<Component>'` so the sidebar groups by package.
4. A new use case is a new named export in the existing story file, not a new file.
5. If a component needs providers beyond the global ones in `preview.ts` (a fake backend, a
   different `AuthStore`), add them per-story via `moduleMetadata({ providers: [...] })` — see
   `src/stories/notifications/notifications-fixture.ts` for an example that shadows a
   `providedIn: 'root'` service.

Full conventions, the per-package use-case table, and open/decided questions (theme, Compodoc,
hosting) are in [`docs/Storybook.md`](../../docs/Storybook.md).

## Notes

- Stories live here, never inside `packages/*` — see `docs/Storybook.md` "Why a separate
  workspace".
- All data in these stories is fake. Nothing here calls a real API.
- `ngx-web-sockets`' `ChatRoom` isn't covered yet (needs a fake `WebSocketService`); its
  `ChatMessageBubble` is.
