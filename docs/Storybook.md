# Storybook

A Storybook workspace that shows every `@wiltech-labs/ngx-*` package and its use cases in one
browsable catalogue: one sidebar group per package, one story per use case, with live controls,
light/dark and locale switching, and an accessibility panel.

**Status: built through phase 7 (2026-10-02), not yet deployed.** Run it locally — `npm run
storybook` from the repo root, then `http://localhost:6006`. This file is the reference for how it
works and the plan for what's left (phase 8, Cloudflare Pages). Other docs only link here; see
`NEXT_STEPS.md` for exactly what shipped in the first pass.

## Why a separate workspace (and not part of the showcase app)

`apps/showcase` is a routed demo app: one page per package, wired up the way a real consumer would
wire it. Storybook does a different job. It renders each component on its own, one use case at a
time, with inputs you can change live. Keeping the two apart means:

- the showcase stays a realistic consumer and keeps its own `angular.json`, providers and budgets;
- Storybook's dev dependencies (webpack builder, addons, Compodoc) stay out of the showcase and
  out of every library package;
- stories never end up in a published package. Each package's `tsconfig.json` has no `include`, so
  a `*.stories.ts` placed next to a component would be picked up by that package's `typecheck`
  without Storybook's types. Keeping stories out of `packages/` avoids that.

## Target layout

```
apps/storybook/                    # npm workspace "ngx-storybook" (private, never published)
├── .storybook/
│   ├── main.ts                    # framework @storybook/angular, stories glob, addons
│   ├── preview.ts                 # global providers, decorators, toolbar globals (theme, locale)
│   ├── preview-head.html          # Roboto + Material Symbols fonts (same as the showcase index.html)
│   └── tsconfig.json              # extends ../tsconfig.json, includes ../src/**/*.stories.ts
├── src/
│   ├── styles.scss                # mat.theme() using the showcase's theme colours (see "Theme")
│   ├── mocks/                     # fake AuthStore, MSW handlers, in-memory notifications, sample data
│   ├── translations/              # en-GB / el-GR dictionaries for stories
│   └── stories/
│       ├── Introduction.mdx       # landing page: what's here, how to read a story, links to READMEs
│       ├── components/            # one folder per package, mirroring packages/*
│       │   ├── banner.stories.ts
│       │   ├── panel.stories.ts
│       │   └── card.stories.ts
│       ├── forms/ ...
│       └── <package>/ ...
├── angular.json                   # "storybook" + "build-storybook" targets (@storybook/angular builders)
├── tsconfig.doc.json              # Compodoc input: the library sources under packages/*/src
├── tsconfig.json                  # extends ../../tsconfig.base.json; same `paths` as the showcase
└── package.json
```

### How it resolves the libraries

The same way as the showcase: `tsconfig.json` `paths` map each `@wiltech-labs/ngx-*` name to
`../../packages/<dir>/src/public-api.ts`. Stories render the **library source**, so:

- editing a component in `packages/*` hot-reloads the story, with no `npm run build` in between;
- no `dist/` is needed to run Storybook. The `file:../x/dist` build-order requirement in the root
  `CLAUDE.md` only applies to `ng-packagr` builds, not here;
- stories import only from the public package name (`@wiltech-labs/ngx-components`), never from a
  deep `src/lib/...` path. If a story needs something that isn't exported, that's a sign the public
  API is missing it.

## Dependencies

Storybook `10.6.x` (current) declares support for Angular `>=18 <23` and TypeScript `^6`, which
matches this repo (Angular 22, TS `~6.0.2`). Dev dependencies of `apps/storybook` only:

| Package                                                           | Why                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `storybook`, `@storybook/angular`                                 | Core + Angular framework/builders (controls, actions, viewport, backgrounds are built into core in 10) |
| `@storybook/addon-docs`                                           | Autodocs pages and MDX                                                                                 |
| `@storybook/addon-a11y`                                           | axe checks per story, which backs the conventions doc's a11y rules                                     |
| `@compodoc/compodoc`                                              | Generates `documentation.json` so Autodocs shows real `input()`/`output()` tables with descriptions    |
| `msw`, `msw-storybook-addon`                                      | Fake HTTP for stories that go through `ApiClientService` (region-settings, organization)               |
| `@angular-devkit/build-angular`, `@angular/cli`, Angular peer set | Required by the Storybook Angular builder (it uses webpack, not `@angular/build:application`)          |

Install with `npx storybook@latest init` inside `apps/storybook`, then trim what it generates to
the layout above (delete its sample stories).

## Theme

