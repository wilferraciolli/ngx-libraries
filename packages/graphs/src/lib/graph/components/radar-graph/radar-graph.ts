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

/** Radar graph — each series an outline over the shared axes. Takes a `GraphDef` (see `graphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-radar-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './radar-graph.html',
  styleUrl: './radar-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'radar'>['data']>(() =>
    toChartData<'radar'>(this.graphDef(), this.theme()),
  );

  protected readonly options: Signal<ChartConfiguration<'radar'>['options']> = computed(() =>
    graphOptions<'radar'>(this.theme(), 'radial', this.graphDef().series.length, {
      datasets: { radar: { fill: false, borderWidth: 2, pointRadius: 4, pointHoverRadius: 5 } },
    }),
  );

  protected readonly table = computed(() => toGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizeGraph(this.graphDef()));
}
