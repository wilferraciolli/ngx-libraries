import { ChangeDetectionStrategy, Component, computed, inject, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { GraphThemeService } from '../../theme/graph-theme';
import { toChartData } from '../../utils/graph.utils';
import { graphOptions } from '../../utils/graph-options.utils';
import { summarizeGraph, toGraphTable } from '../../utils/graph-table.utils';
import { GraphFrame } from '../graph-frame/graph-frame';

/** Bar graph — columns ≤ 24px, 4px rounded tops, square at the baseline. Takes a `GraphDef` (see `graphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-bar-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './bar-graph.html',
  styleUrl: './bar-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() =>
    toChartData<'bar'>(this.graphDef(), this.theme())
  );

  protected readonly options: Signal<ChartConfiguration<'bar'>['options']> = computed(() =>
    graphOptions<'bar'>(this.theme(), 'category', this.graphDef().series.length,
      { datasets: { bar: { maxBarThickness: 24, borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'start', categoryPercentage: 0.8, barPercentage: 0.9 } } })
  );

  protected readonly table = computed(() => toGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizeGraph(this.graphDef()));
}