**Decided 2026-10-02: reuse the showcase's theme.** There is one copy, not a fork.
`apps/storybook/src/styles.scss` runs the same `mat.theme(...)` call as the showcase and loads the
palettes from `apps/showcase/src/styles/_theme-colors.scss`. The Storybook `angular.json` targets
add `apps/showcase/src` to `stylePreprocessorOptions.includePaths`, so the import is just
`@use 'styles/theme-colors' as theme;`. A colour change in the showcase shows up in Storybook with
no extra step.

This is a deliberate, temporary link between the two workspaces. The theme is going to be
rewritten so a different theme can be picked per customer. When that lands:

- the palettes move out of `apps/showcase` into a shared home that both apps (and real consumers)
  read from, and this `includePaths` link goes away;
- Storybook gets a third toolbar global, `brand`, listing each customer theme. It applies that
  theme's token set, so every story can be checked against every customer theme, in light and
  dark.

Until then, the toolbar has only `theme` (light/dark/system) and `locale`.

## Compodoc

**Decided 2026-10-02: use Compodoc** so every Autodocs page has a real inputs/outputs table with
the descriptions from the source JSDoc.

- `apps/storybook/tsconfig.doc.json` extends `tsconfig.json` and `include`s
  `../../packages/*/src/**/*.ts`, excluding `**/*.spec.ts`. Compodoc has to read the **library**
  sources, not the stories: the stories reach the components through `paths` mappings, which
  Compodoc doesn't follow.
- Both `angular.json` targets set `"compodoc": true` and
  `"compodocArgs": ["-e", "json", "-d", ".", "-p", "tsconfig.doc.json"]`. Each serve or build
  regenerates `apps/storybook/documentation.json`, so no separate step is needed.
- `preview.ts` calls `setCompodocJson(docJson)` from `@storybook/addon-docs/angular`.
- `documentation.json` is generated output. Add it to `.gitignore`.
- Checked in phase 1: Compodoc `2.0.x` does pick up signal `input()`/`output()`, not just
  `@Input()` — confirmed on `Banner.messages` (a required signal input) resolving correctly in
  `documentation.json`'s `inputsClass`. No `argTypes` fallback needed.

## The `build` architect target (required, even though nothing ever runs it)

`angular.json` has a third target, `build` (`@angular-devkit/build-angular:browser`, the older
webpack-based builder, pointed at the unused stub files `src/main.ts`/`src/index.html`), that no
script ever invokes directly. It still has to exist:

`@storybook/angular`'s `start-storybook`/`build-storybook` builders read `styles`/`assets`/
`stylePreprocessorOptions`/`tsConfig` by looking up a **separate** Angular architect target named
by their own `browserTarget` option (`"ngx-storybook:build"` here) via `context.getTargetOptions()`
— they do not take those options directly on themselves. Skip `browserTarget` (as an early version
of this config did) and `start-storybook` fails outright with `SB_FRAMEWORK_ANGULAR_0001
(AngularLegacyBuildOptionsError)`: "Your Storybook startup script uses a solution that is not
supported anymore. You must use Angular builder to have an explicit configuration on the project
used in angular.json." `build-storybook` hit the same `options.angularBrowserTarget === undefined`
check internally but — confirmed by testing both from a clean `.angular/cache` — only
`start-storybook` actually surfaced it as a fatal error; `build-storybook` kept going regardless.
Don't rely on that asymmetry: set `browserTarget` on both, which is what actually fixed the dev
server. The automated fix the error message points to (`npx storybook automigrate`) offers a
migration to `@storybook/angular-vite` instead of fixing this in place — a bigger change (a
different builder entirely) that wasn't taken here.

`styles`/`assets`/`stylePreprocessorOptions` now live only on this `build` target; `storybook`/
`build-storybook` keep just their own options (`configDir`, `port`, `outputDir`, `compodoc`, …).

## Global setup (`preview.ts`)

Every story gets the same application context the showcase's `main.ts` provides, through
`applicationConfig` in a global decorator:

- `provideHttpClient()`, `provideAnimationsAsync()`, `MAT_ICON_DEFAULT_OPTIONS` (Material Symbols
  Outlined), `provideCharts(withDefaultRegisterables())`;
- `API_ORIGIN` pointing at a fake origin that MSW intercepts;
- `provideTranslations({ locales: ['en-GB', 'el-GR'], ... })` plus `NGX_DATES_LOCALE` /
  `NGX_FORMS_LOCALE` / `NGX_CALENDAR_LOCALE` resolvers reading `TranslationsService.locale()`;
