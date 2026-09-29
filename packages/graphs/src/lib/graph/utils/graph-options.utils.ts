import type { ChartOptions, ChartType } from 'chart.js';

/** Shared option defaults (responsive, fills its container, optional title) for every graph type. */
export function withTitle<TType extends ChartType>(
  title: string | undefined,
  options?: ChartOptions<TType>
): ChartOptions<TType> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
    plugins: {
      ...options?.plugins,
      title: {
        display: !!title,
        text: title
      }
    }
  } as ChartOptions<TType>;
}
