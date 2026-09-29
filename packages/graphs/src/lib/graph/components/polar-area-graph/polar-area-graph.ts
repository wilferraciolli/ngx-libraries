import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { toChartData } from '../../utils/graph.utils';
import { withTitle } from '../../utils/graph-options.utils';

/** Polar area graph — takes a `GraphDef` (see `graphConfig()`) and renders it via ng2-charts/chart.js. */
@Component({
  selector: 'app-polar-area-graph',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './polar-area-graph.html',
  styleUrl: './polar-area-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolarAreaGraph {
  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'polarArea'>['data']>(() =>
    toChartData<'polarArea'>(this.graphDef())
  );

  protected readonly options: Signal<ChartConfiguration<'polarArea'>['options']> = computed(() =>
    withTitle<'polarArea'>(this.graphDef().title)
  );
}
