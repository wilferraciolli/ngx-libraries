import type { Meta, StoryObj } from '@storybook/angular';
import { OrganizationChart } from '@wiltech-labs/ngx-organization';
import { fn } from 'storybook/test';
import {
  DEEP_TREE_ITEMS,
  SAMPLE_ITEMS,
  SMALL_ORG_ITEMS,
  VACANT_JOBS_ITEMS,
} from './organization/org-samples';

const meta: Meta<OrganizationChart> = {
  title: 'ngx-organization/OrganizationChart',
  component: OrganizationChart,
  parameters: {
    docs: {
      description: {
        component: `Org, entities, departments and jobs on a pan/zoom canvas, Material 3 styled. \`items\` is a flat, API-shaped array — each item points at its \`parentId\`, and an \`OCCUPANCY\` points at the \`JOB\` it fills; \`buildOrgTree()\` turns that into the drawn tree internally.

- Exactly one \`ORG\` (\`parentId: null\`); \`ORG_ENTITY\` and \`DEPARTMENT\` nest under it or each other; \`JOB\`s sit under a department; \`OCCUPANCY\` sits under the job it fills and can repeat for the same \`personId\` across several jobs.
- A \`DEPARTMENT\`'s head job (\`reportingJobId\`) draws merged into the department's own card.
- Clicking a card emits \`nodeSelect\` — typically opened in an \`ngx-modals\` detail panel (modeless, \`backdrop: false\`), as shown in the real app wiring; these stories just log it to Actions.
- A vacant job (no \`OCCUPANCY\`) still draws its card, empty.

These are the same \`OrgItem[]\` arrays an app's own \`OrgChartStore\` would load from the API — the component itself never calls the API; that's the store's job (feature-local, see the package README).`,
      },
    },
  },
  argTypes: {
    items: { description: 'Flat array of org/entity/department/job/occupancy items.' },
    expandedDepth: { description: 'How many levels start expanded. Default: everything.' },
    showMiniMap: { description: 'Shows the pan/zoom mini-map in the corner.' },
    nodeSelect: { description: 'Emitted with the clicked item.' },
  },
  args: { nodeSelect: fn() },
};

export default meta;
type Story = StoryObj<OrganizationChart>;

export const SmallOrg: Story = {
  name: 'Small org',
  args: { items: SMALL_ORG_ITEMS },
};

export const LargerOrg: Story = {
  name: 'Larger org, two people holding two jobs',
  parameters: {
    docs: {
      description: {
        story:
          'Ada Lovelace heads both Board and Web — the same `personId` under two different `JOB`s.',
      },
    },
  },
  args: { items: SAMPLE_ITEMS },
};

export const VacantJobs: Story = {
  name: 'Vacant jobs',
  parameters: {
    docs: { description: { story: 'Jobs with no `OCCUPANCY` still draw a card, empty.' } },
  },
  args: { items: VACANT_JOBS_ITEMS },
};

export const DeepTree: Story = {
  name: 'Deep reporting line',
  args: { items: DEEP_TREE_ITEMS },
};

export const CollapsedByDefault: Story = {
  name: 'Collapsed below depth 2',
  args: { items: SAMPLE_ITEMS, expandedDepth: 2 },
};

export const NoMiniMap: Story = {
  name: 'Without the mini-map',
  args: { items: SMALL_ORG_ITEMS, showMiniMap: false },
};

export const EmptyOrg: Story = {
  name: 'Empty',
  parameters: {
    docs: { description: { story: 'No items yet — the canvas renders with nothing on it.' } },
  },
  args: { items: [] },
};
