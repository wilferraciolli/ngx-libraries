import type { ChartOptions, ChartType } from 'chart.js';
import type { GraphTheme } from '../theme/graph-theme';

/**
 * How a graph lays out its values, which decides its scales: `category` (bar, line — values from a
 * zero baseline, horizontal grid only), `point` (scatter, bubble — both axes are measures),
 * `radial` (radar, polar area) or `circular` (pie, doughnut — no scales).
 */
export type GraphLayout = 'category' | 'point' | 'radial' | 'circular';

/**
 * The house chart defaults every graph shares: text and grid in the theme's text/outline colours,
 * a recessive grid with no axis borders, an inverse-surface tooltip, and a legend only when there
 * is more than one thing to tell apart (a single series is named by the graph's title instead).
 * The title is rendered as the figure caption, not on the canvas.
 */
export function graphOptions<TType extends ChartType>(
  theme: GraphTheme,
  layout: GraphLayout,
  legendEntries: number,
  extra: ChartOptions<TType> = {} as ChartOptions<TType>
): ChartOptions<TType> {
  const font = { family: theme.fontFamily, size: theme.fontSize };
  const ticks = { color: theme.mutedText, font };

  const grid = { color: theme.grid, lineWidth: 1 };
  const scales =
    layout === 'category'
      ? {
          x: { grid: { display: false }, border: { display: false }, ticks },
          y: { beginAtZero: true, grid, border: { display: false }, ticks }
        }
      : layout === 'point'
        ? {
            x: { grid, border: { display: false }, ticks },
            y: { grid, border: { display: false }, ticks }
          }
      : layout === 'radial'
        ? {
            r: {
              grid: { color: theme.grid },
              angleLines: { color: theme.grid },
              pointLabels: { color: theme.text, font },
              // Ring values collide with the marks; the tooltip and table view carry them.
              ticks: { display: false }
            }
          }
        : undefined;

  return {
    responsive: true,
    maintainAspectRatio: false,
    color: theme.text,
    font,
    ...extra,
    ...(scales ? { scales } : {}),
    plugins: {
      ...extra?.plugins,
      title: { display: false },
      legend: {
        display: legendEntries > 1,
        position: 'bottom',
        labels: { color: theme.text, font, usePointStyle: true, boxWidth: 8, boxHeight: 8 }
      },
      tooltip: {
        backgroundColor: theme.tooltipBackground,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        titleFont: font,
        bodyFont: font,
        cornerRadius: 4,
        padding: 8,
        displayColors: legendEntries > 1
      }
    }
  } as ChartOptions<TType>;
}
