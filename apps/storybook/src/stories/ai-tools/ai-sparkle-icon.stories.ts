import type { Meta, StoryObj } from '@storybook/angular';
import { AiSparkleIcon } from '@wiltech-labs/ngx-ai-tools';

const meta: Meta<AiSparkleIcon> = {
  title: 'ngx-ai-tools/AiSparkleIcon',
  component: AiSparkleIcon,
  parameters: {
    docs: {
      description: {
        component: `The four-pointed sparkle used to mark AI features. Decorative (\`aria-hidden\`): put the meaning in nearby text.

Gradient fill by default; \`monochrome\` switches to \`currentColor\` for use on a coloured background.`,
      },
    },
  },
  argTypes: {
    size: { description: 'Any CSS length, e.g. `24px`, `2rem`.' },
    monochrome: { description: 'Use the surrounding text colour instead of the gradient.' },
  },
};

export default meta;
type Story = StoryObj<AiSparkleIcon>;

export const Default: Story = { args: { size: '24px' } };

export const Large: Story = { args: { size: '64px' } };

export const Monochrome: Story = {
  args: { size: '32px', monochrome: true },
  render: (args) => ({
    props: args,
    template: `
      <span style="display: inline-flex; padding: 12px; border-radius: 12px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary)">
        <ngx-ai-sparkle-icon [size]="size" [monochrome]="monochrome" />
      </span>`,
  }),
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => ({
    template: `
      <div class="Story-row">
        <ngx-ai-sparkle-icon size="16px" />
        <ngx-ai-sparkle-icon size="24px" />
        <ngx-ai-sparkle-icon size="32px" />
        <ngx-ai-sparkle-icon size="48px" />
        <ngx-ai-sparkle-icon size="64px" />
      </div>`,
  }),
};

export const InlineWithText: Story = {
  name: 'Inline with text',
  render: () => ({
    template: `<p class="Story-note"><ngx-ai-sparkle-icon size="16px" /> Suggested by AI. Check before sending.</p>`,
  }),
};
