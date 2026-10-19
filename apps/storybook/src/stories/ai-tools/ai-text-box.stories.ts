import type { Meta, StoryObj } from '@storybook/angular';
import { AiTextBox } from '@wiltech-labs/ngx-ai-tools';

const meta: Meta<AiTextBox> = {
  title: 'ngx-ai-tools/AiTextBox',
  component: AiTextBox,
  parameters: {
    docs: {
      description: {
        component: `Prompt box with the same animated gradient border as \`AiPanel\`.

\`value\` is a two-way \`model()\`, so bind it with \`[(value)]\`. \`label\` is the accessible name: the placeholder alone is not a label.`,
      },
    },
  },
  argTypes: {
    value: { description: 'Two-way bound text (`model()`).' },
    placeholder: { description: 'Hint shown while empty.' },
    label: { description: 'Accessible name of the textarea (`aria-label`).' },
  },
};

export default meta;
type Story = StoryObj<AiTextBox>;

export const Empty: Story = { args: {} };

export const CustomPlaceholder: Story = {
  name: 'Custom placeholder and label',
  args: { placeholder: 'Describe the car you want to insure…', label: 'Describe your car' },
};

export const Prefilled: Story = {
  args: { value: 'Summarise the last three claims on this policy' },
};

export const TwoWayBinding: Story = {
  name: 'Two-way binding',
  parameters: {
    docs: { description: { story: 'Typing updates the bound value live, shown underneath.' } },
  },
  render: () => ({
    props: { prompt: 'What does my policy cover abroad?' },
    template: `
      <div class="Story-stack">
        <ngx-ai-text-box [(value)]="prompt" label="Ask about your policy" />
        <pre class="Story-output">value = {{ prompt | json }}</pre>
      </div>`,
  }),
};
