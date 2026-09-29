import type { ChartData, ChartType } from 'chart.js';
import type { PointGraphDef } from '../interfaces/point-graph-definition';
import { DEFAULT_PALETTE } from '../constants/default-palette.constant';

/** Turns a `PointGraphDef` into the `data` chart.js/ng2-charts expects, applying a default palette
 *  when a series doesn't specify its own color. */
export function toPointChartData<TType extends ChartType>(graphDef: PointGraphDef): ChartData<TType> {
  return {
    datasets: graphDef.series.map((series, seriesIndex) => ({
      label: series.label,
      data: series.data,
      backgroundColor: series.color ?? DEFAULT_PALETTE[seriesIndex % DEFAULT_PALETTE.length],
      borderColor: series.color ?? DEFAULT_PALETTE[seriesIndex % DEFAULT_PALETTE.length]
    }))
  } as unknown as ChartData<TType>;
}
