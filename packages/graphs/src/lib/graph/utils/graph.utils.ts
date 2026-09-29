import type { ChartData, ChartType } from 'chart.js';
import type { GraphDef } from '../interfaces/graph-definition';
import { DEFAULT_PALETTE } from '../constants/default-palette.constant';

/** Turns a `GraphDef` into the `data` chart.js/ng2-charts expects, applying a default palette
 *  when a series doesn't specify its own color. */
export function toChartData<TType extends ChartType>(graphDef: GraphDef): ChartData<TType> {
  const isSingleSeriesPerSlice = graphDef.series.length === 1 && graphDef.labels.length > 1;

  return {
    labels: graphDef.labels,
    datasets: graphDef.series.map((series, seriesIndex) => ({
      label: series.label,
      data: series.data,
      backgroundColor: series.color
        ? series.color
        : isSingleSeriesPerSlice
          ? graphDef.labels.map((_, sliceIndex) => DEFAULT_PALETTE[sliceIndex % DEFAULT_PALETTE.length])
          : DEFAULT_PALETTE[seriesIndex % DEFAULT_PALETTE.length],
      borderColor: series.color ?? DEFAULT_PALETTE[seriesIndex % DEFAULT_PALETTE.length]
    }))
  } as unknown as ChartData<TType>;
}
