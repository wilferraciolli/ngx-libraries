# Angular frontend conventions (portable)

Reusable conventions extracted from this project's frontend setup, stripped
of project-specific names/paths. Copy this file into another Angular app
and adjust the concrete mixin/store names to that app's domain.

Assumes: Angular (standalone components, no NgModules), Signals API,
Angular Material + CDK (for controls, themed to the house look), Vitest, Prettier, SCSS.

**Starting a new app?** Read "Design system: Ink & Signal": one stylesheet and two
fonts give it the house look, and the `impeccable` skill and `frontend-design` plugin
design its screens from there.

## Design tooling

Every app built from these conventions uses two Claude Code design aids: the
`frontend-design` plugin and the `impeccable` skill.

### The `frontend-design` plugin

Install it once per machine, from inside Claude Code:

```
/plugin install frontend-design@claude-plugins-official
```

It gives Claude frontend design guidance for building UI. If it doesn't show up in
a session that was already running when you installed it, start a new session.

### The `impeccable` skill

This repo has the `impeccable` Claude Code skill installed
(`.claude/skills/impeccable/`, by pbakaus). **After installing it into a
project for the first time, start a new Claude Code session before using
it** — a skill just added to `.claude/skills/` isn't picked up by a
session already running, since the skill list is loaded at session start.
Once in a fresh session, run `/impeccable init` first (captures durable
product context into `PRODUCT.md`) before any other command.

Reach for it for any design/UX work on the frontend rather than
freehanding it: shaping a new
screen before writing code (`shape`), reviewing what's already built
(`critique` for a UX/heuristic pass, `audit` for a11y/perf/responsive
checks), and refining it afterward (`polish`, `bolder`, `quieter`,
`distill`, `harden`, `colorize`, `layout`, `typeset`, `animate`, `delight`,
`clarify`, `adapt`, `optimize` — see the skill's own command table for the
full list and what each one is for). Invoke it as `/impeccable <command>
[target]`, or with no argument for its context-aware menu. It also owns
this project's `PRODUCT.md`/`DESIGN.md` (via its `init`/`document`
commands) — generate those from this project's own code rather than
copying another project's, since they capture _this_ app's product intent
and existing visual language.

These two lead the design of a screen. "Design system: Ink & Signal" below gives them the
house look to start from and a floor to keep (accessibility, spacing, tokens, minimal copy);
it does not overrule a direction they set, or the app's own `DESIGN.md`.

## Core rules

- Standalone components only — no `NgModule` declarations anywhere in new
  code.
- Signals API (`signal()` / `computed()` / `linkedSignal()` / `resource()`
  / `httpResource()`) for local and feature state. Avoid `effect()` —
  prefer `computed()`, `httpResource()` and explicit event handlers;
  reserve `effect()` for genuine render/DOM-sync side effects only.
- `@ngrx/signals` (`signalStore`) is fine for cross-cutting, app-wide state
  (e.g. an `AuthStore`) — it's still signals under the hood. Avoid the
  classic RxJS-based `@ngrx/store`/`@ngrx/effects`; feature-local state
  stays plain injectable signal stores.
- RxJS interop (`toSignal()`/`toObservable()`) is fine for bridging
  Reactive Forms into signals, but signals are the default state model.
- Signals Forms (`@angular/forms/signals`) for form handling, rendered
  with `@wiltech-labs/ngx-forms` (see "Shared libraries").
- One typed API service per feature, delegating HTTP mechanics to
  `ApiClientService` from `@wiltech-labs/ngx-api-client` rather than
  calling `HttpClient` directly. Prefer its `resource()` /
  `collectionResource()` (`httpResource` underneath) over manual
  `subscribe()` plumbing for data fetches.
- Dates and times travel as strings and are computed with `Temporal`,
  never `Date` arithmetic (see "Dates and times").
- Before building a loader, form field, chart, chat, AI surface or
  websocket client, check "Shared libraries" — reach for the package, not
  a local copy. When a package almost fits, change the package, don't work
  around it in the app (see "When a library is missing something").
