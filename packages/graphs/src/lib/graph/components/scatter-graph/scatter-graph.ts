import { ChangeDetectionStrategy, Component, computed, inject, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { PointGraphDef } from '../../interfaces/point-graph-definition';
import { GraphThemeService } from '../../theme/graph-theme';
import { toPointChartData } from '../../utils/point-graph.utils';
import { graphOptions } from '../../utils/graph-options.utils';
import { summarizePointGraph, toPointGraphTable } from '../../utils/graph-table.utils';
import { GraphFrame } from '../graph-frame/graph-frame';

/** Scatter graph — each point plotted at `(x, y)`, ringed in the surface colour so overlaps read. Takes a `PointGraphDef` (see `pointGraphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-scatter-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './scatter-graph.html',
  styleUrl: './scatter-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<PointGraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'scatter'>['data']>(() =>
    toPointChartData<'scatter'>(this.graphDef(), this.theme())
  );

  protected readonly options: Signal<ChartConfiguration<'scatter'>['options']> = computed(() =>
    graphOptions<'scatter'>(this.theme(), 'point', this.graphDef().series.length,
      { datasets: { scatter: { pointRadius: 5, pointHoverRadius: 7 } } })
  );

  protected readonly table = computed(() => toPointGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizePointGraph(this.graphDef()));
}
