import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { toChartData } from '../../utils/graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Bar graph — takes a `GraphDef` (see `graphConfig()`) and renders it via ng2-charts/chart.js. */
@Component({
  selector: 'app-bar-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './bar-graph.html',
  styleUrl: './bar-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarGraph {
  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() =>
    toChartData<'bar'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'bar'>['options']> = computed(() =>
    withTitle<'bar'>(this.graphDef().title)
  );
}