- Vitest for tests. Prefer testing signal-based store behavior directly
  (it's plain TypeScript) over over-mocking component internals.
- Explicit types wherever a type can be written, even when TypeScript would
  infer it: fields (`name: string = 'Name'`,
  `private readonly api: ApiClientService = inject(ApiClientService)`,
  `readonly saving: WritableSignal<boolean> = signal(false)`,
  `readonly rows: Signal<Row[]> = computed(...)`, `input`/`output` as
  `InputSignal<T>`/`OutputEmitterRef<T>`), constants, callback parameters,
  every function's return type, and local `const`s. Leave one out only when
  the type genuinely can't be named.
- Prettier for formatting (100 col, single quotes, Angular parser for
  `*.html` in `.prettierrc`) — run it rather than hand-formatting.
- `.editorconfig`: 2-space indent everywhere, single quotes in `*.ts`.

## Folder structure — one folder per component

Follow the Angular style guide: feature folders, but **every component
gets its own folder** holding its four files — `name.ts`, `name.html`,
`name.scss`, `name.spec.ts`. **No component — and no component
stylesheet, including a shared partial — sits directly at a
feature-folder level**; the feature shell and shared `*.scss` partials
each get their own folder too. Plain non-component classes (signal
stores, guards, resolvers) may still live at the feature root, e.g.
`some-feature/some-feature.store.ts`. Nest child components inside their
parent's folder.

```
src/app/
├── core/            # interceptors, guards, api services
├── features/
│   └── some-feature/
│       ├── some-feature-shell/            # the feature's shell component
│       │   └── some-feature-shell.{ts,html,scss,spec.ts}
│       ├── shared-partial/                # shared style partial, its own folder
│       │   └── shared-partial.scss        # → .SharedPartial-… (see SCSS naming rule)
│       ├── list-view/
│       │   ├── list-view.{ts,html,scss,spec.ts}
│       │   └── list-item/                 # child component of list-view
│       │       └── list-item.{ts,html,scss,spec.ts}
│       └── some-feature.store.ts          # signal-based state for the feature
├── shared/          # reusable UI components (same one-folder-per-component rule)
└── app.routes.ts
```

When the API is split into areas (as Crewly's is, in its `docs/API_AREAS.md`), the UI follows the same
split: `src/app/areas/<area>/` in place of `features/`, one feature folder per module inside
it (a feature named like its area sits at the area's root). Each area has `<area>.routes.ts`,
its pages as the children of one parent route with an empty path, so URLs don't change, and
`<area>.strings.ts`, the area's own dictionaries in `<area>/translations/`. The parent route
resolves `translationArea(<AREA>_STRINGS)` (`ngx-translations`), so an area's strings load
with its first page instead of in the first download. A section of strings stays in the app's
shell dictionary when pages of more than one area use it. An area imports another only
through that area's `public.ts` (components another area's page shows, API shapes it reads),
and `core/`/`shared/` import no area; a spec reading the sources keeps both true. A helper
several areas need goes in `core/`. Navigation groupings (an apps menu) are a separate layer
and don't move code between areas.

Code that runs at start-up imports `ngx-region-settings` from its `/core` entry point. The main
entry point carries the settings form, which pulls every `ngx-forms` field and Material control
into the main chunk.

## Shared libraries (`@wiltech-labs/ngx-*`)

Recurring building blocks — API client, forms, loaders, charts, AI surfaces,
websockets — are published as standalone Angular libraries on npm under the
`@wiltech-labs` scope. Apps install them instead of keeping local copies. The
libraries are built to this document's rules (standalone, signals, theme tokens,
the SCSS naming rule), so they take on the app's look and theme with no configuration.

Each package's `README.md` is its API reference. This section covers _when_
to use which package and the rules for using it in an app.

### When a library is missing something

Don't build a local copy or a workaround that bypasses the package (for example
calling `HttpClient` because `ApiClientService` doesn't expose something).
Propose the change in the library instead:

1. Make the change in `ngx-libraries` (`packages/<name>`), with its README and
   a `NEXT_STEPS.md` entry, and type-check or test it there. Pull the
   library repo first: work on its latest `main`.
2. Bump the **patch** version unless the owner asks for another bump. Leave it
   uncommitted for the owner to review, commit and publish to npm (publish from
   the package's `dist/` after `npm run build`; a new version can take a while
   to show on the registry).
3. Until the new version is on npm, the app may keep a workaround only if it is
   marked `TEMPORARY`, names the package version that replaces it, and is
   removed as soon as that version is published.
4. Apps depend on published versions only, never a path or git source.

The same applies to anything reusable an app is about to write that no package
covers yet: propose it as a new package or an addition to an existing one.

### What to use for what

| Need                                          | Package               | Use                                                                                                                                                    | Replaces in an app                                                                                   |
| --------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Talk to the backend API                       | `ngx-api-client`      | `ApiClientService`, `LinkService`, `MetadataService`, `convertIdToValues` pipe, `ApiErrorResponse` helpers                                             | Hand-rolled `HttpClient` calls, `_data[root]` unwrapping, local envelope/link/metadata/error helpers |
| Downloading a file from the API               | `ngx-api-client`      | `ApiClientService.download()`, `saveDownload()`                                                                                                        | App-local blob requests and `Content-Disposition` parsing                                            |
| Forms                                         | `ngx-forms`           | `formConfig<T>()`, `DynamicForm`, the `*Field` components, `toSchema()`                                                                                | Hand-written `mat-form-field` markup, template-level validators, a `forms` SCSS partial              |
| Date and time input                           | `ngx-forms`           | `BusinessDateField`, `BusinessTimeField`, `InstantDateTimeField`, `ZonedDateTimeService`                                                               | Raw `matDatepicker` bound to `Date` values                                                           |
| Relative times ("5 hours ago")                | `ngx-dates`           | `relativeTime` pipe, `RelativeTimeService`                                                                                                             | An app-local pipe                                                                                    |
| Loading states                                | `ngx-media`           | `ContentLoader`, `CardLoader`                                                                                                                          | "Loading…" text, spinners for content, `ngx-skeleton-loader`                                         |
| Embedded video                                | `ngx-media`           | `YoutubePlayer`                                                                                                                                        | Hand-built `<iframe>` embeds                                                                         |
| Choosing a file to upload                     | `ngx-media`           | `FilePicker` (`<ngx-file-picker>`), `readAsBase64`, `formatFileSize`                                                                                   | A bare `<input type="file">`, app-local size and type checks                                         |
| Charts                                        | `ngx-graphs`          | `graphConfig()` + `BarGraph`/`LineGraph`/`PieGraph`/`DoughnutGraph`/`PolarAreaGraph`/`RadarGraph`; `pointGraphConfig()` + `BubbleGraph`/`ScatterGraph` | App-local chart wrappers, direct `ng2-charts` use, hand-drawn charts                                 |
| AI interaction surfaces                       | `ngx-ai-tools`        | `AiTextBox`, `AiButton`, `AiPanel`, `AiSparkleIcon`, `AiGenerate` + `provideAiGenerator()`                                                             | Ad hoc gradient styling                                                                              |
| Realtime / websockets                         | `ngx-web-sockets`     | `provideWebSocket()`, `WebSocketService`, `ChatRoom`, `ChatMessageBubble`                                                                              | `ngx-socket-io`, hand-rolled socket services                                                         |
| Translations                                  | `ngx-translations`    | `provideTranslations()`, `TranslationsService`, the `t` pipe                                                                                           | An app-local translation store (see `ngx-translations` below), raw Transloco use                     |
| Clerk sign-in state, guard, HTTP token        | `ngx-auth`            | `provideAuth()`, `AuthStore`, `authGuard`, `authInterceptor`                                                                                           | The hand-rolled `AuthStore`/`signalStore` this doc's own "Authentication (Clerk)" section describes  |
| Current user / region settings                | `ngx-region-settings` | `CurrentUserStore`, `RegionSettingsStore` (`UserSettingsStore`/`SystemSettingsStore`)                                                                  | An app-local `/me` → `userProfile` → `userSettings`/`systemSettings` link-following chain            |
| A side panel / modal                          | `ngx-modals`          | `ModalService.open()`, `ModalCloseAction`/`ModalCloseResult`, `ModalContent`                                                                           | Hand-rolled `MatDialog.open()` calls, an app-local close-reason enum per feature                     |
| Notification bell                             | `ngx-notifications`   | `provideNotifications()`, `NotificationsService`, `<ngx-notifications>`                                                                                | An app-local bell/badge/panel, a hand-rolled polling interval                                        |
| Info/warning/error call-outs                  | `ngx-components`      | `Banner`, `Message`/`MessageType`                                                                                                                      | Ad hoc alert/banner markup per app                                                                   |
| Expandable section / static card              | `ngx-components`      | `Panel` (`mat-expansion-panel`), `Card` (`mat-card`)                                                                                                   | Hand-written `mat-expansion-panel`/`mat-card` header markup per app                                  |
| Day / week / month calendar                   | `ngx-calendar`        | `Calendar`, `CalendarEvent`, `CalendarEventMapper`                                                                                                     | Direct FullCalendar / angular-calendar use, an app-local agenda list                                 |
| Org chart                                     | `ngx-organization`    | `OrganizationChart`, `OrgItem`, `OrgChartStore`                                                                                                        | Hand-drawn org trees, direct org-chart library use                                                   |
| Shared Sass (breakpoints, spacing, UI mixins) | `ngx-styles`          | `@use 'breakpoints'`/`'spacing'`/`'ui'` from `stylePreprocessorOptions.includePaths`                                                                   | A `src/styles/_breakpoints.scss`/`_spacing.scss`/`_ui.scss` copy-pasted per app                      |

### Setup

Install only the packages the app uses (`npm i @wiltech-labs/ngx-forms …`).
Six of them need an app-level provider in `app.config.ts`:

```ts
import { inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { API_ORIGIN } from '@wiltech-labs/ngx-api-client';
import { provideWebSocket } from '@wiltech-labs/ngx-web-sockets';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslationsService, provideTranslations } from '@wiltech-labs/ngx-translations';
import { NGX_DATES_LOCALE } from '@wiltech-labs/ngx-dates';
import { provideAuth, authInterceptor } from '@wiltech-labs/ngx-auth';

provideHttpClient(withInterceptors([authInterceptor])),     // ngx-api-client; authInterceptor — ngx-auth, only if using it
{ provide: API_ORIGIN, useValue: environment.apiOrigin },    // ngx-api-client — only when the API is on another origin
provideCharts(withDefaultRegisterables()),                   // ngx-graphs — chart.js registration, once per app
provideWebSocket({ url: environment.socketUrl }),            // ngx-web-sockets
provideTranslations({ locales: [...], defaultLocale: '...', dictionaries: {...} }), // ngx-translations
{                                                             // ngx-dates — wire its locale to ngx-translations'
  provide: NGX_DATES_LOCALE,
  useFactory: () => { const translations = inject(TranslationsService); return () => translations.locale(); }
},
provideAuth({                                                // ngx-auth
  clerkPublishableKey: environment.clerkPublishableKey,
  apiOrigin: environment.apiOrigin,
  waitAtStartup: false,                                      // from 1.0.3: render before Clerk loads
  sdkBuild: 'no-rhc',                                        // from 1.0.3: Clerk's smaller build
}),
```

- `API_ORIGIN` is the API's **bare origin** (`https://api.example.com`), not the
  `/api`-prefixed `apiUrl`. It defaults to `''` (same origin).
- `apiOrigin`/`socketUrl` live in the environment files, like `apiUrl` (see
  "Environment config"); never hardcode them.
- `provideCharts` comes from `ng2-charts`, so add `ng2-charts` as a direct
  dependency of the app. Don't rely on it arriving through `ngx-graphs`.
- `ngx-forms` fields are Angular Material components and take the app's theme
  from "Design system: Ink & Signal". Skip the prebuilt-theme import in the
  package README; that's for apps without their own theme.
- `ngx-translations` needs at least `locales`/`defaultLocale` plus `dictionaries` or a
  `loader` — see "`ngx-translations`" below.
- `ngx-dates` has no dependency on `ngx-translations` (or any other package here) —
  `NGX_DATES_LOCALE` defaults to the browser's own language if left unset. The
  `useFactory` above is what makes a language switch update relative-time text
  too; skip it in an app with no `ngx-translations` setup.
- `ngx-forms` has the same `NGX_FORMS_LOCALE` token, deliberately **not** shown
  above — wiring it to `ngx-translations` the same way means a language switch changes
  which typed day/month order a date/time field's input accepts, not just
  wording, so it's an app's deliberate choice, not a default. See "`ngx-forms`"
  below.
- `ngx-auth`'s `authInterceptor` is added to the app's own `provideHttpClient(withInterceptors([...]))`
  call, not registered by `provideAuth()` itself — Angular only wants one `provideHttpClient()` call
  per app. `clerkPublishableKey`/`apiOrigin` live in the environment files, same as `apiOrigin`/
  `socketUrl` above.
- `waitAtStartup: false` and `sdkBuild: 'no-rhc'` are the house setting from `ngx-auth` 1.0.3 (see
  "`ngx-auth`" below). Older versions ignore both, and start-up then waits for the full Clerk SDK.
- `ngx-region-settings` needs no `app.config.ts` provider at all — `CurrentUserStore` is
  `providedIn: 'root'` already, and `UserSettingsStore`/`SystemSettingsStore` are feature-local
  (each settings page adds one to its own component `providers: []`, not app-wide). See
  "`ngx-region-settings`"
  below.

### How the libraries fit the design system

- **Selectors are `ngx-`** (`<ngx-dynamic-form>`, `<ngx-card-loader>`), so a
  template shows at a glance what is library and what is the app's own
  component.
- **Material-based packages** (`ngx-forms`) inherit the app theme directly.
- **Material-free packages** (`ngx-media`, `ngx-ai-tools`, `ngx-graphs`,
  `ngx-web-sockets`) read `--ngx-*` custom properties that default to the
  matching `--mat-sys-*` role, which the house stylesheet points at the brand tokens. They
  follow the app's look and every theme with no configuration. Set an `--ngx-*` variable only for a genuine one-off,
  and only to a token (`--ngx-chat-bubble-self-background: var(--mat-sys-tertiary-container);`),
  never a hex value: a theme has to be able to change it.
- **Library class names follow "Component SCSS class naming"**
  (`.CardLoader-header`, `.ChatMessageBubble.is-self`). Don't restyle a library
  component's internals from an app stylesheet. If you need to, an input or an
  `--ngx-*` variable is missing: add it to the library instead.

### Using each package

**`ngx-api-client`**

- Each feature keeps its own typed `*ApiService`. `ApiClientService` owns the
  HTTP mechanics (GET/POST/PUT/DELETE, envelope unwrap, link guard). URL
  construction and "reload the list after a mutation" stay in the feature
  service.
- Follow the API's HATEOAS links: show an action only when
  `LinkService.hasLink(…)` is true, and call it through
  `api.requireLink(link, message)`. Never build a mutation URL by hand.
- `resource()`/`collectionResource()` already read through `hasValue()`: a
  failed request gives `undefined`/`[]` plus `error()`, never a throw. Render
  `error()` in a `role="alert"` banner. The `httpResource` gotcha (section 6)
  still applies to any raw `httpResource` an app writes itself.
- The envelope's `_messages` (notices the server wants shown next to the data)
  are `resource().messages()` / `collectionResource().messages()`, typed
  `ApiMessage[]`. When a write's reply carries messages or metadata the screen
  needs, use `api.send('POST' | 'PUT' | 'PATCH', url, payload)`, which keeps the
  whole envelope, instead of `post`/`put`/`patch` (from 1.0.2).
- **Error text always comes from the package, never from the error body by
  hand.** A failed write's banner is `apiErrorMessage(error)` (from 1.0.3): the
  API's own words, or `null` when it never answered (network failure, a
  non-API body), in which case show the app's own "couldn't reach the server"
  text — e.g. `apiErrorMessage(error) ?? t('errors.network')`. To put server
  validation errors on form fields, `fieldErrorsByField(body)`; for a
  one-line summary of a body you already hold, `summarizeApiError(body)`.
  Both read both shapes of a Wiltech (FastAPI) error — a business rule's
  `{"detail": "…"}` and a `422`'s `{"detail": [{loc, msg}]}` list — so no app
  reads `error.error.detail` itself. The package README's "Errors" section shows
  what each shape becomes.
