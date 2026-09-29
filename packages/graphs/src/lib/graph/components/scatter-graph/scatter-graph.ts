import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { PointGraphDef } from '../../interfaces/point-graph-definition';
import { toPointChartData } from '../../utils/point-graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Scatter graph — takes a `PointGraphDef` (see `pointGraphConfig()`), each point plotted at
 *  `(x, y)`. Renders via ng2-charts/chart.js. */
@Component({
  selector: 'app-scatter-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './scatter-graph.html',
  styleUrl: './scatter-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterGraph {
  public readonly graphDef = input.required<PointGraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'scatter'>['data']>(() =>
    toPointChartData<'scatter'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'scatter'>['options']> = computed(() =>
    withTitle<'scatter'>(this.graphDef().title)
  );
}
