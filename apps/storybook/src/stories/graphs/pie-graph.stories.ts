import type { Meta, StoryObj } from '@storybook/angular';
import { PieGraph } from '@wiltech-labs/ngx-graphs';
import { empty, manyCategories, marketShare } from './graph-samples';

const meta: Meta<PieGraph> = {
  title: 'ngx-graphs/PieGraph',
  component: PieGraph,
  parameters: {
    docs: {
      description: {
        component: `Part-to-whole share, each slice one category.

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
type Story = StoryObj<PieGraph>;

export const Default: Story = { args: { graphDef: marketShare } };

export const ManyCategories: Story = {
  name: 'Many categories',
  args: { graphDef: manyCategories },
};

export const EmptyData: Story = {
  name: 'Empty data',
  args: { graphDef: empty },
};
