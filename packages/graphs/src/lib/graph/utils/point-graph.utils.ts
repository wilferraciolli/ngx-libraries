import type { ChartData, ChartType } from 'chart.js';
import type { PointGraphDef } from '../interfaces/point-graph-definition';
import { MAX_POINT_SERIES } from '../constants/categorical-palette.constant';
import { FALLBACK_GRAPH_THEME, type GraphTheme } from '../theme/graph-theme';
import { seriesColor } from './series-color.utils';

let warned = false;

/** Turns a `PointGraphDef` into the `data` chart.js/ng2-charts expects, colouring series from the
 *  theme's categorical palette in order, each mark ringed in the surface colour so overlaps read. */
export function toPointChartData<TType extends ChartType>(
  graphDef: PointGraphDef,
  theme: GraphTheme = FALLBACK_GRAPH_THEME
): ChartData<TType> {
  if (graphDef.series.length > MAX_POINT_SERIES && !warned) {
    warned = true;
    console.warn(
      `[ngx-graphs] ${graphDef.series.length} point series: past ${MAX_POINT_SERIES}, overlapping ` +
        'series stop being distinguishable. Split them into small multiples.'
    );
  }

  return {
    datasets: graphDef.series.map((series, seriesIndex) => ({
      label: series.label,
      data: series.data,
      backgroundColor: seriesColor(theme, seriesIndex),
      borderColor: theme.surface,
      borderWidth: 2
    }))
  } as unknown as ChartData<TType>;
}
