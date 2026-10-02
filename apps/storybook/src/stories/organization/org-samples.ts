import type { OrgItem } from '@wiltech-labs/ngx-organization';

function department(id: string, name: string, parentId: string, head: string): OrgItem[] {
  return [
    { id, type: 'DEPARTMENT', name, parentId, reportingJobId: `${id}-head` },
    { id: `${id}-head`, type: 'JOB', name: head, parentId: id },
  ];
}

function job(id: string, name: string, parentId: string): OrgItem {
  return { id, type: 'JOB', name, parentId };
}

function occupancy(jobId: string, personId: string, name: string): OrgItem {
  return { id: `occ-${jobId}`, type: 'OCCUPANCY', name, parentId: jobId, personId };
}

/** A flat API-style response: every item points at its parent, occupancies point at their job.
 *  Two people hold more than one job — Ada Lovelace heads both Board and Web. */
export const SAMPLE_ITEMS: OrgItem[] = [
  {
    id: 'org',
    type: 'ORG',
    name: 'Northwind Group',
    parentId: null,
    description: 'Holding company for the Northwind trading entities.',
  },
  { id: 'uk', type: 'ORG_ENTITY', name: 'Northwind UK Ltd', parentId: 'org' },
  ...department('board', 'Board', 'uk', 'Chief Executive Officer'),
  occupancy('board-head', 'p-ada', 'Ada Lovelace'),
  job('pa', 'Executive Assistant', 'board'),
  occupancy('pa', 'p-grace', 'Grace Hopper'),
  ...department('eng', 'Engineering', 'board', 'Chief Technology Officer'),
  occupancy('eng-head', 'p-alan', 'Alan Turing'),
  job('staff-eng', 'Staff Engineer', 'eng'),
  occupancy('staff-eng', 'p-linus', 'Linus Torvalds'),
  ...department('platform', 'Platform', 'eng', 'Platform Lead'),
  occupancy('platform-head', 'p-margaret', 'Margaret Hamilton'),
  job('sre-1', 'Site Reliability Engineer', 'platform'),
  occupancy('sre-1', 'p-ken', 'Ken Thompson'),
  job('sre-2', 'Site Reliability Engineer', 'platform'),
  ...department('web', 'Web', 'eng', 'Web Lead'),
  occupancy('web-head', 'p-ada', 'Ada Lovelace'),
  job('frontend', 'Frontend Engineer', 'web'),
  occupancy('frontend', 'p-tim', 'Tim Berners-Lee'),
  job('designer', 'Product Designer', 'web'),
  occupancy('designer', 'p-dieter', 'Dieter Rams'),
  ...department('finance', 'Finance', 'board', 'Chief Financial Officer'),
  occupancy('finance-head', 'p-katherine', 'Katherine Johnson'),
  job('accountant', 'Management Accountant', 'finance'),
];

/** A small org — one entity, two departments, a handful of jobs. */
export const SMALL_ORG_ITEMS: OrgItem[] = [
  { id: 'org', type: 'ORG', name: 'Acme Ltd', parentId: null },
  ...department('eng', 'Engineering', 'org', 'VP Engineering'),
  occupancy('eng-head', 'p-1', 'Jordan Blake'),
  job('dev-1', 'Software Engineer', 'eng'),
  occupancy('dev-1', 'p-2', 'Sam Okafor'),
  ...department('sales', 'Sales', 'org', 'VP Sales'),
  occupancy('sales-head', 'p-3', 'Priya Patel'),
];

/** Jobs with no occupancy at all — the vacant case. */
export const VACANT_JOBS_ITEMS: OrgItem[] = [
  { id: 'org', type: 'ORG', name: 'Acme Ltd', parentId: null },
  ...department('eng', 'Engineering', 'org', 'VP Engineering'),
  // The head role itself is vacant — no occupancy for eng-head.
  job('dev-1', 'Software Engineer', 'eng'),
  occupancy('dev-1', 'p-2', 'Sam Okafor'),
  job('dev-2', 'Software Engineer', 'eng'),
  job('dev-3', 'Software Engineer', 'eng'),
];

/** A deeper reporting line: entity → department → department → department → job. */
export const DEEP_TREE_ITEMS: OrgItem[] = [
  { id: 'org', type: 'ORG', name: 'Globex Corporation', parentId: null },
  { id: 'emea', type: 'ORG_ENTITY', name: 'Globex EMEA', parentId: 'org' },
  ...department('product', 'Product', 'emea', 'Chief Product Officer'),
  occupancy('product-head', 'p-1', 'Lee Marsh'),
  ...department('platform-div', 'Platform Division', 'product', 'Platform Division Head'),
  occupancy('platform-div-head', 'p-2', 'Noor Khan'),
  ...department('infra', 'Infrastructure', 'platform-div', 'Infrastructure Lead'),
  occupancy('infra-head', 'p-3', 'Diego Ruiz'),
  job('infra-eng', 'Infrastructure Engineer', 'infra'),
  occupancy('infra-eng', 'p-4', 'Yuki Tanaka'),
];
