// Barrel — re-export the entire public surface

export { OrganizationChart } from './lib/components/organization-chart/organization-chart';

export type { OrgItem, OrgItemType, OrgNodeType } from './lib/models/org-item.model';
export type { OrgCard } from './lib/models/org-chart-node.model';

export { OrgChartStore } from './lib/stores/org-chart.store';
export { buildOrgTree } from './lib/utils/org-tree.utils';

export {
  DEFAULT_ORGANIZATION_TEXT,
  NGX_ORGANIZATION_TEXT,
} from './lib/config/organization-text.token';
export type { OrganizationText } from './lib/config/organization-text.token';
