import type { PointDatum, PointGraphDef, PointSeries } from '../interfaces/point-graph-definition';

/** Fluent builder for a `PointGraphDef` — describe a bubble/scatter graph's data once, then hand
 *  it to `BubbleGraph`/`ScatterGraph`. */
export class PointGraphConfigBuilder {
  private readonly seriesList: PointSeries[] = [];
  private titleValue?: string;

  public series(label: string, data: PointDatum[]): this {
    this.seriesList.push({ label, data });
    return this;
  }

  public title(title: string): this {
    this.titleValue = title;
    return this;
  }

  public build(): PointGraphDef {
    return {
      series: this.seriesList,
      title: this.titleValue
    };
  }
}

export function pointGraphConfig(): PointGraphConfigBuilder {
  return new PointGraphConfigBuilder();
}
