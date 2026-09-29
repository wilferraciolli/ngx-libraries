import type { GraphDef } from '../interfaces/graph-definition';
import type { PointGraphDef } from '../interfaces/point-graph-definition';

/** Every number a graph plots, as a table — the graph's accessible, colour-free twin. */
export interface GraphTable {
  columns: string[];
  rows: (string | number)[][];
}

export function toGraphTable(graphDef: GraphDef): GraphTable {
  return {
    columns: ['', ...graphDef.series.map((series) => series.label)],
    rows: graphDef.labels.map((label, index) => [label, ...graphDef.series.map((series) => series.data[index])])
  };
}

export function toPointGraphTable(graphDef: PointGraphDef): GraphTable {
  const hasRadius = graphDef.series.some((series) => series.data.some((point) => point.r !== undefined));
  return {
    columns: hasRadius ? ['Series', 'x', 'y', 'Size'] : ['Series', 'x', 'y'],
    rows: graphDef.series.reduce<(string | number)[][]>(
      (rows, series) =>
        rows.concat(
          series.data.map((point) =>
            hasRadius ? [series.label, point.x, point.y, point.r ?? ''] : [series.label, point.x, point.y]
          )
        ),
      []
    )
  };
}

/** A one-sentence `aria-label` for the canvas: what is plotted and its extremes. */
export function summarizeGraph(graphDef: GraphDef): string {
  const name = graphDef.title ?? 'Chart';
  if (graphDef.series.length === 1) {
    const [series] = graphDef.series;
    const pairs = graphDef.labels.map((label, index) => ({ label, value: series.data[index] }));
    if (!pairs.length) {
      return `${name}: no data.`;
    }
    const high = pairs.reduce((a, b) => (b.value > a.value ? b : a));
    const low = pairs.reduce((a, b) => (b.value < a.value ? b : a));
    return `${name}: ${series.label} across ${pairs.length} categories. Highest ${high.label} (${high.value}), lowest ${low.label} (${low.value}).`;
  }
  const names = graphDef.series.map((series) => series.label).join(', ');
  return `${name}: ${graphDef.series.length} series (${names}) across ${graphDef.labels.length} categories. See the data table for values.`;
}

export function summarizePointGraph(graphDef: PointGraphDef): string {
  const name = graphDef.title ?? 'Chart';
  const points = graphDef.series.reduce((total, series) => total + series.data.length, 0);
  const names = graphDef.series.map((series) => series.label).join(', ');
  return `${name}: ${points} points in ${graphDef.series.length} series (${names}). See the data table for values.`;
}
