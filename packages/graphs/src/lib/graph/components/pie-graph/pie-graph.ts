import { ChangeDetectionStrategy, Component, computed, inject, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { GraphThemeService } from '../../theme/graph-theme';
import { toChartData } from '../../utils/graph.utils';
import { graphOptions } from '../../utils/graph-options.utils';
import { summarizeGraph, toGraphTable } from '../../utils/graph-table.utils';
import { GraphFrame } from '../graph-frame/graph-frame';

/** Pie graph — one series, a slice per label, separated by a 2px surface gap. Takes a `GraphDef` (see `graphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-pie-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './pie-graph.html',
  styleUrl: './pie-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'pie'>['data']>(() =>
    toChartData<'pie'>(this.graphDef(), this.theme(), true)
  );

  protected readonly options: Signal<ChartConfiguration<'pie'>['options']> = computed(() =>
    graphOptions<'pie'>(this.theme(), 'circular', this.graphDef().labels.length)
  );

  protected readonly table = computed(() => toGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizeGraph(this.graphDef()));
}
