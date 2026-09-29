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

## packages/graphs (new, not started)

- [ ] New package for data visualization — wraps `ng2-charts` (confirmed working well on Angular 22)
      rather than building charting from scratch.
      - Interfaces + a builder (matching the `formConfig<T>()` pattern already used in `packages/forms`)
        to describe a graph's data/series/labels once and generate the `ng2-charts` config from it,
        rather than callers hand-building chart.js data objects.
      - One component per graph type on top of that, Eg `BarGraph`, `PieGraph` — same idea as the
        `forms` package's one-component-per-field-type layout.
      - Follows the same new-package checklist as `api-client`/`forms`/`media`/`ai-tools` (see root
        `CLAUDE.md`): own `package.json`/`ng-package.json`/`tsconfig.json`, `src/public-api.ts`
        barrel, standalone components only, `@wiltech-labs/ngx-graphs` naming.

## Repo-wide

- [ ] No CI configured yet (build/typecheck/publish are all manual, per each package's README).
