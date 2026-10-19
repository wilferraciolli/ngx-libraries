import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DateTimeFieldsHost } from './date-time-fields-host';

const meta: Meta<DateTimeFieldsHost> = {
  title: 'ngx-forms/Date & time fields',
  component: DateTimeFieldsHost,
  decorators: [moduleMetadata({ imports: [DateTimeFieldsHost] })],
  parameters: {
    docs: {
      description: {
        component: `The three date/time field types side by side, showing what each one does and does not carry:

- **Instant date-time** stores an exact moment as a UTC instant (\`YYYY-MM-DDThh:mm:ssZ\`) and edits it in a timezone — change the picker above and watch the same instant re-render in a different wall-clock time.
- **Business date** (\`YYYY-MM-DD\`) and **business time** (\`HH:mm\`) ignore timezones entirely.

All three read their display locale from \`NGX_FORMS_LOCALE\` — switch the **Locale** toolbar global (top of the page) to see the date format itself change, not just the translated labels.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DateTimeFieldsHost>;

export const Default: Story = {};
