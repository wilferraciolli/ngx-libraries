import type { OrgChartNode } from 'ngx-interactive-org-chart';

import type { OrgCard } from '../models/org-chart-node.model';
import type { OrgItem } from '../models/org-item.model';

/** Jobs first (they report to the card above), then entities and departments. */
const ORDER: Record<string, number> = { JOB: 0, ORG_ENTITY: 1, DEPARTMENT: 2 };

/**
 * Turns the API's flat item list into the nested tree the chart draws. Each department absorbs its
 * reporting job; jobs filed under that reporting job are shown under the department card, since the
 * two are one card. Occupancies are attached to their job. Returns `null` without an `ORG`.
 *
 * Cards deeper than `expandedDepth` levels below the organization start collapsed.
 */
export function buildOrgTree(
  items: readonly OrgItem[],
  expandedDepth = Number.POSITIVE_INFINITY,
): OrgChartNode<OrgCard> | null {
  const root = items.find((item) => item.type === 'ORG');
  if (!root) return null;

  const childrenOf = new Map<string, OrgItem[]>();
  const occupancyOf = new Map<string, OrgItem>();
  const byId = new Map(items.map((item) => [item.id, item]));
  const reportingJobIds = new Set<string>();

  for (const item of items) {
    if (item.type === 'DEPARTMENT' && item.reportingJobId) reportingJobIds.add(item.reportingJobId);
    if (item.parentId === null) continue;
    if (item.type === 'OCCUPANCY') {
      if (!occupancyOf.has(item.parentId)) occupancyOf.set(item.parentId, item);
      continue;
    }
    const siblings = childrenOf.get(item.parentId) ?? [];
    siblings.push(item);
    childrenOf.set(item.parentId, siblings);
  }

  const toNode = (item: OrgItem, path: string[]): OrgChartNode<OrgCard> => {
    const depth = path.length;
    const reportingJob = item.reportingJobId ? byId.get(item.reportingJobId) : undefined;
    const children = [
      ...(childrenOf.get(item.id) ?? []),
      ...(reportingJob ? (childrenOf.get(reportingJob.id) ?? []) : []),
    ]
      .filter((child) => !reportingJobIds.has(child.id))
      .sort((a, b) => (ORDER[a.type] ?? 9) - (ORDER[b.type] ?? 9));

    const childPath = [...path, item.name];
    return {
      id: item.id,
      name: [
        item.name,
        reportingJob && occupancyOf.get(reportingJob.id)?.name,
        occupancyOf.get(item.id)?.name,
      ]
        .filter(Boolean)
        .join(' · '),
      data: {
        type: item.type as OrgCard['type'],
        item,
        reportingJob,
        occupancy: occupancyOf.get(reportingJob?.id ?? item.id),
        path,
        jobCount: children.filter((child) => child.type === 'JOB').length,
        departmentCount: children.filter((child) => child.type === 'DEPARTMENT').length,
      },
      collapsed: children.length > 0 && depth >= expandedDepth,
      children: children.map((child) => toNode(child, childPath)),
    };
  };

  return toNode(root, []);
}

/** Two-letter initials for an avatar, Eg 'Ada Lovelace' → 'AL'. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
