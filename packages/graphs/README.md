# @wiltech-labs/ngx-graphs

Shared Angular data-visualization components — all 8 non-mixed chart.js chart types, built on
`ng2-charts`/`chart.js`.

## Installation

```bash
npm install @wiltech-labs/ngx-graphs
```

Peer dependencies: `@angular/core`, `@angular/common` (both `^22`). `ng2-charts` and `chart.js`
are installed automatically as regular dependencies of this package.

Chart.js needs its controllers/elements registered once, app-wide, before any chart renders. Add
this to your `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideCharts(withDefaultRegisterables()),
  ],
};
```

## Usage — category graphs (`GraphDef`)

`BarGraph`, `LineGraph`, `PieGraph`, `DoughnutGraph`, `PolarAreaGraph` and `RadarGraph` all plot a
value per category. Describe the data with `graphConfig()`, then pass it to a graph component:

```ts
import { Component } from '@angular/core';
import { BarGraph, graphConfig } from '@wiltech-labs/ngx-graphs';

@Component({
  selector: 'app-sales-chart',
  imports: [BarGraph],
  template: `<ngx-bar-graph [graphDef]="salesByQuarter" />`,
})
export class SalesChartComponent {
  protected readonly salesByQuarter = graphConfig()
    .labels(['Q1', 'Q2', 'Q3', 'Q4'])
    .series('2025', [120, 150, 180, 210])
    .series('2026', [140, 170, 200, 240])
    .title('Sales by quarter')
    .build();
}
```

A single series spread across multiple labels (e.g. market share by region) renders each label as
its own color automatically — this is the common shape for `PieGraph`/`DoughnutGraph`/`PolarAreaGraph`:

```ts
import { PieGraph, graphConfig } from '@wiltech-labs/ngx-graphs';

protected readonly marketShare = graphConfig()
  .labels(['EMEA', 'APAC', 'Americas'])
  .series('Share', [45, 30, 25])
  .build();
```

```html
<ngx-pie-graph [graphDef]="marketShare" />
```

`RadarGraph` uses `labels` as its axes, one per spoke, with one or more `series` plotted across them:

```ts
import { RadarGraph, graphConfig } from '@wiltech-labs/ngx-graphs';

protected readonly modelComparison = graphConfig()
  .labels(['Speed', 'Reliability', 'Comfort', 'Safety'])
  .series('Model A', [65, 59, 90, 81])
  .series('Model B', [28, 48, 40, 19])
  .build();
```

The plot is 280px tall by default; set `--ngx-graph-height` on the graph (or an ancestor) to change
it. The graph fills the width it's given.

## Usage — point graphs (`PointGraphDef`)

`BubbleGraph` and `ScatterGraph` plot raw `(x, y)` points with no shared category axis, so they use
a different builder, `pointGraphConfig()`:

```ts
import { BubbleGraph, pointGraphConfig } from '@wiltech-labs/ngx-graphs';

protected readonly clusterSizes = pointGraphConfig()
  .series('Cluster A', [
    { x: 10, y: 10, r: 10 },
    { x: 15, y: 5, r: 15 },
    { x: 26, y: 12, r: 23 }
  ])
  .build();
```

```html
<ngx-bubble-graph [graphDef]="clusterSizes" />
```

`ScatterGraph` uses the same shape; `r` (bubble radius) is simply ignored.

## Graph types

| Component        | Chart.js type | Data shape      |
| ---------------- | ------------- | --------------- |
| `BarGraph`       | `bar`         | `GraphDef`      |
| `LineGraph`      | `line`        | `GraphDef`      |
| `PieGraph`       | `pie`         | `GraphDef`      |
| `DoughnutGraph`  | `doughnut`    | `GraphDef`      |
| `PolarAreaGraph` | `polarArea`   | `GraphDef`      |
| `RadarGraph`     | `radar`       | `GraphDef`      |
| `BubbleGraph`    | `bubble`      | `PointGraphDef` |
| `ScatterGraph`   | `scatter`     | `PointGraphDef` |

