import { Injectable, Signal, inject, signal } from '@angular/core';

import { NGX_NOTIFICATIONS_CONFIG, NotificationsConfig } from '../config/notifications-config.model.js';

const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Root-provided, one per app (same "one instance, self-managing" shape as `ngx-web-sockets`'
 * `WebSocketService`). Fetches once immediately, then polls on `config.pollIntervalMs` (default 5
 * minutes) for the rest of the app's lifetime — never websockets, confirmed explicitly during
 * design.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService<TNotification = unknown> {
  private readonly config = inject<NotificationsConfig<TNotification>>(NGX_NOTIFICATIONS_CONFIG);

  private readonly notificationsSignal = signal<TNotification[]>([]);
  private readonly unreadCountSignal = signal(0);
  private readonly loadingSignal = signal(true);
  private readonly errorSignal = signal<unknown>(null);

  readonly notifications: Signal<TNotification[]> = this.notificationsSignal.asReadonly();
  readonly unreadCount: Signal<number> = this.unreadCountSignal.asReadonly();
  readonly loading: Signal<boolean> = this.loadingSignal.asReadonly();
  readonly error: Signal<unknown> = this.errorSignal.asReadonly();

  constructor() {
    void this.refresh();
    setInterval(() => void this.refresh(), this.config.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS);
  }

  /** Re-fetches immediately, outside the normal poll tick — the panel opening is a reasonable time
   *  to call this, so the list isn't up to `pollIntervalMs` stale when the user actually looks. */
  async refresh(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const page = await this.config.fetchNotifications();
      this.notificationsSignal.set(page.items);
      this.unreadCountSignal.set(page.unreadCount);
      this.errorSignal.set(null);
    } catch (error) {
      this.errorSignal.set(error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async dismiss(notification: TNotification): Promise<void> {
    await this.config.dismissNotification(notification);
    await this.refresh();
  }

  open(notification: TNotification): void {
    this.config.openNotification(notification);
  }
}
