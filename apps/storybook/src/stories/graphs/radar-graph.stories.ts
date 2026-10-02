import type { Meta, StoryObj } from '@storybook/angular';
import { RadarGraph } from '@wiltech-labs/ngx-graphs';
import { graphConfig } from '@wiltech-labs/ngx-graphs';
import { empty } from './graph-samples';

const modelComparison = graphConfig()
  .labels(['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency', 'Design'])
  .series('Model A', [65, 59, 90, 81, 56, 55])
  .series('Model B', [28, 48, 40, 19, 96, 27])
  .title('Model comparison')
  .build();

const singleProfile = graphConfig()
  .labels(['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency', 'Design'])
  .series('Model A', [65, 59, 90, 81, 56, 55])
  .title('Model A profile')
  .build();

const meta: Meta<RadarGraph> = {
  title: 'ngx-graphs/RadarGraph',
  component: RadarGraph,
  parameters: {
    docs: {
      description: {
        component: `Multi-axis comparison — one spoke per category, one shape per series. Good for comparing a small number of items (2-4) across several attributes at once.

Renders inside \`GraphFrame\` with a "Show data" table. Colours come from the house categorical palette.`,
      },
    },
  },
  argTypes: {
    graphDef: {
      description:
        '`{ labels, series: [{ label, data }], title? }` — each label is one spoke/axis.',
    },
  },
};

export default meta;
type Story = StoryObj<RadarGraph>;

export const TwoProfiles: Story = {
  name: 'Two profiles compared',
  args: { graphDef: modelComparison },
};

export const SingleProfile: Story = {
  name: 'Single profile (no legend)',
  args: { graphDef: singleProfile },
};

export const EmptyData: Story = { name: 'Empty data', args: { graphDef: empty } };
