import { InjectionToken } from '@angular/core';

import type { OrgNodeType } from '../models/org-item.model';

export interface OrganizationText {
  types: Record<OrgNodeType, string>;
  vacant: string;
  head: string;
  reportsTo: string;
  occupiedBy: string;
  jobs: string;
  departments: string;
  zoomIn: string;
  zoomOut: string;
  fitToScreen: string;
  chartLabel: string;
  empty: string;
}

export const DEFAULT_ORGANIZATION_TEXT: OrganizationText = {
  types: {
    ORG: 'Organization',
    ORG_ENTITY: 'Entity',
    DEPARTMENT: 'Department',
    JOB: 'Job',
  },
  vacant: 'Vacant',
  head: 'Head',
  reportsTo: 'Reports to',
  occupiedBy: 'Held by',
  jobs: 'Jobs',
  departments: 'Departments',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fitToScreen: 'Fit to screen',
  chartLabel: 'Organization chart',
  empty: 'No organization to show yet.',
};

/**
 * Same resolver pattern as `ngx-calendar`'s `NGX_CALENDAR_TEXT`: override it (e.g. wired to
 * `ngx-translations`) to translate the chart. Unset, it stays English.
 */
export const NGX_ORGANIZATION_TEXT = new InjectionToken<() => OrganizationText>(
  'NGX_ORGANIZATION_TEXT',
  { providedIn: 'root', factory: () => () => DEFAULT_ORGANIZATION_TEXT },
);
