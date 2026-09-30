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

/** Polar area graph — one series, a segment per label. Takes a `GraphDef` (see `graphConfig()`); colours, text and grid follow the app's M3 theme. */
@Component({
  selector: 'ngx-polar-area-graph',
  standalone: true,
  imports: [BaseChartDirective, GraphFrame],
  templateUrl: './polar-area-graph.html',
  styleUrl: './polar-area-graph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolarAreaGraph {
  private readonly theme = inject(GraphThemeService).theme;

  public readonly graphDef = input.required<GraphDef>();

  protected readonly chartData = computed<ChartConfiguration<'polarArea'>['data']>(() =>
    toChartData<'polarArea'>(this.graphDef(), this.theme(), true),
  );

  protected readonly options: Signal<ChartConfiguration<'polarArea'>['options']> = computed(() =>
    graphOptions<'polarArea'>(this.theme(), 'radial', this.graphDef().labels.length),
  );

  protected readonly table = computed(() => toGraphTable(this.graphDef()));
  protected readonly summary = computed(() => summarizeGraph(this.graphDef()));
}
