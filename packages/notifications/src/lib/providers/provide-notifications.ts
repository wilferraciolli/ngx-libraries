import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

import { NGX_NOTIFICATIONS_CONFIG, NotificationsConfig } from '../config/notifications-config.model.js';
import { NotificationsService } from '../services/notifications.service.js';

/**
 * Takes a *factory*, not a plain config object — `NotificationsService.refresh()` calls
 * `fetchNotifications()`/`dismissNotification()` later, on a poll tick or a dismiss click, well
 * outside any Angular injection context. `configFactory` itself runs inside one (via `useFactory`,
 * the same reason `ngx-dates`' `NGX_DATES_LOCALE` wiring recipe uses `useFactory` rather than a
 * plain value) — call `inject()` there, once, and close over the result:
 *
 * ```ts
 * provideNotifications(() => {
 *   const api = inject(ApiClientService);
 *   return { fetchNotifications: () => api.get(...), ... };
 * })
 * ```
 *
 * A callback that called `inject()` directly inside itself would throw `NG0203` the first time a
 * poll tick actually invoked it.
 *
 * Also eagerly constructs `NotificationsService` at app startup (via `provideAppInitializer`, the
 * same sequencing `ngx-auth`'s `provideAuth()` uses for `AuthStore`) — so the badge's first fetch is
 * already in flight before any component that would otherwise trigger construction (by injecting
 * the service) has rendered.
 */
export function provideNotifications<TNotification = unknown>(
  configFactory: () => NotificationsConfig<TNotification>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGX_NOTIFICATIONS_CONFIG, useFactory: configFactory },
    provideAppInitializer(() => {
      inject(NotificationsService);
    }),
  ]);
}
