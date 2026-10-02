import type { Meta, StoryObj } from '@storybook/angular';
import { RegionSettingsFormComponent } from '@wiltech-labs/ngx-region-settings';
import type { RegionSettingsFieldOptions } from '@wiltech-labs/ngx-region-settings';
import { fn } from 'storybook/test';

const OPTIONS: RegionSettingsFieldOptions = {
  timezone: [
    { label: 'London', value: 'Europe/London' },
    { label: 'Nicosia', value: 'Asia/Nicosia' },
    { label: 'Sao Paulo', value: 'America/Sao_Paulo' },
  ],
  language: [
    { label: 'English', value: 'en' },
    { label: 'Greek', value: 'el' },
  ],
  locale: [
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'Greek (Cyprus)', value: 'el-CY' },
  ],
  currency: [
    { label: 'British Pound', value: 'GBP' },
    { label: 'Euro', value: 'EUR' },
  ],
  theme: [
    { label: 'Day', value: 'light' },
    { label: 'Night', value: 'dark' },
    { label: 'Auto', value: 'system' },
  ],
};

const meta: Meta<RegionSettingsFormComponent> = {
  title: 'ngx-region-settings/RegionSettingsFormComponent',
  component: RegionSettingsFormComponent,
  parameters: {
    docs: {
      description: {
        component: `The settings-editing form behind \`ngx-region-settings\` — timezone, language, locale, currency and theme, each an \`ngx-forms\` \`SelectField\` (theme uses \`ThemeField\`).

This component itself is plain inputs/outputs and takes **no** dependency on \`AuthStore\`/\`ApiClientService\` directly — \`options\` (allowed values, from the API's \`_metadata\`) and \`settings\` (current values) are resolved by \`RegionSettingsStore\` in a real app and simply passed in. These stories supply fixed sample data instead, so there's no fake backend to wire up for the component itself.

Save is disabled until something actually changes from \`settings\` (\`linkedSignal\` tracks the diff) and shows a "Saving…" state while \`saving\` is true.`,
      },
    },
  },
  argTypes: {
    settings: { description: 'Current `{ timezone, language, locale, currency, theme }`.' },
    options: {
      description:
        "Allowed values per field, already resolved/translated — normally the store's `options` signal.",
    },
    hints: { description: 'Optional hint text per field.' },
    saving: { description: 'Shows the "Saving…" state and disables the button.' },
    save: { description: 'Emitted with the edited payload when Save is clicked.' },
  },
  args: { save: fn() },
};

export default meta;
type Story = StoryObj<RegionSettingsFormComponent>;

export const Loaded: Story = {
  args: {
    settings: {
      timezone: 'Europe/London',
      language: 'en',
      locale: 'en-GB',
      currency: 'GBP',
      theme: 'light',
    },
    options: OPTIONS,
  },
};

export const WithHints: Story = {
  name: 'With hints',
  args: {
    settings: {
      timezone: 'Europe/London',
      language: 'en',
      locale: 'en-GB',
      currency: 'GBP',
      theme: 'light',
    },
    options: OPTIONS,
    hints: {
      timezone: 'Used for every scheduled notification and report export.',
      locale: 'Changes how dates and numbers are shown — not the app language.',
    },
  },
};

export const Saving: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The button shows "Saving…" and is disabled while a save is in flight.',
      },
    },
  },
  args: {
    settings: {
      timezone: 'Europe/London',
      language: 'en',
      locale: 'en-GB',
      currency: 'GBP',
      theme: 'light',
    },
    options: OPTIONS,
    saving: true,
  },
};

export const UsingSystemDefault: Story = {
  name: 'Using the system default (owner_type: SYSTEM)',
  parameters: {
    docs: {
      description: {
        story:
          "The same form renders a user's own settings or the system defaults — `owner_type` on the loaded `RegionSettings` (not shown here, it's outside `RegionSettingsPayload`) is what a real app would use to label this state.",
      },
    },
  },
  args: {
    settings: {
      timezone: 'Europe/London',
      language: 'en',
      locale: 'en-GB',
      currency: 'GBP',
      theme: 'light',
    },
    options: OPTIONS,
  },
};
