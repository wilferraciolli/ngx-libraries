import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AiButton, AiPanel } from '@wiltech-labs/ngx-ai-tools';

const meta: Meta<AiPanel> = {
  title: 'ngx-ai-tools/AiPanel',
  component: AiPanel,
  decorators: [moduleMetadata({ imports: [AiButton] })],
  parameters: {
    docs: {
      description: {
        component: `Panel with a smooth animated gradient around its border, marking AI-generated or AI-assisted content.

An optional \`title\` adds a header with the sparkle icon. Content is projected.

The animated border is the one sanctioned ambient animation in the libraries, and stops under \`prefers-reduced-motion\`.`,
      },
    },
  },
  argTypes: {
    title: { description: 'Optional header text, shown with the sparkle icon.' },
  },
  render: (args) => ({
    props: args,
    template: `
      <ngx-ai-panel [title]="title">
        <p>Your policy renews on 14 November. Based on last year, expect a premium between £410 and £455.</p>
      </ngx-ai-panel>`,
  }),
};

export default meta;
type Story = StoryObj<AiPanel>;

export const WithTitle: Story = { name: 'With title', args: { title: 'AI summary' } };

export const WithoutTitle: Story = { name: 'Without title', args: {} };

export const WithActions: Story = {
  name: 'With actions',
  parameters: {
    docs: { description: { story: 'A generated answer with follow-up actions inside the panel.' } },
  },
  render: () => ({
    template: `
      <ngx-ai-panel title="Suggested reply">
        <p>Hi Sam, thanks for getting in touch. Your claim has been received and an adjuster will contact you within two working days.</p>
        <div class="Story-row">
          <ngx-ai-button label="Regenerate" />
          <button type="button">Use this reply</button>
        </div>
      </ngx-ai-panel>`,
  }),
};

export const LongContent: Story = {
  name: 'Long content',
  render: () => ({
    template: `
      <ngx-ai-panel title="Meeting notes">
        <ul>
          <li>Q3 claims volume is up 12% on Q2, mostly windscreen and minor collision claims.</li>
          <li>Average handling time dropped from 6.1 to 4.8 days after the triage change.</li>
          <li>Two new insurer integrations go live next month; pricing rules need a review first.</li>
          <li>Action: the support team will draft FAQ updates for the new renewal flow.</li>
          <li>Action: finance to confirm the refund policy wording before the 1st.</li>
        </ul>
      </ngx-ai-panel>`,
  }),
};
