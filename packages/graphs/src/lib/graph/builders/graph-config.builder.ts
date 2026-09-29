import type { GraphDef, GraphSeries } from '../interfaces/graph-definition';

/** Fluent builder for a `GraphDef` — describe a graph's data once, then hand it to a graph component. */
export class GraphConfigBuilder {
  private readonly seriesList: GraphSeries[] = [];
  private labelsValue: string[] = [];
  private titleValue?: string;

  public labels(labels: string[]): this {
    this.labelsValue = labels;
    return this;
  }

  public series(label: string, data: number[], color?: string): this {
    this.seriesList.push({ label, data, color });
    return this;
  }

  public title(title: string): this {
    this.titleValue = title;
    return this;
  }

  public build(): GraphDef {
    return {
      labels: this.labelsValue,
      series: this.seriesList,
      title: this.titleValue
    };
  }
}

export function graphConfig(): GraphConfigBuilder {
  return new GraphConfigBuilder();
}
