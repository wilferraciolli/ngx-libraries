/** One series. Colours come from the house categorical palette, in series order — never the app. */
export interface GraphSeries {
  label: string;
  data: number[];
}

export interface GraphDef {
  /** Category labels — the x-axis categories for a bar/line graph, or the slice labels for a pie. */
  labels: string[];
  series: GraphSeries[];
  title?: string;
}
