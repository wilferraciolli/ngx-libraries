import type { OrgItem, OrgNodeType } from './org-item.model';

/** What each card on the chart is drawn from. */
export interface OrgCard {
  type: OrgNodeType;
  item: OrgItem;
  /** `DEPARTMENT` only: its reporting job, merged into the card. */
  reportingJob?: OrgItem;
  /** The person in this card's job: the job itself for `JOB`, the reporting job for `DEPARTMENT`. */
  occupancy?: OrgItem;
  /** Names from the top of the chart down to this card's parent. */
  path: string[];
  jobCount: number;
  departmentCount: number;
}
