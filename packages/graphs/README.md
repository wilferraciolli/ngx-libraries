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
    provideCharts(withDefaultRegisterables())
  ]
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
  template: `<app-bar-graph [graphDef]="salesByQuarter" style="display: block; height: 320px;" />`
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
<app-pie-graph [graphDef]="marketShare" style="display: block; height: 320px;" />
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

Give the host element an explicit height — chart.js fills whatever size its container reports.

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
<app-bubble-graph [graphDef]="clusterSizes" style="display: block; height: 320px;" />
```

`ScatterGraph` uses the same shape; `r` (bubble radius) is simply ignored.

## Graph types

| Component | Chart.js type | Data shape |
|---|---|---|
| `BarGraph` | `bar` | `GraphDef` |
| `LineGraph` | `line` | `GraphDef` |
| `PieGraph` | `pie` | `GraphDef` |
| `DoughnutGraph` | `doughnut` | `GraphDef` |
| `PolarAreaGraph` | `polarArea` | `GraphDef` |
| `RadarGraph` | `radar` | `GraphDef` |
| `BubbleGraph` | `bubble` | `PointGraphDef` |
| `ScatterGraph` | `scatter` | `PointGraphDef` |

## `GraphDef`

```typescript
interface GraphSeries {
  label: string;
  data: number[];
  color?: string;    // defaults to this package's built-in palette when omitted
}

interface GraphDef {
  labels: string[];  // categories (bar/line/radar axes) or slice labels (pie/doughnut/polarArea)
  series: GraphSeries[];
  title?: string;
}
```

## `PointGraphDef`

```typescript
interface PointDatum {
  x: number;
  y: number;
  r?: number;         // bubble radius — ignored by ScatterGraph
}

interface PointSeries {
  label: string;
  data: PointDatum[];
  color?: string;      // defaults to this package's built-in palette when omitted
}

interface PointGraphDef {
  series: PointSeries[];
  title?: string;
}
```

## Other exports

- `toChartData(graphDef)` — converts a `GraphDef` into the chart.js `ChartData` shape directly, for
  building one by hand instead of with `graphConfig()`.
- `toPointChartData(pointGraphDef)` — the `PointGraphDef` equivalent, for `pointGraphConfig()`.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/graph/
    ├── components/       # BarGraph, LineGraph, PieGraph, DoughnutGraph, PolarAreaGraph,
    │                     # RadarGraph, BubbleGraph, ScatterGraph
    ├── builders/          # graphConfig()/GraphConfigBuilder, pointGraphConfig()/PointGraphConfigBuilder
    ├── interfaces/        # GraphDef, GraphSeries, PointGraphDef, PointSeries, PointDatum
    ├── constants/         # DEFAULT_PALETTE
    └── utils/             # toChartData(), toPointChartData(), withTitle()
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
