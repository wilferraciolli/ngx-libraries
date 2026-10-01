import type { ILink } from '@wiltech-labs/ngx-api-client';

/** Types drawn as cards on the chart. */
export type OrgNodeType = 'ORG' | 'ORG_ENTITY' | 'DEPARTMENT' | 'JOB';

/** Every item type the API returns. An `OCCUPANCY` is a person in a job: shown on the job's card,
 *  never as a card of its own. */
export type OrgItemType = OrgNodeType | 'OCCUPANCY';

/**
 * One item of the API's flat org chart response (`_data.orgNodes`). The API owns every structure
 * rule; the chart only lays out what it is given:
 *
 * - exactly one `ORG`, with `parentId: null`;
 * - `ORG_ENTITY` under the org or a department, at most one per reporting line, never holding jobs;
 * - `DEPARTMENT` under the org, an entity or another department, with exactly one reporting job
 *   (`reportingJobId`), drawn merged into the department's card;
 * - `JOB` under a department (or under that department's reporting job);
 * - `OCCUPANCY` under the job it fills (`parentId` = the job's id). A job has at most one; a person
 *   (`personId`) can hold several jobs.
 *
 * `links` are the actions the API allows on this item. Read-only for now, so the chart doesn't
 * render them yet.
 */
export interface OrgItem {
  id: string;
  type: OrgItemType;
  /** Display name: the organization, entity, department or job title, or the person's name. */
  name: string;
  parentId: string | null;
  description?: string;
  /** `DEPARTMENT` only: the id of the `JOB` that heads it. */
  reportingJobId?: string | null;
  /** `OCCUPANCY` only: the person's own id, the same across every job they hold. */
  personId?: string;
  links?: Record<string, ILink>;
}
