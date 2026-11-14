import type { OrgItem, OrgOccupancy } from '@wiltech-labs/ngx-organization';

function department(id: string, name: string, parentId: string, head: string): OrgItem[] {
  return [
    { id, type: 'DEPARTMENT', name, parentId, reportingJobId: `${id}-head` },
    { id: `${id}-head`, type: 'JOB', name: head, parentId: id },
  ];
}

function job(id: string, name: string, parentId: string): OrgItem {
  return { id, type: 'JOB', name, parentId };
}

/** A person in a job, put on the job's `occupancies` by `withOccupancies`. */
interface Holder {
  holderOf: string;
  occupancy: OrgOccupancy;
}

function occupancy(jobId: string, personId: string, name: string): Holder {
  return { holderOf: jobId, occupancy: { id: `occ-${jobId}`, personId, name, startDate: '2024-01-01' } };
}

/** Each job with the people holding it, the way the API sends them: people are not nodes. */
function withOccupancies(entries: (OrgItem | Holder)[]): OrgItem[] {
  const held = new Map<string, OrgOccupancy[]>();
  for (const entry of entries) {
    if ('holderOf' in entry) {
      held.set(entry.holderOf, [...(held.get(entry.holderOf) ?? []), entry.occupancy]);
    }
  }
  return entries
    .filter((entry): entry is OrgItem => !('holderOf' in entry))
    .map((item) => (item.type === 'JOB' ? { ...item, occupancies: held.get(item.id) ?? [] } : item));
}

/** A flat API-style response: every item points at its parent; each job carries the people holding it.
 *  Two people hold more than one job — Ada Lovelace heads both Board and Web. */
export const SAMPLE_ITEMS: OrgItem[] = withOccupancies([
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
]);

/** A small org — one entity, two departments, a handful of jobs. */
export const SMALL_ORG_ITEMS: OrgItem[] = withOccupancies([
  { id: 'org', type: 'ORG', name: 'Acme Ltd', parentId: null },
  ...department('eng', 'Engineering', 'org', 'VP Engineering'),
  occupancy('eng-head', 'p-1', 'Jordan Blake'),
  job('dev-1', 'Software Engineer', 'eng'),
  occupancy('dev-1', 'p-2', 'Sam Okafor'),
  ...department('sales', 'Sales', 'org', 'VP Sales'),
  occupancy('sales-head', 'p-3', 'Priya Patel'),
]);

/** Jobs with no occupancy at all — the vacant case. */
export const VACANT_JOBS_ITEMS: OrgItem[] = withOccupancies([
  { id: 'org', type: 'ORG', name: 'Acme Ltd', parentId: null },
  ...department('eng', 'Engineering', 'org', 'VP Engineering'),
  // The head role itself is vacant — no occupancy for eng-head.
  job('dev-1', 'Software Engineer', 'eng'),
  occupancy('dev-1', 'p-2', 'Sam Okafor'),
  job('dev-2', 'Software Engineer', 'eng'),
  job('dev-3', 'Software Engineer', 'eng'),
]);

/** A deeper reporting line: entity → department → department → department → job. */
export const DEEP_TREE_ITEMS: OrgItem[] = withOccupancies([
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
]);
