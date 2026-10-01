import { Component, signal } from '@angular/core';
import { OrganizationChart, type OrgItem } from '@wiltech-labs/ngx-organization';

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

/** A flat API-style response: every item points at its parent, occupancies point at their job. */
const SAMPLE_ITEMS: OrgItem[] = [
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
  job('cos', 'Chief of Staff', 'board'),

  ...department('eng', 'Engineering', 'board', 'Chief Technology Officer'),
  occupancy('eng-head', 'p-alan', 'Alan Turing'),
  job('staff-eng', 'Staff Engineer', 'eng'),
  occupancy('staff-eng', 'p-linus', 'Linus Torvalds'),
  job('eng-manager', 'Engineering Manager', 'eng'),

  ...department('platform', 'Platform', 'eng', 'Platform Lead'),
  occupancy('platform-head', 'p-margaret', 'Margaret Hamilton'),
  job('sre-1', 'Site Reliability Engineer', 'platform'),
  occupancy('sre-1', 'p-ken', 'Ken Thompson'),
  job('sre-2', 'Site Reliability Engineer', 'platform'),

  ...department('web', 'Web', 'eng', 'Web Lead'),
  // The same person can hold more than one job.
  occupancy('web-head', 'p-ada', 'Ada Lovelace'),
  job('frontend', 'Frontend Engineer', 'web'),
  occupancy('frontend', 'p-tim', 'Tim Berners-Lee'),
  job('designer', 'Product Designer', 'web'),
  occupancy('designer', 'p-dieter', 'Dieter Rams'),

  ...department('finance', 'Finance', 'board', 'Chief Financial Officer'),
  occupancy('finance-head', 'p-katherine', 'Katherine Johnson'),
  job('accountant', 'Management Accountant', 'finance'),

  ...department('ops', 'Group Operations', 'org', 'Chief Operating Officer'),
  job('ops-analyst', 'Operations Analyst', 'ops'),
  occupancy('ops-analyst', 'p-hedy', 'Hedy Lamarr'),

  // An entity can sit under a department, as long as no other entity is above it.
  { id: 'ie', type: 'ORG_ENTITY', name: 'Northwind Ireland', parentId: 'ops' },
  ...department('sales-ie', 'Sales Ireland', 'ie', 'Sales Director'),
  occupancy('sales-ie-head', 'p-mary', 'Mary Jackson'),
  job('ae-1', 'Account Executive', 'sales-ie'),
  occupancy('ae-1', 'p-annie', 'Annie Easley'),
  job('ae-2', 'Account Executive', 'sales-ie'),
];

@Component({
  selector: 'app-organization-demo',
  standalone: true,
  imports: [OrganizationChart],
  templateUrl: './organization-demo.component.html',
  styleUrls: ['./organization-demo.component.css'],
})
export class OrganizationDemoComponent {
  protected readonly items = signal(SAMPLE_ITEMS);
  protected readonly selected = signal<OrgItem | null>(null);
}
