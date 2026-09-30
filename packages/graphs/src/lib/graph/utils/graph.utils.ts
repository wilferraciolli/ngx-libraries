import type { ChartData, ChartType } from 'chart.js';
import type { GraphDef } from '../interfaces/graph-definition';
import { FALLBACK_GRAPH_THEME, type GraphTheme } from '../theme/graph-theme';
import { seriesColor } from './series-color.utils';

/**
 * Turns a `GraphDef` into the `data` chart.js/ng2-charts expects, colouring series from the theme's
 * categorical palette in order. `perCategory` colours each label instead (pie, doughnut, polar
 * area — the slices are the categories), separated by a 2px surface-coloured gap.
 */
export function toChartData<TType extends ChartType>(
  graphDef: GraphDef,
  theme: GraphTheme = FALLBACK_GRAPH_THEME,
  perCategory = false,
): ChartData<TType> {
  return {
    labels: graphDef.labels,
    datasets: graphDef.series.map((series, seriesIndex) =>
      perCategory
        ? {
            label: series.label,
            data: series.data,
            backgroundColor: graphDef.labels.map((_, labelIndex) => seriesColor(theme, labelIndex)),
            borderColor: theme.surface,
            borderWidth: 2,
          }
        : {
            label: series.label,
            data: series.data,
            backgroundColor: seriesColor(theme, seriesIndex),
            borderColor: seriesColor(theme, seriesIndex),
          },
    ),
  } as unknown as ChartData<TType>;
}
