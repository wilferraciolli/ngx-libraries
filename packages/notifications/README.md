# @wiltech-labs/ngx-notifications

A notification bell + unread badge + dropdown panel. Polling, not websockets — you supply three
callbacks (fetch, dismiss, open), and this package handles the interval, the unread count, and the
panel UI.

## Installation

```bash
npm install @wiltech-labs/ngx-notifications
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/cdk` (for the dropdown panel — no
Angular Material dependency).

## Setup

```ts
// app.config.ts
import { ApplicationConfig, inject } from '@angular/core';
import { Router } from '@angular/router';
import { provideNotifications } from '@wiltech-labs/ngx-notifications';
import { ApiClientService } from '@wiltech-labs/ngx-api-client';
import { CurrentUserStore } from '@wiltech-labs/ngx-region-settings';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  links: { dismiss?: { href: string }; target?: { href: string } };
}

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideNotifications<Notification>(() => {
      // Runs once, inside a real injection context (provideNotifications() wires this factory up
      // via useFactory) — inject() here is safe. The callbacks below run later, on a poll tick or a
      // dismiss click, with no injection context of their own, so they close over api/currentUser
      // instead of calling inject() themselves.
      const api = inject(ApiClientService);
      const currentUser = inject(CurrentUserStore);
      const router = inject(Router);

      return {
        fetchNotifications: async () => {
          const link = currentUser.link('notifications');
          if (!link) return { items: [], unreadCount: 0 };
          return api.get<'notifications', { items: Notification[]; unreadCount: number }>(
            'notifications',
            api.resolve(link)!,
          );
        },
        dismissNotification: async (notification) => {
          await api.delete(api.resolve(notification.links.dismiss)!);
        },
        openNotification: (notification) => {
          void router.navigate(['/', notification.links.target?.href]);
        },
      };
    }),
  ],
};
```

This package never imports `@wiltech-labs/ngx-api-client` (or any HTTP client) itself — resolving
the `notifications` link and calling your API is entirely your callback's job. `ngx-region-settings`'
`CurrentUserStore.link('notifications')` is a convenient (optional) way to get that link if you're
already using that package; nothing here depends on it.

`provideNotifications()` takes a **factory**, not a plain config object — see the code comment above
(and this package's own `CLAUDE.md`) for why: the callbacks it returns run later, outside any
injection context, so they can't call `inject()` directly themselves.

## Usage

```html
<ngx-notifications>
  <ng-template let-notification>
    <strong>{{ notification.title }}</strong>
    <p>{{ notification.body }}</p>
  </ng-template>
</ngx-notifications>
```

Drop it into your nav bar — no inputs required. Clicking a notification's body calls your
`openNotification` callback and closes the panel; clicking its dismiss button calls
`dismissNotification` and refreshes the list. The projected `<ng-template let-notification>` is
almost always worth providing — without one, the panel falls back to a raw JSON dump of each item
(useful for wiring this up, not for shipping).

### Reading state from logic

```ts
import { Component, inject } from '@angular/core';
import { NotificationsService } from '@wiltech-labs/ngx-notifications';

@Component({ selector: 'app-something', /* ... */ })
export class Something {
  protected readonly notifications = inject<NotificationsService<Notification>>(NotificationsService);
  // notifications.notifications(), notifications.unreadCount(), notifications.loading(), notifications.error()
}
```

### Config

```ts
interface NotificationsConfig<TNotification> {
  fetchNotifications: () => Promise<{ items: TNotification[]; unreadCount: number }>;
  dismissNotification: (notification: TNotification) => Promise<void>;
  openNotification: (notification: TNotification) => void;
  pollIntervalMs?: number; // default 5 minutes
}
```

`unreadCount` is whatever your `fetchNotifications()` returns — this package never inspects an
item's fields to guess which ones are unread.

## Layout

```
src/
├── public-api.ts
└── lib/
    ├── config/             # NotificationsConfig, NGX_NOTIFICATIONS_CONFIG, NGX_NOTIFICATIONS_TEXT
    ├── services/notifications.service.ts   # NotificationsService
    ├── providers/provide-notifications.ts  # provideNotifications()
    └── components/notifications-widget/    # NotificationsWidget
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/notifications
npm run build
cd dist
npm publish
```

Ensure `version` in the source `package.json` is updated before building, per semver conventions.
