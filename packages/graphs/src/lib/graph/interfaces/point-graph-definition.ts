export interface PointDatum {
  x: number;
  y: number;
  /** Bubble radius — ignored by `ScatterGraph`. */
  r?: number;
}

export interface PointSeries {
  label: string;
  data: PointDatum[];
  color?: string;
}

/** Data shape for x/y point charts (`BubbleGraph`, `ScatterGraph`) — no shared category `labels`,
 *  unlike `GraphDef`. */
export interface PointGraphDef {
  series: PointSeries[];
  title?: string;
}
