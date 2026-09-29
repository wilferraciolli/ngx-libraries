export interface GraphSeries {
  label: string;
  data: number[];
  /** Fixed color for this series (bar/line) or, for a single-series pie, use per-slice colors instead. */
  color?: string;
}

export interface GraphDef {
  /** Category labels — the x-axis categories for a bar/line graph, or the slice labels for a pie. */
  labels: string[];
  series: GraphSeries[];
  title?: string;
}
