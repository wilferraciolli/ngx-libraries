import type { GraphTheme } from '../theme/graph-theme';

let warned = false;

/**
 * The colour for series (or slice) `index`, in the palette's fixed order. Past the last slot there
 * is no safe colour, so extra series fall back to the muted text colour — fold them into "Other"
 * or split into small multiples instead.
 */
export function seriesColor(theme: GraphTheme, index: number): string {
  if (index < theme.series.length) {
    return theme.series[index];
  }
  if (!warned) {
    warned = true;
    console.warn(
      `[ngx-graphs] ${index + 1} series/slices, but only ${theme.series.length} categorical colours ` +
        'are distinguishable. Fold the rest into "Other" or use small multiples.',
    );
  }
  return theme.mutedText;
}
