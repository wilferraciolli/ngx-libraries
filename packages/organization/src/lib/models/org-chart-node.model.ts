import type { TemplateRef } from '@angular/core';

import type { OrgItem, OrgNodeType, OrgOccupancy } from './org-item.model';

/** What each card on the chart is drawn from. */
export interface OrgCard {
  type: OrgNodeType;
  item: OrgItem;
  /** `DEPARTMENT` only: its reporting job, merged into the card. */
  reportingJob?: OrgItem;
  /** The person in this card's job: the job itself for `JOB`, the reporting job for `DEPARTMENT`. */
  occupancy?: OrgOccupancy;
  /** Names from the top of the chart down to this card's parent. */
  path: string[];
  jobCount: number;
  departmentCount: number;
}

/** The context of the app's own panel content (`detailTemplate`): the chosen item, and the card
 *  drawn from it. */
export interface OrgDetailContext {
  $implicit: OrgItem;
  card: OrgCard;
}

/** What the detail panel is given: the card, and the app's template to show below the details. */
export interface OrgDetailData {
  card: OrgCard;
  template?: TemplateRef<OrgDetailContext> | null;
}
