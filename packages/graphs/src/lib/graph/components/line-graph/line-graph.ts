import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { toChartData } from '../../utils/graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Line graph — takes a `GraphDef` (see `graphConfig()`) and renders it via ng2-charts/chart.js. */
@Component({
  selector: 'app-line-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './line-graph.html',
  styleUrl: './line-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineGraph {
  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'line'>['data']>(() =>
    toChartData<'line'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'line'>['options']> = computed(() =>
    withTitle<'line'>(this.graphDef().title)
  );
}
