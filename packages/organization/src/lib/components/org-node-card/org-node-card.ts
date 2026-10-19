import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import type { OrganizationText } from '../../config/organization-text.token';
import type { OrgCard } from '../../models/org-chart-node.model';
import { initials } from '../../utils/org-tree.utils';

const ICONS: Record<OrgCard['type'], string> = {
  ORG: 'corporate_fare',
  ORG_ENTITY: 'domain',
  DEPARTMENT: 'groups',
  JOB: 'badge',
};

/**
 * One card on the chart. Organization and entity cards are tonal blocks; a department card carries
 * its reporting job's holder underneath a hairline, so the manager is read as part of the
 * department; a job card leads with the person, or a dashed "Vacant" outline when nobody holds it.
 */
@Component({
  selector: 'ngx-org-node-card',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './org-node-card.html',
  styleUrl: './org-node-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgNodeCard {
  public readonly card = input.required<OrgCard>();
  public readonly text = input.required<OrganizationText>();

  /** Outlines the card whose details are open. */
  public readonly active = input(false);

  public readonly selected = output<OrgCard>();

  protected readonly icon = computed(() => ICONS[this.card().type]);
  protected readonly typeLabel = computed(() => this.text().types[this.card().type]);
  /** The job whose holder this card shows: the job itself, or a department's reporting job. */
  protected readonly job = computed(() =>
    this.card().type === 'JOB' ? this.card().item : this.card().reportingJob,
  );
  protected readonly person = computed(() => this.card().occupancy);
  protected readonly personInitials = computed(() => initials(this.person()?.name ?? ''));
  protected readonly ariaLabel = computed(() => {
    const card = this.card();
    const holder = this.job() ? (this.person()?.name ?? this.text().vacant) : '';
    return [this.typeLabel(), card.item.name, this.job()?.name, holder].filter(Boolean).join(', ');
  });
}
