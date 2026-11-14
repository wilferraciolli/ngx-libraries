import type { ILink } from '@wiltech-labs/ngx-api-client';

/** The structure's node types, each drawn as a card. */
export type OrgNodeType = 'ORG' | 'ORG_ENTITY' | 'DEPARTMENT' | 'JOB';

/**
 * Every item type the list may hold: the node types, plus 1.0.0's `OCCUPANCY` (a person in a job
 * sent as an item of its own, `parentId` = the job), still read but deprecated since 1.0.1 in
 * favour of the job's `occupancies`.
 */
export type OrgItemType = OrgNodeType | 'OCCUPANCY';

/**
 * A person holding a job from `startDate` to `endDate` (ISO dates, both included; no `endDate`:
 * still holding it). Not a node of the structure: it travels on the job it fills.
 */
export interface OrgOccupancy {
  id: string;
  /** The same across every job the person holds. */
  personId: string;
  /** The person's name. */
  name: string;
  /** Always sent by the API; absent only when read from a 1.0.0 `OCCUPANCY` item. */
  startDate?: string;
  endDate?: string | null;
  links?: Record<string, ILink>;
}

/**
 * One node of the API's flat org chart response (`_data.orgNodes`), pointing at its parent. The
 * API owns every structure rule (`wiltech-labs-organization` holds them for Python APIs); the
 * chart only lays out what it is given:
 *
 * - exactly one `ORG`, with `parentId: null`;
 * - `ORG_ENTITY` under the org or a department, never inside another entity (at most one on any
 *   line from the top), never holding jobs;
 * - `DEPARTMENT` under the org, an entity or another department, to any depth, with at most one
 *   reporting job (`reportingJobId`), drawn merged into the department's card;
 * - `JOB` under a department only (or under that department's reporting job), with the people who
 *   hold it in `occupancies`. People are not nodes; a person can hold several jobs.
 *
 * `links` are the actions the API allows on this item, for the app to offer; the chart doesn't
 * render them.
 */
export interface OrgItem {
  id: string;
  type: OrgItemType;
  /** Display name: the organization, entity or department, or the job's title. */
  name: string;
  parentId: string | null;
  description?: string;
  /** `DEPARTMENT` only: the id of the `JOB` that heads it, if any. */
  reportingJobId?: string | null;
  /** `JOB` only: who holds it on the chart's date (the API picks the date), earliest first. The
   *  card shows the first; none is a vacant job. */
  occupancies?: OrgOccupancy[] | null;
  /** 1.0.0 `OCCUPANCY` items only: the person's own id. */
  personId?: string;
  links?: Record<string, ILink>;
}