- **File downloads** (an export, a generated document) go through
  `api.download(url)`, which returns `{ blob, filename }` with the name read from
  `Content-Disposition`, then `saveDownload(download, fallbackName)` (from 1.0.4).
  A failed download rethrows with its JSON body parsed, so `apiErrorMessage()`
  reads it like any other error. No app-local `HttpClient` blob call.
- Options from API metadata: `MetadataService.resolveMetadataIdValues()` for a
  select's options, and the `convertIdToValues` pipe to display a stored id as
  its label.

**`ngx-forms`**

- Describe a form once with `formConfig<T>()`; a misspelled field name is a
  compile error. Validation lives in that config (turned into Signals Forms
  rules by `toSchema()`), never in the template or the component.
- Use `DynamicForm` for a plain create/edit form. When a form needs grouping or
  columns, place the individual field components in your own layout. Every
  field takes the same `[fieldDef]` + `[field]` inputs.
- `DynamicForm` adds no padding or background, and ends with right-aligned text
  **Clear** + filled **Save**. Name the actions after what they do
  (`clearLabel="Cancel"` when that button leaves the form, `submitLabel="Create group"`).
- The fields already use `appearance="outline"` and `subscriptSizing="dynamic"`
  and render their own label, hint and errors. Don't wrap them in another
  `mat-form-field`.
- The surface a form sits on (a white panel with a hairline, a step card) is the
  app's; the fields are the library's.
- Date/time fields display and parse in `dateTimeConfig.locale`, falling back to
  `NGX_FORMS_LOCALE` when a field doesn't set one — provide it in `app.config.ts`
  to change every field's default locale together (wire it to `ngx-translations` the
  same way as `NGX_DATES_LOCALE`, see "Setup" above). Leave it unset and every
  field keeps the package's own default (`'en-GB'`).

**`ngx-graphs`**

- Decide the form first (a few key numbers, a chart per metric, small multiples),
  then pick the component.
- Describe data with `graphConfig()` or `pointGraphConfig()`. Don't pass chart.js
  options or colours from the app. The library applies the chart recipe as its
  defaults: marks in `--app-chart-1`, grid and text from the theme's tokens, no legend
  for a single series, an `aria-label` summary and a table view. A canvas can't
  read CSS variables, so the library resolves the tokens at render time and
  redraws when the colour scheme changes.
- Several series or slices take the library's categorical palette. Categorical
  data colours are rule 1's allowed exception, so the app never supplies one.
- The plot is 280px tall and fills the available width; set `--ngx-graph-height`
  to change the height. Keep to six series (three on bubble/scatter). Past that
  the library warns: fold the rest into "Other" or use small multiples.
- The "Show data" toggle text comes from `NGX_GRAPHS_TEXT` — override it (e.g.
  wired to `ngx-translations`) to translate it; leave it unset and it stays English.

**`ngx-media`**

- A content loading state is a skeleton shaped like the content:
  `ContentLoader [lines]` for a text block, and `CardLoader` repeated for a
  list of cards (as many as the page usually shows). No bare "Loading…" text
  and no spinner for arriving content. A spinner is only for an action in
  flight (a Save in progress).
- Skeletons are decorative (`aria-hidden`). Put `aria-busy="true"` on the region
  being filled, and announce the result or error with the usual `role="status"`
  / `role="alert"`.
- `YoutubePlayer` takes a video id, never a URL or embed code.
- `<ngx-file-picker>` (from 1.0.1) picks one file by button or drop zone. It checks `accept` and
  `maxBytes` before reading the file and emits `picked` or `rejected` (`type` | `size`); every
  string is an input. `readAsBase64` is for APIs that take files in JSON, and `formatFileSize` for
  showing a limit.

**`ngx-ai-tools`**

- The AI accent has two jobs:
  - **Static AI markers** (an AI destination in the nav, an AI badge, an icon
    well) use `tertiary-container`, per the colour-role table.
  - **AI interaction surfaces**, where the user asks the AI something or reads
    its answer, use this package: `AiTextBox` for the prompt, `AiButton` to run
    it, `AiPanel` around the result, and `AiSparkleIcon` to mark it. The
    gradient's stops default to the theme's tokens, so it follows the brand colours and
    every theme.
- `AiButton` counts as the view's primary button. Don't put a second filled button
  beside it.
- `AiTextBox` needs a `label` (its accessible name); the placeholder isn't one.
- Generating content from a prompt: `AiGenerate`, with the app's generator wired once via
  `provideAiGenerator(() => ...)`. The generator calls the app's own backend, which holds the AI
  provider's key; never call a provider from the browser. `AiGenerate` emits `{ title, body }`; put
  it into `ngx-forms` fields (or wherever) yourself.
- The border's rotation is the one sanctioned ambient animation (see Motion).

**`ngx-web-sockets`**

- One socket per app: `WebSocketService` is root-provided. Join and leave rooms
  on it; never create a second connection per feature.
- `connected` is a signal. Event streams are `Observable`s; subscribe with
  `takeUntilDestroyed()`.
- `ChatRoom` is the chat thread and its composer. It fills the height it's
  given (`--ngx-chat-height`, 400px by default; `100%` inside a fixed-height
  shell). To switch rooms, render a fresh instance behind `@if`; don't change
  `roomName` on a live one.
- The server contract (event names and payloads) is in the package README. A
  backend has to match it.
- Connection status, the composer placeholder and transient status messages
  come from `NGX_CHAT_TEXT` — override it (e.g. wired to `ngx-translations`) to
  translate it; message _bodies_ are always app/server data either way.

**`ngx-translations`**

- Depend on `@wiltech-labs/ngx-translations` alone — never import `@jsverse/transloco`
  directly (the app's own `package.json` shouldn't list it). The engine
  underneath can change without any template or service call changing with it.
- Inject `TranslationsService` for logic (`translations.t(key, params)`, a `computed()`, a
  toast message); use the `t` pipe in templates (`{{ 'common.buttons.save' | t }}`).
  Both read live — a language switch shows up on the next read, nothing is
  cached stale.
- **Switching language never reloads the app.** `TranslationsService.setLocale(locale)`
  updates every `t()`/`t` pipe call and `formatDate()`/`formatNumber()`
  immediately; persisting the choice happens in the background afterward and
  never blocks or reverts the switch.
- Resolution order: this session's `setLocale()` choice, then the app's own
  `resolveLocale` (read reactively — a signed-in user's saved language,
  say), then `defaultLocale`. Provide `resolveLocale`/`persistLocale` in
  `provideTranslations()`, not as separate ad hoc code elsewhere.
- Translating an id from the API: key convention `'metadata.<field>.<id>'`
  (e.g. `translations.t('metadata.status.active')`), which pairs with `ngx-api-client`'s
  `MetadataService`/`convertIdToValues`.
- `formatDate()`/`formatNumber()` read `Intl` against the current locale
  directly — use them (or the `date`/`number` pipes with a locale that follows
  `TranslationsService.locale()`) rather than `LOCALE_ID`, which is fixed at bootstrap
  and can't react to a runtime switch.
- A missing translation key renders as the key itself, not a blank string —
  don't add a second fallback layer on top.

**`ngx-dates`**

- The `relativeTime` pipe ("5 minutes ago", "yesterday", "in 2 days") and
  `RelativeTimeService` for the same text from logic (a toast, a log line).
  Accepts a UTC instant string, a `Date`, or a `Temporal.Instant` — the same
  wire format `ngx-forms`' instant-date-time field uses, so a value read from
  that field needs no conversion first.
