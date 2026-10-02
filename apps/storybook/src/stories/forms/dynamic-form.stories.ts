import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BaseSchema, formConfig } from '@wiltech-labs/ngx-forms';
import { DynamicFormHost } from './dynamic-form-host';

interface FlightSchema extends BaseSchema {
  schemaType: 'flight';
  from: string;
  to: string;
  date: string;
  delayed: boolean;
}

interface AppointmentSchema extends BaseSchema {
  schemaType: 'appointment';
  name: string;
  kind: string;
  startDate: string;
  startTime: string;
  duration: number;
}

interface AllFieldsSchema extends BaseSchema {
  schemaType: 'allFields';
  username: string;
  email: string;
  password: string;
  birthDate: string;
  appointmentTime: string;
  eventDateTime: string;
  gender: string;
  country: string;
  acceptTerms: boolean;
  age: number;
  satisfaction: number;
  bio: string;
  keywords: string[];
  colorScheme: string;
}

const meta: Meta<DynamicFormHost<BaseSchema>> = {
  title: 'ngx-forms/DynamicForm',
  component: DynamicFormHost,
  decorators: [moduleMetadata({ imports: [DynamicFormHost] })],
  parameters: {
    docs: {
      description: {
        component: `Configuration-driven form: describe the fields once with \`formConfig()\`, hand the result's \`.fields\` and an \`@angular/forms/signals\` \`FieldTree\` to \`<ngx-dynamic-form>\`.

- Every field validates as you type (required, length, pattern, min/max, email, date/time range) and shows its message inline.
- \`(onFormSubmit)\` fires when the form is valid; \`(onFormClear)\` resets to the schema's initial value.
- \`submitLabel\`/\`clearLabel\` rename the two buttons.
- The three date/time field types (instant-date-time, business-date, business-time) are built on \`Temporal\`, not \`Date\` — see \`ngx-dates\`/\`docs/ANGULAR_APP_CONVENTIONS.md\` "Dates and times".

These stories show the component wrapped in a small host that owns the entity signal and form tree — see \`dynamic-form-host.ts\` in this folder. In your app you write that wiring once, inline.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DynamicFormHost<BaseSchema>>;

const flightConfig = formConfig<FlightSchema>('flight')
  .text('from', 'Departure City', { required: true, minLength: 3, maxLength: 20 })
  .text('to', 'Destination City', { required: true, minLength: 3, maxLength: 20 })
  .instantDateTime('date', 'Departure Date & Time', { required: true })
  .checkbox('delayed', 'Delayed')
  .build({ from: '', to: '', date: '', delayed: false });

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A small form: text, an instant date-time, and a checkbox, each with required/length validation.',
      },
    },
  },
  args: { schemaConfig: flightConfig },
};

const appointmentConfig = formConfig<AppointmentSchema>('appointment')
  .text('name', 'Appointment Name', { required: true, minLength: 3, maxLength: 30 })
  .radio(
    'kind',
    'Type',
    [
      { label: 'In person', value: 'in_person' },
      { label: 'Video call', value: 'video' },
      { label: 'Phone', value: 'phone' },
    ],
    { required: true, hint: 'Horizontal radio (the default orientation).' },
  )
  .businessDate('startDate', 'Date', { required: true })
  .businessTime('startTime', 'Time', { required: true })
  .number('duration', 'Duration (minutes)', { required: true, min: 5, max: 480 })
  .build({ name: '', kind: 'in_person', startDate: '', startTime: '', duration: 30 });

export const RadioAndDateTime: Story = {
  name: 'Radio, business date/time and number',
  args: { schemaConfig: appointmentConfig },
};

const allFieldsConfig = formConfig<AllFieldsSchema>('allFields')
  .text('username', 'Username', {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: '[a-z0-9.]+',
    patternMessage: 'Username can only use lowercase letters, digits and dots',
    hint: 'Short, single-line text — names, identifiers.',
  })
  .email('email', 'Email', {
    required: true,
    hint: 'Text with the email keyboard on mobile and a valid-address check.',
  })
  .password('password', 'Password', {
    required: true,
    minLength: 8,
    hint: "Same as text, but the browser masks what's typed.",
  })
  .businessDate('birthDate', 'Birth Date', {
    required: true,
    hint: 'A calendar date with no timezone (YYYY-MM-DD).',
  })
  .businessTime('appointmentTime', 'Appointment Time', {
    required: true,
    hint: 'A time of day with no date or timezone (HH:mm).',
  })
  .instantDateTime('eventDateTime', 'Event Date & Time', {
    required: true,
    hint: 'An exact moment, stored as a UTC instant.',
  })
  .radio(
    'gender',
    'Gender',
    [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
      { label: 'Prefer not to say', value: 'not_specified' },
    ],
    {
      required: true,
      orientation: 'vertical',
      hint: 'A small set of mutually-exclusive options, all visible at once.',
    },
  )
  .select(
    'country',
    'Country',
    [
      { label: 'United Kingdom', value: 'uk' },
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'Germany', value: 'de' },
    ],
    { required: true, hint: 'A longer list, collapsed into a dropdown to save space.' },
  )
  .number('age', 'Age', {
    required: true,
    min: 0,
    max: 130,
    hint: 'A whole number, numeric keyboard on mobile.',
  })
  .range('satisfaction', 'Satisfaction Level (1-10)', {
    min: 1,
    max: 10,
    step: 1,
    hint: 'Picking a value in a range matters more than typing an exact number.',
  })
  .textarea('bio', 'Bio', {
    maxLength: 500,
    maxWidth: '900px',
    hint: 'Free-form text that may run to several lines.',
  })
  .checkbox('acceptTerms', 'Accept Terms & Conditions', {
    required: true,
    hint: 'A single yes/no toggle. Required means it must be ticked.',
  })
  .chips('keywords', 'Keywords', {
    maxWidth: '900px',
    hint: 'Type a word, press Enter or comma to add it as a chip; click the x to remove one.',
  })
  .theme(
    'colorScheme',
    'Color Scheme',
    [
      { label: 'Day', value: 'light' },
      { label: 'Night', value: 'dark' },
      { label: 'Auto', value: 'system' },
    ],
    {
      hint: 'A fixed light/dark/system choice, shown as a sun/moon/auto toggle instead of a dropdown.',
    },
  )
  .build({
    username: '',
    email: '',
    password: '',
    birthDate: '',
    appointmentTime: '',
    eventDateTime: '',
    gender: 'not_specified',
    country: 'uk',
    acceptTerms: false,
    age: 18,
    satisfaction: 5,
    bio: '',
    keywords: [],
    colorScheme: 'light',
  });

export const EveryFieldType: Story = {
  name: 'Every field type',
  parameters: {
    docs: {
      description: {
        story:
          'One of each of the 13 field types `FormConfigBuilder` supports (text/email/password/radio/select/number/range/textarea/chips/theme and the 3 date-time types), empty — see "Prefilled" for the same schema filled in.',
      },
    },
  },
  args: { schemaConfig: allFieldsConfig },
};

const allFieldsPrefilledConfig = {
  ...allFieldsConfig,
  initialValue: {
    ...allFieldsConfig.initialValue,
    username: 'jane.doe',
    email: 'jane.doe@example.com',
    password: 'correct-horse-battery',
    birthDate: '1990-06-15',
    appointmentTime: '14:30',
    eventDateTime: '2026-11-05T09:00:00Z',
    gender: 'not_specified',
    country: 'uk',
    acceptTerms: true,
    age: 29,
    satisfaction: 7,
    bio: 'Full-stack engineer who likes strongly-typed forms.',
    keywords: ['angular', 'signals', 'typescript'],
    colorScheme: 'light',
  },
};

export const Prefilled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same 13 fields, pre-filled with valid data — the "edit an existing record" case.',
      },
    },
  },
  args: { schemaConfig: allFieldsPrefilledConfig },
};

export const CustomButtonLabels: Story = {
  name: 'Custom Save/Clear labels',
  args: { schemaConfig: flightConfig, submitLabel: 'Book flight', clearLabel: 'Start over' },
};