## `GraphDef`

```typescript
interface GraphSeries {
  label: string;
  data: number[];
}

interface GraphDef {
  labels: string[]; // categories (bar/line/radar axes) or slice labels (pie/doughnut/polarArea)
  series: GraphSeries[];
  title?: string;
}
```

## `PointGraphDef`

```typescript
interface PointDatum {
  x: number;
  y: number;
  r?: number; // bubble radius — ignored by ScatterGraph
}

interface PointSeries {
  label: string;
  data: PointDatum[];
}

interface PointGraphDef {
  series: PointSeries[];
  title?: string;
}
```

## Look and accessibility

Every graph applies the house chart rules itself, so an app passes data, never chart options or
colours:

- **Colour follows the app's M3 theme.** Series 1 wears `--app-chart-1` when the app defines it;
  further series take a fixed categorical palette validated for colour-vision deficiency in light
  and dark (six series; three for bubble/scatter, where every series can touch every other). Text,
  grid and tooltip use `on-surface`, `on-surface-variant`, `outline-variant` and `inverse-surface`.
  A canvas can't read CSS variables, so `GraphThemeService` resolves them and every graph redraws
  when the colour scheme, or the app's theme class/attribute on `<html>`/`<body>`, changes.
- **Marks:** columns ≤ 24px with 4px rounded tops and a square baseline; 2px lines; a 2px
  surface-coloured gap between slices and ring around points; horizontal grid only on bar/line.
- **Legend only when there's more than one thing to tell apart.** A single series is named by the
  graph's `title`, which renders as the figure caption.
- **Accessible:** the canvas has an `aria-label` summary, and a collapsed **Show data** table lists
  every plotted number.

Overrides, for a genuine one-off only and always to a token, never a hex value:
`--ngx-graph-color-1`…`-6`, `--ngx-graph-text`, `--ngx-graph-muted-text`, `--ngx-graph-grid`,
`--ngx-graph-surface`, `--ngx-graph-height`.

### Translating "Show data"

That toggle text comes from `NGX_GRAPHS_TEXT` (defaults to English), not a hardcoded string.
Override it once in `app.config.ts`, e.g. wired to [`@wiltech-labs/ngx-translations`](../translations):

```ts
import { inject } from '@angular/core';
import { NGX_GRAPHS_TEXT } from '@wiltech-labs/ngx-graphs';
import { TranslationsService } from '@wiltech-labs/ngx-translations';

{
  provide: NGX_GRAPHS_TEXT,
  useFactory: () => {
    const translations = inject(TranslationsService);
    return () => ({ showData: translations.t('graphs.showData') });
  }
}
```

No dependency on `ngx-translations` from this package — the resolver is a plain function, same as
`ngx-dates`' `NGX_DATES_LOCALE`.

## Other exports

- `toChartData(graphDef, theme?)` — converts a `GraphDef` into the chart.js `ChartData` shape
  directly, coloured from `theme` (a `GraphTheme`).
- `toPointChartData(pointGraphDef, theme?)` — the `PointGraphDef` equivalent.
- `GraphThemeService` / `GraphTheme` — the resolved colours and font, for custom chart.js work that
  should match these graphs.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/graph/
    ├── components/       # BarGraph, LineGraph, PieGraph, DoughnutGraph, PolarAreaGraph,
    │                     # RadarGraph, BubbleGraph, ScatterGraph; GraphFrame (caption + data table)
    ├── builders/          # graphConfig()/GraphConfigBuilder, pointGraphConfig()/PointGraphConfigBuilder
    ├── interfaces/        # GraphDef, GraphSeries, PointGraphDef, PointSeries, PointDatum
    ├── constants/         # CATEGORICAL_LIGHT/_DARK, MAX_POINT_SERIES
    ├── theme/             # GraphThemeService — resolves M3 tokens to concrete colours
    └── utils/             # toChartData(), toPointChartData(), graphOptions(), table/summary, seriesColor()
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/graphs
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
