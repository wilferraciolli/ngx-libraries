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
    ├── constants/              # DEFAULT_PALETTE — shared by both toChartData() and toPointChartData()
    └── utils/                  # toChartData(), toPointChartData(), withTitle() option helper
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
- Both `toChartData()`/`toPointChartData()` pull from the same `DEFAULT_PALETTE` constant
  (`constants/default-palette.constant.ts`) — add a new fallback color there, not in either util.
- `withTitle()` (`utils/graph-options.utils.ts`) is the one place that builds the shared
  `responsive`/`maintainAspectRatio`/title-plugin options every graph component computes from
  `graphDef().title` — add a new shared option default there, not by duplicating it across all
  8 components' `options` computed signals.
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
