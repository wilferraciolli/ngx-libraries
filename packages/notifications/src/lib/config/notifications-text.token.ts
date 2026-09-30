import { InjectionToken } from '@angular/core';

export interface NotificationsText {
  /** The trigger button's accessible name — receives the current unread count. */
  triggerLabel: (unreadCount: number) => string;
  panelTitle: string;
  loading: string;
  empty: string;
  error: string;
  dismiss: string;
  close: string;
}

export const DEFAULT_NOTIFICATIONS_TEXT: NotificationsText = {
  triggerLabel: (unreadCount) =>
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications',
  panelTitle: 'Notifications',
  loading: 'Loading…',
  empty: 'No notifications.',
  error: 'Something went wrong loading notifications.',
  dismiss: 'Dismiss',
  close: 'Close',
};

/**
 * Same resolver-function pattern as `ngx-graphs`' `NGX_GRAPHS_TEXT` / `ngx-web-sockets`'
 * `NGX_CHAT_TEXT` — override it (e.g. wired to `ngx-translations`) to translate it; leave it unset
 * and it stays English.
 */
export const NGX_NOTIFICATIONS_TEXT = new InjectionToken<() => NotificationsText>(
  'NGX_NOTIFICATIONS_TEXT',
  { providedIn: 'root', factory: () => () => DEFAULT_NOTIFICATIONS_TEXT },
);
