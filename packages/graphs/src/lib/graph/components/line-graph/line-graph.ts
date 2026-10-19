import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  type Signal,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { GraphDef } from '../../interfaces/graph-definition';
import { GraphThemeService } from '../../theme/graph-theme';
import { toChartData } from '../../utils/graph.utils';
import { graphOptions } from '../../utils/graph-options.utils';
import { summarizeGraph, toGraphTable } from '../../utils/graph-table.utils';
import { GraphFrame } from '../graph-frame/graph-frame';

/** Line graph — 2px lines, markers only on hover, tooltip for the hovered category across series. Takes a `GraphDef` (see `graphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-line-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './line-graph.html',
  styleUrl: './line-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'line'>['data']>(() =>
    toChartData<'line'>(this.graphDef(), this.theme()),
  );

  protected readonly options: Signal<ChartConfiguration<'line'>['options']> = computed(() =>
    graphOptions<'line'>(this.theme(), 'category', this.graphDef().series.length, {
      interaction: { mode: 'index', intersect: false },
      datasets: {
        line: {
          borderWidth: 2,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 12,
        },
      },
    }),
  );

  protected readonly table = computed(() => toGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizeGraph(this.graphDef()));
}
