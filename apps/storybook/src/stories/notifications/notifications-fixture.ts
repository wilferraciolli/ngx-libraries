import type { Provider } from '@angular/core';
import { NGX_NOTIFICATIONS_CONFIG, NotificationsService } from '@wiltech-labs/ngx-notifications';

export interface DemoNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
}

/**
 * `NotificationsService` is `providedIn: 'root'`, so each story that wants different fake data
 * re-provides both the config token *and* the service class at the story's own component level
 * (`moduleMetadata({ providers: ... })`) — shadowing the root singleton rather than trying to
 * reconfigure it after the fact. There is deliberately no app-wide `provideNotifications()` call in
 * `.storybook/preview.ts`: every story's data is local to it.
 */
export function notificationsFixture(
  initialItems: DemoNotification[],
  failFetch = false,
): Provider[] {
  let items = initialItems;

  return [
    {
      provide: NGX_NOTIFICATIONS_CONFIG,
      useValue: {
        fetchNotifications: async () => {
          if (failFetch) throw new Error('Network error (fixture)');
          return { items: [...items], unreadCount: items.filter((n) => !n.read).length };
        },
        dismissNotification: async (notification: DemoNotification) => {
          items = items.filter((n) => n.id !== notification.id);
        },
        openNotification: (notification: DemoNotification) => {
          items = items.map((n) => (n.id === notification.id ? { ...n, read: true } : n));
        },
      },
    },
    NotificationsService,
  ];
}

export const UNREAD_ITEMS: DemoNotification[] = [
  {
    id: '1',
    title: 'Holiday approved',
    body: 'Your holiday request for next week was approved.',
    read: false,
  },
  { id: '2', title: 'New comment', body: 'Someone commented on your pull request.', read: false },
  { id: '3', title: 'Weekly digest', body: 'Your weekly summary is ready.', read: true },
];

export const ALL_READ_ITEMS: DemoNotification[] = UNREAD_ITEMS.map((item) => ({
  ...item,
  read: true,
}));
