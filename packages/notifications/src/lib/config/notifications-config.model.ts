import { InjectionToken } from '@angular/core';

export interface NotificationsPage<TNotification = unknown> {
  items: TNotification[];
  /** Computed by the app, not this package — it's the app's own API/data that knows which items
   *  are unread, this package never inspects an item's shape to guess. */
  unreadCount: number;
}

export interface NotificationsConfig<TNotification = unknown> {
  /** Called on every poll tick (and once immediately at startup). The app resolves its own
   *  person-profile `notifications` link and calls its own API — this package never touches
   *  `@wiltech-labs/ngx-api-client` or any HTTP client directly. */
  fetchNotifications: () => Promise<NotificationsPage<TNotification>>;
  /** Called when the user dismisses one notification from the panel. This package refetches
   *  (`fetchNotifications()`) immediately afterward rather than guessing at an optimistic update. */
  dismissNotification: (notification: TNotification) => Promise<void>;
  /** Called when the user clicks a notification's content (not its dismiss button) — deep-linking
   *  is app-specific routing this package can't know, so it's a plain callback, not a route. */
  openNotification: (notification: TNotification) => void;
  /** Default 5 minutes. */
  pollIntervalMs?: number;
}

/** Internal — no default factory, `provideNotifications()` is required to set this. */
export const NGX_NOTIFICATIONS_CONFIG = new InjectionToken<NotificationsConfig<unknown>>(
  'NGX_NOTIFICATIONS_CONFIG',
);
