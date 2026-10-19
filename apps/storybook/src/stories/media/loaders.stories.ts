import type { Meta, StoryObj } from '@storybook/angular';
import { ContentLoader } from '@wiltech-labs/ngx-media';

const meta: Meta<ContentLoader> = {
  title: 'ngx-media/ContentLoader',
  component: ContentLoader,
  parameters: {
    docs: {
      description: {
        component: `Fills whatever space its container gives it with paragraph-shaped shimmer lines.

Decorative (\`aria-hidden\`): put \`aria-busy="true"\` on the region being filled and announce the result there. The shimmer stops under \`prefers-reduced-motion\`.`,
      },
    },
  },
  argTypes: {
    lines: { description: 'Number of shimmer lines.', control: { type: 'range', min: 1, max: 12 } },
  },
};

export default meta;
type Story = StoryObj<ContentLoader>;

export const Default: Story = { args: { lines: 3 } };

export const SingleLine: Story = { name: 'Single line', args: { lines: 1 } };

export const ManyLines: Story = { name: 'Many lines', args: { lines: 10 } };

export const NarrowContainer: Story = {
  name: 'In a narrow container',
  parameters: { docs: { description: { story: 'Takes its width from the container.' } } },
  args: { lines: 4 },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 240px"><ngx-content-loader [lines]="lines" /></div>`,
  }),
};

export const BusyRegion: Story = {
  name: 'Inside an aria-busy region',
  parameters: {
    docs: {
      description: {
        story:
          'The recommended pattern: the container carries `aria-busy`, the loader stays hidden from assistive tech.',
      },
    },
  },
  render: () => ({
    template: `
      <section aria-busy="true" aria-label="Recent activity">
        <ngx-content-loader [lines]="5" />
      </section>`,
  }),
};
