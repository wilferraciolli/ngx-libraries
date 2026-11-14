import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import {
  DEFAULT_ORGANIZATION_TEXT,
  NGX_ORGANIZATION_TEXT,
} from '../../config/organization-text.token';
import type { OrgCard } from '../../models/org-chart-node.model';
import { initials } from '../../utils/org-tree.utils';

/** An ISO date (`2026-03-01`) as the page's language writes a day, e.g. "1 Mar 2026". */
function formatDay(iso: string, locale: string | undefined): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(year, month - 1, day),
  );
}

/**
 * Content of the left-hand panel the chart opens for a card: where the item sits (its reporting
 * line), who holds the job and since when, and how much sits under it. Read-only; the item's
 * `links` are for the app to offer as actions.
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

  private readonly locale = inject(DOCUMENT).documentElement.lang || undefined;

  /** "Since 1 Mar 2026" while the person still holds the job, "1 Mar – 31 Aug 2026" once it ends. */
  protected readonly dates = computed(() => {
    const held = this.data().occupancy;
    if (!held?.startDate) return '';
    const start = formatDay(held.startDate, this.locale);
    if (!held.endDate) return `${this.text.since ?? DEFAULT_ORGANIZATION_TEXT.since} ${start}`;
    return `${start} – ${formatDay(held.endDate, this.locale)}`;
  });
  protected readonly showCounts = computed(() => this.data().type !== 'JOB');
}
