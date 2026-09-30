import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { NGX_NOTIFICATIONS_TEXT } from '../../config/notifications-text.token.js';
import { NotificationsService } from '../../services/notifications.service.js';

/**
 * A bell + unread badge that opens a dropdown panel (CDK Overlay, no Angular Material) listing
 * `NotificationsService.notifications()`. Drop it into a nav bar — no inputs are required, but you
 * almost always want to project your own item template, since this package has no idea what a
 * notification's fields are called:
 *
 * ```html
 * <ngx-notifications>
 *   <ng-template let-notification>
 *     <strong>{{ notification.title }}</strong>
 *     <p>{{ notification.body }}</p>
 *   </ng-template>
 * </ngx-notifications>
 * ```
 */
@Component({
  selector: 'ngx-notifications',
  standalone: true,
  imports: [OverlayModule, A11yModule, NgTemplateOutlet, JsonPipe],
  templateUrl: './notifications-widget.component.html',
  styleUrl: './notifications-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsWidget<TNotification = unknown> {
  @ContentChild(TemplateRef)
  protected itemTemplate?: TemplateRef<{ $implicit: TNotification }>;

  protected readonly notifications =
    inject<NotificationsService<TNotification>>(NotificationsService);
  protected readonly text = inject(NGX_NOTIFICATIONS_TEXT);

  protected readonly isOpen = signal(false);
  protected readonly triggerLabel = computed(() =>
    this.text().triggerLabel(this.notifications.unreadCount()),
  );

  protected toggle(): void {
    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      void this.notifications.refresh();
    }
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected select(notification: TNotification): void {
    this.notifications.open(notification);
    // Most apps navigate away inside openNotification(), but refresh anyway — an app whose
    // callback marks the item read server-side wants the badge to reflect that immediately, not
    // wait for the next poll tick.
    void this.notifications.refresh();
    this.close();
  }

  protected dismiss(notification: TNotification, event: Event): void {
    event.stopPropagation();
    void this.notifications.dismiss(notification);
  }
}
