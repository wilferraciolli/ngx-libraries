import type { Meta, StoryObj } from '@storybook/angular';
import { BubbleGraph } from '@wiltech-labs/ngx-graphs';
import { pointGraphConfig } from '@wiltech-labs/ngx-graphs';
import { clusterSizes } from './graph-samples';

const singleCluster = pointGraphConfig()
  .series('Cluster A', [
    { x: 10, y: 10, r: 10 },
    { x: 15, y: 5, r: 15 },
    { x: 26, y: 12, r: 23 },
  ])
  .title('Single cluster')
  .build();

const emptyPoints = pointGraphConfig().title('No data yet').build();

const meta: Meta<BubbleGraph> = {
  title: 'ngx-graphs/BubbleGraph',
  component: BubbleGraph,
  parameters: {
    docs: {
      description: {
        component: `x/y scatter where each point also carries a size (\`r\`) — three dimensions in one chart, e.g. cost vs. time vs. team size.

Unlike the category charts above, there is no shared \`labels\` axis: each point is its own \`{ x, y, r }\`. Renders inside \`GraphFrame\` with a "Show data" table.`,
      },
    },
  },
  argTypes: {
    graphDef: {
      description:
        '`{ series: [{ label, data: [{ x, y, r }] }], title? }` — build it with `pointGraphConfig()`.',
    },
  },
};

export default meta;
type Story = StoryObj<BubbleGraph>;

export const TwoClusters: Story = { name: 'Two clusters', args: { graphDef: clusterSizes } };

export const SingleCluster: Story = {
  name: 'Single cluster (no legend)',
  args: { graphDef: singleCluster },
};

export const EmptyData: Story = { name: 'Empty data', args: { graphDef: emptyPoints } };
