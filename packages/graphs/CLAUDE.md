# @wiltech-labs/ngx-graphs

Shared Angular data-visualization components — wraps `ng2-charts`/`chart.js` rather than building
charting from scratch. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/graph/
    ├── components/
    │   ├── bar-graph/         # BarGraph          } GraphDef-based
    │   ├── line-graph/        # LineGraph         }
    │   ├── pie-graph/         # PieGraph          }
    │   ├── doughnut-graph/    # DoughnutGraph     }
    │   ├── polar-area-graph/  # PolarAreaGraph    }
    │   ├── radar-graph/       # RadarGraph        }
    │   ├── bubble-graph/      # BubbleGraph       } PointGraphDef-based
    │   └── scatter-graph/     # ScatterGraph      }
    ├── builders/               # graphConfig()/GraphConfigBuilder, pointGraphConfig()/PointGraphConfigBuilder
    ├── interfaces/             # GraphDef, GraphSeries, PointGraphDef, PointSeries, PointDatum
    ├── config/                 # NGX_GRAPHS_TEXT — GraphFrame's own overridable UI text
    ├── constants/              # CATEGORICAL_LIGHT/_DARK (validated palette), MAX_POINT_SERIES
    ├── theme/                  # GraphThemeService — resolves M3 tokens to concrete colours
    └── utils/                  # toChartData(), toPointChartData(), graphOptions(), table/summary, seriesColor()
```

## Conventions

- Real Angular constructs (`@Component`) — not framework-agnostic functions. Every known consumer
  is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per concern under `src/lib/graph/` — don't let it go flat. A new concern (e.g. an
  `axes/` folder for scale config, or a second graph family) gets its own folder.
- Standalone components only, no NgModules.
- `ng2-charts`/`chart.js` are regular `dependencies` of this package (not peers) — the same
  reasoning as `forms`' `temporal-polyfill`: this package controls the exact charting version it's
  built against, rather than asking every consumer to install/align it themselves. Both are listed
  in `ng-package.json`'s `allowedNonPeerDependencies` so `ng-packagr` doesn't flag them.
  `@angular/core`/`@angular/common` stay peers, same as every other package here.
- **Two data shapes, not one.** Most chart.js types plot a value per category
  (`bar`/`line`/`pie`/`doughnut`/`polarArea`/`radar`) — these use `GraphDef` (`labels` + `series`
  of `number[]`) via `graphConfig()`, converted by `toChartData()`. `bubble`/`scatter` plot raw
  `{x, y[, r]}` points with no shared category axis — these use the separate `PointGraphDef`
  (`series` of `PointDatum[]`) via `pointGraphConfig()`, converted by `toPointChartData()`. Don't
  force point data through `GraphDef` (or vice versa) just to have one interface — the two really
  are different shapes, chart.js treats them differently, and a `GraphDef` support forces fields
  (`labels`) that make no sense for a scatter plot.
- **The conventions doc's chart recipe is this package's spec** (`docs/ANGULAR_APP_CONVENTIONS.md`,
  "Insights / charts"). Apps pass data only — no chart options, no colours (`GraphSeries` has no
  `color`).
- A canvas can't read CSS variables, so `GraphThemeService` (`theme/`) resolves the M3 roles (and
  `--app-chart-1` for series 1) into concrete colours through a probe element's computed `color` —
  custom properties hold unresolved text like `light-dark(...)`. It re-resolves on
  `prefers-color-scheme` changes and on class/style/`data-theme` changes on `<html>`/`<body>`. A theme
  change made any other way (e.g. swapping a stylesheet) isn't detected.
- Colours come from `constants/categorical-palette.constant.ts`, in fixed order, never cycled — past
  the last slot `seriesColor()` warns and falls back to the muted text colour. The palette was
  validated with the dataviz skill's `validate_palette.js` (adjacent pairs, light and dark; first
  three all-pairs); re-run it on any change.
- `graphOptions()` (`utils/graph-options.utils.ts`) is the one place for shared chart.js options
  (scales by layout, legend only for > 1 entry, tooltip, fonts). `GraphFrame` (internal) renders the
  caption and the "Show data" table around every canvas — add shared markup there.
- **`GraphFrame`'s "Show data" text comes from `NGX_GRAPHS_TEXT`** (`InjectionToken<() =>
GraphsText>`, added 2026-09-30), not a hardcoded string — the one piece of this package's own UI
  text, everything else being app-supplied data. Same resolver-token pattern as `ngx-dates`'
  `NGX_DATES_LOCALE`/`ngx-forms`' `NGX_FORMS_LOCALE`: a plain function, so this package has no
  build-time dependency on `ngx-translations` (see root `CLAUDE.md`'s "Inter-package deps"). Read inside a
  `computed()` in `GraphFrame`, so a resolver wired to `ngx-translations` stays reactive to a language
  switch.
- One component per graph type (`BarGraph`, `LineGraph`, `PieGraph`, `DoughnutGraph`,
  `PolarAreaGraph`, `RadarGraph`, `BubbleGraph`, `ScatterGraph`), same one-component-per-type layout
  as `forms`' field components — resist the urge to collapse these into one generic component with
  a `type` input, even though most of them are nearly-identical thin wrappers; that's the deliberate
  pattern here, not duplication to clean up. Each wraps ng2-charts' `BaseChartDirective` on a
  `<canvas>` — nothing chart.js-specific should leak into a consumer beyond `GraphDef`/`PointGraphDef`.
- **Consumer setup**: chart.js v3+ requires its controllers/elements to be registered before any
  chart renders. This package does not call `Chart.register(...)` itself (that's an app-wide
  concern, not something to do per-library-import); the consuming app must add
  `provideCharts(withDefaultRegisterables())` (from `ng2-charts`) to its `app.config.ts` providers —
  documented in this package's README, same spirit as `api-client`'s `API_ORIGIN` token.

## Status

- All 8 non-mixed chart.js chart types covered: `BarGraph`, `LineGraph`, `PieGraph`,
  `DoughnutGraph`, `PolarAreaGraph`, `RadarGraph`, `BubbleGraph`, `ScatterGraph`.
- Not yet published to npm — under development.
- No consumers yet.
