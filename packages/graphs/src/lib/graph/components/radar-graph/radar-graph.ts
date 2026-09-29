import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { toChartData } from '../../utils/graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Radar graph — takes a `GraphDef` (see `graphConfig()`) and renders it via ng2-charts/chart.js. */
@Component({
  selector: 'app-radar-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './radar-graph.html',
  styleUrl: './radar-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarGraph {
  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'radar'>['data']>(() =>
    toChartData<'radar'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'radar'>['options']> = computed(() =>
    withTitle<'radar'>(this.graphDef().title)
  );
}
