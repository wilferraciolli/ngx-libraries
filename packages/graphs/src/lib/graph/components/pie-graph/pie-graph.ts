import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { toChartData } from '../../utils/graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Pie graph — takes a `GraphDef` (see `graphConfig()`) and renders it via ng2-charts/chart.js. */
@Component({
  selector: 'app-pie-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './pie-graph.html',
  styleUrl: './pie-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieGraph {
  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'pie'>['data']>(() =>
    toChartData<'pie'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'pie'>['options']> = computed(() =>
    withTitle<'pie'>(this.graphDef().title)
  );
}
