import type { Meta, StoryObj } from '@storybook/angular';
import { DoughnutGraph } from '@wiltech-labs/ngx-graphs';
import { empty, manyCategories, marketShare } from './graph-samples';

const meta: Meta<DoughnutGraph> = {
  title: 'ngx-graphs/DoughnutGraph',
  component: DoughnutGraph,
  parameters: {
    docs: {
      description: {
        component: `Same as PieGraph with a hollow centre — same part-to-whole reading, less ink.

Renders inside \`GraphFrame\` with a "Show data" table alongside the chart. Colours come from the house categorical palette.`,
      },
    },
  },
  argTypes: {
    graphDef: {
      description:
        '`{ labels, series: [{ label, data }], title? }` — build it with `graphConfig()`. Exactly one series is the usual case.',
    },
  },
};

export default meta;
type Story = StoryObj<DoughnutGraph>;

export const Default: Story = { args: { graphDef: marketShare } };

export const ManyCategories: Story = {
  name: 'Many categories',
  args: { graphDef: manyCategories },
};

export const EmptyData: Story = {
  name: 'Empty data',
  args: { graphDef: empty },
};
