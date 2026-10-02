import type { Meta, StoryObj } from '@storybook/angular';
import { ScatterGraph } from '@wiltech-labs/ngx-graphs';
import { pointGraphConfig } from '@wiltech-labs/ngx-graphs';
import { scatterPoints } from './graph-samples';

const emptyPoints = pointGraphConfig().title('No data yet').build();

const meta: Meta<ScatterGraph> = {
  title: 'ngx-graphs/ScatterGraph',
  component: ScatterGraph,
  parameters: {
    docs: {
      description: {
        component: `x/y scatter of individual points — the correlation case, without \`BubbleGraph\`'s third \`r\` dimension (ignored here if present).

Renders inside \`GraphFrame\` with a "Show data" table.`,
      },
    },
  },
  argTypes: {
    graphDef: {
      description:
        '`{ series: [{ label, data: [{ x, y }] }], title? }` — build it with `pointGraphConfig()`.',
    },
  },
};

export default meta;
type Story = StoryObj<ScatterGraph>;

export const Default: Story = { args: { graphDef: scatterPoints } };

export const EmptyData: Story = { name: 'Empty data', args: { graphDef: emptyPoints } };
