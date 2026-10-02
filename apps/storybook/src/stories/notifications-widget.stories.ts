import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NotificationsWidget } from '@wiltech-labs/ngx-notifications';
import {
  ALL_READ_ITEMS,
  UNREAD_ITEMS,
  notificationsFixture,
} from './notifications/notifications-fixture';

const meta: Meta<NotificationsWidget> = {
  title: 'ngx-notifications/NotificationsWidget',
  component: NotificationsWidget,
  parameters: {
    docs: {
      description: {
        component: `A bell with an unread badge that opens a right-docked panel (CDK Overlay, no Angular Material dependency) listing notifications from an app-supplied fetch/dismiss/open backend — \`provideNotifications(() => ({ fetchNotifications, dismissNotification, openNotification }))\`.

No inputs are required, but you almost always project an item template, since the library has no idea what a notification's fields are called:

\`\`\`html
<ngx-notifications>
  <ng-template let-notification>
    <strong>{{ notification.title }}</strong>
    <p>{{ notification.body }}</p>
  </ng-template>
</ngx-notifications>
\`\`\`

Click the bell to open the panel. Each story below provides its own fake backend (see \`notifications-fixture.ts\`), so the badge count differs per story.`,
      },
    },
  },
  render: () => ({
    template: `
      <ngx-notifications>
        <ng-template let-notification>
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.body }}</p>
        </ng-template>
      </ngx-notifications>`,
  }),
};

export default meta;
type Story = StoryObj<NotificationsWidget>;

export const UnreadItems: Story = {
  name: 'Unread items',
  decorators: [moduleMetadata({ providers: notificationsFixture(UNREAD_ITEMS) })],
};

export const AllRead: Story = {
  name: 'All read',
  parameters: { docs: { description: { story: 'Badge shows no count once every item is read.' } } },
  decorators: [moduleMetadata({ providers: notificationsFixture(ALL_READ_ITEMS) })],
};

export const Empty: Story = {
  decorators: [moduleMetadata({ providers: notificationsFixture([]) })],
};

export const FetchError: Story = {
  name: 'Fetch error',
  parameters: {
    docs: {
      description: {
        story: 'The panel shows the configured error message when `fetchNotifications()` rejects.',
      },
    },
  },
  decorators: [moduleMetadata({ providers: notificationsFixture([], true) })],
};
