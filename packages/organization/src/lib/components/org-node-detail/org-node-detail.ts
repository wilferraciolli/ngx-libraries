import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { NGX_ORGANIZATION_TEXT } from '../../config/organization-text.token';
import type { OrgCard } from '../../models/org-chart-node.model';
import { initials } from '../../utils/org-tree.utils';

/**
 * Content of the left-hand panel the chart opens for a card: where the item sits (its reporting
 * line), who holds the job, and how much sits under it. Read-only for now; the item's `links` are
 * where its actions will come from.
 */
@Component({
  selector: 'ngx-org-node-detail',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './org-node-detail.html',
  styleUrl: './org-node-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgNodeDetail {
  public readonly data = input.required<OrgCard>();

  protected readonly text = inject(NGX_ORGANIZATION_TEXT)();

  protected readonly typeLabel = computed(() => this.text.types[this.data().type]);
  protected readonly job = computed(() =>
    this.data().type === 'JOB' ? this.data().item : this.data().reportingJob,
  );
  protected readonly personInitials = computed(() => initials(this.data().occupancy?.name ?? ''));
  protected readonly showCounts = computed(() => this.data().type !== 'JOB');
}
