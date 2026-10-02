import type { Meta, StoryObj } from '@storybook/angular';
import { CardLoader } from '@wiltech-labs/ngx-media';

const meta: Meta<CardLoader> = {
  title: 'ngx-media/CardLoader',
  component: CardLoader,
  parameters: {
    docs: {
      description: {
        component: `Skeleton for a card: avatar plus title/subtitle header, then a body of shimmer lines (a \`ContentLoader\`).

Decorative (\`aria-hidden\`). Shimmer stops under \`prefers-reduced-motion\`.`,
      },
    },
  },
  argTypes: {
    lines: {
      description: 'Body lines under the header.',
      control: { type: 'range', min: 0, max: 8 },
    },
  },
};

export default meta;
type Story = StoryObj<CardLoader>;

export const Default: Story = { args: { lines: 2 } };

export const HeaderOnly: Story = { name: 'Header only', args: { lines: 0 } };

export const TallBody: Story = { name: 'Tall body', args: { lines: 6 } };

export const FeedList: Story = {
  name: 'Feed of loading cards',
  render: () => ({
    template: `
      <div class="Story-stack" aria-busy="true" aria-label="Loading posts">
        <ngx-card-loader />
        <ngx-card-loader [lines]="3" />
        <ngx-card-loader [lines]="1" />
      </div>`,
  }),
};

export const Grid: Story = {
  name: 'Grid of loading cards',
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
        @for (i of [1, 2, 3, 4, 5, 6]; track i) {
          <ngx-card-loader />
        }
      </div>`,
  }),
};
