import type { Meta, StoryObj } from '@storybook/angular';
import { LineGraph } from '@wiltech-labs/ngx-graphs';
import { empty, manyCategories, marketShare, quarterlySales } from './graph-samples';

const meta: Meta<LineGraph> = {
  title: 'ngx-graphs/LineGraph',
  component: LineGraph,
  parameters: {
    docs: {
      description: {
        component: `Trends over an ordered category axis — one line per series.

Renders inside \`GraphFrame\`: the \`graphDef.title\` becomes the figure caption, and a "Show data" toggle reveals the same series as an accessible table — the chart and the table read the same data, so nothing shown visually is screen-reader-only.

Colours come from the house categorical palette, resolved from the app's Material 3 tokens, in series order — never set per series by the caller.`,
      },
    },
  },
  argTypes: {
    graphDef: {
      description:
        '`{ labels, series: [{ label, data }], title? }` — build it with `graphConfig()`.',
    },
  },
};

export default meta;
type Story = StoryObj<LineGraph>;

export const TwoSeries: Story = { name: 'Two series', args: { graphDef: quarterlySales } };

export const SingleSeries: Story = {
  name: 'Single series (no legend)',
  parameters: {
    docs: {
      description: {
        story:
          'With only one series there is nothing for a legend to distinguish, so it is hidden.',
      },
    },
  },
  args: { graphDef: marketShare },
};

export const ManyCategories: Story = {
  name: 'Many categories',
  args: { graphDef: manyCategories },
};

export const EmptyData: Story = {
  name: 'Empty data',
  parameters: {
    docs: {
      description: {
        story: 'No labels/series yet — shown while a real data source has not returned anything.',
      },
    },
  },
  args: { graphDef: empty },
};
