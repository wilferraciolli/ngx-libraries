import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { toChartData } from '../../utils/graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Doughnut graph — takes a `GraphDef` (see `graphConfig()`) and renders it via ng2-charts/chart.js. */
@Component({
  selector: 'app-doughnut-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './doughnut-graph.html',
  styleUrl: './doughnut-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoughnutGraph {
  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'doughnut'>['data']>(() =>
    toChartData<'doughnut'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'doughnut'>['options']> = computed(() =>
    withTitle<'doughnut'>(this.graphDef().title)
  );
}