- `provideNotifications(...)` with an in-memory fake backend (as in the showcase).

Toolbar globals:

| Global   | Values                | Effect                                                                                     |
| -------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `theme`  | light / dark / system | Sets `color-scheme` on `<html>`. The M3 theme uses `light-dark()`, so all tokens follow it |
| `locale` | en-GB / el-GR         | Calls `TranslationsService` to switch, so pipes, dates and component text change live      |

The viewport addon (built in) covers the responsive cases: modal side panel, calendar views, and
breakpoints from `ngx-styles`.

## Story conventions

- **Title = package / component**: `title: 'ngx-components/Banner'`, so the sidebar groups by
  package, in the same order as the root `CLAUDE.md` repo layout.
- **One named export per use case**: `Default`, `Error`, `WithActions`, `Loading`, `Empty`,
  `LongContent`, `Disabled`, and so on. "Multiple use cases" means multiple exports, not one story
  with every knob.
- **`args` for every `input()`**, so the Controls panel drives the component. Outputs go through
  the `fn()` action spy so they show in the Actions panel.
- **`tags: ['autodocs']`** on every component story file, giving each component a generated docs
  page (inputs table from Compodoc + every story rendered inline).
- **Wrapper host components** only when a component can't be shown through inputs alone (for
  example a `ModalService.open(...)` trigger button, or a template that exercises a pipe). They
  live next to the story in `src/stories/<package>/`, never in `packages/`.
- **Sample data in `src/mocks/`**, shared between stories. Not copied from the showcase: the two
  workspaces must not import from each other. The one exception is the theme colours (see
  "Theme").
- Selectors, SCSS and tokens in wrapper components follow `docs/ANGULAR_APP_CONVENTIONS.md` like
  any other code here.

## What each package gets

