/**
 * Categorical series colours, light and dark steps of the same six hues, in a fixed order (never
 * cycled). Slot 1 is overridden by the app's `--app-chart-1` when it defines one. Validated as a
 * set: every adjacent pair clears the colour-vision-deficiency and normal-vision separation floors
 * in both modes, and the first three slots clear them for all pairs (scatter/bubble). Two light
 * slots sit below 3:1 on the surface, which the table view every graph carries relieves.
 * Re-validate if you change a value or the order.
 */
export const CATEGORICAL_LIGHT: readonly string[] = [
  '#00897b',
  '#eb6834',
  '#4a3aa7',
  '#eda100',
  '#e87ba4',
  '#2a78d6',
];
export const CATEGORICAL_DARK: readonly string[] = [
  '#12a3a8',
  '#d95926',
  '#9085e9',
  '#c98500',
  '#d55181',
  '#3987e5',
];

/** Point graphs put every series next to every other, so only the first three slots are safe. */
export const MAX_POINT_SERIES = 3;
