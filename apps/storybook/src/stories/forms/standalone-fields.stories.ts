import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FieldDef, FormFieldType } from '@wiltech-labs/ngx-forms';
import { StandaloneFieldHost } from './standalone-field-host';

const meta: Meta<StandaloneFieldHost> = {
  title: 'ngx-forms/Standalone fields',
  component: StandaloneFieldHost,
  decorators: [moduleMetadata({ imports: [StandaloneFieldHost] })],
  parameters: {
    docs: {
      description: {
        component: `Every field component — \`TextField\`, \`SelectField\`, \`RadioField\`, \`CheckboxField\`, \`ChipsField\`, \`SliderField\`, \`ThemeField\`, the textarea/code field, and the three date/time fields — takes a \`[fieldDef]\` and a \`[field]\`, the same two inputs \`DynamicForm\` passes them internally. Use them directly, one at a time in your own layout, when you don't want \`DynamicForm\`'s whole-form Save/Clear chrome.

Each story below is one field type on its own. All of them share the small \`StandaloneFieldHost\` wrapper in this folder, which gives each field a one-property form.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<StandaloneFieldHost>;

export const Text: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.TEXT,
      label: 'Full name',
      required: true,
      hint: 'Short, single-line text.',
    } satisfies FieldDef,
  },
};

export const Select: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.SELECT,
      label: 'Country',
      required: true,
      options: [
        { label: 'United Kingdom', value: 'uk' },
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
      ],
    } satisfies FieldDef,
    initialValue: 'uk',
  },
};

export const Radio: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.RADIO,
      label: 'Delivery speed',
      orientation: 'vertical',
      options: [
        { label: 'Standard (3-5 days)', value: 'standard' },
        { label: 'Express (next day)', value: 'express' },
      ],
    } satisfies FieldDef,
    initialValue: 'standard',
  },
};

export const Checkbox: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.CHECKBOX,
      label: 'Email me about offers',
    } satisfies FieldDef,
  },
};

export const Chips: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.CHIPS,
      label: 'Tags',
      hint: 'Press Enter or comma to add a chip.',
    } satisfies FieldDef,
    initialValue: ['angular', 'signals'],
  },
};

export const Slider: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.RANGE,
      label: 'Satisfaction (1-10)',
      min: 1,
      max: 10,
      step: 1,
    } satisfies FieldDef,
    initialValue: 7,
  },
};

export const Theme: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.THEME,
      label: 'Color scheme',
      options: [
        { label: 'Day', value: 'light' },
        { label: 'Night', value: 'dark' },
        { label: 'Auto', value: 'system' },
      ],
    } satisfies FieldDef,
    initialValue: 'light',
  },
};

export const Textarea: Story = {
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.TEXTAREA,
      label: 'Notes',
      maxLength: 300,
    } satisfies FieldDef,
  },
};

export const Code: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Monospaced, for code or other formatted text. Tab inserts spaces instead of moving focus.',
      },
    },
  },
  args: {
    fieldDef: { name: 'value', type: FormFieldType.CODE, label: 'Snippet' } satisfies FieldDef,
    initialValue: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}',
  },
};

export const BusinessDate: Story = {
  name: 'Business date',
  parameters: {
    docs: {
      description: {
        story: 'A calendar date with no timezone (`YYYY-MM-DD`) — birthdays, holidays, due dates.',
      },
    },
  },
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.BUSINESS_DATE,
      label: 'Start date',
      required: true,
    } satisfies FieldDef,
  },
};

export const BusinessTime: Story = {
  name: 'Business time',
  parameters: {
    docs: {
      description: {
        story: 'A time of day with no date or timezone (`HH:mm`) — opening hours, daily schedules.',
      },
    },
  },
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.BUSINESS_TIME,
      label: 'Opens at',
      required: true,
    } satisfies FieldDef,
  },
};

export const InstantDateTime: Story = {
  name: 'Instant date-time',
  parameters: {
    docs: {
      description: {
        story:
          'An exact moment, stored as a UTC instant and edited in a timezone — meetings, deadlines, flights.',
      },
    },
  },
  args: {
    fieldDef: {
      name: 'value',
      type: FormFieldType.INSTANT_DATE_TIME,
      label: 'Meeting starts',
      required: true,
      dateTimeConfig: { timeZone: 'Europe/London' },
    } satisfies FieldDef,
  },
};
