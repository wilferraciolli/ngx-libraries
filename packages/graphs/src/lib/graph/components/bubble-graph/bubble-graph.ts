import { ChangeDetectionStrategy, Component, computed, inject, input, type Signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import type { PointGraphDef } from '../../interfaces/point-graph-definition';
import { GraphThemeService } from '../../theme/graph-theme';
import { toPointChartData } from '../../utils/point-graph.utils';
import { graphOptions } from '../../utils/graph-options.utils';
import { summarizePointGraph, toPointGraphTable } from '../../utils/graph-table.utils';
import { GraphFrame } from '../graph-frame/graph-frame';

/** Bubble graph — each point at `(x, y)` sized by `r`, ringed in the surface colour so overlaps read. Takes a `PointGraphDef` (see `pointGraphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-bubble-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './bubble-graph.html',
  styleUrl: './bubble-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BubbleGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<PointGraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'bubble'>['data']>(() =>
    toPointChartData<'bubble'>(this.graphDef(), this.theme())
  );

  protected readonly options: Signal<ChartConfiguration<'bubble'>['options']> = computed(() =>
    graphOptions<'bubble'>(this.theme(), 'point', this.graphDef().series.length)
  );

  protected readonly table = computed(() => toPointGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizePointGraph(this.graphDef()));
}
