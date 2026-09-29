# Next steps

Working notes on what's outstanding across the monorepo. Not published anywhere, just a
scratchpad so we don't lose track between sessions. Update as items land or priorities shift.

## Housekeeping (found while looking, not yet fixed)

- [ ] `CLAUDE.md` repo layout only lists `packages/api-client/` — `packages/forms/` exists and is
      under active development but isn't mentioned there.
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

## Align libraries with `docs/ANGULAR_APP_CONVENTIONS.md` (decided 2026-09-29)

The conventions doc's "Shared libraries" section now describes the libraries as they *should* be.
Bring the packages in line, then migrate the apps:

- [ ] Selectors `app-*` → `ngx-*` in every package (and every README/showcase usage).
- [ ] SCSS classes → the doc's `.ComponentName-suffix` + `is-*` rule (today kebab/BEM, e.g.
      `.card-loader__header`, `.chat-message-bubble--self`).
- [ ] `--ngx-*` variables default to the matching `--mat-sys-*` token, hex only as last fallback
      (media loaders, ai-tools gradient/surface, web-sockets chat colours), so dark mode works.
      Chat bubbles to match the doc's chat recipe (`primary-container` / `surface-container-high`,
      one `extra-small` corner).
- [ ] graphs: apply the chart recipe as defaults — `--app-chart-1` marks, M3 grid/text tokens resolved
      via `getComputedStyle` + redraw on colour-scheme change, no legend for one series, bar shape
      (≤24px, 4px top radius), `aria-label` summary + `<details>` table view. Later: peak label
      plugin, keyboard tooltips.
- [ ] ai-tools: gradient stops default to M3 tokens (tertiary/primary). Open question: the rotating
      border animates on its own, which conflicts with the doc's motion rule 8 — decide (e.g.
      animate only while busy, static otherwise; always static under reduced motion).
- [ ] a11y: loaders `aria-hidden`; chat input gets a real label, message list `aria-live="polite"`.
- [ ] forms: `DynamicForm`'s actions are Save/Clear; the doc's form recipe says Cancel/Save — decide.
- [ ] New package `ngx-dates`: `relativeTime` pipe on Temporal + `Intl.RelativeTimeFormat`.
- [ ] Add `.prettierrc` / `.editorconfig` matching the doc's Core rules.
- [ ] api-client: `resource()`/`collectionResource()` now guard with `hasValue()` (a failed request
      used to throw from `value()`) — bump + publish 0.1.6, then update consumers.

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
