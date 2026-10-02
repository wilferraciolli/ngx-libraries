import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { AiButton } from '@wiltech-labs/ngx-ai-tools';

const meta: Meta<AiButton> = {
  title: 'ngx-ai-tools/AiButton',
  component: AiButton,
  parameters: {
    docs: {
      description: {
        component: `Gradient-filled button for AI actions ("Ask AI", "Generate", "Summarise"), with a monochrome sparkle before the label.

\`clicked\` only fires while the button is enabled. Open the **Actions** panel to see it.`,
      },
    },
  },
  argTypes: {
    label: { description: 'Visible text, also the accessible name.' },
    disabled: { description: 'Disables the button; `clicked` will not emit.' },
    clicked: { description: 'Emitted on click while enabled.' },
  },
  args: { clicked: fn() },
};

export default meta;
type Story = StoryObj<AiButton>;

export const Default: Story = { args: { label: 'Ask AI' } };

export const Disabled: Story = { args: { label: 'Generate summary', disabled: true } };

export const LongLabel: Story = {
  name: 'Long label',
  args: { label: 'Draft a reply based on the whole conversation' },
};

export const NextToOtherActions: Story = {
  name: 'Next to other actions',
  parameters: {
    docs: {
      description: { story: 'Typical placement: one AI action alongside ordinary buttons.' },
    },
  },
  args: { label: 'Summarise' },
  render: (args) => ({
    props: args,
    template: `
      <div class="Story-row">
        <ngx-ai-button [label]="label" [disabled]="disabled" (clicked)="clicked()" />
        <button type="button">Edit</button>
        <button type="button">Delete</button>
      </div>`,
  }),
};
