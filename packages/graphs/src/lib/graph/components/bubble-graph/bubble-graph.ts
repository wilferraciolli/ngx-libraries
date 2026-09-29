import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { PointGraphDef } from '../../interfaces/point-graph-definition';
import { toPointChartData } from '../../utils/point-graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Bubble graph — takes a `PointGraphDef` (see `pointGraphConfig()`), each point plotted at
 *  `(x, y)` with radius `r`. Renders via ng2-charts/chart.js. */
@Component({
  selector: 'app-bubble-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './bubble-graph.html',
  styleUrl: './bubble-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BubbleGraph {
  public readonly graphDef = input.required<PointGraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'bubble'>['data']>(() =>
    toPointChartData<'bubble'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'bubble'>['options']> = computed(() =>
    withTitle<'bubble'>(this.graphDef().title)
  );
}