| Package               | Kind                  | Stories / use cases                                                                                                                                           |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ngx-components`      | Visual                | `Banner` (each `MessageType`, dismissible, long text), `Panel`, `Card` (with/without actions, media)                                                          |
| `ngx-ai-tools`        | Visual                | `AiPanel`, `AiTextBox` (empty, filled, disabled), `AiButton` (states), `AiSparkleIcon`; reduced-motion check                                                  |
| `ngx-media`           | Visual                | `CardLoader`, `ContentLoader` (sizes/counts), `YoutubePlayer` (loading vs loaded)                                                                             |
| `ngx-graphs`          | Visual                | One story per chart type (8), plus: single series (no legend), many series, empty data, "Show data" table open                                                |
| `ngx-forms`           | Visual                | One story per field type; `DynamicForm` from a `formConfig()` builder: minimal, every field, validation errors, prefilled entity, date/time fields per locale |
| `ngx-modals`          | Overlay (host)        | Trigger button opening: simple content, form with unsaved-changes guard, confirm dialog, left vs right side; typed close result shown in Actions              |
| `ngx-notifications`   | Overlay (host)        | Widget with unread items, all read, empty, dismiss/open flows against the fake backend                                                                        |
| `ngx-translations`    | Service + pipe (host) | `t` pipe, `formatDate()`/`formatNumber()`, reacting to the `locale` toolbar                                                                                   |
| `ngx-dates`           | Pipe (host)           | `relativeTime` across past/future ranges, both locales                                                                                                        |
| `ngx-calendar`        | Visual + data         | Day / week / month views, empty month, overlapping events, day panel, event edit panel                                                                        |
| `ngx-organization`    | Visual + data (MSW)   | Small org, deep tree, vacant jobs, person holding two jobs, node detail panel                                                                                 |
| `ngx-region-settings` | Visual + data (MSW)   | `RegionSettingsFormComponent` loaded, saving, error response; signed-in vs signed-out via a fake `AuthStore`                                                  |
| `ngx-styles`          | Docs (MDX)            | Breakpoints, spacing scale, mixin gallery (page-title, banner, state-layer, focus-ring) rendered with small sample elements                                   |
| `ngx-api-client`      | Docs (MDX)            | Usage page: envelope, links, metadata; `convertIdToValue` pipe in a host story                                                                                |
| `ngx-auth`            | Docs (MDX)            | Usage page only. Clerk needs a real publishable key, so there's no live story                                                                                 |
| `ngx-web-sockets`     | Later                 | `ChatRoom`/`ChatMessageBubble` with a fake `WebSocketService` (no Socket.IO backend exists). `ChatMessageBubble` alone can come first, since it's pure input  |

## Scripts

`apps/storybook/package.json`:

```json
"scripts": {
  "storybook": "ng run ngx-storybook:storybook",
  "build-storybook": "ng run ngx-storybook:build-storybook",
  "typecheck": "tsc -p .storybook/tsconfig.json --noEmit"
}
```

Root `package.json` gets shortcuts:

```json
"storybook": "npm run storybook --workspace=ngx-storybook",
"build-storybook": "npm run build-storybook --workspace=ngx-storybook"
```

There is deliberately **no `build` script** in `apps/storybook`. The root `build` loops over
`apps/*` running `build --if-present`, and a full static Storybook build is too slow to tie to
every repo build. `typecheck` _is_ included, so the root `npm run typecheck` catches stories that
break when a library API changes.

Static output goes to `apps/storybook/storybook-static/`. Add that to `.gitignore`, along with
`documentation.json`.

Run it with `npm run storybook` from the repo root, then open `http://localhost:6006`.

## Deployment (Cloudflare Pages)

**Decided 2026-10-02: publish the built Storybook on Cloudflare Pages**, the same way the other
Angular apps are hosted. It's its own Pages project, connected to this repo and building on push
to `main`.

| Pages setting          | Value                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Root directory         | _(repo root)_, because `npm ci` must see the workspaces root |
| Build command          | `npm ci && npm run build-storybook`                          |
| Build output directory | `apps/storybook/storybook-static`                            |
| Environment variable   | `NODE_VERSION` matching local (20+)                          |

Notes:

- No `_redirects` file is needed. Storybook routes by query string (`?path=/story/...`), not by
  path, so there's no SPA fallback to configure.
- The build uses library **source** through `paths`, so Pages never runs `npm run build:packages`.
- Optional: add a **build watch path** of `packages/**` and `apps/storybook/**`, so commits that only
  touch the showcase or docs don't trigger a rebuild.
- **What goes on the site is public.** Stories only ever use fake data and the MSW fake origin.
  No real API origins, Clerk keys or customer data go in stories or `preview.ts`. `ngx-auth` stays
  a docs-only page for that reason. If a customer-theme preview later needs to stay private, put
  the Pages project behind Cloudflare Access instead of leaving things out of Storybook.

## Phases

1. **Scaffold**: `apps/storybook` workspace, `angular.json` targets, `.storybook/main.ts` +
   `preview.ts`, `tsconfig` paths, `styles.scss` reusing the showcase theme, fonts, Compodoc
   wiring, root scripts, `.gitignore`. Done when `npm run storybook` serves an `Introduction.mdx`
   page in light and dark and `npm run build-storybook` succeeds from a clean clone.
2. **Cloudflare Pages project**: connect it with the settings under "Deployment". From then on,
   every later phase goes live on push.
3. **Plain visual packages**: `ngx-components`, `ngx-ai-tools`, `ngx-media`, `ngx-graphs`. These
   need no providers beyond the global ones, so they prove the conventions above.
4. **Forms + overlays**: `ngx-forms`, `ngx-modals`, `ngx-notifications`, with host components and
   action spies.
5. **Locale-driven**: `ngx-translations`, `ngx-dates`, plus the `locale` toolbar wired to the
   locale resolvers of forms and calendar.
6. **Data-backed**: MSW + fake `AuthStore`, then `ngx-calendar`, `ngx-organization`,
   `ngx-region-settings`.
7. **Docs pages**: MDX for `ngx-styles`, `ngx-api-client`, `ngx-auth`, each linking to that
   package's README rather than repeating it.
8. **Later / optional**:
   - the `brand` toolbar global, once the per-customer theme rewrite lands (see "Theme");
   - `ngx-web-sockets` with a fake socket service;
   - interaction tests (`play` functions, run with Storybook's Vitest addon), which would be the
     repo's first real tests.

Each phase is self-contained, so Storybook is usable after phase 1, is online after phase 2, and
grows package by package after that.

## Keeping it current

- **New package checklist addition**: a new package with components gets a
  `src/stories/<package>/` folder and at least a `Default` story per exported component. A
  package with no UI gets an MDX usage page.
- **New use case**: add a named export to the existing story file instead of a new file.
- When a component's public inputs change, the story's `args` must change with it. The root
  `typecheck` fails if they drift.

## Decisions

| Date       | Decision                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-02 | Reuse the showcase theme (single copy via `includePaths`) until the per-customer theme rewrite; then add a `brand` toolbar |
| 2026-10-02 | Use Compodoc for Autodocs input/output tables                                                                              |
| 2026-10-02 | Publish on Cloudflare Pages, built from Git on push to `main`                                                              |
