import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NGX_GRAPHS_TEXT } from '../../config/graphs-text.token';
import type { GraphTable } from '../../utils/graph-table.utils';

/**
 * The frame every graph renders in: the title as the figure caption, the chart (projected), and a
 * collapsed "Show data" table with every plotted number — so no value is reachable by colour or
 * pointer alone. Internal to this package.
 */
@Component({
  selector: 'ngx-graph-frame',
  standalone: true,
  imports: [],
  templateUrl: './graph-frame.html',
  styleUrl: './graph-frame.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphFrame {
  public readonly caption = input<string>();
  public readonly table = input.required<GraphTable>();

  private readonly resolveText = inject(NGX_GRAPHS_TEXT);
  protected readonly text = computed(() => this.resolveText());

  protected readonly open = signal(false);

  protected onToggle(event: Event): void {
    this.open.set((event.target as HTMLDetailsElement).open);
  }
}