- Locale comes from `NGX_DATES_LOCALE`, not `LOCALE_ID` (fixed at bootstrap,
  can't react to a runtime switch). Wire it to `ngx-translations` in `provideTranslations()`'s
  setup above; without that wiring it defaults to the browser's own language
  and won't move when the app's language does.
- The pipe is impure and self-updates as real time passes (every second while
  under a minute old, hourly once it's day-or-older) — nothing else needs to
  trigger change detection for the displayed text to stay current.
- `ngx-dates` has no dependency on `ngx-translations`, or on any other package here —
  see "Inter-package deps" in root `CLAUDE.md` for why, if a package here ever
  seems like it wants to import another directly.

**`ngx-auth`**

- Packages up the shape this doc's own "Authentication (Clerk)" section above describes — an app
  using `ngx-auth` doesn't hand-roll that `AuthStore`/guard/interceptor itself, it imports them.
  `provideAuth({ clerkPublishableKey, apiOrigin })` starts Clerk from `provideAppInitializer`
  (never from a component constructor — see "Setup" above). The SDK is a lazy chunk of its own.
- **Don't make the first screen wait for Clerk** (from 1.0.3). By default start-up waits for the
  SDK, which on a slow phone connection is seconds of blank page. `waitAtStartup: false` renders at
  once. `authGuard` and `authInterceptor` both `await AuthStore.whenReady()`, so a guarded route still
  opens only once sign-in has resolved, and no API call goes out without its token.
- With `waitAtStartup: false`, an unguarded page with a signed-out version (a home page or a top bar
  with a **Sign in** button) waits for `AuthStore.isSettled()`, which is true once Clerk has loaded or
  failed. Show a loader until then, or a signed-in visitor sees **Sign in** flash first:
  `@if (!auth.isSettled()) { <ngx-content-loader /> } @else if (auth.isSignedIn()) { … }`.
- `sdkBuild: 'no-rhc'` loads Clerk's build without remotely hosted code: 822 KB raw against
  1.5 MB (measured 2026-11-11). It leaves out Clerk's captcha and Stripe billing, which an app on
  Clerk's hosted pages (the only sign-in this doc allows) never uses. Keep `'standard'` only if an app
  needs Clerk's bot protection on a sign-up the app itself hosts.
- `loadTimeoutMs` caps every wait for Clerk (start-up, the guard, the interceptor) for a page that
  must open without the sign-in service, such as a kiosk.
- `AuthStore.user`/`.session`/`.isSignedIn`/`.getToken()`/`.signIn()`/`.signOut()` — the same shape
  the "`AuthStore` shape" section above describes, just imported instead of hand-rolled. `signIn()`
  still redirects to Clerk's hosted Account Portal; never a `mount*` call — see the section above
  for why.
- `authGuard` is a `CanActivateFn` for the "gate everything but a public landing route" pattern the
  "Routing" section above describes. `authInterceptor` only attaches a token to a request whose URL
  starts with `NgxAuthConfig.apiOrigin` — it doesn't gate access, `authGuard` does that.
- `jwtTemplate`/`redirectTo` on `NgxAuthConfig` are both optional — see the package's own README for
  when a named JWT template is actually needed.

**`ngx-region-settings`**

- `CurrentUserStore` (root-provided): `/me` → its `userProfile` link → the profile, gated on
  `AuthStore.isSignedIn()` from `ngx-auth` — a sign-out clears the chain, a sign-in refetches it, no
  manual `ensureLoaded()`/`reset()` calls. `inject(CurrentUserStore)` anywhere; `.me()`/`.profile()`/
  `.loading()`/`.error()` signals, `.link(name)` for any other link the profile hands out.
- The `/me` path is the `NGX_ME_PATH` token (from 1.0.11, default `/api/me`). An API that serves
  its routes under area prefixes provides its own, e.g.
  `{ provide: NGX_ME_PATH, useValue: '/api/platform/me' }`.
- `UserSettingsStore`/`SystemSettingsStore` (feature-local — add one to the settings page's own
  component `providers: []`, not app-wide): follow `userSettings`/`systemSettings` off the current
  user's profile. `.settings()`/`.isLoading()`/`.error()`/`.notAvailable()` (profile loaded, no link
  handed out — this caller isn't allowed this screen) signals, `.options()` for `_metadata`-driven
  allowed values, `.save(payload)`/`.reset()`.
- Takes a real npm dependency on `ngx-api-client` and `ngx-auth` — the one sanctioned exception to
  "Inter-package deps" in root `CLAUDE.md` (both are kept strict foundation leaves, so it's safe from
  cycles). Don't read this as license to add a direct dependency between any other two packages here.
- Generic over the settings/profile payload shape (`CurrentUserStore<TMe, TProfile>`,
  `RegionSettingsStore<TSettings, TPayload>`) but defaults to a real, already-exercised API shape —
  most apps need zero type arguments. No label-translation or `isAdmin`-style helper: this package
  fetches and exposes state, an app maps/translates/authorizes at the call site.

**`ngx-modals`**

- `ModalService.open(component, config)` is the only way to open one — never call `MatDialog.open()`
  directly for a right-panel modal (a plain centered dialog that isn't this pattern is still fine
  via `MatDialog` directly). The content component takes a `data` input and injects `MatDialogRef`
  to close itself, exactly as it would if you'd opened it with `MatDialog` yourself.
- It can only be closed via its own close button or the content calling `MatDialogRef.close()` —
  Escape and a backdrop click are disabled on purpose, so a content component's
  `ModalContent.hasUnsavedChanges()` guard (optional; omit it when there's nothing to lose) can't be
  bypassed.
- `ModalCloseAction` (`Dismissed`/`Cancelled`/`Done`/`Created`/`Updated`/`Deleted`) is a starting
  vocabulary — `open()` and `ModalCloseResult` are both generic, define your own action enum when a
  modal's outcomes don't fit.
- Width is `--ngx-modal-width` (default `33vw`), full screen below the CDK's `XSmall` breakpoint —
  set the variable to change the default panel width app-wide, or pass `{ width: '...' }` per open.
  It docks right by default; pass `{ side: 'left' }` for a left-hand panel.
- `{ backdrop: false }` makes it modeless (the page behind stays usable) and `{ minimizable: true }`
  adds a minimize-to-bar button. Swap an open panel's content with `ModalService.update(ref, …)`
  instead of opening a second one.
- `ModalService.confirm(message, options?)` is the same Yes/No prompt the unsaved-changes guard
  uses, for anything else that wants it (a delete confirmation, say).

**`ngx-calendar`**

- Add `@fullcalendar/angular/skeleton.css` and `@fullcalendar/angular/themes/monarch/theme.css` to
  `angular.json` styles (and `@fullcalendar/angular` as a direct dependency). No palette file: the
  package maps the theme to `--mat-sys-*` itself.
- Events are instants (`startDateTime`/`endDateTime`, UTC `'YYYY-MM-DDTHH:mmZ'`), shown in the
  calendar's `timeZone` (default the user's). Map your own objects with `CalendarEventMapper`.
- A whole-day event (leave, a training day) sets `allDay` and carries dates, both ends included,
  not instants (from 1.0.1). Public holidays go in the `holidays` input as the API's
  `CalendarHoliday[]` (`wiltech-labs-holidays`' shape), not as fake events (from 1.0.3).
- Load only what's on screen: `rangeChange` emits the visible `{ start, end }` dates on first
  render and after every move or view change (from 1.0.2).
- The calendar only emits `eventSave`; apply the change to your own data.
- `NGX_CALENDAR_LOCALE` / `NGX_CALENDAR_TEXT` are resolver tokens; wire them to `ngx-translations`.

**`ngx-organization`**

- Feed `OrganizationChart` the API's flat `OrgItem[]` (or `OrgChartStore.items()` after
  `store.load(link)`). The API owns the structure rules; the chart doesn't validate.
- Add `panzoom` to `angular.json`'s `allowedCommonJsDependencies`.
- Read-only for now: a card click opens a modeless, minimizable left-hand `ngx-modals` panel (the
  chart stays usable; another click swaps its content) and emits `nodeSelect`.

**`ngx-notifications`**

- `provideNotifications(() => ({ fetchNotifications, dismissNotification, openNotification }))` —
  a **factory**, not a plain config object, because the callbacks run later (a poll tick, a dismiss
  click), outside any injection context — `inject()` anything you need once, inside the factory, and
  close over it. See its own README for the full recipe (resolving the `notifications` link,
  wiring `openNotification` to the router).
- `<ngx-notifications>` needs a projected `<ng-template let-notification>` — it has no idea what your
  notification's fields are called, so without one it falls back to a raw JSON dump (a debug view,
  not something to ship).
- Polling only, never websockets, default every 5 minutes (`pollIntervalMs` to override). No
  dependency on `ngx-api-client` — pull `fetchNotifications`'s link from `ngx-region-settings`'
  `CurrentUserStore.link('notifications')` yourself if you're already using that package.
- Text (`panelTitle`/`loading`/`empty`/`error`/`dismiss`/`close`/`triggerLabel`) comes from
  `NGX_NOTIFICATIONS_TEXT` — override it (e.g. wired to `ngx-translations`) to translate it; leave it
  unset and it stays English.

**`ngx-styles`**

- Not a component/service package — pure Sass, no `ng-packagr` build, no `app.config.ts` provider.
  Add `node_modules/@wiltech-labs/ngx-styles/src` to `angular.json`'s
  `stylePreprocessorOptions.includePaths`, then `@use 'breakpoints'`/`'spacing'`/`'ui'` from any
  stylesheet, resolved from `node_modules` instead of a local `src/styles` copy.
- `theme-colors.template.scss` belongs to the earlier Material 3 look (a generated palette). A
  new app doesn't need it: its colours are the brand tokens in `styles.scss` ("Design system:
  Ink & Signal", sections 3 and 4).
- `ui.state-layer` reads `--app-duration-short`/`--app-ease-standard` — set these yourself in your
  own `styles.scss` `:root` (the house `styles.scss` in "Design system: Ink & Signal" does); the package doesn't
  define them since they're app-owned motion constants, not `--mat-sys-*` tokens.

### Migrating an existing app

Work through what the app actually has:

- [ ] Local API envelope/link/metadata/error helpers → delete them and move each
      `*ApiService` onto `ApiClientService`. Mutation URLs come from links.
- [ ] Hand-written form markup and validators → `formConfig<T>()` with
      `DynamicForm` or the field components. Delete any local `forms` SCSS
      partial.
- [ ] Date inputs → one of the three date/time fields, chosen by meaning. Then
      convert `Date` logic following "Dates and times".
- [ ] "Loading…" text or spinners for content → `ngx-media` skeletons.
- [ ] Local chart components, chart palettes and direct `ng2-charts` markup →
      `ngx-graphs`. Keep `provideCharts` in `app.config.ts`.
- [ ] Ad hoc AI styling → `ngx-ai-tools` surfaces. Static AI markers stay
      `tertiary-container`.
- [ ] Socket services or `ngx-socket-io` → `ngx-web-sockets`.
- [ ] An app-local translation store, or raw Transloco use → `ngx-translations`. Remove
      `@jsverse/transloco` from the app's own `package.json` if it's there.
- [ ] An app-local "time ago" pipe → `ngx-dates`' `relativeTime` pipe. Wire
      `NGX_DATES_LOCALE` to `ngx-translations` if the app has it set up.
- [ ] Remove any `--ngx-*` override set to a hex value.
- [ ] Run the review checklist (section 7) on every screen touched, light and
      dark.

## Dates and times

Every date or time is one of three kinds. Choose the kind by what the value
means, not by what the picker looks like:

| Kind          | Examples                        | Wire and model format            | Compute with                                              | Form field             |
| ------------- | ------------------------------- | -------------------------------- | --------------------------------------------------------- | ---------------------- |
| Business date | Birthday, holiday, due date     | `'YYYY-MM-DD'`                   | `Temporal.PlainDate`                                      | `BusinessDateField`    |
| Business time | Opening hours, a daily schedule | `'HH:mm'`                        | `Temporal.PlainTime`                                      | `BusinessTimeField`    |
| Instant       | Meeting, deadline, "created at" | UTC ISO `'YYYY-MM-DDTHH:mm:ssZ'` | `Temporal.Instant` (`ZonedDateTime` to show it in a zone) | `InstantDateTimeField` |

- **Strings everywhere except where you compute.** Models, API payloads, signals
  and form values hold the string. Parse to `Temporal` only to compare,
  add/subtract, diff or convert zones (`Temporal.PlainDate.from(s)`,
  `Temporal.Instant.from(s)`), then `.toString()` back.
- **Never store a business date as an instant.** Midnight UTC is the previous
  day west of Greenwich. Never store an instant without its `Z`.
- **No `Date` arithmetic**: no `getTime()` differences, no `setDate(d + 1)`, no
  date-fns/moment/luxon. `new Date()` is acceptable only as input to Angular's
  `date` pipe or a Material picker, and `ngx-forms` handles the picker case.
- **"Now"** is `Temporal.Now.instant()`, or `Temporal.Now.plainDateISO(zone)` for
  today's date. Code that depends on "now" takes it as a parameter or from an
  injectable, so tests can pin it.
- **Import `Temporal` from `temporal-polyfill`**, and add the polyfill as a
  direct dependency of the app when app code imports it. Don't rely on it
  arriving through `ngx-forms`.
- **Display**:
  - Angular's `date` pipe formats instants and business dates
    (`{{ createdAt | date: 'medium' }}`; it reads a `'YYYY-MM-DD'` string as a
    local date, so the day doesn't shift).
  - Business times: `Temporal.PlainTime.from(t).toLocaleString(locale, { hour: 'numeric', minute: '2-digit' })`.
  - Relative times: `ngx-dates`' `relativeTime` pipe, inside
    `<time [attr.datetime]="iso">` with the full timestamp in `title`.
  - All of the above take the locale from `ngx-translations`' `TranslationsService.locale()`
    in an app that has it (for `ngx-dates`, via `NGX_DATES_LOCALE` — see
    "Setup" above), not a hardcoded locale string.
- **Time zones**: show instants in the user's zone by default. A feature tied to
  a place (a flight, a branch, an event venue) shows that place's zone and
  labels it, the same as `InstantDateTimeField`'s `dateTimeConfig.timeZone`.

## Authentication (Clerk)

Clerk is the auth provider, and **every app reuses one Clerk instance and one JWT template**, so a
new app needs nothing new in Clerk and one account signs in everywhere:

| | Value |
| --- | --- |
| Instance | `one-python-4861.clerk.accounts.dev` |
| Publishable key (`environment.clerkPublishableKey`) | `pk_test_b25lLXB5dGhvbi00ODYxLmNsZXJrLmFjY291bnRzLmRldiQ` |
| JWT template (`environment.clerkJwtTemplate`) = the API's `CLERK_AUDIENCE` | `wiltech-dev-api` |
| JWKS the API verifies against (`CLERK_JWKS_URL`) | `https://one-python-4861.clerk.accounts.dev/.well-known/jwks.json` |

The template carries `name` and `email`. An app that needs another claim (roles,
`email_verified`) adds it to the shared template, since the other apps ignore claims they don't
read, and treats it as optional in code. Because any account on the instance gets a valid token
for any app, an app that must not be open to all of them checks who the caller is (a list of
allowed addresses, a role, a membership), never just "signed in". Add each deployed UI's address
to the instance's allowed origins. The publishable key is public: it belongs in the bundle.

One gotcha hits every new app that reaches for
`@clerk/clerk-js`'s embedded UI:

- **Never call `clerk.mountSignIn()` / `mountUserButton()` / any other
  `mount*` method.** The npm build of `@clerk/clerk-js` ships _without_
  the embedded UI components bundle (that's only available through
  Clerk's React SDK) — a `mount*` call throws `Error: Clerk was not
loaded with Ui components` at runtime, not at build time, so it slips
  past a typecheck and a first glance. Headless/CI browsers make it
  worse: Clerk's own bot detection can withhold the UI chunk even where a
  mount call would otherwise render.
- **Use `clerk.redirectToSignIn({ redirectUrl })` instead** — a full-page
  redirect to Clerk's hosted Account Portal, then back to the app. It's
  the one sign-in entry point that doesn't depend on the missing UI
  bundle, and it behaves identically in a real browser and in Playwright.

### `AuthStore` shape

A root-provided `signalStore` (see Core rules) is the single source of
truth for "who is signed in":

- State holds the raw `user`/`session` from `Clerk['user']`/`Clerk['session']`
  — not a hand-rolled DTO. Read fields directly where needed:
  `user()?.primaryEmailAddress?.emailAddress`, `user()?.firstName`, etc.
- `isSignedIn = computed(() => session() != null)`.
- `init()` constructs `new Clerk(environment.clerkPublishableKey)`, calls
  `await instance.load()`, patches state, then `instance.addListener(...)`
  to keep it in sync going forward. Call `init()` once via
  `provideAppInitializer` in `app.config.ts` — **not** from the root
  component's constructor — so route guards and the HTTP auth
  interceptor never race a not-yet-loaded Clerk instance. (`ngx-auth`
  1.0.3 keeps that guarantee without blocking start-up: the load is one
  shared promise, `whenReady()`, which the guard and the interceptor
  await.)
- `getToken()` returns `(await clerk?.session?.getToken()) ?? null`, for
  the HTTP interceptor to attach as `Authorization: Bearer …`.
- `signIn()` calls `redirectToSignIn({ redirectUrl: window.location.href })`.
- `signOut()` calls `clerk?.signOut()`.

### Routing

Keep at least one route public (a landing/home page) instead of gating
the whole app behind sign-in in the root component — it gives the app
something to render, and something to smoke-test the Clerk wiring
against, before backend auth even enters the picture. Gate everything
else with a `CanActivateFn` guard (`authGuard`) that checks
`auth.isSignedIn()` and redirects home otherwise. Never reach for a
mounted/embedded sign-in widget on a route — see above.

### Testing

- Component/unit tests don't need to mock Clerk specifically — `init()`
  only runs from the app-level initializer, never from a component
  constructor.
- Playwright e2e: use `@clerk/testing/playwright`. `clerkSetup()` must run
  in its own Playwright `project` (not a function-based `globalSetup` —
  this is Clerk's documented requirement) to fetch a
  `CLERK_TESTING_TOKEN`; skip this and Clerk's bot detection can produce
  the exact same "Clerk was not loaded with Ui components" error in
  headless Chromium, even with the redirect-based flow above. Sign in
  with `clerk.signIn({ page, emailAddress })` — a server-side testing
  token that bypasses password/MFA entirely — rather than driving the
  hosted sign-in form through the UI.

## Environment config

- `src/environments/environment.ts` — dev defaults (used by `ng serve` and
  any build without an explicit `production` configuration). Points
  `apiUrl` at the local backend.
- `src/environments/environment.prod.ts` — swapped in for the
  `production` build configuration via `fileReplacements` in
  `angular.json`. `apiUrl` must point at the deployed backend URL.
- Import `environment` from `../environments/environment` (relative to
  the consuming file) — never hardcode API base URLs in
  services/components.
- These files hold non-secret config only (base URLs, feature flags) — no
  API keys or credentials, since they ship in the client bundle.

## Design system: Ink & Signal

The house look is **Ink & Signal**, first built in insurly: warm paper, near-black ink, hairlines
instead of shadows, one interaction colour and one accent, Space Grotesk headings over Inter. It
replaced a stock Material 3 look (Roboto, tonal surfaces, generated palettes) in November 2026,
because every app built from that came out looking like a settings screen.

This section is deliberately short. It gives a new app a **starting look** (one stylesheet and two
fonts), says how **themes** work, and sets a **floor** that every screen meets. It does not decide
the design of your screens: that is the job of the app's own `PRODUCT.md` and `DESIGN.md`, worked
out with the `impeccable` skill and the `frontend-design` plugin (see "Design tooling").

### 1. Who decides what

In this order, the first that speaks wins:

1. **The app's `PRODUCT.md` and `DESIGN.md`.** An app that has its own brand colour, typeface,
   layout or signature component uses it. Record it in `DESIGN.md` so the next screen matches.
2. **The design direction for the surface**, from `/impeccable` (`shape`, new work, `critique`,
   `polish`...) or the `frontend-design` plugin. Let them make the screen distinctive: an
   unexpected layout, a signature component, one authored moment of motion. Nothing in this
   section is a reason to turn that down.
3. **The house look below**, as the default when nothing above says otherwise. A new app that
   only changes the brand colour still looks like part of the family.
4. **The floor** (section 6) always applies, whatever the look: accessibility, spacing, tokens,
   responsiveness, minimal copy, the shared libraries.

"Looks like the rest of the family" is a default, not a goal. A screen that is clearer or better
looking than the house look, and meets the floor, is right.

### 2. The look

- **Warm neutrals.** The page is warm paper, text is a warm near-black, secondary text a warm
  grey. No cool grey, no pure black.
- **Lifted surfaces are white**, on the paper: cards, fields, menus. That contrast, not a tonal
  step, is what separates content from page.
- **Hairlines, not shadows.** Structure is a 1px sand line. One soft shadow is spent on the
  surface the person is working on, and nowhere else.
- **Two signals.** The brand colour means "you can act here": links, the primary button, focus,
  the selected option. The accent has one meaning per app (in insurly, "this is done") and
  covers very little of a screen.
- **Space Grotesk at 600 with tight tracking** for headings, labels and any number read as
  information; **Inter** for everything read in sentences.
- **Soft rectangles.** 14px on cards, 10px on controls, a full pill on stand-alone buttons.
- **Chrome is hand-built**, on the brand tokens: the bar, navigation, landing and hero areas,
  signature components. **Angular Material is for controls**: fields, selects, buttons, chips,
  menus, dialogs, progress. It is themed to match, never restyled from inside a component.
- **Light by default.** Dark is a theme an app chooses to offer (section 4), not a requirement.

What made the old look dated, so you can spot it coming back: thin 400-weight headings in a
default face, pale tonal containers generated from a palette, grey-on-grey surfaces with no
white, a hint under every field and a subtitle under every title.

### 3. Foundations

Angular 22, SCSS, standalone; `npm i @angular/material @angular/cdk @wiltech-labs/ngx-styles`.

**`angular.json`** → `build.options`:

```json
"styles": ["src/styles.scss"],
"stylePreprocessorOptions": {
  "includePaths": ["src/styles", "node_modules/@wiltech-labs/ngx-styles/src"]
}
```

**`src/index.html`** `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
<!-- Icons: Material Symbols, outlined; only the fill axis varies. display=block keeps the
     ligature name from flashing as text. -->
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block"
  rel="stylesheet"
/>
```

and in `app.config.ts`:
`{ provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } }`.

**`src/styles/_space.scss`** (the two spaces between components, section 6):

```scss
// Things that belong together: a form's fields, the cards of a list, the blocks of a panel.
$group: 20px;

// Things that don't: a page's header, its panels, its lists.
$section: 40px;
```

**`src/styles.scss`**. This is the whole look. It was checked on a real app in light and with the
dark block switched on: Material controls, `ngx-forms` fields, `ngx-components` cards and
`ngx-ai-tools` panels all follow it with no change to any component.

```scss
// The Wiltech house look ("Ink & Signal", first built in insurly): warm paper, near-black ink,
// hairlines instead of shadows, one interaction colour and one accent, Space Grotesk over Inter.
//
// How it is put together:
//   1. `mat.theme()` gives Angular Material (and the `@wiltech-labs/ngx-*` packages, which read
//      the same variables) a complete set of `--mat-sys-*` tokens.
//   2. The brand tokens below are the theme. Components read them, or the `--mat-sys-*` tokens.
//   3. The `--mat-sys-*` tokens that carry the look are pointed at the brand tokens, so Material
//      controls match, and a theme is only a different block of brand tokens (see the end).
@use '@angular/material' as mat;
@use 'breakpoints' as bp;
@use 'space';

html {
  color-scheme: light;

  @include mat.theme(
    (
      color: (
        primary: mat.$violet-palette,
        tertiary: mat.$orange-palette,
      ),
      typography: (
        plain-family: (
          Inter,
          system-ui,
          sans-serif,
        ),
        brand-family: (
          'Space Grotesk',
          Inter,
          system-ui,
          sans-serif,
        ),
        regular-weight: 400,
        medium-weight: 500,
        bold-weight: 600,
      ),
      density: 0,
    )
  );

  -webkit-text-size-adjust: 100%;
  accent-color: var(--brand);
  caret-color: var(--brand);
  scrollbar-color: var(--line-strong) transparent;
}

:root {
  // ---- The theme: brand tokens ------------------------------------------------------------
  // Neutrals are warm, never a cool grey or pure black.
  --ink: #17171c; // text and headings
  --ink-soft: #37373f; // lead paragraphs
  --muted: #66646d; // hints, captions, metadata
  --paper: #f7f5f1; // the page
  --paper-sunk: #efece4; // recessed fills
  --surface: #ffffff; // lifted surfaces: cards, fields, menus
  --line: #e7e3da; // hairlines and card outlines
  --line-strong: #d8d3c8; // borders of things you can press

  // Two signals. The brand colour means "you can act here"; the accent is spent on one meaning
  // per app (in insurly: "this is done").
  --brand: #4f46e5;
  --brand-strong: #4338ca; // hover and pressed
  --brand-tint: #edecfd; // selected and current
  --on-brand: #ffffff;
  --accent: #ff6a3d;
  --accent-tint: #ffe9e1;

  --radius: 14px; // cards and containers
  --radius-sm: 10px; // controls
  --radius-pill: 999px; // stand-alone buttons
  // Flat with a hairline at rest; the soft shadow is for the one surface being worked on.
  --shadow-sm: 0 1px 2px rgb(23 23 28 / 6%);
  --shadow-md: 0 1px 2px rgb(23 23 28 / 6%), 0 14px 34px -18px rgb(23 23 28 / 28%);

  --font-brand: 'Space Grotesk', Inter, system-ui, sans-serif;
  --font-body: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;

  // ---- Layout and motion ------------------------------------------------------------------
  --app-page-max-width: 1120px;
  --app-shell-max-width: 1280px;
  --app-gutter: 16px;
  --app-bar-height: 64px;
  --app-space-group: #{space.$group};
  --app-space-section: #{space.$section};
  --ngx-form-gap: var(--app-space-group);

  --app-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --app-ease-decelerate: cubic-bezier(0.16, 1, 0.3, 1);
  --app-ease-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --app-duration-short: 150ms;
  --app-duration-medium: 280ms;

  @include bp.up(sm) {
    --app-gutter: 24px;
  }

  // ---- Angular Material, pointed at the brand tokens --------------------------------------
  --mat-sys-primary: var(--brand);
  --mat-sys-on-primary: var(--on-brand);
  --mat-sys-primary-container: var(--brand-tint);
  --mat-sys-on-primary-container: var(--ink);
  --mat-sys-secondary-container: var(--brand-tint);
  --mat-sys-on-secondary-container: var(--ink);
  --mat-sys-tertiary: var(--accent);
  --mat-sys-tertiary-container: var(--accent-tint);
  --mat-sys-on-tertiary-container: var(--ink);

  --mat-sys-background: var(--paper);
  --mat-sys-surface: var(--surface);
  --mat-sys-surface-container-lowest: var(--surface);
  --mat-sys-surface-container-low: color-mix(in srgb, var(--paper) 60%, var(--surface));
  --mat-sys-surface-container: var(--paper);
  --mat-sys-surface-container-high: var(--paper-sunk);
  --mat-sys-surface-container-highest: color-mix(in srgb, var(--paper-sunk) 92%, var(--ink));
  --mat-sys-on-surface: var(--ink);
  --mat-sys-on-surface-variant: var(--muted);
  --mat-sys-outline: var(--line-strong);
  --mat-sys-outline-variant: var(--line);

  --mat-sys-corner-extra-small: 8px;
  --mat-sys-corner-small: var(--radius-sm);
  --mat-sys-corner-medium: 12px;
  --mat-sys-corner-large: var(--radius);
  --mat-sys-corner-extra-large: 20px;

  // ngx-components' Banner: an info message on the brand tint (its default is a fixed light blue).
  --ngx-components-banner-info-background: var(--brand-tint);
  --ngx-components-banner-info-text: var(--ink);

  // Headings: the brand face at 600 with tight tracking, wherever a type token is used.
  --mat-sys-display-large: 600 clamp(2.5rem, 5vw + 1rem, 3.75rem) / 1.05 var(--font-brand);
  --mat-sys-display-medium: 600 clamp(2rem, 4vw + 1rem, 3.25rem) / 1.1 var(--font-brand);
  --mat-sys-display-small: 600 clamp(1.75rem, 3vw + 1rem, 2.5rem) / 1.1 var(--font-brand);
  --mat-sys-headline-large: 600 clamp(1.5rem, 2.4vw + 1rem, 1.95rem) / 1.15 var(--font-brand);
  --mat-sys-headline-medium: 600 1.625rem / 1.2 var(--font-brand);
  --mat-sys-headline-small: 600 1.375rem / 1.2 var(--font-brand);
  --mat-sys-title-large: 600 1.25rem / 1.25 var(--font-brand);
  --mat-sys-title-medium: 600 1rem / 1.3 var(--font-brand);
  --mat-sys-title-small: 600 0.875rem / 1.3 var(--font-brand);
  --mat-sys-display-large-tracking: -0.03em;
  --mat-sys-display-medium-tracking: -0.02em;
  --mat-sys-display-small-tracking: -0.02em;
  --mat-sys-headline-large-tracking: -0.02em;
  --mat-sys-headline-medium-tracking: -0.02em;
  --mat-sys-headline-small-tracking: -0.02em;
  --mat-sys-title-large-tracking: -0.01em;
  --mat-sys-title-medium-tracking: -0.01em;
  --mat-sys-title-small-tracking: -0.01em;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100dvh;
  background: var(--paper);
  color: var(--ink);
  font: 400 0.9375rem / 1.55 var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-brand);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
}

a {
  color: var(--brand);
  text-underline-offset: 0.2em;
}

::selection {
  background: var(--brand-tint);
  color: var(--ink);
}

// Hand-built interactive elements: a 2px brand outline, 2px away.
:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;

  &.is-filled {
    font-variation-settings:
      'FILL' 1,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
}

.App-page {
  max-width: var(--app-page-max-width);
  margin: 0 auto;
  padding: var(--app-gutter);
}

.App-spacer {
  flex: 1 1 auto;
}

.App-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

// Numbers that are read as information line up digit for digit.
.App-numeric {
  font-family: var(--font-brand);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// ---- Themes -------------------------------------------------------------------------------
// A theme is a block of brand tokens. Everything above follows it, Material included.
// `@wiltech-labs/ngx-themes` sets `data-theme` on <html> and remembers the choice.
//
// html[data-theme='forest'] {
//   --brand: #1f7a4d;
//   --brand-strong: #17603c;
//   --brand-tint: #e3f3ea;
//   --accent: #c2410c;
//   --accent-tint: #fdeadd;
// }
//
// Dark is an app's decision, not a default. An app that offers it redefines the neutrals too:
//
// html[data-theme='dark'] {
//   color-scheme: dark;
//   --ink: #f3f1ec;
//   --ink-soft: #d9d6cf;
//   --muted: #a3a09a;
//   --paper: #141416;
//   --paper-sunk: #0e0e10;
//   --surface: #1c1c20;
//   --line: #2c2c31;
//   --line-strong: #3d3d44;
//   --brand: #8b85f5;
//   --brand-strong: #a5a0f8;
//   --brand-tint: #26244a;
//   --on-brand: #14141a;
//   --accent-tint: #44241a;
// }
```

How it works: `mat.theme()` still emits every `--mat-sys-*` token, so Angular Material and the
`@wiltech-labs/ngx-*` packages (which read those tokens) keep working. The tokens that carry the
look are then pointed at the brand tokens (`--mat-sys-primary: var(--brand)`), and the heading
type tokens are redefined in the brand face at 600. So there are two ways to read a value in a
component, and both are fine:

- a **brand token** (`var(--ink)`, `var(--line)`, `var(--brand)`, `var(--radius)`) in hand-built
  chrome;
- a **`--mat-sys-*` token** (`font: var(--mat-sys-title-large)`,
  `background: var(--mat-sys-surface-container-low)`), as the shared mixins in `ngx-styles`'
  `ui` do.

Sizes that depend on the app (`--app-page-max-width`, the bar's height) are yours to change.

### 4. Themes

A theme is **a block of brand tokens**. Everything else follows it: hand-built chrome, Material
controls and the `ngx-*` packages.

- **An app's own brand** (the usual case): change `--brand`, `--brand-strong`, `--brand-tint`,
  and the accent pair, in `:root`. Pick a brand colour that passes 4.5:1 against `--on-brand`
  and against `--surface`; make the tint about 8-10% of the brand on white.
- **Several themes at run time**: one `html[data-theme='name'] { ... }` block per theme, as at
  the end of `styles.scss`. `@wiltech-labs/ngx-themes` sets the attribute, offers the switcher
  and remembers the choice.
- **Dark**: an app that offers it adds a dark block that redefines the neutrals as well (the
  commented example), and sets `color-scheme: dark` so the remaining Material tokens follow.
  Check contrast in it; don't offer a dark theme nobody has looked at.
- **A tenant's colours** (white-label): set the same tokens from the tenant's settings at start
  up, on `document.documentElement.style`.

Because a theme can change any colour, **components never contain a colour value**: no hex, no
`rgb()`, except inside the token blocks of `styles.scss`. Translucent variants come from
`color-mix(in srgb, var(--brand) 12%, transparent)`.

### 5. Guidelines

Defaults that make a screen read as Ink & Signal. Depart from one when the design is better for
it (section 1).

**Colour**

- Brand for anything that responds to the pointer; brand tint for the selected or current
  thing. One primary (filled, brand) button per view.
- The accent keeps its one meaning. If a screen seems to need a third colour, it is probably
  doing too much.
- Errors use Material's error tokens (`--mat-sys-error`, `--mat-sys-error-container`), with
  words and an icon, never colour alone.

**Type**

| Job | Use |
| --- | --- |
| Landing or hero headline | `--mat-sys-display-medium` (one per page at most) |
| Page title (`h1`) | `--mat-sys-headline-large` |
| Section, card or panel title | `--mat-sys-title-large`; denser rows `--mat-sys-title-medium` |
| Body and lists | the body default (Inter 15px / 1.55); `--mat-sys-body-large` for a lead |
| Hints, captions, metadata | `--mat-sys-body-small` or `-medium` in `var(--muted)` |
| Buttons, chips, tabs | `--mat-sys-label-large` |
| A number that is information | Space Grotesk, tabular (`.App-numeric`) |

Set `letter-spacing` to the token's `-tracking` partner. Keep running text to 55-70 characters.
Sentence case everywhere. An uppercase tracked label is for status or position ("Step 2 of 5")
only; never stack one above a heading as decoration.

**Shape and depth**

- `--radius` for cards and containers, `--radius-sm` for controls, a pill for stand-alone
  buttons and status markers. Borders are 1px: `--line` for structure, `--line-strong` for
  things you can press.
- Flat with a hairline at rest. `--shadow-md` belongs to the one surface being worked on (the
  current step, the open form), not to every card.
- No glass or blur as decoration, no gradient text, no coloured side-stripe on cards.

**Layout and navigation**

- Mobile first; one centred column capped at `--app-page-max-width`; forms and reading columns
  narrower (about 640-720px). More space above a heading than below it.
- The bar is hand-built: sticky, on the paper, with a hairline under it. An app with a handful
  of destinations puts them in the bar; one with many (Crewly) uses a rail from medium windows
  and a drawer on a phone. Shape the navigation the app needs rather than copying another
  app's.
- Lists of records are rows on one surface with hairlines between them. Use cards when each
  item is a thing to pick or open, not as the default container. Never nest cards.

**Angular Material, themed to match**

| Control | Use |
| --- | --- |
| Primary action | `matButton="filled"`; secondary `matButton="outlined"`; tertiary plain `matButton` |
| Fields | `mat-form-field appearance="outline"`, through `ngx-forms` |
| Cards | `mat-card appearance="outlined"` (or `ngx-components`' `Card`): border, no shadow |
| Choices | chips, button toggles and radios; a radio "card" row for choices that need a sentence |
| Menus, dialogs, progress | Material's, as they come |

Theme Material only through tokens in `styles.scss` (system tokens, or a component's own
`--mat-*` tokens on a wrapper). Don't reach into Material's internal classes from a component.

**Motion**

- State changes about 150ms; an entrance about 280ms on `--app-ease-decelerate`, opacity with a
  short upward settle.
- One authored moment per view (a step completing, a result arriving), not an animation on
  every element, and nothing that loops on its own. The exception is the rotating gradient of
  `ngx-ai-tools` surfaces, which marks AI at work.

**Copy**

- **Minimal.** A page intro is one short line. Extra explanation goes in an info tooltip, not a
  paragraph. A hint appears under a field only when it prevents a mistake; a subtitle only when
  the title can't carry the meaning alone.
- Sentence case. Buttons name the action (**Save**, **Add app**, **Delete**), and the same word
  runs through the flow.
- Empty states say what to do next. Errors say what happened and what to try, and don't
  apologise.
- Nothing invented: no made-up customers, numbers or claims in interface or marketing copy.

### 6. The floor

Whatever the look, every screen meets these.

**Spacing**

- Two spaces between components, as Sass tokens in `src/styles/_space.scss` (`@use 'space';`):
  `space.$group` (20px) between things that belong together (a form's fields, the cards of a
  list, the blocks of a panel, a section heading and its content) and `space.$section` (40px)
  between things that don't (a page's header, its panels, its lists). A page root and every
  panel holding more than one block are flex columns with one of the two as their `gap`;
  nothing adds margins on top. `ngx-forms` spaces fields by `--ngx-form-gap`, set to the group
  space.
- Group before you space: a page is a few groups a section apart, each a flex column with the
  group space inside. Seven blocks all a section apart read as seven unrelated things.
- Controls belong with the block they act on (a filter, a date range, a create button, tabs): a
  group's space from it, not a section's.
- Inside a component (a title and its line, an icon and its label) spacing stays tight on the
  4px grid. Buttons side by side are 8px apart.
- Render nothing rather than an empty element in a stack: it still takes a `gap` on each side.
- A long form flows into columns once there is room (`--ngx-form-columns`, `ngx-forms` 1.0.7+),
  with the fields ordered so each row reads as a group.

**Responsive**

- Mobile first: base styles are the phone, `bp.up()` layers on the rest. No horizontal scroll at
  390px; content capped on wide screens (check 1920px as well as 1280px).
- Touch targets at least 48px. A list row's actions sit under its text on a phone.

**Accessibility**

- Text contrast at least 4.5:1 (3:1 for large text), in every theme the app offers.
- Visible keyboard focus on everything interactive: Material draws its own; hand-built elements
  get the global `:focus-visible` outline or `ui.focus-ring`.
- Current destination: `routerLinkActive` + `ariaCurrentWhenActive="page"`.
- Icon-only buttons need `aria-label` and `title`. Never put meaning only in an icon or only in
  a colour.
- Errors `role="alert"`; progress and results `role="status"`.
- Landmarks: `header`, `nav` with a label, `main`, sections with a heading. One `h1` per page.
- A modal traps focus, restores it, and closes on Escape.
- `prefers-reduced-motion` is honoured (the global rule in `styles.scss`).

**Tokens and libraries**

- Colour, radius, shadow and type come from tokens (section 3). No colour values in components.
- Nothing re-implements a shared library (API client, form fields, loaders, charts, AI
  surfaces, sockets); see "Shared libraries".
- Component classes follow "Component SCSS class naming".

### 7. Designing a screen

1. `/impeccable init` once per app, so `PRODUCT.md` says who it is for and what it must never
   claim.
2. For a new screen or a redesign, describe it and let `/impeccable` (or `/impeccable shape
   <screen>` for a plan first) and the `frontend-design` plugin set the direction. Start from
   the house look unless `DESIGN.md` says otherwise.
3. Build it on the tokens. When the app has a few real screens, `/impeccable document` records
   its look in `DESIGN.md`.
4. Look at it before calling it done: 390px and 1280px, each theme the app offers, with real
   data, the empty state and a failed request. Then `/impeccable critique` or `polish`.

Because most screens sit behind sign-in, look at them with a throwaway harness rather than by
hand: a scratch copy of the app (outside the repo) whose `AuthStore` is replaced by a stub that
reports "signed in", against the real API run locally or Playwright routes returning fixture
envelopes.

### 8. Moving a Material 3 app to this look

The older apps were built on the previous section (Roboto, a generated palette in
`_theme-colors.scss`, tonal surfaces). Most of the change is the stylesheet:

1. Swap the fonts in `index.html` and replace `styles.scss` with the one above, keeping the
   app's own `.App-*` helpers and `--app-*` variables. Delete `_theme-colors.scss`.
2. Components that read `--mat-sys-*` tokens pick up the new look as they are. Then fix what
   the old look hid:
   - `--mat-sys-outline` is now a border colour: text that used it (a footer, a caption) moves
     to `var(--muted)`;
   - the bar and navigation move from `--mat-sys-surface` (now white) to `var(--paper)` with a
     hairline;
   - grouped lists and panels on `surface-container-low` usually read better as white surfaces
     with a `--line` border.
3. Cut the text: intros to one line, hints only where they prevent a mistake.
4. Run a `/impeccable critique` on the main screens and decide what deserves a real redesign.

### 9. Gotchas

- **`matIconButton` has no filled appearance**; `matButton` has `"filled" | "tonal" |
  "outlined" | "elevated"` (text is the default).
- **Button colours come from component tokens.** A plain `color: var(--mat-sys-error)` on a
  `matButton` doesn't reliably win: set the button's tokens (`ui.danger-button`). Menu items
  likewise: `--mat-menu-item-label-text-color` / `-icon-color`.
- **`mat-tab-nav-bar` requires `[tabPanel]`** (a `mat-tab-nav-panel`).
- **A routed component's host element is the flex item**, not the root `div` inside it. If its
  content must scroll inside a fixed-height shell, give the host
  `:host { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }`.
- **Put `position: sticky` on the component's host**, not an element inside it: a sticky
  element only stays put within its parent's box.
- **`white-space: pre-wrap` shows the template's leading space.** For user text use `pre-line`,
  or keep the interpolation tight.
- **Component style budget** (4 kB warning per stylesheet): delete dead rules and lean on the
  shared mixins.
- **Icons:** Material Symbols names, never the legacy aliases; a filled state with `is-filled`.
- **A failed `httpResource` throws from `value()`.** Read through a guard
  (`res.hasValue() ? res.value() : undefined`); `ngx-api-client`'s `resource()` and
  `collectionResource()` already do.
- **Unit tests run without `matchMedia`**, so `BreakpointObserver` never reports a phone. Stub
  the auth store with a provider rather than patching it.
- **Screenshot full pages at the height you need.** A Playwright `fullPage` capture of a page
  taller than the viewport draws sticky and fixed elements in the wrong place; use a viewport
  tall enough, or `clip`.
- **Keep the class names your specs query** when restyling.

### 10. Review checklist

- [ ] Looks right at 390px and 1280px, in each theme the app offers, with real data, an empty
      state and a failed request (500).
- [ ] No colour values in components; brand or `--mat-sys-*` tokens only.
- [ ] One primary button per view; brand means "you can act here"; the accent keeps its meaning.
- [ ] Headings in the brand face at 600; body in Inter; no thin default-weight headings.
- [ ] Hairlines at rest; at most one lifted surface.
- [ ] Spacing is the two tokens (20px grouped, 40px between groups); no stray margins.
- [ ] Copy: one-line intro, hints only where they prevent a mistake, sentence case, buttons
      name the action.
- [ ] `h1` once; landmarks and labels correct; icon-only buttons labelled; visible focus.
- [ ] Errors `role="alert"`, results `role="status"`; banners use `apiErrorMessage()`.
- [ ] Nothing re-implements a shared library; no `--ngx-*` variable set to a colour value.
- [ ] Dates: string models in the right kind, `Temporal` for arithmetic.
- [ ] Reduced motion respected; nothing animates on its own.
- [ ] Production build shows no new budget warnings; Prettier clean on touched files.

## Component SCSS class naming

Every class in a component stylesheet is namespaced with the component's
class name (PascalCase, exactly as it appears in the `.ts`), then a
single **flat, kebab-case suffix**. No BEM `__` / `--`, no SMACSS-style
nesting past one level. Example — component class `UserDashboard`, in
`user-dashboard.scss`:
`.UserDashboard { &-container {} &-header {} &-section-header {} &-section-header-label {} }`.

- **One** root `.ComponentName { }` block. Inside it, `&-…` selectors go
  two levels deep at most:
  1. the flat, kebab-case suffix (`&-container`, `&-rows`);
  2. one nested selector on _that_ element for its own state or
     pseudo-class/element — `&:hover`, `&.is-active`,
     `&.is-active::after`, `&:hover, &.is-open`.
     A trailing pseudo-class or child/descendant combinator written
     directly on the level-1 selector (`&-edit:hover`, `&-rows > div`,
     `&-rows dd`) still counts as level 1, not a nested rule.
     **Never nest a third level of `&`.**
- Prefer giving an element **its own** `is-*` state class over reaching
  across to a relative's — bind it in the template alongside whatever
  else already drives the state (e.g. a chevron that flips with its
  button's menu: `[class.is-open]="trigger.menuOpen"` on the `<svg>`
  itself, not just the `<button>`). That keeps the selector a plain
  level-2 compound (`&.is-open`) and the CSS doesn't need to know the
  parent's markup. Reach for a **descendant** selector — the other side
  spelled out as a full class name rather than `&`, e.g. inside
  `&-chevron { }`: `.ComponentName-toggle.is-open & { }` — only when you
  don't control the other element's template (a third-party
  component-library host class, say).
- Anything that would need a third level, or a compound/descendant
  selector that doesn't fit the level-2 shapes above (a library class on
  an unrelated element, say), goes in a **separate top-level block with
  the full class name** instead —
  `.ComponentName-count-toggle.mat-button-toggle-group { }` — never a
  deeper nested `&`. Rationale: every selector for a component still
  greps by the component name and sorts together, and a flat block can
  be moved or renamed without untangling nested `&`.
- **Responsive overrides are mobile-first and stay inside the `&-…`
  block they affect** — never collected into a separate `@media` section
  elsewhere in the file. Base declarations in the block target the
  smallest viewport; `@include bp.up($breakpoint) { … }` (see shared
  mixins below) layers on wider-viewport overrides right next to the
  property they change, e.g.
  `&-container { padding-left: 10px; @include bp.up(md) { padding-left: 20px; } }`.
  This is a mixin call, not a selector nesting level, so it doesn't count
  toward the two-levels-deep limit above.
- Flatten former BEM parts straight into the suffix: `.stat__value` →
  `.ComponentName-stat-value`; `.board-state--error` →
  `.ComponentName-board-state-error`; camelCase → kebab-case
  (`errorDot` → `error-dot`).
- Exception — dynamic **state classes** stay unprefixed and shared:
  `is-active`, `is-open`, `is-done`, `is-current`, `is-locked`. They only
  appear in a compound/descendant selector against a namespaced class
  (`.SomeFeature-ledger-link.is-current`) and are toggled with
  `[class.is-current]` in the template.
- Shared style partials that aren't one component still take a single
  namespace: `account-shared.scss` → `.AccountPanel-…`,
  `steps/step-form.scss` → `.StepForm-…`, `admin-form.scss` →
  `.AdminForm-…`. Global helpers in `styles.scss` use `.App-…`
  (`.App-page`, `.App-spacer`).
- Shared mixins (`@include ui.page-title;`) are included on the component's
  **own** namespaced class — never `@extend`, never a global class.
- `:host`, `:host …`, bare element/attribute selectors and `@keyframes`
  are untouched — this rule is only about class names. (A routed component
  that must fill or scroll inside a shell needs a `:host { display: flex; … }`
  rule: its host element, not its root `div`, is the layout item.)

## Layout: mobile-first, max width, centered

This app is used from a phone as much as from a
desktop — layout is mobile-first (base styles target the smallest
viewport, wider-viewport rules layer on top via `bp.up()`, never the
reverse), and content never stretches edge-to-edge on a wide monitor.

- **Two widths, two jobs.** `--app-shell-max-width` (`1280px`) caps the whole
  shell — the app bar's contents, the navigation rail and the page column sit
  in one centred column, so on a 24" or 27" monitor the menu and the account
  button don't end up at opposite edges of the screen. Surfaces (the app bar's
  background) still run edge to edge; only their contents are capped.
  `--app-page-max-width` caps a page's content inside that column.
- `styles.scss` defines `--app-page-max-width` (`1120px`) and
  `--app-gutter` (`16px` on compact windows, `24px` from `sm` up) as the one shared source of truth, plus an
  `.App-page` utility class (`max-width: var(--app-page-max-width);
margin: 0 auto; padding: var(--app-gutter);`) and an `.App-spacer`
  utility (`flex: 1 1 auto`, for pushing a flex sibling to the far end —
  the app bar uses it to park the account button at the end).
- Apply `.App-page` to a route's top-level container **alongside** its
  own component class (`<div class="TodosShell App-page">`) instead of
  that component defining its own `max-width`/`margin: 0 auto`/`padding`.
  One shared constant beats a different ad hoc pixel value per page
  (pages used to hand-roll their own 1000px, 900px, 700px, … before this existed).
- Nested routes only need `.App-page` once, on the shared ancestor — e.g.
  a feature shell carries it, so the routed pages underneath it don't need
  their own.
- A page that's intentionally narrower than the app-wide width for its
  own reason (a compact profile card, a reading-width paragraph) keeps
  its own bespoke constraint instead of fighting `.App-page` — e.g.
  `ProfilePage` stays a deliberate 34rem column, and
  `Home-lead` caps at `60ch` for readable line length while its ancestor
  still carries `.App-page`. The rule `.App-page` replaces is "no shared
  system behind this number," not "every page must be identical width."
- An app-shell region that's meant to span the full viewport on purpose
  (the navigation rail, the app bar) is not "a page" and doesn't get
  `.App-page` — only the content region next to it does.
- A page that must fill the viewport (a chat) sizes itself from the shell's
  variables — `height: calc(100dvh - var(--app-bar-height) - 44px)` (44px is the
  footer) — and gives its routed component's host `display: flex` so the message
  list can scroll inside it.

## Shared SCSS mixins

Keep shared SCSS mixins in `src/styles/`, wired onto the Sass include
path via `stylePreprocessorOptions.includePaths: ["src/styles"]` in
`angular.json`'s `build.options` (needed once per app — without it,
`@use 'breakpoints' as bp;` from a component stylesheet won't resolve).
That import style — `@use 'breakpoints' as bp;` / `@use 'spacing';` —
works from any stylesheet once wired. Adjust the specific values below
per app.

- `breakpoints` (`sm: 600px`, `md: 840px`, `lg: 1200px`) exposes
  `bp.up($bp)` (min-width — the one to reach for, since layout is
  mobile-first) and `bp.down($bp)` (max-width, for the rare case a style
  needs to be capped instead of grown). Both accept a scale key or a raw
  length (`bp.up(700px)` when a one-off value doesn't match the named
  scale — don't force it onto the nearest key just to use a name).
  Replaces every raw `@media (min-width: …)` in component SCSS.
- `spacing` exposes `spacing.space($n)` — a 4px-unit multiplier
  (`spacing.space(2)` = 8px, `spacing.space(4)` = 16px) for paddings,
  margins and gaps instead of ad hoc pixel values.
- `ui` — building blocks from `ngx-styles` (page/section titles, supporting text,
  banner, state layer, focus ring, empty state, filled icon button, danger button).
  They read the theme's tokens, so they follow the house look; `@use 'ui';` then
  `@include ui.page-title;` on the component's own class.
- `space` — the app's two spaces between components (`space.$group`, `space.$section`;
  "Design system: Ink & Signal", section 6).
- No `forms` partial: form field layout and styling come from
  `ngx-forms` (see "Shared libraries"). Don't add a local
  `mat-form-field` layout partial.
