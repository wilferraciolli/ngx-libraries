import type { Meta, StoryObj } from '@storybook/angular';
import { Card } from '@wiltech-labs/ngx-components';

const meta: Meta<Card> = {
  title: 'ngx-components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `Full-width static container on an outlined \`mat-card\`.

Same header rules as \`Panel\` (optional icon, title, optional subheader), but the content is always visible: a card isn't an accordion.`,
      },
    },
  },
  argTypes: {
    header: { description: 'Title.' },
    subheader: { description: 'Secondary line under the title.' },
    icon: { description: 'Material Symbols ligature name shown before the title.' },
  },
  render: (args) => ({
    props: args,
    template: `
      <ngx-card [header]="header" [subheader]="subheader" [icon]="icon">
        <p>Card content is projected and always visible.</p>
      </ngx-card>`,
  }),
};

export default meta;
type Story = StoryObj<Card>;

export const Default: Story = {
  args: { header: 'Account summary' },
};

export const WithIconAndSubheader: Story = {
  name: 'With icon and subheader',
  args: { header: 'Storage', subheader: '12.4 GB of 15 GB used', icon: 'cloud' },
};

export const RichContent: Story = {
  name: 'Rich content',
  parameters: {
    docs: {
      description: {
        story: 'Any markup can be projected: lists, actions, other library components.',
      },
    },
  },
  render: () => ({
    template: `
      <ngx-card header="Upcoming payments" subheader="Next 30 days" icon="payments">
        <ul>
          <li>Car insurance: £42.10 on 5 November</li>
          <li>Home insurance: £18.75 on 12 November</li>
        </ul>
        <button type="button">View all payments</button>
      </ngx-card>`,
  }),
};

export const Grid: Story = {
  name: 'Cards in a grid',
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))">
        <ngx-card header="Policies" icon="description" subheader="3 active"><p>Car, home, travel.</p></ngx-card>
        <ngx-card header="Claims" icon="assignment" subheader="1 open"><p>Windscreen repair, in review.</p></ngx-card>
        <ngx-card header="Documents" icon="folder" subheader="14 files"><p>Certificates and schedules.</p></ngx-card>
      </div>`,
  }),
};
