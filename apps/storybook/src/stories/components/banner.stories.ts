import type { Meta, StoryObj } from '@storybook/angular';
import { Banner } from '@wiltech-labs/ngx-components';
import type { Message } from '@wiltech-labs/ngx-components';

const meta: Meta<Banner> = {
  title: 'ngx-components/Banner',
  component: Banner,
  parameters: {
    docs: {
      description: {
        component: `A stack of info / warning / error lines, one block per \`Message\`, each with its own icon.

- **info** renders with \`role="status"\` (announced politely); **warning** and **error** use \`role="alert"\`.
- No Material dependency: inline SVG icons and \`--mat-sys-*\` tokens with hex fallbacks, so it also works in an unthemed app.
- Use it to explain what a field affects *before* the user picks a value, or to report the result of an action.`,
      },
    },
  },
  argTypes: {
    messages: {
      description:
        'Lines to show, in order. Each one is `{ type: "info" | "warning" | "error", text }`.',
    },
  },
};

export default meta;
type Story = StoryObj<Banner>;

export const Info: Story = {
  args: {
    messages: [
      { type: 'info', text: 'Changing your region also changes how dates and numbers are shown.' },
    ],
  },
};

export const Warning: Story = {
  args: {
    messages: [{ type: 'warning', text: 'Your session expires in 5 minutes. Save your work.' }],
  },
};

export const ErrorMessage: Story = {
  name: 'Error',
  args: {
    messages: [
      {
        type: 'error',
        text: 'We could not save your changes. Check your connection and try again.',
      },
    ],
  },
};

export const MixedStack: Story = {
  name: 'Mixed stack',
  parameters: {
    docs: {
      description: {
        story: 'Several messages of different types render as one stack, in the order given.',
      },
    },
  },
  args: {
    messages: [
      { type: 'info', text: 'Your profile was updated.' },
      { type: 'warning', text: 'Two-factor authentication is still off.' },
      { type: 'error', text: 'Your billing address could not be verified.' },
    ] satisfies Message[],
  },
};

export const LongText: Story = {
  name: 'Long text (wraps)',
  parameters: {
    docs: {
      description: {
        story: 'Long lines wrap under the text column, keeping the icon aligned to the first line.',
      },
    },
  },
  args: {
    messages: [
      {
        type: 'info',
        text: 'The time zone you pick here is used for every scheduled notification, calendar invitation and report export. Events that were already created keep the time zone they were created in, so a meeting set for 09:00 in London still starts at 09:00 London time even after you switch to Athens.',
      },
    ],
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An empty array renders nothing, so the banner can always stay in the template.',
      },
    },
  },
  args: { messages: [] },
};
