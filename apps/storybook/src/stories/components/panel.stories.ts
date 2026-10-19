import type { Meta, StoryObj } from '@storybook/angular';
import { Panel } from '@wiltech-labs/ngx-components';

const meta: Meta<Panel> = {
  title: 'ngx-components/Panel',
  component: Panel,
  parameters: {
    docs: {
      description: {
        component: `Full-width expandable section built on \`mat-expansion-panel\`.

The header (optional Material Symbols icon, title, optional subheader) is always visible; the projected body only shows once expanded. Animation, keyboard handling and ripple come from Angular Material.`,
      },
    },
  },
  argTypes: {
    header: { description: 'Title, always visible.' },
    subheader: { description: 'Secondary line under the title, always visible.' },
    icon: { description: 'Material Symbols ligature name shown before the title, e.g. `tune`.' },
  },
  render: (args) => ({
    props: args,
    template: `
      <ngx-panel [header]="header" [subheader]="subheader" [icon]="icon">
        <p>Expanded content goes here. Anything can be projected: text, forms, tables.</p>
      </ngx-panel>`,
  }),
};

export default meta;
type Story = StoryObj<Panel>;

export const Default: Story = {
  args: { header: 'Advanced settings' },
};

export const WithIcon: Story = {
  name: 'With icon',
  args: { header: 'Notifications', icon: 'notifications' },
};

export const WithSubheader: Story = {
  name: 'With icon and subheader',
  args: {
    header: 'Privacy',
    subheader: 'Choose who can see your profile and activity',
    icon: 'lock',
  },
};

export const Accordion: Story = {
  name: 'Several panels (accordion-like)',
  parameters: {
    docs: {
      description: { story: 'Panels stacked one after another, each opening independently.' },
    },
  },
  render: () => ({
    template: `
      <div class="Story-stack">
        <ngx-panel header="Profile" icon="person" subheader="Name, photo and contact details">
          <p>Profile fields…</p>
        </ngx-panel>
        <ngx-panel header="Security" icon="shield" subheader="Password and two-factor authentication">
          <p>Security options…</p>
        </ngx-panel>
        <ngx-panel header="Billing" icon="credit_card">
          <p>Billing history…</p>
        </ngx-panel>
      </div>`,
  }),
};

export const LongHeader: Story = {
  name: 'Long header (wraps)',
  args: {
    header:
      'Automatically archive conversations that have had no activity for more than ninety days',
    subheader: 'Archived conversations can still be found through search and restored at any time',
    icon: 'archive',
  },
};
