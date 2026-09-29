// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Graph components — label/series-based (GraphDef)
export { BarGraph } from './lib/graph/components/bar-graph/bar-graph';
export { LineGraph } from './lib/graph/components/line-graph/line-graph';
export { PieGraph } from './lib/graph/components/pie-graph/pie-graph';
export { DoughnutGraph } from './lib/graph/components/doughnut-graph/doughnut-graph';
export { PolarAreaGraph } from './lib/graph/components/polar-area-graph/polar-area-graph';
export { RadarGraph } from './lib/graph/components/radar-graph/radar-graph';

// Graph components — x/y point-based (PointGraphDef)
export { BubbleGraph } from './lib/graph/components/bubble-graph/bubble-graph';
export { ScatterGraph } from './lib/graph/components/scatter-graph/scatter-graph';

// Graph interfaces
export type { GraphDef, GraphSeries } from './lib/graph/interfaces/graph-definition';
export type { PointDatum, PointGraphDef, PointSeries } from './lib/graph/interfaces/point-graph-definition';

// Graph builders
export { GraphConfigBuilder, graphConfig } from './lib/graph/builders/graph-config.builder';
export { PointGraphConfigBuilder, pointGraphConfig } from './lib/graph/builders/point-graph-config.builder';

// Graph utils
export { toChartData } from './lib/graph/utils/graph.utils';
export { toPointChartData } from './lib/graph/utils/point-graph.utils';

// Theme — the resolved M3 colours every graph draws with (for custom chart.js work alongside these)
export { GraphThemeService } from './lib/graph/theme/graph-theme';
export type { GraphTheme } from './lib/graph/theme/graph-theme';
